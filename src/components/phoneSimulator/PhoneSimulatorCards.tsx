import { ShieldCheck } from 'lucide-react';
import type { DriverProfile, PassengerRequest, Trip, User, Vehicle } from '../../types';

interface TripCardLabels {
  fastest: string;
  seatsShort: string;
  driver: string;
  somoni?: string;
  fromPrice?: string;
}

interface RequestCardLabels {
  pickup?: string;
  dropoff?: string;
  coordinates?: string;
  seatsShort?: string;
  baggage?: string;
  yes?: string;
  no?: string;
  offerRide?: string;
}

export function TripCard({
  trip,
  driver,
  profile,
  vehicle,
  shownPrice,
  duration,
  isVerified,
  isFastest,
  onOpen,
  labels,
  cityName
}: {
  trip: Trip;
  driver?: User;
  profile?: DriverProfile;
  vehicle?: Vehicle;
  shownPrice: number;
  duration: string;
  isVerified: boolean;
  isFastest: boolean;
  onOpen: () => void;
  labels: TripCardLabels;
  cityName?: (value: string) => string;
}) {
  const fromCity = cityName ? cityName(trip.fromCity) : trip.fromCity;
  const toCity = cityName ? cityName(trip.toCity) : trip.toCity;

  return (
    <button onClick={onOpen} className={`relative w-full text-left bg-white rounded-[22px] border p-4 space-y-4 shadow-sm active:scale-[0.99] transition-all overflow-hidden ${isFastest ? 'border-[#047857]' : 'border-[#E2E8F0]'}`}>
      {isFastest && <span className="absolute right-0 top-0 rounded-bl-2xl bg-[#047857] px-4 py-2 text-xs font-black text-white">{labels.fastest}</span>}
      <div className="grid grid-cols-[92px_1fr_auto] gap-3 items-start pt-3">
        <div className="space-y-8">
          <p className="text-2xl font-black leading-none">{trip.departureTime}</p>
          <p className="text-sm font-black leading-none text-slate-400">{duration}</p>
        </div>
        <div className="relative space-y-5">
          <div className="absolute -left-4.5 top-2 h-18 border-l-2 border-dashed border-[#94A3B8]" />
          <span className="absolute -left-5.75 top-1 w-3 h-3 rounded-full bg-[#047857]" />
          <span className="absolute -left-5.75 top-18 w-3 h-3 rounded-full bg-[#94A3B8]" />
          <div>
            <p className="text-base font-bold text-[#0F172A]">{fromCity}, {trip.pickupPoint}</p>
            <p className="mt-2 text-sm font-black text-[#047857]">{duration}</p>
          </div>
          <p className="text-base font-bold text-[#0F172A]">{toCity}, {trip.dropoffPoint}</p>
        </div>
        <div className="text-right pr-1">
          <p className="text-2xl font-black text-[#047857]">{shownPrice}</p>
          <p className="text-sm font-black text-[#047857]">{labels.somoni || 'сомони'}</p>
          {trip.pricingMode === 'row' && <p className="text-[10px] font-bold text-[#64748B]">{labels.fromPrice || 'от'}</p>}
          <p className={`mt-3 text-sm font-black ${trip.availableSeats <= 1 ? 'text-red-600' : 'text-[#047857]'}`}>{trip.availableSeats} {labels.seatsShort}</p>
        </div>
      </div>
      <div className="h-px bg-[#E2E8F0]" />
      <div className="flex items-center gap-3">
        <img src={driver?.avatarUrl} className="w-14 h-14 rounded-2xl object-cover" alt="" />
        <div className="flex-1 min-w-0">
          <p className="text-xl font-black truncate">{driver?.fullName?.split(' ')[0] || labels.driver} <span className="text-base font-bold">{profile?.rating || '4.8'}</span></p>
          <p className="text-sm text-[#334155] truncate">{vehicle?.brand} {vehicle?.model} - {vehicle?.color}</p>
        </div>
        {isVerified && <ShieldCheck className="w-7 h-7 text-[#10B981]" />}
      </div>
    </button>
  );
}

export function RequestCard({
  request,
  passenger,
  primaryClass,
  money,
  onOffer,
  labels,
  cityName
}: {
  request: PassengerRequest;
  passenger?: User;
  primaryClass: string;
  money: (value: number) => string;
  onOffer: () => void;
  labels: RequestCardLabels;
  cityName?: (value: string) => string;
}) {
  const fromCity = cityName ? cityName(request.fromCity) : request.fromCity;
  const toCity = cityName ? cityName(request.toCity) : request.toCity;

  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] p-4 space-y-3 shadow-sm">
      <div className="flex justify-between gap-3">
        <div>
          <p className="font-black">{fromCity} {'->'} {toCity}</p>
          <p className="text-xs text-[#64748B]">{request.departureDate} - {request.departureTime}</p>
        </div>
        <p className="font-black text-[#047857]">{money(request.desiredPrice || 0)}</p>
      </div>
      <p className="text-sm text-[#64748B]"><b>{labels.pickup || 'Посадка'}:</b> {request.pickupAddress}</p>
      <p className="text-sm text-[#64748B]"><b>{labels.dropoff || 'Высадка'}:</b> {request.dropoffAddress}</p>
      {request.pickupLatitude && request.pickupLongitude && (
        <p className="text-xs text-[#047857] font-bold">{labels.coordinates || 'Координаты'}: {request.pickupLatitude.toFixed(4)}, {request.pickupLongitude.toFixed(4)}</p>
      )}
      <p className="text-sm text-[#64748B]">{request.seatsCount} {labels.seatsShort || 'мест'}, {labels.baggage || 'Багаж'}: {request.baggageAllowed ? labels.yes || 'да' : labels.no || 'нет'}</p>
      <div className="flex items-center gap-3">
        <img src={passenger?.avatarUrl} className="w-9 h-9 rounded-full object-cover" alt="" />
        <p className="font-bold text-sm">{passenger?.fullName}</p>
      </div>
      <button onClick={onOffer} className={primaryClass}>{labels.offerRide || 'Предложить поездку'}</button>
    </div>
  );
}
