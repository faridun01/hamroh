using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Hamroh.Api.Domain;
using Hamroh.Api.Features.Trips.Queries;
using MediatR;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Text.Json;

namespace Hamroh.Api.Features.Trips;

public static class TripsEndpoints
{
    public static RouteGroupBuilder MapTripEndpoints(this RouteGroupBuilder group)
    {
        var trips = group.MapGroup("/trips");
        trips.MapGet("", SearchTrips);
        trips.MapGet("/me", MyTrips).RequireAuthorization("DriverOnly");
        trips.MapGet("/{tripId:guid}", GetTrip);
        trips.MapPost("", CreateTrip).RequireAuthorization("DriverOnly").RequireRateLimiting("sensitive");
        trips.MapPatch("/{tripId:guid}", UpdateTrip).RequireAuthorization("DriverOnly").RequireRateLimiting("sensitive");
        trips.MapPost("/{tripId:guid}/cancel", CancelTrip).RequireAuthorization("DriverOnly");
        trips.MapPost("/{tripId:guid}/start", StartTrip).RequireAuthorization("DriverOnly");
        trips.MapPost("/{tripId:guid}/complete", CompleteTrip).RequireAuthorization("DriverOnly");
        return group;
    }

    private static async Task<IResult> GetTrip(Guid tripId, IMediator mediator, CancellationToken ct)
    {
        var query = new GetTripQuery(tripId);
        var result = await mediator.Send(query, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> SearchTrips(
        string fromCity,
        string toCity,
        DateOnly departureDate,
        int page,
        int pageSize,
        IMediator mediator,
        CancellationToken ct)
    {
        var query = new SearchTripsQuery(fromCity, toCity, departureDate, page, pageSize);
        var result = await mediator.Send(query, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> MyTrips(int page, int pageSize, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = db.Trips.AsNoTracking()
            .Where(x => x.DriverId == currentUser.UserId)
            .OrderByDescending(x => x.DepartureDate)
            .ThenByDescending(x => x.DepartureTime);

        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new DriverTripListItem(
                x.Id,
                x.FromCity,
                x.ToCity,
                x.DepartureDate,
                x.DepartureTime,
                x.PricePerSeat,
                x.AvailableSeats,
                x.TotalSeats,
                x.Status))
            .ToListAsync(ct);

        return Results.Ok(ApiResponse<PageResult<DriverTripListItem>>.Ok(new PageResult<DriverTripListItem>(items, page, pageSize, total)));
    }

    private static async Task<IResult> CreateTrip(CreateTripRequest request, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        if (request.TotalSeats is < 1 or > 8)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Total seats must be between 1 and 8"));
        }

        if (request.PricePerSeat <= 0)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Price per seat must be greater than zero"));
        }

        if (string.IsNullOrWhiteSpace(request.FromCity) ||
            string.IsNullOrWhiteSpace(request.ToCity) ||
            string.IsNullOrWhiteSpace(request.PickupPoint) ||
            string.IsNullOrWhiteSpace(request.DropoffPoint))
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Route and pickup/dropoff points are required"));
        }

        var profile = await db.DriverProfiles.SingleOrDefaultAsync(x => x.UserId == currentUser.UserId, ct);
        if (profile?.VerificationStatus != VerificationStatus.Verified)
        {
            return Results.Forbid();
        }

        var vehicle = await db.Vehicles.SingleOrDefaultAsync(x => x.Id == request.VehicleId && x.DriverId == currentUser.UserId, ct);
        if (vehicle?.VerificationStatus != VerificationStatus.Verified)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Vehicle is not verified"));
        }

        var hasStartedTrip = await db.Trips.AnyAsync(x =>
            x.DriverId == currentUser.UserId &&
            x.Status == TripStatus.Started, ct);

        if (hasStartedTrip)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Complete current started trip before creating a new one"));
        }

        var trip = new Trip
        {
            DriverId = currentUser.UserId,
            VehicleId = request.VehicleId,
            FromCity = request.FromCity.Trim(),
            ToCity = request.ToCity.Trim(),
            DepartureDate = request.DepartureDate,
            DepartureTime = request.DepartureTime,
            PickupPoint = request.PickupPoint.Trim(),
            PickupLatitude = request.PickupLatitude,
            PickupLongitude = request.PickupLongitude,
            DropoffPoint = request.DropoffPoint.Trim(),
            DropoffLatitude = request.DropoffLatitude,
            DropoffLongitude = request.DropoffLongitude,
            PricePerSeat = request.PricePerSeat,
            TotalSeats = request.TotalSeats,
            AvailableSeats = request.TotalSeats,
            AllowBaggage = request.AllowBaggage,
            WomenFriendly = request.WomenFriendly,
            DriverComment = request.DriverComment.Trim(),
            Status = TripStatus.Published
        };

        db.Trips.Add(trip);
        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { trip.Id }));
    }

    private static async Task<IResult> UpdateTrip(Guid tripId, UpdateTripRequest request, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var trip = await db.Trips.SingleOrDefaultAsync(x => x.Id == tripId && x.DriverId == currentUser.UserId, ct);
        if (trip is null) return Results.NotFound(ApiResponse<object>.Fail("Trip not found"));
        if (trip.Status is TripStatus.Started or TripStatus.Completed or TripStatus.Cancelled or TripStatus.Blocked)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Trip cannot be edited in its current status"));
        }

        var hasAcceptedBookings = await db.Bookings.AnyAsync(x => x.TripId == tripId && x.Status == BookingStatus.Accepted, ct);
        if (hasAcceptedBookings)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Trip with accepted bookings cannot be edited"));
        }

        if (request.PricePerSeat.HasValue && request.PricePerSeat.Value <= 0)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Price per seat must be greater than zero"));
        }

        if (request.TotalSeats.HasValue && request.TotalSeats.Value is < 1 or > 8)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Total seats must be between 1 and 8"));
        }

        if (!string.IsNullOrWhiteSpace(request.FromCity)) trip.FromCity = request.FromCity.Trim();
        if (!string.IsNullOrWhiteSpace(request.ToCity)) trip.ToCity = request.ToCity.Trim();
        if (request.DepartureDate.HasValue) trip.DepartureDate = request.DepartureDate.Value;
        if (request.DepartureTime.HasValue) trip.DepartureTime = request.DepartureTime.Value;
        if (!string.IsNullOrWhiteSpace(request.PickupPoint)) trip.PickupPoint = request.PickupPoint.Trim();
        if (request.PickupLatitude.HasValue) trip.PickupLatitude = request.PickupLatitude;
        if (request.PickupLongitude.HasValue) trip.PickupLongitude = request.PickupLongitude;
        if (!string.IsNullOrWhiteSpace(request.DropoffPoint)) trip.DropoffPoint = request.DropoffPoint.Trim();
        if (request.DropoffLatitude.HasValue) trip.DropoffLatitude = request.DropoffLatitude;
        if (request.DropoffLongitude.HasValue) trip.DropoffLongitude = request.DropoffLongitude;
        if (request.PricePerSeat.HasValue) trip.PricePerSeat = request.PricePerSeat.Value;
        if (request.TotalSeats.HasValue)
        {
            trip.TotalSeats = request.TotalSeats.Value;
            trip.AvailableSeats = request.TotalSeats.Value;
            trip.Status = TripBookingRules.StatusAfterSeatChange(trip.AvailableSeats);
        }
        if (request.AllowBaggage.HasValue) trip.AllowBaggage = request.AllowBaggage.Value;
        if (request.WomenFriendly.HasValue) trip.WomenFriendly = request.WomenFriendly.Value;
        if (request.DriverComment is not null) trip.DriverComment = request.DriverComment.Trim();

        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { trip.Id, trip.Status }));
    }

    private static async Task<IResult> CancelTrip(Guid tripId, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var trip = await db.Trips.SingleOrDefaultAsync(x => x.Id == tripId && x.DriverId == currentUser.UserId, ct);
        if (trip is null) return Results.NotFound(ApiResponse<object>.Fail("Trip not found"));
        if (trip.Status is TripStatus.Completed or TripStatus.Cancelled)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Trip cannot be cancelled in its current status"));
        }

        trip.Status = TripStatus.Cancelled;
        await db.Bookings
            .Where(x => x.TripId == tripId && (x.Status == BookingStatus.Pending || x.Status == BookingStatus.Accepted))
            .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.Status, BookingStatus.CancelledByDriver), ct);

        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { trip.Id, trip.Status }, "Trip cancelled"));
    }

    private static async Task<IResult> StartTrip(Guid tripId, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var trip = await db.Trips.SingleOrDefaultAsync(x => x.Id == tripId && x.DriverId == currentUser.UserId, ct);
        if (trip is null) return Results.NotFound(ApiResponse<object>.Fail("Trip not found"));
        if (trip.Status is not (TripStatus.Published or TripStatus.Full))
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Trip cannot be started in its current status"));
        }

        trip.Status = TripStatus.Started;
        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { trip.Id, trip.Status }, "Trip started"));
    }

    private static async Task<IResult> CompleteTrip(Guid tripId, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var trip = await db.Trips.SingleOrDefaultAsync(x => x.Id == tripId && x.DriverId == currentUser.UserId, ct);
        if (trip is null) return Results.NotFound(ApiResponse<object>.Fail("Trip not found"));
        if (trip.Status is not (TripStatus.Published or TripStatus.Full or TripStatus.Started))
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Trip cannot be completed in its current status"));
        }

        trip.Status = TripStatus.Completed;
        await db.Bookings
            .Where(x => x.TripId == tripId && x.Status == BookingStatus.Accepted)
            .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.Status, BookingStatus.Completed), ct);
        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { trip.Id }, "Trip completed"));
    }
}

public sealed record TripSearchItem(Guid Id, string FromCity, string ToCity, DateOnly DepartureDate, TimeOnly DepartureTime, decimal PricePerSeat, int AvailableSeats, Guid DriverId, string DriverName, string Vehicle, bool AllowBaggage, bool WomenFriendly);
public sealed record TripDetailsItem(Guid Id, string FromCity, string ToCity, DateOnly DepartureDate, TimeOnly DepartureTime, string PickupPoint, double? PickupLatitude, double? PickupLongitude, string DropoffPoint, double? DropoffLatitude, double? DropoffLongitude, decimal PricePerSeat, int AvailableSeats, int TotalSeats, TripStatus Status, Guid DriverId, string DriverName, string Vehicle, bool AllowBaggage, bool WomenFriendly, string DriverComment);
public sealed record DriverTripListItem(Guid Id, string FromCity, string ToCity, DateOnly DepartureDate, TimeOnly DepartureTime, decimal PricePerSeat, int AvailableSeats, int TotalSeats, TripStatus Status);
public sealed record CreateTripRequest(Guid VehicleId, string FromCity, string ToCity, DateOnly DepartureDate, TimeOnly DepartureTime, string PickupPoint, double? PickupLatitude, double? PickupLongitude, string DropoffPoint, double? DropoffLatitude, double? DropoffLongitude, decimal PricePerSeat, int TotalSeats, bool AllowBaggage, bool WomenFriendly, string DriverComment);
public sealed record UpdateTripRequest(string? FromCity, string? ToCity, DateOnly? DepartureDate, TimeOnly? DepartureTime, string? PickupPoint, double? PickupLatitude, double? PickupLongitude, string? DropoffPoint, double? DropoffLatitude, double? DropoffLongitude, decimal? PricePerSeat, int? TotalSeats, bool? AllowBaggage, bool? WomenFriendly, string? DriverComment);
