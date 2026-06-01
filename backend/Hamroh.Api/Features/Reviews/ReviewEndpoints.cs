using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Hamroh.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Features.Reviews;

public static class ReviewEndpoints
{
    public static RouteGroupBuilder MapReviewEndpoints(this RouteGroupBuilder group)
    {
        var reviews = group.MapGroup("/reviews").RequireAuthorization().RequireRateLimiting("sensitive");
        reviews.MapPost("", Create);
        reviews.MapGet("/users/{userId:guid}", ListForUser);
        return group;
    }

    private static async Task<IResult> ListForUser(Guid userId, int page, int pageSize, AppDbContext db, CancellationToken ct)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = db.Reviews.AsNoTracking()
            .Where(x => x.ToUserId == userId)
            .OrderByDescending(x => x.CreatedAt);

        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ReviewItem(
                x.Id,
                x.BookingId,
                x.FromUserId,
                x.ToUserId,
                x.Stars,
                x.Safety,
                x.Punctuality,
                x.Cleanliness,
                x.Politeness,
                x.Comment,
                x.CreatedAt))
            .ToListAsync(ct);

        return Results.Ok(ApiResponse<PageResult<ReviewItem>>.Ok(new PageResult<ReviewItem>(items, page, pageSize, total)));
    }

    private static async Task<IResult> Create(CreateReviewRequest request, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        if (request.Stars is < 1 or > 5)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Stars must be between 1 and 5"));
        }

        var booking = await db.Bookings.Include(x => x.Trip).SingleOrDefaultAsync(x => x.Id == request.BookingId, ct);
        if (booking is null)
        {
            return Results.NotFound(ApiResponse<object>.Fail("Booking not found"));
        }

        if (booking.Status != BookingStatus.Completed)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Reviews are available only after trip completion"));
        }

        var participantIds = new[] { booking.PassengerId, booking.Trip.DriverId };
        if (!participantIds.Contains(currentUser.UserId) || !participantIds.Contains(request.ToUserId) || request.ToUserId == currentUser.UserId)
        {
            return Results.Forbid();
        }

        var duplicate = await db.Reviews.AnyAsync(x => x.BookingId == request.BookingId && x.FromUserId == currentUser.UserId, ct);
        if (duplicate)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Review already exists"));
        }

        var review = new Review
        {
            BookingId = request.BookingId,
            FromUserId = currentUser.UserId,
            ToUserId = request.ToUserId,
            Stars = request.Stars,
            Safety = request.Safety,
            Punctuality = request.Punctuality,
            Cleanliness = request.Cleanliness,
            Politeness = request.Politeness,
            Comment = request.Comment.Trim()
        };

        db.Reviews.Add(review);
        await db.SaveChangesAsync(ct);
        await RecalculateRatingAsync(request.ToUserId, db, ct);
        return Results.Ok(ApiResponse<object>.Ok(new { review.Id }));
    }

    private static async Task RecalculateRatingAsync(Guid userId, AppDbContext db, CancellationToken ct)
    {
        var stats = await db.Reviews
            .Where(x => x.ToUserId == userId)
            .GroupBy(x => x.ToUserId)
            .Select(x => new { Rating = x.Average(r => r.Stars), Count = x.Count() })
            .SingleOrDefaultAsync(ct);

        if (stats is null)
        {
            return;
        }

        var driverProfile = await db.DriverProfiles.SingleOrDefaultAsync(x => x.UserId == userId, ct);
        if (driverProfile is not null)
        {
            driverProfile.Rating = Math.Round((decimal)stats.Rating, 2);
            driverProfile.TotalTrips = Math.Max(driverProfile.TotalTrips, stats.Count);
        }

        var passengerProfile = await db.PassengerProfiles.SingleOrDefaultAsync(x => x.UserId == userId, ct);
        if (passengerProfile is not null)
        {
            passengerProfile.Rating = Math.Round((decimal)stats.Rating, 2);
            passengerProfile.TotalTrips = Math.Max(passengerProfile.TotalTrips, stats.Count);
        }

        await db.SaveChangesAsync(ct);
    }
}

public sealed record CreateReviewRequest(Guid BookingId, Guid ToUserId, int Stars, int? Safety, int? Punctuality, int? Cleanliness, int? Politeness, string Comment);
public sealed record ReviewItem(Guid Id, Guid BookingId, Guid FromUserId, Guid ToUserId, int Stars, int? Safety, int? Punctuality, int? Cleanliness, int? Politeness, string Comment, DateTime CreatedAt);
