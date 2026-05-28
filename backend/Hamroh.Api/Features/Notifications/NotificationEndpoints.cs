using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Features.Notifications;

public static class NotificationEndpoints
{
    public static RouteGroupBuilder MapNotificationEndpoints(this RouteGroupBuilder group)
    {
        var notifications = group.MapGroup("/notifications").RequireAuthorization();
        notifications.MapGet("", List);
        notifications.MapPost("/{notificationId:guid}/read", MarkRead);
        return group;
    }

    private static async Task<IResult> List(int page, int pageSize, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var query = db.Notifications.AsNoTracking()
            .Where(x => !x.IsDeleted && x.UserId == currentUser.UserId)
            .OrderByDescending(x => x.CreatedAt);

        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new NotificationItem(x.Id, x.Title, x.Message, x.Type, x.BookingId, x.TripId, x.IsRead, x.CreatedAt))
            .ToListAsync(ct);

        return Results.Ok(ApiResponse<PageResult<NotificationItem>>.Ok(new PageResult<NotificationItem>(items, page, pageSize, total)));
    }

    private static async Task<IResult> MarkRead(Guid notificationId, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var notification = await db.Notifications.SingleOrDefaultAsync(x => x.Id == notificationId && x.UserId == currentUser.UserId, ct);
        if (notification is null)
        {
            return Results.NotFound(ApiResponse<object>.Fail("Notification not found"));
        }

        notification.IsRead = true;
        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { notification.Id, notification.IsRead }));
    }
}

public sealed record NotificationItem(Guid Id, string Title, string Message, string Type, Guid? BookingId, Guid? TripId, bool IsRead, DateTime CreatedAt);
