using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Hamroh.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Features.Admin;

public static class AdminEndpoints
{
    public static RouteGroupBuilder MapAdminEndpoints(this RouteGroupBuilder group)
    {
        var admin = group.MapGroup("/admin").RequireAuthorization("ModeratorOnly").RequireRateLimiting("sensitive");
        admin.MapGet("/drivers/pending", PendingDrivers);
        admin.MapPost("/drivers/{driverUserId:guid}/approve", ApproveDriver);
        admin.MapPost("/drivers/{driverUserId:guid}/reject", RejectDriver);
        admin.MapPost("/drivers/{driverUserId:guid}/suspend", SuspendDriver);
        admin.MapPost("/drivers/{driverUserId:guid}/ban", BanDriver).RequireAuthorization("AdminOnly");
        admin.MapPost("/vehicles/{vehicleId:guid}/approve", ApproveVehicle);
        admin.MapPost("/vehicles/{vehicleId:guid}/reject", RejectVehicle);
        return group;
    }

    private static async Task<IResult> PendingDrivers(int page, int pageSize, AppDbContext db, CancellationToken ct)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var query = db.DriverProfiles.AsNoTracking()
            .Include(x => x.User)
            .Where(x => x.VerificationStatus == VerificationStatus.PendingVerification);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new PendingDriverItem(
                x.UserId,
                x.User.FirstName,
                x.User.LastName,
                x.User.Phone,
                x.User.City,
                x.LicenseNumber,
                x.ProfilePhotoKey,
                x.LiveSelfieKey,
                x.PassportDocumentKey,
                x.LicenseDocumentKey,
                x.CreatedAt))
            .ToListAsync(ct);

        return Results.Ok(ApiResponse<PageResult<PendingDriverItem>>.Ok(new PageResult<PendingDriverItem>(items, page, pageSize, total)));
    }

    private static Task<IResult> ApproveDriver(Guid driverUserId, AppDbContext db, ICurrentUser currentUser, AuditLogger audit, CancellationToken ct)
    {
        return SetDriverStatus(driverUserId, VerificationStatus.Verified, "", db, currentUser, audit, ct);
    }

    private static Task<IResult> RejectDriver(Guid driverUserId, ModerationReasonRequest request, AppDbContext db, ICurrentUser currentUser, AuditLogger audit, CancellationToken ct)
    {
        return SetDriverStatus(driverUserId, VerificationStatus.Rejected, request.Reason, db, currentUser, audit, ct);
    }

    private static Task<IResult> SuspendDriver(Guid driverUserId, ModerationReasonRequest request, AppDbContext db, ICurrentUser currentUser, AuditLogger audit, CancellationToken ct)
    {
        return SetDriverStatus(driverUserId, VerificationStatus.Suspended, request.Reason, db, currentUser, audit, ct);
    }

    private static Task<IResult> BanDriver(Guid driverUserId, ModerationReasonRequest request, AppDbContext db, ICurrentUser currentUser, AuditLogger audit, CancellationToken ct)
    {
        return SetDriverStatus(driverUserId, VerificationStatus.Banned, request.Reason, db, currentUser, audit, ct);
    }

    private static async Task<IResult> SetDriverStatus(Guid driverUserId, VerificationStatus status, string reason, AppDbContext db, ICurrentUser currentUser, AuditLogger audit, CancellationToken ct)
    {
        var profile = await db.DriverProfiles.SingleOrDefaultAsync(x => x.UserId == driverUserId, ct);
        if (profile is null)
        {
            return Results.NotFound(ApiResponse<object>.Fail("Driver profile not found"));
        }

        profile.VerificationStatus = status;
        profile.VerificationReason = reason.Trim();
        db.Notifications.Add(new Notification
        {
            UserId = driverUserId,
            Title = "Driver verification updated",
            Message = status == VerificationStatus.Verified ? "Your driver profile is verified." : profile.VerificationReason,
            Type = "driver_verification_status"
        });

        await db.SaveChangesAsync(ct);
        await audit.WriteAsync(currentUser.UserId, $"Driver{status}", nameof(DriverProfile), profile.Id, ct);
        return Results.Ok(ApiResponse<object>.Ok(new { profile.UserId, profile.VerificationStatus }));
    }

    private static async Task<IResult> ApproveVehicle(Guid vehicleId, AppDbContext db, ICurrentUser currentUser, AuditLogger audit, CancellationToken ct)
    {
        var vehicle = await db.Vehicles.SingleOrDefaultAsync(x => x.Id == vehicleId, ct);
        if (vehicle is null)
        {
            return Results.NotFound(ApiResponse<object>.Fail("Vehicle not found"));
        }

        vehicle.VerificationStatus = VerificationStatus.Verified;
        vehicle.VerificationReason = "";
        await db.SaveChangesAsync(ct);
        await audit.WriteAsync(currentUser.UserId, "VehicleVerified", nameof(Vehicle), vehicle.Id, ct);
        return Results.Ok(ApiResponse<object>.Ok(new { vehicle.Id, vehicle.VerificationStatus }));
    }

    private static async Task<IResult> RejectVehicle(Guid vehicleId, ModerationReasonRequest request, AppDbContext db, ICurrentUser currentUser, AuditLogger audit, CancellationToken ct)
    {
        var vehicle = await db.Vehicles.SingleOrDefaultAsync(x => x.Id == vehicleId, ct);
        if (vehicle is null)
        {
            return Results.NotFound(ApiResponse<object>.Fail("Vehicle not found"));
        }

        vehicle.VerificationStatus = VerificationStatus.Rejected;
        vehicle.VerificationReason = request.Reason.Trim();
        await db.SaveChangesAsync(ct);
        await audit.WriteAsync(currentUser.UserId, "VehicleRejected", nameof(Vehicle), vehicle.Id, ct);
        return Results.Ok(ApiResponse<object>.Ok(new { vehicle.Id, vehicle.VerificationStatus }));
    }
}

public sealed record ModerationReasonRequest(string Reason);
public sealed record PendingDriverItem(Guid UserId, string FirstName, string LastName, string Phone, string City, string LicenseNumber, string ProfilePhotoKey, string LiveSelfieKey, string PassportDocumentKey, string LicenseDocumentKey, DateTime SubmittedAt);
