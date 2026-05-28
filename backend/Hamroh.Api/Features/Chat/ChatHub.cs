using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Hamroh.Api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Features.Chat;

[Authorize]
public sealed class ChatHub(AppDbContext db) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (userId is not null)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
        }
        await base.OnConnectedAsync();
    }

    public async Task JoinBookingChat(Guid bookingId)
    {
        var userId = Guid.Parse(Context.UserIdentifier!);
        var isParticipant = await db.Bookings
            .Include(x => x.Trip)
            .AnyAsync(x => x.Id == bookingId && (x.PassengerId == userId || x.Trip.DriverId == userId));

        if (isParticipant)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"booking_{bookingId}");
        }
    }
}
