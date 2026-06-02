/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  User, UserRole, VerificationStatus, ComplaintStatus,
  Trip, Booking, Review, Complaint, Notification, DriverProfile, Vehicle, City, Route, SuggestedDirection
} from './types';
import { 
  SEED_USERS, SEED_DRIVER_PROFILES, SEED_VEHICLES, SEED_TRIPS, SEED_BOOKINGS, 
  SEED_REVIEWS, SEED_COMPLAINTS, SEED_NOTIFICATIONS, ROUTES 
} from './mockData';
import PhoneSimulator from './components/PhoneSimulator';
import DeveloperDocs from './components/DeveloperDocs';
import AdminDashboard from './components/AdminDashboard';
import { Hammer, FileCode, Lock } from 'lucide-react';

const HAMROH_CITIES: City[] = [
} from 'lucide-react';

const HAMROH_CITIES: City[] = [
  { id: '1', nameRu: 'Душанбе', nameTj: 'Душанбе', isActive: true },
  { id: '2', nameRu: 'Худжанд', nameTj: 'Хуҷанд', isActive: true },
  { id: '3', nameRu: 'Бохтар', nameTj: 'Бохтар', isActive: true },
  { id: '4', nameRu: 'Куляб', nameTj: 'Кӯлоб', isActive: true },
  { id: '5', nameRu: 'Панджакент', nameTj: 'Панҷакент', isActive: true },
  { id: '6', nameRu: 'Турсунзода', nameTj: 'Турсунзода', isActive: true },
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
    {
      type: 'city',
      userId: 'u3',
      userFullName: 'Дилшод Назаров',
      type: 'city',
      status: 'pending',
      createdAt: '2026-05-21T06:12:00Z'
    },
    {
      id: 's2',
      userId: 'u1',
    {
      type: 'route',
      userId: 'u1',
      userFullName: 'Сомон Файзуллаев',
      type: 'route',
      status: 'pending',
      createdAt: '2026-05-22T03:35:00Z'
    }
  ]);

  // Screen selection inside our Web Portal Tab Wrapper
  const [webTab, setWebTab] = useState<'docs' | 'admin'>('docs');

  // Emulator configuration options
  const [deviceType, setDeviceType] = useState<'ios' | 'android'>('ios');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);

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

      if (selectedUser.role === UserRole.Admin) {
        setAdminUser(selectedUser);
        setCurrentUser(null);
        setWebTab('admin');
        alert(`ÐÐ´Ð¼Ð¸Ð½ Ð²Ð¾ÑˆÐµÐ»: ${selectedUser.fullName}`);
        return;
      }

      setAdminUser(null);
      setCurrentUser(selectedUser);
      alert(`Ð’Ñ…Ð¾Ð´ Ð²Ñ‹Ð¿Ð¾Ð»Ð½ÐµÐ½: ${selectedUser.fullName} (${selectedUser.role})`);
    } catch (err) {
      alert('ÐÐµ ÑƒÐ´Ð°Ð»Ð¾ÑÑŒ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚ÑŒ Ð´ÐµÐ¼Ð¾-Ð¿Ñ€Ð¾Ñ„Ð¸Ð»ÑŒ.');
    }
  };

  const handleMobileUserChange = (user: User | null) => {
    if (user?.role === UserRole.Admin) {
      setAdminUser(user);
      setCurrentUser(null);
      setWebTab('admin');
      return;
    }

    setAdminUser(null);
    setCurrentUser(user);
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setWebTab('docs');
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
  };

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
          nameTj: sug.nameTj || sug.nameRu,
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
      // It's a route. Try parsing "CityA ï¿½ CityB"
      const parts = sug.nameRu.split(/[ï¿½\->]/).map(p => p.trim());
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
      };
      setNotifications([failNotif, ...notifications]);
      type: 'complaint_resolved',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications([okNotif, ...notifications]);
      
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
            <p className="text-xs text-[#64748B]">Intercity ride-sharing carpool services for Dushanbe, Khujand, Bokhtar, and Kulyab.</p>
          </div>
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
              <span>{adminUser ? 'Hamroh Admin Control Center' : 'Hamroh Mobile Panel'}</span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">{adminUser ? 'Operations' : 'Tajikistan MVP'}</span>
            </h1>
            <p className="text-xs text-[#64748B]">{adminUser ? 'Administrative oversight, moderation, verification and platform safety.' : 'Intercity ride-sharing carpool services for Dushanbe, Khujand, Bokhtar, and Kulyab.'}</p>
          </div>
        </div>

        {/* Global developer bypass action panel */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xl flex flex-wrap items-center gap-2">
          {adminUser ? (
            <>
              <span className="text-xs text-[#64748B] font-mono font-bold flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>ÐÐ´Ð¼Ð¸Ð½-ÑÐµÑÑÐ¸Ñ:</span>
              </span>
              <span className="text-[10px] bg-slate-950 text-white px-2.5 py-1 rounded border border-slate-800 font-black">
                {adminUser.fullName}
              </span>
              <button
                onClick={handleAdminLogout}
                className="text-[10px] bg-white hover:bg-rose-50 text-rose-600 px-2.5 py-1 rounded border border-rose-200 transition-all font-black"
              >
                Ð’Ñ‹Ð¹Ñ‚Ð¸
              </button>
            </>
          ) : (
            <>
          <span className="text-xs text-[#64748B] font-mono font-bold flex items-center space-x-1">
            <Hammer className="w-3.5 h-3.5 text-amber-500" />
          </div>
          </span>
          <div className="flex flex-wrap gap-1">
            <button 
              onClick={() => handleBypassLogin(-2)} 
              className="text-[10px] bg-[#D1FAE5] hover:bg-emerald-200 text-[#047857] px-2.5 py-1 rounded border border-[#10B981]/30 transition-all font-black"
        
            >
        <div className="lg:col-span-5 flex flex-col items-center">
            </button>
            <button 
              onClick={() => handleBypassLogin(-1)} 
              className="text-[10px] bg-[#D1FAE5] hover:bg-emerald-200 text-[#047857] px-2.5 py-1 rounded border border-[#10B981]/30 transition-all font-black"
            reviews={reviews} setReviews={setReviews}
            >
            notifications={notifications} setNotifications={setNotifications}
            </button>
            <button 
              onClick={() => handleBypassLogin(2)} 
              className="text-[10px] bg-white hover:bg-[#D1FAE5] text-[#0F172A] px-2.5 py-1 rounded border border-[#E2E8F0] transition-all font-medium"
            >
            routes={routes} setRoutes={setRoutes}
            </button>
            <button 
              onClick={() => handleBypassLogin(0)} 
              className="text-[10px] bg-white hover:bg-[#D1FAE5] text-[#0F172A] px-2.5 py-1 rounded border border-[#E2E8F0] transition-all font-medium"
            >
        <div className="lg:col-span-7 flex flex-col h-180 bg-slate-950/20 rounded-2xl border border-slate-800 overflow-hidden">
            </button>
            <button 
              onClick={() => handleBypassLogin(4)} 
              className="text-[10px] bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 px-2.5 py-1 rounded border border-amber-500/30 transition-all font-medium"
            <div className="flex space-x-1">
            >
                id="workspace-btn-docs"
            </button>
            <button 
              onClick={() => handleBypassLogin(5)} 
              className="text-[10px] bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2.5 py-1 rounded border border-red-500/30 transition-all font-medium"
            >
                }`}
            </button>
          </div>
            </>
          )}
        </div>
      </header>

      {/* Main Multi-Column Split Portal Layout */}
      {adminUser ? (
      <main className="grow grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto w-full items-start">
        <aside className="lg:col-span-3 bg-slate-950 text-white rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800">
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-black">Admin Control</p>
            <h2 className="mt-2 text-xl font-black">ÐÐ´Ð¼Ð¸Ð½Ð¸ÑÑ‚Ñ€Ð°Ñ‚Ð¸Ð²Ð½Ð°Ñ Ñ€Ð°Ð±Ð¾Ñ‚Ð°</h2>
            <p className="mt-2 text-xs text-slate-400">ÐŸÑ€Ð¾Ð²ÐµÑ€ÐºÐ° Ð´Ð°Ð½Ð½Ñ‹Ñ…, Ð¼Ð¾Ð´ÐµÑ€Ð°Ñ†Ð¸Ñ, Ð¶Ð°Ð»Ð¾Ð±Ñ‹, Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»Ð¸ Ð¸ Ð±ÐµÐ·Ð¾Ð¿Ð°ÑÐ½Ð¾ÑÑ‚ÑŒ Ð¿Ð»Ð°Ñ‚Ñ„Ð¾Ñ€Ð¼Ñ‹.</p>
          </div>

          <div className="p-4 space-y-2">
            {[
              ['ÐÐ½Ð°Ð»Ð¸Ñ‚Ð¸ÐºÐ°', `${trips.length} Ð¿Ð¾ÐµÐ·Ð´Ð¾Ðº`],
              ['ÐŸÑ€Ð¾Ð²ÐµÑ€ÐºÐ° Ð²Ð¾Ð´Ð¸Ñ‚ÐµÐ»ÐµÐ¹', `${driverProfiles.filter(profile => profile.verificationStatus === VerificationStatus.PendingVerification).length} Ð¾Ð¶Ð¸Ð´Ð°ÑŽÑ‚`],
              ['Ð–Ð°Ð»Ð¾Ð±Ñ‹ Ð¸ ÑÐ¿Ð¾Ñ€Ñ‹', `${complaints.filter(complaint => complaint.status === ComplaintStatus.Open).length} Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾`],
              ['ÐŸÐ¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»Ð¸', `${users.length} Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚Ð¾Ð²`],
              ['ÐœÐ°Ñ€ÑˆÑ€ÑƒÑ‚Ñ‹ Ð¸ Ð³Ð¾Ñ€Ð¾Ð´Ð°', `${suggestedDirections.filter(item => item.status === 'pending').length} Ð·Ð°ÑÐ²Ð¾Ðº`]
            ].map(([label, meta]) => (
              <button key={label} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 text-left transition-colors">
                <span className="block text-xs font-black text-white">{label}</span>
                <span className="block text-[10px] text-slate-400">{meta}</span>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800 space-y-3">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
              <p className="text-[10px] uppercase text-slate-500 font-black">Ð¢ÐµÐºÑƒÑ‰Ð¸Ð¹ Ð°Ð´Ð¼Ð¸Ð½</p>
              <p className="text-sm font-bold">{adminUser.fullName}</p>
              <p className="text-xs text-slate-400">{adminUser.phone}</p>
            </div>
            <button onClick={handleAdminLogout} className="w-full h-11 rounded-xl bg-white text-slate-950 text-xs font-black">
              Ð’Ñ‹Ð¹Ñ‚Ð¸ Ð¸Ð· Ð°Ð´Ð¼Ð¸Ð½-Ð¿Ð°Ð½ÐµÐ»Ð¸
            </button>
          </div>
        </aside>

        <section className="lg:col-span-9 h-180 bg-slate-950/20 rounded-2xl border border-slate-800 overflow-hidden">
          <AdminDashboard
            users={users}
            trips={trips}
            complaints={complaints}
            driverProfiles={driverProfiles}
            vehicles={vehicles}
            suggestedDirections={suggestedDirections}
            adminNote={adminNote}
            setAdminNote={setAdminNote}
            onApproveDriver={handleAdminApproveDriver}
            onRejectDriver={handleAdminRejectDriver}
            onToggleUserActive={handleAdminToggleUserActive}
            onResolveComplaint={handleAdminResolveComplaint}
            onApproveDirection={handleAdminApproveDirection}
            onRejectDirection={handleAdminRejectDirection}
          />
        </section>
      </main>
      ) : (
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
            currentUser={currentUser} setCurrentUser={handleMobileUserChange}
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
              <AdminDashboard
                users={users}
                trips={trips}
                complaints={complaints}
                driverProfiles={driverProfiles}
                vehicles={vehicles}
                suggestedDirections={suggestedDirections}
                adminNote={adminNote}
                setAdminNote={setAdminNote}
                onApproveDriver={handleAdminApproveDriver}
                onRejectDriver={handleAdminRejectDriver}
                onToggleUserActive={handleAdminToggleUserActive}
                onResolveComplaint={handleAdminResolveComplaint}
                onApproveDirection={handleAdminApproveDirection}
                onRejectDirection={handleAdminRejectDirection}
              />
            )}
          </div>
        </div>
      </main>
      )}

      {/* Footer system branding */}
      <footer className="bg-white border-t border-[#E2E8F0] px-6 py-4 text-center text-xs text-[#64748B] shrink-0 mt-auto">
        <p className="flex items-center justify-center space-x-1.5">
          <span>ï¿½ 2026 Hamroh.tj. ??????????? ?? ?????????? BlaBlaCar ??? ?????????? ???????????.</span>
        </p>
      </footer>
    </div>
  );
}
