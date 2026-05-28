using Hamroh.Api.Data;
using Hamroh.Api.Domain;

namespace Hamroh.Api.Common;

public sealed class AuditLogger(AppDbContext db)
{
    public async Task WriteAsync(Guid? actorId, string action, string entityType, Guid? entityId, CancellationToken cancellationToken)
    {
        db.AuditLogs.Add(new AuditLog
        {
            ActorUserId = actorId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync(cancellationToken);
    }
}
