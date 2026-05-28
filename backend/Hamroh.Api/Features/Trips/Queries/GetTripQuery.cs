using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Hamroh.Api.Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Features.Trips.Queries;

public sealed record GetTripQuery(Guid TripId) : IRequest<CommandResult<TripDetailsItem>>;

public sealed class GetTripQueryHandler(AppDbContext db) : IRequestHandler<GetTripQuery, CommandResult<TripDetailsItem>>
{
    public async Task<CommandResult<TripDetailsItem>> Handle(GetTripQuery request, CancellationToken ct)
    {
        var item = await db.Trips
            .AsNoTracking()
            .Where(x => x.Id == request.TripId)
            .Select(x => new TripDetailsItem(
                x.Id,
                x.FromCity,
                x.ToCity,
                x.DepartureDate,
                x.DepartureTime,
                x.PickupPoint,
                x.PickupLatitude,
                x.PickupLongitude,
                x.DropoffPoint,
                x.DropoffLatitude,
                x.DropoffLongitude,
                x.PricePerSeat,
                x.AvailableSeats,
                x.TotalSeats,
                x.Status,
                x.DriverId,
                x.Driver.FirstName + " " + x.Driver.LastName,
                x.Vehicle.Brand + " " + x.Vehicle.Model,
                x.AllowBaggage,
                x.WomenFriendly,
                x.DriverComment))
            .SingleOrDefaultAsync(ct);

        return item is null
            ? CommandResult<TripDetailsItem>.NotFound("Trip not found")
            : CommandResult<TripDetailsItem>.Success(item);
    }
}
