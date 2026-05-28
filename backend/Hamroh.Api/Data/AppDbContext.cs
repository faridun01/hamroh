using Hamroh.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Hamroh.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<PassengerProfile> PassengerProfiles => Set<PassengerProfile>();
    public DbSet<DriverProfile> DriverProfiles => Set<DriverProfile>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<PassengerRequest> PassengerRequests => Set<PassengerRequest>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Complaint> Complaints => Set<Complaint>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Penalty> Penalties => Set<Penalty>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<City> Cities => Set<City>();
    public DbSet<Domain.Route> Routes => Set<Domain.Route>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(x => x.Phone).IsUnique();
            entity.HasIndex(x => x.Role);
            entity.Property(x => x.Phone).HasMaxLength(32);
            entity.Property(x => x.PasswordHash).HasMaxLength(256);
        });

        modelBuilder.Entity<Trip>(entity =>
        {
            entity.HasIndex(x => new { x.FromCity, x.ToCity, x.DepartureDate, x.Status });
            entity.HasIndex(x => x.DriverId);
            entity.Property(x => x.PricePerSeat).HasPrecision(12, 2);
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasIndex(x => new { x.TripId, x.Status });
            entity.HasIndex(x => x.PassengerId);
            entity.Property(x => x.TotalPrice).HasPrecision(12, 2);
        });

        modelBuilder.Entity<PassengerRequest>(entity =>
        {
            entity.HasIndex(x => new { x.FromCity, x.ToCity, x.DepartureDate });
            entity.HasIndex(x => x.PassengerId);
            entity.HasIndex(x => x.AcceptedByDriverId);
            entity.Property(x => x.SuggestedPrice).HasPrecision(12, 2);
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasIndex(x => x.DriverId);
            entity.HasIndex(x => x.PlateNumber);
        });

        modelBuilder.Entity<DriverProfile>(entity =>
        {
            entity.HasIndex(x => x.UserId).IsUnique();
            entity.HasIndex(x => x.VerificationStatus);
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasIndex(x => new { x.BookingId, x.FromUserId }).IsUnique();
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasIndex(x => new { x.UserId, x.IsRead, x.CreatedAt });
        });

        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasIndex(x => new { x.BookingId, x.CreatedAt });
            entity.Property(x => x.Body).HasMaxLength(2000);
        });

        modelBuilder.Entity<Penalty>(entity =>
        {
            entity.HasIndex(x => new { x.PassengerId, x.IsPaid });
            entity.Property(x => x.Amount).HasPrecision(12, 2);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => new { x.ActorUserId, x.CreatedAt });
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        foreach (var entry in ChangeTracker.Entries<Entity>())
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
