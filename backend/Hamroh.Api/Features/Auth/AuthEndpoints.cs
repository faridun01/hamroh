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
        return group;
    }

    private static async Task<IResult> SendOtp(SendOtpRequest request, IConnectionMultiplexer redis)
    {
        var code = Random.Shared.Next(1000, 9999).ToString();
        // In real life, integrate SMS gateway here. For MVP, we write to console/log.
        Console.WriteLine($"[SMS MOCK] OTP for {request.Phone} is {code}");
        var db = redis.GetDatabase();
        await db.StringSetAsync($"otp:{request.Phone}", code, TimeSpan.FromMinutes(3));
        return Results.Ok(ApiResponse<object>.Ok(new { }, "OTP sent via SMS"));
    }

    private static async Task<IResult> RegisterPassenger(RegisterPassengerRequest request, AppDbContext db, PasswordHasher hasher, TokenService tokens, IConnectionMultiplexer redis, CancellationToken ct)
    {
        var rdb = redis.GetDatabase();
        var cachedOtp = await rdb.StringGetAsync($"otp:{request.Phone}");
        if (cachedOtp != request.OtpCode) return Results.BadRequest(ApiResponse<object>.Fail("Invalid or expired OTP"));

        if (await db.Users.AnyAsync(x => x.Phone == request.Phone, ct))
            return Results.BadRequest(ApiResponse<object>.Fail("Phone already registered"));

        var user = new User
        {
            Phone = request.Phone, PasswordHash = hasher.Hash(request.Password),
            FirstName = request.FirstName, LastName = request.LastName,
            Gender = request.Gender, Role = UserRole.Passenger,
            City = request.City ?? "", Language = request.Language
        };

        db.Users.Add(user);
        db.PassengerProfiles.Add(new PassengerProfile { User = user });
        
        var t = tokens.CreateTokens(user);
        db.UserRefreshTokens.Add(new UserRefreshToken { UserId = user.Id, Token = t.RefreshToken, ExpiresAt = DateTime.UtcNow.AddDays(30) });
        
        await db.SaveChangesAsync(ct);
        await rdb.KeyDeleteAsync($"otp:{request.Phone}");
        return Results.Ok(ApiResponse<AuthTokens>.Ok(t));
    }

    private static async Task<IResult> RegisterDriver(RegisterDriverRequest request, AppDbContext db, PasswordHasher hasher, TokenService tokens, IConnectionMultiplexer redis, CancellationToken ct)
    {
        var rdb = redis.GetDatabase();
        var cachedOtp = await rdb.StringGetAsync($"otp:{request.Phone}");
        if (cachedOtp != request.OtpCode) return Results.BadRequest(ApiResponse<object>.Fail("Invalid or expired OTP"));

        if (await db.Users.AnyAsync(x => x.Phone == request.Phone, ct))
            return Results.BadRequest(ApiResponse<object>.Fail("Phone already registered"));

        var user = new User
        {
            Phone = request.Phone, PasswordHash = hasher.Hash(request.Password),
            FirstName = request.FirstName, LastName = request.LastName,
            Gender = request.Gender, Role = UserRole.Driver,
            City = request.City ?? "", Language = request.Language
        };

        db.Users.Add(user);
        db.DriverProfiles.Add(new DriverProfile
        {
            User = user, VerificationStatus = VerificationStatus.PendingVerification,
            ProfilePhotoKey = request.ProfilePhotoKey, LiveSelfieKey = request.LiveSelfieKey,
            LicenseNumber = request.LicenseNumber, LicenseDocumentKey = request.LicenseDocumentKey,
            PassportDocumentKey = request.PassportDocumentKey
        });
        db.Vehicles.Add(new Vehicle
        {
            Driver = user, Brand = request.Vehicle.Brand, Model = request.Vehicle.Model,
            Color = request.Vehicle.Color, Year = request.Vehicle.Year,
            PlateNumber = request.Vehicle.PlateNumber, Seats = request.Vehicle.Seats,
            VerificationStatus = VerificationStatus.PendingVerification,
            TechnicalPassportKey = request.Vehicle.TechnicalPassportKey,
            FrontPhotoKey = request.Vehicle.FrontPhotoKey, BackPhotoKey = request.Vehicle.BackPhotoKey,
            InteriorPhotoKey = request.Vehicle.InteriorPhotoKey, InsuranceDocumentKey = request.Vehicle.InsuranceDocumentKey
        });

        var t = tokens.CreateTokens(user);
        db.UserRefreshTokens.Add(new UserRefreshToken { UserId = user.Id, Token = t.RefreshToken, ExpiresAt = DateTime.UtcNow.AddDays(30) });

        await db.SaveChangesAsync(ct);
        await rdb.KeyDeleteAsync($"otp:{request.Phone}");
        return Results.Ok(ApiResponse<AuthTokens>.Ok(t));
    }

    private static async Task<IResult> Login(LoginRequest request, AppDbContext db, PasswordHasher hasher, TokenService tokens, CancellationToken ct)
    {
        var user = await db.Users.SingleOrDefaultAsync(x => x.Phone == request.Phone && x.IsActive, ct);
        if (user is null || !hasher.Verify(request.Password, user.PasswordHash))
            return Results.Unauthorized();

        var t = tokens.CreateTokens(user);
        db.UserRefreshTokens.Add(new UserRefreshToken { UserId = user.Id, Token = t.RefreshToken, ExpiresAt = DateTime.UtcNow.AddDays(30) });
        await db.SaveChangesAsync(ct);

        return Results.Ok(ApiResponse<AuthTokens>.Ok(t));
    }

    private static async Task<IResult> RefreshToken(RefreshRequest request, AppDbContext db, TokenService tokens, CancellationToken ct)
    {
        var rt = await db.UserRefreshTokens
            .Include(x => x.User)
            .SingleOrDefaultAsync(x => x.Token == request.RefreshToken && !x.IsRevoked && x.ExpiresAt > DateTime.UtcNow, ct);

        if (rt is null || !rt.User.IsActive)
            return Results.Unauthorized();

        rt.IsRevoked = true;
        
        var t = tokens.CreateTokens(rt.User);
        db.UserRefreshTokens.Add(new UserRefreshToken { UserId = rt.UserId, Token = t.RefreshToken, ExpiresAt = DateTime.UtcNow.AddDays(30) });
        await db.SaveChangesAsync(ct);

        return Results.Ok(ApiResponse<AuthTokens>.Ok(t));
    }
}

public sealed record SendOtpRequest(string Phone);
public sealed record RefreshRequest(string RefreshToken);
public sealed record RegisterPassengerRequest(string Phone, string OtpCode, string Password, string FirstName, string LastName, Gender Gender, string? City, string Language);
public sealed record RegisterDriverRequest(string Phone, string OtpCode, string Password, string FirstName, string LastName, Gender Gender, string? City, string Language, string ProfilePhotoKey, string LiveSelfieKey, string LicenseNumber, string PassportDocumentKey, string LicenseDocumentKey, VehicleDocumentRequest Vehicle);
public sealed record VehicleDocumentRequest(string Brand, string Model, string Color, int Year, string PlateNumber, int Seats, string TechnicalPassportKey, string FrontPhotoKey, string BackPhotoKey, string InteriorPhotoKey, string InsuranceDocumentKey);
public sealed record LoginRequest(string Phone, string Password);
