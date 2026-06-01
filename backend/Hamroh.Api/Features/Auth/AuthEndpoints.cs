using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Hamroh.Api.Domain;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace Hamroh.Api.Features.Auth;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder group)
    {
        var auth = group.MapGroup("/auth").RequireRateLimiting("auth");
        auth.MapPost("/send-otp", SendOtp);
        auth.MapPost("/register/passenger", RegisterPassenger);
        auth.MapPost("/register/driver", RegisterDriver);
        auth.MapPost("/login", Login);
        auth.MapPost("/refresh", RefreshToken);
        auth.MapPost("/reset-password", ResetPassword);
        auth.MapPost("/logout", Logout).RequireAuthorization();
        auth.MapGet("/me", Me).RequireAuthorization();
        return group;
    }

    private static async Task<IResult> SendOtp(SendOtpRequest request, IConnectionMultiplexer redis, IWebHostEnvironment env)
    {
        if (string.IsNullOrWhiteSpace(request.Phone) || request.Phone.Length is < 8 or > 32)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Valid phone is required"));
        }

        var phone = request.Phone.Trim();
        var code = Random.Shared.Next(1000, 9999).ToString();
        if (env.IsDevelopment())
        {
            // Development-only mock SMS visibility. Production must use an SMS provider.
            Console.WriteLine($"[SMS MOCK] OTP for {phone} is {code}");
        }
        var db = redis.GetDatabase();
        await db.StringSetAsync($"otp:{phone}", code, TimeSpan.FromMinutes(3));
        return Results.Ok(ApiResponse<object>.Ok(new { }, "OTP sent via SMS"));
    }

    private static async Task<IResult> RegisterPassenger(RegisterPassengerRequest request, AppDbContext db, PasswordHasher hasher, TokenService tokens, IConnectionMultiplexer redis, CancellationToken ct)
    {
        var rdb = redis.GetDatabase();
        var phone = request.Phone.Trim();
        if (!IsValidRegistration(phone, request.Password, request.FirstName, request.LastName, request.Language, out var validationError))
        {
            return Results.BadRequest(ApiResponse<object>.Fail(validationError));
        }

        var cachedOtp = await rdb.StringGetAsync($"otp:{phone}");
        if (cachedOtp != request.OtpCode) return Results.BadRequest(ApiResponse<object>.Fail("Invalid or expired OTP"));

        if (await db.Users.AnyAsync(x => x.Phone == phone, ct))
            return Results.BadRequest(ApiResponse<object>.Fail("Phone already registered"));

        var user = new User
        {
            Phone = phone, PasswordHash = hasher.Hash(request.Password),
            FirstName = request.FirstName.Trim(), LastName = request.LastName.Trim(),
            Gender = request.Gender, Role = UserRole.Passenger,
            City = request.City?.Trim() ?? "", Language = request.Language.Trim()
        };

        db.Users.Add(user);
        db.PassengerProfiles.Add(new PassengerProfile { User = user });
        
        var t = tokens.CreateTokens(user);
        db.UserRefreshTokens.Add(new UserRefreshToken { UserId = user.Id, Token = tokens.HashRefreshToken(t.RefreshToken), ExpiresAt = DateTime.UtcNow.AddDays(30) });
        
        await db.SaveChangesAsync(ct);
        await rdb.KeyDeleteAsync($"otp:{phone}");
        return Results.Ok(ApiResponse<AuthTokens>.Ok(t));
    }

    private static async Task<IResult> RegisterDriver(RegisterDriverRequest request, AppDbContext db, PasswordHasher hasher, TokenService tokens, IConnectionMultiplexer redis, CancellationToken ct)
    {
        var rdb = redis.GetDatabase();
        var phone = request.Phone.Trim();
        if (!IsValidRegistration(phone, request.Password, request.FirstName, request.LastName, request.Language, out var validationError))
        {
            return Results.BadRequest(ApiResponse<object>.Fail(validationError));
        }

        if (string.IsNullOrWhiteSpace(request.LicenseNumber) ||
            string.IsNullOrWhiteSpace(request.PassportDocumentKey) ||
            string.IsNullOrWhiteSpace(request.LicenseDocumentKey) ||
            string.IsNullOrWhiteSpace(request.ProfilePhotoKey) ||
            string.IsNullOrWhiteSpace(request.LiveSelfieKey))
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Driver verification documents are required"));
        }

        if (request.Vehicle.Seats is < 1 or > 8 ||
            request.Vehicle.Year is < 1980 or > 2100 ||
            string.IsNullOrWhiteSpace(request.Vehicle.Brand) ||
            string.IsNullOrWhiteSpace(request.Vehicle.Model) ||
            string.IsNullOrWhiteSpace(request.Vehicle.Color) ||
            string.IsNullOrWhiteSpace(request.Vehicle.PlateNumber) ||
            string.IsNullOrWhiteSpace(request.Vehicle.TechnicalPassportKey) ||
            string.IsNullOrWhiteSpace(request.Vehicle.FrontPhotoKey) ||
            string.IsNullOrWhiteSpace(request.Vehicle.BackPhotoKey) ||
            string.IsNullOrWhiteSpace(request.Vehicle.InteriorPhotoKey))
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Valid vehicle data and documents are required"));
        }

        var cachedOtp = await rdb.StringGetAsync($"otp:{phone}");
        if (cachedOtp != request.OtpCode) return Results.BadRequest(ApiResponse<object>.Fail("Invalid or expired OTP"));

        if (await db.Users.AnyAsync(x => x.Phone == phone, ct))
            return Results.BadRequest(ApiResponse<object>.Fail("Phone already registered"));

        var user = new User
        {
            Phone = phone, PasswordHash = hasher.Hash(request.Password),
            FirstName = request.FirstName.Trim(), LastName = request.LastName.Trim(),
            Gender = request.Gender, Role = UserRole.Driver,
            City = request.City?.Trim() ?? "", Language = request.Language.Trim()
        };

        db.Users.Add(user);
        db.DriverProfiles.Add(new DriverProfile
        {
            User = user, VerificationStatus = VerificationStatus.PendingVerification,
            ProfilePhotoKey = request.ProfilePhotoKey.Trim(), LiveSelfieKey = request.LiveSelfieKey.Trim(),
            LicenseNumber = request.LicenseNumber.Trim(), LicenseDocumentKey = request.LicenseDocumentKey.Trim(),
            PassportDocumentKey = request.PassportDocumentKey.Trim()
        });
        db.Vehicles.Add(new Vehicle
        {
            Driver = user, Brand = request.Vehicle.Brand.Trim(), Model = request.Vehicle.Model.Trim(),
            Color = request.Vehicle.Color.Trim(), Year = request.Vehicle.Year,
            PlateNumber = request.Vehicle.PlateNumber.Trim(), Seats = request.Vehicle.Seats,
            VerificationStatus = VerificationStatus.PendingVerification,
            TechnicalPassportKey = request.Vehicle.TechnicalPassportKey.Trim(),
            FrontPhotoKey = request.Vehicle.FrontPhotoKey.Trim(), BackPhotoKey = request.Vehicle.BackPhotoKey.Trim(),
            InteriorPhotoKey = request.Vehicle.InteriorPhotoKey.Trim(), InsuranceDocumentKey = request.Vehicle.InsuranceDocumentKey.Trim()
        });

        var t = tokens.CreateTokens(user);
        db.UserRefreshTokens.Add(new UserRefreshToken { UserId = user.Id, Token = tokens.HashRefreshToken(t.RefreshToken), ExpiresAt = DateTime.UtcNow.AddDays(30) });

        await db.SaveChangesAsync(ct);
        await rdb.KeyDeleteAsync($"otp:{phone}");
        return Results.Ok(ApiResponse<AuthTokens>.Ok(t));
    }

    private static async Task<IResult> Login(LoginRequest request, AppDbContext db, PasswordHasher hasher, TokenService tokens, CancellationToken ct)
    {
        var phone = request.Phone.Trim();
        if (string.IsNullOrWhiteSpace(phone) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.Unauthorized();
        }

        var user = await db.Users.SingleOrDefaultAsync(x => x.Phone == phone && x.IsActive, ct);
        if (user is null || !hasher.Verify(request.Password, user.PasswordHash))
            return Results.Unauthorized();

        var t = tokens.CreateTokens(user);
        db.UserRefreshTokens.Add(new UserRefreshToken { UserId = user.Id, Token = tokens.HashRefreshToken(t.RefreshToken), ExpiresAt = DateTime.UtcNow.AddDays(30) });
        await db.SaveChangesAsync(ct);

        return Results.Ok(ApiResponse<AuthTokens>.Ok(t));
    }

    private static async Task<IResult> RefreshToken(RefreshRequest request, AppDbContext db, TokenService tokens, CancellationToken ct)
    {
        var refreshTokenHash = tokens.HashRefreshToken(request.RefreshToken);
        var rt = await db.UserRefreshTokens
            .Include(x => x.User)
            .SingleOrDefaultAsync(x => x.Token == refreshTokenHash && !x.IsRevoked && x.ExpiresAt > DateTime.UtcNow, ct);

        if (rt is null || !rt.User.IsActive)
            return Results.Unauthorized();

        rt.IsRevoked = true;
        
        var t = tokens.CreateTokens(rt.User);
        db.UserRefreshTokens.Add(new UserRefreshToken { UserId = rt.UserId, Token = tokens.HashRefreshToken(t.RefreshToken), ExpiresAt = DateTime.UtcNow.AddDays(30) });
        await db.SaveChangesAsync(ct);

        return Results.Ok(ApiResponse<AuthTokens>.Ok(t));
    }

    private static async Task<IResult> ResetPassword(ResetPasswordRequest request, AppDbContext db, PasswordHasher hasher, IConnectionMultiplexer redis, CancellationToken ct)
    {
        var phone = request.Phone.Trim();
        if (request.NewPassword.Length < 8)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Password must be at least 8 characters"));
        }

        var rdb = redis.GetDatabase();
        var cachedOtp = await rdb.StringGetAsync($"otp:{phone}");
        if (cachedOtp != request.OtpCode)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Invalid or expired OTP"));
        }

        var user = await db.Users.SingleOrDefaultAsync(x => x.Phone == phone && x.IsActive, ct);
        if (user is null)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Invalid or expired OTP"));
        }

        user.PasswordHash = hasher.Hash(request.NewPassword);
        await db.UserRefreshTokens
            .Where(x => x.UserId == user.Id && !x.IsRevoked)
            .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.IsRevoked, true), ct);

        await db.SaveChangesAsync(ct);
        await rdb.KeyDeleteAsync($"otp:{phone}");

        return Results.Ok(ApiResponse<object>.Ok(new { }, "Password reset"));
    }

    private static async Task<IResult> Logout(AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        await db.UserRefreshTokens
            .Where(x => x.UserId == currentUser.UserId && !x.IsRevoked)
            .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.IsRevoked, true), ct);

        return Results.Ok(ApiResponse<object>.Ok(new { }, "Logged out"));
    }

    private static async Task<IResult> Me(AppDbContext db, ICurrentUser currentUser, CancellationToken ct)
    {
        var user = await db.Users
            .AsNoTracking()
            .Where(x => x.Id == currentUser.UserId && x.IsActive)
            .Select(x => new CurrentUserResponse(x.Id, x.Phone, x.FirstName, x.LastName, x.Role, x.Language, x.City))
            .SingleOrDefaultAsync(ct);

        return user is null
            ? Results.Unauthorized()
            : Results.Ok(ApiResponse<CurrentUserResponse>.Ok(user));
    }

    private static bool IsValidRegistration(string phone, string password, string firstName, string lastName, string language, out string error)
    {
        if (string.IsNullOrWhiteSpace(phone) || phone.Length is < 8 or > 32)
        {
            error = "Valid phone is required";
            return false;
        }
        if (password.Length < 8)
        {
            error = "Password must be at least 8 characters";
            return false;
        }
        if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName))
        {
            error = "First name and last name are required";
            return false;
        }
        if (string.IsNullOrWhiteSpace(language) || language.Length > 8)
        {
            error = "Valid language is required";
            return false;
        }

        error = "";
        return true;
    }
}

public sealed record SendOtpRequest(string Phone);
public sealed record RefreshRequest(string RefreshToken);
public sealed record ResetPasswordRequest(string Phone, string OtpCode, string NewPassword);
public sealed record RegisterPassengerRequest(string Phone, string OtpCode, string Password, string FirstName, string LastName, Gender Gender, string? City, string Language);
public sealed record RegisterDriverRequest(string Phone, string OtpCode, string Password, string FirstName, string LastName, Gender Gender, string? City, string Language, string ProfilePhotoKey, string LiveSelfieKey, string LicenseNumber, string PassportDocumentKey, string LicenseDocumentKey, VehicleDocumentRequest Vehicle);
public sealed record VehicleDocumentRequest(string Brand, string Model, string Color, int Year, string PlateNumber, int Seats, string TechnicalPassportKey, string FrontPhotoKey, string BackPhotoKey, string InteriorPhotoKey, string InsuranceDocumentKey);
public sealed record LoginRequest(string Phone, string Password);
public sealed record CurrentUserResponse(Guid Id, string Phone, string FirstName, string LastName, UserRole Role, string Language, string City);
