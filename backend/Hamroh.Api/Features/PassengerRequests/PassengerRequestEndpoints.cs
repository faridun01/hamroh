using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Hamroh.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Features.PassengerRequests;

public static class PassengerRequestEndpoints
{
    public static RouteGroupBuilder MapPassengerRequestEndpoints(this RouteGroupBuilder group)
    {
        var requests = group.MapGroup("/passenger-requests").RequireRateLimiting("sensitive");
        requests.MapGet("/me", Mine).RequireAuthorization("PassengerOnly");
        requests.MapGet("", Search).RequireAuthorization("DriverOnly");
        requests.MapPost("", Create).RequireAuthorization("PassengerOnly");
        requests.MapPost("/{requestId:guid}/driver-offer", DriverOffer).RequireAuthorization("DriverOnly");
        requests.MapPost("/{requestId:guid}/confirm-driver", ConfirmDriver).RequireAuthorization("PassengerOnly");
        return group;
    }

    private static async Task<IResult> Mine(int page, int pageSize, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = db.PassengerRequests.AsNoTracking()
            .Where(x => !x.IsDeleted && x.PassengerId == currentUser.UserId)
            .OrderByDescending(x => x.CreatedAt);

        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new MyPassengerRequestItem(
                x.Id,
                x.FromCity,
                x.ToCity,
                x.PickupAddress,
                x.PickupLatitude,
                x.PickupLongitude,
                x.DropoffPoint,
                x.DropoffLatitude,
                x.DropoffLongitude,
                x.DepartureDate,
                x.DepartureTime,
                x.SeatsCount,
                x.SuggestedPrice,
                x.HasBaggage,
                x.Comment,
                x.Status,
                x.AcceptedByDriverId,
                x.BookingId,
                x.PassengerConfirmedDriver))
            .ToListAsync(ct);

        return Results.Ok(ApiResponse<PageResult<MyPassengerRequestItem>>.Ok(new PageResult<MyPassengerRequestItem>(items, page, pageSize, total)));
    }

    private static async Task<IResult> Search(
        string fromCity,
        string? toCity,
        DateOnly? departureDate,
        int page,
        int pageSize,
        AppDbContext db,
        CancellationToken ct)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = db.PassengerRequests.AsNoTracking()
            .Where(x => !x.IsDeleted && x.Status == "Open" && x.FromCity == fromCity);

        if (!string.IsNullOrWhiteSpace(toCity))
        {
            query = query.Where(x => x.ToCity == toCity);
        }

        if (departureDate.HasValue)
        {
            query = query.Where(x => x.DepartureDate == departureDate.Value);
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(x => x.DepartureDate)
            .ThenBy(x => x.DepartureTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new PassengerRequestItem(
                x.Id,
                x.FromCity,
                x.ToCity,
                x.PickupAddress,
                x.PickupLatitude,
                x.PickupLongitude,
                x.DropoffPoint,
                x.DropoffLatitude,
                x.DropoffLongitude,
                x.DepartureDate,
                x.DepartureTime,
                x.SeatsCount,
                x.SuggestedPrice,
                x.HasBaggage,
                x.Comment,
                x.Passenger.FirstName + " " + x.Passenger.LastName))
            .ToListAsync(ct);

        return Results.Ok(ApiResponse<PageResult<PassengerRequestItem>>.Ok(new PageResult<PassengerRequestItem>(items, page, pageSize, total)));
    }

    private static async Task<IResult> Create(CreatePassengerRequest request, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        if (request.SeatsCount is < 1 or > 8)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Seats count must be between 1 and 8"));
        }

        var hasPenalty = await db.Penalties.AnyAsync(x => x.PassengerId == currentUser.UserId && !x.IsPaid, ct);
        if (hasPenalty)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Unpaid no-show penalty blocks passenger requests"));
        }

        var passengerRequest = new PassengerRequest
        {
            PassengerId = currentUser.UserId,
            FromCity = request.FromCity.Trim(),
            ToCity = request.ToCity.Trim(),
            PickupAddress = request.PickupAddress.Trim(),
            PickupLatitude = request.PickupLatitude,
            PickupLongitude = request.PickupLongitude,
            DropoffPoint = request.DropoffPoint.Trim(),
            DropoffLatitude = request.DropoffLatitude,
            DropoffLongitude = request.DropoffLongitude,
            DepartureDate = request.DepartureDate,
            DepartureTime = request.DepartureTime,
            SeatsCount = request.SeatsCount,
            SuggestedPrice = request.SuggestedPrice,
            HasBaggage = request.HasBaggage,
            PreferredDriverGender = request.PreferredDriverGender,
            Comment = request.Comment.Trim()
        };

        db.PassengerRequests.Add(passengerRequest);
        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { passengerRequest.Id, passengerRequest.Status }));
    }

    private static async Task<IResult> DriverOffer(Guid requestId, DriverOfferRequest request, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var driver = await db.DriverProfiles.SingleOrDefaultAsync(x => x.UserId == currentUser.UserId, ct);
        if (driver?.VerificationStatus != VerificationStatus.Verified)
        {
            return Results.Forbid();
        }

        var passengerRequest = await db.PassengerRequests.SingleOrDefaultAsync(x => x.Id == requestId && x.Status == "Open", ct);
        if (passengerRequest is null)
        {
            return Results.NotFound(ApiResponse<object>.Fail("Passenger request not found"));
        }

        passengerRequest.AcceptedByDriverId = currentUser.UserId;
        passengerRequest.Status = "DriverOffered";

        db.Notifications.Add(new Notification
        {
            UserId = passengerRequest.PassengerId,
            Title = "Driver offered a ride",
            Message = "Confirm the driver to accept this booking.",
            Type = "passenger_request_driver_offer",
            TripId = request.TripId
        });

        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { passengerRequest.Id, passengerRequest.Status }));
    }

    private static async Task<IResult> ConfirmDriver(Guid requestId, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);

        var passengerRequest = await db.PassengerRequests.SingleOrDefaultAsync(x =>
            x.Id == requestId &&
            x.PassengerId == currentUser.UserId &&
            x.Status == "DriverOffered" &&
            x.AcceptedByDriverId != null, ct);

        if (passengerRequest is null)
        {
            return Results.NotFound(ApiResponse<object>.Fail("Passenger request is not awaiting confirmation"));
        }

        var trip = await db.Trips
            .FromSqlInterpolated($"SELECT * FROM \"Trips\" WHERE \"DriverId\" = {passengerRequest.AcceptedByDriverId!.Value} AND \"Status\" IN ({TripStatus.Published}, {TripStatus.Accepted}) ORDER BY \"DepartureDate\", \"DepartureTime\" LIMIT 1 FOR UPDATE")
            .SingleOrDefaultAsync(ct);

        if (trip is null || trip.AvailableSeats < passengerRequest.SeatsCount)
        {
            return Results.Conflict(ApiResponse<object>.Fail("Driver does not have enough available seats"));
        }

        var booking = new Booking
        {
            TripId = trip.Id,
            PassengerId = currentUser.UserId,
            SeatsCount = passengerRequest.SeatsCount,
            TotalPrice = passengerRequest.SeatsCount * trip.PricePerSeat,
            PassengerMessage = passengerRequest.Comment,
            Status = BookingStatus.Accepted
        };

        trip.AvailableSeats -= passengerRequest.SeatsCount;
        trip.Status = trip.AvailableSeats == 0 ? TripStatus.Full : TripStatus.Accepted;
        passengerRequest.PassengerConfirmedDriver = true;
        passengerRequest.Status = "Accepted";
        passengerRequest.BookingId = booking.Id;

        db.Bookings.Add(booking);
        db.Notifications.Add(new Notification
        {
            UserId = passengerRequest.AcceptedByDriverId.Value,
            Title = "Passenger confirmed",
            Message = "Passenger confirmed your offer. Contacts and chat are available.",
            Type = "passenger_request_confirmed",
            BookingId = booking.Id,
            TripId = trip.Id
        });

        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { booking.Id, booking.Status }));
    }
}

public sealed record CreatePassengerRequest(string FromCity, string ToCity, string PickupAddress, double? PickupLatitude, double? PickupLongitude, string DropoffPoint, double? DropoffLatitude, double? DropoffLongitude, DateOnly DepartureDate, TimeOnly DepartureTime, int SeatsCount, bool HasBaggage, Gender? PreferredDriverGender, string Comment, decimal SuggestedPrice);
public sealed record DriverOfferRequest(Guid? TripId);
public sealed record PassengerRequestItem(Guid Id, string FromCity, string ToCity, string PickupAddress, double? PickupLatitude, double? PickupLongitude, string DropoffPoint, double? DropoffLatitude, double? DropoffLongitude, DateOnly DepartureDate, TimeOnly DepartureTime, int SeatsCount, decimal SuggestedPrice, bool HasBaggage, string Comment, string PassengerName);
public sealed record MyPassengerRequestItem(Guid Id, string FromCity, string ToCity, string PickupAddress, double? PickupLatitude, double? PickupLongitude, string DropoffPoint, double? DropoffLatitude, double? DropoffLongitude, DateOnly DepartureDate, TimeOnly DepartureTime, int SeatsCount, decimal SuggestedPrice, bool HasBaggage, string Comment, string Status, Guid? AcceptedByDriverId, Guid? BookingId, bool PassengerConfirmedDriver);
