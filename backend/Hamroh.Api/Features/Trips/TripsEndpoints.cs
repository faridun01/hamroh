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
        trips.MapGet("/{tripId:guid}", GetTrip);
        trips.MapPost("", CreateTrip).RequireAuthorization("DriverOnly").RequireRateLimiting("sensitive");
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

    private static async Task<IResult> CreateTrip(CreateTripRequest request, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
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

        var hasActiveTrip = await db.Trips.AnyAsync(x =>
            x.DriverId == currentUser.UserId &&
            x.Status != TripStatus.Completed &&
            x.Status != TripStatus.Cancelled &&
            x.Status != TripStatus.Blocked, ct);

        if (hasActiveTrip)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Complete current trip before creating a new one"));
        }

        var trip = new Trip
        {
            DriverId = currentUser.UserId,
            VehicleId = request.VehicleId,
            FromCity = request.FromCity,
            ToCity = request.ToCity,
            DepartureDate = request.DepartureDate,
            DepartureTime = request.DepartureTime,
            PickupPoint = request.PickupPoint,
            PickupLatitude = request.PickupLatitude,
            PickupLongitude = request.PickupLongitude,
            DropoffPoint = request.DropoffPoint,
            DropoffLatitude = request.DropoffLatitude,
            DropoffLongitude = request.DropoffLongitude,
            PricePerSeat = request.PricePerSeat,
            TotalSeats = request.TotalSeats,
            AvailableSeats = request.TotalSeats,
            AllowBaggage = request.AllowBaggage,
            WomenFriendly = request.WomenFriendly,
            DriverComment = request.DriverComment,
            Status = TripStatus.Published
        };

        db.Trips.Add(trip);
        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { trip.Id }));
    }

    private static async Task<IResult> CompleteTrip(Guid tripId, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var trip = await db.Trips.SingleOrDefaultAsync(x => x.Id == tripId && x.DriverId == currentUser.UserId, ct);
        if (trip is null) return Results.NotFound(ApiResponse<object>.Fail("Trip not found"));

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
public sealed record CreateTripRequest(Guid VehicleId, string FromCity, string ToCity, DateOnly DepartureDate, TimeOnly DepartureTime, string PickupPoint, double? PickupLatitude, double? PickupLongitude, string DropoffPoint, double? DropoffLatitude, double? DropoffLongitude, decimal PricePerSeat, int TotalSeats, bool AllowBaggage, bool WomenFriendly, string DriverComment);
