using System.Security.Claims;
using Hamroh.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Common;

public sealed class ActiveUserMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, AppDbContext db)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var value = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(value, out var userId))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return;
            }

            var isActive = await db.Users.AsNoTracking().AnyAsync(x => x.Id == userId && x.IsActive);
            if (!isActive)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return;
            }
        }

        await next(context);
    }
}
