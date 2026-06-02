import { PlusCircle } from 'lucide-react';
import { VerificationStatus, type PassengerRequest, type Trip } from '../../../types';

export interface DriverScreensProps {
  [key: string]: any;
}

export function DriverApp(props: DriverScreensProps) {
  const {
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
    cityDisplayName,
    userFor,
    driverProfileFor,
    vehicleFor,
    rejectBooking,
    acceptBooking,
    driverTripsList,
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
  } = props;

  const profile = driverProfileFor(currentUser?.id);
  const vehicle = vehicleFor(currentUser?.id);
  const isVerified = profile?.verificationStatus === VerificationStatus.Verified && vehicle?.verificationStatus === VerificationStatus.Verified;
  const activeTrip = trips.find((trip: Trip) => trip.driverId === currentUser?.id && ![TripStatus.Completed, TripStatus.Cancelled, TripStatus.BlockedByAdmin].includes(trip.status));
  const pendingBookings = bookings.filter((booking: any) => {
    const trip = trips.find((item: Trip) => item.id === booking.tripId);
    return trip?.driverId === currentUser?.id && booking.status === BookingStatus.Pending;
  });

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

  return (
    <Shell>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {driverTab === 'home' && (
          <div className="p-5 space-y-4">
            <h2 className="text-2xl font-black">{t.driverHome}</h2>
            {!isVerified && (
              <div className="bg-amber-50 border border-amber-100 rounded-3xl p-4 text-sm text-amber-800 font-semibold">
                Ваш профиль водителя отправлен на проверку. Создание поездок и принятие пассажиров недоступны до одобрения.
              </div>
            )}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F8FAFC] p-1">
                <button onClick={() => setDriverHomeMode('city')} className={`h-11 rounded-xl text-xs font-black ${driverHomeMode === 'city' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>Город</button>
                <button onClick={() => setDriverHomeMode('route')} className={`h-11 rounded-xl text-xs font-black ${driverHomeMode === 'route' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>Маршрут</button>
              </div>
              <CitySelect value={driverCity} onChange={setDriverCity} cities={cities} language={language} className={selectClass} />
              {driverHomeMode === 'route' && <CitySelect value={driverRouteTo} onChange={setDriverRouteTo} cities={cities} language={language} className={selectClass} />}
              {driverHomeMode === 'city' && (
                <select value={driverFilterTo} onChange={event => setDriverFilterTo(event.target.value)} className={selectClass}>
                  <option value="">Все направления</option>
                  {cities.filter((city: any) => city.nameRu !== driverCity).map((city: any) => <option key={city.id} value={city.nameRu}>{cityDisplayName(city.nameRu)}</option>)}
                </select>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white border border-[#E2E8F0] p-1">
              <button onClick={() => setDriverHomeView('trips')} className={`h-11 rounded-xl text-xs font-black ${driverHomeView === 'trips' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>Актуальные поездки</button>
              <button onClick={() => setDriverHomeView('requests')} className={`h-11 rounded-xl text-xs font-black ${driverHomeView === 'requests' ? 'bg-[#10B981] text-white' : 'text-[#64748B]'}`}>Заявки пассажиров</button>
            </div>
            {driverHomeView === 'trips' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black">Подходящие поездки</h3>
                  <span className="text-xs font-black text-[#047857]">{marketTrips.length}</span>
                </div>
                {marketTrips.length === 0 && <p className="text-sm text-[#64748B] bg-white rounded-3xl p-5 text-center">{t.noTripsFromCity}</p>}
                {marketTrips.slice(0, 4).map(renderTripCard)}
              </div>
            )}
            {driverHomeView === 'requests' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black">Заявки пассажиров</h3>
                  <span className="text-xs font-black text-[#047857]">{homeRequests.length}</span>
                </div>
                {homeRequests.length === 0 && <p className="text-sm text-[#64748B] bg-white rounded-3xl p-5 text-center">Пока нет заявок пассажиров</p>}
                {homeRequests.slice(0, 3).map(renderRequestCard)}
              </div>
            )}
          </div>
        )}

        {driverTab === 'create' && (
          <div className="p-5 space-y-4">
            <h2 className="text-xl font-black">{editingTripId ? 'Редактировать поездку' : t.create}</h2>
            {activeTrip && !editingTripId ? (
              <div className="bg-rose-50 border border-rose-100 rounded-3xl p-4 space-y-3">
                <p className="font-black text-rose-700">Завершите текущую поездку, чтобы создать новую</p>
                <p className="text-sm text-rose-800">{cityDisplayName(activeTrip.fromCity)} {'->'} {cityDisplayName(activeTrip.toCity)}</p>
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
                  {createPricingMode === 'row' && seatRowsForSeats(createSeats).map((row: any) => (
                    <label key={row.key} className="block space-y-1">
                      <span className="text-xs font-bold text-[#64748B]">{row.label}</span>
                      <input
                        type="number"
                        value={row.key === 'front' ? frontSeatPrice : row.key === 'second' ? secondRowPrice : thirdRowPrice}
                        onChange={event => {
                          const value = Number(event.target.value);
                          if (row.key === 'front') setFrontSeatPrice(value);
                          else if (row.key === 'second') setSecondRowPrice(value);
                          else setThirdRowPrice(value);
                        }}
                        className={inputClass}
                      />
                    </label>
                  ))}
                </div>
                <input value={createPickup} onChange={event => setCreatePickup(event.target.value)} className={inputClass} placeholder="Точка посадки" />
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setPointFromLocation('createPickup')} className="h-11 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-black text-[#047857]">Моя локация</button>
                  <button type="button" onClick={() => setPointFromMap('createPickup')} className="h-11 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-black text-[#047857]">Выбрать на карте</button>
                </div>
                <input value={createDropoff} onChange={event => setCreateDropoff(event.target.value)} className={inputClass} placeholder="Точка высадки" />
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setPointFromLocation('createDropoff')} className="h-11 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-black text-[#047857]">Моя локация</button>
                  <button type="button" onClick={() => setPointFromMap('createDropoff')} className="h-11 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-black text-[#047857]">Выбрать на карте</button>
                </div>
                <textarea value={createComment} onChange={event => setCreateComment(event.target.value)} className="w-full min-h-24 rounded-2xl bg-white border border-[#E2E8F0] p-3 text-sm outline-none" placeholder="Комментарий" />
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setCreateBaggage(!createBaggage)} className={`h-11 rounded-2xl border text-sm font-black ${createBaggage ? 'bg-[#D1FAE5] border-[#10B981]' : 'bg-white border-[#E2E8F0]'}`}>{t.baggage}</button>
                  <button onClick={() => setCreateWomen(!createWomen)} className={`h-11 rounded-2xl border text-sm font-black ${createWomen ? 'bg-[#D1FAE5] border-[#10B981]' : 'bg-white border-[#E2E8F0]'}`}>{t.woman}</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={resetTripForm} className="h-12 rounded-2xl border border-[#E2E8F0] bg-white font-black">Сброс</button>
                  <button onClick={publishTrip} disabled={!isVerified} className={primaryClass}><PlusCircle className="w-4 h-4 inline mr-1" /> {editingTripId ? 'Сохранить' : t.publish}</button>
                </div>
              </>
            )}
          </div>
        )}

        {driverTab === 'requests' && (
          <div className="p-5 space-y-3">
            <h2 className="text-xl font-black">{t.requests}</h2>
            {pendingBookings.length === 0 && <p className="text-sm text-[#64748B] bg-white rounded-3xl p-6 text-center">Пока нет новых заявок</p>}
            {pendingBookings.map((booking: any) => {
              const trip = trips.find((item: Trip) => item.id === booking.tripId);
              const passenger = userFor(booking.passengerId);
              return (
                <div key={booking.id} className="bg-white rounded-3xl border border-[#E2E8F0] p-4 space-y-3">
                  <p className="font-black">{cityDisplayName(trip?.fromCity)} {'->'} {cityDisplayName(trip?.toCity)}</p>
                  <p className="text-sm text-[#64748B]">{passenger?.fullName} просит {booking.seatsCount} мест(а)</p>
                  <p className="text-sm font-black text-[#047857]">{money(booking.totalPrice)}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => rejectBooking(booking)} className="h-11 rounded-2xl bg-rose-50 text-rose-700 font-black">Отклонить</button>
                    <button onClick={() => acceptBooking(booking)} className="h-11 rounded-2xl bg-[#10B981] text-white font-black">Принять</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {driverTab === 'trips' && driverTripsList}
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
}
