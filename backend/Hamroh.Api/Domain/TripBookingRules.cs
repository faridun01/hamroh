namespace Hamroh.Api.Domain;

public static class TripBookingRules
{
    public static bool IsBookable(Trip trip, int seatsCount, DateOnly today)
    {
        return trip.Status == TripStatus.Published
            && trip.DepartureDate >= today
            && seatsCount > 0
            && trip.AvailableSeats >= seatsCount;
    }

    public static TripStatus StatusAfterSeatChange(int availableSeats)
    {
        return availableSeats <= 0 ? TripStatus.Full : TripStatus.Published;
    }

    public static bool ReleasesSeats(BookingStatus status)
    {
        return status == BookingStatus.Accepted;
    }

    public static bool CanReject(BookingStatus status)
    {
        return status == BookingStatus.Pending;
    }

    public static bool CanCancelByPassenger(BookingStatus status)
    {
        return status is BookingStatus.Pending or BookingStatus.Accepted;
    }

    public static bool CanCancelByDriver(BookingStatus status)
    {
        return status is BookingStatus.Pending or BookingStatus.Accepted;
    }
}
