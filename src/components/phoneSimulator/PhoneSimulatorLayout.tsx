import type { ReactNode } from 'react';
import {
  ArrowLeft,
  Calendar,
  Compass,
  MessageSquare,
  Search,
  User as UserIcon,
  Users,
  type LucideIcon
} from 'lucide-react';
import { Language, UserRole } from '../../types';
import type { City } from '../../types';

type BottomNavKey = string;

interface BottomNavItem {
  key: BottomNavKey;
  icon: LucideIcon;
  label: string;
}

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] text-[#0F172A]">
      {children}
    </div>
  );
}

export function PhoneHeader({ title, back }: { title: string; back?: () => void }) {
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
}

export function HamrohLogo({ compact = false }: { compact?: boolean }) {
  const width = compact ? 'w-[86px]' : 'w-[108px]';
  const height = compact ? 'h-[76px]' : 'h-[96px]';

  return (
    <div className={`relative ${width} ${height}`}>
      <div className="absolute left-2.5 top-2 h-18 w-6.25 rounded-full bg-[#059669]" />
      <div className="absolute right-2.5 top-2 h-18 w-6.25 rounded-full bg-[#059669]" />
      <div className="absolute left-8.75 top-11.75 h-4.75 w-10 rounded-t-full bg-[#34D399]" />
      <div className="absolute left-9.75 top-13.25 h-4.5 w-8 rounded-t-full bg-[#047857]" />
      <div className="absolute left-1/2 top-5.5 h-4.25 w-4.25 -translate-x-1/2 rounded-full bg-[#3B82F6]" />
      <div className="absolute left-10.75 top-13 h-8.5 w-10.75 rotate-45 rounded-[7px] bg-white shadow-[0_10px_18px_rgba(15,23,42,0.04)]" />
    </div>
  );
}

export function CitySelect({
  value,
  onChange,
  cities,
  language,
  className
}: {
  value: string;
  onChange: (value: string) => void;
  cities: City[];
  language: Language;
  className: string;
}) {
  return (
    <select value={value} onChange={event => onChange(event.target.value)} className={className}>
      {cities.map(city => (
        <option key={city.id} value={city.nameRu}>
          {cityLabel(city, language)}
        </option>
      ))}
    </select>
  );
}

export function BottomNav({
  role,
  passengerTab,
  driverTab,
  setPassengerTab,
  setDriverTab,
  labels
}: {
  role: UserRole.Passenger | UserRole.Driver;
  passengerTab: string;
  driverTab: string;
  setPassengerTab: (value: string) => void;
  setDriverTab: (value: string) => void;
  labels: {
    search: string;
    trips: string;
    messages: string;
    notifications: string;
    profile: string;
    driverHome: string;
    requests: string;
  };
}) {
  const passengerItems: BottomNavItem[] = [
    { key: 'search', icon: Search, label: labels.search },
    { key: 'trips', icon: Calendar, label: labels.trips },
    { key: 'messages', icon: MessageSquare, label: labels.messages },
    { key: 'profile', icon: UserIcon, label: labels.profile }
  ];
  const driverItems: BottomNavItem[] = [
    { key: 'home', icon: Compass, label: labels.driverHome },
    { key: 'requests', icon: Users, label: labels.requests },
    { key: 'trips', icon: Calendar, label: labels.trips },
    { key: 'messages', icon: MessageSquare, label: labels.messages },
    { key: 'profile', icon: UserIcon, label: labels.profile }
  ];
  const items = role === UserRole.Driver ? driverItems : passengerItems;
  const active = role === UserRole.Driver ? driverTab : passengerTab;
  const setActive = role === UserRole.Driver ? setDriverTab : setPassengerTab;

  return (
    <div className="h-16 bg-white border-t border-[#E2E8F0] grid shrink-0 safe-bottom-panel" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map(({ key, icon: Icon, label }) => (
        <button key={key} onClick={() => setActive(key)} className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${active === key ? 'text-[#047857]' : 'text-[#64748B]'}`}>
          <span className="relative">
            <Icon className="w-5 h-5" />
          </span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function cityLabel(city: City, language: Language) {
  if (language === Language.TJ) return city.nameTj || city.nameRu;
  if (language === Language.EN) return city.nameRu;
  return city.nameRu;
}
