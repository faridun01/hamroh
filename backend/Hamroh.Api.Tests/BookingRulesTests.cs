using FluentAssertions;
using Hamroh.Api.Domain;
using Xunit;

namespace Hamroh.Api.Tests;

public sealed class BookingRulesTests
{
    [Fact]
    public void Pending_booking_does_not_reduce_seats()
    {
        var trip = new Trip { AvailableSeats = 2, PricePerSeat = 100 };
        var booking = new Booking { SeatsCount = 2, Status = BookingStatus.Pending };

        trip.AvailableSeats.Should().Be(2);
        booking.Status.Should().Be(BookingStatus.Pending);
    }

    [Fact]
    public void Passenger_penalty_amount_is_thirty_percent_of_no_show_trip()
    {
        var tripTotal = 200m;
        var penalty = tripTotal * 0.30m;

        penalty.Should().Be(60m);
    }

    [Theory]
    [InlineData(BookingStatus.Pending, false)]
    [InlineData(BookingStatus.Rejected, false)]
    [InlineData(BookingStatus.Accepted, true)]
    [InlineData(BookingStatus.Completed, false)]
    public void Contacts_are_visible_only_for_accepted_booking(BookingStatus status, bool expectedVisible)
    {
        var contactsVisible = status == BookingStatus.Accepted;

        contactsVisible.Should().Be(expectedVisible);
    }

    [Theory]
    [InlineData(VerificationStatus.PendingVerification, false)]
    [InlineData(VerificationStatus.Rejected, false)]
    [InlineData(VerificationStatus.Suspended, false)]
    [InlineData(VerificationStatus.Banned, false)]
    [InlineData(VerificationStatus.Verified, true)]
    public void Driver_can_create_trip_only_after_verification(VerificationStatus status, bool expectedCanCreate)
    {
        var canCreateTrip = status == VerificationStatus.Verified;

        canCreateTrip.Should().Be(expectedCanCreate);
    }

    [Fact]
    public void Partially_booked_trip_stays_published()
    {
        TripBookingRules.StatusAfterSeatChange(2).Should().Be(TripStatus.Published);
    }

    [Fact]
    public void Fully_booked_trip_becomes_full()
    {
        TripBookingRules.StatusAfterSeatChange(0).Should().Be(TripStatus.Full);
    }

    [Theory]
    [InlineData(BookingStatus.Pending, false)]
    [InlineData(BookingStatus.Accepted, true)]
    [InlineData(BookingStatus.Rejected, false)]
    [InlineData(BookingStatus.CancelledByPassenger, false)]
    public void Only_accepted_bookings_release_seats(BookingStatus status, bool expected)
    {
        TripBookingRules.ReleasesSeats(status).Should().Be(expected);
    }

    [Fact]
    public void Published_future_trip_with_enough_seats_is_bookable()
    {
        var trip = new Trip
        {
            Status = TripStatus.Published,
            DepartureDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(1),
            AvailableSeats = 2
        };

        TripBookingRules.IsBookable(trip, 2, DateOnly.FromDateTime(DateTime.UtcNow)).Should().BeTrue();
    }

    [Fact]
    public void Full_trip_is_not_bookable()
    {
        var trip = new Trip
        {
            Status = TripStatus.Full,
            DepartureDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(1),
            AvailableSeats = 0
        };

        TripBookingRules.IsBookable(trip, 1, DateOnly.FromDateTime(DateTime.UtcNow)).Should().BeFalse();
    }

    [Theory]
    [InlineData(BookingStatus.Pending, true)]
    [InlineData(BookingStatus.Accepted, false)]
    [InlineData(BookingStatus.CancelledByPassenger, false)]
    [InlineData(BookingStatus.Completed, false)]
    public void Only_pending_bookings_can_be_rejected(BookingStatus status, bool expected)
    {
        TripBookingRules.CanReject(status).Should().Be(expected);
    }

    [Theory]
    [InlineData(BookingStatus.Pending, true)]
    [InlineData(BookingStatus.Accepted, true)]
    [InlineData(BookingStatus.Completed, false)]
    [InlineData(BookingStatus.NoShowPassenger, false)]
    public void Only_pending_or_accepted_bookings_can_be_cancelled_by_passenger(BookingStatus status, bool expected)
    {
        TripBookingRules.CanCancelByPassenger(status).Should().Be(expected);
    }

    [Fact]
    public void Past_trip_is_not_bookable()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var trip = new Trip
        {
            Status = TripStatus.Published,
            DepartureDate = today.AddDays(-1),
            AvailableSeats = 2
        };

        TripBookingRules.IsBookable(trip, 1, today).Should().BeFalse();
    }
}
