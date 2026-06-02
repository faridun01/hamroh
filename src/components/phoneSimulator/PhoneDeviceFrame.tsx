import type { ReactNode } from 'react';
import { Bell } from 'lucide-react';
import type { Notification } from '../../types';

export function PhoneDeviceFrame({
  deviceType,
  setDeviceType,
  topNotification,
  setTopNotification,
  openNotification,
  formatDateTime,
  toast,
  unreadNotificationsCount,
  onOpenNotifications,
  children
}: {
  deviceType: 'ios' | 'android';
  setDeviceType: (type: 'ios' | 'android') => void;
  topNotification: Notification | null;
  setTopNotification: (notification: Notification | null) => void;
  openNotification: (notification: Notification) => void;
  formatDateTime: (value: string) => string;
  toast: string;
  unreadNotificationsCount: number;
  onOpenNotifications?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex items-center gap-2 mb-4 bg-white border border-[#E2E8F0] rounded-2xl p-2 shadow-sm">
        <button onClick={() => setDeviceType('ios')} className={`px-3 h-9 rounded-xl text-xs font-bold ${deviceType === 'ios' ? 'bg-[#D1FAE5] text-[#047857]' : 'text-[#64748B]'}`}>iOS</button>
        <button onClick={() => setDeviceType('android')} className={`px-3 h-9 rounded-xl text-xs font-bold ${deviceType === 'android' ? 'bg-[#D1FAE5] text-[#047857]' : 'text-[#64748B]'}`}>Android</button>
      </div>
      <div className={`relative h-[min(45rem,calc(100vh-6.5rem))] min-h-[34rem] w-[min(22.5rem,calc(100vw-1rem))] bg-neutral-900 border-10 border-neutral-800 shadow-2xl overflow-hidden select-none ${deviceType === 'ios' ? 'rounded-[48px]' : 'rounded-[36px]'}`}>
        {deviceType === 'ios' && <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50" />}
        {deviceType === 'android' && <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full z-50" />}
        <div className="h-8 bg-white px-6 pt-1 flex items-center justify-between z-40 relative text-[#0F172A] text-[10px] font-bold">
          <span>09:41</span>
          <span>5G 98%</span>
        </div>
        <div className="absolute inset-0 top-8 bg-white flex flex-col overflow-hidden safe-phone-screen">
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="absolute right-4 top-3 z-40 w-11 h-11 rounded-2xl bg-white/95 border border-[#E2E8F0] shadow-lg shadow-slate-900/10 flex items-center justify-center text-[#0F172A]"
              aria-label="Открыть уведомления"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          )}
          {topNotification && (
            <div className="absolute top-3 left-4 right-4 z-50 rounded-2xl bg-[#0F172A] text-white p-3 shadow-xl">
              <button
                onClick={() => {
                  openNotification(topNotification);
                  setTopNotification(null);
                }}
                className="w-full text-left"
              >
                <div className="flex items-start gap-2">
                  <Bell className="w-4 h-4 mt-0.5 shrink-0 text-[#34D399]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black leading-tight truncate">{topNotification.title}</p>
                    <p className="text-[11px] font-bold text-slate-200 mt-1 leading-snug line-clamp-2">{topNotification.message}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2">{formatDateTime(topNotification.createdAt)}</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setTopNotification(null)}
                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/10 text-[11px] font-black"
                aria-label="Закрыть уведомление"
              >
                x
              </button>
            </div>
          )}
          {toast && <div className={`absolute ${topNotification ? 'top-28' : 'top-3'} left-4 right-4 z-50 rounded-2xl bg-[#0F172A] text-white p-3 text-xs font-bold shadow-xl`}>{toast}</div>}
          {children}
        </div>
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-neutral-600 rounded-full z-50" />
      </div>
    </div>
  );
}
