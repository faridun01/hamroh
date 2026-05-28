using Grpc.Core;
using Hamroh.Api.Features.Trips.Grpc;
using Hamroh.Api.Features.Trips.Queries;
using MediatR;

namespace Hamroh.Api.Features.Trips;

public sealed class TripGrpcService(IMediator mediator) : TripsGrpc.TripsGrpcBase
{
    public override async Task<SearchTripsResponse> SearchTrips(SearchTripsRequest request, ServerCallContext context)
    {
        if (!DateOnly.TryParseExact(request.DepartureDate, "yyyy-MM-dd", out var departureDate))
        {
            return new SearchTripsResponse
            {
                Success = false,
                Message = "Invalid departure date format. Use YYYY-MM-DD."
            };
        }

        var query = new SearchTripsQuery(request.FromCity, request.ToCity, departureDate, request.Page, request.PageSize);
        var result = await mediator.Send(query, context.CancellationToken);

        if (!result.IsSuccess)
        {
            return new SearchTripsResponse
            {
                Success = false,
                Message = result.ErrorMessage ?? "Failed to search trips."
            };
        }

        var response = new SearchTripsResponse
        {
            Success = true,
            Message = "Trips retrieved successfully",
            Page = result.Data!.Page,
            PageSize = result.Data.PageSize,
            TotalCount = result.Data.TotalCount
        };

        foreach (var item in result.Data.Items)
        {
            response.Items.Add(new TripSearchItemProto
            {
                Id = item.Id.ToString(),
                FromCity = item.FromCity,
                ToCity = item.ToCity,
                DepartureDate = item.DepartureDate.ToString("yyyy-MM-dd"),
                DepartureTime = item.DepartureTime.ToString("HH:mm:ss"),
                PricePerSeat = (double)item.PricePerSeat,
                AvailableSeats = item.AvailableSeats,
                DriverId = item.DriverId.ToString(),
                DriverName = item.DriverName,
                Vehicle = item.Vehicle,
                AllowBaggage = item.AllowBaggage,
                WomenFriendly = item.WomenFriendly
            });
        }

        return response;
    }

    public override async Task<GetTripResponse> GetTrip(GetTripRequest request, ServerCallContext context)
    {
        if (!Guid.TryParse(request.TripId, out var tripId))
        {
            return new GetTripResponse
            {
                Success = false,
                Message = "Invalid trip ID format."
            };
        }

        var query = new GetTripQuery(tripId);
        var result = await mediator.Send(query, context.CancellationToken);

        if (!result.IsSuccess)
        {
            return new GetTripResponse
            {
                Success = false,
                Message = result.ErrorMessage ?? "Trip not found."
            };
        }

        var item = result.Data!;
        return new GetTripResponse
        {
            Success = true,
            Message = "Trip details retrieved successfully",
            Trip = new TripDetailsProto
            {
                Id = item.Id.ToString(),
                FromCity = item.FromCity,
                ToCity = item.ToCity,
                DepartureDate = item.DepartureDate.ToString("yyyy-MM-dd"),
                DepartureTime = item.DepartureTime.ToString("HH:mm:ss"),
                PickupPoint = item.PickupPoint,
                PickupLatitude = item.PickupLatitude ?? 0,
                PickupLongitude = item.PickupLongitude ?? 0,
                DropoffPoint = item.DropoffPoint,
                DropoffLatitude = item.DropoffLatitude ?? 0,
                DropoffLongitude = item.DropoffLongitude ?? 0,
                PricePerSeat = (double)item.PricePerSeat,
                AvailableSeats = item.AvailableSeats,
                TotalSeats = item.TotalSeats,
                Status = (int)item.Status,
                DriverId = item.DriverId.ToString(),
                DriverName = item.DriverName,
                Vehicle = item.Vehicle,
                AllowBaggage = item.AllowBaggage,
                WomenFriendly = item.WomenFriendly,
                DriverComment = item.DriverComment
            }
        };
    }
}
