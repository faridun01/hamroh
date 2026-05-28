# Hamroh API Contract

All endpoints are versioned under `/api/v1`.

## Response Envelope

```json
{
  "success": true,
  "data": {},
  "message": "",
  "errors": []
}
```

## Error Envelope

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## Core Endpoints

- `POST /api/v1/auth/register/passenger`
- `POST /api/v1/auth/register/driver`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/trips`
- `POST /api/v1/trips`
- `POST /api/v1/trips/{tripId}/complete`
- `POST /api/v1/bookings`
- `POST /api/v1/bookings/{bookingId}/accept`
- `POST /api/v1/bookings/{bookingId}/reject`

Future modules should follow the same envelope and versioning:

- `/api/v1/users`
- `/api/v1/drivers`
- `/api/v1/vehicles`
- `/api/v1/passenger-requests`
- `/api/v1/chat`
- `/api/v1/reviews`
- `/api/v1/complaints`
- `/api/v1/notifications`
- `/api/v1/payments`
- `/api/v1/admin`
