using Hamroh.Api.BackgroundServices;
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
        admin.MapGet("/vehicles/pending", PendingVehicles);
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

    private static async Task<IResult> PendingVehicles(int page, int pageSize, AppDbContext db, CancellationToken ct)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var query = db.Vehicles.AsNoTracking()
            .Include(x => x.Driver)
            .Where(x => x.VerificationStatus == VerificationStatus.PendingVerification);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new PendingVehicleItem(
                x.Id,
                x.DriverId,
                x.Driver.FirstName + " " + x.Driver.LastName,
                x.Driver.Phone,
                x.Brand,
                x.Model,
                x.Color,
                x.Year,
                x.PlateNumber,
                x.Seats,
                x.TechnicalPassportKey,
                x.FrontPhotoKey,
                x.BackPhotoKey,
                x.InteriorPhotoKey,
                x.InsuranceDocumentKey,
                x.CreatedAt))
            .ToListAsync(ct);

        return Results.Ok(ApiResponse<PageResult<PendingVehicleItem>>.Ok(new PageResult<PendingVehicleItem>(items, page, pageSize, total)));
    }

    private static Task<IResult> ApproveDriver(Guid driverUserId, AppDbContext db, ICurrentUser currentUser, AuditLogger audit, NotificationQueue queue, CancellationToken ct)
    {
        return SetDriverStatus(driverUserId, VerificationStatus.Verified, "", db, currentUser, audit, queue, ct);
    }

    private static Task<IResult> RejectDriver(Guid driverUserId, ModerationReasonRequest request, AppDbContext db, ICurrentUser currentUser, AuditLogger audit, NotificationQueue queue, CancellationToken ct)
    {
        return SetDriverStatus(driverUserId, VerificationStatus.Rejected, request.Reason, db, currentUser, audit, queue, ct);
    }

    private static Task<IResult> SuspendDriver(Guid driverUserId, ModerationReasonRequest request, AppDbContext db, ICurrentUser currentUser, AuditLogger audit, NotificationQueue queue, CancellationToken ct)
    {
        return SetDriverStatus(driverUserId, VerificationStatus.Suspended, request.Reason, db, currentUser, audit, queue, ct);
    }

    private static Task<IResult> BanDriver(Guid driverUserId, ModerationReasonRequest request, AppDbContext db, ICurrentUser currentUser, AuditLogger audit, NotificationQueue queue, CancellationToken ct)
    {
        return SetDriverStatus(driverUserId, VerificationStatus.Banned, request.Reason, db, currentUser, audit, queue, ct);
    }

    private static async Task<IResult> SetDriverStatus(Guid driverUserId, VerificationStatus status, string reason, AppDbContext db, ICurrentUser currentUser, AuditLogger audit, NotificationQueue queue, CancellationToken ct)
    {
        var profile = await db.DriverProfiles.SingleOrDefaultAsync(x => x.UserId == driverUserId, ct);
        if (profile is null)
        {
            return Results.NotFound(ApiResponse<object>.Fail("Driver profile not found"));
        }

        profile.VerificationStatus = status;
        profile.VerificationReason = reason.Trim();
        
        await db.SaveChangesAsync(ct);
        await audit.WriteAsync(currentUser.UserId, $"Driver{status}", nameof(DriverProfile), profile.Id, ct);
        
        await queue.EnqueueAsync(new NotificationMessage(
            driverUserId,
            "Driver verification updated",
            status == VerificationStatus.Verified ? "Your driver profile is verified." : profile.VerificationReason,
            "driver_verification_status",
            null,
            null
        ), ct);

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
public sealed record PendingVehicleItem(Guid Id, Guid DriverId, string DriverName, string DriverPhone, string Brand, string Model, string Color, int Year, string PlateNumber, int Seats, string TechnicalPassportKey, string FrontPhotoKey, string BackPhotoKey, string InteriorPhotoKey, string InsuranceDocumentKey, DateTime SubmittedAt);
