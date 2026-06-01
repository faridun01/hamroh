using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Features.Admin;

public static class AdminManagementEndpoints
{
    public static RouteGroupBuilder MapAdminManagementEndpoints(this RouteGroupBuilder group)
    {
        var admin = group.MapGroup("/admin").RequireAuthorization("ModeratorOnly").RequireRateLimiting("sensitive");
        admin.MapGet("/users", Users);
        admin.MapPost("/users/{userId:guid}/block", BlockUser).RequireAuthorization("AdminOnly");
        admin.MapPost("/users/{userId:guid}/unblock", UnblockUser).RequireAuthorization("AdminOnly");
        admin.MapGet("/trips", Trips);
        admin.MapGet("/bookings", Bookings);
        admin.MapGet("/stats", Stats);
        admin.MapGet("/audit", Audit);
        return group;
    }

    private static async Task<IResult> Users(string? role, int page, int pageSize, AppDbContext db, CancellationToken ct)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = db.Users.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(role))
        {
            query = query.Where(x => x.Role.ToString() == role);
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AdminUserItem(x.Id, x.Phone, x.FirstName, x.LastName, x.Role.ToString(), x.City, x.IsActive, x.CreatedAt))
            .ToListAsync(ct);

        return Results.Ok(ApiResponse<PageResult<AdminUserItem>>.Ok(new PageResult<AdminUserItem>(items, page, pageSize, total)));
    }

    private static Task<IResult> BlockUser(Guid userId, AppDbContext db, ICurrentUser currentUser, AuditLogger audit, CancellationToken ct)
    {
        return SetUserActive(userId, false, db, currentUser, audit, ct);
    }

    private static Task<IResult> UnblockUser(Guid userId, AppDbContext db, ICurrentUser currentUser, AuditLogger audit, CancellationToken ct)
    {
        return SetUserActive(userId, true, db, currentUser, audit, ct);
    }

    private static async Task<IResult> SetUserActive(Guid userId, bool isActive, AppDbContext db, ICurrentUser currentUser, AuditLogger audit, CancellationToken ct)
    {
        if (userId == currentUser.UserId)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Admin cannot change own active status"));
        }

        var user = await db.Users.SingleOrDefaultAsync(x => x.Id == userId, ct);
        if (user is null)
        {
            return Results.NotFound(ApiResponse<object>.Fail("User not found"));
        }

        user.IsActive = isActive;
        if (!isActive)
        {
            await db.UserRefreshTokens
                .Where(x => x.UserId == user.Id && !x.IsRevoked)
                .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.IsRevoked, true), ct);
        }

        await db.SaveChangesAsync(ct);
        await audit.WriteAsync(currentUser.UserId, isActive ? "UserUnblocked" : "UserBlocked", nameof(Domain.User), user.Id, ct);
        return Results.Ok(ApiResponse<object>.Ok(new { user.Id, user.IsActive }));
    }

    private static async Task<IResult> Trips(string? status, int page, int pageSize, AppDbContext db, CancellationToken ct)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        IQueryable<Domain.Trip> query = db.Trips.AsNoTracking().Include(x => x.Driver);
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.Status.ToString() == status);
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AdminTripItem(
                x.Id,
                x.DriverId,
                x.Driver.FirstName + " " + x.Driver.LastName,
                x.FromCity,
                x.ToCity,
                x.DepartureDate,
                x.DepartureTime,
                x.PricePerSeat,
                x.AvailableSeats,
                x.TotalSeats,
                x.Status.ToString()))
            .ToListAsync(ct);

        return Results.Ok(ApiResponse<PageResult<AdminTripItem>>.Ok(new PageResult<AdminTripItem>(items, page, pageSize, total)));
    }

    private static async Task<IResult> Bookings(string? status, int page, int pageSize, AppDbContext db, CancellationToken ct)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        IQueryable<Domain.Booking> query = db.Bookings.AsNoTracking()
            .Include(x => x.Trip)
            .Include(x => x.Passenger);

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.Status.ToString() == status);
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AdminBookingItem(
                x.Id,
                x.TripId,
                x.PassengerId,
                x.Passenger.FirstName + " " + x.Passenger.LastName,
                x.Trip.DriverId,
                x.Trip.FromCity,
                x.Trip.ToCity,
                x.SeatsCount,
                x.TotalPrice,
                x.Status.ToString(),
                x.CreatedAt))
            .ToListAsync(ct);

        return Results.Ok(ApiResponse<PageResult<AdminBookingItem>>.Ok(new PageResult<AdminBookingItem>(items, page, pageSize, total)));
    }

    private static async Task<IResult> Stats(AppDbContext db, CancellationToken ct)
    {
        var users = await db.Users.CountAsync(ct);
        var driversPending = await db.DriverProfiles.CountAsync(x => x.VerificationStatus == Domain.VerificationStatus.PendingVerification, ct);
        var tripsPublished = await db.Trips.CountAsync(x => x.Status == Domain.TripStatus.Published, ct);
        var bookingsPending = await db.Bookings.CountAsync(x => x.Status == Domain.BookingStatus.Pending, ct);
        var complaintsOpen = await db.Complaints.CountAsync(x => x.Status == Domain.ComplaintStatuses.Open, ct);

        return Results.Ok(ApiResponse<AdminStats>.Ok(new AdminStats(users, driversPending, tripsPublished, bookingsPending, complaintsOpen)));
    }

    private static async Task<IResult> Audit(int page, int pageSize, AppDbContext db, CancellationToken ct)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = db.AuditLogs.AsNoTracking().OrderByDescending(x => x.CreatedAt);
        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AdminAuditItem(x.Id, x.ActorUserId, x.Action, x.EntityType, x.EntityId, x.CreatedAt))
            .ToListAsync(ct);

        return Results.Ok(ApiResponse<PageResult<AdminAuditItem>>.Ok(new PageResult<AdminAuditItem>(items, page, pageSize, total)));
    }
}

public sealed record AdminUserItem(Guid Id, string Phone, string FirstName, string LastName, string Role, string City, bool IsActive, DateTime CreatedAt);
public sealed record AdminTripItem(Guid Id, Guid DriverId, string DriverName, string FromCity, string ToCity, DateOnly DepartureDate, TimeOnly DepartureTime, decimal PricePerSeat, int AvailableSeats, int TotalSeats, string Status);
public sealed record AdminBookingItem(Guid Id, Guid TripId, Guid PassengerId, string PassengerName, Guid DriverId, string FromCity, string ToCity, int SeatsCount, decimal TotalPrice, string Status, DateTime CreatedAt);
public sealed record AdminStats(int Users, int PendingDrivers, int PublishedTrips, int PendingBookings, int OpenComplaints);
public sealed record AdminAuditItem(long Id, Guid? ActorUserId, string Action, string EntityType, Guid? EntityId, DateTime CreatedAt);
