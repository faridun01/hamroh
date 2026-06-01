import React from 'react';
import { Booking, BookingStatus, Notification, Trip, TripStatus, User } from '../../../types';
import type { Screen } from '../phoneSimulatorCopy';

interface UseBookingFlowParams {
  currentUser?: User | null;
  selectedTrip?: Trip;
  selectedSeats: number;
  selectedSeatRow: 'front' | 'second' | 'third';
  bookingMessage: string;
  bookings: Booking[];
  trips: Trip[];
  penaltyAmount: number;
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setSelectedBookingId: React.Dispatch<React.SetStateAction<string>>;
  setScreen: React.Dispatch<React.SetStateAction<Screen>>;
  setPassengerTab: React.Dispatch<React.SetStateAction<string>>;
  show: (message: string) => void;
  rowPriceForTrip: (trip: Trip, row: 'front' | 'second' | 'third') => number;
  isCancelWindowOpen: (booking: Booking) => boolean;
}

export function useBookingFlow({
  currentUser,
  selectedTrip,
  selectedSeats,
  selectedSeatRow,
  bookingMessage,
  bookings,
  trips,
  penaltyAmount,
  setBookings,
  setTrips,
  setNotifications,
  setSelectedBookingId,
  setScreen,
  setPassengerTab,
  show,
  rowPriceForTrip,
  isCancelWindowOpen
}: UseBookingFlowParams) {
  const confirmBooking = () => {
    if (!currentUser || !selectedTrip) return;
    if (penaltyAmount > 0) return show('Ð£ Ð²Ð°Ñ ÐµÑÑ‚ÑŒ Ð½ÐµÐ¾Ð¿Ð»Ð°Ñ‡ÐµÐ½Ð½Ñ‹Ð¹ ÑˆÑ‚Ñ€Ð°Ñ„ Ð·Ð° Ð½ÐµÑÐ²ÐºÑƒ. ÐžÐ¿Ð»Ð°Ñ‚Ð¸Ñ‚Ðµ 30% Ð¾Ñ‚ Ð¿Ñ€ÐµÐ´Ñ‹Ð´ÑƒÑ‰ÐµÐ¹ Ð¿Ð¾ÐµÐ·Ð´ÐºÐ¸.');
    const hasActiveBooking = bookings.some(booking =>
      booking.passengerId === currentUser.id &&
      ![BookingStatus.Completed, BookingStatus.CancelledByPassenger, BookingStatus.CancelledByDriver, BookingStatus.Rejected, BookingStatus.NoShowPassenger, BookingStatus.NoShowDriver].includes(booking.status)
    );
    if (hasActiveBooking) return show('Ð£ Ð¿Ð°ÑÑÐ°Ð¶Ð¸Ñ€Ð° Ð¼Ð¾Ð¶ÐµÑ‚ Ð±Ñ‹Ñ‚ÑŒ Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð¾Ð´Ð½Ð° Ð°ÐºÑ‚ÑƒÐ°Ð»ÑŒÐ½Ð°Ñ Ð¿Ð¾ÐµÐ·Ð´ÐºÐ°. Ð—Ð°Ð²ÐµÑ€ÑˆÐ¸Ñ‚Ðµ Ð¸Ð»Ð¸ Ð¾Ñ‚Ð¼ÐµÐ½Ð¸Ñ‚Ðµ Ñ‚ÐµÐºÑƒÑ‰ÑƒÑŽ.');
    const seats = Math.max(1, Math.min(selectedSeats, selectedTrip.availableSeats));
    const seatPrice = rowPriceForTrip(selectedTrip, selectedSeatRow);
    if (selectedTrip.availableSeats < seats) return show('ÐÐµÐ´Ð¾ÑÑ‚Ð°Ñ‚Ð¾Ñ‡Ð½Ð¾ ÑÐ²Ð¾Ð±Ð¾Ð´Ð½Ñ‹Ñ… Ð¼ÐµÑÑ‚');
    const bookingId = `book_${Date.now()}`;
    const booking: Booking = {
      id: bookingId,
      tripId: selectedTrip.id,
      passengerId: currentUser.id,
      seatsCount: seats,
      status: BookingStatus.Pending,
      totalPrice: seats * seatPrice,
      passengerMessage: bookingMessage,
      seatRow: selectedTrip.pricingMode === 'row' ? selectedSeatRow : undefined,
      createdAt: new Date().toISOString()
    };
    setBookings(prev => [booking, ...prev]);
    setTrips(prev => prev.map(trip => trip.id === selectedTrip.id ? { ...trip, status: TripStatus.BookingPending } : trip));
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        userId: selectedTrip.driverId,
        title: 'ÐÐ¾Ð²Ð°Ñ Ð±Ñ€Ð¾Ð½ÑŒ',
        message: `${currentUser.fullName} Ð¿Ñ€Ð¾ÑÐ¸Ñ‚ ${seats} Ð¼ÐµÑÑ‚(Ð°): ${selectedTrip.fromCity} -> ${selectedTrip.toCity}`,
        type: 'booking_request',
        tripId: selectedTrip.id,
        bookingId,
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
    setSelectedBookingId(bookingId);
    setScreen('passenger');
    setPassengerTab('trips');
    show('Ð—Ð°Ð¿Ñ€Ð¾Ñ Ð¾Ñ‚Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½ Ð²Ð¾Ð´Ð¸Ñ‚ÐµÐ»ÑŽ. ÐšÐ¾Ð½Ñ‚Ð°ÐºÑ‚Ñ‹ Ð¾Ñ‚ÐºÑ€Ð¾ÑŽÑ‚ÑÑ Ð¿Ð¾ÑÐ»Ðµ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´ÐµÐ½Ð¸Ñ.');
  };

  const cancelBooking = (booking: Booking) => {
    const trip = trips.find(item => item.id === booking.tripId);
    if (!trip) return;
    if (booking.status !== BookingStatus.Pending && !isCancelWindowOpen(booking)) return show('ÐžÑ‚Ð¼ÐµÐ½Ð° Ð±ÐµÐ· ÑˆÑ‚Ñ€Ð°Ñ„Ð° Ð´Ð¾ÑÑ‚ÑƒÐ¿Ð½Ð° Ñ‚Ð¾Ð»ÑŒÐºÐ¾ 10 Ð¼Ð¸Ð½ÑƒÑ‚ Ð¿Ð¾ÑÐ»Ðµ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´ÐµÐ½Ð¸Ñ Ð²Ð¾Ð´Ð¸Ñ‚ÐµÐ»ÐµÐ¼');
    setBookings(prev => prev.map(item => item.id === booking.id ? { ...item, status: BookingStatus.CancelledByPassenger } : item));
    if (booking.status === BookingStatus.Accepted) {
      setTrips(prev => prev.map(item => item.id === booking.tripId ? { ...item, availableSeats: item.availableSeats + booking.seatsCount, status: TripStatus.Published } : item));
    }
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        userId: trip.driverId,
        title: 'ÐŸÐ°ÑÑÐ°Ð¶Ð¸Ñ€ Ð¾Ñ‚Ð¼ÐµÐ½Ð¸Ð» Ð±Ñ€Ð¾Ð½ÑŒ',
        message: 'ÐžÑ‚Ð¼ÐµÐ½Ð° Ð²Ñ‹Ð¿Ð¾Ð»Ð½ÐµÐ½Ð° Ð² Ð¿ÐµÑ€Ð²Ñ‹Ðµ 10 Ð¼Ð¸Ð½ÑƒÑ‚ Ð¿Ð¾ÑÐ»Ðµ Ð±Ñ€Ð¾Ð½Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸Ñ.',
        type: 'booking_cancelled',
        tripId: booking.tripId,
        bookingId: booking.id,
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
    show('Ð‘Ñ€Ð¾Ð½ÑŒ Ð¾Ñ‚Ð¼ÐµÐ½ÐµÐ½Ð° Ð±ÐµÐ· ÑˆÑ‚Ñ€Ð°Ñ„Ð°');
  };

  const cancelBookingByDriver = (booking: Booking) => {
    const trip = trips.find(item => item.id === booking.tripId);
    if (!trip || trip.driverId !== currentUser?.id) return;
    if (booking.status !== BookingStatus.Accepted && booking.status !== BookingStatus.Pending) return;
    setBookings(prev => prev.map(item => item.id === booking.id ? { ...item, status: BookingStatus.CancelledByDriver } : item));
    if (booking.status === BookingStatus.Accepted) {
      setTrips(prev => prev.map(item => item.id === booking.tripId ? { ...item, availableSeats: item.availableSeats + booking.seatsCount, status: TripStatus.Published } : item));
    }
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        userId: booking.passengerId,
        title: 'Ð’Ð¾Ð´Ð¸Ñ‚ÐµÐ»ÑŒ Ð¾Ñ‚Ð¼ÐµÐ½Ð¸Ð» Ð±Ñ€Ð¾Ð½ÑŒ',
        message: 'Ð‘Ñ€Ð¾Ð½ÑŒ Ð¾Ñ‚Ð¼ÐµÐ½ÐµÐ½Ð°: ÑÑ‚Ð¾Ñ€Ð¾Ð½Ñ‹ Ð½Ðµ Ð´Ð¾Ð³Ð¾Ð²Ð¾Ñ€Ð¸Ð»Ð¸ÑÑŒ Ð¿Ð¾ Ð´ÐµÑ‚Ð°Ð»ÑÐ¼ Ð¿Ð¾ÐµÐ·Ð´ÐºÐ¸.',
        type: 'booking_cancelled_by_driver',
        tripId: booking.tripId,
        bookingId: booking.id,
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
    show('Ð‘Ñ€Ð¾Ð½ÑŒ Ð¾Ñ‚Ð¼ÐµÐ½ÐµÐ½Ð°');
  };

  const acceptBooking = (booking: Booking) => {
    const trip = trips.find(item => item.id === booking.tripId);
    if (!trip || trip.availableSeats < booking.seatsCount) return show('ÐÐµÐ´Ð¾ÑÑ‚Ð°Ñ‚Ð¾Ñ‡Ð½Ð¾ ÑÐ²Ð¾Ð±Ð¾Ð´Ð½Ñ‹Ñ… Ð¼ÐµÑÑ‚');
    const acceptedAt = new Date();
    const cancellationDeadlineAt = new Date(acceptedAt.getTime() + 10 * 60 * 1000);
    setBookings(prev => prev.map(item => item.id === booking.id ? {
      ...item,
      status: BookingStatus.Accepted,
      driverAcceptedAt: acceptedAt.toISOString(),
      cancellationDeadlineAt: cancellationDeadlineAt.toISOString()
    } : item));
    setTrips(prev => prev.map(item => {
      if (item.id !== booking.tripId) return item;
      const left = Math.max(0, item.availableSeats - booking.seatsCount);
      return { ...item, availableSeats: left, status: left === 0 ? TripStatus.Full : TripStatus.Accepted };
    }));
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        userId: booking.passengerId,
        title: 'Ð‘Ñ€Ð¾Ð½ÑŒ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´ÐµÐ½Ð°',
        message: 'ÐšÐ¾Ð½Ñ‚Ð°ÐºÑ‚Ñ‹ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ñ‹. Ð£ Ð²Ð°Ñ ÐµÑÑ‚ÑŒ 10 Ð¼Ð¸Ð½ÑƒÑ‚, Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð¾Ð±ÑÑƒÐ´Ð¸Ñ‚ÑŒ Ð´ÐµÑ‚Ð°Ð»Ð¸ Ð¸ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ñ‚ÑŒ, Ñ‡Ñ‚Ð¾ Ñ‚Ð¾Ñ‡Ð½Ð¾ ÐµÐ´ÐµÑ‚Ðµ.',
        type: 'booking_accepted',
        tripId: booking.tripId,
        bookingId: booking.id,
        chatUserId: trip.driverId,
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const confirmPassengerRide = (booking: Booking) => {
    setBookings(prev => prev.map(item => item.id === booking.id ? { ...item, passengerFinalConfirmedAt: new Date().toISOString() } : item));
    const trip = trips.find(item => item.id === booking.tripId);
    if (trip) {
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          userId: trip.driverId,
          title: 'ÐŸÐ°ÑÑÐ°Ð¶Ð¸Ñ€ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ð» Ð¿Ð¾ÐµÐ·Ð´ÐºÑƒ',
          message: 'ÐŸÐ°ÑÑÐ°Ð¶Ð¸Ñ€ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ð», Ñ‡Ñ‚Ð¾ Ñ‚Ð¾Ñ‡Ð½Ð¾ ÐµÐ´ÐµÑ‚.',
          type: 'passenger_final_confirmed',
          tripId: booking.tripId,
          bookingId: booking.id,
          isRead: false,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    }
    show('Ð’Ñ‹ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ð»Ð¸, Ñ‡Ñ‚Ð¾ Ñ‚Ð¾Ñ‡Ð½Ð¾ ÐµÐ´ÐµÑ‚Ðµ');
  };

  const confirmDriverRide = (booking: Booking) => {
    const trip = trips.find(item => item.id === booking.tripId);
    if (!trip || trip.driverId !== currentUser?.id) return;
    setBookings(prev => prev.map(item => item.id === booking.id ? { ...item, driverFinalConfirmedAt: new Date().toISOString() } : item));
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        userId: booking.passengerId,
        title: 'Ð’Ð¾Ð´Ð¸Ñ‚ÐµÐ»ÑŒ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ð» Ð¿Ð¾ÐµÐ·Ð´ÐºÑƒ',
        message: 'Ð’Ð¾Ð´Ð¸Ñ‚ÐµÐ»ÑŒ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ð», Ñ‡Ñ‚Ð¾ Ñ‚Ð¾Ñ‡Ð½Ð¾ ÐµÐ´ÐµÑ‚.',
        type: 'driver_final_confirmed',
        tripId: booking.tripId,
        bookingId: booking.id,
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
    show('Ð’Ñ‹ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ð»Ð¸, Ñ‡Ñ‚Ð¾ Ñ‚Ð¾Ñ‡Ð½Ð¾ ÐµÐ´ÐµÑ‚Ðµ');
  };

  const rejectBooking = (booking: Booking) => {
    const trip = trips.find(item => item.id === booking.tripId);
    setBookings(prev => prev.map(item => item.id === booking.id ? { ...item, status: BookingStatus.Rejected } : item));
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        userId: booking.passengerId,
        title: 'Ð‘Ñ€Ð¾Ð½ÑŒ Ð¾Ñ‚ÐºÐ»Ð¾Ð½ÐµÐ½Ð°',
        message: 'Ð—Ð°Ð¿Ñ€Ð¾Ñ Ð¾Ñ‚ÐºÐ»Ð¾Ð½ÐµÐ½. ÐœÐ¾Ð¶Ð½Ð¾ Ð²ÐµÑ€Ð½ÑƒÑ‚ÑŒÑÑ Ðº Ð¿Ð¾Ð¸ÑÐºÑƒ Ð¸ Ð²Ñ‹Ð±Ñ€Ð°Ñ‚ÑŒ Ð´Ñ€ÑƒÐ³ÑƒÑŽ Ð¿Ð¾ÐµÐ·Ð´ÐºÑƒ.',
        type: 'booking_rejected',
        tripId: trip?.id,
        bookingId: booking.id,
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const completeTrip = (tripId: string) => {
    setTrips(prev => prev.map(trip => trip.id === tripId ? { ...trip, status: TripStatus.Completed } : trip));
    setBookings(prev => prev.map(booking => booking.tripId === tripId && booking.status === BookingStatus.Accepted ? { ...booking, status: BookingStatus.Completed } : booking));
    const tripBookings = bookings.filter(booking => booking.tripId === tripId && booking.status === BookingStatus.Accepted);
    setNotifications(prev => [
      ...tripBookings.map(booking => ({
        id: `notif_${Date.now()}_${booking.id}`,
        userId: booking.passengerId,
        title: 'ÐžÑ†ÐµÐ½Ð¸Ñ‚Ðµ Ð¿Ð¾ÐµÐ·Ð´ÐºÑƒ',
        message: 'ÐŸÐ¾ÐµÐ·Ð´ÐºÐ° Ð·Ð°Ð²ÐµÑ€ÑˆÐµÐ½Ð°. ÐŸÐ¾Ð¶Ð°Ð»ÑƒÐ¹ÑÑ‚Ð°, Ð¾ÑÑ‚Ð°Ð²ÑŒÑ‚Ðµ Ð¾Ñ‚Ð·Ñ‹Ð².',
        type: 'review_request',
        tripId,
        bookingId: booking.id,
        isRead: false,
        createdAt: new Date().toISOString()
      })),
      ...prev
    ]);
  };

  const cancelTrip = (tripId: string) => {
    const tripBookings = bookings.filter(booking =>
      booking.tripId === tripId &&
      [BookingStatus.Pending, BookingStatus.Accepted].includes(booking.status)
    );
    setTrips(prev => prev.map(trip => trip.id === tripId ? { ...trip, status: TripStatus.Cancelled } : trip));
    setBookings(prev => prev.map(booking =>
      booking.tripId === tripId && [BookingStatus.Pending, BookingStatus.Accepted].includes(booking.status)
        ? { ...booking, status: BookingStatus.CancelledByDriver }
        : booking
    ));
    setNotifications(prev => [
      ...tripBookings.map(booking => ({
        id: `notif_${Date.now()}_${booking.id}`,
        userId: booking.passengerId,
        title: 'ÐŸÐ¾ÐµÐ·Ð´ÐºÐ° Ð¾Ñ‚Ð¼ÐµÐ½ÐµÐ½Ð°',
        message: 'Ð’Ð¾Ð´Ð¸Ñ‚ÐµÐ»ÑŒ Ð¾Ñ‚Ð¼ÐµÐ½Ð¸Ð» Ð¿Ð¾ÐµÐ·Ð´ÐºÑƒ. Ð’Ñ‹ Ð¼Ð¾Ð¶ÐµÑ‚Ðµ Ð½Ð°Ð¹Ñ‚Ð¸ Ð´Ñ€ÑƒÐ³ÑƒÑŽ Ð¿Ð¾ÐµÐ·Ð´ÐºÑƒ Ð¸Ð»Ð¸ ÑÐ¾Ð·Ð´Ð°Ñ‚ÑŒ Ð·Ð°ÑÐ²ÐºÑƒ.',
        type: 'trip_cancelled_by_driver',
        tripId,
        bookingId: booking.id,
        isRead: false,
        createdAt: new Date().toISOString()
      })),
      ...prev
    ]);
    show('ÐŸÐ¾ÐµÐ·Ð´ÐºÐ° Ð¾Ñ‚Ð¼ÐµÐ½ÐµÐ½Ð°');
  };

  return {
    confirmBooking,
    cancelBooking,
    cancelBookingByDriver,
    acceptBooking,
    rejectBooking,
    confirmPassengerRide,
    confirmDriverRide,
    completeTrip,
    cancelTrip
  };
}
