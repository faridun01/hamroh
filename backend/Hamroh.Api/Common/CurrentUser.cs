using System.Security.Claims;

namespace Hamroh.Api.Common;

public interface ICurrentUser
{
    Guid UserId { get; }
    string Role { get; }
}

public sealed class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    public Guid UserId
    {
        get
        {
            var value = accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(value, out var id) ? id : throw new UnauthorizedAccessException("Missing user id.");
        }
    }

    public string Role => accessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role)
        ?? throw new UnauthorizedAccessException("Missing user role.");
}
