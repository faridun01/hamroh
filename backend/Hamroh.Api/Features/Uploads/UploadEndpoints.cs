using System.Security.Claims;
using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Hamroh.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Features.Uploads;

public static class UploadEndpoints
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf"
    };

    public static RouteGroupBuilder MapUploadEndpoints(this RouteGroupBuilder group)
    {
        var uploads = group.MapGroup("/uploads").RequireRateLimiting("sensitive");
        uploads.MapPost("/documents", UploadDocument).DisableAntiforgery();
        uploads.MapGet("/documents/{storageKey}", DownloadDocument).RequireAuthorization("ModeratorOnly");
        return group;
    }

    private static async Task<IResult> UploadDocument(
        IFormFile file,
        string purpose,
        AppDbContext db,
        IWebHostEnvironment env,
        IHttpContextAccessor accessor,
        CancellationToken ct)
    {
        if (file.Length == 0 || file.Length > 10 * 1024 * 1024)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("File must be between 1 byte and 10 MB"));
        }

        if (!AllowedContentTypes.Contains(file.ContentType))
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Only JPG, PNG, WEBP, and PDF files are allowed"));
        }

        purpose = purpose.Trim();
        if (string.IsNullOrWhiteSpace(purpose) || purpose.Length > 64)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Valid upload purpose is required"));
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension is not (".jpg" or ".jpeg" or ".png" or ".webp" or ".pdf"))
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Invalid file extension"));
        }

        var root = Path.Combine(env.ContentRootPath, "private_uploads");
        Directory.CreateDirectory(root);

        var storageKey = $"{Guid.NewGuid():N}{extension}";
        var path = Path.Combine(root, storageKey);

        await using (var stream = File.Create(path))
        {
            await file.CopyToAsync(stream, ct);
        }

        var userId = TryGetUserId(accessor.HttpContext);
        var document = new UploadedDocument
        {
            UserId = userId,
            StorageKey = storageKey,
            OriginalFileName = Path.GetFileName(file.FileName),
            ContentType = file.ContentType,
            SizeBytes = file.Length,
            Purpose = purpose
        };

        db.UploadedDocuments.Add(document);
        await db.SaveChangesAsync(ct);

        return Results.Ok(ApiResponse<UploadDocumentResponse>.Ok(new UploadDocumentResponse(document.Id, document.StorageKey)));
    }

    private static async Task<IResult> DownloadDocument(string storageKey, AppDbContext db, IWebHostEnvironment env, CancellationToken ct)
    {
        var document = await db.UploadedDocuments.AsNoTracking().SingleOrDefaultAsync(x => x.StorageKey == storageKey, ct);
        if (document is null)
        {
            return Results.NotFound(ApiResponse<object>.Fail("Document not found"));
        }

        var path = Path.Combine(env.ContentRootPath, "private_uploads", document.StorageKey);
        if (!File.Exists(path))
        {
            return Results.NotFound(ApiResponse<object>.Fail("Document file not found"));
        }

        return Results.File(path, document.ContentType, document.OriginalFileName);
    }

    private static Guid? TryGetUserId(HttpContext? context)
    {
        var value = context?.User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out var id) ? id : null;
    }
}

public sealed record UploadDocumentResponse(Guid Id, string StorageKey);
