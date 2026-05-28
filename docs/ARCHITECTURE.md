# Hamroh Production Architecture

Hamroh is structured as a mobile-first product with a thin Flutter client and a backend-controlled business domain.

## Main Decisions

- Mobile: Flutter, Dart, Riverpod, Clean Architecture, feature folders.
- Backend: ASP.NET Core modular monolith, PostgreSQL, EF Core, Redis.
- Deployment: Docker-ready, stateless API, environment-driven config.
- API style: REST, versioned under `/api/v1`.
- Security: JWT access tokens, refresh tokens, role policies, rate limits, audit logs.

## Mobile Modules

- `core`: config, networking, secure storage, connectivity, error handling.
- `auth`: login, registration, token lifecycle.
- `passenger`: passenger shell and ride discovery.
- `driver`: driver dashboard, trip creation, passenger requests.
- `trips`: trip search and trip details.
- `bookings`: booking confirmation and booking lifecycle.
- `chat`: accepted-booking-only messaging.
- `reviews`, `complaints`, `notifications`, `profile`, `localization`, `shared`.

The mobile app must not enforce final business rules alone. It can hide buttons and improve UX, but the backend is the source of truth.

## Backend Modules

- Auth
- Users
- Drivers
- Vehicles
- Trips
- Bookings
- Passenger Requests
- Chat
- Reviews
- Complaints
- Notifications
- Payments and Penalties
- Admin and Moderator

The backend starts as a modular monolith. Module boundaries are kept explicit so high-traffic modules can later move into separate services.

## Critical Business Rules

- Driver must be verified before creating trips.
- Vehicle must be verified before publishing trips.
- Passenger can browse with unpaid penalty but cannot book.
- Booking starts as `Pending`.
- Seats are deducted only when the driver accepts.
- Seat deduction is atomic inside a PostgreSQL transaction and row lock.
- Phone and car plate are hidden until booking is accepted.
- Chat is available only for active accepted bookings.
- Completed trips enable reviews and archive chat.
- Driver cannot create a new active trip until the current one is completed or cancelled.

## Scaling Path

- Put API behind a load balancer.
- Keep API stateless.
- Use Redis for city, route, popular trip, and short-lived query caches.
- Use queue workers for push notifications, SMS/OTP, image/document processing, reports, and audit events.
- Store uploaded documents in private object storage with signed URLs.
- Add PostgreSQL read replicas for heavy search/reporting.
- Put public images behind CDN; keep documents private.

## Security Baseline

- HTTPS only in production.
- No secrets in source code.
- Passwords hashed with BCrypt.
- Short-lived access tokens.
- Refresh tokens stored securely and rotated.
- Mobile tokens stored in secure storage.
- Rate limiting on auth, booking, chat, complaints, and OTP.
- DTOs only; never return raw entities.
- Audit logs for admin, verification, booking acceptance, penalty, and sensitive profile actions.
