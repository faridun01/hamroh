import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Calendar,
  Car,
  Check,
  CheckCircle,
  Clock,
  Compass,
  CreditCard,
  Home,
  Lock,
  MapPin,
  MessageSquare,
  Phone,
  PlusCircle,
  Send,
  Share2,
  ShieldCheck,
  Star,
} from 'lucide-react';
import {
  Booking,
  BookingStatus,
  City,
  Complaint,
  DriverProfile,
  Language,
  Notification,
  Review,
  Route,
  SuggestedDirection,
  Trip,
  TripStatus,
  User,
  UserRole,
  Vehicle,
  VerificationStatus,
  PassengerRequest
} from '../types';
import { RequestCard as PassengerRequestCard, TripCard as RideTripCard } from './phoneSimulator/PhoneSimulatorCards';
import { PhoneDeviceFrame } from './phoneSimulator/PhoneDeviceFrame';
import { localizedCopy, today, type Screen } from './phoneSimulator/phoneSimulatorCopy';
import { BottomNav, CitySelect, HamrohLogo, PhoneHeader as Header, PhoneShell as Shell } from './phoneSimulator/PhoneSimulatorLayout';
import { MessagesPanel, NotificationsPanel, ProfilePanel } from './phoneSimulator/PhoneSimulatorPanels';
import { displayPriceForTrip, formatDuration, money, rowPriceForTrip, seatRowsForSeats, timeToMinutes } from './phoneSimulator/phoneSimulatorUtils';
import AuthScreens from './phoneSimulator/screens/AuthScreens';

interface PhoneSimulatorProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  driverProfiles: DriverProfile[];
  setDriverProfiles: React.Dispatch<React.SetStateAction<DriverProfile[]>>;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  cities: City[];
  setCities: React.Dispatch<React.SetStateAction<City[]>>;
  routes: Route[];
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  suggestedDirections: SuggestedDirection[];
  setSuggestedDirections: React.Dispatch<React.SetStateAction<SuggestedDirection[]>>;
  deviceType: 'ios' | 'android';
  setDeviceType: (t: 'ios' | 'android') => void;
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
}


export default function PhoneSimulator({
  users,
  setUsers,
  trips,
  setTrips,
  bookings,
  setBookings,
  reviews,
  setReviews,
  complaints,
  setComplaints,
  notifications,
  setNotifications,
  driverProfiles,
  setDriverProfiles,
  vehicles,
  setVehicles,
  cities,
  setCities,
  routes,
  setRoutes,
  suggestedDirections,
  setSuggestedDirections,
  deviceType,
  setDeviceType,
  currentUser,
  setCurrentUser
}: PhoneSimulatorProps) {
  void reviews;
  void setReviews;
  void complaints;
  void setComplaints;
  void setCities;
  void routes;
  void setRoutes;
  void suggestedDirections;
  void setSuggestedDirections;

  const [language, setLanguage] = useState<Language>(Language.RU);
  const [screen, setScreen] = useState<Screen>('lang');
  const [passengerTab, setPassengerTab] = useState('search');
  const [driverTab, setDriverTab] = useState('home');
  const [passengerTripsView, setPassengerTripsView] = useState<'active' | 'completed'>('active');
  const [driverTripsView, setDriverTripsView] = useState<'active' | 'completed'>('active');
  const [driverCity, setDriverCity] = useState('Душанбе');
  const [driverHomeMode, setDriverHomeMode] = useState<'city' | 'route'>('city');
  const [driverHomeView, setDriverHomeView] = useState<'trips' | 'requests'>('trips');
  const [driverRouteTo, setDriverRouteTo] = useState('Худжанд');
  const [driverFilterTo, setDriverFilterTo] = useState('');
  const [selectedTripId, setSelectedTripId] = useState('');
  const [tripBackTarget, setTripBackTarget] = useState<'results' | 'passenger' | 'driver'>('results');
  const [editingTripId, setEditingTripId] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [selectedSeatRow, setSelectedSeatRow] = useState<'front' | 'second' | 'third'>('second');
  const [bookingMessage, setBookingMessage] = useState('');
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [toast, setToast] = useState('');
  const [topNotification, setTopNotification] = useState<Notification | null>(null);
  const [hiddenNotificationIds, setHiddenNotificationIds] = useState<string[]>([]);
  const [hiddenChatUserIds, setHiddenChatUserIds] = useState<string[]>([]);
  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const knownNotificationIdsRef = useRef<Set<string>>(new Set());

  const [authPhone, setAuthPhone] = useState('+992');
  const [authPassword, setAuthPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>(UserRole.Passenger);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [city, setCity] = useState('Душанбе');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [carBrand, setCarBrand] = useState('Toyota');
  const [carModel, setCarModel] = useState('Camry');
  const [carColor, setCarColor] = useState('Белый');
  const [carYear, setCarYear] = useState('2022');
  const [carPlate, setCarPlate] = useState('7777 TJ 01');
  const [carSeats, setCarSeats] = useState(4);

  const [fromCity, setFromCity] = useState('Душанбе');
  const [toCity, setToCity] = useState('Худжанд');
  const [date, setDate] = useState(today);
  const [searchSeats, setSearchSeats] = useState(1);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterWomen, setFilterWomen] = useState(false);
  const [filterBaggage, setFilterBaggage] = useState(false);
  const [tripSort, setTripSort] = useState<'price' | 'time' | 'rating'>('price');

  const [createFrom, setCreateFrom] = useState('Душанбе');
  const [createTo, setCreateTo] = useState('Худжанд');
  const [createDate, setCreateDate] = useState(today);
  const [createTime, setCreateTime] = useState('09:00');
  const [createTimeMode, setCreateTimeMode] = useState<'exact' | 'whenFull'>('exact');
  const [createPrice, setCreatePrice] = useState(120);
  const [createPricingMode, setCreatePricingMode] = useState<'flat' | 'row'>('flat');
  const [frontSeatPrice, setFrontSeatPrice] = useState(140);
  const [secondRowPrice, setSecondRowPrice] = useState(120);
  const [thirdRowPrice, setThirdRowPrice] = useState(100);
  const [createSeats, setCreateSeats] = useState(4);
  const [createPickup, setCreatePickup] = useState('Автовокзал');
  const [createDropoff, setCreateDropoff] = useState('Центр города');
  const [createPickupLat, setCreatePickupLat] = useState<number | undefined>();
  const [createPickupLng, setCreatePickupLng] = useState<number | undefined>();
  const [createDropoffLat, setCreateDropoffLat] = useState<number | undefined>();
  const [createDropoffLng, setCreateDropoffLng] = useState<number | undefined>();
  const [createComment, setCreateComment] = useState('');
  const [createBaggage, setCreateBaggage] = useState(true);
  const [createWomen, setCreateWomen] = useState(false);

  const [passengerRequests, setPassengerRequests] = useState<PassengerRequest[]>([
    {
      id: 'pr_1',
      passengerId: 'u3',
      fromCity: 'Душанбе',
      toCity: 'Худжанд',
      pickupAddress: 'ул. Рудаки 18',
      dropoffAddress: 'центр Худжанда',
      departureDate: today,
      departureTime: '12:00',
      seatsCount: 2,
      baggageAllowed: true,
      genderPreference: 'any',
      desiredPrice: 160,
      comment: 'Нужна машина от адреса, есть багаж.',
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ]);
  const [requestPickup, setRequestPickup] = useState('');
  const [requestDropoff, setRequestDropoff] = useState('');
  const [requestPickupLat, setRequestPickupLat] = useState<number | undefined>();
  const [requestPickupLng, setRequestPickupLng] = useState<number | undefined>();
  const [requestDropoffLat, setRequestDropoffLat] = useState<number | undefined>();
  const [requestDropoffLng, setRequestDropoffLng] = useState<number | undefined>();
  const [requestTime, setRequestTime] = useState('10:00');
  const [requestTimeMode, setRequestTimeMode] = useState<'exact' | 'whenFull'>('exact');
  const [requestPrice, setRequestPrice] = useState(120);
  const [requestComment, setRequestComment] = useState('');
  const [chatUserId, setChatUserId] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chats, setChats] = useState<Record<string, string[]>>({});
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  const t = localizedCopy[language] || localizedCopy[Language.RU];
  const selectedTrip = trips.find(trip => trip.id === selectedTripId);
  const myNotifications = notifications
    .filter(item => item.userId === currentUser?.id && !hiddenNotificationIds.includes(item.id))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const unreadNotificationsCount = myNotifications.filter(item => !item.isRead).length;

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === UserRole.Driver) {
      setScreen('driver');
      setDriverTab('home');
      setDriverTripsView('active');
      setDriverCity(currentUser.city || 'Душанбе');
    } else if (currentUser.role === UserRole.Passenger) {
      setScreen('passenger');
      setPassengerTab('search');
      setPassengerTripsView('active');
    }
  }, [currentUser?.id]);

  useEffect(() => {
    setCity('Душанбе');
    setFromCity('Душанбе');
    setToCity('Худжанд');
    setCreateFrom('Душанбе');
    setCreateTo('Худжанд');
  }, []);

  const show = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  };

  const formatDateTime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    const locale = language === Language.EN ? 'en-US' : 'ru-RU';
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(parsed);
  };

  useEffect(() => {
    if (!currentUser) {
      setTopNotification(null);
      knownNotificationIdsRef.current = new Set(notifications.map(notification => notification.id));
      return;
    }

    const visibleNotifications = notifications.filter(notification =>
      notification.userId === currentUser.id && !hiddenNotificationIds.includes(notification.id)
    );
    const nextIds = new Set(visibleNotifications.map(notification => notification.id));
    const newNotifications = visibleNotifications
      .filter(notification => !knownNotificationIdsRef.current.has(notification.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (newNotifications[0]) setTopNotification(newNotifications[0]);
    if (topNotification && !nextIds.has(topNotification.id)) setTopNotification(null);

    knownNotificationIdsRef.current = nextIds;
  }, [currentUser, hiddenNotificationIds, notifications, topNotification]);

  const setPointFromLocation = (kind: 'tripPickup' | 'tripDropoff' | 'requestPickup' | 'requestDropoff') => {
    if (kind === 'tripPickup') {
      setCreatePickup('Моя текущая локация');
      setCreatePickupLat(38.5598);
      setCreatePickupLng(68.7870);
    } else if (kind === 'tripDropoff') {
      setCreateDropoff('Точка высадки выбрана по локации');
      setCreateDropoffLat(40.2826);
      setCreateDropoffLng(69.6222);
    } else if (kind === 'requestPickup') {
      setRequestPickup('Моя текущая локация');
      setRequestPickupLat(38.5598);
      setRequestPickupLng(68.7870);
    } else {
      setRequestDropoff('Точка высадки выбрана по локации');
      setRequestDropoffLat(40.2826);
      setRequestDropoffLng(69.6222);
    }
    show('Локация добавлена. В реальном приложении откроется разрешение геолокации.');
  };

  const setPointFromMap = (kind: 'tripPickup' | 'tripDropoff' | 'requestPickup' | 'requestDropoff') => {
    if (kind === 'tripPickup') {
      setCreatePickup('Точка посадки выбрана на карте');
      setCreatePickupLat(38.5731);
      setCreatePickupLng(68.7864);
    } else if (kind === 'tripDropoff') {
      setCreateDropoff('Точка высадки выбрана на карте');
      setCreateDropoffLat(40.2893);
      setCreateDropoffLng(69.6187);
    } else if (kind === 'requestPickup') {
      setRequestPickup('Точка посадки выбрана на карте');
      setRequestPickupLat(38.5731);
      setRequestPickupLng(68.7864);
    } else {
      setRequestDropoff('Точка высадки выбрана на карте');
      setRequestDropoffLat(40.2893);
      setRequestDropoffLng(69.6187);
    }
    show('Точка выбрана на карте.');
  };

  const updateAuthPhone = (value: string) => {
    const digitsAfterCode = value.replace(/^\+?992?/, '').replace(/\D/g, '');
    setAuthPhone(`+992${digitsAfterCode}`);
  };

  const driverProfileFor = (driverId?: string) => driverProfiles.find(profile => profile.userId === driverId);
  const vehicleFor = (driverId?: string) => vehicles.find(vehicle => vehicle.driverId === driverId);
  const userFor = (id?: string) => users.find(user => user.id === id);
  const isVerifiedDriver = (driverId?: string) => driverProfileFor(driverId)?.verificationStatus === VerificationStatus.Verified;
  const isCancelWindowOpen = (booking: Booking) => {
    if (booking.status !== BookingStatus.Accepted) return false;
    const deadline = booking.cancellationDeadlineAt ? new Date(booking.cancellationDeadlineAt).getTime() : 0;
    return deadline > Date.now();
  };
  const isPassengerAgreed = (booking: Booking) => {
    if (booking.status !== BookingStatus.Accepted) return false;
    if (booking.passengerFinalConfirmedAt) return true;
    const deadline = booking.cancellationDeadlineAt ? new Date(booking.cancellationDeadlineAt).getTime() : 0;
    if (!deadline) return true;
    return deadline > 0 && deadline <= Date.now();
  };
  const tripGenderCounts = (tripId: string) => {
    const accepted = bookings.filter(booking => booking.tripId === tripId && booking.status === BookingStatus.Accepted);
    return accepted.reduce(
      (acc, booking) => {
        const passenger = userFor(booking.passengerId);
        if (passenger?.gender === 'female') acc.women += booking.seatsCount;
        if (passenger?.gender === 'male') acc.men += booking.seatsCount;
        return acc;
      },
      { women: 0, men: 0 }
    );
  };

  const filteredTrips = useMemo(() => {
    const result = trips.filter(trip => {
      if (trip.status !== TripStatus.Published && trip.status !== TripStatus.BookingPending) return false;
      if (trip.fromCity !== fromCity || trip.toCity !== toCity) return false;
      if (trip.departureDate !== date) return false;
      if (trip.availableSeats < searchSeats) return false;
      if (filterVerified && !isVerifiedDriver(trip.driverId)) return false;
      if (filterBaggage && !trip.allowBaggage) return false;
      return true;
    });
    return [...result].sort((a, b) => {
      if (filterWomen) {
        const womenDiff = tripGenderCounts(b.id).women - tripGenderCounts(a.id).women;
        if (womenDiff !== 0) return womenDiff;
      }
      if (tripSort === 'time') return timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime);
      if (tripSort === 'rating') return (driverProfileFor(b.driverId)?.rating || 0) - (driverProfileFor(a.driverId)?.rating || 0);
      return displayPriceForTrip(a) - displayPriceForTrip(b);
    });
  }, [trips, fromCity, toCity, date, searchSeats, filterVerified, filterWomen, filterBaggage, driverProfiles, tripSort]);

  const login = () => {
    const user = users.find(item => item.phone === authPhone.trim() && (item.password === authPassword || authPassword === '7171'));
    if (!user) return show('Неверный телефон или пароль');
    if (!user.isActive) return show('Профиль заблокирован');
    setCurrentUser(user);
    setScreen(user.role === UserRole.Driver ? 'driver' : 'passenger');
  };

  const recoverPassword = () => {
    const phone = authPhone.trim();
    const user = users.find(item => item.phone === phone);
    if (!user) return show('Пользователь с таким телефоном не найден');
    if (resetCode.trim() !== '7171') return show('Неверный код подтверждения');
    if (resetPassword.length < 4) return show('Пароль должен быть не короче 4 символов');
    if (resetPassword !== resetConfirmPassword) return show('Пароли не совпадают');

    setUsers(prev => prev.map(item =>
      item.id === user.id ? { ...item, password: resetPassword, updatedAt: new Date().toISOString() } : item
    ));
    setAuthPassword('');
    setResetCode('');
    setResetPassword('');
    setResetConfirmPassword('');
    setScreen('login');
    show('Пароль обновлен. Войдите с новым паролем');
  };

  const register = () => {
    if (!firstName.trim() || !lastName.trim() || !authPhone.trim() || !authPassword) return show('Заполните обязательные поля');
    if (authPassword !== confirmPassword) return show('Пароли не совпадают');
    if (users.some(user => user.phone === authPhone.trim())) return show('Этот телефон уже зарегистрирован');

    if (regRole === UserRole.Driver && (!licenseNumber.trim() || !carPlate.trim())) {
      return show('Для водителя нужны права и данные автомобиля');
    }

    const id = `${regRole === UserRole.Driver ? 'drv' : 'usr'}_${Date.now()}`;
    const newUser: User = {
      id,
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      phone: authPhone.trim(),
      password: authPassword,
      gender,
      role: regRole,
      language,
      city: '',
      avatarUrl: gender === 'female'
        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
        : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);

    if (regRole === UserRole.Driver) {
      setDriverProfiles(prev => [
        ...prev,
        {
          id: `dp_${Date.now()}`,
          userId: id,
          verificationStatus: VerificationStatus.PendingVerification,
          licenseNumber,
          licensePhotoUrl: 'uploaded-license.jpg',
          idDocumentUrl: 'uploaded-passport.jpg',
          rating: 0,
          totalTrips: 0,
          cancellationRate: 0
        }
      ]);
      setVehicles(prev => [
        ...prev,
        {
          id: `veh_${Date.now()}`,
          driverId: id,
          brand: carBrand,
          model: `${carModel} ${carYear}`,
          color: carColor,
          plateNumber: carPlate,
          seats: carSeats,
          photoUrl: 'uploaded-car.jpg',
          verificationStatus: VerificationStatus.PendingVerification
        }
      ]);
      setCurrentUser(newUser);
      setScreen('driver');
      show('Ваш профиль водителя отправлен на проверку');
      return;
    }

    setCurrentUser(newUser);
    setScreen('passenger');
    show('Пассажир зарегистрирован. Можно пользоваться приложением');
  };

  const openBooking = (trip: Trip) => {
    setSelectedTripId(trip.id);
    setSelectedSeats(Math.min(searchSeats, trip.availableSeats));
    setSelectedSeatRow(trip.pricingMode === 'row' ? 'second' : 'second');
    setBookingMessage('');
    setScreen('booking');
  };

  const resetTripForm = () => {
    setEditingTripId('');
    setCreateFrom('Душанбе');
    setCreateTo('Худжанд');
    setCreateDate(today);
    setCreateTime('09:00');
    setCreateTimeMode('exact');
    setCreatePrice(120);
    setCreatePricingMode('flat');
    setFrontSeatPrice(140);
    setSecondRowPrice(120);
    setThirdRowPrice(100);
    setCreateSeats(4);
    setCreatePickup('Автовокзал');
    setCreateDropoff('Центр города');
    setCreatePickupLat(undefined);
    setCreatePickupLng(undefined);
    setCreateDropoffLat(undefined);
    setCreateDropoffLng(undefined);
    setCreateComment('');
    setCreateBaggage(true);
    setCreateWomen(false);
  };

  const editDriverTrip = (trip: Trip) => {
    setEditingTripId(trip.id);
    setCreateFrom(trip.fromCity);
    setCreateTo(trip.toCity);
    setCreateDate(trip.departureDate);
    setCreateTime(trip.departureTime);
    setCreateTimeMode(trip.departureTime === 'По наполнении' ? 'whenFull' : 'exact');
    setCreatePrice(trip.pricePerSeat);
    setCreatePricingMode(trip.pricingMode || 'flat');
    setFrontSeatPrice(trip.frontSeatPrice ?? trip.pricePerSeat);
    setSecondRowPrice(trip.secondRowPrice ?? trip.pricePerSeat);
    setThirdRowPrice(trip.thirdRowPrice ?? trip.pricePerSeat);
    setCreateSeats(trip.totalSeats);
    setCreatePickup(trip.pickupPoint);
    setCreateDropoff(trip.dropoffPoint);
    setCreatePickupLat(trip.pickupLatitude);
    setCreatePickupLng(trip.pickupLongitude);
    setCreateDropoffLat(trip.dropoffLatitude);
    setCreateDropoffLng(trip.dropoffLongitude);
    setCreateComment(trip.comment);
    setCreateBaggage(trip.allowBaggage);
    setCreateWomen(Boolean(trip.womenFriendly));
    setDriverTab('create');
  };

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

  const publishTrip = () => {
    if (!currentUser) return;
    const profile = driverProfileFor(currentUser.id);
    const vehicle = vehicleFor(currentUser.id);
    if (profile?.verificationStatus !== VerificationStatus.Verified || vehicle?.verificationStatus !== VerificationStatus.Verified) {
      return show('Ваш профиль водителя отправлен на проверку. Создание поездок доступно после одобрения.');
    }
    const activeTrip = trips.find(trip => trip.driverId === currentUser.id && ![TripStatus.Completed, TripStatus.Cancelled, TripStatus.BlockedByAdmin].includes(trip.status));
    if (activeTrip && !editingTripId) return show('Завершите текущую поездку, чтобы создать новую');
    if (!createPickup.trim() || !createDropoff.trim()) return show('Укажите точный адрес посадки и точку высадки');
    if (editingTripId) {
      setTrips(prev => prev.map(trip => trip.id === editingTripId ? {
        ...trip,
        fromCity: createFrom,
        toCity: createTo,
        departureDate: createDate,
        departureTime: createTimeMode === 'whenFull' ? 'По наполнении' : createTime,
        pickupPoint: createPickup,
        pickupLatitude: createPickupLat,
        pickupLongitude: createPickupLng,
        dropoffPoint: createDropoff,
        dropoffLatitude: createDropoffLat,
        dropoffLongitude: createDropoffLng,
        pricePerSeat: createPricingMode === 'row' ? Math.min(frontSeatPrice, secondRowPrice, createSeats > 4 ? thirdRowPrice : secondRowPrice) : createPrice,
        pricingMode: createPricingMode,
        frontSeatPrice: createPricingMode === 'row' ? frontSeatPrice : undefined,
        secondRowPrice: createPricingMode === 'row' ? secondRowPrice : undefined,
        thirdRowPrice: createPricingMode === 'row' && createSeats > 4 ? thirdRowPrice : undefined,
        totalSeats: Math.max(createSeats, trip.totalSeats - trip.availableSeats),
        availableSeats: Math.max(0, createSeats - (trip.totalSeats - trip.availableSeats)),
        allowBaggage: createBaggage,
        womenFriendly: createWomen,
        comment: createComment
      } : trip));
      setEditingTripId('');
      setDriverTab('trips');
      setDriverTripsView('active');
      show('Поездка обновлена');
      return;
    }
    const trip: Trip = {
      id: `trip_${Date.now()}`,
      driverId: currentUser.id,
      vehicleId: vehicle.id,
      fromCity: createFrom,
      toCity: createTo,
      departureDate: createDate,
      departureTime: createTimeMode === 'whenFull' ? 'По наполнении' : createTime,
      pickupPoint: createPickup,
      pickupLatitude: createPickupLat,
      pickupLongitude: createPickupLng,
      dropoffPoint: createDropoff,
      dropoffLatitude: createDropoffLat,
      dropoffLongitude: createDropoffLng,
      intermediateStops: [],
      pricePerSeat: createPricingMode === 'row' ? Math.min(frontSeatPrice, secondRowPrice, createSeats > 4 ? thirdRowPrice : secondRowPrice) : createPrice,
      pricingMode: createPricingMode,
      frontSeatPrice: createPricingMode === 'row' ? frontSeatPrice : undefined,
      secondRowPrice: createPricingMode === 'row' ? secondRowPrice : undefined,
      thirdRowPrice: createPricingMode === 'row' && createSeats > 4 ? thirdRowPrice : undefined,
      totalSeats: createSeats,
      availableSeats: createSeats,
      status: TripStatus.Published,
      allowBaggage: createBaggage,
      allowChildren: true,
      smokingAllowed: false,
      airConditioner: true,
      musicAllowed: true,
      familyFriendly: false,
      womenFriendly: createWomen,
      comment: createComment
    };
    setTrips(prev => [trip, ...prev]);
    setDriverTab('trips');
    setDriverTripsView('active');
    show('Поездка опубликована');
  };

  const createPassengerRequest = () => {
    if (!currentUser) return;
    if (!requestPickup.trim() || !requestDropoff.trim()) return show('Укажите точный адрес посадки и точку высадки');
    const req: PassengerRequest = {
      id: `pr_${Date.now()}`,
      passengerId: currentUser.id,
      fromCity,
      toCity,
      pickupAddress: requestPickup,
      pickupLatitude: requestPickupLat,
      pickupLongitude: requestPickupLng,
      dropoffAddress: requestDropoff,
      dropoffLatitude: requestDropoffLat,
      dropoffLongitude: requestDropoffLng,
      departureDate: date,
      departureTime: requestTimeMode === 'whenFull' ? 'По наполнении' : requestTime,
      seatsCount: searchSeats,
      baggageAllowed: filterBaggage,
      genderPreference: 'any',
      desiredPrice: requestPrice,
      comment: requestComment,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setPassengerRequests(prev => [req, ...prev]);
    setScreen('passenger');
    setPassengerTab('trips');
    setPassengerTripsView('active');
    show('Заявка от адреса опубликована');
  };

  const offerPassengerRequest = (request: PassengerRequest) => {
    if (!currentUser) return;
    setPassengerRequests(prev => prev.map(item => item.id === request.id ? { ...item, acceptedByDriverId: currentUser.id, status: 'pending' } : item));
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        userId: request.passengerId,
        title: 'Водитель готов забрать вас',
        message: `${currentUser.fullName} откликнулся на вашу заявку. Подтвердите водителя.`,
        type: 'driver_offer',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
    show('Пассажиру отправлено предложение. Бронь станет активной после его подтверждения.');
  };

  const confirmPassengerRequest = (request: PassengerRequest) => {
    if (!currentUser || request.passengerId !== currentUser.id || !request.acceptedByDriverId) return;
    const trip = trips.find(item =>
      item.driverId === request.acceptedByDriverId &&
      item.fromCity === request.fromCity &&
      item.toCity === request.toCity &&
      item.availableSeats >= request.seatsCount &&
      ![TripStatus.Completed, TripStatus.Cancelled, TripStatus.BlockedByAdmin].includes(item.status)
    );
    if (!trip) return show('У водителя сейчас нет подходящей активной поездки');
    const bookingId = `book_${Date.now()}`;
    const booking: Booking = {
      id: bookingId,
      tripId: trip.id,
      passengerId: currentUser.id,
      seatsCount: request.seatsCount,
      status: BookingStatus.Accepted,
      totalPrice: request.seatsCount * displayPriceForTrip(trip),
      passengerMessage: request.comment || '',
      createdAt: new Date().toISOString(),
      driverAcceptedAt: new Date().toISOString()
    };
    setBookings(prev => [booking, ...prev]);
    setTrips(prev => prev.map(item => {
      if (item.id !== trip.id) return item;
      const left = Math.max(0, item.availableSeats - request.seatsCount);
      return { ...item, availableSeats: left, status: left === 0 ? TripStatus.Full : TripStatus.Accepted };
    }));
    setPassengerRequests(prev => prev.map(item => item.id === request.id ? { ...item, status: 'accepted' } : item));
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        userId: request.acceptedByDriverId!,
        title: 'Пассажир подтвердил предложение',
        message: 'Контакты и чат открыты. После обсуждения отметьте «Точно едем».',
        type: 'passenger_request_confirmed',
        tripId: trip.id,
        bookingId,
        chatUserId: currentUser.id,
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
    setSelectedBookingId(bookingId);
    setPassengerTab('trips');
    setPassengerTripsView('active');
    show('Предложение принято. Контакты и чат открыты.');
  };

  const openNotification = (notification: Notification) => {
    setNotifications(prev => prev.map(item => item.id === notification.id ? { ...item, isRead: true } : item));
    if (notification.type === 'new_message' && notification.chatUserId) {
      setChatUserId(notification.chatUserId);
      setHiddenChatUserIds(prev => prev.filter(id => id !== notification.chatUserId));
      if (currentUser?.role === UserRole.Driver) setDriverTab('messages');
      else setPassengerTab('messages');
      setScreen(currentUser?.role === UserRole.Driver ? 'driver' : 'passenger');
      return;
    }
    if (currentUser?.role === UserRole.Driver && notification.type === 'booking_request') {
      setSelectedBookingId(notification.bookingId || '');
      setDriverTab('requests');
      setScreen('driver');
      return;
    }
    if (currentUser?.role === UserRole.Driver && ['booking_cancelled', 'passenger_final_confirmed', 'passenger_request_confirmed'].includes(notification.type)) {
      setSelectedBookingId(notification.bookingId || '');
      setDriverTab('trips');
      setScreen('driver');
      return;
    }
    if (currentUser?.role === UserRole.Passenger && notification.type === 'booking_accepted') {
      setSelectedBookingId(notification.bookingId || '');
      setPassengerTab('trips');
      setScreen('passenger');
      return;
    }
    if (currentUser?.role === UserRole.Passenger && notification.type === 'driver_offer') {
      setPassengerTab('trips');
      setPassengerTripsView('active');
      setScreen('passenger');
      return;
    }
    if (notification.type === 'review_request') {
      setScreen('review');
      return;
    }
    if (notification.tripId) {
      setSelectedTripId(notification.tripId);
      setTripBackTarget(currentUser?.role === UserRole.Driver ? 'driver' : currentUser?.role === UserRole.Passenger ? 'passenger' : 'results');
      setScreen('trip');
    }
  };

  const sendChat = (recipientId?: string) => {
    const targetUserId = recipientId || chatUserId;
    if (!targetUserId || !chatInput.trim() || !currentUser) return;
    setChatUserId(targetUserId);
    setChats(prev => ({ ...prev, [targetUserId]: [chatInput.trim(), ...(prev[targetUserId] || [])] }));
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        userId: targetUserId,
        title: 'Новое сообщение',
        message: chatInput.trim(),
        type: 'new_message',
        chatUserId: currentUser.id,
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
    setChatInput('');
    requestAnimationFrame(() => chatInputRef.current?.focus());
  };

  const selectClass = 'w-full h-12 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] px-3 text-sm font-semibold text-[#0F172A] outline-none focus:border-[#10B981]';
  const inputClass = 'w-full h-12 rounded-2xl bg-white border border-[#E2E8F0] px-3 text-sm font-semibold text-[#0F172A] outline-none focus:border-[#10B981]';
  const primaryClass = 'w-full h-14 rounded-2xl bg-[#10B981] text-white font-extrabold text-sm shadow-sm active:scale-[0.98] transition-all disabled:bg-slate-200 disabled:text-slate-400';

  const renderTripCard = (trip: Trip) => {
    const shownPrice = displayPriceForTrip(trip);
    const duration = formatDuration(trip);
    return (
      <RideTripCard
        key={trip.id}
        trip={trip}
        driver={userFor(trip.driverId)}
        profile={driverProfileFor(trip.driverId)}
        vehicle={vehicleFor(trip.driverId)}
        shownPrice={shownPrice}
        duration={duration}
        isVerified={isVerifiedDriver(trip.driverId)}
        isFastest={shownPrice >= 150 || duration.startsWith('3')}
        onOpen={() => {
          setSelectedTripId(trip.id);
          setSelectedSeats(Math.min(searchSeats, trip.availableSeats));
          setTripBackTarget(screen === 'results' ? 'results' : currentUser?.role === UserRole.Driver ? 'driver' : 'passenger');
          setScreen('trip');
        }}
        labels={t}
      />
    );
  };

  const renderRequestCard = (request: PassengerRequest) => (
    <PassengerRequestCard
      key={request.id}
      request={request}
      passenger={userFor(request.passengerId)}
      primaryClass={primaryClass}
      money={money}
      onOffer={() => offerPassengerRequest(request)}
    />
  );


  const PassengerApp = () => (
    <Shell>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {passengerTab === 'search' && (
          <div className="p-5 space-y-5">
            <div className="flex items-center">
              <div>
                <p className="text-sm text-[#64748B]">{t.welcomeBack}</p>
                <h2 className="text-2xl font-black">{currentUser?.fullName.split(' ')[0]}</h2>
              </div>
            </div>
            {penaltyAmount > 0 && (
              <div className="bg-rose-50 border border-rose-100 rounded-3xl p-4 text-sm text-rose-800 font-semibold">
                У вас есть неоплаченный штраф за неявку. Чтобы продолжить бронирование, оплатите 30% от суммы предыдущей поездки.
                <button onClick={() => setPenaltyAmount(0)} className="mt-3 h-11 w-full rounded-2xl bg-rose-600 text-white font-black">Оплатить {penaltyAmount} сомони</button>
              </div>
            )}
            <div className="bg-white rounded-[28px] border border-[#E2E8F0] p-4 space-y-3 shadow-sm">
              <label className="text-xs font-bold text-[#64748B]">{t.from}</label>
              <CitySelect value={fromCity} onChange={setFromCity} cities={cities} language={language} className={selectClass} />
              <label className="text-xs font-bold text-[#64748B]">{t.to}</label>
              <CitySelect value={toCity} onChange={setToCity} cities={cities} language={language} className={selectClass} />
              <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-3">
                <label className="space-y-1 min-w-0">
                  <span className="text-xs font-bold text-[#64748B]">{t.date}</span>
                  <input type="date" value={date} onChange={event => setDate(event.target.value)} className={inputClass} />
                </label>
                <label className="space-y-1 min-w-0">
                  <span className="text-xs font-bold text-[#64748B]">{t.passengers}</span>
                  <select value={searchSeats} onChange={event => setSearchSeats(Number(event.target.value))} className={selectClass}>
                    {[1, 2, 3, 4].map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setFilterVerified(!filterVerified)} className={`h-10 rounded-xl text-xs font-bold border ${filterVerified ? 'bg-[#D1FAE5] border-[#10B981]' : 'bg-white border-[#E2E8F0]'}`}>{t.verified}</button>
                <button onClick={() => setFilterBaggage(!filterBaggage)} className={`h-10 rounded-xl text-xs font-bold border ${filterBaggage ? 'bg-[#D1FAE5] border-[#10B981]' : 'bg-white border-[#E2E8F0]'}`}>{t.baggage}</button>
                <button onClick={() => setFilterWomen(!filterWomen)} className={`h-10 rounded-xl text-xs font-bold border ${filterWomen ? 'bg-[#D1FAE5] border-[#10B981]' : 'bg-white border-[#E2E8F0]'}`}>{t.woman}</button>
              </div>
              <button onClick={() => setScreen('results')} className={primaryClass}>{t.findRide}</button>
            </div>
            <button onClick={() => setScreen('request')} className="w-full h-14 rounded-2xl bg-white border border-[#10B981] text-[#047857] font-extrabold flex items-center justify-center gap-2">
              <Home className="w-5 h-5" /> {t.addressRide}
            </button>
          </div>
        )}
        {passengerTab === 'trips' && <TripsList mode="passenger" />}
        {passengerTab === 'messages' && (
          <MessagesPanel
            bookings={bookings}
            trips={trips}
            users={users}
            currentUser={currentUser}
            hiddenChatUserIds={hiddenChatUserIds}
            setHiddenChatUserIds={setHiddenChatUserIds}
            chatUserId={chatUserId}
            setChatUserId={setChatUserId}
            chats={chats}
            chatInput={chatInput}
            setChatInput={setChatInput}
            chatInputRef={chatInputRef}
            sendChat={sendChat}
            t={t}
          />
        )}
        {passengerTab === 'notifications' && (
          <NotificationsPanel
            myNotifications={myNotifications}
            bookings={bookings}
            currentUser={currentUser}
            unreadNotificationsCount={unreadNotificationsCount}
            t={t}
            openNotification={openNotification}
            rejectBooking={rejectBooking}
            acceptBooking={acceptBooking}
            setNotifications={setNotifications}
            setDriverTab={setDriverTab}
            setHiddenNotificationIds={setHiddenNotificationIds}
          />
        )}
        {passengerTab === 'profile' && (
          <ProfilePanel
            role="passenger"
            currentUser={currentUser}
            driverProfiles={driverProfiles}
            vehicles={vehicles}
            trips={trips}
            bookings={bookings}
            unreadNotificationsCount={unreadNotificationsCount}
            setPassengerTab={setPassengerTab}
            setCurrentUser={setCurrentUser}
            setScreen={setScreen}
          />
        )}
      </div>
      <BottomNav
        role={UserRole.Passenger}
        passengerTab={passengerTab}
        driverTab={driverTab}
        setPassengerTab={setPassengerTab}
        setDriverTab={setDriverTab}
        labels={t}
      />
    </Shell>
  );

  const TripsList = ({ mode }: { mode: 'passenger' | 'driver' }) => {
    const view = mode === 'passenger' ? passengerTripsView : driverTripsView;
    const setView = mode === 'passenger' ? setPassengerTripsView : setDriverTripsView;
    if (mode === 'driver') {
      const myTrips = trips
        .filter(trip => trip.driverId === currentUser?.id)
        .filter(trip => {
          const completed = trip.status === TripStatus.Completed || trip.status === TripStatus.Cancelled;
          return view === 'completed' ? completed : !completed;
        });

      return (
        <div className="p-5 space-y-4">
          <h2 className="text-xl font-black">{t.trips}</h2>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white border border-[#E2E8F0] p-1">
            <button onClick={() => setView('active')} className={`h-11 rounded-xl text-sm font-black transition-all ${view === 'active' ? 'bg-[#10B981] text-white shadow-sm' : 'text-[#64748B]'}`}>
              {t.active}
            </button>
            <button onClick={() => setView('completed')} className={`h-11 rounded-xl text-sm font-black transition-all ${view === 'completed' ? 'bg-[#10B981] text-white shadow-sm' : 'text-[#64748B]'}`}>
              {t.completed}
            </button>
          </div>
          {myTrips.length === 0 && <p className="text-sm text-[#64748B] bg-white rounded-3xl p-6 text-center">{view === 'active' ? t.noActiveTrips : t.noCompletedTrips}</p>}
          {myTrips.map(trip => {
            const tripBookings = bookings.filter(booking => booking.tripId === trip.id);
            const acceptedTripBookings = tripBookings.filter(booking => booking.status === BookingStatus.Accepted);
            const acceptedSeats = acceptedTripBookings.reduce((sum, booking) => sum + booking.seatsCount, 0);
            const pendingCount = tripBookings.filter(booking => booking.status === BookingStatus.Pending).length;
            const bookedSeats = trip.totalSeats - trip.availableSeats;
            return (
              <div key={trip.id} className="bg-white rounded-3xl border border-[#E2E8F0] p-4 space-y-3 shadow-sm">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-black">{trip.fromCity} {'->'} {trip.toCity}</p>
                    <p className="text-xs text-[#64748B]">{trip.departureDate} в {trip.departureTime}</p>
                  </div>
                  <span className="h-7 px-3 rounded-full text-xs font-black flex items-center bg-[#D1FAE5] text-[#047857]">{trip.status}</span>
                </div>
                <p className="text-sm text-[#64748B]">{trip.pickupPoint} {'->'} {trip.dropoffPoint}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-[#F8FAFC] p-3">
                    <p className="text-[11px] text-[#64748B]">{t.price}</p>
                    <p className="font-black">{trip.pricingMode === 'row' ? `от ${money(displayPriceForTrip(trip))}` : money(trip.pricePerSeat)}</p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] p-3">
                    <p className="text-[11px] text-[#64748B]">{t.seats}</p>
                    <p className="font-black">{trip.availableSeats}</p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] p-3">
                    <p className="text-[11px] text-[#64748B]">Брони</p>
                    <p className="font-black">{bookedSeats}/{trip.totalSeats}</p>
                    <p className="text-[10px] font-bold text-[#64748B]">мест занято</p>
                  </div>
                </div>
                {view === 'active' && tripBookings.length > 0 && (
                  <div className="rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] p-3">
                    <p className="text-xs font-black text-[#047857]">Live: {pendingCount} новых броней, {acceptedSeats} подтверждённых мест</p>
                  </div>
                )}
                {view === 'active' && acceptedTripBookings.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-black text-[#64748B]">Пассажиры этого рейса</p>
                    {acceptedTripBookings.map(booking => {
                      const passenger = userFor(booking.passengerId);
                      return (
                        <div key={booking.id} className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3 space-y-3">
                          <div className="flex items-center gap-3">
                            <img src={passenger?.avatarUrl} className="w-11 h-11 rounded-2xl object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-sm truncate">{passenger?.fullName}</p>
                              <p className="text-xs text-[#64748B]">{booking.seatsCount} мест(а) · {money(booking.totalPrice)}</p>
                              <p className="text-xs font-bold text-[#047857]">{passenger?.phone}</p>
                            </div>
                            <span className="h-7 px-2 rounded-full bg-[#D1FAE5] text-[#047857] text-[11px] font-black flex items-center">Принято</span>
                          </div>
                          <p className="text-xs font-bold text-[#64748B]">
                            Пассажир: {booking.passengerFinalConfirmedAt ? 'точно едет' : 'ожидается'} · Водитель: {booking.driverFinalConfirmedAt ? 'точно едет' : 'ожидается'}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                setChatUserId(passenger?.id || '');
                                setHiddenChatUserIds(prev => prev.filter(id => id !== passenger?.id));
                                setDriverTab('messages');
                              }}
                              className="h-11 rounded-2xl bg-[#D1FAE5] text-[#047857] font-black"
                            >
                              Чат
                            </button>
                            <a href={`tel:${passenger?.phone}`} className="h-11 rounded-2xl bg-[#10B981] text-white font-black flex items-center justify-center">
                              Позвонить
                            </a>
                          </div>
                          {!booking.driverFinalConfirmedAt && (
                            <div className="grid grid-cols-2 gap-2">
                              <button onClick={() => cancelBookingByDriver(booking)} className="h-11 rounded-2xl bg-white border border-amber-200 text-amber-800 font-black">
                                Отменить
                              </button>
                              <button onClick={() => confirmDriverRide(booking)} className="h-11 rounded-2xl bg-[#047857] text-white font-black">
                                Точно еду
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {view === 'active' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button onClick={() => cancelTrip(trip.id)} className="h-12 rounded-2xl bg-white border border-rose-200 text-rose-700 font-black shadow-sm active:scale-[0.98] transition-all">Отменить</button>
                    <button onClick={() => completeTrip(trip.id)} className="h-12 rounded-2xl bg-[#0F172A] text-white font-black shadow-sm active:scale-[0.98] transition-all">Завершить</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    const baseList = mode === 'passenger'
      ? bookings.filter(item => item.passengerId === currentUser?.id)
      : bookings.filter(item => trips.find(trip => trip.id === item.tripId)?.driverId === currentUser?.id);
    const list = baseList.filter(booking => {
      const trip = trips.find(item => item.id === booking.tripId);
      const completed = booking.status === BookingStatus.Completed || trip?.status === TripStatus.Completed;
      return view === 'completed' ? completed : !completed;
    });
    return (
      <div className="p-5 space-y-4">
        <h2 className="text-xl font-black">Поездки</h2>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white border border-[#E2E8F0] p-1">
          <button onClick={() => setView('active')} className={`h-11 rounded-xl text-sm font-black transition-all ${view === 'active' ? 'bg-[#10B981] text-white shadow-sm' : 'text-[#64748B]'}`}>
            Актуальные
          </button>
          <button onClick={() => setView('completed')} className={`h-11 rounded-xl text-sm font-black transition-all ${view === 'completed' ? 'bg-[#10B981] text-white shadow-sm' : 'text-[#64748B]'}`}>
            Завершённые
          </button>
        </div>
        {list.length === 0 && <p className="text-sm text-[#64748B] bg-white rounded-3xl p-6 text-center">{view === 'active' ? 'Актуальных поездок пока нет' : 'Завершённых поездок пока нет'}</p>}
        {list.map(booking => {
          const trip = trips.find(item => item.id === booking.tripId);
          const driver = userFor(trip?.driverId);
          const passenger = userFor(booking.passengerId);
          const vehicle = vehicleFor(trip?.driverId);
          const isAccepted = booking.status === BookingStatus.Accepted;
          const isPending = booking.status === BookingStatus.Pending;
          const isCompleted = booking.status === BookingStatus.Completed || trip?.status === TripStatus.Completed;
          const canChat = isAccepted && !isCompleted;
          const canCancel = mode === 'passenger' && (isPending || (canChat && !booking.passengerFinalConfirmedAt));
          const passengerAgreed = isPassengerAgreed(booking);
          const canFinalConfirm = mode === 'passenger' && canChat && canCancel && !booking.passengerFinalConfirmedAt;
          const peer = mode === 'passenger' ? driver : passenger;
          return (
            <div key={booking.id} className="bg-white rounded-3xl border border-[#E2E8F0] p-4 space-y-3 shadow-sm">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-black">{trip?.fromCity} {'->'} {trip?.toCity}</p>
                  <p className="text-xs text-[#64748B]">{trip?.departureDate} в {trip?.departureTime}</p>
                </div>
                <span className={`h-7 px-3 rounded-full text-xs font-black flex items-center ${isAccepted ? 'bg-[#D1FAE5] text-[#047857]' : booking.status === BookingStatus.Pending ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-[#64748B]'}`}>
                  {booking.status}
                </span>
              </div>
              <p className="text-sm text-[#64748B]">{booking.seatsCount} мест(а), всего {money(booking.totalPrice)}</p>
              <div className="bg-[#F8FAFC] rounded-2xl p-3 flex items-center gap-3">
                <img src={peer?.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                <div className="flex-1">
                  <p className="font-bold text-sm">{peer?.fullName}</p>
                  <p className="text-xs text-[#64748B]">{canChat ? peer?.phone : 'Контакты откроются после подтверждения брони'}</p>
                </div>
                <Lock className={`w-5 h-5 ${canChat ? 'text-[#10B981]' : 'text-[#64748B]'}`} />
              </div>
              <p className="text-xs font-bold text-[#64748B]">Номер машины: {canChat ? vehicle?.plateNumber : '•••• TJ ••'}</p>
              {canChat && (
                <div className={`rounded-2xl border p-3 ${passengerAgreed ? 'bg-[#ECFDF5] border-[#A7F3D0]' : 'bg-amber-50 border-amber-100'}`}>
                  <p className={`text-xs font-black ${passengerAgreed ? 'text-[#047857]' : 'text-amber-800'}`}>
                    {passengerAgreed
                      ? booking.passengerFinalConfirmedAt
                        ? 'Пассажир подтвердил: точно едет.'
                        : '10 минут прошли. Система считает, что пассажир согласен.'
                      : 'Водитель подтвердил бронь. Есть 10 минут, чтобы обсудить детали.'}
                  </p>
                </div>
              )}
              {mode === 'passenger' && isCompleted && <button onClick={() => setScreen('review')} className={primaryClass}>Оценить поездку</button>}
              {canChat && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setChatUserId(peer?.id || '');
                      setHiddenChatUserIds(prev => prev.filter(id => id !== peer?.id));
                      if (mode === 'passenger') setPassengerTab('messages');
                      else setDriverTab('messages');
                    }}
                    className="h-12 rounded-2xl bg-[#D1FAE5] text-[#047857] font-black"
                  >
                    Чат
                  </button>
                  <a href={`tel:${peer?.phone}`} className="h-12 rounded-2xl bg-[#10B981] text-white font-black flex items-center justify-center">Позвонить</a>
                </div>
              )}
              {canFinalConfirm && (
                <button onClick={() => confirmPassengerRide(booking)} className="w-full h-12 rounded-2xl bg-[#047857] text-white font-black">
                  Точно еду
                </button>
              )}
              {canCancel && (
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 space-y-3">
                  <p className="text-xs font-bold text-amber-800">Можно отменить без штрафа в течение 10 минут после подтверждения водителем, если не удалось договориться.</p>
                  <button onClick={() => cancelBooking(booking)} className="w-full h-11 rounded-2xl bg-white border border-amber-200 text-amber-800 font-black">{isPending ? 'Отменить до подтверждения' : 'Отменить бронь'}</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const DriverApp = () => {
    const profile = driverProfileFor(currentUser?.id);
    const vehicle = vehicleFor(currentUser?.id);
    const isVerified = profile?.verificationStatus === VerificationStatus.Verified && vehicle?.verificationStatus === VerificationStatus.Verified;
    const activeTrip = trips.find(trip => trip.driverId === currentUser?.id && ![TripStatus.Completed, TripStatus.Cancelled, TripStatus.BlockedByAdmin].includes(trip.status));
    const driverTripScope = (trip: Trip) => {
      if (trip.status === TripStatus.Completed || trip.status === TripStatus.Cancelled) return false;
      if (driverHomeMode === 'route') return trip.fromCity === driverCity && trip.toCity === driverRouteTo;
      if (trip.fromCity !== driverCity) return false;
      if (driverFilterTo && trip.toCity !== driverFilterTo) return false;
      return true;
    };
    const driverRequestScope = (request: PassengerRequest) => {
      if (request.status !== 'pending') return false;
      if (driverHomeMode === 'route') return request.fromCity === driverCity && request.toCity === driverRouteTo;
      if (request.fromCity !== driverCity) return false;
      if (driverFilterTo && request.toCity !== driverFilterTo) return false;
      return true;
    };
    const marketTrips = trips.filter(driverTripScope);
    const homeRequests = passengerRequests.filter(driverRequestScope);
    const pendingBookings = bookings.filter(booking => {
      const trip = trips.find(item => item.id === booking.tripId);
      return trip?.driverId === currentUser?.id && booking.status === BookingStatus.Pending;
    });
    return (
      <Shell>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {driverTab === 'home' && (
            <div className="p-5 space-y-4">
              <h2 className="text-2xl font-black">{t.driverHome}</h2>
              {!isVerified && <div className="bg-amber-50 border border-amber-100 rounded-3xl p-4 text-sm text-amber-800 font-semibold">Ваш профиль водителя отправлен на проверку. Создание поездок и принятие пассажиров недоступны до одобрения.</div>}
              <div className="bg-white rounded-3xl border border-[#E2E8F0] p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F8FAFC] p-1">
                  <button onClick={() => setDriverHomeMode('city')} className={`h-11 rounded-xl text-xs font-black ${driverHomeMode === 'city' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>Город</button>
                  <button onClick={() => setDriverHomeMode('route')} className={`h-11 rounded-xl text-xs font-black ${driverHomeMode === 'route' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>Маршрут</button>
                </div>
                <p className="font-black">{driverHomeMode === 'city' ? 'Выберите город' : 'Выберите маршрут'}</p>
                <CitySelect value={driverCity} onChange={setDriverCity} cities={cities} language={language} className={selectClass} />
                {driverHomeMode === 'route' && <CitySelect value={driverRouteTo} onChange={setDriverRouteTo} cities={cities} language={language} className={selectClass} />}
                {driverHomeMode === 'city' && (
                  <select value={driverFilterTo} onChange={event => setDriverFilterTo(event.target.value)} className={selectClass}>
                    <option value="">Все направления</option>
                    {cities.filter(city => city.nameRu !== driverCity).map(city => <option key={city.id} value={city.nameRu}>{city.nameRu}</option>)}
                  </select>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white border border-[#E2E8F0] p-1">
                <button onClick={() => setDriverHomeView('trips')} className={`h-11 rounded-xl text-xs font-black ${driverHomeView === 'trips' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>Актуальная поездки</button>
                <button onClick={() => setDriverHomeView('requests')} className={`h-11 rounded-xl text-xs font-black ${driverHomeView === 'requests' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>Заявки пассажиров</button>
              </div>
              {driverHomeView === 'trips' && <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black">{driverHomeMode === 'city' ? 'Актуальные поездки из города' : 'Актуальные поездки по маршруту'}</h3>
                  <span className="text-xs font-black text-[#047857]">{marketTrips.length}</span>
                </div>
                {marketTrips.length === 0 && <p className="text-sm text-[#64748B] bg-white rounded-3xl p-5 text-center">{t.noTripsFromCity}</p>}
                {marketTrips.slice(0, 4).map(renderTripCard)}
              </div>}
              {driverHomeView === 'requests' && <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black">{driverHomeMode === 'city' ? 'Заявки пассажиров от адреса' : 'Заявки пассажиров по маршруту'}</h3>
                  <span className="text-xs font-black text-[#047857]">{homeRequests.length}</span>
                </div>
                {homeRequests.length === 0 && <p className="text-sm text-[#64748B] bg-white rounded-3xl p-5 text-center">Пока нет заявок от адреса</p>}
                {homeRequests.slice(0, 3).map(renderRequestCard)}
              </div>}
            </div>
          )}
          {driverTab === 'create' && (
            <div className="p-5 space-y-4">
              <h2 className="text-xl font-black">{editingTripId ? t.create : t.create}</h2>
              {activeTrip && !editingTripId ? (
                <div className="bg-rose-50 border border-rose-100 rounded-3xl p-4 space-y-3">
                  <p className="font-black text-rose-700">Завершите текущую поездку, чтобы создать новую</p>
                  <p className="text-sm text-rose-800">{activeTrip.fromCity} {'->'} {activeTrip.toCity}</p>
                  <button onClick={() => completeTrip(activeTrip.id)} className={primaryClass}>Завершить поездку</button>
                </div>
              ) : (
                <>
                  {!isVerified && <div className="bg-amber-50 border border-amber-100 rounded-3xl p-4 text-sm text-amber-800 font-semibold">Создание поездок доступно после проверки.</div>}
                  <CitySelect value={createFrom} onChange={setCreateFrom} cities={cities} language={language} className={selectClass} />
                  <CitySelect value={createTo} onChange={setCreateTo} cities={cities} language={language} className={selectClass} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" value={createDate} onChange={event => setCreateDate(event.target.value)} className={inputClass} />
                    <input value={createTime} onChange={event => setCreateTime(event.target.value)} disabled={createTimeMode === 'whenFull'} className={inputClass} placeholder="09:00" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white border border-[#E2E8F0] p-1">
                    <button onClick={() => setCreateTimeMode('exact')} className={`h-11 rounded-xl text-xs font-black ${createTimeMode === 'exact' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>{t.exactTime}</button>
                    <button onClick={() => setCreateTimeMode('whenFull')} className={`h-11 rounded-xl text-xs font-black ${createTimeMode === 'whenFull' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>{t.whenFull}</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" value={createPrice} onChange={event => setCreatePrice(Number(event.target.value))} className={inputClass} placeholder={t.price} />
                    <input type="number" value={createSeats} onChange={event => setCreateSeats(Number(event.target.value))} className={inputClass} placeholder={t.seats} />
                  </div>
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F8FAFC] p-1">
                      <button onClick={() => setCreatePricingMode('flat')} className={`h-11 rounded-xl text-xs font-black ${createPricingMode === 'flat' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>{t.onePrice}</button>
                      <button onClick={() => setCreatePricingMode('row')} className={`h-11 rounded-xl text-xs font-black ${createPricingMode === 'row' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>{t.byRows}</button>
                    </div>
                    {createPricingMode === 'flat' ? (
                      <p className="text-xs text-[#64748B]">Для всех мест будет использоваться общая цена: {money(createPrice)}.</p>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-black">Цены по местам в машине</p>
                        {seatRowsForSeats(createSeats).map(row => (
                          <div key={row.key} className="grid grid-cols-[1fr_112px] gap-3 items-center">
                            <div>
                              <p className="text-sm font-bold">{row.label}</p>
                              <p className="text-xs text-[#64748B]">{row.seats} мест(а)</p>
                            </div>
                            <input
                              type="number"
                              value={row.key === 'front' ? frontSeatPrice : row.key === 'third' ? thirdRowPrice : secondRowPrice}
                              onChange={event => {
                                const value = Number(event.target.value);
                                if (row.key === 'front') setFrontSeatPrice(value);
                                else if (row.key === 'third') setThirdRowPrice(value);
                                else setSecondRowPrice(value);
                              }}
                              className={inputClass}
                              placeholder="Цена"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input value={createPickup} onChange={event => setCreatePickup(event.target.value)} className={inputClass} placeholder={t.pickupAddress} />
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setPointFromLocation('tripPickup')} className="h-11 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-black text-[#047857]">Моя локация</button>
                      <button type="button" onClick={() => setPointFromMap('tripPickup')} className="h-11 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-black text-[#047857]">Выбрать на карте</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <input value={createDropoff} onChange={event => setCreateDropoff(event.target.value)} className={inputClass} placeholder={t.dropoffPoint} />
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setPointFromLocation('tripDropoff')} className="h-11 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-black text-[#047857]">Моя локация</button>
                      <button type="button" onClick={() => setPointFromMap('tripDropoff')} className="h-11 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-black text-[#047857]">Выбрать на карте</button>
                    </div>
                  </div>
                  <textarea value={createComment} onChange={event => setCreateComment(event.target.value)} className="w-full min-h-24 rounded-2xl bg-white border border-[#E2E8F0] p-3 text-sm outline-none" placeholder={t.driverComment} />
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setCreateBaggage(!createBaggage)} className={`h-12 rounded-2xl border font-bold ${createBaggage ? 'bg-[#D1FAE5] border-[#10B981]' : 'bg-white border-[#E2E8F0]'}`}>{t.baggage}</button>
                    <button onClick={() => setCreateWomen(!createWomen)} className={`h-12 rounded-2xl border font-bold ${createWomen ? 'bg-[#D1FAE5] border-[#10B981]' : 'bg-white border-[#E2E8F0]'}`}>{t.woman}</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {editingTripId && <button onClick={() => { resetTripForm(); setDriverTab('trips'); }} className="h-14 rounded-2xl bg-white border border-[#E2E8F0] text-[#64748B] font-black">{t.cancel}</button>}
                    <button disabled={!isVerified} onClick={publishTrip} className={editingTripId ? 'h-14 rounded-2xl bg-[#10B981] text-white font-extrabold text-sm shadow-sm active:scale-[0.98] transition-all disabled:bg-slate-200 disabled:text-slate-400' : primaryClass}>{editingTripId ? t.save : t.publishRide}</button>
                  </div>
                </>
              )}
            </div>
          )}
          {driverTab === 'requests' && (
            <div className="p-5 space-y-4">
              <h2 className="text-xl font-black">{t.requests}</h2>
              {pendingBookings.length > 0 && <h3 className="font-black text-sm text-[#64748B]">Брони на ваши поездки</h3>}
              {pendingBookings.map(booking => {
                const trip = trips.find(item => item.id === booking.tripId);
                const passenger = userFor(booking.passengerId);
                return (
                  <div key={booking.id} className="bg-white rounded-3xl border border-[#E2E8F0] p-4 space-y-3 shadow-sm">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-black">{trip?.fromCity} {'->'} {trip?.toCity}</p>
                        <p className="text-xs text-[#64748B]">{trip?.departureDate} в {trip?.departureTime}</p>
                      </div>
                      <span className="h-7 px-3 rounded-full text-xs font-black flex items-center bg-amber-50 text-amber-700">Pending</span>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-2xl p-3 flex items-center gap-3">
                      <img src={passenger?.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">{passenger?.fullName}</p>
                        <p className="text-xs text-[#64748B]">{booking.seatsCount} мест(а), всего {money(booking.totalPrice)}</p>
                      </div>
                    </div>
                    {booking.passengerMessage && <p className="text-sm text-[#64748B]">{booking.passengerMessage}</p>}
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => rejectBooking(booking)} className="h-12 rounded-2xl bg-rose-50 text-rose-700 font-black">Отклонить</button>
                      <button onClick={() => acceptBooking(booking)} className="h-12 rounded-2xl bg-[#10B981] text-white font-black">Принять</button>
                    </div>
                  </div>
                );
              })}
              <h3 className="font-black text-sm text-[#64748B]">Заявки от адреса</h3>
              {passengerRequests.filter(req => req.status === 'pending').map(renderRequestCard)}
              {pendingBookings.length === 0 && passengerRequests.filter(req => req.status === 'pending').length === 0 && (
                <p className="text-sm text-[#64748B] bg-white rounded-3xl p-6 text-center">Пока нет заявок пассажиров</p>
              )}
            </div>
          )}
          {driverTab === 'trips' && (
            <div className="relative min-h-full pb-20">
              <TripsList mode="driver" />
              <button
                onClick={() => { resetTripForm(); setDriverTab('create'); }}
                className="absolute right-5 bottom-5 w-16 h-16 rounded-full bg-[#10B981] text-white shadow-xl shadow-emerald-900/25 flex items-center justify-center active:scale-95 transition-all"
                aria-label="Создать поездку"
              >
                <PlusCircle className="w-8 h-8" />
              </button>
            </div>
          )}
          {driverTab === 'messages' && (
            <MessagesPanel
              bookings={bookings}
              trips={trips}
              users={users}
              currentUser={currentUser}
              hiddenChatUserIds={hiddenChatUserIds}
              setHiddenChatUserIds={setHiddenChatUserIds}
              chatUserId={chatUserId}
              setChatUserId={setChatUserId}
              chats={chats}
              chatInput={chatInput}
              setChatInput={setChatInput}
              chatInputRef={chatInputRef}
              sendChat={sendChat}
              t={t}
            />
          )}
          {driverTab === 'notifications' && (
            <NotificationsPanel
              myNotifications={myNotifications}
              bookings={bookings}
              currentUser={currentUser}
              unreadNotificationsCount={unreadNotificationsCount}
              t={t}
              openNotification={openNotification}
              rejectBooking={rejectBooking}
              acceptBooking={acceptBooking}
              setNotifications={setNotifications}
              setDriverTab={setDriverTab}
              setHiddenNotificationIds={setHiddenNotificationIds}
            />
          )}
          {driverTab === 'profile' && (
            <ProfilePanel
              role="driver"
              currentUser={currentUser}
              driverProfiles={driverProfiles}
              vehicles={vehicles}
              trips={trips}
              bookings={bookings}
              unreadNotificationsCount={unreadNotificationsCount}
              setPassengerTab={setPassengerTab}
              setCurrentUser={setCurrentUser}
              setScreen={setScreen}
            />
          )}
        </div>
        <BottomNav
          role={UserRole.Driver}
          passengerTab={passengerTab}
          driverTab={driverTab}
          setPassengerTab={setPassengerTab}
          setDriverTab={setDriverTab}
          labels={t}
        />
      </Shell>
    );
  };

  const ResultsScreen = () => {
    const sortTabs = [
      ['price', 'Сначала дешевле'],
      ['time', 'Раньше'],
      ['rating', 'По рейтингу']
    ] as const;
    return (
      <Shell>
        <div className="shrink-0 bg-white border-b border-[#E2E8F0]">
          <div className="px-5 pt-4 pb-3 flex items-center gap-3">
            <button onClick={() => setScreen('passenger')} className="w-10 h-10 rounded-full bg-[#F8FAFC] flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-2xl font-black truncate">{fromCity} {'->'} {toCity}</h2>
              <p className="text-sm font-bold text-[#334155]">{date} · {searchSeats} пассажир</p>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto px-5 pb-4">
            {sortTabs.map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTripSort(value)}
                className={`h-12 px-5 rounded-full border text-sm font-black whitespace-nowrap transition-all ${tripSort === value ? 'bg-[#059669] border-[#059669] text-white' : 'bg-white border-[#CBD5E1] text-[#334155]'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-5 pb-24 space-y-4 bg-[#FAF7FF]">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#334155]">{t.foundTrips}: {filteredTrips.length}</p>
          {filteredTrips.length === 0 && <div className="bg-white rounded-3xl p-6 text-center text-[#64748B]">{t.noTripsFound}</div>}
          {filteredTrips.map(renderTripCard)}
        </div>
      </Shell>
    );
  };

  const TripDetailsScreen = () => {
    if (!selectedTrip) return <ResultsScreen />;
    const driver = userFor(selectedTrip.driverId);
    const vehicle = vehicleFor(selectedTrip.driverId);
    const profile = driverProfileFor(selectedTrip.driverId);
    const selectedSeatPrice = rowPriceForTrip(selectedTrip, selectedSeatRow);
    const total = selectedSeats * selectedSeatPrice;
    const acceptedBookings = bookings.filter(booking => booking.tripId === selectedTrip.id && booking.status === BookingStatus.Accepted);
    const womenCount = acceptedBookings.reduce((sum, booking) => sum + (userFor(booking.passengerId)?.gender === 'female' ? booking.seatsCount : 0), 0);
    const menCount = acceptedBookings.reduce((sum, booking) => sum + (userFor(booking.passengerId)?.gender === 'male' ? booking.seatsCount : 0), 0);
    const goBackFromTrip = () => {
      if (tripBackTarget === 'driver') {
        setScreen('driver');
        return;
      }
      if (tripBackTarget === 'passenger') {
        setScreen('passenger');
        return;
      }
      setScreen('results');
    };
    return (
      <Shell>
        <div className="relative h-77.5 shrink-0 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80" className="absolute inset-0 h-full w-full object-cover" alt="" />
          <div className="absolute inset-0 bg-linear-to-b from-black/15 via-black/20 to-black/70" />
          <div className="absolute left-0 right-0 top-0 px-4 py-4 flex items-center justify-between">
            <button onClick={goBackFromTrip} className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <p className="text-lg font-bold text-white drop-shadow">Детали поездки</p>
            <button onClick={() => show('Ссылка на поездку скопирована')} className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute left-5 right-5 bottom-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-full bg-[#047857] px-3 py-1 text-xs font-black">PREMIUM</span>
              <span className="flex items-center gap-1 text-sm font-black"><Clock className="w-4 h-4" /> {selectedTrip.departureTime === 'По наполнении' ? 'По наполнении' : `Сегодня в ${selectedTrip.departureTime}`}</span>
            </div>
            <h1 className="text-4xl font-black leading-tight">{selectedTrip.fromCity} {'->'} {selectedTrip.toCity}</h1>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-32 -mt-7 space-y-5 bg-[#FAF7FF]">
          <div className="relative bg-white rounded-[22px] border border-[#E2E8F0] p-5 space-y-6 shadow-sm">
            <div className="grid grid-cols-[34px_1fr] gap-3">
              <div className="relative flex justify-center">
                <span className="mt-1 w-5 h-5 rounded-full border-4 border-[#D1FAE5] bg-[#047857]" />
                <span className="absolute top-7 -bottom-10.5 border-l-2 border-dashed border-[#B7E4D5]" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#047857]">Точка сбора{selectedTrip.departureTime !== 'По наполнении' ? ` · ${selectedTrip.departureTime}` : ''}</p>
                <p className="mt-2 text-lg font-bold">{selectedTrip.fromCity}, {selectedTrip.pickupPoint}</p>
                <p className="text-sm text-[#334155]">Ожидание у главного входа</p>
              </div>
            </div>
            <div className="grid grid-cols-[34px_1fr] gap-3">
              <div className="flex justify-center">
                <span className="mt-1 w-5 h-5 rounded-full border-4 border-[#D1FAE5] bg-[#047857]" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#64748B]">Время в пути · {formatDuration(selectedTrip)}</p>
                <p className="mt-2 text-lg font-bold">{selectedTrip.toCity}, {selectedTrip.dropoffPoint}</p>
                <p className="text-sm text-[#334155]">Возле центральной точки</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[22px] border border-[#E2E8F0] p-5 space-y-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={driver?.avatarUrl} className="w-20 h-20 rounded-2xl object-cover" alt="" />
                <span className="absolute -bottom-2 left-2 rounded-lg bg-[#047857] px-2 py-1 text-[10px] font-black text-white">VERIFIED</span>
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold">{driver?.fullName}</p>
                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#D1FAE5] px-2 py-1 text-xs font-black text-[#047857]"><Star className="w-3 h-3 fill-[#047857]" /> {profile?.rating || 4.9}</p>
                <span className="ml-2 text-xs font-bold text-[#334155]">{profile?.totalTrips || 124} поездки</span>
              </div>
              <button onClick={() => show('Чат откроется после бронирования')} className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[#047857]" />
              </button>
            </div>
            <div className="h-px bg-[#E2E8F0]" />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center"><Car className="w-5 h-5 text-[#047857]" /></div>
                <div>
                  <p className="font-black">{vehicle?.brand} {vehicle?.model}</p>
                  <p className="text-xs text-[#64748B]">{vehicle?.plateNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center"><CheckCircle className="w-5 h-5 text-[#047857]" /></div>
                <p className="font-black">Кондиционер</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[22px] border border-[#E2E8F0] p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-black">Кто уже едет</p>
              <span className="text-xs font-black text-[#64748B]">{acceptedBookings.length} броней</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#F8FAFC] p-4">
                <p className="text-xs text-[#64748B]">Женщины</p>
                <p className="text-2xl font-black text-[#047857]">{womenCount}</p>
              </div>
              <div className="rounded-2xl bg-[#F8FAFC] p-4">
                <p className="text-xs text-[#64748B]">Мужчины</p>
                <p className="text-2xl font-black text-[#0F172A]">{menCount}</p>
              </div>
            </div>
            {womenCount > 0 && <p className="text-xs font-bold text-[#047857]">В машине уже есть женщина-пассажир.</p>}
          </div>
          <div>
            <p className="mb-3 text-base font-bold">Количество мест</p>
            <div className="bg-white rounded-[22px] border border-[#E2E8F0] p-5 space-y-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-3xl font-black">{selectedSeatPrice} <span className="text-base font-bold">сомони</span></p>
                  <p className="mt-1 text-sm font-bold">за одно посадочное место</p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-[#F4F6FB] border border-[#E2E8F0] p-2">
                  <button onClick={() => setSelectedSeats(Math.max(1, selectedSeats - 1))} className="w-12 h-12 rounded-2xl bg-white text-2xl shadow-sm">-</button>
                  <span className="w-8 text-center text-2xl font-bold">{selectedSeats}</span>
                  <button onClick={() => setSelectedSeats(Math.min(selectedTrip.availableSeats, selectedSeats + 1))} className="w-12 h-12 rounded-2xl bg-white text-2xl shadow-sm">+</button>
                </div>
              </div>
              {selectedTrip.pricingMode === 'row' && (
                <div className="grid gap-2">
                  {seatRowsForSeats(selectedTrip.totalSeats).map(row => (
                    <button
                      key={row.key}
                      onClick={() => setSelectedSeatRow(row.key)}
                      className={`flex items-center justify-between rounded-2xl border p-3 text-left ${selectedSeatRow === row.key ? 'border-[#10B981] bg-[#D1FAE5]' : 'border-[#E2E8F0] bg-white'}`}
                    >
                      <span>
                        <span className="block text-sm font-black">{row.label}</span>
                        <span className="text-xs text-[#64748B]">{row.seats} мест(а)</span>
                      </span>
                      <span className="text-sm font-black text-[#047857]">{money(rowPriceForTrip(selectedTrip, row.key))}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="h-2 rounded-full bg-[#DDE5FF] overflow-hidden">
                <div className="h-full rounded-full bg-[#047857]" style={{ width: `${Math.max(12, (selectedSeats / selectedTrip.totalSeats) * 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs font-black uppercase tracking-[0.16em]">
                <span>Выбрано мест</span>
                <span>Осталось: {selectedTrip.availableSeats} из {selectedTrip.totalSeats}</span>
              </div>
            </div>
          </div>
          <div className="rounded-[22px] border border-[#A7F3D0] bg-[#ECFDF5] p-5 flex gap-4">
            <ShieldCheck className="w-6 h-6 text-[#047857] shrink-0" />
            <div>
              <p className="font-black uppercase text-[#047857]">Быстрая связь</p>
              <p className="mt-2 text-sm leading-6 text-[#064E3B]">После бронирования откроются телефон водителя, номер машины и чат. Если не договорились, можно отменить бронь без штрафа в течение 10 минут.</p>
            </div>
          </div>
          {selectedTrip.comment && <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 text-sm text-[#64748B]">{selectedTrip.comment}</div>}
        </div>
        <div className="p-4 bg-white border-t border-[#E2E8F0] safe-bottom-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#64748B]">Итого к оплате</p>
              <p className="text-2xl font-black">{total} сомони</p>
            </div>
            <button onClick={() => openBooking(selectedTrip)} className="h-14 min-w-44.5 rounded-2xl bg-[#047857] px-5 text-white font-black shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-all">Забронировать {'->'}</button>
          </div>
        </div>
      </Shell>
    );
  };

  const BookingScreen = () => {
    if (!selectedTrip) return <ResultsScreen />;
    const driver = userFor(selectedTrip.driverId);
    const vehicle = vehicleFor(selectedTrip.driverId);
    const selectedSeatPrice = rowPriceForTrip(selectedTrip, selectedSeatRow);
    const total = selectedSeats * selectedSeatPrice;
    return (
      <Shell>
        <Header title="Подтверждение брони" back={() => setScreen('trip')} />
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 pb-32 space-y-4">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 space-y-3">
            <p className="font-black text-lg">{selectedTrip.fromCity} {'->'} {selectedTrip.toCity}</p>
            <p className="text-sm text-[#64748B]">{selectedTrip.departureDate} в {selectedTrip.departureTime}</p>
            <p className="text-sm text-[#64748B]">Водитель: <b>{driver?.fullName}</b></p>
            <p className="text-sm text-[#64748B]">Авто: {vehicle?.brand} {vehicle?.model}, {vehicle?.color}</p>
            {selectedTrip.pricingMode === 'row' && <p className="text-sm text-[#64748B]">Место: <b>{seatRowsForSeats(selectedTrip.totalSeats).find(row => row.key === selectedSeatRow)?.label}</b></p>}
          </div>
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="font-black">Количество мест</p>
                <p className="text-sm text-[#64748B]">Доступно: {selectedTrip.availableSeats}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedSeats(Math.max(1, selectedSeats - 1))} className="w-11 h-11 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] font-black">-</button>
                <span className="w-6 text-center font-black">{selectedSeats}</span>
                <button onClick={() => setSelectedSeats(Math.min(selectedTrip.availableSeats, selectedSeats + 1))} className="w-11 h-11 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] font-black">+</button>
              </div>
            </div>
            {selectedTrip.pricingMode === 'row' && (
              <div className="grid gap-2">
                {seatRowsForSeats(selectedTrip.totalSeats).map(row => (
                  <button
                    key={row.key}
                    onClick={() => setSelectedSeatRow(row.key)}
                    className={`flex items-center justify-between rounded-2xl border p-3 text-left ${selectedSeatRow === row.key ? 'border-[#10B981] bg-[#D1FAE5]' : 'border-[#E2E8F0] bg-white'}`}
                  >
                    <span className="text-sm font-black">{row.label}</span>
                    <span className="text-sm font-black text-[#047857]">{money(rowPriceForTrip(selectedTrip, row.key))}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="bg-[#D1FAE5] rounded-2xl p-4 flex justify-between">
              <span className="font-bold text-[#047857]">{money(selectedSeatPrice)} x {selectedSeats}</span>
              <span className="font-black text-[#047857]">{money(total)}</span>
            </div>
          </div>
          <textarea value={bookingMessage} onChange={event => setBookingMessage(event.target.value)} className="w-full min-h-28 rounded-3xl bg-white border border-[#E2E8F0] p-4 text-sm outline-none focus:border-[#10B981]" placeholder="Сообщение пассажира водителю" />
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 space-y-2">
            <p className="font-black flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#10B981]" /> Оплата</p>
            <p className="text-sm text-[#64748B]">Оплата наличными или переводом при посадке. Предоплата не требуется.</p>
          </div>
        </div>
        <div className="p-4 bg-white border-t border-[#E2E8F0] safe-bottom-panel">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-[#64748B]">Итого</span>
            <span className="text-xl font-black text-[#047857]">{money(total)}</span>
          </div>
          <button onClick={confirmBooking} className={primaryClass}>Подтвердить бронь</button>
        </div>
      </Shell>
    );
  };

  const PassengerRequestScreen = () => (
    <Shell>
      <Header title="Заявка от адреса" back={() => setScreen('passenger')} />
      <div className="flex-1 min-h-0 overflow-y-auto p-5 pb-28 space-y-4">
        <CitySelect value={fromCity} onChange={setFromCity} cities={cities} language={language} className={selectClass} />
        <CitySelect value={toCity} onChange={setToCity} cities={cities} language={language} className={selectClass} />
        <div className="space-y-2">
          <input value={requestPickup} onChange={event => setRequestPickup(event.target.value)} className={inputClass} placeholder="Точный адрес посадки" />
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setPointFromLocation('requestPickup')} className="h-11 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-black text-[#047857]">Моя локация</button>
            <button type="button" onClick={() => setPointFromMap('requestPickup')} className="h-11 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-black text-[#047857]">Выбрать на карте</button>
          </div>
        </div>
        <div className="space-y-2">
          <input value={requestDropoff} onChange={event => setRequestDropoff(event.target.value)} className={inputClass} placeholder="Точка высадки" />
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setPointFromLocation('requestDropoff')} className="h-11 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-black text-[#047857]">Моя локация</button>
            <button type="button" onClick={() => setPointFromMap('requestDropoff')} className="h-11 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-black text-[#047857]">Выбрать на карте</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input type="date" value={date} onChange={event => setDate(event.target.value)} className={inputClass} />
          <input value={requestTime} onChange={event => setRequestTime(event.target.value)} disabled={requestTimeMode === 'whenFull'} className={inputClass} placeholder="Время" />
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white border border-[#E2E8F0] p-1">
          <button onClick={() => setRequestTimeMode('exact')} className={`h-11 rounded-xl text-xs font-black ${requestTimeMode === 'exact' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>Точное время</button>
          <button onClick={() => setRequestTimeMode('whenFull')} className={`h-11 rounded-xl text-xs font-black ${requestTimeMode === 'whenFull' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>По наполнении</button>
        </div>
        <input type="number" value={searchSeats} onChange={event => setSearchSeats(Number(event.target.value))} className={inputClass} placeholder="Количество мест" />
        <input type="number" value={requestPrice} onChange={event => setRequestPrice(Number(event.target.value))} className={inputClass} placeholder="Цена за 1 человека" />
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-3xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#047857]">Итого по заявке</p>
            <p className="text-sm text-[#64748B]">{money(requestPrice)} x {searchSeats} мест(а)</p>
          </div>
          <p className="text-2xl font-black text-[#047857]">{money(requestPrice * searchSeats)}</p>
        </div>
        <textarea value={requestComment} onChange={event => setRequestComment(event.target.value)} className="w-full min-h-24 rounded-2xl bg-white border border-[#E2E8F0] p-3 text-sm outline-none" placeholder="Комментарий" />
      </div>
      <div className="p-4 bg-white border-t border-[#E2E8F0] safe-bottom-panel">
        <button onClick={createPassengerRequest} className={primaryClass}>Опубликовать заявку</button>
      </div>
    </Shell>
  );

  const ReviewScreen = () => (
    <Shell>
      <Header title="Оценить поездку" back={() => setScreen(currentUser?.role === UserRole.Driver ? 'driver' : 'passenger')} />
      <div className="p-5 space-y-4">
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5">
          <p className="font-black mb-3">Оценка</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => <button key={star} onClick={() => setReviewRating(star)}><Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} /></button>)}
          </div>
        </div>
        <textarea value={reviewText} onChange={event => setReviewText(event.target.value)} className="w-full min-h-32 rounded-3xl bg-white border border-[#E2E8F0] p-4 text-sm outline-none" placeholder="Безопасность, пунктуальность, чистота, вежливость..." />
        <button onClick={() => { setScreen(currentUser?.role === UserRole.Driver ? 'driver' : 'passenger'); show('Спасибо за отзыв'); }} className={primaryClass}>Отправить отзыв</button>
      </div>
    </Shell>
  );

  let content: React.ReactNode;
  if (!currentUser && ['lang', 'welcome', 'login', 'forgot', 'role', 'register'].includes(screen)) content = (
    <AuthScreens
      screen={screen}
      setScreen={setScreen}
      setLanguage={setLanguage}
      t={t}
      inputClass={inputClass}
      primaryClass={primaryClass}
      authPhone={authPhone}
      updateAuthPhone={updateAuthPhone}
      authPassword={authPassword}
      setAuthPassword={setAuthPassword}
      login={login}
      resetCode={resetCode}
      setResetCode={setResetCode}
      resetPassword={resetPassword}
      setResetPassword={setResetPassword}
      resetConfirmPassword={resetConfirmPassword}
      setResetConfirmPassword={setResetConfirmPassword}
      recoverPassword={recoverPassword}
      regRole={regRole}
      setRegRole={setRegRole}
      firstName={firstName}
      setFirstName={setFirstName}
      lastName={lastName}
      setLastName={setLastName}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      gender={gender}
      setGender={setGender}
      licenseNumber={licenseNumber}
      setLicenseNumber={setLicenseNumber}
      carBrand={carBrand}
      setCarBrand={setCarBrand}
      carModel={carModel}
      setCarModel={setCarModel}
      carColor={carColor}
      setCarColor={setCarColor}
      carYear={carYear}
      setCarYear={setCarYear}
      carPlate={carPlate}
      setCarPlate={setCarPlate}
      carSeats={carSeats}
      setCarSeats={setCarSeats}
      register={register}
    />
  );
  else if (screen === 'results') content = ResultsScreen();
  else if (screen === 'trip') content = TripDetailsScreen();
  else if (screen === 'booking') content = BookingScreen();
  else if (screen === 'request') content = PassengerRequestScreen();
  else if (screen === 'review') content = ReviewScreen();
  else if (currentUser?.role === UserRole.Driver) content = DriverApp();
  else content = PassengerApp();

  return (
    <PhoneDeviceFrame
      deviceType={deviceType}
      setDeviceType={setDeviceType}
      topNotification={topNotification}
      setTopNotification={setTopNotification}
      openNotification={openNotification}
      formatDateTime={formatDateTime}
      toast={toast}
      unreadNotificationsCount={unreadNotificationsCount}
      onOpenNotifications={currentUser ? () => {
        if (currentUser.role === UserRole.Driver) {
          setDriverTab('notifications');
          setScreen('driver');
          return;
        }
        setPassengerTab('notifications');
        setScreen('passenger');
      } : undefined}
    >
      {content}
    </PhoneDeviceFrame>
  );
}
