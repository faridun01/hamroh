using Hamroh.Api.Data;
using Hamroh.Api.Domain;
using StackExchange.Redis;
using System.Text.Json;

namespace Hamroh.Api.BackgroundServices;

public sealed record NotificationMessage(Guid UserId, string Title, string Message, string Type, Guid? BookingId, Guid? TripId);

public sealed class NotificationQueue(IConnectionMultiplexer redis)
{
    private const string StreamName = "notifications:stream";

    public async ValueTask EnqueueAsync(NotificationMessage message, CancellationToken ct = default)
    {
        var db = redis.GetDatabase();
        await db.StreamAddAsync(StreamName, [
            new NameValueEntry("payload", JsonSerializer.Serialize(message))
        ]);
    }

    public IDatabase Database => redis.GetDatabase();
    public string QueueName => StreamName;
}

public sealed class NotificationWorker(NotificationQueue queue, IServiceProvider services, ILogger<NotificationWorker> logger) : BackgroundService
{
    private const string GroupName = "notification-workers";
    private readonly string _consumerName = $"{Environment.MachineName}-{Guid.NewGuid():N}";

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("NotificationWorker started.");
        await EnsureConsumerGroupAsync();

        while (!stoppingToken.IsCancellationRequested)
        {
            var entries = await queue.Database.StreamReadGroupAsync(
                queue.QueueName,
                GroupName,
                _consumerName,
                ">",
                count: 10);

            if (entries.Length == 0)
            {
                await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
                continue;
            }

            foreach (var entry in entries)
            {
                await ProcessEntryAsync(entry, stoppingToken);
            }
        }
    }

    private async Task EnsureConsumerGroupAsync()
    {
        try
        {
            await queue.Database.StreamCreateConsumerGroupAsync(queue.QueueName, GroupName, "0-0", createStream: true);
        }
        catch (RedisServerException ex) when (ex.Message.Contains("BUSYGROUP", StringComparison.OrdinalIgnoreCase))
        {
            // Consumer group already exists.
        }
    }

    private async Task ProcessEntryAsync(StreamEntry entry, CancellationToken stoppingToken)
    {
        try
        {
            var payload = entry.Values.FirstOrDefault(x => x.Name == "payload").Value;
            if (!payload.HasValue)
            {
                await queue.Database.StreamAcknowledgeAsync(queue.QueueName, GroupName, entry.Id);
                return;
            }

            var msg = JsonSerializer.Deserialize<NotificationMessage>(payload!);
            if (msg is null)
            {
                await queue.Database.StreamAcknowledgeAsync(queue.QueueName, GroupName, entry.Id);
                return;
            }

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
            await queue.Database.StreamAcknowledgeAsync(queue.QueueName, GroupName, entry.Id);
            // Here we would also trigger Firebase Cloud Messaging (FCM)
            logger.LogInformation("Processed notification for User {UserId}: {Title}", msg.UserId, msg.Title);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error processing notification stream entry {EntryId}", entry.Id);
        }
    }
}
