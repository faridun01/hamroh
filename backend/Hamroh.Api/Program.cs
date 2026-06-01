using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Hamroh.Api.Common;
using Hamroh.Api.Data;
using Hamroh.Api.Features.Admin;
using Hamroh.Api.Features.Auth;
using Hamroh.Api.Features.Bookings;
using Hamroh.Api.Features.Chat;
using Hamroh.Api.Features.Complaints;
using Hamroh.Api.Features.Drivers;
using Hamroh.Api.Features.Notifications;
using Hamroh.Api.Features.PassengerRequests;
using Hamroh.Api.Features.Penalties;
using Hamroh.Api.Features.Payments;
using Hamroh.Api.Features.Reviews;
using Hamroh.Api.Features.Trips;
using Hamroh.Api.Features.Uploads;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, config) =>
{
    config.ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console();
});

var connectionString = builder.Configuration.GetConnectionString("Postgres")
    ?? throw new InvalidOperationException("Missing Postgres connection string.");
var redisConnection = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Missing Jwt:Secret.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddSingleton<IConnectionMultiplexer>(_ => ConnectionMultiplexer.Connect(redisConnection));
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<PasswordHasher>();
builder.Services.AddScoped<AuditLogger>();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));
builder.Services.AddGrpc();

builder.Services.AddCors(options =>
{
    options.AddPolicy("mobile", policy => policy
        .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [])
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth", httpContext => RateLimitPartition.GetFixedWindowLimiter(
        httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 10,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        }));
    options.AddPolicy("sensitive", httpContext => RateLimitPartition.GetFixedWindowLimiter(
        httpContext.User.Identity?.Name ?? httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 30,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        }));
    options.AddPolicy("token_bucket", httpContext => RateLimitPartition.GetTokenBucketLimiter(
        httpContext.User.Identity?.Name ?? httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new TokenBucketRateLimiterOptions
        {
            TokenLimit = 20,
            QueueLimit = 0,
            ReplenishmentPeriod = TimeSpan.FromSeconds(10),
            TokensPerPeriod = 5,
            AutoReplenishment = true
        }));
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("PassengerOnly", policy => policy.RequireRole("Passenger"));
    options.AddPolicy("DriverOnly", policy => policy.RequireRole("Driver"));
    options.AddPolicy("ModeratorOnly", policy => policy.RequireRole("Admin", "Moderator"));
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString)
    .AddRedis(redisConnection);

builder.Services.AddSignalR();
builder.Services.AddSingleton<Hamroh.Api.BackgroundServices.NotificationQueue>();
builder.Services.AddHostedService<Hamroh.Api.BackgroundServices.NotificationWorker>();

var app = builder.Build();

app.UseMiddleware<ApiExceptionMiddleware>();
app.UseSerilogRequestLogging(options =>
{
    options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode}";
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseCors("mobile");
app.UseRateLimiter();
app.UseAuthentication();
app.UseMiddleware<ActiveUserMiddleware>();
app.UseAuthorization();

app.MapHealthChecks("/health");

var v1 = app.MapGroup("/api/v1");
v1.MapAuthEndpoints();
v1.MapUploadEndpoints();
v1.MapDriverEndpoints();
v1.MapTripEndpoints();
v1.MapBookingEndpoints();
v1.MapPassengerRequestEndpoints();
v1.MapChatEndpoints();
v1.MapReviewEndpoints();
v1.MapComplaintEndpoints();
v1.MapNotificationEndpoints();
v1.MapPenaltyEndpoints();
v1.MapPaymentEndpoints();
v1.MapAdminEndpoints();
v1.MapAdminManagementEndpoints();

app.MapHub<ChatHub>("/chat-hub");
app.MapGrpcService<TripGrpcService>();

app.Run();
