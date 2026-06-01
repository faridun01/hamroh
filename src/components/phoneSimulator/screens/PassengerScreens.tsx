import type React from 'react';
import { ArrowLeft, Car, CheckCircle, Clock, CreditCard, Home, Lock, MessageSquare, Share2, ShieldCheck, Star } from 'lucide-react';
import { BookingStatus, UserRole } from '../../../types';
import { formatDuration, money, rowPriceForTrip, seatRowsForSeats } from '../phoneSimulatorUtils';

export interface PassengerScreensProps {
  [key: string]: any;
}

export function PassengerApp(props: PassengerScreensProps) {
  const {
    Shell, Header, CitySelect, BottomNav, MessagesPanel, NotificationsPanel, ProfilePanel, currentUser, t, penaltyAmount, setPenaltyAmount, fromCity, setFromCity, cities, language, selectClass, toCity, setToCity, date, setDate, inputClass, searchSeats, setSearchSeats, filterVerified, setFilterVerified, filterBaggage, setFilterBaggage, filterWomen, setFilterWomen, setScreen, primaryClass, tripsList, passengerTab, bookings, trips, users, hiddenChatUserIds, setHiddenChatUserIds, chatUserId, setChatUserId, chats, chatInput, setChatInput, chatInputRef, sendChat, myNotifications, unreadNotificationsCount, openNotification, rejectBooking, acceptBooking, setNotifications, setDriverTab, setHiddenNotificationIds, driverProfiles, vehicles, setPassengerTab, setCurrentUser, driverTab, UserRole
  } = props;
  return (
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
        {passengerTab === 'trips' && tripsList}
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
}

export function ResultsScreen(props: PassengerScreensProps) {
  const {
    Shell, Header, CitySelect, setScreen, t, tripSort, setTripSort, filteredTrips, renderTripCard, selectedTrip, userFor, driverProfileFor, vehicleFor, rowPriceForTrip, selectedSeatRow, selectedSeats, setSelectedSeats, setSelectedSeatRow, bookings, tripBackTarget, show, openBooking, bookingMessage, setBookingMessage, confirmBooking, fromCity, setFromCity, toCity, setToCity, cities, language, selectClass, inputClass, date, setDate, requestPickup, setRequestPickup, setPointFromLocation, setPointFromMap, requestDropoff, setRequestDropoff, requestTime, setRequestTime, requestTimeMode, setRequestTimeMode, searchSeats, setSearchSeats, requestPrice, setRequestPrice, requestComment, setRequestComment, createPassengerRequest, reviewText, setReviewText, currentUser, reviewRating, setReviewRating, primaryClass
  } = props;
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
}

export function TripDetailsScreen(props: PassengerScreensProps) {
  const {
    Shell, Header, CitySelect, setScreen, t, tripSort, setTripSort, filteredTrips, renderTripCard, selectedTrip, userFor, driverProfileFor, vehicleFor, rowPriceForTrip, selectedSeatRow, selectedSeats, setSelectedSeats, setSelectedSeatRow, bookings, tripBackTarget, show, openBooking, bookingMessage, setBookingMessage, confirmBooking, fromCity, setFromCity, toCity, setToCity, cities, language, selectClass, inputClass, date, setDate, requestPickup, setRequestPickup, setPointFromLocation, setPointFromMap, requestDropoff, setRequestDropoff, requestTime, setRequestTime, requestTimeMode, setRequestTimeMode, searchSeats, setSearchSeats, requestPrice, setRequestPrice, requestComment, setRequestComment, createPassengerRequest, reviewText, setReviewText, currentUser, reviewRating, setReviewRating, primaryClass
  } = props;
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
}

export function BookingScreen(props: PassengerScreensProps) {
  const {
    Shell, Header, CitySelect, setScreen, t, tripSort, setTripSort, filteredTrips, renderTripCard, selectedTrip, userFor, driverProfileFor, vehicleFor, rowPriceForTrip, selectedSeatRow, selectedSeats, setSelectedSeats, setSelectedSeatRow, bookings, tripBackTarget, show, openBooking, bookingMessage, setBookingMessage, confirmBooking, fromCity, setFromCity, toCity, setToCity, cities, language, selectClass, inputClass, date, setDate, requestPickup, setRequestPickup, setPointFromLocation, setPointFromMap, requestDropoff, setRequestDropoff, requestTime, setRequestTime, requestTimeMode, setRequestTimeMode, searchSeats, setSearchSeats, requestPrice, setRequestPrice, requestComment, setRequestComment, createPassengerRequest, reviewText, setReviewText, currentUser, reviewRating, setReviewRating, primaryClass
  } = props;
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
}

export function PassengerRequestScreen(props: PassengerScreensProps) {
  const {
    Shell, Header, CitySelect, setScreen, t, tripSort, setTripSort, filteredTrips, renderTripCard, selectedTrip, userFor, driverProfileFor, vehicleFor, rowPriceForTrip, selectedSeatRow, selectedSeats, setSelectedSeats, setSelectedSeatRow, bookings, tripBackTarget, show, openBooking, bookingMessage, setBookingMessage, confirmBooking, fromCity, setFromCity, toCity, setToCity, cities, language, selectClass, inputClass, date, setDate, requestPickup, setRequestPickup, setPointFromLocation, setPointFromMap, requestDropoff, setRequestDropoff, requestTime, setRequestTime, requestTimeMode, setRequestTimeMode, searchSeats, setSearchSeats, requestPrice, setRequestPrice, requestComment, setRequestComment, createPassengerRequest, reviewText, setReviewText, currentUser, reviewRating, setReviewRating, primaryClass
  } = props;
  return (
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
}

export function ReviewScreen(props: PassengerScreensProps) {
  const {
    Shell, Header, CitySelect, setScreen, t, tripSort, setTripSort, filteredTrips, renderTripCard, selectedTrip, userFor, driverProfileFor, vehicleFor, rowPriceForTrip, selectedSeatRow, selectedSeats, setSelectedSeats, setSelectedSeatRow, bookings, tripBackTarget, show, openBooking, bookingMessage, setBookingMessage, confirmBooking, fromCity, setFromCity, toCity, setToCity, cities, language, selectClass, inputClass, date, setDate, requestPickup, setRequestPickup, setPointFromLocation, setPointFromMap, requestDropoff, setRequestDropoff, requestTime, setRequestTime, requestTimeMode, setRequestTimeMode, searchSeats, setSearchSeats, requestPrice, setRequestPrice, requestComment, setRequestComment, createPassengerRequest, reviewText, setReviewText, currentUser, reviewRating, setReviewRating, primaryClass
  } = props;
  return (
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
}

