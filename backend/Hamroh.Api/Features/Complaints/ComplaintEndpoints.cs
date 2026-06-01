using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Hamroh.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Features.Complaints;

public static class ComplaintEndpoints
{
    public static RouteGroupBuilder MapComplaintEndpoints(this RouteGroupBuilder group)
    {
        var complaints = group.MapGroup("/complaints").RequireRateLimiting("sensitive");
        complaints.MapPost("", Create).RequireAuthorization();
        complaints.MapGet("", List).RequireAuthorization("ModeratorOnly");
        complaints.MapPost("/{complaintId:guid}/status", UpdateStatus).RequireAuthorization("ModeratorOnly");
        return group;
    }

    private static async Task<IResult> Create(CreateComplaintRequest request, AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Type) || string.IsNullOrWhiteSpace(request.Description))
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Complaint type and description are required"));
        }

        if (request.BookingId.HasValue)
        {
            var canReferenceBooking = await db.Bookings
                .Include(x => x.Trip)
                .AnyAsync(x => x.Id == request.BookingId.Value && (x.PassengerId == currentUser.UserId || x.Trip.DriverId == currentUser.UserId), ct);

            if (!canReferenceBooking)
            {
                return Results.Forbid();
            }
        }

        var complaint = new Domain.Complaint
        {
            UserId = currentUser.UserId,
            BookingId = request.BookingId,
            Type = request.Type.Trim(),
            Description = request.Description.Trim(),
            Status = ComplaintStatuses.Open
        };

        db.Complaints.Add(complaint);
        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { complaint.Id, complaint.Status }));
    }

    private static async Task<IResult> List(string? status, int page, int pageSize, AppDbContext db, CancellationToken ct)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var query = db.Complaints.AsNoTracking().Where(x => !x.IsDeleted);
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.Status == status);
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return Results.Ok(ApiResponse<PageResult<Domain.Complaint>>.Ok(new PageResult<Domain.Complaint>(items, page, pageSize, total)));
    }

    private static async Task<IResult> UpdateStatus(Guid complaintId, UpdateComplaintStatusRequest request, AppDbContext db, CancellationToken ct)
    {
        var complaint = await db.Complaints.SingleOrDefaultAsync(x => x.Id == complaintId, ct);
        if (complaint is null)
        {
            return Results.NotFound(ApiResponse<object>.Fail("Complaint not found"));
        }

        var nextStatus = request.Status.Trim();
        if (!ComplaintStatuses.IsValid(nextStatus))
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Invalid complaint status"));
        }

        complaint.Status = nextStatus;
        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { complaint.Id, complaint.Status }));
    }
}

public sealed record CreateComplaintRequest(Guid? BookingId, string Type, string Description);
public sealed record UpdateComplaintStatusRequest(string Status);
