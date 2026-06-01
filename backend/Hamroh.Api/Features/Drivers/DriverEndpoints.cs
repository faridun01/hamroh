using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Features.Drivers;

public static class DriverEndpoints
{
    public static RouteGroupBuilder MapDriverEndpoints(this RouteGroupBuilder group)
    {
        var drivers = group.MapGroup("/driver").RequireAuthorization("DriverOnly").RequireRateLimiting("sensitive");
        drivers.MapGet("/me", Me);
        return group;
    }

    private static async Task<IResult> Me(AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var profile = await db.DriverProfiles.AsNoTracking()
            .Where(x => x.UserId == currentUser.UserId)
            .Select(x => new DriverMeResponse(
                x.UserId,
                x.VerificationStatus.ToString(),
                x.VerificationReason,
                x.Rating,
                x.TotalTrips))
            .SingleOrDefaultAsync(ct);

        if (profile is null)
        {
            return Results.NotFound(ApiResponse<object>.Fail("Driver profile not found"));
        }

        var vehicles = await db.Vehicles.AsNoTracking()
            .Where(x => x.DriverId == currentUser.UserId)
            .Select(x => new DriverVehicleItem(
                x.Id,
                x.Brand,
                x.Model,
                x.Color,
                x.Year,
                x.PlateNumber,
                x.Seats,
                x.VerificationStatus.ToString(),
                x.VerificationReason))
            .ToListAsync(ct);

        return Results.Ok(ApiResponse<DriverProfileDetails>.Ok(new DriverProfileDetails(profile, vehicles)));
    }
}

public sealed record DriverMeResponse(Guid UserId, string VerificationStatus, string VerificationReason, decimal Rating, int TotalTrips);
public sealed record DriverVehicleItem(Guid Id, string Brand, string Model, string Color, int Year, string PlateNumber, int Seats, string VerificationStatus, string VerificationReason);
public sealed record DriverProfileDetails(DriverMeResponse Profile, IReadOnlyList<DriverVehicleItem> Vehicles);
