using System.Threading.Channels;
using Hamroh.Api.Data;
using Hamroh.Api.Domain;

namespace Hamroh.Api.BackgroundServices;

public sealed record NotificationMessage(Guid UserId, string Title, string Message, string Type, Guid? BookingId, Guid? TripId);

public sealed class NotificationQueue
{
    private readonly Channel<NotificationMessage> _channel = Channel.CreateUnbounded<NotificationMessage>();

    public async ValueTask EnqueueAsync(NotificationMessage message, CancellationToken ct = default)
    {
        await _channel.Writer.WriteAsync(message, ct);
    }

    public IAsyncEnumerable<NotificationMessage> ReadAllAsync(CancellationToken ct = default)
    {
        return _channel.Reader.ReadAllAsync(ct);
    }
}

public sealed class NotificationWorker(NotificationQueue queue, IServiceProvider services, ILogger<NotificationWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("NotificationWorker started.");
        await foreach (var msg in queue.ReadAllAsync(stoppingToken))
        {
            try
            {
                using var scope = services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                
                db.Notifications.Add(new Notification
                {
                    UserId = msg.UserId,
                    Title = msg.Title,
                    Message = msg.Message,
                    Type = msg.Type,
                    BookingId = msg.BookingId,
                    TripId = msg.TripId
                });
                
                await db.SaveChangesAsync(stoppingToken);
                // Here we would also trigger Firebase Cloud Messaging (FCM)
                logger.LogInformation("Processed notification for User {UserId}: {Title}", msg.UserId, msg.Title);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing notification for User {UserId}", msg.UserId);
            }
        }
    }
}
