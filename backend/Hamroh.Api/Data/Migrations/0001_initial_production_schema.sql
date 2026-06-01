CREATE TABLE IF NOT EXISTS "Users" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "Phone" varchar(32) NOT NULL,
    "PasswordHash" varchar(256) NOT NULL,
    "FirstName" text NOT NULL,
    "LastName" text NOT NULL,
    "Gender" integer NOT NULL,
    "Role" integer NOT NULL,
    "Language" text NOT NULL,
    "City" text NOT NULL,
    "IsActive" boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "PassengerProfiles" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "UserId" uuid NOT NULL REFERENCES "Users"("Id"),
    "Rating" numeric(12,2) NOT NULL DEFAULT 0,
    "TotalTrips" integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "DriverProfiles" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "UserId" uuid NOT NULL REFERENCES "Users"("Id"),
    "VerificationStatus" integer NOT NULL,
    "VerificationReason" text NOT NULL DEFAULT '',
    "ProfilePhotoKey" text NOT NULL DEFAULT '',
    "LiveSelfieKey" text NOT NULL DEFAULT '',
    "LicenseNumber" text NOT NULL,
    "LicenseDocumentKey" text NOT NULL,
    "PassportDocumentKey" text NOT NULL,
    "Rating" numeric(12,2) NOT NULL DEFAULT 0,
    "TotalTrips" integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "Vehicles" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "DriverId" uuid NOT NULL REFERENCES "Users"("Id"),
    "Brand" text NOT NULL,
    "Model" text NOT NULL,
    "Color" text NOT NULL,
    "Year" integer NOT NULL,
    "PlateNumber" text NOT NULL,
    "Seats" integer NOT NULL,
    "VerificationStatus" integer NOT NULL,
    "VerificationReason" text NOT NULL DEFAULT '',
    "TechnicalPassportKey" text NOT NULL DEFAULT '',
    "FrontPhotoKey" text NOT NULL DEFAULT '',
    "BackPhotoKey" text NOT NULL DEFAULT '',
    "InteriorPhotoKey" text NOT NULL DEFAULT '',
    "InsuranceDocumentKey" text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS "Trips" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "DriverId" uuid NOT NULL REFERENCES "Users"("Id"),
    "VehicleId" uuid NOT NULL REFERENCES "Vehicles"("Id"),
    "FromCity" text NOT NULL,
    "ToCity" text NOT NULL,
    "DepartureDate" date NOT NULL,
    "DepartureTime" time NOT NULL,
    "PickupPoint" text NOT NULL,
    "PickupLatitude" double precision NULL,
    "PickupLongitude" double precision NULL,
    "DropoffPoint" text NOT NULL,
    "DropoffLatitude" double precision NULL,
    "DropoffLongitude" double precision NULL,
    "PricePerSeat" numeric(12,2) NOT NULL,
    "TotalSeats" integer NOT NULL,
    "AvailableSeats" integer NOT NULL,
    "Status" integer NOT NULL,
    "AllowBaggage" boolean NOT NULL,
    "WomenFriendly" boolean NOT NULL,
    "DriverComment" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "Bookings" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "TripId" uuid NOT NULL REFERENCES "Trips"("Id"),
    "PassengerId" uuid NOT NULL REFERENCES "Users"("Id"),
    "SeatsCount" integer NOT NULL,
    "TotalPrice" numeric(12,2) NOT NULL,
    "Status" integer NOT NULL,
    "PassengerMessage" text NOT NULL,
    "PassengerFinalConfirmedAt" timestamptz NULL,
    "DriverFinalConfirmedAt" timestamptz NULL
);

CREATE TABLE IF NOT EXISTS "PassengerRequests" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "PassengerId" uuid NOT NULL REFERENCES "Users"("Id"),
    "FromCity" text NOT NULL,
    "ToCity" text NOT NULL,
    "PickupAddress" text NOT NULL,
    "PickupLatitude" double precision NULL,
    "PickupLongitude" double precision NULL,
    "DropoffPoint" text NOT NULL DEFAULT '',
    "DropoffLatitude" double precision NULL,
    "DropoffLongitude" double precision NULL,
    "DepartureDate" date NOT NULL,
    "DepartureTime" time NOT NULL,
    "SeatsCount" integer NOT NULL,
    "SuggestedPrice" numeric(12,2) NOT NULL,
    "Comment" text NOT NULL,
    "HasBaggage" boolean NOT NULL DEFAULT false,
    "PreferredDriverGender" integer NULL,
    "AcceptedByDriverId" uuid NULL REFERENCES "Users"("Id"),
    "OfferedTripId" uuid NULL REFERENCES "Trips"("Id"),
    "BookingId" uuid NULL REFERENCES "Bookings"("Id"),
    "PassengerConfirmedDriver" boolean NOT NULL DEFAULT false,
    "Status" text NOT NULL DEFAULT 'Open'
);

CREATE TABLE IF NOT EXISTS "ChatMessages" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "BookingId" uuid NOT NULL REFERENCES "Bookings"("Id"),
    "SenderId" uuid NOT NULL REFERENCES "Users"("Id"),
    "Body" varchar(2000) NOT NULL,
    "IsArchived" boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "Reviews" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "BookingId" uuid NOT NULL REFERENCES "Bookings"("Id"),
    "FromUserId" uuid NOT NULL REFERENCES "Users"("Id"),
    "ToUserId" uuid NOT NULL REFERENCES "Users"("Id"),
    "Stars" integer NOT NULL,
    "Safety" integer NULL,
    "Punctuality" integer NULL,
    "Cleanliness" integer NULL,
    "Politeness" integer NULL,
    "Comment" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "Complaints" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "UserId" uuid NOT NULL REFERENCES "Users"("Id"),
    "BookingId" uuid NULL REFERENCES "Bookings"("Id"),
    "Type" text NOT NULL,
    "Description" text NOT NULL,
    "Status" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "Notifications" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "UserId" uuid NOT NULL REFERENCES "Users"("Id"),
    "Title" text NOT NULL,
    "Message" text NOT NULL,
    "Type" text NOT NULL,
    "BookingId" uuid NULL REFERENCES "Bookings"("Id"),
    "TripId" uuid NULL REFERENCES "Trips"("Id"),
    "IsRead" boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "DevicePushTokens" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "UserId" uuid NOT NULL REFERENCES "Users"("Id"),
    "Token" varchar(512) NOT NULL,
    "Platform" varchar(32) NOT NULL,
    "DeviceId" varchar(128) NOT NULL DEFAULT '',
    "IsActive" boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "UploadedDocuments" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "UserId" uuid NULL REFERENCES "Users"("Id"),
    "StorageKey" varchar(256) NOT NULL,
    "OriginalFileName" varchar(256) NOT NULL,
    "ContentType" varchar(128) NOT NULL,
    "SizeBytes" bigint NOT NULL,
    "Purpose" varchar(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Penalties" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "PassengerId" uuid NOT NULL REFERENCES "Users"("Id"),
    "BookingId" uuid NOT NULL REFERENCES "Bookings"("Id"),
    "Amount" numeric(12,2) NOT NULL,
    "IsPaid" boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "Payments" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "UserId" uuid NOT NULL REFERENCES "Users"("Id"),
    "BookingId" uuid NULL REFERENCES "Bookings"("Id"),
    "PenaltyId" uuid NULL REFERENCES "Penalties"("Id"),
    "Amount" numeric(12,2) NOT NULL,
    "Status" text NOT NULL,
    "Provider" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "Cities" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "NameRu" text NOT NULL,
    "NameTj" text NOT NULL,
    "NameEn" text NOT NULL,
    "IsActive" boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "Routes" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "FromCityId" uuid NOT NULL REFERENCES "Cities"("Id"),
    "ToCityId" uuid NOT NULL REFERENCES "Cities"("Id"),
    "RecommendedMinPrice" numeric(12,2) NOT NULL,
    "RecommendedMaxPrice" numeric(12,2) NOT NULL,
    "IsActive" boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "AuditLogs" (
    "Id" bigserial PRIMARY KEY,
    "ActorUserId" uuid NULL,
    "Action" text NOT NULL,
    "EntityType" text NOT NULL,
    "EntityId" uuid NULL,
    "CreatedAt" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "UserRefreshTokens" (
    "Id" uuid PRIMARY KEY,
    "CreatedAt" timestamptz NOT NULL,
    "UpdatedAt" timestamptz NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "UserId" uuid NOT NULL REFERENCES "Users"("Id"),
    "Token" text NOT NULL,
    "ExpiresAt" timestamptz NOT NULL,
    "IsRevoked" boolean NOT NULL DEFAULT false
);

CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_Phone" ON "Users"("Phone");
CREATE INDEX IF NOT EXISTS "IX_Users_Role" ON "Users"("Role");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_DriverProfiles_UserId" ON "DriverProfiles"("UserId");
CREATE INDEX IF NOT EXISTS "IX_DriverProfiles_VerificationStatus" ON "DriverProfiles"("VerificationStatus");
CREATE INDEX IF NOT EXISTS "IX_Vehicles_DriverId" ON "Vehicles"("DriverId");
CREATE INDEX IF NOT EXISTS "IX_Vehicles_PlateNumber" ON "Vehicles"("PlateNumber");
CREATE INDEX IF NOT EXISTS "IX_Trips_Search" ON "Trips"("FromCity", "ToCity", "DepartureDate", "Status");
CREATE INDEX IF NOT EXISTS "IX_Trips_DriverId" ON "Trips"("DriverId");
CREATE INDEX IF NOT EXISTS "IX_Bookings_Trip_Status" ON "Bookings"("TripId", "Status");
CREATE INDEX IF NOT EXISTS "IX_Bookings_PassengerId" ON "Bookings"("PassengerId");
CREATE INDEX IF NOT EXISTS "IX_PassengerRequests_Search" ON "PassengerRequests"("FromCity", "ToCity", "DepartureDate");
CREATE INDEX IF NOT EXISTS "IX_PassengerRequests_PassengerId" ON "PassengerRequests"("PassengerId");
CREATE INDEX IF NOT EXISTS "IX_PassengerRequests_AcceptedByDriverId" ON "PassengerRequests"("AcceptedByDriverId");
CREATE INDEX IF NOT EXISTS "IX_PassengerRequests_OfferedTripId" ON "PassengerRequests"("OfferedTripId");
CREATE INDEX IF NOT EXISTS "IX_ChatMessages_Booking_CreatedAt" ON "ChatMessages"("BookingId", "CreatedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Reviews_Booking_FromUser" ON "Reviews"("BookingId", "FromUserId");
CREATE INDEX IF NOT EXISTS "IX_Notifications_User_Read_CreatedAt" ON "Notifications"("UserId", "IsRead", "CreatedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_DevicePushTokens_Token" ON "DevicePushTokens"("Token");
CREATE INDEX IF NOT EXISTS "IX_DevicePushTokens_User_Active" ON "DevicePushTokens"("UserId", "IsActive");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_UploadedDocuments_StorageKey" ON "UploadedDocuments"("StorageKey");
CREATE INDEX IF NOT EXISTS "IX_UploadedDocuments_User_Purpose" ON "UploadedDocuments"("UserId", "Purpose");
CREATE INDEX IF NOT EXISTS "IX_Penalties_Passenger_IsPaid" ON "Penalties"("PassengerId", "IsPaid");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Payments_PenaltyId" ON "Payments"("PenaltyId") WHERE "PenaltyId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IX_AuditLogs_Actor_CreatedAt" ON "AuditLogs"("ActorUserId", "CreatedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_UserRefreshTokens_Token" ON "UserRefreshTokens"("Token");
CREATE INDEX IF NOT EXISTS "IX_UserRefreshTokens_UserId" ON "UserRefreshTokens"("UserId");
