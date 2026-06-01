import type React from 'react';
import { PlusCircle } from 'lucide-react';
import { VerificationStatus, type PassengerRequest, type Trip } from '../../../types';

export interface DriverScreensProps {
  [key: string]: any;
}

export function DriverApp(props: DriverScreensProps) {
  const {
    Shell, CitySelect, BottomNav, MessagesPanel, NotificationsPanel, ProfilePanel, UserRole, BookingStatus, TripStatus, currentUser, users, driverProfiles, vehicles, trips, bookings, passengerRequests, t, driverTab, setDriverTab, passengerTab, driverHomeMode, setDriverHomeMode, driverRouteTo, setDriverRouteTo, driverCity, setDriverCity, driverFilterTo, setDriverFilterTo, driverHomeView, setDriverHomeView, renderTripCard, renderRequestCard, selectClass, inputClass, primaryClass, cities, language, createFrom, setCreateFrom, createTo, setCreateTo, createDate, setCreateDate, createTime, setCreateTime, createTimeMode, setCreateTimeMode, createPrice, setCreatePrice, createSeats, setCreateSeats, createPricingMode, setCreatePricingMode, frontSeatPrice, setFrontSeatPrice, secondRowPrice, setSecondRowPrice, thirdRowPrice, setThirdRowPrice, createPickup, setCreatePickup, createDropoff, setCreateDropoff, createComment, setCreateComment, createBaggage, setCreateBaggage, createWomen, setCreateWomen, editingTripId, resetTripForm, completeTrip, publishTrip, setPointFromLocation, setPointFromMap, seatRowsForSeats, money, userFor, driverProfileFor, vehicleFor, rejectBooking, acceptBooking, driverTripsList, setChatUserId, setHiddenChatUserIds, hiddenChatUserIds, chatUserId, chats, chatInput, setChatInput, chatInputRef, sendChat, myNotifications, unreadNotificationsCount, openNotification, setNotifications, setHiddenNotificationIds, setPassengerTab, setCurrentUser, setScreen, cancelBookingByDriver, confirmDriverRide, cancelTrip
  } = props;
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
              {driverTripsList}
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
}
