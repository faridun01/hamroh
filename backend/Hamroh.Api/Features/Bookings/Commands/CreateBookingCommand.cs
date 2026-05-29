using Hamroh.Api.BackgroundServices;
using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Hamroh.Api.Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Features.Bookings.Commands;

public sealed record CreateBookingCommand(
    Guid TripId,
    int SeatsCount,
    string PassengerMessage,
    Guid PassengerId) : IRequest<CommandResult<CreateBookingResponse>>;

public sealed record CreateBookingResponse(Guid Id, BookingStatus Status);

public sealed class CreateBookingCommandHandler(
    AppDbContext db,
    NotificationQueue queue) : IRequestHandler<CreateBookingCommand, CommandResult<CreateBookingResponse>>
{
    public async Task<CommandResult<CreateBookingResponse>> Handle(CreateBookingCommand request, CancellationToken ct)
    {
        if (request.SeatsCount is < 1 or > 8)
        {
            return CommandResult<CreateBookingResponse>.BadRequest("Seats count must be between 1 and 8");
        }

        var hasPenalty = await db.Penalties.AnyAsync(x => x.PassengerId == request.PassengerId && !x.IsPaid, ct);
        if (hasPenalty)
        {
            return CommandResult<CreateBookingResponse>.BadRequest("Unpaid no-show penalty blocks booking");
        }

        var trip = await db.Trips.AsNoTracking().SingleOrDefaultAsync(x => x.Id == request.TripId, ct);
        if (trip is null || trip.Status != TripStatus.Published || trip.AvailableSeats < request.SeatsCount)
        {
            return CommandResult<CreateBookingResponse>.BadRequest("Trip is unavailable");
        }

        var booking = new Booking
        {
            TripId = request.TripId,
            PassengerId = request.PassengerId,
            SeatsCount = request.SeatsCount,
            TotalPrice = request.SeatsCount * trip.PricePerSeat,
            PassengerMessage = request.PassengerMessage.Trim(),
            Status = BookingStatus.Pending
        };

        db.Bookings.Add(booking);
        await db.SaveChangesAsync(ct);
        
        await queue.EnqueueAsync(new NotificationMessage(
            trip.DriverId,
            "New booking request",
            "Passenger requested seats for your trip.",
            "booking_request",
            booking.Id,
            trip.Id
        ), ct);

        return CommandResult<CreateBookingResponse>.Success(new CreateBookingResponse(booking.Id, booking.Status));
    }
}
