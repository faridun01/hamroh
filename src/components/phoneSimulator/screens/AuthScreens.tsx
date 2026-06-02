import { ArrowLeft, Car, ChevronRight, Globe2, Users } from 'lucide-react';
import { Language, UserRole } from '../../../types';
import type { Screen } from '../phoneSimulatorCopy';
import { HamrohLogo, PhoneHeader as Header, PhoneShell as Shell } from '../PhoneSimulatorLayout';

interface AuthScreensProps {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  setLanguage: (language: Language) => void;
  t: Record<string, string>;
  inputClass: string;
  primaryClass: string;
  authPhone: string;
  updateAuthPhone: (value: string) => void;
  authPassword: string;
  setAuthPassword: (value: string) => void;
  login: () => void;
  resetCode: string;
  setResetCode: (value: string) => void;
  resetPassword: string;
  setResetPassword: (value: string) => void;
  resetConfirmPassword: string;
  setResetConfirmPassword: (value: string) => void;
  recoverPassword: () => void;
  regRole: UserRole;
  setRegRole: (role: UserRole) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  gender: 'male' | 'female';
  setGender: (value: 'male' | 'female') => void;
  licenseNumber: string;
  setLicenseNumber: (value: string) => void;
  carBrand: string;
  setCarBrand: (value: string) => void;
  carModel: string;
  setCarModel: (value: string) => void;
  carColor: string;
  setCarColor: (value: string) => void;
  carYear: string;
  setCarYear: (value: string) => void;
  carPlate: string;
  setCarPlate: (value: string) => void;
  carSeats: number;
  setCarSeats: (value: number) => void;
  register: () => void;
}

export default function AuthScreens({
  screen,
  setScreen,
  setLanguage,
  t,
  inputClass,
  primaryClass,
  authPhone,
  updateAuthPhone,
  authPassword,
  setAuthPassword,
  login,
  resetCode,
  setResetCode,
  resetPassword,
  setResetPassword,
  resetConfirmPassword,
  setResetConfirmPassword,
  recoverPassword,
  regRole,
  setRegRole,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  confirmPassword,
  setConfirmPassword,
  gender,
  setGender,
  licenseNumber,
  setLicenseNumber,
  carBrand,
  setCarBrand,
  carModel,
  setCarModel,
  carColor,
  setCarColor,
  carYear,
  setCarYear,
  carPlate,
  setCarPlate,
  carSeats,
  setCarSeats,
  register
}: AuthScreensProps) {
    if (screen === 'lang') {
      return (
        <Shell>
          <div className="flex-1 flex flex-col justify-center p-6 gap-8 bg-[#F8FAFC] text-center">
            <div className="flex flex-col items-center">
              <div className="mb-6 flex justify-center">
                <HamrohLogo compact />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-[#0F172A]">Hamroh</h1>
            </div>
            {([['Тоҷикӣ', Language.TJ], ['Русский', Language.RU], ['English', Language.EN]] as const).map(([label, lang]) => (
              <button key={lang} onClick={() => { setLanguage(lang); setScreen('welcome'); }} className="h-14 rounded-2xl bg-white border border-[#E2E8F0] font-bold text-center px-4 shadow-sm active:scale-[0.98] transition-all">
                {label}
              </button>
            ))}
          </div>
        </Shell>
      );
    }

    if (screen === 'welcome') {
      return (
        <Shell>
          <div className="flex-1 h-full overflow-hidden bg-[#F8FAFC] px-6 pt-6 pb-6 flex flex-col">
            <div className="flex justify-center">
              <button onClick={() => setScreen('lang')} className="h-11 px-5 rounded-full bg-white shadow-[0_8px_22px_rgba(15,23,42,0.10)] border border-[#E2E8F0] flex items-center gap-3 text-[#0F172A] font-extrabold active:scale-[0.98] transition-all">
                <Globe2 className="w-5 h-5 text-[#047857]" />
                {t.languageName}
              </button>
            </div>
            <div className="mt-14 flex justify-center">
              <HamrohLogo />
            </div>
            <div className="mt-16 text-center">
              <h1 className="text-[32px] leading-[1.14] font-black tracking-tight text-[#047857]">{t.welcomeTitle}</h1>
              <p className="text-[#334155] mt-5 text-[17px] leading-7 max-w-75 mx-auto">{t.welcome}</p>
            </div>
            <div className="mt-auto space-y-4">
              <button onClick={() => setScreen('login')} className="w-full h-14 rounded-[18px] bg-[#047857] text-white font-extrabold text-xl shadow-[0_12px_22px_rgba(4,120,87,0.18)] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                {t.login}
                <ChevronRight className="w-7 h-7" />
              </button>
              <button onClick={() => setScreen('role')} className="w-full h-14 rounded-[18px] bg-white border-2 border-[#047857] text-[#047857] font-extrabold text-lg active:scale-[0.98] transition-all">{t.register}</button>
            </div>
          </div>
        </Shell>
      );
    }

    if (false && screen === 'welcome') {
      return (
        <Shell>
          <div className="flex-1 flex flex-col justify-between p-7 bg-[#F8FAFC]">
            <div className="pt-20">
              <HamrohLogo />
              <h1 className="text-[40px] leading-tight font-black tracking-tight text-[#0F172A]">Hamroh</h1>
              <p className="text-[#64748B] mt-5 text-lg leading-8 max-w-70">Надежные поездки между городами Таджикистана</p>
            </div>
            <div className="space-y-4 pb-3">
              <button onClick={() => setScreen('login')} className="w-full h-17.5 rounded-[20px] bg-[#10B981] text-white font-extrabold text-base shadow-sm active:scale-[0.98] transition-all">{t.login}</button>
              <button onClick={() => setScreen('role')} className="w-full h-17.5 rounded-[20px] bg-white border border-[#10B981] text-[#047857] font-extrabold text-base active:scale-[0.98] transition-all">{t.register}</button>
            </div>
          </div>
        </Shell>
      );
    }

    if (screen === 'login') {
      return (
        <Shell>
          <Header title={t.login} back={() => setScreen('welcome')} />
          <div className="flex-1 flex items-center px-5">
            <div className="w-full space-y-5 -mt-16">
              <input value={authPhone} onChange={event => updateAuthPhone(event.target.value)} className={inputClass} inputMode="tel" placeholder="+992900111111" />
              <input value={authPassword} onChange={event => setAuthPassword(event.target.value)} className={inputClass} type="password" placeholder={t.password} />
              <button onClick={login} className={primaryClass}>{t.login}</button>
              <button onClick={() => setScreen('forgot')} className="w-full text-center text-sm text-[#047857] font-bold">{t.forgotPassword}</button>
            </div>
          </div>
        </Shell>
      );
    }

    if (screen === 'forgot') {
      return (
        <Shell>
          <Header title={t.resetPasswordTitle} back={() => setScreen('login')} />
          <div className="flex-1 flex items-center px-5">
            <div className="w-full space-y-4 -mt-10">
              <p className="text-sm text-[#64748B] leading-6">{t.resetPasswordHint}</p>
              <input value={authPhone} onChange={event => updateAuthPhone(event.target.value)} className={inputClass} inputMode="tel" placeholder="+992900111111" />
              <input value={resetCode} onChange={event => setResetCode(event.target.value)} className={inputClass} inputMode="numeric" placeholder={t.verificationCode} />
              <input value={resetPassword} onChange={event => setResetPassword(event.target.value)} className={inputClass} type="password" placeholder={t.newPassword} />
              <input value={resetConfirmPassword} onChange={event => setResetConfirmPassword(event.target.value)} className={inputClass} type="password" placeholder={t.repeatPassword} />
              <button onClick={recoverPassword} className={primaryClass}>{t.savePassword}</button>
            </div>
          </div>
        </Shell>
      );
    }

    if (screen === 'role') {
      return (
        <Shell>
          <div className="relative px-4 py-4 bg-white border-b border-[#E2E8F0] shrink-0">
            <button onClick={() => setScreen('welcome')} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#F8FAFC] flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="mx-auto max-w-62.5 text-center">
              <h2 className="text-lg font-black leading-tight">{t.roleChoice}</h2>
              <p className="text-xs text-[#64748B] mt-1">Hamroh</p>
            </div>
          </div>
          <div className="flex-1 flex items-center px-5">
            <div className="w-full space-y-4 -mt-16">
              <button onClick={() => { setRegRole(UserRole.Passenger); setScreen('register'); }} className="w-full bg-white rounded-3xl border border-[#E2E8F0] p-6 text-center shadow-sm active:scale-[0.98] transition-all">
                <Users className="w-8 h-8 text-[#10B981] mx-auto mb-4" />
                <p className="font-black text-lg">{t.passengerRole}</p>
                <p className="text-sm text-[#64748B] mt-2 max-w-60 mx-auto">{t.passengerRoleDescription}</p>
              </button>
              <button onClick={() => { setRegRole(UserRole.Driver); setScreen('register'); }} className="w-full bg-white rounded-3xl border border-[#E2E8F0] p-6 text-center shadow-sm active:scale-[0.98] transition-all">
                <Car className="w-8 h-8 text-[#10B981] mx-auto mb-4" />
                <p className="font-black text-lg">{t.driverRole}</p>
                <p className="text-sm text-[#64748B] mt-2 max-w-60 mx-auto">{t.driverRoleDescription}</p>
              </button>
            </div>
          </div>
        </Shell>
      );
    }

    return (
      <Shell>
        <Header title={regRole === UserRole.Driver ? t.driverRegister : t.passengerRegister} back={() => setScreen('role')} />
        <div className="flex-1 min-h-0 overflow-y-auto p-5 pb-28 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input value={firstName} onChange={event => setFirstName(event.target.value)} className={inputClass} placeholder={t.firstName} />
            <input value={lastName} onChange={event => setLastName(event.target.value)} className={inputClass} placeholder={t.lastName} />
          </div>
          <input value={authPhone} onChange={event => updateAuthPhone(event.target.value)} className={inputClass} inputMode="tel" placeholder="+992900111111" />
          <div className="grid grid-cols-2 gap-3">
            <input value={authPassword} onChange={event => setAuthPassword(event.target.value)} className={inputClass} type="password" placeholder={t.password} />
            <input value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className={inputClass} type="password" placeholder={t.repeatPassword} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setGender('male')} className={`h-12 rounded-2xl border font-bold ${gender === 'male' ? 'bg-[#D1FAE5] border-[#10B981]' : 'bg-white border-[#E2E8F0]'}`}>{t.male}</button>
            <button onClick={() => setGender('female')} className={`h-12 rounded-2xl border font-bold ${gender === 'female' ? 'bg-[#D1FAE5] border-[#10B981]' : 'bg-white border-[#E2E8F0]'}`}>{t.female}</button>
          </div>
          {regRole === UserRole.Driver && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-4 border border-[#E2E8F0] space-y-3">
                <p className="font-black">Документы водителя</p>
                <input value={licenseNumber} onChange={event => setLicenseNumber(event.target.value)} className={inputClass} placeholder="Номер водительских прав" />
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-[#64748B]">
                  {['Фото профиля', 'Live selfie', 'Паспорт / ID', 'Права'].map(item => <div key={item} className="rounded-2xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]">{item}<br /><span className="text-[#10B981]">готово</span></div>)}
                </div>
              </div>
              <div className="bg-white rounded-3xl p-4 border border-[#E2E8F0] space-y-3">
                <p className="font-black">Автомобиль</p>
                <div className="grid grid-cols-2 gap-3">
                  <input value={carBrand} onChange={event => setCarBrand(event.target.value)} className={inputClass} placeholder="Марка" />
                  <input value={carModel} onChange={event => setCarModel(event.target.value)} className={inputClass} placeholder="Модель" />
                  <input value={carColor} onChange={event => setCarColor(event.target.value)} className={inputClass} placeholder="Цвет" />
                  <input value={carYear} onChange={event => setCarYear(event.target.value)} className={inputClass} placeholder="???" />
                </div>
                <input value={carPlate} onChange={event => setCarPlate(event.target.value)} className={inputClass} placeholder="Гос. номер" />
                <input value={carSeats} onChange={event => setCarSeats(Number(event.target.value))} className={inputClass} type="number" placeholder="Мест" />
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-[#64748B]">
                  {['Техпаспорт', 'Фото спереди', 'Фото сзади', 'Фото салона'].map(item => <div key={item} className="rounded-2xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]">{item}<br /><span className="text-[#10B981]">готово</span></div>)}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 bg-white border-t border-[#E2E8F0] safe-bottom-panel">
          <button onClick={register} className={primaryClass}>
            {regRole === UserRole.Driver ? 'Отправить на проверку' : 'Создать аккаунт'}
          </button>
        </div>
      </Shell>
    );
}
