namespace Hamroh.Api.Common;

public sealed record ApiResponse<T>(bool Success, T? Data, string Message, IReadOnlyList<string> Errors)
{
    public static ApiResponse<T> Ok(T data, string message = "") => new(true, data, message, []);
    public static ApiResponse<T> Fail(string message, IReadOnlyList<string>? errors = null) => new(false, default, message, errors ?? []);
}

public sealed record PageResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);
