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
    if (penaltyAmount > 0) return show('У вас есть неоплаченный штраф за неявку. Оплатите 30% от предыдущей поездки.');
    const hasActiveBooking = bookings.some(booking =>
      booking.passengerId === currentUser.id &&
      ![BookingStatus.Completed, BookingStatus.CancelledByPassenger, BookingStatus.CancelledByDriver, BookingStatus.Rejected, BookingStatus.NoShowPassenger, BookingStatus.NoShowDriver].includes(booking.status)
    );
    if (hasActiveBooking) return show('У пассажира может быть только одна актуальная поездка. Завершите или отмените текущую.');
    const seats = Math.max(1, Math.min(selectedSeats, selectedTrip.availableSeats));
    const seatPrice = rowPriceForTrip(selectedTrip, selectedSeatRow);
    if (selectedTrip.availableSeats < seats) return show('Недостаточно свободных мест');
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
        title: 'Новая бронь',
        message: `${currentUser.fullName} просит ${seats} мест(а): ${selectedTrip.fromCity} -> ${selectedTrip.toCity}`,
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
    show('Запрос отправлен водителю. Контакты откроются после подтверждения.');
  };

  const cancelBooking = (booking: Booking) => {
    const trip = trips.find(item => item.id === booking.tripId);
    if (!trip) return;
    if (booking.status !== BookingStatus.Pending && !isCancelWindowOpen(booking)) return show('Отмена без штрафа доступна только 10 минут после подтверждения водителем');
    setBookings(prev => prev.map(item => item.id === booking.id ? { ...item, status: BookingStatus.CancelledByPassenger } : item));
    if (booking.status === BookingStatus.Accepted) {
      setTrips(prev => prev.map(item => item.id === booking.tripId ? { ...item, availableSeats: item.availableSeats + booking.seatsCount, status: TripStatus.Published } : item));
    }
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        userId: trip.driverId,
        title: 'Пассажир отменил бронь',
        message: 'Отмена выполнена в первые 10 минут после бронирования.',
        type: 'booking_cancelled',
        tripId: booking.tripId,
        bookingId: booking.id,
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
    show('Бронь отменена без штрафа');
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
        title: 'Водитель отменил бронь',
        message: 'Бронь отменена: стороны не договорились по деталям поездки.',
        type: 'booking_cancelled_by_driver',
        tripId: booking.tripId,
        bookingId: booking.id,
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
    show('Бронь отменена');
  };

  const acceptBooking = (booking: Booking) => {
    const trip = trips.find(item => item.id === booking.tripId);
    if (!trip || trip.availableSeats < booking.seatsCount) return show('Недостаточно свободных мест');
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
        title: 'Бронь подтверждена',
        message: 'Контакты открыты. У вас есть 10 минут, чтобы обсудить детали и подтвердить, что точно едете.',
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
          title: 'Пассажир подтвердил поездку',
          message: 'Пассажир подтвердил, что точно едет.',
          type: 'passenger_final_confirmed',
          tripId: booking.tripId,
          bookingId: booking.id,
          isRead: false,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    }
    show('Вы подтвердили, что точно едете');
  };

  const confirmDriverRide = (booking: Booking) => {
    const trip = trips.find(item => item.id === booking.tripId);
    if (!trip || trip.driverId !== currentUser?.id) return;
    setBookings(prev => prev.map(item => item.id === booking.id ? { ...item, driverFinalConfirmedAt: new Date().toISOString() } : item));
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        userId: booking.passengerId,
        title: 'Водитель подтвердил поездку',
        message: 'Водитель подтвердил, что точно едет.',
        type: 'driver_final_confirmed',
        tripId: booking.tripId,
        bookingId: booking.id,
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
    show('Вы подтвердили, что точно едете');
  };

  const rejectBooking = (booking: Booking) => {
    const trip = trips.find(item => item.id === booking.tripId);
    setBookings(prev => prev.map(item => item.id === booking.id ? { ...item, status: BookingStatus.Rejected } : item));
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        userId: booking.passengerId,
        title: 'Бронь отклонена',
        message: 'Запрос отклонен. Можно вернуться к поиску и выбрать другую поездку.',
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
        title: 'Оцените поездку',
        message: 'Поездка завершена. Пожалуйста, оставьте отзыв.',
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
        title: 'Поездка отменена',
        message: 'Водитель отменил поездку. Вы можете найти другую поездку или создать заявку.',
        type: 'trip_cancelled_by_driver',
        tripId,
        bookingId: booking.id,
        isRead: false,
        createdAt: new Date().toISOString()
      })),
      ...prev
    ]);
    show('Поездка отменена');
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
