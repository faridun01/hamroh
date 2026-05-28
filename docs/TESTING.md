# Hamroh Testing Strategy

## Mobile

- Unit tests for price calculation, form validation, token storage wrappers.
- Widget tests for login, search, booking confirmation, driver verification.
- Integration tests for register/login/search/book/accept/review flows.

## Backend

- Unit tests for service rules.
- Integration tests for API endpoints.
- Transaction tests for booking acceptance and overbooking prevention.
- Authorization tests for Passenger, Driver, Moderator, Admin.
- Penalty tests for no-show booking blocks.

## Critical Cases

1. Passenger can register and login.
2. Driver registers but cannot create trip before verification.
3. Admin approves driver and vehicle.
4. Verified driver creates trip.
5. Passenger books seats.
6. Driver accepts booking.
7. Seats decrease correctly.
8. Overbooking is impossible.
9. Phone and plate are hidden before acceptance.
10. Chat opens only after acceptance.
11. Passenger no-show creates penalty.
12. Passenger cannot book until penalty is paid.
13. Driver cannot create a new trip before completing current trip.
14. Completed trip enables review.
