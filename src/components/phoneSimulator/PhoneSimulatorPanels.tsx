import type React from 'react';
import { LogOut, Send } from 'lucide-react';
import {
  Booking,
  BookingStatus,
  DriverProfile,
  Notification,
  Trip,
  TripStatus,
  User,
  UserRole,
  Vehicle,
  VerificationStatus
} from '../../types';
import type { Screen } from './phoneSimulatorCopy';
import { money } from './phoneSimulatorUtils';

type Copy = Record<string, string>;

export function MessagesPanel({
  bookings,
  trips,
  users,
  currentUser,
  hiddenChatUserIds,
  setHiddenChatUserIds,
  chatUserId,
  setChatUserId,
  chats,
  chatInput,
  setChatInput,
  chatInputRef,
  sendChat,
  t
}: {
  bookings: Booking[];
  trips: Trip[];
  users: User[];
  currentUser: User | null;
  hiddenChatUserIds: string[];
  setHiddenChatUserIds: React.Dispatch<React.SetStateAction<string[]>>;
  chatUserId: string;
  setChatUserId: (id: string) => void;
  chats: Record<string, string[]>;
  chatInput: string;
  setChatInput: (value: string) => void;
  chatInputRef: React.RefObject<HTMLInputElement | null>;
  sendChat: (recipientId?: string) => void;
  t: Copy;
}) {
  const userFor = (id?: string) => users.find(user => user.id === id);
  const acceptedBookings = bookings.filter(booking => {
    const trip = trips.find(item => item.id === booking.tripId);
    if (booking.status !== BookingStatus.Accepted || trip?.status === TripStatus.Completed) return false;
    return booking.passengerId === currentUser?.id || trip?.driverId === currentUser?.id;
  });
  const peers = acceptedBookings
    .map(booking => {
      const trip = trips.find(item => item.id === booking.tripId);
      return currentUser?.role === UserRole.Driver ? userFor(booking.passengerId) : userFor(trip?.driverId);
    })
    .filter(Boolean)
    .filter(peer => !hiddenChatUserIds.includes((peer as User).id)) as User[];
  const activePeer = userFor(chatUserId) || peers[0];

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">{t.messages}</h2>
        {activePeer && <button onClick={() => setHiddenChatUserIds(prev => [...prev, activePeer.id])} className="text-xs font-black text-rose-600">Удалить чат</button>}
      </div>
      {peers.length === 0 ? (
        <p className="bg-white rounded-3xl p-6 text-sm text-[#64748B]">Чат доступен только после подтверждения и до завершения поездки.</p>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {peers.map(peer => (
              <button key={peer.id} onClick={() => setChatUserId(peer.id)} className={`px-3 h-10 rounded-full text-sm font-bold whitespace-nowrap ${activePeer?.id === peer.id ? 'bg-[#10B981] text-white' : 'bg-white border border-[#E2E8F0]'}`}>
                {peer.fullName.split(' ')[0]}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-4 h-80 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-2">
              {(chats[activePeer?.id || ''] || ['Здравствуйте! Бронь подтверждена.']).map((message, index) => (
                <div key={`${message}_${index}`} className="max-w-[80%] rounded-2xl bg-[#D1FAE5] p-3 text-sm font-medium ml-auto">{message}</div>
              ))}
            </div>
            <div className="flex gap-2 pt-3">
              <input
                ref={chatInputRef}
                value={chatInput}
                onChange={event => setChatInput(event.target.value)}
                onBlur={() => {
                  if (chatInput) requestAnimationFrame(() => chatInputRef.current?.focus());
                }}
                className="flex-1 h-11 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] px-3 text-sm outline-none"
                placeholder="Сообщение"
              />
              <button onClick={() => sendChat(activePeer?.id)} className="w-11 h-11 rounded-2xl bg-[#10B981] text-white flex items-center justify-center"><Send className="w-5 h-5" /></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function NotificationsPanel({
  myNotifications,
  bookings,
  currentUser,
  unreadNotificationsCount,
  t,
  openNotification,
  rejectBooking,
  acceptBooking,
  setNotifications,
  setDriverTab,
  setHiddenNotificationIds
}: {
  myNotifications: Notification[];
  bookings: Booking[];
  currentUser: User | null;
  unreadNotificationsCount: number;
  t: Copy;
  openNotification: (notification: Notification) => void;
  rejectBooking: (booking: Booking) => void;
  acceptBooking: (booking: Booking) => void;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setDriverTab: (tab: string) => void;
  setHiddenNotificationIds: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">{t.notifications}</h2>
        {myNotifications.length > 0 && <span className="text-xs font-black text-[#047857]">{unreadNotificationsCount} {t.newCount}</span>}
      </div>
      {myNotifications.length === 0 && <p className="bg-white rounded-3xl p-6 text-sm text-[#64748B]">{t.noNotifications}</p>}
      {myNotifications.map(item => {
        const relatedBooking = bookings.find(booking => booking.id === item.bookingId);
        const canReplyToBooking = currentUser?.role === UserRole.Driver && item.type === 'booking_request' && relatedBooking?.status === BookingStatus.Pending;
        return (
          <div key={item.id} className={`w-full bg-white rounded-3xl border p-4 text-left shadow-sm ${item.isRead ? 'border-[#E2E8F0]' : 'border-[#10B981]'}`}>
            <button onClick={() => openNotification(item)} className="w-full text-left">
              <p className="font-black">{item.title}</p>
              <p className="text-sm text-[#64748B] mt-1">{item.message}</p>
              <p className="text-[11px] font-bold text-[#94A3B8] mt-2">{t.tapToOpen}</p>
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
                  {t.reject}
                </button>
                <button
                  onClick={() => {
                    acceptBooking(relatedBooking);
                    setNotifications(prev => prev.map(notification => notification.id === item.id ? { ...notification, isRead: true } : notification));
                    setDriverTab('messages');
                  }}
                  className="h-11 rounded-2xl bg-[#10B981] text-white font-black"
                >
                  {t.accept}
                </button>
              </div>
            )}
            <button onClick={() => setHiddenNotificationIds(prev => [...prev, item.id])} className="mt-3 text-xs font-black text-rose-600">{t.deleteNotification}</button>
          </div>
        );
      })}
    </div>
  );
}

export function ProfilePanel({
  role,
  currentUser,
  driverProfiles,
  vehicles,
  trips,
  bookings,
  unreadNotificationsCount,
  setPassengerTab,
  setCurrentUser,
  setScreen
}: {
  role: 'passenger' | 'driver';
  currentUser: User | null;
  driverProfiles: DriverProfile[];
  vehicles: Vehicle[];
  trips: Trip[];
  bookings: Booking[];
  unreadNotificationsCount: number;
  setPassengerTab: (tab: string) => void;
  setCurrentUser: (user: User | null) => void;
  setScreen: (screen: Screen) => void;
}) {
  const profile = driverProfiles.find(item => item.userId === currentUser?.id);
  const vehicle = vehicles.find(item => item.driverId === currentUser?.id);
  const driverTripIds = trips.filter(trip => trip.driverId === currentUser?.id).map(trip => trip.id);
  const driverBookings = bookings.filter(booking => driverTripIds.includes(booking.tripId));
  const completedEarnings = driverBookings
    .filter(booking => booking.status === BookingStatus.Completed)
    .reduce((sum, booking) => sum + booking.totalPrice, 0);
  const activeEarnings = driverBookings
    .filter(booking => booking.status === BookingStatus.Accepted)
    .reduce((sum, booking) => sum + booking.totalPrice, 0);
  const passengerBookings = bookings.filter(booking => booking.passengerId === currentUser?.id);
  const passengerCompleted = passengerBookings.filter(booking => booking.status === BookingStatus.Completed).length;
  const passengerActive = passengerBookings.filter(booking => [BookingStatus.Pending, BookingStatus.Accepted].includes(booking.status)).length;

  return (
    <div className="p-5 space-y-4">
      <div className="bg-linear-to-br from-[#047857] to-[#10B981] rounded-[28px] p-5 text-white shadow-lg shadow-emerald-900/20">
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
                <p className="text-2xl font-black text-[#047857]">{money(completedEarnings)}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Ожидается</p>
                <p className="text-2xl font-black text-[#0F172A]">{money(activeEarnings)}</p>
              </div>
            </div>
            <p className="text-xs text-[#64748B]">Завершено: {money(completedEarnings)}</p>
            <p className="text-xs text-[#64748B]">Активные брони попадут в заработок только после завершения поездки.</p>
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
}
