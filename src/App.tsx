/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, UserRole, Language, VerificationStatus, BookingStatus, TripStatus, ComplaintStatus,
  Trip, Booking, Review, Complaint, Notification, DriverProfile, Vehicle, City, Route, SuggestedDirection
} from './types';
import { 
  SEED_USERS, SEED_DRIVER_PROFILES, SEED_VEHICLES, SEED_TRIPS, SEED_BOOKINGS, 
  SEED_REVIEWS, SEED_COMPLAINTS, SEED_NOTIFICATIONS, ROUTES 
} from './mockData';
import PhoneSimulator from './components/PhoneSimulator';
import DeveloperDocs from './components/DeveloperDocs';
import { 
  Users, Layers, Settings, ShieldCheck, ShieldAlert, BarChart3, Star, AlertCircle, CheckCircle, 
  Calendar, Check, X, Hammer, FileCode, Lock, Globe, Server, AlertTriangle, MapPin, Compass
} from 'lucide-react';

const HAMROH_CITIES: City[] = [
  { id: '1', nameRu: 'Душанбе', nameTj: 'Душанбе', isActive: true },
  { id: '2', nameRu: 'Худжанд', nameTj: 'Хуҷанд', isActive: true },
  { id: '3', nameRu: 'Бохтар', nameTj: 'Бохтар', isActive: true },
  { id: '4', nameRu: 'Куляб', nameTj: 'Кӯлоб', isActive: true },
  { id: '5', nameRu: 'Панджакент', nameTj: 'Панҷакент', isActive: true },
  { id: '6', nameRu: 'Турсунзода', nameTj: 'Турсунзода', isActive: true },
  { id: '7', nameRu: 'Истаравшан', nameTj: 'Истаравшан', isActive: true },
  { id: '8', nameRu: 'Исфара', nameTj: 'Исфара', isActive: true },
  { id: '9', nameRu: 'Канибадам', nameTj: 'Конибодом', isActive: true },
];

export default function App() {
  // MASTER ROOT STATES (Acting as our simulated full-stack database)
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [driverProfiles, setDriverProfiles] = useState<DriverProfile[]>(SEED_DRIVER_PROFILES);
  const [vehicles, setVehicles] = useState<Vehicle[]>(SEED_VEHICLES);
  const [trips, setTrips] = useState<Trip[]>(SEED_TRIPS());
  const [bookings, setBookings] = useState<Booking[]>(SEED_BOOKINGS);
  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS);
  const [complaints, setComplaints] = useState<Complaint[]>(SEED_COMPLAINTS);
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);

  // Dynamic Cities & Roads Map configuration
  const [cities, setCities] = useState<City[]>(HAMROH_CITIES);
  const [routes, setRoutes] = useState<Route[]>(ROUTES);
  const [suggestedDirections, setSuggestedDirections] = useState<SuggestedDirection[]>([
    {
      id: 's1',
      userId: 'u3',
      userFullName: 'Дилшод Назаров',
      type: 'city',
      nameRu: 'Хорог',
      nameTj: 'Хоруғ',
      details: 'Хорог — административный центр Горно-Бадахшанской автономной области (ГБАО). Поездка идет через Куляб, перевал Хобуработ и Дарвазский район. В зимнее время проезд затруднен, требуются мощные внедорожники.',
      status: 'pending',
      createdAt: '2026-05-21T06:12:00Z'
    },
    {
      id: 's2',
      userId: 'u1',
      userFullName: 'Сомон Файзуллаев',
      type: 'route',
      nameRu: 'Душанбе — Муминабад',
      nameTj: 'Душанбе — Мӯъминобод',
      details: 'Регулярная трасса по южному направлению, поворот из города Куляб. Проезжаем живописные холмистые ландшафты у подножия вершин Чилдухтарон. Покрытие асфальтовое, средняя скорость 70 км/ч.',
      status: 'pending',
      createdAt: '2026-05-22T03:35:00Z'
    }
  ]);

  // Screen selection inside our Web Portal Tab Wrapper
  const [webTab, setWebTab] = useState<'docs' | 'admin'>('docs');

  // Emulator configuration options
  const [deviceType, setDeviceType] = useState<'ios' | 'android'>('ios');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Admin section temporary states
  const [adminNote, setAdminNote] = useState<{ [key: string]: string }>({});

  // Help bypass / shortcut logins instantly
  const handleBypassLogin = (userIndex: number) => {
    // 0: Somon (Driver), 1: Alisher (Driver), 2: Dilshod (Passenger), 3: Madina (Passenger), 4: Farrukh (Pending Driver), 5: Admin
    try {
      let selectedUser: User;
      if (userIndex === -2) selectedUser = users.find(u => u.phone === '+992501000001')!;
      else if (userIndex === -1) selectedUser = users.find(u => u.phone === '+992501000002')!;
      else if (userIndex === 0) selectedUser = users.find(u => u.phone === '+992900111111')!;
      else if (userIndex === 1) selectedUser = users.find(u => u.phone === '+992933222222')!;
      else if (userIndex === 2) selectedUser = users.find(u => u.phone === '+992918333333')!;
      else if (userIndex === 3) selectedUser = users.find(u => u.phone === '+992901444444')!;
      else if (userIndex === 4) selectedUser = users.find(u => u.phone === '+992985123456')!;
      else selectedUser = users.find(u => u.id === 'admin1')!;

      setCurrentUser(selectedUser);
      alert(`Авторизован как: ${selectedUser.fullName} (${selectedUser.role === UserRole.Admin ? 'Админ' : selectedUser.role})`);
    } catch (err) {
      alert('Ошибка быстрого входа.');
    }
  };

  // Admin Actions: Approve Driver + Vehicle
  const handleAdminApproveDriver = (userId: string) => {
    // Verified Driver profile
    setDriverProfiles(driverProfiles.map(dp => 
      dp.userId === userId ? { ...dp, verificationStatus: VerificationStatus.Verified } : dp
    ));

    // Verified Vehicle
    setVehicles(vehicles.map(v => 
      v.driverId === userId ? { ...v, verificationStatus: VerificationStatus.Verified } : v
    ));

    // Send Alert Notification
    const okNotif: Notification = {
      id: 'n_not_' + Date.now(),
      userId: userId,
      title: 'Лицензия Одобрена!',
      message: 'Администратор Hamroh верифицировал ваши документы и автомобиль. Теперь вы можете создавать поездки!',
      type: 'verification_success',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications([okNotif, ...notifications]);
  };

  // Admin Actions: Reject Driver + Vehicle
  const handleAdminRejectDriver = (userId: string) => {
    setDriverProfiles(driverProfiles.map(dp => 
      dp.userId === userId ? { ...dp, verificationStatus: VerificationStatus.Rejected } : dp
    ));
    setVehicles(vehicles.map(v => 
      v.driverId === userId ? { ...v, verificationStatus: VerificationStatus.Rejected } : v
    ));
  };

  // Toggle user active status (for block/unblock)
  const handleAdminToggleUserActive = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
  };

  // Admin verify complaint resolution details
  const handleAdminResolveComplaint = (compId: string) => {
    const note = adminNote[compId] || 'Проблема урегулирована по согласию сторон.';
    setComplaints(complaints.map(c => 
      c.id === compId ? { ...c, status: ComplaintStatus.Resolved, adminNote: note } : c
    ));
  };

  // Admin approval of custom user-submitted cities and directions/routes
  const handleAdminApproveDirection = (suggestedId: string) => {
    const sug = suggestedDirections.find(s => s.id === suggestedId);
    if (!sug) return;

    // 1. Update suggestion status
    setSuggestedDirections(prev => prev.map(s => 
      s.id === suggestedId ? { ...s, status: 'approved' } : s
    ));

    // 2. Add to active collections
    if (sug.type === 'city') {
      const exists = cities.some(c => c.nameRu.toLowerCase() === sug.nameRu.toLowerCase());
      if (!exists) {
        const newCityId = String(cities.length + 10);
        const newCity: City = {
          id: newCityId,
          nameRu: sug.nameRu,
          nameTj: sug.nameTj || sug.nameRu,
          isActive: true
        };
        setCities(prev => [...prev, newCity]);
      }
    } else {
      // It's a route. Try parsing "CityA — CityB"
      const parts = sug.nameRu.split(/[—\->]/).map(p => p.trim());
      if (parts.length >= 2) {
        let fromCity = cities.find(c => c.nameRu.toLowerCase() === parts[0].toLowerCase());
        let toCity = cities.find(c => c.nameRu.toLowerCase() === parts[1].toLowerCase());

        if (!fromCity) {
          fromCity = { id: 'c_new_' + Math.random().toString(36).substr(2, 5), nameRu: parts[0], nameTj: parts[0], isActive: true };
          setCities(prev => [...prev, fromCity!]);
        }
        if (!toCity) {
          toCity = { id: 'c_new_' + Math.random().toString(36).substr(2, 5), nameRu: parts[1], nameTj: parts[1], isActive: true };
          setCities(prev => [...prev, toCity!]);
        }

        const newRouteObj: Route = {
          id: 'r_dyn_' + Date.now(),
          fromCityId: fromCity.id,
          toCityId: toCity.id,
          recommendedMinPrice: 60,
          recommendedMaxPrice: 160,
          isActive: true
        };
        setRoutes(prev => [...prev, newRouteObj]);
      }
    }

    // 3. Notify the client
    const okNotif: Notification = {
      id: 'n_sug_' + Date.now(),
      userId: sug.userId,
      title: 'Направление одобрено! ✅',
      message: `Ваше новое направление "${sug.nameRu}" одобрено модератором и готово к использованию в Hamroh!`,
      type: 'complaint_resolved',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications([okNotif, ...notifications]);
    alert(`Направление "${sug.nameRu}" успешно одобрено и активировано на платформе!`);
  };

  const handleAdminRejectDirection = (suggestedId: string) => {
    setSuggestedDirections(prev => prev.map(s => 
      s.id === suggestedId ? { ...s, status: 'rejected' } : s
    ));
    const sug = suggestedDirections.find(s => s.id === suggestedId);
    if (sug) {
      const failNotif: Notification = {
        id: 'n_sug_f_' + Date.now(),
        userId: sug.userId,
        title: 'Маршрут отклонён',
        message: `Ваша заявка на направление "${sug.nameRu}" отклонена. Укажите более точные сведения.`,
        type: 'booking_rejected',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications([failNotif, ...notifications]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      
      {/* Top Main Navigation Bar */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between space-y-3.5 md:space-y-0 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-xl tracking-tighter shrink-0 shadow-lg">
            H
          </div>
          <div className="text-left">
            <h1 className="font-extrabold text-base tracking-tight text-[#0F172A] flex items-center space-x-2">
              <span>Hamroh Mobile Panel</span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">Tajikistan MVP</span>
            </h1>
            <p className="text-xs text-[#64748B]">Intercity ride-sharing carpool services for Dushanbe, Khujand, Bokhtar, and Kulyab.</p>
          </div>
        </div>

        {/* Global developer bypass action panel */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xl flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#64748B] font-mono font-bold flex items-center space-x-1">
            <Hammer className="w-3.5 h-3.5 text-amber-500" />
            <span>Инструменты Отладки (Вход):</span>
          </span>
          <div className="flex flex-wrap gap-1">
            <button 
              onClick={() => handleBypassLogin(-2)} 
              className="text-[10px] bg-[#D1FAE5] hover:bg-emerald-200 text-[#047857] px-2.5 py-1 rounded border border-[#10B981]/30 transition-all font-black"
              title="Телефон: +992501000001, пароль: 7171"
            >
              Демо пассажир
            </button>
            <button 
              onClick={() => handleBypassLogin(-1)} 
              className="text-[10px] bg-[#D1FAE5] hover:bg-emerald-200 text-[#047857] px-2.5 py-1 rounded border border-[#10B981]/30 transition-all font-black"
              title="Телефон: +992501000002, пароль: 7171"
            >
              Демо водитель
            </button>
            <button 
              onClick={() => handleBypassLogin(2)} 
              className="text-[10px] bg-white hover:bg-[#D1FAE5] text-[#0F172A] px-2.5 py-1 rounded border border-[#E2E8F0] transition-all font-medium"
            >
              🧔 Мусофир (Пассажир)
            </button>
            <button 
              onClick={() => handleBypassLogin(0)} 
              className="text-[10px] bg-white hover:bg-[#D1FAE5] text-[#0F172A] px-2.5 py-1 rounded border border-[#E2E8F0] transition-all font-medium"
            >
              🚗 Ронанда (Водитель)
            </button>
            <button 
              onClick={() => handleBypassLogin(4)} 
              className="text-[10px] bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 px-2.5 py-1 rounded border border-amber-500/30 transition-all font-medium"
              title="Для теста верификации"
            >
              📝 Новый водитель
            </button>
            <button 
              onClick={() => handleBypassLogin(5)} 
              className="text-[10px] bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2.5 py-1 rounded border border-red-500/30 transition-all font-medium"
            >
              🛡️ Админ
            </button>
          </div>
        </div>
      </header>

      {/* Main Multi-Column Split Portal Layout */}
      <main className="grow grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto w-full items-start">
        
        {/* LEFT COLUMN: INTERACTIVE PHYSICAL SIMULATOR PORT (Spans 4 columns) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <PhoneSimulator 
            users={users} setUsers={setUsers}
            trips={trips} setTrips={setTrips}
            bookings={bookings} setBookings={setBookings}
            reviews={reviews} setReviews={setReviews}
            complaints={complaints} setComplaints={setComplaints}
            notifications={notifications} setNotifications={setNotifications}
            driverProfiles={driverProfiles} setDriverProfiles={setDriverProfiles}
            vehicles={vehicles} setVehicles={setVehicles}
            deviceType={deviceType} setDeviceType={setDeviceType}
            currentUser={currentUser} setCurrentUser={setCurrentUser}
            cities={cities} setCities={setCities}
            routes={routes} setRoutes={setRoutes}
            suggestedDirections={suggestedDirections} setSuggestedDirections={setSuggestedDirections}
          />
        </div>

        {/* RIGHT COLUMN: WORKSPACE PANELS & TABS (Spans 7 columns) */}
        <div className="lg:col-span-7 flex flex-col h-180 bg-slate-950/20 rounded-2xl border border-slate-800 overflow-hidden">
          
          {/* Header Switch Toggles */}
          <div className="flex border-b border-slate-800 bg-slate-900/50 p-2 justify-between items-center shrink-0">
            <span className="text-xs font-bold text-slate-400 px-3 uppercase font-mono">Workspace Views</span>
            <div className="flex space-x-1">
              <button
                id="workspace-btn-docs"
                onClick={() => setWebTab('docs')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all uppercase ${
                  webTab === 'docs' 
                    ? 'bg-emerald-500 text-slate-950 shadow font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Developer Portal Code</span>
              </button>

              <button
                id="workspace-btn-admin"
                onClick={() => setWebTab('admin')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all uppercase relative ${
                  webTab === 'admin' 
                    ? 'bg-emerald-500 text-slate-950 shadow font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Moderation</span>
                {/* Visual state badge showing pending approvals */}
                {driverProfiles.filter(p => p.verificationStatus === VerificationStatus.PendingVerification).length > 0 && (
                  <span className="w-2.5 h-2.5 bg-rose-500 border border-slate-950 rounded-full absolute -top-0.5 -right-0.5 animate-ping"></span>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 bg-slate-950">
            {/* TAB ONE: DOCUMENTATION AND READY CODE TEMPLATES */}
            {webTab === 'docs' && <DeveloperDocs />}

            {/* TAB TWO: LIVE INTERACTIVE ADMIN CONSOLE PANEL */}
            {webTab === 'admin' && (
              <div id="admin-panel-console" className="p-6 overflow-y-auto h-full space-y-6 text-left">
                
                {/* Stats panel summary */}
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-white flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Hamroh Tajikistan Admin Dashboard</span>
                  </h3>
                  <p className="text-xs text-slate-400">Manage user licenses, confirm vehicles, resolve complaints and enforce business rules.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Всего поездок</span>
                    <span className="text-lg font-black text-slate-100">{trips.length}</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Активные На Проверке</span>
                    <span className="text-lg font-black text-amber-400">
                      {driverProfiles.filter(d => d.verificationStatus === VerificationStatus.PendingVerification).length}
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Жалобы Open</span>
                    <span className="text-lg font-black text-rose-500">
                      {complaints.filter(c => c.status === ComplaintStatus.Open).length}
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Зарегистрировано</span>
                    <span className="text-lg font-black text-sky-400">{users.length}</span>
                  </div>
                </div>

                {/* MODERATION SUBSECTION A: PENDING LICENSES AND VEHICLES */}
                <div className="space-y-3">
                  <div className="border-b border-slate-800 pb-1 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      🛡️ Заявки на верификацию водителей
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">В ручном режиме</span>
                  </div>

                  {driverProfiles.filter(p => p.verificationStatus === VerificationStatus.PendingVerification).length === 0 ? (
                    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-xl text-center">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 italic">Все водители и транспортные средства верифицированы!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {driverProfiles.filter(p => p.verificationStatus === VerificationStatus.PendingVerification).map(p => {
                        const drvUser = users.find(u => u.id === p.userId);
                        const drvVeh = vehicles.find(v => v.driverId === p.userId);

                        return (
                          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                              {/* Driver description */}
                              <div className="flex items-center space-x-2.5">
                                <img src={drvUser?.avatarUrl} className="w-9 h-9 rounded-full border border-slate-700" alt="" />
                                <div className="text-left">
                                  <span className="block font-bold text-xs text-white">{drvUser?.fullName}</span>
                                  <span className="block text-[10px] text-slate-400">{drvUser?.phone} • {drvUser?.city}</span>
                                </div>
                              </div>

                              <div className="text-[11px] font-mono text-slate-400 leading-normal pl-2 border-l-2 border-slate-800 space-y-0.5">
                                <div><b>Лицензия (ВУ) №:</b> {p.licenseNumber || 'Не заполнено'}</div>
                                <div><b>Автомобиль:</b> {drvVeh ? `${drvVeh.brand} ${drvVeh.model} (${drvVeh.color}) [${drvVeh.plateNumber}]` : 'Автомобиль не добавлен'}</div>
                              </div>
                            </div>

                            {/* Approving Controls */}
                            <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 shrink-0">
                              <button
                                onClick={() => handleAdminApproveDriver(p.userId)}
                                className="flex-1 md:w-28 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold text-xs py-1.5 px-3 rounded-lg text-center transition-colors"
                              >
                                Подтвердить ВУ
                              </button>
                              <button
                                onClick={() => handleAdminRejectDriver(p.userId)}
                                className="flex-1 md:w-28 bg-rose-950/40 hover:bg-rose-950 text-rose-500 border border-rose-900/40 font-bold text-xs py-1.5 px-3 rounded-lg text-center transition-all"
                              >
                                Отклонить
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* MODERATION SUBSECTION B: ACTIVE COMPLAINTS / DISPUTE CENTER */}
                <div className="space-y-3">
                  <div className="border-b border-slate-800 pb-1 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      ⚠️ Арбитраж и жалобы
                    </span>
                    <span className="text-[10px] text-rose-400">Служба Безопасности</span>
                  </div>

                  {complaints.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Жалоб от пассажиров на данный момент нет.</p>
                  ) : (
                    <div className="space-y-3">
                      {complaints.map(c => {
                        const complainee = users.find(u => u.id === c.userId);
                        const isResolved = c.status === ComplaintStatus.Resolved;

                        return (
                          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center bg-slate-950 px-3 py-1.5 rounded-lg text-[10px]">
                              <span className="font-bold text-slate-300">Автор: {complainee?.fullName}</span>
                              <span className={`px-1.5 py-0.5 rounded font-mono uppercase ${isResolved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {c.status}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 leading-normal bg-slate-950/40 p-2.5 rounded border border-slate-950/60">
                              <b>Суть конфликта:</b> {c.description}
                            </p>

                            {isResolved ? (
                              <div className="text-[11px] text-emerald-400 bg-emerald-500/5 p-2 rounded">
                                <b>Решение администратора:</b> {c.adminNote}
                              </div>
                            ) : (
                              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                                <input 
                                  type="text" 
                                  placeholder="Решение администратора перед закрытием"
                                  value={adminNote[c.id] || ''}
                                  onChange={(e) => setAdminNote({ ...adminNote, [c.id]: e.target.value })}
                                  className="flex-1 bg-slate-950 border border-slate-800 text-xs px-3 py-1 text-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                />
                                <button
                                  onClick={() => handleAdminResolveComplaint(c.id)}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[10px] py-1 px-4 rounded-lg transition-colors shadow"
                                >
                                  Разрешить Спор
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* MODERATION SUBSECTION NEW: SUGGESTED CITIES AND DIRECTIONS */}
                <div className="space-y-3">
                  <div className="border-b border-slate-800 pb-1 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      🌍 Новые города и направления от пользователей
                    </span>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/10">Требует одобрения</span>
                  </div>

                  {suggestedDirections.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Нет предложенных направлений.</p>
                  ) : (
                    <div className="space-y-3">
                      {suggestedDirections.map(s => {
                        const isPending = s.status === 'pending';
                        const isApproved = s.status === 'approved';
                        const isRejected = s.status === 'rejected';

                        return (
                          <div key={s.id} className="bg-slate-900 border border-slate-850 rounded-xl p-4.5 space-y-3">
                            <div className="flex justify-between items-center bg-slate-950 px-3 py-1.5 rounded-lg text-[10px] text-slate-300 font-semibold">
                              <span className="flex items-center space-x-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${s.type === 'city' ? 'bg-sky-400' : 'bg-indigo-400'}`}></span>
                                <span>Предложил(а): {s.userFullName}</span>
                              </span>
                              <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                                isApproved ? 'bg-emerald-500/10 text-emerald-400' :
                                isRejected ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {isApproved ? 'Одобрено' : isRejected ? 'Отклонено' : 'На рассмотрении'}
                              </span>
                            </div>

                            <div className="text-xs space-y-1.5 text-left text-slate-200">
                              <div>
                                <span className="text-slate-400 text-[10px] block uppercase font-mono">Тип объекта:</span>
                                <span className="font-extrabold text-white text-[11px] bg-slate-800/60 px-2 py-0.5 rounded inline-block mt-0.5">
                                  {s.type === 'city' ? '🌆 Новый Город' : '🛣️ Новое Направление (Маршрут)'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px] block uppercase font-mono">Интерфейсный ярлык (RU/TJ):</span>
                                <span className="font-bold text-emerald-450 text-emerald-400 text-sm block tracking-tight">
                                  {s.nameRu} <span className="text-slate-400 font-light font-sans">({s.nameTj || 'без тадж.'})</span>
                                </span>
                              </div>
                              <div className="bg-slate-950/60 border border-slate-900 p-2.5 rounded-lg">
                                <span className="text-slate-450 text-[10px] block uppercase font-mono mb-1">Детальное описание направления (от автора):</span>
                                <p className="text-[11.5px] text-slate-300 leading-relaxed italic pr-2 font-sans">
                                  "{s.details}"
                                </p>
                              </div>
                            </div>

                            {isPending && (
                              <div className="flex space-x-2 pt-1 justify-end">
                                <button
                                  onClick={() => handleAdminApproveDirection(s.id)}
                                  className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-black text-[10.5px] py-1.5 px-4 rounded-lg transition-colors cursor-pointer shadow-md"
                                >
                                  Одобрить и добавить
                                </button>
                                <button
                                  onClick={() => handleAdminRejectDirection(s.id)}
                                  className="bg-slate-800 hover:bg-slate-700 hover:text-rose-450 text-slate-300 border border-slate-700 font-bold text-[10.5px] py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                                >
                                  Отклонить
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* MODERATION SUBSECTION C: TOTAL SYSTEM USERS list */}
                <div className="space-y-3">
                  <div className="border-b border-slate-800 pb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      👥 Сводный реестр пользователей Hamroh
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800 overflow-hidden">
                    {users.map(u => (
                      <div key={u.id} className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2.5">
                          <img src={u.avatarUrl} className="w-8 h-8 rounded-full border border-slate-800" alt="" />
                          <div className="text-left">
                            <span className="block font-bold text-white">{u.fullName} {u.role === UserRole.Admin ? '🛡️' : ''}</span>
                            <span className="text-[10px] text-slate-400">{u.phone} • {u.role}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${u.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                            {u.isActive ? 'Активен' : 'Заблокирован'}
                          </span>
                          
                          {u.id !== 'admin1' && (
                            <button
                              onClick={() => handleAdminToggleUserActive(u.id)}
                              className={`text-[9px] font-bold py-1 px-2.5 rounded transition-all ${
                                u.isActive 
                                  ? 'bg-rose-950/40 hover:bg-rose-950 text-rose-400' 
                                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-600'
                              }`}
                            >
                              {u.isActive ? 'Бан' : 'Разбанить'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer system branding */}
      <footer className="bg-white border-t border-[#E2E8F0] px-6 py-4 text-center text-xs text-[#64748B] shrink-0 mt-auto">
        <p className="flex items-center justify-center space-x-1.5">
          <span>© 2026 Hamroh.tj. Разработано по стандартам BlaBlaCar для Республики Таджикистан.</span>
        </p>
      </footer>
    </div>
  );
}
