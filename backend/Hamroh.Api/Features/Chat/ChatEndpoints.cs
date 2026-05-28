using Hamroh.Api.BackgroundServices;
using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Hamroh.Api.Domain;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Features.Chat;

public static class ChatEndpoints
{
    public static RouteGroupBuilder MapChatEndpoints(this RouteGroupBuilder group)
    {
        var chat = group.MapGroup("/chat").RequireAuthorization().RequireRateLimiting("sensitive");
        chat.MapGet("/bookings/{bookingId:guid}/messages", ListMessages);
        chat.MapPost("/bookings/{bookingId:guid}/messages", SendMessage);
        return group;
    }

    private static async Task<IResult> ListMessages(Guid bookingId, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var booking = await LoadBookingForParticipant(bookingId, db, currentUser.UserId, ct);
        if (booking is null)
        {
            return Results.NotFound(ApiResponse<object>.Fail("Booking not found"));
        }

        if (booking.Status != BookingStatus.Accepted && booking.Status != BookingStatus.Completed)
        {
            return Results.Forbid();
        }

        var messages = await db.ChatMessages.AsNoTracking()
            .Where(x => x.BookingId == bookingId)
            .OrderBy(x => x.CreatedAt)
            .Select(x => new ChatMessageItem(x.Id, x.SenderId, x.Body, x.CreatedAt, x.IsArchived))
            .ToListAsync(ct);

        return Results.Ok(ApiResponse<IReadOnlyList<ChatMessageItem>>.Ok(messages));
    }

    private static async Task<IResult> SendMessage(
        Guid bookingId, 
        SendChatMessageRequest request, 
        AppDbContext db, 
        ICurrentUser currentUser, 
        IHubContext<ChatHub> hubContext,
        NotificationQueue queue,
        CancellationToken ct)
    {
        var booking = await LoadBookingForParticipant(bookingId, db, currentUser.UserId, ct);
        if (booking is null)
        {
            return Results.NotFound(ApiResponse<object>.Fail("Booking not found"));
        }

        if (booking.Status != BookingStatus.Accepted)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Chat is available only during an accepted active booking"));
        }

        if (string.IsNullOrWhiteSpace(request.Body))
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Message body is required"));
        }

        var message = new ChatMessage
        {
            BookingId = bookingId,
            SenderId = currentUser.UserId,
            Body = request.Body.Trim()
        };

        db.ChatMessages.Add(message);
        await db.SaveChangesAsync(ct);

        var receiverId = booking.PassengerId == currentUser.UserId ? booking.Trip.DriverId : booking.PassengerId;
        
        // Broadcast via SignalR
        await hubContext.Clients.Group($"booking_{bookingId}").SendAsync("ReceiveMessage", new ChatMessageItem(message.Id, message.SenderId, message.Body, message.CreatedAt, message.IsArchived), ct);

        // Queue Push Notification
        await queue.EnqueueAsync(new NotificationMessage(
            receiverId,
            "New message",
            "You have a new message in Hamroh.",
            "new_message",
            booking.Id,
            booking.TripId
        ), ct);

        return Results.Ok(ApiResponse<object>.Ok(new { message.Id }));
    }

    private static Task<Booking?> LoadBookingForParticipant(Guid bookingId, AppDbContext db, Guid userId, CancellationToken ct)
    {
        return db.Bookings
            .Include(x => x.Trip)
            .SingleOrDefaultAsync(x => x.Id == bookingId && (x.PassengerId == userId || x.Trip.DriverId == userId), ct);
    }
}

public sealed record SendChatMessageRequest(string Body);
public sealed record ChatMessageItem(Guid Id, Guid SenderId, string Body, DateTime CreatedAt, bool IsArchived);
