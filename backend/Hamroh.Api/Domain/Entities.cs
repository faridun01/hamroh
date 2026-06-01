namespace Hamroh.Api.Domain;

public enum UserRole { Passenger, Driver, Admin, Moderator }
public enum Gender { Male, Female }
public enum VerificationStatus { PendingVerification, Verified, Rejected, Suspended, Banned }
public enum TripStatus { Draft, Published, Full, Started, Completed, Cancelled, Disputed, Blocked }
public enum BookingStatus { Pending, Accepted, Rejected, CancelledByPassenger, CancelledByDriver, Completed, NoShowPassenger, NoShowDriver, Disputed }

public abstract class Entity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; }
}

public sealed class User : Entity
{
    public string Phone { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public Gender Gender { get; set; }
    public UserRole Role { get; set; }
    public string Language { get; set; } = "ru";
    public string City { get; set; } = "";
    public bool IsActive { get; set; } = true;
}

public sealed class DriverProfile : Entity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.PendingVerification;
    public string VerificationReason { get; set; } = "";
    public string ProfilePhotoKey { get; set; } = "";
    public string LiveSelfieKey { get; set; } = "";
    public string LicenseNumber { get; set; } = "";
    public string LicenseDocumentKey { get; set; } = "";
    public string PassportDocumentKey { get; set; } = "";
    public decimal Rating { get; set; }
    public int TotalTrips { get; set; }
}

public sealed class PassengerProfile : Entity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public decimal Rating { get; set; }
    public int TotalTrips { get; set; }
}

public sealed class Vehicle : Entity
{
    public Guid DriverId { get; set; }
    public User Driver { get; set; } = null!;
    public string Brand { get; set; } = "";
    public string Model { get; set; } = "";
    public string Color { get; set; } = "";
    public int Year { get; set; }
    public string PlateNumber { get; set; } = "";
    public int Seats { get; set; }
    public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.PendingVerification;
    public string VerificationReason { get; set; } = "";
    public string TechnicalPassportKey { get; set; } = "";
    public string FrontPhotoKey { get; set; } = "";
    public string BackPhotoKey { get; set; } = "";
    public string InteriorPhotoKey { get; set; } = "";
    public string InsuranceDocumentKey { get; set; } = "";
}

public sealed class Trip : Entity
{
    public Guid DriverId { get; set; }
    public User Driver { get; set; } = null!;
    public Guid VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = null!;
    public string FromCity { get; set; } = "";
    public string ToCity { get; set; } = "";
    public DateOnly DepartureDate { get; set; }
    public TimeOnly DepartureTime { get; set; }
    public string PickupPoint { get; set; } = "";
    public double? PickupLatitude { get; set; }
    public double? PickupLongitude { get; set; }
    public string DropoffPoint { get; set; } = "";
    public double? DropoffLatitude { get; set; }
    public double? DropoffLongitude { get; set; }
    public decimal PricePerSeat { get; set; }
    public int TotalSeats { get; set; }
    public int AvailableSeats { get; set; }
    public TripStatus Status { get; set; } = TripStatus.Published;
    public bool AllowBaggage { get; set; }
    public bool WomenFriendly { get; set; }
    public string DriverComment { get; set; } = "";
}

public sealed class Booking : Entity
{
    public Guid TripId { get; set; }
    public Trip Trip { get; set; } = null!;
    public Guid PassengerId { get; set; }
    public User Passenger { get; set; } = null!;
    public int SeatsCount { get; set; }
    public decimal TotalPrice { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public string PassengerMessage { get; set; } = "";
    public DateTime? PassengerFinalConfirmedAt { get; set; }
    public DateTime? DriverFinalConfirmedAt { get; set; }
}

public sealed class PassengerRequest : Entity
{
    public Guid PassengerId { get; set; }
    public User Passenger { get; set; } = null!;
    public string FromCity { get; set; } = "";
    public string ToCity { get; set; } = "";
    public string PickupAddress { get; set; } = "";
    public double? PickupLatitude { get; set; }
    public double? PickupLongitude { get; set; }
    public string DropoffPoint { get; set; } = "";
    public double? DropoffLatitude { get; set; }
    public double? DropoffLongitude { get; set; }
    public DateOnly DepartureDate { get; set; }
    public TimeOnly DepartureTime { get; set; }
    public int SeatsCount { get; set; }
    public decimal SuggestedPrice { get; set; }
    public string Comment { get; set; } = "";
    public bool HasBaggage { get; set; }
    public Gender? PreferredDriverGender { get; set; }
    public Guid? AcceptedByDriverId { get; set; }
    public User? AcceptedByDriver { get; set; }
    public Guid? OfferedTripId { get; set; }
    public Trip? OfferedTrip { get; set; }
    public Guid? BookingId { get; set; }
    public bool PassengerConfirmedDriver { get; set; }
    public string Status { get; set; } = "Open";
}

public sealed class ChatMessage : Entity
{
    public Guid BookingId { get; set; }
    public Guid SenderId { get; set; }
    public string Body { get; set; } = "";
    public bool IsArchived { get; set; }
}

public sealed class Review : Entity
{
    public Guid BookingId { get; set; }
    public Guid FromUserId { get; set; }
    public Guid ToUserId { get; set; }
    public int Stars { get; set; }
    public int? Safety { get; set; }
    public int? Punctuality { get; set; }
    public int? Cleanliness { get; set; }
    public int? Politeness { get; set; }
    public string Comment { get; set; } = "";
}

public sealed class Complaint : Entity
{
    public Guid UserId { get; set; }
    public Guid? BookingId { get; set; }
    public string Type { get; set; } = "";
    public string Description { get; set; } = "";
    public string Status { get; set; } = "Open";
}

public sealed class Notification : Entity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = "";
    public string Message { get; set; } = "";
    public string Type { get; set; } = "";
    public Guid? BookingId { get; set; }
    public Guid? TripId { get; set; }
    public bool IsRead { get; set; }
}

public sealed class DevicePushToken : Entity
{
    public Guid UserId { get; set; }
    public string Token { get; set; } = "";
    public string Platform { get; set; } = "";
    public string DeviceId { get; set; } = "";
    public bool IsActive { get; set; } = true;
}

public sealed class UploadedDocument : Entity
{
    public Guid? UserId { get; set; }
    public string StorageKey { get; set; } = "";
    public string OriginalFileName { get; set; } = "";
    public string ContentType { get; set; } = "";
    public long SizeBytes { get; set; }
    public string Purpose { get; set; } = "";
}

public sealed class Penalty : Entity
{
    public Guid PassengerId { get; set; }
    public Guid BookingId { get; set; }
    public decimal Amount { get; set; }
    public bool IsPaid { get; set; }
}

public sealed class Payment : Entity
{
    public Guid UserId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? PenaltyId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = "Pending";
    public string Provider { get; set; } = "Cash";
}

public sealed class City : Entity
{
    public string NameRu { get; set; } = "";
    public string NameTj { get; set; } = "";
    public string NameEn { get; set; } = "";
    public bool IsActive { get; set; } = true;
}

public sealed class Route : Entity
{
    public Guid FromCityId { get; set; }
    public Guid ToCityId { get; set; }
    public decimal RecommendedMinPrice { get; set; }
    public decimal RecommendedMaxPrice { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class AuditLog
{
    public long Id { get; set; }
    public Guid? ActorUserId { get; set; }
    public string Action { get; set; } = "";
    public string EntityType { get; set; } = "";
    public Guid? EntityId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class UserRefreshToken : Entity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Token { get; set; } = "";
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
}
