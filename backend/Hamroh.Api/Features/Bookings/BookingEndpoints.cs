using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Hamroh.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Features.Bookings;

public static class BookingEndpoints
{
    public static RouteGroupBuilder MapBookingEndpoints(this RouteGroupBuilder group)
    {
        var bookings = group.MapGroup("/bookings").RequireRateLimiting("sensitive");
        bookings.MapGet("/me", MyBookings).RequireAuthorization();
        bookings.MapPost("", CreateBooking).RequireAuthorization("PassengerOnly");
        bookings.MapGet("/{bookingId:guid}", GetBooking).RequireAuthorization();
        bookings.MapPost("/{bookingId:guid}/accept", AcceptBooking).RequireAuthorization("DriverOnly");
        bookings.MapPost("/{bookingId:guid}/reject", RejectBooking).RequireAuthorization("DriverOnly");
        bookings.MapPost("/{bookingId:guid}/cancel-by-passenger", CancelByPassenger).RequireAuthorization("PassengerOnly");
        bookings.MapPost("/{bookingId:guid}/cancel-by-driver", CancelByDriver).RequireAuthorization("DriverOnly");
        bookings.MapPost("/{bookingId:guid}/no-show-passenger", MarkPassengerNoShow).RequireAuthorization("DriverOnly");
        bookings.MapPost("/{bookingId:guid}/no-show-driver", MarkDriverNoShow).RequireAuthorization("PassengerOnly");
        return group;
    }

    private static async Task<IResult> MyBookings(int page, int pageSize, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = db.Bookings.AsNoTracking()
            .Include(x => x.Trip)
            .Where(x => !x.IsDeleted && (x.PassengerId == currentUser.UserId || x.Trip.DriverId == currentUser.UserId))
            .OrderByDescending(x => x.CreatedAt);

        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new BookingListItem(
                x.Id,
                x.TripId,
                x.Status,
                x.Trip.FromCity,
                x.Trip.ToCity,
                x.Trip.DepartureDate,
                x.Trip.DepartureTime,
                x.SeatsCount,
                x.TotalPrice))
            .ToListAsync(ct);

        return Results.Ok(ApiResponse<PageResult<BookingListItem>>.Ok(new PageResult<BookingListItem>(items, page, pageSize, total)));
    }

    private static async Task<IResult> GetBooking(Guid bookingId, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var booking = await db.Bookings.AsNoTracking()
            .Include(x => x.Trip)
            .ThenInclude(x => x.Vehicle)
            .Include(x => x.Trip.Driver)
            .SingleOrDefaultAsync(x => x.Id == bookingId && (x.PassengerId == currentUser.UserId || x.Trip.DriverId == currentUser.UserId), ct);

        if (booking is null)
        {
            return Results.NotFound(ApiResponse<object>.Fail("Booking not found"));
        }

        var contactsVisible = booking.Status == BookingStatus.Accepted;
        var item = new BookingDetails(
            booking.Id,
            booking.Status,
            booking.Trip.FromCity,
            booking.Trip.ToCity,
            booking.Trip.DepartureDate,
            booking.Trip.DepartureTime,
            booking.SeatsCount,
            booking.TotalPrice,
            booking.Trip.Driver.FirstName + " " + booking.Trip.Driver.LastName,
            booking.Trip.Vehicle.Brand + " " + booking.Trip.Vehicle.Model,
            contactsVisible ? booking.Trip.Vehicle.PlateNumber : null,
            contactsVisible ? booking.Trip.Driver.Phone : null,
            contactsVisible,
            booking.Status == BookingStatus.Accepted);

        return Results.Ok(ApiResponse<BookingDetails>.Ok(item));
    }

    private static async Task<IResult> CreateBooking(CreateBookingRequest request, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var hasPenalty = await db.Penalties.AnyAsync(x => x.PassengerId == currentUser.UserId && !x.IsPaid, ct);
        if (hasPenalty)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Unpaid no-show penalty blocks booking"));
        }

        var trip = await db.Trips.AsNoTracking().SingleOrDefaultAsync(x => x.Id == request.TripId, ct);
        if (trip is null || trip.Status != TripStatus.Published || trip.AvailableSeats < request.SeatsCount)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Trip is unavailable"));
        }

        var booking = new Booking
        {
            TripId = request.TripId,
            PassengerId = currentUser.UserId,
            SeatsCount = request.SeatsCount,
            TotalPrice = request.SeatsCount * trip.PricePerSeat,
            PassengerMessage = request.PassengerMessage,
            Status = BookingStatus.Pending
        };

        db.Bookings.Add(booking);
        db.Notifications.Add(new Notification
        {
            UserId = trip.DriverId,
            Title = "New booking request",
            Message = "Passenger requested seats for your trip.",
            Type = "booking_request",
            BookingId = booking.Id,
            TripId = trip.Id
        });
        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { booking.Id, booking.Status }));
    }

    private static async Task<IResult> AcceptBooking(Guid bookingId, AppDbContext db, ICurrentUser currentUser, AuditLogger audit, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);

        var booking = await db.Bookings
            .Include(x => x.Trip)
            .SingleOrDefaultAsync(x => x.Id == bookingId, ct);

        if (booking is null) return Results.NotFound(ApiResponse<object>.Fail("Booking not found"));
        if (booking.Trip.DriverId != currentUser.UserId) return Results.Forbid();
        if (booking.Status != BookingStatus.Pending) return Results.BadRequest(ApiResponse<object>.Fail("Booking is not pending"));

        var lockedTrip = await db.Trips
            .FromSqlInterpolated($"SELECT * FROM \"Trips\" WHERE \"Id\" = {booking.TripId} FOR UPDATE")
            .SingleAsync(ct);

        if (lockedTrip.AvailableSeats < booking.SeatsCount)
        {
            return Results.Conflict(ApiResponse<object>.Fail("Not enough seats available"));
        }

        lockedTrip.AvailableSeats -= booking.SeatsCount;
        lockedTrip.Status = lockedTrip.AvailableSeats == 0 ? TripStatus.Full : TripStatus.Accepted;
        booking.Status = BookingStatus.Accepted;

        db.Notifications.Add(new Notification
        {
            UserId = booking.PassengerId,
            Title = "Booking accepted",
            Message = "Phone, chat and car plate are now available.",
            Type = "booking_accepted",
            BookingId = booking.Id,
            TripId = booking.TripId
        });

        await db.SaveChangesAsync(ct);
        await audit.WriteAsync(currentUser.UserId, "BookingAccepted", nameof(Booking), booking.Id, ct);
        await tx.CommitAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { booking.Id, booking.Status }));
    }

    private static async Task<IResult> RejectBooking(Guid bookingId, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var booking = await db.Bookings.Include(x => x.Trip).SingleOrDefaultAsync(x => x.Id == bookingId, ct);
        if (booking is null) return Results.NotFound(ApiResponse<object>.Fail("Booking not found"));
        if (booking.Trip.DriverId != currentUser.UserId) return Results.Forbid();

        booking.Status = BookingStatus.Rejected;
        db.Notifications.Add(new Notification
        {
            UserId = booking.PassengerId,
            Title = "Booking rejected",
            Message = "The driver rejected your booking request.",
            Type = "booking_rejected",
            BookingId = booking.Id,
            TripId = booking.TripId
        });
        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { booking.Id, booking.Status }));
    }

    private static async Task<IResult> CancelByPassenger(Guid bookingId, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var booking = await db.Bookings.SingleOrDefaultAsync(x => x.Id == bookingId && x.PassengerId == currentUser.UserId, ct);
        if (booking is null) return Results.NotFound(ApiResponse<object>.Fail("Booking not found"));
        if (booking.Status is BookingStatus.Completed or BookingStatus.NoShowPassenger or BookingStatus.NoShowDriver)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Completed or no-show booking cannot be cancelled"));
        }

        booking.Status = BookingStatus.CancelledByPassenger;
        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { booking.Id, booking.Status }));
    }

    private static async Task<IResult> CancelByDriver(Guid bookingId, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var booking = await db.Bookings.Include(x => x.Trip).SingleOrDefaultAsync(x => x.Id == bookingId, ct);
        if (booking is null) return Results.NotFound(ApiResponse<object>.Fail("Booking not found"));
        if (booking.Trip.DriverId != currentUser.UserId) return Results.Forbid();

        booking.Status = BookingStatus.CancelledByDriver;
        db.Notifications.Add(new Notification
        {
            UserId = booking.PassengerId,
            Title = "Booking cancelled",
            Message = "The driver cancelled this booking.",
            Type = "booking_cancelled_by_driver",
            BookingId = booking.Id,
            TripId = booking.TripId
        });
        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { booking.Id, booking.Status }));
    }

    private static async Task<IResult> MarkPassengerNoShow(Guid bookingId, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var booking = await db.Bookings.Include(x => x.Trip).SingleOrDefaultAsync(x => x.Id == bookingId, ct);
        if (booking is null) return Results.NotFound(ApiResponse<object>.Fail("Booking not found"));
        if (booking.Trip.DriverId != currentUser.UserId) return Results.Forbid();
        if (booking.Status != BookingStatus.Accepted)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Only accepted bookings can be marked no-show"));
        }

        booking.Status = BookingStatus.NoShowPassenger;
        var penalty = new Penalty
        {
            PassengerId = booking.PassengerId,
            BookingId = booking.Id,
            Amount = Math.Round(booking.TotalPrice * 0.30m, 2),
            IsPaid = false
        };
        db.Penalties.Add(penalty);
        db.Notifications.Add(new Notification
        {
            UserId = booking.PassengerId,
            Title = "No-show penalty",
            Message = "Pay 30% of the previous trip amount before booking again.",
            Type = "no_show_penalty",
            BookingId = booking.Id,
            TripId = booking.TripId
        });

        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { booking.Id, booking.Status, penalty.Amount }));
    }

    private static async Task<IResult> MarkDriverNoShow(Guid bookingId, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var booking = await db.Bookings.Include(x => x.Trip).SingleOrDefaultAsync(x => x.Id == bookingId && x.PassengerId == currentUser.UserId, ct);
        if (booking is null) return Results.NotFound(ApiResponse<object>.Fail("Booking not found"));
        if (booking.Status != BookingStatus.Accepted)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Only accepted bookings can be marked no-show"));
        }

        booking.Status = BookingStatus.NoShowDriver;
        db.Complaints.Add(new Complaint
        {
            UserId = currentUser.UserId,
            BookingId = booking.Id,
            Type = "driver_did_not_arrive",
            Description = "Passenger reported driver no-show.",
            Status = "Open"
        });
        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { booking.Id, booking.Status }));
    }
}

public sealed record CreateBookingRequest(Guid TripId, int SeatsCount, string PassengerMessage);
public sealed record BookingListItem(Guid Id, Guid TripId, BookingStatus Status, string FromCity, string ToCity, DateOnly DepartureDate, TimeOnly DepartureTime, int SeatsCount, decimal TotalPrice);
public sealed record BookingDetails(Guid Id, BookingStatus Status, string FromCity, string ToCity, DateOnly DepartureDate, TimeOnly DepartureTime, int SeatsCount, decimal TotalPrice, string DriverName, string CarInfo, string? PlateNumber, string? DriverPhone, bool ContactsVisible, bool ChatAvailable);
