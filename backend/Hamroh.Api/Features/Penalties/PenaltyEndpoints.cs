using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Features.Penalties;

public static class PenaltyEndpoints
{
    public static RouteGroupBuilder MapPenaltyEndpoints(this RouteGroupBuilder group)
    {
        var penalties = group.MapGroup("/penalties").RequireAuthorization();
        penalties.MapGet("/me", Mine);
        penalties.MapPost("/{penaltyId:guid}/pay", Pay);
        return group;
    }

    private static async Task<IResult> Mine(AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var items = await db.Penalties.AsNoTracking()
            .Where(x => x.PassengerId == currentUser.UserId && !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new PenaltyItem(x.Id, x.BookingId, x.Amount, x.IsPaid, x.CreatedAt))
            .ToListAsync(ct);

        return Results.Ok(ApiResponse<IReadOnlyList<PenaltyItem>>.Ok(items));
    }

    private static async Task<IResult> Pay(Guid penaltyId, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var penalty = await db.Penalties.SingleOrDefaultAsync(x => x.Id == penaltyId && x.PassengerId == currentUser.UserId, ct);
        if (penalty is null)
        {
            return Results.NotFound(ApiResponse<object>.Fail("Penalty not found"));
        }

        penalty.IsPaid = true;
        db.Payments.Add(new Domain.Payment
        {
            UserId = currentUser.UserId,
            PenaltyId = penalty.Id,
            Amount = penalty.Amount,
            Status = "Paid",
            Provider = "ManualMvp"
        });

        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { penalty.Id, penalty.IsPaid }));
    }
}

public sealed record PenaltyItem(Guid Id, Guid BookingId, decimal Amount, bool IsPaid, DateTime CreatedAt);
