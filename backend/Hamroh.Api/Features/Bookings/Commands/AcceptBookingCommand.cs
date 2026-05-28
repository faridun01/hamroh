using Hamroh.Api.BackgroundServices;
using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Hamroh.Api.Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace Hamroh.Api.Features.Bookings.Commands;

public sealed record AcceptBookingCommand(Guid BookingId, Guid DriverId) : IRequest<CommandResult<AcceptBookingResponse>>;

public sealed record AcceptBookingResponse(Guid Id, BookingStatus Status);

public sealed class AcceptBookingCommandHandler(
    AppDbContext db,
    AuditLogger audit,
    NotificationQueue queue,
    IConnectionMultiplexer redis) : IRequestHandler<AcceptBookingCommand, CommandResult<AcceptBookingResponse>>
{
    public async Task<CommandResult<AcceptBookingResponse>> Handle(AcceptBookingCommand request, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);

        var booking = await db.Bookings
            .Include(x => x.Trip)
            .SingleOrDefaultAsync(x => x.Id == request.BookingId, ct);

        if (booking is null)
        {
            return CommandResult<AcceptBookingResponse>.NotFound("Booking not found");
        }
        if (booking.Trip.DriverId != request.DriverId)
        {
            return CommandResult<AcceptBookingResponse>.Forbidden();
        }
        if (booking.Status != BookingStatus.Pending)
        {
            return CommandResult<AcceptBookingResponse>.BadRequest("Booking is not pending");
        }

        var lockedTrip = await db.Trips
            .FromSqlInterpolated($"SELECT * FROM \"Trips\" WHERE \"Id\" = {booking.TripId} FOR UPDATE")
            .SingleAsync(ct);

        if (lockedTrip.AvailableSeats < booking.SeatsCount)
        {
            return CommandResult<AcceptBookingResponse>.Conflict("Not enough seats available");
        }

        lockedTrip.AvailableSeats -= booking.SeatsCount;
        lockedTrip.Status = lockedTrip.AvailableSeats == 0 ? TripStatus.Full : TripStatus.Accepted;
        booking.Status = BookingStatus.Accepted;

        await db.SaveChangesAsync(ct);
        await audit.WriteAsync(request.DriverId, "BookingAccepted", nameof(Booking), booking.Id, ct);
        await tx.CommitAsync(ct);

        await queue.EnqueueAsync(new NotificationMessage(
            booking.PassengerId,
            "Booking accepted",
            "Phone, chat and car plate are now available.",
            "booking_accepted",
            booking.Id,
            booking.TripId
        ), ct);

        try
        {
            var cache = redis.GetDatabase();
            // Redis cache invalidation for this trip could be done here if needed
        }
        catch
        {
            // Redis error should not fail the booking acceptance transaction
        }

        return CommandResult<AcceptBookingResponse>.Success(new AcceptBookingResponse(booking.Id, booking.Status));
    }
}
