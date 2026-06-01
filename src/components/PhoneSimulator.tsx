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
import { DriverApp } from './phoneSimulator/screens/DriverScreens';
import { BookingScreen, PassengerApp, PassengerRequestScreen, ResultsScreen, ReviewScreen, TripDetailsScreen } from './phoneSimulator/screens/PassengerScreens';
import { useBookingFlow } from './phoneSimulator/hooks/useBookingFlow';

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
  const [driverCity, setDriverCity] = useState('Ð”ÑƒÑˆÐ°Ð½Ð±Ðµ');
  const [driverHomeMode, setDriverHomeMode] = useState<'city' | 'route'>('city');
  const [driverHomeView, setDriverHomeView] = useState<'trips' | 'requests'>('trips');
  const [driverRouteTo, setDriverRouteTo] = useState('Ð¥ÑƒÐ´Ð¶Ð°Ð½Ð´');
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
  const [city, setCity] = useState('Ð”ÑƒÑˆÐ°Ð½Ð±Ðµ');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [carBrand, setCarBrand] = useState('Toyota');
  const [carModel, setCarModel] = useState('Camry');
  const [carColor, setCarColor] = useState('Ð‘ÐµÐ»Ñ‹Ð¹');
  const [carYear, setCarYear] = useState('2022');
  const [carPlate, setCarPlate] = useState('7777 TJ 01');
  const [carSeats, setCarSeats] = useState(4);

  const [fromCity, setFromCity] = useState('Ð”ÑƒÑˆÐ°Ð½Ð±Ðµ');
  const [toCity, setToCity] = useState('Ð¥ÑƒÐ´Ð¶Ð°Ð½Ð´');
  const [date, setDate] = useState(today);
  const [searchSeats, setSearchSeats] = useState(1);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterWomen, setFilterWomen] = useState(false);
  const [filterBaggage, setFilterBaggage] = useState(false);
  const [tripSort, setTripSort] = useState<'price' | 'time' | 'rating'>('price');

  const [createFrom, setCreateFrom] = useState('Ð”ÑƒÑˆÐ°Ð½Ð±Ðµ');
  const [createTo, setCreateTo] = useState('Ð¥ÑƒÐ´Ð¶Ð°Ð½Ð´');
  const [createDate, setCreateDate] = useState(today);
  const [createTime, setCreateTime] = useState('09:00');
  const [createTimeMode, setCreateTimeMode] = useState<'exact' | 'whenFull'>('exact');
  const [createPrice, setCreatePrice] = useState(120);
  const [createPricingMode, setCreatePricingMode] = useState<'flat' | 'row'>('flat');
  const [frontSeatPrice, setFrontSeatPrice] = useState(140);
  const [secondRowPrice, setSecondRowPrice] = useState(120);
  const [thirdRowPrice, setThirdRowPrice] = useState(100);
  const [createSeats, setCreateSeats] = useState(4);
  const [createPickup, setCreatePickup] = useState('ÐÐ²Ñ‚Ð¾Ð²Ð¾ÐºÐ·Ð°Ð»');
  const [createDropoff, setCreateDropoff] = useState('Ð¦ÐµÐ½Ñ‚Ñ€ Ð³Ð¾Ñ€Ð¾Ð´Ð°');
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
      fromCity: 'Ð”ÑƒÑˆÐ°Ð½Ð±Ðµ',
      toCity: 'Ð¥ÑƒÐ´Ð¶Ð°Ð½Ð´',
      pickupAddress: 'ÑƒÐ». Ð ÑƒÐ´Ð°ÐºÐ¸ 18',
      dropoffAddress: 'Ñ†ÐµÐ½Ñ‚Ñ€ Ð¥ÑƒÐ´Ð¶Ð°Ð½Ð´Ð°',
      departureDate: today,
      departureTime: '12:00',
      seatsCount: 2,
      baggageAllowed: true,
      genderPreference: 'any',
      desiredPrice: 160,
      comment: 'ÐÑƒÐ¶Ð½Ð° Ð¼Ð°ÑˆÐ¸Ð½Ð° Ð¾Ñ‚ Ð°Ð´Ñ€ÐµÑÐ°, ÐµÑÑ‚ÑŒ Ð±Ð°Ð³Ð°Ð¶.',
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
      setDriverCity(currentUser.city || 'Ð”ÑƒÑˆÐ°Ð½Ð±Ðµ');
    } else if (currentUser.role === UserRole.Passenger) {
      setScreen('passenger');
      setPassengerTab('search');
      setPassengerTripsView('active');
    }
  }, [currentUser?.id]);

  useEffect(() => {
    setCity('Ð”ÑƒÑˆÐ°Ð½Ð±Ðµ');
    setFromCity('Ð”ÑƒÑˆÐ°Ð½Ð±Ðµ');
    setToCity('Ð¥ÑƒÐ´Ð¶Ð°Ð½Ð´');
    setCreateFrom('Ð”ÑƒÑˆÐ°Ð½Ð±Ðµ');
    setCreateTo('Ð¥ÑƒÐ´Ð¶Ð°Ð½Ð´');
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
      setCreatePickup('ÐœÐ¾Ñ Ñ‚ÐµÐºÑƒÑ‰Ð°Ñ Ð»Ð¾ÐºÐ°Ñ†Ð¸Ñ');
      setCreatePickupLat(38.5598);
      setCreatePickupLng(68.7870);
    } else if (kind === 'tripDropoff') {
      setCreateDropoff('Ð¢Ð¾Ñ‡ÐºÐ° Ð²Ñ‹ÑÐ°Ð´ÐºÐ¸ Ð²Ñ‹Ð±Ñ€Ð°Ð½Ð° Ð¿Ð¾ Ð»Ð¾ÐºÐ°Ñ†Ð¸Ð¸');
      setCreateDropoffLat(40.2826);
      setCreateDropoffLng(69.6222);
    } else if (kind === 'requestPickup') {
      setRequestPickup('ÐœÐ¾Ñ Ñ‚ÐµÐºÑƒÑ‰Ð°Ñ Ð»Ð¾ÐºÐ°Ñ†Ð¸Ñ');
      setRequestPickupLat(38.5598);
      setRequestPickupLng(68.7870);
    } else {
      setRequestDropoff('Ð¢Ð¾Ñ‡ÐºÐ° Ð²Ñ‹ÑÐ°Ð´ÐºÐ¸ Ð²Ñ‹Ð±Ñ€Ð°Ð½Ð° Ð¿Ð¾ Ð»Ð¾ÐºÐ°Ñ†Ð¸Ð¸');
      setRequestDropoffLat(40.2826);
      setRequestDropoffLng(69.6222);
    }
    show('Ð›Ð¾ÐºÐ°Ñ†Ð¸Ñ Ð´Ð¾Ð±Ð°Ð²Ð»ÐµÐ½Ð°. Ð’ Ñ€ÐµÐ°Ð»ÑŒÐ½Ð¾Ð¼ Ð¿Ñ€Ð¸Ð»Ð¾Ð¶ÐµÐ½Ð¸Ð¸ Ð¾Ñ‚ÐºÑ€Ð¾ÐµÑ‚ÑÑ Ñ€Ð°Ð·Ñ€ÐµÑˆÐµÐ½Ð¸Ðµ Ð³ÐµÐ¾Ð»Ð¾ÐºÐ°Ñ†Ð¸Ð¸.');
  };

  const setPointFromMap = (kind: 'tripPickup' | 'tripDropoff' | 'requestPickup' | 'requestDropoff') => {
    if (kind === 'tripPickup') {
      setCreatePickup('Ð¢Ð¾Ñ‡ÐºÐ° Ð¿Ð¾ÑÐ°Ð´ÐºÐ¸ Ð²Ñ‹Ð±Ñ€Ð°Ð½Ð° Ð½Ð° ÐºÐ°Ñ€Ñ‚Ðµ');
      setCreatePickupLat(38.5731);
      setCreatePickupLng(68.7864);
    } else if (kind === 'tripDropoff') {
      setCreateDropoff('Ð¢Ð¾Ñ‡ÐºÐ° Ð²Ñ‹ÑÐ°Ð´ÐºÐ¸ Ð²Ñ‹Ð±Ñ€Ð°Ð½Ð° Ð½Ð° ÐºÐ°Ñ€Ñ‚Ðµ');
      setCreateDropoffLat(40.2893);
      setCreateDropoffLng(69.6187);
    } else if (kind === 'requestPickup') {
      setRequestPickup('Ð¢Ð¾Ñ‡ÐºÐ° Ð¿Ð¾ÑÐ°Ð´ÐºÐ¸ Ð²Ñ‹Ð±Ñ€Ð°Ð½Ð° Ð½Ð° ÐºÐ°Ñ€Ñ‚Ðµ');
      setRequestPickupLat(38.5731);
      setRequestPickupLng(68.7864);
    } else {
      setRequestDropoff('Ð¢Ð¾Ñ‡ÐºÐ° Ð²Ñ‹ÑÐ°Ð´ÐºÐ¸ Ð²Ñ‹Ð±Ñ€Ð°Ð½Ð° Ð½Ð° ÐºÐ°Ñ€Ñ‚Ðµ');
      setRequestDropoffLat(40.2893);
      setRequestDropoffLng(69.6187);
    }
    show('Ð¢Ð¾Ñ‡ÐºÐ° Ð²Ñ‹Ð±Ñ€Ð°Ð½Ð° Ð½Ð° ÐºÐ°Ñ€Ñ‚Ðµ.');
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
    if (!user) return show('ÐÐµÐ²ÐµÑ€Ð½Ñ‹Ð¹ Ñ‚ÐµÐ»ÐµÑ„Ð¾Ð½ Ð¸Ð»Ð¸ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ');
    if (!user.isActive) return show('ÐŸÑ€Ð¾Ñ„Ð¸Ð»ÑŒ Ð·Ð°Ð±Ð»Ð¾ÐºÐ¸Ñ€Ð¾Ð²Ð°Ð½');
    setCurrentUser(user);
    setScreen(user.role === UserRole.Driver ? 'driver' : 'passenger');
  };

  const recoverPassword = () => {
    const phone = authPhone.trim();
    const user = users.find(item => item.phone === phone);
    if (!user) return show('ÐŸÐ¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÑŒ Ñ Ñ‚Ð°ÐºÐ¸Ð¼ Ñ‚ÐµÐ»ÐµÑ„Ð¾Ð½Ð¾Ð¼ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½');
    if (resetCode.trim() !== '7171') return show('ÐÐµÐ²ÐµÑ€Ð½Ñ‹Ð¹ ÐºÐ¾Ð´ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´ÐµÐ½Ð¸Ñ');
    if (resetPassword.length < 4) return show('ÐŸÐ°Ñ€Ð¾Ð»ÑŒ Ð´Ð¾Ð»Ð¶ÐµÐ½ Ð±Ñ‹Ñ‚ÑŒ Ð½Ðµ ÐºÐ¾Ñ€Ð¾Ñ‡Ðµ 4 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð²');
    if (resetPassword !== resetConfirmPassword) return show('ÐŸÐ°Ñ€Ð¾Ð»Ð¸ Ð½Ðµ ÑÐ¾Ð²Ð¿Ð°Ð´Ð°ÑŽÑ‚');

    setUsers(prev => prev.map(item =>
      item.id === user.id ? { ...item, password: resetPassword, updatedAt: new Date().toISOString() } : item
    ));
    setAuthPassword('');
    setResetCode('');
    setResetPassword('');
    setResetConfirmPassword('');
    setScreen('login');
    show('ÐŸÐ°Ñ€Ð¾Ð»ÑŒ Ð¾Ð±Ð½Ð¾Ð²Ð»ÐµÐ½. Ð’Ð¾Ð¹Ð´Ð¸Ñ‚Ðµ Ñ Ð½Ð¾Ð²Ñ‹Ð¼ Ð¿Ð°Ñ€Ð¾Ð»ÐµÐ¼');
  };

  const register = () => {
    if (!firstName.trim() || !lastName.trim() || !authPhone.trim() || !authPassword) return show('Ð—Ð°Ð¿Ð¾Ð»Ð½Ð¸Ñ‚Ðµ Ð¾Ð±ÑÐ·Ð°Ñ‚ÐµÐ»ÑŒÐ½Ñ‹Ðµ Ð¿Ð¾Ð»Ñ');
    if (authPassword !== confirmPassword) return show('ÐŸÐ°Ñ€Ð¾Ð»Ð¸ Ð½Ðµ ÑÐ¾Ð²Ð¿Ð°Ð´Ð°ÑŽÑ‚');
    if (users.some(user => user.phone === authPhone.trim())) return show('Ð­Ñ‚Ð¾Ñ‚ Ñ‚ÐµÐ»ÐµÑ„Ð¾Ð½ ÑƒÐ¶Ðµ Ð·Ð°Ñ€ÐµÐ³Ð¸ÑÑ‚Ñ€Ð¸Ñ€Ð¾Ð²Ð°Ð½');

    if (regRole === UserRole.Driver && (!licenseNumber.trim() || !carPlate.trim())) {
      return show('Ð”Ð»Ñ Ð²Ð¾Ð´Ð¸Ñ‚ÐµÐ»Ñ Ð½ÑƒÐ¶Ð½Ñ‹ Ð¿Ñ€Ð°Ð²Ð° Ð¸ Ð´Ð°Ð½Ð½Ñ‹Ðµ Ð°Ð²Ñ‚Ð¾Ð¼Ð¾Ð±Ð¸Ð»Ñ');
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
      show('Ð’Ð°Ñˆ Ð¿Ñ€Ð¾Ñ„Ð¸Ð»ÑŒ Ð²Ð¾Ð´Ð¸Ñ‚ÐµÐ»Ñ Ð¾Ñ‚Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½ Ð½Ð° Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐºÑƒ');
      return;
    }

    setCurrentUser(newUser);
    setScreen('passenger');
    show('ÐŸÐ°ÑÑÐ°Ð¶Ð¸Ñ€ Ð·Ð°Ñ€ÐµÐ³Ð¸ÑÑ‚Ñ€Ð¸Ñ€Ð¾Ð²Ð°Ð½. ÐœÐ¾Ð¶Ð½Ð¾ Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÑŒÑÑ Ð¿Ñ€Ð¸Ð»Ð¾Ð¶ÐµÐ½Ð¸ÐµÐ¼');
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
    setCreateFrom('Ð”ÑƒÑˆÐ°Ð½Ð±Ðµ');
    setCreateTo('Ð¥ÑƒÐ´Ð¶Ð°Ð½Ð´');
    setCreateDate(today);
    setCreateTime('09:00');
    setCreateTimeMode('exact');
    setCreatePrice(120);
    setCreatePricingMode('flat');
    setFrontSeatPrice(140);
    setSecondRowPrice(120);
    setThirdRowPrice(100);
    setCreateSeats(4);
    setCreatePickup('ÐÐ²Ñ‚Ð¾Ð²Ð¾ÐºÐ·Ð°Ð»');
    setCreateDropoff('Ð¦ÐµÐ½Ñ‚Ñ€ Ð³Ð¾Ñ€Ð¾Ð´Ð°');
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
    setCreateTimeMode(trip.departureTime === 'ÐŸÐ¾ Ð½Ð°Ð¿Ð¾Ð»Ð½ÐµÐ½Ð¸Ð¸' ? 'whenFull' : 'exact');
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

  const {
    confirmBooking,
    cancelBooking,
    cancelBookingByDriver,
    acceptBooking,
    rejectBooking,
    confirmPassengerRide,
    confirmDriverRide,
    completeTrip,
    cancelTrip
  } = useBookingFlow({
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
  });

  const publishTrip = () => {
    if (!currentUser) return;
    const profile = driverProfileFor(currentUser.id);
    const vehicle = vehicleFor(currentUser.id);
    if (profile?.verificationStatus !== VerificationStatus.Verified || vehicle?.verificationStatus !== VerificationStatus.Verified) {
      return show('Ð’Ð°Ñˆ Ð¿Ñ€Ð¾Ñ„Ð¸Ð»ÑŒ Ð²Ð¾Ð´Ð¸Ñ‚ÐµÐ»Ñ Ð¾Ñ‚Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½ Ð½Ð° Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐºÑƒ. Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð¿Ð¾ÐµÐ·Ð´Ð¾Ðº Ð´Ð¾ÑÑ‚ÑƒÐ¿Ð½Ð¾ Ð¿Ð¾ÑÐ»Ðµ Ð¾Ð´Ð¾Ð±Ñ€ÐµÐ½Ð¸Ñ.');
    }
    const activeTrip = trips.find(trip => trip.driverId === currentUser.id && ![TripStatus.Completed, TripStatus.Cancelled, TripStatus.BlockedByAdmin].includes(trip.status));
    if (activeTrip && !editingTripId) return show('Ð—Ð°Ð²ÐµÑ€ÑˆÐ¸Ñ‚Ðµ Ñ‚ÐµÐºÑƒÑ‰ÑƒÑŽ Ð¿Ð¾ÐµÐ·Ð´ÐºÑƒ, Ñ‡Ñ‚Ð¾Ð±Ñ‹ ÑÐ¾Ð·Ð´Ð°Ñ‚ÑŒ Ð½Ð¾Ð²ÑƒÑŽ');
    if (!createPickup.trim() || !createDropoff.trim()) return show('Ð£ÐºÐ°Ð¶Ð¸Ñ‚Ðµ Ñ‚Ð¾Ñ‡Ð½Ñ‹Ð¹ Ð°Ð´Ñ€ÐµÑ Ð¿Ð¾ÑÐ°Ð´ÐºÐ¸ Ð¸ Ñ‚Ð¾Ñ‡ÐºÑƒ Ð²Ñ‹ÑÐ°Ð´ÐºÐ¸');
    if (editingTripId) {
      setTrips(prev => prev.map(trip => trip.id === editingTripId ? {
        ...trip,
        fromCity: createFrom,
        toCity: createTo,
        departureDate: createDate,
        departureTime: createTimeMode === 'whenFull' ? 'ÐŸÐ¾ Ð½Ð°Ð¿Ð¾Ð»Ð½ÐµÐ½Ð¸Ð¸' : createTime,
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
      show('ÐŸÐ¾ÐµÐ·Ð´ÐºÐ° Ð¾Ð±Ð½Ð¾Ð²Ð»ÐµÐ½Ð°');
      return;
    }
    const trip: Trip = {
      id: `trip_${Date.now()}`,
      driverId: currentUser.id,
      vehicleId: vehicle.id,
      fromCity: createFrom,
      toCity: createTo,
      departureDate: createDate,
      departureTime: createTimeMode === 'whenFull' ? 'ÐŸÐ¾ Ð½Ð°Ð¿Ð¾Ð»Ð½ÐµÐ½Ð¸Ð¸' : createTime,
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
    show('ÐŸÐ¾ÐµÐ·Ð´ÐºÐ° Ð¾Ð¿ÑƒÐ±Ð»Ð¸ÐºÐ¾Ð²Ð°Ð½Ð°');
  };

  const createPassengerRequest = () => {
    if (!currentUser) return;
    if (!requestPickup.trim() || !requestDropoff.trim()) return show('Ð£ÐºÐ°Ð¶Ð¸Ñ‚Ðµ Ñ‚Ð¾Ñ‡Ð½Ñ‹Ð¹ Ð°Ð´Ñ€ÐµÑ Ð¿Ð¾ÑÐ°Ð´ÐºÐ¸ Ð¸ Ñ‚Ð¾Ñ‡ÐºÑƒ Ð²Ñ‹ÑÐ°Ð´ÐºÐ¸');
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
      departureTime: requestTimeMode === 'whenFull' ? 'ÐŸÐ¾ Ð½Ð°Ð¿Ð¾Ð»Ð½ÐµÐ½Ð¸Ð¸' : requestTime,
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
    show('Ð—Ð°ÑÐ²ÐºÐ° Ð¾Ñ‚ Ð°Ð´Ñ€ÐµÑÐ° Ð¾Ð¿ÑƒÐ±Ð»Ð¸ÐºÐ¾Ð²Ð°Ð½Ð°');
  };

  const offerPassengerRequest = (request: PassengerRequest) => {
    if (!currentUser) return;
    setPassengerRequests(prev => prev.map(item => item.id === request.id ? { ...item, acceptedByDriverId: currentUser.id, status: 'pending' } : item));
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        userId: request.passengerId,
        title: 'Ð’Ð¾Ð´Ð¸Ñ‚ÐµÐ»ÑŒ Ð³Ð¾Ñ‚Ð¾Ð² Ð·Ð°Ð±Ñ€Ð°Ñ‚ÑŒ Ð²Ð°Ñ',
        message: `${currentUser.fullName} Ð¾Ñ‚ÐºÐ»Ð¸ÐºÐ½ÑƒÐ»ÑÑ Ð½Ð° Ð²Ð°ÑˆÑƒ Ð·Ð°ÑÐ²ÐºÑƒ. ÐŸÐ¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ñ‚Ðµ Ð²Ð¾Ð´Ð¸Ñ‚ÐµÐ»Ñ.`,
        type: 'driver_offer',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
    show('ÐŸÐ°ÑÑÐ°Ð¶Ð¸Ñ€Ñƒ Ð¾Ñ‚Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¾ Ð¿Ñ€ÐµÐ´Ð»Ð¾Ð¶ÐµÐ½Ð¸Ðµ. Ð‘Ñ€Ð¾Ð½ÑŒ ÑÑ‚Ð°Ð½ÐµÑ‚ Ð°ÐºÑ‚Ð¸Ð²Ð½Ð¾Ð¹ Ð¿Ð¾ÑÐ»Ðµ ÐµÐ³Ð¾ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´ÐµÐ½Ð¸Ñ.');
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
    if (!trip) return show('Ð£ Ð²Ð¾Ð´Ð¸Ñ‚ÐµÐ»Ñ ÑÐµÐ¹Ñ‡Ð°Ñ Ð½ÐµÑ‚ Ð¿Ð¾Ð´Ñ…Ð¾Ð´ÑÑ‰ÐµÐ¹ Ð°ÐºÑ‚Ð¸Ð²Ð½Ð¾Ð¹ Ð¿Ð¾ÐµÐ·Ð´ÐºÐ¸');
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
        title: 'ÐŸÐ°ÑÑÐ°Ð¶Ð¸Ñ€ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ð» Ð¿Ñ€ÐµÐ´Ð»Ð¾Ð¶ÐµÐ½Ð¸Ðµ',
        message: 'ÐšÐ¾Ð½Ñ‚Ð°ÐºÑ‚Ñ‹ Ð¸ Ñ‡Ð°Ñ‚ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ñ‹. ÐŸÐ¾ÑÐ»Ðµ Ð¾Ð±ÑÑƒÐ¶Ð´ÐµÐ½Ð¸Ñ Ð¾Ñ‚Ð¼ÐµÑ‚ÑŒÑ‚Ðµ Â«Ð¢Ð¾Ñ‡Ð½Ð¾ ÐµÐ´ÐµÐ¼Â».',
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
    show('ÐŸÑ€ÐµÐ´Ð»Ð¾Ð¶ÐµÐ½Ð¸Ðµ Ð¿Ñ€Ð¸Ð½ÑÑ‚Ð¾. ÐšÐ¾Ð½Ñ‚Ð°ÐºÑ‚Ñ‹ Ð¸ Ñ‡Ð°Ñ‚ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ñ‹.');
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
        title: 'ÐÐ¾Ð²Ð¾Ðµ ÑÐ¾Ð¾Ð±Ñ‰ÐµÐ½Ð¸Ðµ',
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
                    <p className="text-xs text-[#64748B]">{trip.departureDate} Ð² {trip.departureTime}</p>
                  </div>
                  <span className="h-7 px-3 rounded-full text-xs font-black flex items-center bg-[#D1FAE5] text-[#047857]">{trip.status}</span>
                </div>
                <p className="text-sm text-[#64748B]">{trip.pickupPoint} {'->'} {trip.dropoffPoint}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-[#F8FAFC] p-3">
                    <p className="text-[11px] text-[#64748B]">{t.price}</p>
                    <p className="font-black">{trip.pricingMode === 'row' ? `Ð¾Ñ‚ ${money(displayPriceForTrip(trip))}` : money(trip.pricePerSeat)}</p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] p-3">
                    <p className="text-[11px] text-[#64748B]">{t.seats}</p>
                    <p className="font-black">{trip.availableSeats}</p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] p-3">
                    <p className="text-[11px] text-[#64748B]">Ð‘Ñ€Ð¾Ð½Ð¸</p>
                    <p className="font-black">{bookedSeats}/{trip.totalSeats}</p>
                    <p className="text-[10px] font-bold text-[#64748B]">Ð¼ÐµÑÑ‚ Ð·Ð°Ð½ÑÑ‚Ð¾</p>
                  </div>
                </div>
                {view === 'active' && tripBookings.length > 0 && (
                  <div className="rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] p-3">
                    <p className="text-xs font-black text-[#047857]">Live: {pendingCount} Ð½Ð¾Ð²Ñ‹Ñ… Ð±Ñ€Ð¾Ð½ÐµÐ¹, {acceptedSeats} Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´Ñ‘Ð½Ð½Ñ‹Ñ… Ð¼ÐµÑÑ‚</p>
                  </div>
                )}
                {view === 'active' && acceptedTripBookings.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-black text-[#64748B]">ÐŸÐ°ÑÑÐ°Ð¶Ð¸Ñ€Ñ‹ ÑÑ‚Ð¾Ð³Ð¾ Ñ€ÐµÐ¹ÑÐ°</p>
                    {acceptedTripBookings.map(booking => {
                      const passenger = userFor(booking.passengerId);
                      return (
                        <div key={booking.id} className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3 space-y-3">
                          <div className="flex items-center gap-3">
                            <img src={passenger?.avatarUrl} className="w-11 h-11 rounded-2xl object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-sm truncate">{passenger?.fullName}</p>
                              <p className="text-xs text-[#64748B]">{booking.seatsCount} Ð¼ÐµÑÑ‚(Ð°) Â· {money(booking.totalPrice)}</p>
                              <p className="text-xs font-bold text-[#047857]">{passenger?.phone}</p>
                            </div>
                            <span className="h-7 px-2 rounded-full bg-[#D1FAE5] text-[#047857] text-[11px] font-black flex items-center">ÐŸÑ€Ð¸Ð½ÑÑ‚Ð¾</span>
                          </div>
                          <p className="text-xs font-bold text-[#64748B]">
                            ÐŸÐ°ÑÑÐ°Ð¶Ð¸Ñ€: {booking.passengerFinalConfirmedAt ? 'Ñ‚Ð¾Ñ‡Ð½Ð¾ ÐµÐ´ÐµÑ‚' : 'Ð¾Ð¶Ð¸Ð´Ð°ÐµÑ‚ÑÑ'} Â· Ð’Ð¾Ð´Ð¸Ñ‚ÐµÐ»ÑŒ: {booking.driverFinalConfirmedAt ? 'Ñ‚Ð¾Ñ‡Ð½Ð¾ ÐµÐ´ÐµÑ‚' : 'Ð¾Ð¶Ð¸Ð´Ð°ÐµÑ‚ÑÑ'}
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
                              Ð§Ð°Ñ‚
                            </button>
                            <a href={`tel:${passenger?.phone}`} className="h-11 rounded-2xl bg-[#10B981] text-white font-black flex items-center justify-center">
                              ÐŸÐ¾Ð·Ð²Ð¾Ð½Ð¸Ñ‚ÑŒ
                            </a>
                          </div>
                          {!booking.driverFinalConfirmedAt && (
                            <div className="grid grid-cols-2 gap-2">
                              <button onClick={() => cancelBookingByDriver(booking)} className="h-11 rounded-2xl bg-white border border-amber-200 text-amber-800 font-black">
                                ÐžÑ‚Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ
                              </button>
                              <button onClick={() => confirmDriverRide(booking)} className="h-11 rounded-2xl bg-[#047857] text-white font-black">
                                Ð¢Ð¾Ñ‡Ð½Ð¾ ÐµÐ´Ñƒ
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
                    <button onClick={() => cancelTrip(trip.id)} className="h-12 rounded-2xl bg-white border border-rose-200 text-rose-700 font-black shadow-sm active:scale-[0.98] transition-all">ÐžÑ‚Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ</button>
                    <button onClick={() => completeTrip(trip.id)} className="h-12 rounded-2xl bg-[#0F172A] text-white font-black shadow-sm active:scale-[0.98] transition-all">Ð—Ð°Ð²ÐµÑ€ÑˆÐ¸Ñ‚ÑŒ</button>
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
        <h2 className="text-xl font-black">ÐŸÐ¾ÐµÐ·Ð´ÐºÐ¸</h2>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white border border-[#E2E8F0] p-1">
          <button onClick={() => setView('active')} className={`h-11 rounded-xl text-sm font-black transition-all ${view === 'active' ? 'bg-[#10B981] text-white shadow-sm' : 'text-[#64748B]'}`}>
            ÐÐºÑ‚ÑƒÐ°Ð»ÑŒÐ½Ñ‹Ðµ
          </button>
          <button onClick={() => setView('completed')} className={`h-11 rounded-xl text-sm font-black transition-all ${view === 'completed' ? 'bg-[#10B981] text-white shadow-sm' : 'text-[#64748B]'}`}>
            Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹Ðµ
          </button>
        </div>
        {list.length === 0 && <p className="text-sm text-[#64748B] bg-white rounded-3xl p-6 text-center">{view === 'active' ? 'ÐÐºÑ‚ÑƒÐ°Ð»ÑŒÐ½Ñ‹Ñ… Ð¿Ð¾ÐµÐ·Ð´Ð¾Ðº Ð¿Ð¾ÐºÐ° Ð½ÐµÑ‚' : 'Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹Ñ… Ð¿Ð¾ÐµÐ·Ð´Ð¾Ðº Ð¿Ð¾ÐºÐ° Ð½ÐµÑ‚'}</p>}
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
                  <p className="text-xs text-[#64748B]">{trip?.departureDate} Ð² {trip?.departureTime}</p>
                </div>
                <span className={`h-7 px-3 rounded-full text-xs font-black flex items-center ${isAccepted ? 'bg-[#D1FAE5] text-[#047857]' : booking.status === BookingStatus.Pending ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-[#64748B]'}`}>
                  {booking.status}
                </span>
              </div>
              <p className="text-sm text-[#64748B]">{booking.seatsCount} Ð¼ÐµÑÑ‚(Ð°), Ð²ÑÐµÐ³Ð¾ {money(booking.totalPrice)}</p>
              <div className="bg-[#F8FAFC] rounded-2xl p-3 flex items-center gap-3">
                <img src={peer?.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                <div className="flex-1">
                  <p className="font-bold text-sm">{peer?.fullName}</p>
                  <p className="text-xs text-[#64748B]">{canChat ? peer?.phone : 'ÐšÐ¾Ð½Ñ‚Ð°ÐºÑ‚Ñ‹ Ð¾Ñ‚ÐºÑ€Ð¾ÑŽÑ‚ÑÑ Ð¿Ð¾ÑÐ»Ðµ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´ÐµÐ½Ð¸Ñ Ð±Ñ€Ð¾Ð½Ð¸'}</p>
                </div>
                <Lock className={`w-5 h-5 ${canChat ? 'text-[#10B981]' : 'text-[#64748B]'}`} />
              </div>
              <p className="text-xs font-bold text-[#64748B]">ÐÐ¾Ð¼ÐµÑ€ Ð¼Ð°ÑˆÐ¸Ð½Ñ‹: {canChat ? vehicle?.plateNumber : 'â€¢â€¢â€¢â€¢ TJ â€¢â€¢'}</p>
              {canChat && (
                <div className={`rounded-2xl border p-3 ${passengerAgreed ? 'bg-[#ECFDF5] border-[#A7F3D0]' : 'bg-amber-50 border-amber-100'}`}>
                  <p className={`text-xs font-black ${passengerAgreed ? 'text-[#047857]' : 'text-amber-800'}`}>
                    {passengerAgreed
                      ? booking.passengerFinalConfirmedAt
                        ? 'ÐŸÐ°ÑÑÐ°Ð¶Ð¸Ñ€ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ð»: Ñ‚Ð¾Ñ‡Ð½Ð¾ ÐµÐ´ÐµÑ‚.'
                        : '10 Ð¼Ð¸Ð½ÑƒÑ‚ Ð¿Ñ€Ð¾ÑˆÐ»Ð¸. Ð¡Ð¸ÑÑ‚ÐµÐ¼Ð° ÑÑ‡Ð¸Ñ‚Ð°ÐµÑ‚, Ñ‡Ñ‚Ð¾ Ð¿Ð°ÑÑÐ°Ð¶Ð¸Ñ€ ÑÐ¾Ð³Ð»Ð°ÑÐµÐ½.'
                      : 'Ð’Ð¾Ð´Ð¸Ñ‚ÐµÐ»ÑŒ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ð» Ð±Ñ€Ð¾Ð½ÑŒ. Ð•ÑÑ‚ÑŒ 10 Ð¼Ð¸Ð½ÑƒÑ‚, Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð¾Ð±ÑÑƒÐ´Ð¸Ñ‚ÑŒ Ð´ÐµÑ‚Ð°Ð»Ð¸.'}
                  </p>
                </div>
              )}
              {mode === 'passenger' && isCompleted && <button onClick={() => setScreen('review')} className={primaryClass}>ÐžÑ†ÐµÐ½Ð¸Ñ‚ÑŒ Ð¿Ð¾ÐµÐ·Ð´ÐºÑƒ</button>}
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
                    Ð§Ð°Ñ‚
                  </button>
                  <a href={`tel:${peer?.phone}`} className="h-12 rounded-2xl bg-[#10B981] text-white font-black flex items-center justify-center">ÐŸÐ¾Ð·Ð²Ð¾Ð½Ð¸Ñ‚ÑŒ</a>
                </div>
              )}
              {canFinalConfirm && (
                <button onClick={() => confirmPassengerRide(booking)} className="w-full h-12 rounded-2xl bg-[#047857] text-white font-black">
                  Ð¢Ð¾Ñ‡Ð½Ð¾ ÐµÐ´Ñƒ
                </button>
              )}
              {canCancel && (
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 space-y-3">
                  <p className="text-xs font-bold text-amber-800">ÐœÐ¾Ð¶Ð½Ð¾ Ð¾Ñ‚Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð±ÐµÐ· ÑˆÑ‚Ñ€Ð°Ñ„Ð° Ð² Ñ‚ÐµÑ‡ÐµÐ½Ð¸Ðµ 10 Ð¼Ð¸Ð½ÑƒÑ‚ Ð¿Ð¾ÑÐ»Ðµ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´ÐµÐ½Ð¸Ñ Ð²Ð¾Ð´Ð¸Ñ‚ÐµÐ»ÐµÐ¼, ÐµÑÐ»Ð¸ Ð½Ðµ ÑƒÐ´Ð°Ð»Ð¾ÑÑŒ Ð´Ð¾Ð³Ð¾Ð²Ð¾Ñ€Ð¸Ñ‚ÑŒÑÑ.</p>
                  <button onClick={() => cancelBooking(booking)} className="w-full h-11 rounded-2xl bg-white border border-amber-200 text-amber-800 font-black">{isPending ? 'ÐžÑ‚Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð´Ð¾ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´ÐµÐ½Ð¸Ñ' : 'ÐžÑ‚Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð±Ñ€Ð¾Ð½ÑŒ'}</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const passengerScreenProps = {
    Shell,
    Header,
    CitySelect,
    BottomNav,
    MessagesPanel,
    NotificationsPanel,
    ProfilePanel,
    UserRole,
    currentUser,
    t,
    penaltyAmount,
    setPenaltyAmount,
    fromCity,
    setFromCity,
    toCity,
    setToCity,
    cities,
    language,
    selectClass,
    inputClass,
    date,
    setDate,
    searchSeats,
    setSearchSeats,
    filterVerified,
    setFilterVerified,
    filterBaggage,
    setFilterBaggage,
    filterWomen,
    setFilterWomen,
    setScreen,
    primaryClass,
    passengerTab,
    tripsList: <TripsList mode="passenger" />,
    bookings,
    trips,
    users,
    hiddenChatUserIds,
    setHiddenChatUserIds,
    chatUserId,
    setChatUserId,
    chats,
    chatInput,
    setChatInput,
    chatInputRef,
    sendChat,
    myNotifications,
    unreadNotificationsCount,
    openNotification,
    rejectBooking,
    acceptBooking,
    setNotifications,
    setDriverTab,
    setHiddenNotificationIds,
    driverProfiles,
    vehicles,
    setPassengerTab,
    setCurrentUser,
    driverTab,
    tripSort,
    setTripSort,
    filteredTrips,
    renderTripCard,
    selectedTrip,
    userFor,
    driverProfileFor,
    vehicleFor,
    rowPriceForTrip,
    selectedSeatRow,
    selectedSeats,
    setSelectedSeats,
    setSelectedSeatRow,
    tripBackTarget,
    show,
    openBooking,
    bookingMessage,
    setBookingMessage,
    confirmBooking,
    requestPickup,
    setRequestPickup,
    setPointFromLocation,
    setPointFromMap,
    requestDropoff,
    setRequestDropoff,
    requestTime,
    setRequestTime,
    requestTimeMode,
    setRequestTimeMode,
    requestPrice,
    setRequestPrice,
    requestComment,
    setRequestComment,
    createPassengerRequest,
    reviewText,
    setReviewText,
    reviewRating,
    setReviewRating
  };

  const driverScreenProps = {
    Shell,
    CitySelect,
    BottomNav,
    MessagesPanel,
    NotificationsPanel,
    ProfilePanel,
    UserRole,
    BookingStatus,
    TripStatus,
    currentUser,
    users,
    driverProfiles,
    vehicles,
    trips,
    bookings,
    passengerRequests,
    t,
    driverTab,
    setDriverTab,
    passengerTab,
    driverHomeMode,
    setDriverHomeMode,
    driverRouteTo,
    setDriverRouteTo,
    driverCity,
    setDriverCity,
    driverFilterTo,
    setDriverFilterTo,
    driverHomeView,
    setDriverHomeView,
    renderTripCard,
    renderRequestCard,
    selectClass,
    inputClass,
    primaryClass,
    cities,
    language,
    createFrom,
    setCreateFrom,
    createTo,
    setCreateTo,
    createDate,
    setCreateDate,
    createTime,
    setCreateTime,
    createTimeMode,
    setCreateTimeMode,
    createPrice,
    setCreatePrice,
    createSeats,
    setCreateSeats,
    createPricingMode,
    setCreatePricingMode,
    frontSeatPrice,
    setFrontSeatPrice,
    secondRowPrice,
    setSecondRowPrice,
    thirdRowPrice,
    setThirdRowPrice,
    createPickup,
    setCreatePickup,
    createDropoff,
    setCreateDropoff,
    createComment,
    setCreateComment,
    createBaggage,
    setCreateBaggage,
    createWomen,
    setCreateWomen,
    editingTripId,
    resetTripForm,
    completeTrip,
    publishTrip,
    setPointFromLocation,
    setPointFromMap,
    seatRowsForSeats,
    money,
    userFor,
    driverProfileFor,
    vehicleFor,
    rejectBooking,
    acceptBooking,
    driverTripsList: <TripsList mode="driver" />,
    setChatUserId,
    setHiddenChatUserIds,
    hiddenChatUserIds,
    chatUserId,
    chats,
    chatInput,
    setChatInput,
    chatInputRef,
    sendChat,
    myNotifications,
    unreadNotificationsCount,
    openNotification,
    setNotifications,
    setHiddenNotificationIds,
    setPassengerTab,
    setCurrentUser,
    setScreen,
    cancelBookingByDriver,
    confirmDriverRide,
    cancelTrip
  };

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
  else if (screen === 'results') content = <ResultsScreen {...passengerScreenProps} />;
  else if (screen === 'trip') content = <TripDetailsScreen {...passengerScreenProps} />;
  else if (screen === 'booking') content = <BookingScreen {...passengerScreenProps} />;
  else if (screen === 'request') content = <PassengerRequestScreen {...passengerScreenProps} />;
  else if (screen === 'review') content = <ReviewScreen {...passengerScreenProps} />;
  else if (currentUser?.role === UserRole.Driver) content = <DriverApp {...driverScreenProps} />;
  else content = <PassengerApp {...passengerScreenProps} />;

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
