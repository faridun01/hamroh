namespace Hamroh.Api.Common;

public enum CommandStatus
{
    Success,
    BadRequest,
    NotFound,
    Conflict,
    Forbidden
}

public sealed record CommandResult<T>(CommandStatus Status, T? Data, string? ErrorMessage = null)
{
    public static CommandResult<T> Success(T data) => new(CommandStatus.Success, data);
    public static CommandResult<T> BadRequest(string message) => new(CommandStatus.BadRequest, default, message);
    public static CommandResult<T> NotFound(string message) => new(CommandStatus.NotFound, default, message);
    public static CommandResult<T> Conflict(string message) => new(CommandStatus.Conflict, default, message);
    public static CommandResult<T> Forbidden(string message = "Access denied") => new(CommandStatus.Forbidden, default, message);

    public bool IsSuccess => Status == CommandStatus.Success;
}

public static class CommandResultExtensions
{
    public static IResult ToHttpResult<T>(this CommandResult<T> result)
    {
        return result.Status switch
        {
            CommandStatus.Success => Microsoft.AspNetCore.Http.Results.Ok(ApiResponse<T>.Ok(result.Data!)),
            CommandStatus.BadRequest => Microsoft.AspNetCore.Http.Results.BadRequest(ApiResponse<object>.Fail(result.ErrorMessage ?? "Bad Request")),
            CommandStatus.NotFound => Microsoft.AspNetCore.Http.Results.NotFound(ApiResponse<object>.Fail(result.ErrorMessage ?? "Not Found")),
            CommandStatus.Conflict => Microsoft.AspNetCore.Http.Results.Conflict(ApiResponse<object>.Fail(result.ErrorMessage ?? "Conflict")),
            CommandStatus.Forbidden => Microsoft.AspNetCore.Http.Results.Forbid(),
            _ => Microsoft.AspNetCore.Http.Results.StatusCode(500)
        };
    }
}
