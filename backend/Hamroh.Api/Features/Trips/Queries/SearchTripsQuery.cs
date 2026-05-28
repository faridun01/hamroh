using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Hamroh.Api.Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Text.Json;

namespace Hamroh.Api.Features.Trips.Queries;

public sealed record SearchTripsQuery(
    string FromCity,
    string ToCity,
    DateOnly DepartureDate,
    int Page,
    int PageSize) : IRequest<CommandResult<PageResult<TripSearchItem>>>;

public sealed class SearchTripsQueryHandler(
    AppDbContext db,
    IConnectionMultiplexer redis) : IRequestHandler<SearchTripsQuery, CommandResult<PageResult<TripSearchItem>>>
{
    public async Task<CommandResult<PageResult<TripSearchItem>>> Handle(SearchTripsQuery request, CancellationToken ct)
    {
        var page = Math.Max(request.Page, 1);
        var pageSize = Math.Clamp(request.PageSize, 1, 50);
        var cacheKey = $"trips:{request.FromCity}:{request.ToCity}:{request.DepartureDate}:{page}:{pageSize}";
        var cache = redis.GetDatabase();

        try
        {
            var cached = await cache.StringGetAsync(cacheKey);
            if (cached.HasValue)
            {
                var result = JsonSerializer.Deserialize<PageResult<TripSearchItem>>(cached!);
                if (result is not null)
                {
                    return CommandResult<PageResult<TripSearchItem>>.Success(result);
                }
            }
        }
        catch
        {
            // Fail silently on cache read error, fallback to Db
        }

        var query = db.Trips
            .AsNoTracking()
            .Where(x => x.FromCity == request.FromCity
                && x.ToCity == request.ToCity
                && x.DepartureDate == request.DepartureDate
                && x.AvailableSeats > 0
                && x.Status == TripStatus.Published);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(x => x.DepartureTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new TripSearchItem(
                x.Id,
                x.FromCity,
                x.ToCity,
                x.DepartureDate,
                x.DepartureTime,
                x.PricePerSeat,
                x.AvailableSeats,
                x.DriverId,
                x.Driver.FirstName + " " + x.Driver.LastName,
                x.Vehicle.Brand + " " + x.Vehicle.Model,
                x.AllowBaggage,
                x.WomenFriendly))
            .ToListAsync(ct);

        var pageResult = new PageResult<TripSearchItem>(items, page, pageSize, total);

        try
        {
            await cache.StringSetAsync(cacheKey, JsonSerializer.Serialize(pageResult), TimeSpan.FromSeconds(30));
        }
        catch
        {
            // Fail silently on cache write error
        }

        return CommandResult<PageResult<TripSearchItem>>.Success(pageResult);
    }
}
