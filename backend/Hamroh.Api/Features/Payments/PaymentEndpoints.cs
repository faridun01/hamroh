using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Hamroh.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Features.Payments;

public static class PaymentEndpoints
{
    public static RouteGroupBuilder MapPaymentEndpoints(this RouteGroupBuilder group)
    {
        var payments = group.MapGroup("/payments").RequireAuthorization().RequireRateLimiting("sensitive");
        payments.MapGet("/me", Mine);
        payments.MapPost("/bookings/{bookingId:guid}/cash-paid", MarkBookingCashPaid);
        return group;
    }

    private static async Task<IResult> Mine(AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var items = await db.Payments.AsNoTracking()
            .Where(x => x.UserId == currentUser.UserId && !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new PaymentItem(x.Id, x.BookingId, x.PenaltyId, x.Amount, x.Status, x.Provider, x.CreatedAt))
            .ToListAsync(ct);

        return Results.Ok(ApiResponse<IReadOnlyList<PaymentItem>>.Ok(items));
    }

    private static async Task<IResult> MarkBookingCashPaid(Guid bookingId, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);

        var booking = await db.Bookings
            .Include(x => x.Trip)
            .SingleOrDefaultAsync(x => x.Id == bookingId, ct);

        if (booking is null)
        {
            return Results.NotFound(ApiResponse<object>.Fail("Booking not found"));
        }

        if (booking.PassengerId != currentUser.UserId && booking.Trip.DriverId != currentUser.UserId)
        {
            return Results.Forbid();
        }

        if (booking.Status is not (BookingStatus.Accepted or BookingStatus.Completed))
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Cash payment can be recorded only for accepted or completed bookings"));
        }

        var payment = await db.Payments.SingleOrDefaultAsync(x => x.BookingId == booking.Id && x.UserId == booking.PassengerId, ct);
        if (payment is null)
        {
            payment = new Payment
            {
                UserId = booking.PassengerId,
                BookingId = booking.Id,
                Amount = booking.TotalPrice,
                Provider = "Cash",
                Status = PaymentStatuses.Paid
            };
            db.Payments.Add(payment);
        }
        else
        {
            payment.Status = PaymentStatuses.Paid;
            payment.Provider = "Cash";
            payment.Amount = booking.TotalPrice;
        }

        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return Results.Ok(ApiResponse<object>.Ok(new { payment.Id, payment.Status, payment.Amount }));
    }
}

public sealed record PaymentItem(Guid Id, Guid? BookingId, Guid? PenaltyId, decimal Amount, string Status, string Provider, DateTime CreatedAt);
