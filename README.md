# Hamroh

Hamroh is an intercity ride-sharing product for Tajikistan. The repo now contains:

- `mobile/`: Flutter Android/iOS app skeleton using Clean Architecture and Riverpod.
- `backend/`: ASP.NET Core modular monolith API with PostgreSQL, Redis, JWT auth, RBAC, rate limits, health checks, and atomic booking acceptance.
- Root Vite prototype: existing visual simulator kept for continuity while production mobile/backend are developed.

## Local Development

Start infrastructure:

```bash
docker compose up -d postgres redis
```

Run backend:

```bash
dotnet run --project backend/Hamroh.Api/Hamroh.Api.csproj
```

Run Flutter:

```bash
cd mobile
flutter pub get
flutter run --dart-define=API_BASE_URL=http://localhost:8080/api/v1
```

Run existing web prototype:

```bash
npm install
npm run dev
```

## Production Principles

- Mobile app is UI only; backend controls booking, verification, penalties, contacts, and chat access.
- Seats are deducted only after driver acceptance inside a database transaction.
- Phone and car plate stay hidden until booking is accepted.
- Driver and vehicle verification are required before trip publishing.
- API is stateless and designed for load-balanced horizontal scaling.
- Secrets must come from environment variables or secret manager.

See:

- `docs/ARCHITECTURE.md`
- `docs/API_CONTRACT.md`
- `docs/TESTING.md`
