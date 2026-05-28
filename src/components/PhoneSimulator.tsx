import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Calendar,
  Car,
  Check,
  CheckCircle,
  ChevronRight,
  Clock,
  Compass,
  CreditCard,
  Globe2,
  Home,
  Lock,
  LogOut,
  MapPin,
  MessageSquare,
  Phone,
  PlusCircle,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Star,
  User as UserIcon,
  Users
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

type Screen =
  | 'lang'
  | 'welcome'
  | 'login'
  | 'role'
  | 'register'
  | 'passenger'
  | 'driver'
  | 'results'
  | 'trip'
  | 'booking'
  | 'request'
  | 'review';

const copy = {
  [Language.RU]: {
    welcome: 'Надежные поездки между городами Таджикистана',
    login: 'Войти',
    register: 'Зарегистрироваться',
    search: 'Поиск',
    trips: 'Поездки',
    messages: 'Сообщения',
    notifications: 'Уведомления',
    profile: 'Профиль'
  },
  [Language.TJ]: {
    welcome: 'Сафарҳои боэътимод байни шаҳрҳои Тоҷикистон',
    login: 'Ворид шудан',
    register: 'Руйхатгирӣ',
    search: 'Ҷустуҷӯ',
    trips: 'Сафарҳо',
    messages: 'Паёмҳо',
    notifications: 'Огоҳӣ',
    profile: 'Профил'
  },
  [Language.EN]: {
    welcome: 'Reliable rides between cities in Tajikistan',
    login: 'Log in',
    register: 'Register',
    search: 'Search',
    trips: 'My rides',
    messages: 'Messages',
    notifications: 'Alerts',
    profile: 'Profile'
  }
};

const money = (value: number) => `${value} сомони`;
const today = '2026-05-25';

const localizedCopy = {
  [Language.RU]: {
    languageName: 'Русский',
    welcomeTitle: 'Добро пожаловать в Hamroh',
    welcome: 'Надёжные поездки между городами Таджикистана',
    login: 'Войти',
    register: 'Зарегистрироваться',
    forgotPassword: 'Забыли пароль?',
    password: 'Пароль',
    repeatPassword: 'Повтор',
    firstName: 'Имя',
    lastName: 'Фамилия',
    roleChoice: 'Кем вы хотите пользоваться Hamroh?',
    passengerRole: 'Я пассажир',
    passengerRoleDescription: 'Быстрая регистрация без проверки администратора',
    driverRole: 'Я водитель',
    driverRoleDescription: 'Понадобятся документы и проверка модератором',
    passengerRegister: 'Регистрация пассажира',
    driverRegister: 'Регистрация водителя',
    male: 'Мужчина',
    female: 'Женщина',
    search: 'Поиск',
    trips: 'Поездки',
    messages: 'Сообщения',
    notifications: 'Уведомления',
    profile: 'Профиль',
    driverHome: 'Главная',
    create: 'Создать',
    requests: 'Заявки'
  },
  [Language.TJ]: {
    languageName: 'Тоҷикӣ',
    chooseLanguage: 'Забони барномаро интихоб кунед',
    welcomeTitle: 'Хуш омадед ба Hamroh',
    welcome: 'Сафарҳои боэътимод байни шаҳрҳои Тоҷикистон',
    login: 'Ворид шудан',
    register: 'Рӯйхатгирӣ',
    forgotPassword: 'Паролро фаромӯш кардед?',
    password: 'Парол',
    repeatPassword: 'Такрор',
    firstName: 'Ном',
    lastName: 'Насаб',
    roleChoice: 'Hamroh-ро чӣ гуна истифода мебаред?',
    passengerRole: 'Ман мусофир',
    passengerRoleDescription: 'Рӯйхатгирии зуд бе санҷиши маъмур',
    driverRole: 'Ман ронанда',
    driverRoleDescription: 'Ҳуҷҷатҳо ва санҷиши модератор лозим мешаванд',
    passengerRegister: 'Рӯйхатгирии мусофир',
    driverRegister: 'Рӯйхатгирии ронанда',
    male: 'Мард',
    female: 'Зан',
    search: 'Ҷустуҷӯ',
    trips: 'Сафарҳои ман',
    messages: 'Паёмҳо',
    notifications: 'Огоҳиҳо',
    profile: 'Профил',
    driverHome: 'Асосӣ',
    create: 'Сохтан',
    requests: 'Дархостҳо'
  },
  [Language.EN]: {
    languageName: 'English',
    chooseLanguage: 'Choose app language',
    welcomeTitle: 'Welcome to Hamroh',
    welcome: 'Reliable rides between cities in Tajikistan',
    login: 'Log in',
    register: 'Register',
    forgotPassword: 'Forgot password?',
    password: 'Password',
    repeatPassword: 'Repeat',
    firstName: 'First name',
    lastName: 'Last name',
    roleChoice: 'How do you want to use Hamroh?',
    passengerRole: 'I am a passenger',
    passengerRoleDescription: 'Fast registration without admin approval',
    driverRole: 'I am a driver',
    driverRoleDescription: 'Documents and moderator verification are required',
    passengerRegister: 'Passenger registration',
    driverRegister: 'Driver registration',
    male: 'Male',
    female: 'Female',
    search: 'Search',
    trips: 'My rides',
    messages: 'Messages',
    notifications: 'Alerts',
    profile: 'Profile',
    driverHome: 'Home',
    create: 'Create',
    requests: 'Requests'
  }
};

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
  const [driverMaxPrice, setDriverMaxPrice] = useState('');
  const [selectedTripId, setSelectedTripId] = useState('');
  const [tripBackTarget, setTripBackTarget] = useState<'results' | 'passenger' | 'driver'>('results');
  const [editingTripId, setEditingTripId] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [selectedSeatRow, setSelectedSeatRow] = useState<'front' | 'second' | 'third'>('second');
  const [bookingMessage, setBookingMessage] = useState('');
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [toast, setToast] = useState('');
  const [hiddenNotificationIds, setHiddenNotificationIds] = useState<string[]>([]);
  const [hiddenChatUserIds, setHiddenChatUserIds] = useState<string[]>([]);

  const [authPhone, setAuthPhone] = useState('+992');
  const [authPassword, setAuthPassword] = useState('');
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

  const t = localizedCopy[currentUser?.language || language] || localizedCopy[Language.RU];
  const selectedTrip = trips.find(trip => trip.id === selectedTripId);
  const myNotifications = notifications.filter(item => item.userId === currentUser?.id && !hiddenNotificationIds.includes(item.id));
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
  const timeToMinutes = (value?: string) => {
    if (!value || value === 'По наполнении') return 9999;
    const [hours = '0', minutes = '0'] = (value || '00:00').split(':');
    return Number(hours) * 60 + Number(minutes);
  };
  const formatDuration = (trip?: Trip) => {
    if (!trip) return '4ч 30мин';
    const routeHours = trip.fromCity === 'Душанбе' && trip.toCity === 'Худжанд' ? 4 : 5;
    const extraMinutes = trip.pricePerSeat > 140 ? -15 : trip.pricePerSeat < 110 ? 25 : 0;
    const total = Math.max(180, routeHours * 60 + 30 + extraMinutes);
    return `${Math.floor(total / 60)}ч ${total % 60}мин`;
  };
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
  const seatRowsForSeats = (seats: number): Array<{ key: 'front' | 'second' | 'third'; label: string; seats: number }> => {
    const rows: Array<{ key: 'front' | 'second' | 'third'; label: string; seats: number }> = [
      { key: 'front' as const, label: 'Рядом с водителем', seats: 1 },
      { key: 'second' as const, label: 'Второй ряд', seats: Math.min(3, Math.max(1, seats - 1)) }
    ];
    if (seats > 4) rows.push({ key: 'third' as const, label: 'Третий ряд', seats: seats - 4 });
    return rows;
  };
  const rowPriceForTrip = (trip: Trip, row: 'front' | 'second' | 'third') => {
    if (trip.pricingMode !== 'row') return trip.pricePerSeat;
    if (row === 'front') return trip.frontSeatPrice ?? trip.pricePerSeat;
    if (row === 'third') return trip.thirdRowPrice ?? trip.pricePerSeat;
    return trip.secondRowPrice ?? trip.pricePerSeat;
  };
  const displayPriceForTrip = (trip: Trip) => {
    if (trip.pricingMode !== 'row') return trip.pricePerSeat;
    return Math.min(
      trip.frontSeatPrice ?? trip.pricePerSeat,
      trip.secondRowPrice ?? trip.pricePerSeat,
      trip.thirdRowPrice ?? trip.pricePerSeat
    );
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
    setLanguage(user.language);
    setScreen(user.role === UserRole.Driver ? 'driver' : 'passenger');
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
    show('Заявка от адреса опубликована');
  };

  const offerPassengerRequest = (request: PassengerRequest) => {
    if (!currentUser) return;
    setPassengerRequests(prev => prev.map(item => item.id === request.id ? { ...item, acceptedByDriverId: currentUser.id, status: 'accepted' } : item));
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
    setChats(prev => ({ ...prev, [targetUserId]: [...(prev[targetUserId] || []), chatInput.trim()] }));
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
  };

  const selectClass = 'w-full h-12 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] px-3 text-sm font-semibold text-[#0F172A] outline-none focus:border-[#10B981]';
  const inputClass = 'w-full h-12 rounded-2xl bg-white border border-[#E2E8F0] px-3 text-sm font-semibold text-[#0F172A] outline-none focus:border-[#10B981]';
  const primaryClass = 'w-full h-14 rounded-2xl bg-[#10B981] text-white font-extrabold text-sm shadow-sm active:scale-[0.98] transition-all disabled:bg-slate-200 disabled:text-slate-400';

  const Shell = useMemo(() => function StableShell({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex flex-col h-full bg-[#F8FAFC] text-[#0F172A]">
        {children}
      </div>
    );
  }, []);

  const Header = useMemo(() => function StableHeader({ title, back }: { title: string; back?: () => void }) {
    return (
      <div className="px-4 py-3 bg-white border-b border-[#E2E8F0] flex items-center gap-3 shrink-0">
        {back && (
          <button onClick={back} className="w-10 h-10 rounded-full bg-[#F8FAFC] flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-black truncate">{title}</h2>
          <p className="text-xs text-[#64748B]">Hamroh</p>
        </div>
      </div>
    );
  }, []);

  const HamrohLogo = useMemo(() => function StableHamrohLogo({ compact = false }: { compact?: boolean }) {
    const width = compact ? 'w-[86px]' : 'w-[108px]';
    const height = compact ? 'h-[76px]' : 'h-[96px]';
    return (
      <div className={`relative ${width} ${height}`}>
        <div className="absolute left-[10px] top-[8px] h-[72px] w-[25px] rounded-full bg-[#059669]" />
        <div className="absolute right-[10px] top-[8px] h-[72px] w-[25px] rounded-full bg-[#059669]" />
        <div className="absolute left-[35px] top-[47px] h-[19px] w-[40px] rounded-t-full bg-[#34D399]" />
        <div className="absolute left-[39px] top-[53px] h-[18px] w-[32px] rounded-t-full bg-[#047857]" />
        <div className="absolute left-1/2 top-[22px] h-[17px] w-[17px] -translate-x-1/2 rounded-full bg-[#3B82F6]" />
        <div className="absolute left-[43px] top-[52px] h-[34px] w-[43px] rotate-45 rounded-[7px] bg-white shadow-[0_10px_18px_rgba(15,23,42,0.04)]" />
      </div>
    );
  }, []);

  const CitySelect = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <select value={value} onChange={event => onChange(event.target.value)} className={selectClass}>
      {cities.map(item => <option key={item.id} value={item.nameRu}>{item.nameRu}</option>)}
    </select>
  );

  const TripCard: React.FC<{ trip: Trip }> = ({ trip }) => {
    const driver = userFor(trip.driverId);
    const profile = driverProfileFor(trip.driverId);
    const vehicle = vehicleFor(trip.driverId);
    const shownPrice = displayPriceForTrip(trip);
    const isFastest = shownPrice >= 150 || formatDuration(trip).startsWith('3');
    return (
      <button onClick={() => { setSelectedTripId(trip.id); setSelectedSeats(Math.min(searchSeats, trip.availableSeats)); setTripBackTarget(screen === 'results' ? 'results' : currentUser?.role === UserRole.Driver ? 'driver' : 'passenger'); setScreen('trip'); }} className={`relative w-full text-left bg-white rounded-[22px] border p-4 space-y-4 shadow-sm active:scale-[0.99] transition-all overflow-hidden ${isFastest ? 'border-[#047857]' : 'border-[#E2E8F0]'}`}>
        {isFastest && <span className="absolute right-0 top-0 rounded-bl-2xl bg-[#047857] px-4 py-2 text-xs font-black text-white">Быстрее всех</span>}
        <div className="grid grid-cols-[92px_1fr_auto] gap-3 items-start pt-3">
          <div className="space-y-8">
            <p className="text-2xl font-black leading-none">{trip.departureTime}</p>
            <p className="text-sm font-black leading-none text-slate-400">{formatDuration(trip)}</p>
          </div>
          <div className="relative space-y-5">
            <div className="absolute left-[-18px] top-2 h-[72px] border-l-2 border-dashed border-[#94A3B8]" />
            <span className="absolute left-[-23px] top-1 w-3 h-3 rounded-full bg-[#047857]" />
            <span className="absolute left-[-23px] top-[72px] w-3 h-3 rounded-full bg-[#94A3B8]" />
            <div>
              <p className="text-base font-bold text-[#0F172A]">{trip.fromCity}, {trip.pickupPoint}</p>
              <p className="mt-2 text-sm font-black text-[#047857]">{formatDuration(trip)}</p>
            </div>
            <p className="text-base font-bold text-[#0F172A]">{trip.toCity}, {trip.dropoffPoint}</p>
          </div>
          <div className="text-right pr-1">
            <p className="text-2xl font-black text-[#047857]">{shownPrice}</p>
            <p className="text-sm font-black text-[#047857]">смн</p>
            {trip.pricingMode === 'row' && <p className="text-[10px] font-bold text-[#64748B]">от</p>}
            <p className={`mt-3 text-sm font-black ${trip.availableSeats <= 1 ? 'text-red-600' : 'text-[#047857]'}`}>{trip.availableSeats} мест</p>
          </div>
        </div>
        <div className="h-px bg-[#E2E8F0]" />
        <div className="flex items-center gap-3">
          <img src={driver?.avatarUrl} className="w-14 h-14 rounded-2xl object-cover" alt="" />
          <div className="flex-1 min-w-0">
            <p className="text-xl font-black truncate">{driver?.fullName?.split(' ')[0] || 'Водитель'} <span className="text-base font-bold">{profile?.rating || '4.8'}</span></p>
            <p className="text-sm text-[#334155] truncate">{vehicle?.brand} {vehicle?.model} · {vehicle?.color}</p>
          </div>
          {isVerifiedDriver(trip.driverId) && <ShieldCheck className="w-7 h-7 text-[#10B981]" />}
        </div>
      </button>
    );
  };

  const BottomNav = ({ role }: { role: UserRole.Passenger | UserRole.Driver }) => {
    const passengerItems = [
      ['search', Search, t.search],
      ['trips', Calendar, t.trips],
      ['messages', MessageSquare, t.messages],
      ['notifications', Bell, t.notifications],
      ['profile', UserIcon, t.profile]
    ] as const;
    const driverItems = [
      ['home', Compass, 'Главная'],
      ['create', PlusCircle, 'Создать'],
      ['requests', Users, 'Заявки'],
      ['trips', Calendar, 'Поездки'],
      ['profile', UserIcon, 'Профиль']
    ] as const;
    const localizedDriverItems = [
      ['home', Compass, t.driverHome],
      ['requests', Users, t.requests],
      ['trips', Calendar, t.trips],
      ['notifications', Bell, t.notifications],
      ['profile', UserIcon, t.profile]
    ] as const;
    const items = role === UserRole.Driver ? localizedDriverItems : passengerItems;
    const active = role === UserRole.Driver ? driverTab : passengerTab;
    const setActive = role === UserRole.Driver ? setDriverTab : setPassengerTab;
    return (
      <div className="h-16 bg-white border-t border-[#E2E8F0] grid shrink-0 safe-bottom-panel" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map(([key, Icon, label]) => (
          <button key={key} onClick={() => setActive(key)} className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${active === key ? 'text-[#047857]' : 'text-[#64748B]'}`}>
            <span className="relative">
              <Icon className="w-5 h-5" />
              {key === 'notifications' && unreadNotificationsCount > 0 && (
                <span className="absolute -top-2 -right-3 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">{unreadNotificationsCount}</span>
              )}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    );
  };

  const AuthScreens = () => {
    if (screen === 'lang') {
      return (
        <Shell>
          <div className="flex-1 flex flex-col justify-center p-6 gap-8 bg-[#F8FAFC] text-center">
            <div className="flex flex-col items-center">
              <div className="mb-6 flex justify-center">
                <HamrohLogo compact />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-[#0F172A]">Hamroh</h1>
            </div>
            {([['Русский', Language.RU], ['Тоҷикӣ', Language.TJ], ['English', Language.EN]] as const).map(([label, lang]) => (
              <button key={lang} onClick={() => { setLanguage(lang); setScreen('welcome'); }} className="h-14 rounded-2xl bg-white border border-[#E2E8F0] font-bold text-center px-4 shadow-sm active:scale-[0.98] transition-all">
                {label}
              </button>
            ))}
          </div>
        </Shell>
      );
    }

    if (screen === 'welcome') {
      return (
        <Shell>
          <div className="flex-1 h-full overflow-hidden bg-[#F8FAFC] px-6 pt-6 pb-6 flex flex-col">
            <div className="flex justify-center">
              <button onClick={() => setScreen('lang')} className="h-11 px-5 rounded-full bg-white shadow-[0_8px_22px_rgba(15,23,42,0.10)] border border-[#E2E8F0] flex items-center gap-3 text-[#0F172A] font-extrabold active:scale-[0.98] transition-all">
                <Globe2 className="w-5 h-5 text-[#047857]" />
                {t.languageName}
              </button>
            </div>
            <div className="mt-14 flex justify-center">
              <HamrohLogo />
            </div>
            <div className="mt-16 text-center">
              <h1 className="text-[32px] leading-[1.14] font-black tracking-tight text-[#047857]">{t.welcomeTitle}</h1>
              <p className="text-[#334155] mt-5 text-[17px] leading-7 max-w-[300px] mx-auto">{t.welcome}</p>
            </div>
            <div className="mt-auto space-y-4">
              <button onClick={() => setScreen('login')} className="w-full h-[56px] rounded-[18px] bg-[#047857] text-white font-extrabold text-xl shadow-[0_12px_22px_rgba(4,120,87,0.18)] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                {t.login}
                <ChevronRight className="w-7 h-7" />
              </button>
              <button onClick={() => setScreen('role')} className="w-full h-[56px] rounded-[18px] bg-white border-2 border-[#047857] text-[#047857] font-extrabold text-lg active:scale-[0.98] transition-all">{t.register}</button>
            </div>
          </div>
        </Shell>
      );
    }

    if (false && screen === 'welcome') {
      return (
        <Shell>
          <div className="flex-1 flex flex-col justify-between p-7 bg-[#F8FAFC]">
            <div className="pt-20">
              <HamrohLogo />
              <h1 className="text-[40px] leading-tight font-black tracking-tight text-[#0F172A]">Hamroh</h1>
              <p className="text-[#64748B] mt-5 text-lg leading-8 max-w-[280px]">Надежные поездки между городами Таджикистана</p>
            </div>
            <div className="space-y-4 pb-3">
              <button onClick={() => setScreen('login')} className="w-full h-[70px] rounded-[20px] bg-[#10B981] text-white font-extrabold text-base shadow-sm active:scale-[0.98] transition-all">{t.login}</button>
              <button onClick={() => setScreen('role')} className="w-full h-[70px] rounded-[20px] bg-white border border-[#10B981] text-[#047857] font-extrabold text-base active:scale-[0.98] transition-all">{t.register}</button>
            </div>
          </div>
        </Shell>
      );
    }

    if (screen === 'login') {
      return (
        <Shell>
          <Header title={t.login} back={() => setScreen('welcome')} />
          <div className="flex-1 flex items-center px-5">
            <div className="w-full space-y-5 -mt-16">
              <input value={authPhone} onChange={event => updateAuthPhone(event.target.value)} className={inputClass} inputMode="tel" placeholder="+992900111111" />
              <input value={authPassword} onChange={event => setAuthPassword(event.target.value)} className={inputClass} type="password" placeholder={t.password} />
              <button onClick={login} className={primaryClass}>{t.login}</button>
              <button className="w-full text-center text-sm text-[#047857] font-bold">{t.forgotPassword}</button>
            </div>
          </div>
        </Shell>
      );
    }

    if (screen === 'role') {
      return (
        <Shell>
          <div className="relative px-4 py-4 bg-white border-b border-[#E2E8F0] shrink-0">
            <button onClick={() => setScreen('welcome')} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#F8FAFC] flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="mx-auto max-w-[250px] text-center">
              <h2 className="text-lg font-black leading-tight">{t.roleChoice}</h2>
              <p className="text-xs text-[#64748B] mt-1">Hamroh</p>
            </div>
          </div>
          <div className="flex-1 flex items-center px-5">
            <div className="w-full space-y-4 -mt-16">
              <button onClick={() => { setRegRole(UserRole.Passenger); setScreen('register'); }} className="w-full bg-white rounded-3xl border border-[#E2E8F0] p-6 text-center shadow-sm active:scale-[0.98] transition-all">
                <Users className="w-8 h-8 text-[#10B981] mx-auto mb-4" />
                <p className="font-black text-lg">{t.passengerRole}</p>
                <p className="text-sm text-[#64748B] mt-2 max-w-[240px] mx-auto">{t.passengerRoleDescription}</p>
              </button>
              <button onClick={() => { setRegRole(UserRole.Driver); setScreen('register'); }} className="w-full bg-white rounded-3xl border border-[#E2E8F0] p-6 text-center shadow-sm active:scale-[0.98] transition-all">
                <Car className="w-8 h-8 text-[#10B981] mx-auto mb-4" />
                <p className="font-black text-lg">{t.driverRole}</p>
                <p className="text-sm text-[#64748B] mt-2 max-w-[240px] mx-auto">{t.driverRoleDescription}</p>
              </button>
            </div>
          </div>
        </Shell>
      );
    }

    return (
      <Shell>
        <Header title={regRole === UserRole.Driver ? t.driverRegister : t.passengerRegister} back={() => setScreen('role')} />
        <div className="flex-1 min-h-0 overflow-y-auto p-5 pb-28 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input value={firstName} onChange={event => setFirstName(event.target.value)} className={inputClass} placeholder={t.firstName} />
            <input value={lastName} onChange={event => setLastName(event.target.value)} className={inputClass} placeholder={t.lastName} />
          </div>
          <input value={authPhone} onChange={event => updateAuthPhone(event.target.value)} className={inputClass} inputMode="tel" placeholder="+992900111111" />
          <div className="grid grid-cols-2 gap-3">
            <input value={authPassword} onChange={event => setAuthPassword(event.target.value)} className={inputClass} type="password" placeholder={t.password} />
            <input value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className={inputClass} type="password" placeholder={t.repeatPassword} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setGender('male')} className={`h-12 rounded-2xl border font-bold ${gender === 'male' ? 'bg-[#D1FAE5] border-[#10B981]' : 'bg-white border-[#E2E8F0]'}`}>{t.male}</button>
            <button onClick={() => setGender('female')} className={`h-12 rounded-2xl border font-bold ${gender === 'female' ? 'bg-[#D1FAE5] border-[#10B981]' : 'bg-white border-[#E2E8F0]'}`}>{t.female}</button>
          </div>
          {regRole === UserRole.Driver && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-4 border border-[#E2E8F0] space-y-3">
                <p className="font-black">Документы водителя</p>
                <input value={licenseNumber} onChange={event => setLicenseNumber(event.target.value)} className={inputClass} placeholder="Номер водительских прав" />
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-[#64748B]">
                  {['Фото профиля', 'Live selfie', 'Паспорт / ID', 'Права'].map(item => <div key={item} className="rounded-2xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]">{item}<br /><span className="text-[#10B981]">готово</span></div>)}
                </div>
              </div>
              <div className="bg-white rounded-3xl p-4 border border-[#E2E8F0] space-y-3">
                <p className="font-black">Автомобиль</p>
                <div className="grid grid-cols-2 gap-3">
                  <input value={carBrand} onChange={event => setCarBrand(event.target.value)} className={inputClass} placeholder="Марка" />
                  <input value={carModel} onChange={event => setCarModel(event.target.value)} className={inputClass} placeholder="Модель" />
                  <input value={carColor} onChange={event => setCarColor(event.target.value)} className={inputClass} placeholder="Цвет" />
                  <input value={carYear} onChange={event => setCarYear(event.target.value)} className={inputClass} placeholder="Год" />
                </div>
                <input value={carPlate} onChange={event => setCarPlate(event.target.value)} className={inputClass} placeholder="Гос. номер" />
                <input value={carSeats} onChange={event => setCarSeats(Number(event.target.value))} className={inputClass} type="number" placeholder="Мест" />
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-[#64748B]">
                  {['Техпаспорт', 'Фото спереди', 'Фото сзади', 'Фото салона'].map(item => <div key={item} className="rounded-2xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]">{item}<br /><span className="text-[#10B981]">готово</span></div>)}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 bg-white border-t border-[#E2E8F0] safe-bottom-panel">
          <button onClick={register} className={primaryClass}>
            {regRole === UserRole.Driver ? 'Отправить на проверку' : 'Создать аккаунт'}
          </button>
        </div>
      </Shell>
    );
  };

  const PassengerApp = () => (
    <Shell>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {passengerTab === 'search' && (
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">Добро пожаловать</p>
                <h2 className="text-2xl font-black">{currentUser?.fullName.split(' ')[0]}</h2>
              </div>
              <button onClick={() => setPassengerTab('notifications')} className="w-11 h-11 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center relative">
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">{unreadNotificationsCount}</span>}
              </button>
            </div>
            {penaltyAmount > 0 && (
              <div className="bg-rose-50 border border-rose-100 rounded-3xl p-4 text-sm text-rose-800 font-semibold">
                У вас есть неоплаченный штраф за неявку. Чтобы продолжить бронирование, оплатите 30% от суммы предыдущей поездки.
                <button onClick={() => setPenaltyAmount(0)} className="mt-3 h-11 w-full rounded-2xl bg-rose-600 text-white font-black">Оплатить {penaltyAmount} сомони</button>
              </div>
            )}
            <div className="bg-white rounded-[28px] border border-[#E2E8F0] p-4 space-y-3 shadow-sm">
              <label className="text-xs font-bold text-[#64748B]">Откуда</label>
              <CitySelect value={fromCity} onChange={setFromCity} />
              <label className="text-xs font-bold text-[#64748B]">Куда</label>
              <CitySelect value={toCity} onChange={setToCity} />
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-bold text-[#64748B]">Дата</span>
                  <input type="date" value={date} onChange={event => setDate(event.target.value)} className={inputClass} />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-bold text-[#64748B]">Пассажиры</span>
                  <select value={searchSeats} onChange={event => setSearchSeats(Number(event.target.value))} className={selectClass}>
                    {[1, 2, 3, 4].map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setFilterVerified(!filterVerified)} className={`h-10 rounded-xl text-xs font-bold border ${filterVerified ? 'bg-[#D1FAE5] border-[#10B981]' : 'bg-white border-[#E2E8F0]'}`}>Проверен</button>
                <button onClick={() => setFilterBaggage(!filterBaggage)} className={`h-10 rounded-xl text-xs font-bold border ${filterBaggage ? 'bg-[#D1FAE5] border-[#10B981]' : 'bg-white border-[#E2E8F0]'}`}>Багаж</button>
                <button onClick={() => setFilterWomen(!filterWomen)} className={`h-10 rounded-xl text-xs font-bold border ${filterWomen ? 'bg-[#D1FAE5] border-[#10B981]' : 'bg-white border-[#E2E8F0]'}`}>Women</button>
              </div>
              <button onClick={() => setScreen('results')} className={primaryClass}>Найти поездку</button>
            </div>
            <button onClick={() => setScreen('request')} className="w-full h-14 rounded-2xl bg-white border border-[#10B981] text-[#047857] font-extrabold flex items-center justify-center gap-2">
              <Home className="w-5 h-5" /> Мне нужна поездка от адреса
            </button>
          </div>
        )}
        {passengerTab === 'trips' && <TripsList mode="passenger" />}
        {passengerTab === 'messages' && <Messages />}
        {passengerTab === 'notifications' && <Notifications />}
        {passengerTab === 'profile' && <Profile role="passenger" />}
      </div>
      <BottomNav role={UserRole.Passenger} />
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
          <h2 className="text-xl font-black">Поездки</h2>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white border border-[#E2E8F0] p-1">
            <button onClick={() => setView('active')} className={`h-11 rounded-xl text-sm font-black transition-all ${view === 'active' ? 'bg-[#10B981] text-white shadow-sm' : 'text-[#64748B]'}`}>
              Актуальные
            </button>
            <button onClick={() => setView('completed')} className={`h-11 rounded-xl text-sm font-black transition-all ${view === 'completed' ? 'bg-[#10B981] text-white shadow-sm' : 'text-[#64748B]'}`}>
              Завершённые
            </button>
          </div>
          {myTrips.length === 0 && <p className="text-sm text-[#64748B] bg-white rounded-3xl p-6 text-center">{view === 'active' ? 'Актуальных поездок пока нет' : 'Завершённых поездок пока нет'}</p>}
          {myTrips.map(trip => {
            const tripBookings = bookings.filter(booking => booking.tripId === trip.id);
            const acceptedSeats = tripBookings.filter(booking => booking.status === BookingStatus.Accepted).reduce((sum, booking) => sum + booking.seatsCount, 0);
            const pendingCount = tripBookings.filter(booking => booking.status === BookingStatus.Pending).length;
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
                    <p className="text-[11px] text-[#64748B]">Цена</p>
                    <p className="font-black">{trip.pricingMode === 'row' ? `от ${money(displayPriceForTrip(trip))}` : money(trip.pricePerSeat)}</p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] p-3">
                    <p className="text-[11px] text-[#64748B]">Свободно</p>
                    <p className="font-black">{trip.availableSeats}</p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] p-3">
                    <p className="text-[11px] text-[#64748B]">Брони</p>
                    <p className="font-black">{acceptedSeats}/{pendingCount}</p>
                  </div>
                </div>
                {view === 'active' && tripBookings.length > 0 && (
                  <div className="rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] p-3">
                    <p className="text-xs font-black text-[#047857]">Live: {pendingCount} новых броней, {acceptedSeats} подтверждённых мест</p>
                  </div>
                )}
                {view === 'active' && (
                  <div className={editingTripId ? 'grid grid-cols-2 gap-3' : ''}>
                    <button onClick={() => editDriverTrip(trip)} className="h-12 rounded-2xl bg-[#D1FAE5] text-[#047857] font-black">Изменить</button>
                    <button onClick={() => completeTrip(trip.id)} className="h-12 rounded-2xl bg-[#0F172A] text-white font-black">Завершить</button>
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
          const canCancel = mode === 'passenger' && (isPending || isCancelWindowOpen(booking));
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
                  <button onClick={() => { setChatUserId(peer?.id || ''); setPassengerTab('messages'); }} className="h-12 rounded-2xl bg-[#D1FAE5] text-[#047857] font-black">Чат</button>
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

  const Messages = () => {
    const acceptedBookings = bookings.filter(booking => {
      const trip = trips.find(item => item.id === booking.tripId);
      if (booking.status !== BookingStatus.Accepted || trip?.status === TripStatus.Completed) return false;
      return booking.passengerId === currentUser?.id || trip?.driverId === currentUser?.id;
    });
    const peers = acceptedBookings.map(booking => {
      const trip = trips.find(item => item.id === booking.tripId);
      return currentUser?.role === UserRole.Driver ? userFor(booking.passengerId) : userFor(trip?.driverId);
    }).filter(Boolean).filter(peer => !hiddenChatUserIds.includes((peer as User).id)) as User[];
    const activePeer = userFor(chatUserId) || peers[0];
    return (
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Сообщения</h2>
          {activePeer && <button onClick={() => setHiddenChatUserIds(prev => [...prev, activePeer.id])} className="text-xs font-black text-rose-600">Удалить чат</button>}
        </div>
        {peers.length === 0 ? <p className="bg-white rounded-3xl p-6 text-sm text-[#64748B]">Чат доступен только после подтверждения и до завершения поездки.</p> : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {peers.map(peer => <button key={peer.id} onClick={() => setChatUserId(peer.id)} className={`px-3 h-10 rounded-full text-sm font-bold whitespace-nowrap ${activePeer?.id === peer.id ? 'bg-[#10B981] text-white' : 'bg-white border border-[#E2E8F0]'}`}>{peer.fullName.split(' ')[0]}</button>)}
            </div>
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-4 h-80 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-2">
                {(chats[activePeer?.id || ''] || ['Здравствуйте! Бронь подтверждена.']).map((message, index) => (
                  <div key={`${message}_${index}`} className="max-w-[80%] rounded-2xl bg-[#D1FAE5] p-3 text-sm font-medium ml-auto">{message}</div>
                ))}
              </div>
              <div className="flex gap-2 pt-3">
                <input value={chatInput} onChange={event => setChatInput(event.target.value)} className="flex-1 h-11 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] px-3 text-sm outline-none" placeholder="Сообщение" />
                <button onClick={() => sendChat(activePeer?.id)} className="w-11 h-11 rounded-2xl bg-[#10B981] text-white flex items-center justify-center"><Send className="w-5 h-5" /></button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const Notifications = () => (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">Уведомления</h2>
        {myNotifications.length > 0 && <span className="text-xs font-black text-[#047857]">{unreadNotificationsCount} новых</span>}
      </div>
      {myNotifications.length === 0 && <p className="bg-white rounded-3xl p-6 text-sm text-[#64748B]">Уведомлений пока нет</p>}
      {myNotifications.map(item => {
        const relatedBooking = bookings.find(booking => booking.id === item.bookingId);
        const canReplyToBooking = currentUser?.role === UserRole.Driver && item.type === 'booking_request' && relatedBooking?.status === BookingStatus.Pending;
        return (
          <div key={item.id} className={`w-full bg-white rounded-3xl border p-4 text-left shadow-sm ${item.isRead ? 'border-[#E2E8F0]' : 'border-[#10B981]'}`}>
            <button onClick={() => openNotification(item)} className="w-full text-left">
              <p className="font-black">{item.title}</p>
              <p className="text-sm text-[#64748B] mt-1">{item.message}</p>
              <p className="text-[11px] font-bold text-[#94A3B8] mt-2">Нажмите, чтобы открыть</p>
            </button>
            {canReplyToBooking && relatedBooking && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => {
                    rejectBooking(relatedBooking);
                    setNotifications(prev => prev.map(notification => notification.id === item.id ? { ...notification, isRead: true } : notification));
                  }}
                  className="h-11 rounded-2xl bg-rose-50 text-rose-700 font-black"
                >
                  Отклонить
                </button>
                <button
                  onClick={() => {
                    acceptBooking(relatedBooking);
                    setNotifications(prev => prev.map(notification => notification.id === item.id ? { ...notification, isRead: true } : notification));
                    setDriverTab('messages');
                  }}
                  className="h-11 rounded-2xl bg-[#10B981] text-white font-black"
                >
                  Принять
                </button>
              </div>
            )}
            <button onClick={() => setHiddenNotificationIds(prev => [...prev, item.id])} className="mt-3 text-xs font-black text-rose-600">Удалить уведомление</button>
          </div>
        );
      })}
    </div>
  );

  const Profile = ({ role }: { role: 'passenger' | 'driver' }) => {
    const profile = driverProfileFor(currentUser?.id);
    const vehicle = vehicleFor(currentUser?.id);
    const driverTripIds = trips.filter(trip => trip.driverId === currentUser?.id).map(trip => trip.id);
    const driverBookings = bookings.filter(booking => driverTripIds.includes(booking.tripId));
    const completedEarnings = driverBookings
      .filter(booking => booking.status === BookingStatus.Completed)
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
    const activeEarnings = driverBookings
      .filter(booking => booking.status === BookingStatus.Accepted)
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
    const totalEarnings = completedEarnings + activeEarnings;
    const passengerBookings = bookings.filter(booking => booking.passengerId === currentUser?.id);
    const passengerCompleted = passengerBookings.filter(booking => booking.status === BookingStatus.Completed).length;
    const passengerActive = passengerBookings.filter(booking => [BookingStatus.Pending, BookingStatus.Accepted].includes(booking.status)).length;
    return (
      <div className="p-5 space-y-4">
        <div className="bg-gradient-to-br from-[#047857] to-[#10B981] rounded-[28px] p-5 text-white shadow-lg shadow-emerald-900/20">
          <div className="flex items-center gap-4">
            <img src={currentUser?.avatarUrl} className="w-20 h-20 rounded-3xl object-cover border-4 border-white/30" alt="" />
            <div className="flex-1">
              <h2 className="text-2xl font-black">{currentUser?.fullName}</h2>
              <p className="text-sm text-white/80">{currentUser?.phone}</p>
              <p className="text-xs text-white/80 mt-1">{currentUser?.gender === 'female' ? 'Женщина' : 'Мужчина'}</p>
            </div>
          </div>
        </div>
        {role === 'passenger' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-3xl border border-[#E2E8F0] p-4">
                <p className="text-xs text-[#64748B]">Активные</p>
                <p className="text-2xl font-black">{passengerActive}</p>
              </div>
              <div className="bg-white rounded-3xl border border-[#E2E8F0] p-4">
                <p className="text-xs text-[#64748B]">Завершено</p>
                <p className="text-2xl font-black">{passengerCompleted}</p>
              </div>
              <button onClick={() => setPassengerTab('notifications')} className="bg-white rounded-3xl border border-[#E2E8F0] p-4 text-left relative">
                <p className="text-xs text-[#64748B]">Уведомления</p>
                <p className="text-2xl font-black">{unreadNotificationsCount}</p>
                {unreadNotificationsCount > 0 && <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-500" />}
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 space-y-2">
              <p className="font-black">Безопасность поездок</p>
              <p className="text-sm text-[#64748B]">Телефон и номер машины открываются после подтверждения водителем. После завершения поездки можно оставить отзыв.</p>
            </div>
          </>
        )}
        {role === 'driver' && (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#F8FAFC] p-3">
                <p className="text-xs text-[#64748B]">Рейтинг</p>
                <p className="text-2xl font-black">{profile?.rating || 0}</p>
              </div>
              <div className="rounded-2xl bg-[#F8FAFC] p-3">
                <p className="text-xs text-[#64748B]">Поездки</p>
                <p className="text-2xl font-black">{profile?.totalTrips || 0}</p>
              </div>
            </div>
            <div className="rounded-3xl bg-[#ECFDF5] border border-[#A7F3D0] p-4 space-y-3">
              <p className="font-black text-[#047857]">Заработок</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#64748B]">Всего</p>
                  <p className="text-2xl font-black text-[#047857]">{money(totalEarnings)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B]">Ожидается</p>
                  <p className="text-2xl font-black text-[#0F172A]">{money(activeEarnings)}</p>
                </div>
              </div>
              <p className="text-xs text-[#64748B]">Завершено: {money(completedEarnings)}</p>
            </div>
            <p className="font-black">Статус проверки</p>
            <p className="text-sm text-[#64748B]">{profile?.verificationStatus || VerificationStatus.PendingVerification}</p>
            <p className="text-sm font-bold">{vehicle?.brand} {vehicle?.model}</p>
            <p className="text-sm text-[#64748B]">{vehicle?.plateNumber}</p>
          </div>
        )}
        <button onClick={() => { setCurrentUser(null); setScreen('welcome'); }} className="w-full h-12 rounded-2xl bg-rose-50 text-rose-700 font-black flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" /> Выйти
        </button>
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
      if (driverMaxPrice && displayPriceForTrip(trip) > Number(driverMaxPrice)) return false;
      return true;
    };
    const driverRequestScope = (request: PassengerRequest) => {
      if (request.status !== 'pending') return false;
      if (driverHomeMode === 'route') return request.fromCity === driverCity && request.toCity === driverRouteTo;
      if (request.fromCity !== driverCity) return false;
      if (driverFilterTo && request.toCity !== driverFilterTo) return false;
      if (driverMaxPrice && (request.desiredPrice || 0) > Number(driverMaxPrice)) return false;
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
              <h2 className="text-2xl font-black">Главная</h2>
              {!isVerified && <div className="bg-amber-50 border border-amber-100 rounded-3xl p-4 text-sm text-amber-800 font-semibold">Ваш профиль водителя отправлен на проверку. Создание поездок и принятие пассажиров недоступны до одобрения.</div>}
              <div className="bg-white rounded-3xl border border-[#E2E8F0] p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F8FAFC] p-1">
                  <button onClick={() => setDriverHomeMode('city')} className={`h-11 rounded-xl text-xs font-black ${driverHomeMode === 'city' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>Город</button>
                  <button onClick={() => setDriverHomeMode('route')} className={`h-11 rounded-xl text-xs font-black ${driverHomeMode === 'route' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>Маршрут</button>
                </div>
                <p className="font-black">{driverHomeMode === 'city' ? 'Выберите город' : 'Выберите маршрут'}</p>
                <CitySelect value={driverCity} onChange={setDriverCity} />
                {driverHomeMode === 'route' && <CitySelect value={driverRouteTo} onChange={setDriverRouteTo} />}
                {driverHomeMode === 'city' && (
                  <div className="grid grid-cols-2 gap-2">
                    <select value={driverFilterTo} onChange={event => setDriverFilterTo(event.target.value)} className={selectClass}>
                      <option value="">Все направления</option>
                      {cities.filter(city => city.nameRu !== driverCity).map(city => <option key={city.id} value={city.nameRu}>{city.nameRu}</option>)}
                    </select>
                    <input type="number" value={driverMaxPrice} onChange={event => setDriverMaxPrice(event.target.value)} className={inputClass} placeholder="Цена до" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white border border-[#E2E8F0] p-1">
                <button onClick={() => setDriverHomeView('trips')} className={`h-11 rounded-xl text-xs font-black ${driverHomeView === 'trips' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>Актуальные поездки</button>
                <button onClick={() => setDriverHomeView('requests')} className={`h-11 rounded-xl text-xs font-black ${driverHomeView === 'requests' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>Заявки пассажиров</button>
              </div>
              {driverHomeView === 'trips' && <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black">{driverHomeMode === 'city' ? 'Актуальные поездки из города' : 'Актуальные поездки по маршруту'}</h3>
                  <span className="text-xs font-black text-[#047857]">{marketTrips.length}</span>
                </div>
                {marketTrips.length === 0 && <p className="text-sm text-[#64748B] bg-white rounded-3xl p-5 text-center">Пока нет поездок из этого города</p>}
                {marketTrips.slice(0, 4).map(trip => <TripCard key={trip.id} trip={trip} />)}
              </div>}
              {driverHomeView === 'requests' && <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black">{driverHomeMode === 'city' ? 'Заявки пассажиров от адреса' : 'Заявки пассажиров по маршруту'}</h3>
                  <span className="text-xs font-black text-[#047857]">{homeRequests.length}</span>
                </div>
                {homeRequests.length === 0 && <p className="text-sm text-[#64748B] bg-white rounded-3xl p-5 text-center">Пока нет заявок от адреса</p>}
                {homeRequests.slice(0, 3).map(req => <RequestCard key={req.id} request={req} />)}
              </div>}
            </div>
          )}
          {driverTab === 'create' && (
            <div className="p-5 space-y-4">
              <h2 className="text-xl font-black">{editingTripId ? 'Изменить поездку' : 'Создать поездку'}</h2>
              {activeTrip && !editingTripId ? (
                <div className="bg-rose-50 border border-rose-100 rounded-3xl p-4 space-y-3">
                  <p className="font-black text-rose-700">Завершите текущую поездку, чтобы создать новую</p>
                  <p className="text-sm text-rose-800">{activeTrip.fromCity} {'->'} {activeTrip.toCity}</p>
                  <button onClick={() => completeTrip(activeTrip.id)} className={primaryClass}>Завершить поездку</button>
                </div>
              ) : (
                <>
                  {!isVerified && <div className="bg-amber-50 border border-amber-100 rounded-3xl p-4 text-sm text-amber-800 font-semibold">Создание поездок доступно после проверки.</div>}
                  <CitySelect value={createFrom} onChange={setCreateFrom} />
                  <CitySelect value={createTo} onChange={setCreateTo} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" value={createDate} onChange={event => setCreateDate(event.target.value)} className={inputClass} />
                    <input value={createTime} onChange={event => setCreateTime(event.target.value)} disabled={createTimeMode === 'whenFull'} className={inputClass} placeholder="09:00" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white border border-[#E2E8F0] p-1">
                    <button onClick={() => setCreateTimeMode('exact')} className={`h-11 rounded-xl text-xs font-black ${createTimeMode === 'exact' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>Точное время</button>
                    <button onClick={() => setCreateTimeMode('whenFull')} className={`h-11 rounded-xl text-xs font-black ${createTimeMode === 'whenFull' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>По наполнении</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" value={createPrice} onChange={event => setCreatePrice(Number(event.target.value))} className={inputClass} placeholder="Цена" />
                    <input type="number" value={createSeats} onChange={event => setCreateSeats(Number(event.target.value))} className={inputClass} placeholder="Мест" />
                  </div>
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F8FAFC] p-1">
                      <button onClick={() => setCreatePricingMode('flat')} className={`h-11 rounded-xl text-xs font-black ${createPricingMode === 'flat' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>Одна цена</button>
                      <button onClick={() => setCreatePricingMode('row')} className={`h-11 rounded-xl text-xs font-black ${createPricingMode === 'row' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>По рядам</button>
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
                    <input value={createPickup} onChange={event => setCreatePickup(event.target.value)} className={inputClass} placeholder="Точный адрес посадки" />
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setPointFromLocation('tripPickup')} className="h-11 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-black text-[#047857]">Моя локация</button>
                      <button type="button" onClick={() => setPointFromMap('tripPickup')} className="h-11 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-black text-[#047857]">Выбрать на карте</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <input value={createDropoff} onChange={event => setCreateDropoff(event.target.value)} className={inputClass} placeholder="Точка высадки" />
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setPointFromLocation('tripDropoff')} className="h-11 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-black text-[#047857]">Моя локация</button>
                      <button type="button" onClick={() => setPointFromMap('tripDropoff')} className="h-11 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-black text-[#047857]">Выбрать на карте</button>
                    </div>
                  </div>
                  <textarea value={createComment} onChange={event => setCreateComment(event.target.value)} className="w-full min-h-24 rounded-2xl bg-white border border-[#E2E8F0] p-3 text-sm outline-none" placeholder="Комментарий водителя" />
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setCreateBaggage(!createBaggage)} className={`h-12 rounded-2xl border font-bold ${createBaggage ? 'bg-[#D1FAE5] border-[#10B981]' : 'bg-white border-[#E2E8F0]'}`}>Багаж</button>
                    <button onClick={() => setCreateWomen(!createWomen)} className={`h-12 rounded-2xl border font-bold ${createWomen ? 'bg-[#D1FAE5] border-[#10B981]' : 'bg-white border-[#E2E8F0]'}`}>Women-friendly</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {editingTripId && <button onClick={() => { resetTripForm(); setDriverTab('trips'); }} className="h-14 rounded-2xl bg-white border border-[#E2E8F0] text-[#64748B] font-black">Отмена</button>}
                    <button disabled={!isVerified} onClick={publishTrip} className={editingTripId ? 'h-14 rounded-2xl bg-[#10B981] text-white font-extrabold text-sm shadow-sm active:scale-[0.98] transition-all disabled:bg-slate-200 disabled:text-slate-400' : primaryClass}>{editingTripId ? 'Сохранить' : 'Опубликовать поездку'}</button>
                  </div>
                </>
              )}
            </div>
          )}
          {driverTab === 'requests' && (
            <div className="p-5 space-y-4">
              <h2 className="text-xl font-black">Заявки пассажиров</h2>
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
              {passengerRequests.filter(req => req.status === 'pending').map(req => <RequestCard key={req.id} request={req} />)}
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
          {driverTab === 'notifications' && <Notifications />}
          {driverTab === 'profile' && <Profile role="driver" />}
        </div>
        <BottomNav role={UserRole.Driver} />
      </Shell>
    );
  };

  const RequestCard: React.FC<{ request: PassengerRequest }> = ({ request }) => {
    const passenger = userFor(request.passengerId);
    return (
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-4 space-y-3 shadow-sm">
        <div className="flex justify-between gap-3">
          <div>
            <p className="font-black">{request.fromCity} {'->'} {request.toCity}</p>
            <p className="text-xs text-[#64748B]">{request.departureDate} в {request.departureTime}</p>
          </div>
          <p className="font-black text-[#047857]">{money(request.desiredPrice || 0)}</p>
        </div>
        <p className="text-sm text-[#64748B]"><b>Посадка:</b> {request.pickupAddress}</p>
        <p className="text-sm text-[#64748B]"><b>Высадка:</b> {request.dropoffAddress}</p>
        {request.pickupLatitude && request.pickupLongitude && (
          <p className="text-xs text-[#047857] font-bold">Координаты: {request.pickupLatitude.toFixed(4)}, {request.pickupLongitude.toFixed(4)}</p>
        )}
        <p className="text-sm text-[#64748B]">{request.seatsCount} мест(а), багаж: {request.baggageAllowed ? 'да' : 'нет'}</p>
        <div className="flex items-center gap-3">
          <img src={passenger?.avatarUrl} className="w-9 h-9 rounded-full object-cover" alt="" />
          <p className="font-bold text-sm">{passenger?.fullName}</p>
        </div>
        <button onClick={() => offerPassengerRequest(request)} className={primaryClass}>Предложить поездку</button>
      </div>
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
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#334155]">Найдено {filteredTrips.length} поездок</p>
          {filteredTrips.length === 0 && <div className="bg-white rounded-3xl p-6 text-center text-[#64748B]">Поездок не найдено. Измените дату, маршрут или количество мест.</div>}
          {filteredTrips.map(trip => <TripCard key={trip.id} trip={trip} />)}
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
        <div className="relative h-[310px] shrink-0 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80" className="absolute inset-0 h-full w-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/20 to-black/70" />
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
                <span className="absolute top-7 bottom-[-42px] border-l-2 border-dashed border-[#B7E4D5]" />
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
            <button onClick={() => openBooking(selectedTrip)} className="h-14 min-w-[178px] rounded-2xl bg-[#047857] px-5 text-white font-black shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-all">Забронировать {'->'}</button>
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
        <CitySelect value={fromCity} onChange={setFromCity} />
        <CitySelect value={toCity} onChange={setToCity} />
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
  if (!currentUser && ['lang', 'welcome', 'login', 'role', 'register'].includes(screen)) content = AuthScreens();
  else if (screen === 'results') content = ResultsScreen();
  else if (screen === 'trip') content = TripDetailsScreen();
  else if (screen === 'booking') content = BookingScreen();
  else if (screen === 'request') content = PassengerRequestScreen();
  else if (screen === 'review') content = ReviewScreen();
  else if (currentUser?.role === UserRole.Driver) content = DriverApp();
  else content = PassengerApp();

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4 bg-white border border-[#E2E8F0] rounded-2xl p-2 shadow-sm">
        <button onClick={() => setDeviceType('ios')} className={`px-3 h-9 rounded-xl text-xs font-bold ${deviceType === 'ios' ? 'bg-[#D1FAE5] text-[#047857]' : 'text-[#64748B]'}`}>iOS</button>
        <button onClick={() => setDeviceType('android')} className={`px-3 h-9 rounded-xl text-xs font-bold ${deviceType === 'android' ? 'bg-[#D1FAE5] text-[#047857]' : 'text-[#64748B]'}`}>Android</button>
      </div>
      <div className={`relative w-[360px] h-[720px] bg-neutral-900 border-[10px] border-neutral-800 shadow-2xl overflow-hidden select-none ${deviceType === 'ios' ? 'rounded-[48px]' : 'rounded-[36px]'}`}>
        {deviceType === 'ios' && <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50" />}
        {deviceType === 'android' && <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full z-50" />}
        <div className="h-8 bg-white px-6 pt-1 flex items-center justify-between z-40 relative text-[#0F172A] text-[10px] font-bold">
          <span>09:41</span>
          <span>5G 98%</span>
        </div>
        <div className="absolute inset-0 top-8 bg-white flex flex-col overflow-hidden safe-phone-screen">
          {toast && <div className="absolute top-3 left-4 right-4 z-50 rounded-2xl bg-[#0F172A] text-white p-3 text-xs font-bold shadow-xl">{toast}</div>}
          {content}
        </div>
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-neutral-600 rounded-full z-50" />
      </div>
    </div>
  );
}
