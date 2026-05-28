using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Hamroh.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Features.Auth;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder group)
    {
        var auth = group.MapGroup("/auth").RequireRateLimiting("auth");
        auth.MapPost("/register/passenger", RegisterPassenger);
        auth.MapPost("/register/driver", RegisterDriver);
        auth.MapPost("/login", Login);
        auth.MapPost("/refresh", RefreshToken);
        return group;
    }

    private static async Task<IResult> RegisterPassenger(RegisterPassengerRequest request, AppDbContext db, PasswordHasher hasher, TokenService tokens, CancellationToken ct)
    {
        if (await db.Users.AnyAsync(x => x.Phone == request.Phone, ct))
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Phone already registered"));
        }

        var user = new User
        {
            Phone = request.Phone,
            PasswordHash = hasher.Hash(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Gender = request.Gender,
            Role = UserRole.Passenger,
            City = request.City ?? "",
            Language = request.Language
        };

        db.Users.Add(user);
        db.PassengerProfiles.Add(new PassengerProfile { User = user });
        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<AuthTokens>.Ok(tokens.CreateTokens(user)));
    }

    private static async Task<IResult> RegisterDriver(RegisterDriverRequest request, AppDbContext db, PasswordHasher hasher, CancellationToken ct)
    {
        if (await db.Users.AnyAsync(x => x.Phone == request.Phone, ct))
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Phone already registered"));
        }

        var user = new User
        {
            Phone = request.Phone,
            PasswordHash = hasher.Hash(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Gender = request.Gender,
            Role = UserRole.Driver,
            City = request.City ?? "",
            Language = request.Language
        };

        db.Users.Add(user);
        db.DriverProfiles.Add(new DriverProfile
        {
            User = user,
            VerificationStatus = VerificationStatus.PendingVerification,
            ProfilePhotoKey = request.ProfilePhotoKey,
            LiveSelfieKey = request.LiveSelfieKey,
            LicenseNumber = request.LicenseNumber,
            LicenseDocumentKey = request.LicenseDocumentKey,
            PassportDocumentKey = request.PassportDocumentKey
        });
        db.Vehicles.Add(new Vehicle
        {
            Driver = user,
            Brand = request.Vehicle.Brand,
            Model = request.Vehicle.Model,
            Color = request.Vehicle.Color,
            Year = request.Vehicle.Year,
            PlateNumber = request.Vehicle.PlateNumber,
            Seats = request.Vehicle.Seats,
            VerificationStatus = VerificationStatus.PendingVerification,
            TechnicalPassportKey = request.Vehicle.TechnicalPassportKey,
            FrontPhotoKey = request.Vehicle.FrontPhotoKey,
            BackPhotoKey = request.Vehicle.BackPhotoKey,
            InteriorPhotoKey = request.Vehicle.InteriorPhotoKey,
            InsuranceDocumentKey = request.Vehicle.InsuranceDocumentKey
        });

        await db.SaveChangesAsync(ct);
        return Results.Ok(ApiResponse<object>.Ok(new { status = VerificationStatus.PendingVerification }, "Driver profile submitted for verification"));
    }

    private static async Task<IResult> Login(LoginRequest request, AppDbContext db, PasswordHasher hasher, TokenService tokens, CancellationToken ct)
    {
        var user = await db.Users.SingleOrDefaultAsync(x => x.Phone == request.Phone && x.IsActive, ct);
        if (user is null || !hasher.Verify(request.Password, user.PasswordHash))
        {
            return Results.Unauthorized();
        }

        return Results.Ok(ApiResponse<AuthTokens>.Ok(tokens.CreateTokens(user)));
    }

    private static IResult RefreshToken()
    {
        return Results.Ok(ApiResponse<object>.Ok(new { }, "Refresh-token rotation endpoint placeholder"));
    }
}

public sealed record RegisterPassengerRequest(string Phone, string Password, string FirstName, string LastName, Gender Gender, string? City, string Language);
public sealed record RegisterDriverRequest(string Phone, string Password, string FirstName, string LastName, Gender Gender, string? City, string Language, string ProfilePhotoKey, string LiveSelfieKey, string LicenseNumber, string PassportDocumentKey, string LicenseDocumentKey, VehicleDocumentRequest Vehicle);
public sealed record VehicleDocumentRequest(string Brand, string Model, string Color, int Year, string PlateNumber, int Seats, string TechnicalPassportKey, string FrontPhotoKey, string BackPhotoKey, string InteriorPhotoKey, string InsuranceDocumentKey);
public sealed record LoginRequest(string Phone, string Password);
