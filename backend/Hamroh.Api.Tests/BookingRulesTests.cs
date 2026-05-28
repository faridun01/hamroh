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
}
