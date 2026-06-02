/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  User, 
  UserRole, 
  Language, 
  PassengerProfile, 
  DriverProfile, 
  Vehicle, 
  Trip, 
  Booking, 
  Review, 
  Complaint, 
  Notification, 
  City, 
  Route, 
  VerificationStatus, 
  TripStatus, 
  BookingStatus,
  ComplaintType,
  ComplaintStatus
} from './types';

export const CITIES: City[] = [

export const CITIES: City[] = [
  { id: '1', nameRu: 'Душанбе', nameTj: 'Душанбе', isActive: true },
  { id: '2', nameRu: 'Худжанд', nameTj: 'Хуҷанд', isActive: true },
  { id: '3', nameRu: 'Бохтар', nameTj: 'Бохтар', isActive: true },
  { id: '4', nameRu: 'Куляб', nameTj: 'Кӯлоб', isActive: true },
  { id: '5', nameRu: 'Панджакент', nameTj: 'Панҷакент', isActive: true },
  { id: '6', nameRu: 'Турсунзода', nameTj: 'Турсунзода', isActive: true },
  { id: '7', nameRu: 'Истаравшан', nameTj: 'Истаравшан', isActive: true },
];

export const ROUTES: Route[] = [
  { id: 'r1', fromCityId: '1', toCityId: '2', recommendedMinPrice: 150, recommendedMaxPrice: 250, isActive: true }, // Dushanbe - Khujand
  { id: 'r2', fromCityId: '1', toCityId: '3', recommendedMinPrice: 40, recommendedMaxPrice: 60, isActive: true },   // Dushanbe - Bokhtar
  { id: 'r3', fromCityId: '1', toCityId: '4', recommendedMinPrice: 70, recommendedMaxPrice: 100, isActive: true },  // Dushanbe - Kulyab
  { id: 'r4', fromCityId: '1', toCityId: '5', recommendedMinPrice: 120, recommendedMaxPrice: 180, isActive: true }, // Dushanbe - Panjakent
  { id: 'r5', fromCityId: '1', toCityId: '6', recommendedMinPrice: 20, recommendedMaxPrice: 35, isActive: true },   // Dushanbe - Tursunzoda
  { id: 'r6', fromCityId: '2', toCityId: '7', recommendedMinPrice: 20, recommendedMaxPrice: 30, isActive: true },   // Khujand - Istaravshan
  { id: 'r7', fromCityId: '2', toCityId: '8', recommendedMinPrice: 40, recommendedMaxPrice: 60, isActive: true },   // Khujand - Isfara
  { id: 'r8', fromCityId: '2', toCityId: '9', recommendedMinPrice: 30, recommendedMaxPrice: 45, isActive: true },   // Khujand - Kanibadam
];

// Seed Users
export const SEED_USERS: User[] = [
  {
    id: 'demo_passenger',
  {
    phone: '+992501000001',
    password: '7171',
    gender: 'male',
    role: UserRole.Passenger,
    language: Language.RU,
    role: UserRole.Passenger,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    isActive: true,
    createdAt: '2026-05-28T08:00:00Z',
    updatedAt: '2026-05-28T08:00:00Z',
  },
  {
    id: 'demo_driver',
  {
    phone: '+992501000002',
    password: '7171',
    gender: 'male',
    role: UserRole.Driver,
    language: Language.RU,
    role: UserRole.Driver,
    avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150',
    isActive: true,
    createdAt: '2026-05-28T08:00:00Z',
    updatedAt: '2026-05-28T08:00:00Z',
  },
  {
    id: 'u1',
  {
    phone: '+992900111111',
    password: '7171',
    gender: 'male',
    role: UserRole.Driver,
    language: Language.RU,
    role: UserRole.Driver,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    isActive: true,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z',
  },
  {
    id: 'u2',
  {
    phone: '+992933222222',
    password: '7171',
    gender: 'male',
    role: UserRole.Driver,
    language: Language.TJ,
    role: UserRole.Driver,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isActive: true,
    createdAt: '2026-02-15T09:30:00Z',
    updatedAt: '2026-02-15T09:30:00Z',
  },
  {
    id: 'u3',
  {
    phone: '+992918333333',
    password: '7171',
    gender: 'male',
    role: UserRole.Passenger,
    language: Language.RU,
    role: UserRole.Passenger,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    isActive: true,
    createdAt: '2026-03-01T14:20:00Z',
    updatedAt: '2026-03-01T14:20:00Z',
  },
  {
    id: 'u4',
  {
    phone: '+992901444444',
    password: '7171',
    gender: 'female',
    role: UserRole.Passenger,
    language: Language.TJ,
    role: UserRole.Passenger,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    isActive: true,
    createdAt: '2026-04-10T16:00:00Z',
    updatedAt: '2026-04-10T16:00:00Z',
  },
  {
    id: 'u5',
  {
    phone: '+992985123456',
    password: '7171',
    gender: 'male',
    role: UserRole.Driver, // Needs admin approval to simulate Admin Action!
    language: Language.RU,
    role: UserRole.Driver, // Needs admin approval to simulate Admin Action!
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    isActive: true,
    createdAt: '2026-05-20T08:00:00Z',
    updatedAt: '2026-05-20T08:00:00Z',
  },
  {
    id: 'admin1',
  {
    phone: '+992999999999',
    password: '7171',
    gender: 'male',
    role: UserRole.Admin,
    language: Language.RU,
    role: UserRole.Admin,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }
];

export const SEED_PASSENGER_PROFILES: PassengerProfile[] = [
  { id: 'pp_demo_passenger', userId: 'demo_passenger', rating: 5.0, totalTrips: 3 },
  { id: 'pp1', userId: 'u3', rating: 4.9, totalTrips: 12 },
  { id: 'pp2', userId: 'u4', rating: 4.8, totalTrips: 8 },
  { id: 'pp3', userId: 'u1', rating: 5.0, totalTrips: 1 } // Driver can have passenger profile too
];

export const SEED_DRIVER_PROFILES: DriverProfile[] = [
  {
    id: 'dp_demo_driver',
    userId: 'demo_driver',
    verificationStatus: VerificationStatus.Verified,
    licenseNumber: 'DEMO-TJ-0002',
    licensePhotoUrl: 'demo-license.jpg',
    idDocumentUrl: 'demo-passport.jpg',
    rating: 4.9,
    totalTrips: 124,
    cancellationRate: 0.01,
  },
  {
    id: 'dp1',
    userId: 'u1',
    verificationStatus: VerificationStatus.Verified,
    licenseNumber: 'TJ12345678A',
    licensePhotoUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400',
    idDocumentUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400',
    rating: 4.9,
    totalTrips: 45,
    cancellationRate: 0.02,
  },
  {
    id: 'dp2',
    userId: 'u2',
    verificationStatus: VerificationStatus.Verified,
    licenseNumber: 'TJ87654321B',
    licensePhotoUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400',
    idDocumentUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400',
    rating: 4.7,
    totalTrips: 28,
    cancellationRate: 0.05,
  },
  {
    id: 'dp3',
    userId: 'u5', // Farmukh - pending to let admin approve
    verificationStatus: VerificationStatus.PendingVerification,
    licenseNumber: 'TJ99911122C',
    licensePhotoUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400',
    idDocumentUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400',
    rating: 0.0,
    totalTrips: 0,
    cancellationRate: 0.0,
  }
];

export const SEED_VEHICLES: Vehicle[] = [
  {
    id: 'v_demo_driver',
    driverId: 'demo_driver',
    brand: 'Toyota',
    model: 'Camry',
    brand: 'Toyota',
    plateNumber: '0011 TJ 01',
    seats: 4,
    photoUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=300',
    verificationStatus: VerificationStatus.Verified,
  },
  {
    id: 'v1',
    driverId: 'u1',
    brand: 'Toyota',
    model: 'Camry',
    brand: 'Toyota',
    plateNumber: '7777 TJ 01',
    seats: 4,
    photoUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=300',
    verificationStatus: VerificationStatus.Verified,
  },
  {
    id: 'v2',
    driverId: 'u2',
    brand: 'Opel',
    model: 'Astra H',
    brand: 'Opel',
    plateNumber: '1212 TJ 02',
    seats: 4,
    photoUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=300',
    verificationStatus: VerificationStatus.Verified,
  },
  {
    id: 'v3',
    driverId: 'u5',
    brand: 'Hyundai',
    model: 'Elantra',
    brand: 'Hyundai',
    plateNumber: '8888 TJ 03',
    seats: 4,
    photoUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=300',
    verificationStatus: VerificationStatus.PendingVerification,
  }
];

// Seed Trips - Scheduled on "Today" & "Tomorrow" relative to current timestamp
export const SEED_TRIPS = (): Trip[] => {
  const todayStr = '2026-05-22';
  const tomorrowStr = '2026-05-23';

  return [
    {
      id: 't_demo_1',
      driverId: 'demo_driver',
      vehicleId: 'v_demo_driver',
      driverId: 'demo_driver',
      vehicleId: 'v_demo_driver',
      departureDate: '2026-05-25',
      departureTime: '08:30',
      departureDate: '2026-05-25',
      pickupLatitude: 38.5598,
      pickupLongitude: 68.7870,
      pickupLatitude: 38.5598,
      dropoffLatitude: 40.2826,
      dropoffLongitude: 69.6222,
      intermediateStops: [],
      pricePerSeat: 120,
      totalSeats: 4,
      availableSeats: 4,
      status: TripStatus.Published,
      allowBaggage: true,
      allowChildren: true,
      smokingAllowed: false,
      airConditioner: true,
      musicAllowed: true,
      familyFriendly: true,
      womenFriendly: true,
      familyFriendly: true,
    },
    {
      id: 't_demo_2',
      driverId: 'u1',
      vehicleId: 'v1',
      driverId: 'u1',
      vehicleId: 'v1',
      departureDate: '2026-05-25',
      departureTime: '10:15',
      pickupPoint: '???',
      departureTime: '10:15',
      intermediateStops: [],
      pricePerSeat: 150,
      totalSeats: 4,
      availableSeats: 1,
      status: TripStatus.Published,
      allowBaggage: true,
      allowChildren: true,
      smokingAllowed: false,
      airConditioner: true,
      musicAllowed: true,
      familyFriendly: false,
      womenFriendly: false,
      familyFriendly: false,
    },
    {
      id: 't_demo_3',
      driverId: 'u2',
      vehicleId: 'v2',
      driverId: 'u2',
      vehicleId: 'v2',
      departureDate: '2026-05-25',
      departureTime: '14:00',
      departureDate: '2026-05-25',
      departureTime: '14:00',
      intermediateStops: [],
      pricePerSeat: 100,
      totalSeats: 4,
      availableSeats: 4,
      status: TripStatus.Published,
      allowBaggage: false,
      allowChildren: true,
      smokingAllowed: false,
      airConditioner: false,
      musicAllowed: true,
      familyFriendly: true,
      womenFriendly: false,
      familyFriendly: true,
    },
    {
      id: 't1',
      driverId: 'u1',
      vehicleId: 'v1',
      driverId: 'u1',
      vehicleId: 'v1',
      departureDate: todayStr,
      departureTime: '08:30',
      departureDate: todayStr,
      departureTime: '08:30',
      intermediateStops: [],
      pricePerSeat: 180,
      totalSeats: 4,
      availableSeats: 3,
      status: TripStatus.Published,
      allowBaggage: true,
      allowChildren: true,
      smokingAllowed: false,
      airConditioner: true,
      musicAllowed: true,
      familyFriendly: true,
      musicAllowed: true,
    },
    {
      id: 't2',
      driverId: 'u2',
      vehicleId: 'v2',
      driverId: 'u2',
      vehicleId: 'v2',
      departureDate: todayStr,
      departureTime: '13:00',
      departureDate: todayStr,
      departureTime: '13:00',
      intermediateStops: [],
      pricePerSeat: 150,
      totalSeats: 4,
      availableSeats: 4,
      status: TripStatus.Published,
      allowBaggage: true,
      allowChildren: false,
      smokingAllowed: true,
      airConditioner: false,
      musicAllowed: true,
      familyFriendly: false,
      musicAllowed: true,
    },
    {
      id: 't3',
      driverId: 'u1',
      vehicleId: 'v1',
      driverId: 'u1',
      vehicleId: 'v1',
      departureDate: tomorrowStr,
      departureTime: '10:00',
      departureDate: tomorrowStr,
      departureTime: '10:00',
      intermediateStops: [],
      pricePerSeat: 80,
      totalSeats: 4,
      availableSeats: 4,
      status: TripStatus.Published,
      allowBaggage: true,
      allowChildren: true,
      smokingAllowed: false,
      airConditioner: true,
      musicAllowed: true,
      familyFriendly: true,
      musicAllowed: true,
    },
    {
      id: 't4',
      driverId: 'u2',
      vehicleId: 'v2',
      driverId: 'u2',
      vehicleId: 'v2',
      departureDate: todayStr,
      departureTime: '16:45',
      departureDate: todayStr,
      departureTime: '16:45',
      intermediateStops: [],
      pricePerSeat: 45,
      totalSeats: 4,
      availableSeats: 2,
      status: TripStatus.Published,
      allowBaggage: false,
      allowChildren: true,
      smokingAllowed: false,
      airConditioner: true,
      musicAllowed: true,
      familyFriendly: true,
      musicAllowed: true,
    }
  ];
};

export const SEED_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    tripId: 't1',
    passengerId: 'u3', // Dilshod
    seatsCount: 1,
    status: BookingStatus.Accepted,
    totalPrice: 180,
    status: BookingStatus.Accepted,
  },
  {
    id: 'b2',
    tripId: 't4',
    passengerId: 'u4', // Madina
    seatsCount: 2,
    status: BookingStatus.Pending,
    totalPrice: 90,
    status: BookingStatus.Pending,
  }
];

export const SEED_REVIEWS: Review[] = [
  {
    id: 'rev1',
    tripId: 't1',
    fromUserId: 'u3',
    toUserId: 'u1',
    rating: 5,
    safetyRating: 5,
    punctualityRating: 5,
    cleanlinessRating: 5,
    politenessRating: 5,
    cleanlinessRating: 5,
    createdAt: '2026-05-18T16:00:00Z'
  },
  {
    id: 'rev2',
    tripId: 't2',
    fromUserId: 'u4',
    toUserId: 'u2',
    rating: 4,
    safetyRating: 4,
    punctualityRating: 5,
    cleanlinessRating: 4,
    politenessRating: 4,
    cleanlinessRating: 4,
    createdAt: '2026-05-19T20:00:00Z'
  }
];

export const SEED_COMPLAINTS: Complaint[] = [
  {
    id: 'comp1',
    userId: 'u4',
    tripId: 't2',
    bookingId: 'b2',
    type: ComplaintType.PriceChanged,
    bookingId: 'b2',
    status: ComplaintStatus.Open,
    createdAt: '2026-05-21T06:10:00Z'
  }
];

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'u3',
    id: 'n1',
    userId: 'u3',
    type: 'booking_accepted',
    isRead: false,
    createdAt: '2026-05-22T05:30:00Z'
  },
  {
    id: 'n2',
    userId: 'u1',
    id: 'n2',
    userId: 'u1',
    type: 'booking_request',
    isRead: false,
    createdAt: '2026-05-22T05:45:00Z'
  }
];

// TRANSLATIONS
export const TRANSLATIONS = {
  [Language.RU]: {
    // Welcome / Credentials
  [Language.RU]: {
    // Welcome / Credentials
    app_slogan: 'Надёжные поездки между городами Таджикистана',
    btn_login: 'Войти',
    btn_register: 'Зарегистрироваться',
    role_choice: 'Кем вы хотите пользоваться Hamroh?',
    passenger: 'Я пассажир',
    driver: 'Я водитель',
    role_desc: 'Вы можете в любой момент изменить роль в профиле',
    sign_in: 'Вход в аккаунт',
    sign_up: 'Регистрация',
    full_name: 'ФИО пассажира или водителя',
    phone: 'Номер телефона',
    city: 'Ваш город',
    pref_lang: 'Предпочтительный язык',
    enter_otp: 'Введите СМС-код',
    simulated_otp_desc: 'Для симуляции MVP введите код: 7171',
    error_otp: 'Неверный СМС-код. Попробуйте еще раз.',

    // Passenger Home

    // Passenger Home
    nav_find: 'Найти',
    nav_my_trips: 'Мои поездки',
    nav_chat: 'Сообщения',

    nav_profile: 'Профиль',

    search_title: 'Куда едем сегодня?',
    from_city: 'Откуда (Город)',
    to_city: 'Куда (Город)',
    date: 'Дата отправления',
    passengers_count: 'Количество мест',

    // Filter and Results

    // Filter and Results
    filters: 'Фильтры',
    all_prices: 'Любая цена',
    verified_only: 'Только проверенные водители',
    non_smoking: 'Без курения',
    family_friendly: 'Семейная поездка',
    results_found: 'Найдено поездок',
    seats_left: 'мест осталось',

    // Trip details

    // Trip details
    details_title: 'Информация о поездке',
    book_seat: 'Забронировать место',
    share_trip: 'Поделиться',
    report_trip: 'Пожаловаться',
    driver_info: 'О водителе',
    car_info: 'О соат/автомобиле',
    reviews_count: 'отзывов',
    pickup_point: 'Место встречи',
    dropoff_point: 'Место прибытия',
    stops: 'Остановки в пути',
    rules: 'Правила водителя',
    comment: 'Комментарий',
    unspecified: 'Не указано',
    baggage_allowed: 'Багаж разрешен',
    baggage_disallowed: 'Без крупного багажа',
    children_allowed: 'Можно с детьми',
    smoking_allowed: 'Курение разрешено',
    no_smoking_rule: 'Курение запрещено',
    ac_on: 'Кондиционер есть',
    ac_off: 'Без кондиционера',
    family_only: 'Семейная',

    // Driver screen

    // Driver screen
    driver_nav_home: 'Главная',
    
    driver_nav_requests: 'Заявки',
    
    verified_driver_badge: 'Проверенный водитель',
    verified_car_badge: 'Проверенное авто',
    btn_become_driver: 'Стать водителем',
    driver_under_verification: 'Ваш профиль водителя находится на проверке. После подтверждения вы сможете создавать поездки.',
    driver_stats: 'Ваша статистика',
    driver_rating: 'Рейтинг водителя',
    total_trips: 'Всего поездок',
    
    publish_trip: 'Опубликовать поездку',
    
    create_trip_title: 'Создать сафар',
    price_per_seat: 'Стоимость за 1 место (сомони)',

    // My Trips tabs

    // My Trips tabs
    tab_active: 'Активные',

    // General terms

    // General terms
    tjs: 'сомони',
    pending_driver: 'На проверке',
    verified_driver: 'Верифицирован',
    pending_booking: 'Ожидает одобрения',
    accepted_booking: 'Подтверждено',
    rejected_booking: 'Отклонено',

    // Action confirmation modals

    // Action confirmation modals
    confirm_booking_title: 'Подтверждение бронирования',
    confirm_booking_desc: 'Вы бронируете {seats} место(а) за {price} сомони.',
    confirm_booking_send: 'Отправить запрос',

    // Language selector

  },
  [Language.TJ]: {
    // Welcome / Credentials
  [Language.TJ]: {
    // Welcome / Credentials
    app_slogan: 'Сафарҳои боэътимод байни шаҳрҳои Тоҷикистон',
    btn_login: 'Ворид шудан',
    btn_register: 'Рӯйхатгирӣ',
    role_choice: 'Кадом нақшро дар Hamroh истифода мебаред?',
    passenger: 'Ман мусофирам',
    driver: 'Ман ронандаам',
    role_desc: 'Шумо метавонед нақшро дар профили худ тағйир диҳед',
    sign_in: 'Воридшавӣ',
    sign_up: 'Бақайдгирӣ',
    full_name: 'Ному насаби пурра',
    phone: 'Рақами телефон',
    city: 'Шаҳри шумо',
    pref_lang: 'Забони дилхоҳ',
    enter_otp: 'Рамзи СМС-ро ворид кунед',
    simulated_otp_desc: 'Барои симулятсияи MVP ворид кунед: 7171',
    error_otp: 'Рамзи СМС нодуруст аст. Аз нав кӯшиш кунед.',

    // Passenger Home

    // Passenger Home
    nav_find: 'Ёфтан',
    nav_my_trips: 'Сафарҳо',
    nav_chat: 'Паёмҳо',

    nav_profile: 'Профил',

    search_title: 'Имрӯз ба куҷо меравем?',
    from_city: 'Аз куҷо (Шаҳр)',
    to_city: 'Ба куҷо (Шаҳр)',
    date: 'Санаи равонашавӣ',
    passengers_count: 'Шумораи ҷойҳо',

    // Filter and Results

    // Filter and Results
    filters: 'Филтрҳо',
    all_prices: 'Нархи дилхоҳ',
    verified_only: 'Танҳо ронандагони тасдиқшуда',
    non_smoking: 'Бе тамоку',
    family_friendly: 'Сафари оилавӣ',
    results_found: 'Сафарҳо ёфт шуданд',
    seats_left: 'ҷой мондааст',

    // Trip details

    // Trip details
    details_title: 'Тафсилоти сафар',
    book_seat: 'Ҷойро банд кардан',
    share_trip: 'Фиристодан',
    report_trip: 'Шикоят кардан',
    driver_info: 'Дар бораи ронанда',
    car_info: 'Дар бораи нақлиёт',
    reviews_count: 'тақризҳо',
    pickup_point: 'Ҷойи вохӯрӣ',
    dropoff_point: 'Ҷойи расидан',
    stops: 'Истгоҳҳои мобайнӣ',
    rules: 'Қоидаҳои ронанда',
    comment: 'Шарҳ',
    unspecified: 'Муайян нашудааст',
    baggage_allowed: 'Борхалта иҷозат аст',
    baggage_disallowed: 'Бе борхалтаи калон',
    children_allowed: 'Бо кӯдакон мумкин',
    smoking_allowed: 'Тамоку кашидан мумкин',
    no_smoking_rule: 'Тамоку кашидан манъ аст',
    ac_on: 'Кондиционер ҳаст',
    ac_off: 'Бе кондиционер',
    family_only: 'Оилавӣ',

    // Driver screen

    // Driver screen
    driver_nav_home: 'Асосӣ',

    driver_nav_requests: 'Дархостҳо',

    verified_driver_badge: 'Ронандаи тасдиқшуда',
    verified_car_badge: 'Нақлиёти тасдиқшуда',
    btn_become_driver: 'Ронанда шудан',
    driver_under_verification: 'Профили ронандагии шумо дар санҷиш аст. Пас аз тасдиқ шумо метавонед сафарҳо эҷод кунед.',
    driver_stats: 'Омори шумо',
    driver_rating: 'Рейтинги ронанда',
    total_trips: 'Миқдори сафарҳо',

    publish_trip: 'Сафарро эълон кардан',

    create_trip_title: 'Эҷоди сафар',
    price_per_seat: 'Нархи як ҷой (сомонӣ)',

    // My Trips tabs

    // My Trips tabs
    tab_active: 'Фаъол',

    // General terms

    // General terms
    tjs: 'сомонӣ',
    pending_driver: 'Дар санҷиш',
    verified_driver: 'Тасдиқшуда',
    pending_booking: 'Мунтазири тасдиқ',
    accepted_booking: 'Тасдиқшуда',
    rejected_booking: 'Радшуда',

    // Action confirmation modals

    // Action confirmation modals
    confirm_booking_title: 'Тасдиқи бандкунӣ',
    confirm_booking_desc: 'Шумо {seats} ҷойро ба маблағи {price} сомонӣ фармоиш медиҳед.',
    confirm_booking_send: 'Фиристодани дархост',

    // Language selector

  },
  [Language.EN]: {
    // Welcome / Credentials
    app_slogan: 'Reliable ride-sharing between cities in Tajikistan',
    btn_login: 'Log In',
    btn_register: 'Sign Up',
    role_choice: 'How do you want to use Hamroh?',
    passenger: 'I am a passenger',
    driver: 'I am a driver',
    role_desc: 'You can change your role in your profile at any time',
    sign_in: 'Account Log In',
    sign_up: 'Registration',
    full_name: 'Full Name of Passenger or Driver',
    phone: 'Phone Number',
    city: 'Your City',
    pref_lang: 'Preferred Language',
    enter_otp: 'Enter SMS Code',
    simulated_otp_desc: 'For MVP simulation, enter code: 7171',
    error_otp: 'Invalid SMS code. Please try again.',
    success_login: 'Logged in successfully!',
    start: 'Start Safar',

    // Passenger Home
    nav_find: 'Search',
    nav_my_trips: 'My Rides',
    nav_chat: 'Messages',
    nav_notifications: 'Alerts',
    nav_profile: 'Profile',

    search_title: 'Where are we going today?',
    from_city: 'From (City)',
    to_city: 'To (City)',
    date: 'Departure Date',
    passengers_count: 'Required Seats',
    baggage_checkbox: 'Has baggage',
    search_btn: 'Search Rides',

    // Filter and Results
    filters: 'Filters',
    all_prices: 'Any price',
    verified_only: 'Verified drivers only',
    non_smoking: 'Non-smoking',
    family_friendly: 'Family-friendly',
    results_found: 'Rides found',
    seats_left: 'seats left',
    no_trips_found: 'Sorry, no rides found for this route on this date.',
    no_trips_found_desc: 'Try changing search parameters or search date.',

    // Trip details
    details_title: 'Ride Details',
    book_seat: 'Book a seat',
    share_trip: 'Share',
    report_trip: 'Report',
    driver_info: 'About Driver',
    car_info: 'About Car',
    reviews_count: 'reviews',
    pickup_point: 'Pickup Point',
    dropoff_point: 'Drop-off Point',
    stops: 'Intermediate Stops',
    rules: 'Driver Rules',
    comment: 'Comment',
    unspecified: 'Unspecified',
    baggage_allowed: 'Baggage allowed',
    baggage_disallowed: 'No large baggage',
    children_allowed: 'Children friendly',
    smoking_allowed: 'Smoking allowed',
    no_smoking_rule: 'Smoking forbidden',
    ac_on: 'Air Conditioner present',
    ac_off: 'No Air Conditioner',
    family_only: 'Family-friendly',
    cash_pay: 'Cash payment to driver',
    not_verified_banner: 'Contacts and car plate will be shown after booking acceptance',

    // Driver screen
    driver_nav_home: 'Dashboard',
    driver_nav_create: 'Publish',
    driver_nav_requests: 'Requests',
    
    verified_driver_badge: 'Verified Driver',
    verified_car_badge: 'Verified Car',
    btn_become_driver: 'Become Driver',
    driver_under_verification: 'Your driver profile is being verified by admin. Once completed, you will be able to create rides.',
    driver_stats: 'Your Statistics',
    driver_rating: 'Driver Rating',
    total_trips: 'Total Rides',
    earned: 'Total Earned',
    publish_trip: 'Publish Ride',
    
    create_trip_title: 'Create Ride',
    price_per_seat: 'Price per 1 seat (Somoni)',
    recommended_price: 'Recommended price: ',
    comment_placeholder: 'Write important details (meeting place, vehicle brand, departure time, etc.)',

    // My Trips tabs
    tab_active: 'Active',
    tab_completed: 'Completed',
    tab_cancelled: 'Cancelled',

    // General terms
    tjs: 'somoni',
    pending_driver: 'Under Verification',
    verified_driver: 'Verified',
    pending_booking: 'Pending Approval',
    accepted_booking: 'Confirmed',
    rejected_booking: 'Rejected',
    cancelled_booking: 'Cancelled',
    completed_booking: 'Completed',

    // Action confirmation modals
    confirm_booking_title: 'Booking Confirmation',
    confirm_booking_desc: 'You are booking {seats} seat(s) for {price} somoni.',
    confirm_booking_send: 'Send Booking Request',
    booking_success: 'Request Sent successfully!',
    booking_success_desc: 'The driver has received your application and will contact you or confirm shortly.',

    // Language selector
    lang_name: 'English',
  }
};
