import { CheckCircle, ShieldCheck } from 'lucide-react';
import {
  Complaint,
  ComplaintStatus,
  DriverProfile,
  SuggestedDirection,
  Trip,
  User,
  UserRole,
  Vehicle,
  VerificationStatus,
} from '../types';

interface AdminDashboardProps {
  users: User[];
  trips: Trip[];
  complaints: Complaint[];
  driverProfiles: DriverProfile[];
  vehicles: Vehicle[];
  suggestedDirections: SuggestedDirection[];
  adminNote: { [key: string]: string };
  setAdminNote: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  onApproveDriver: (userId: string) => void;
  onRejectDriver: (userId: string) => void;
  onToggleUserActive: (userId: string) => void;
  onResolveComplaint: (complaintId: string) => void;
  onApproveDirection: (suggestedId: string) => void;
  onRejectDirection: (suggestedId: string) => void;
}

export default function AdminDashboard({
  users,
  trips,
  complaints,
  driverProfiles,
  vehicles,
  suggestedDirections,
  adminNote,
  setAdminNote,
  onApproveDriver,
  onRejectDriver,
  onToggleUserActive,
  onResolveComplaint,
  onApproveDirection,
  onRejectDirection,
}: AdminDashboardProps) {
  const pendingDrivers = driverProfiles.filter(profile => profile.verificationStatus === VerificationStatus.PendingVerification);
  const openComplaints = complaints.filter(complaint => complaint.status === ComplaintStatus.Open);
  const pendingDirections = suggestedDirections.filter(direction => direction.status === 'pending');

  return (
    <div id="admin-panel-console" className="h-full overflow-y-auto p-6 space-y-6 text-left">
      <div>
        <h3 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Hamroh Admin Dashboard</span>
        </h3>
        <p className="text-xs text-slate-400">Проверка водителей, жалобы, пользователи, маршруты и контроль платформы.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Поездки" value={trips.length} valueClass="text-slate-100" />
        <StatCard label="Водители на проверке" value={pendingDrivers.length} valueClass="text-amber-400" />
        <StatCard label="Открытые жалобы" value={openComplaints.length} valueClass="text-rose-500" />
        <StatCard label="Пользователи" value={users.length} valueClass="text-sky-400" />
      </div>

      <section className="space-y-3">
        <SectionHeader title="Проверка документов водителей" badge={`${pendingDrivers.length} ожидают`} />
        {pendingDrivers.length === 0 ? (
          <EmptyState text="Нет водителей, ожидающих проверки." />
        ) : (
          <div className="space-y-3">
            {pendingDrivers.map(profile => {
              const driver = users.find(user => user.id === profile.userId);
              const vehicle = vehicles.find(item => item.driverId === profile.userId);

              return (
                <div key={profile.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <img src={driver?.avatarUrl} className="w-9 h-9 rounded-full border border-slate-700 object-cover" alt="" />
                      <div>
                        <span className="block font-bold text-xs text-white">{driver?.fullName}</span>
                        <span className="block text-[10px] text-slate-400">{driver?.phone} - {driver?.city}</span>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 leading-normal pl-2 border-l-2 border-slate-800 space-y-0.5">
                      <div><b>Права:</b> {profile.licenseNumber || 'не указано'}</div>
                      <div><b>Авто:</b> {vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.color}) [${vehicle.plateNumber}]` : 'нет данных'}</div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 shrink-0">
                    <button onClick={() => onApproveDriver(profile.userId)} className="flex-1 md:w-32 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2 px-3 rounded-lg transition-colors">
                      Одобрить
                    </button>
                    <button onClick={() => onRejectDriver(profile.userId)} className="flex-1 md:w-32 bg-rose-950/40 hover:bg-rose-950 text-rose-400 border border-rose-900/40 font-bold text-xs py-2 px-3 rounded-lg transition-all">
                      Отклонить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader title="Жалобы и споры" badge={`${openComplaints.length} открыто`} danger />
        {complaints.length === 0 ? (
          <EmptyState text="Жалоб пока нет." />
        ) : (
          <div className="space-y-3">
            {complaints.map(complaint => {
              const user = users.find(item => item.id === complaint.userId);
              const isResolved = complaint.status === ComplaintStatus.Resolved;

              return (
                <div key={complaint.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center bg-slate-950 px-3 py-1.5 rounded-lg text-[10px]">
                    <span className="font-bold text-slate-300">Пользователь: {user?.fullName}</span>
                    <span className={`px-1.5 py-0.5 rounded font-mono uppercase ${isResolved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {complaint.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-normal bg-slate-950/40 p-2.5 rounded border border-slate-950/60">
                    <b>Описание:</b> {complaint.description}
                  </p>
                  {isResolved ? (
                    <div className="text-[11px] text-emerald-400 bg-emerald-500/5 p-2 rounded">
                      <b>Решение администратора:</b> {complaint.adminNote}
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-stretch gap-2">
                      <input
                        type="text"
                        placeholder="Решение администратора"
                        value={adminNote[complaint.id] || ''}
                        onChange={event => setAdminNote({ ...adminNote, [complaint.id]: event.target.value })}
                        className="flex-1 bg-slate-950 border border-slate-800 text-xs px-3 py-2 text-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                      <button onClick={() => onResolveComplaint(complaint.id)} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[10px] py-2 px-4 rounded-lg transition-colors">
                        Закрыть
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader title="Заявки на города и маршруты" badge={`${pendingDirections.length} ожидают`} />
        {suggestedDirections.length === 0 ? (
          <EmptyState text="Нет пользовательских предложений." />
        ) : (
          <div className="space-y-3">
            {suggestedDirections.map(suggestion => (
              <SuggestedDirectionCard
                key={suggestion.id}
                suggestion={suggestion}
                onApprove={() => onApproveDirection(suggestion.id)}
                onReject={() => onRejectDirection(suggestion.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader title="Пользователи платформы" badge={`${users.length} аккаунтов`} />
        <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800 overflow-hidden">
          {users.map(user => (
            <div key={user.id} className="p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <img src={user.avatarUrl} className="w-8 h-8 rounded-full border border-slate-800 object-cover" alt="" />
                <div>
                  <span className="block font-bold text-white">{user.fullName} {user.role === UserRole.Admin ? '(админ)' : ''}</span>
                  <span className="text-[10px] text-slate-400">{user.phone} - {user.role}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${user.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                  {user.isActive ? 'Активен' : 'Заблокирован'}
                </span>
                {user.role !== UserRole.Admin && (
                  <button onClick={() => onToggleUserActive(user.id)} className={`text-[9px] font-bold py-1 px-2.5 rounded transition-all ${user.isActive ? 'bg-rose-950/40 hover:bg-rose-950 text-rose-400' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-600'}`}>
                    {user.isActive ? 'Блок' : 'Разблок'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, valueClass }: { label: string; value: number; valueClass: string }) {
  return (
    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
      <span className="text-[10px] text-slate-500 uppercase block font-bold">{label}</span>
      <span className={`text-lg font-black ${valueClass}`}>{value}</span>
    </div>
  );
}

function SectionHeader({ title, badge, danger = false }: { title: string; badge: string; danger?: boolean }) {
  return (
    <div className="border-b border-slate-800 pb-1 flex items-center justify-between">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{title}</span>
      <span className={`text-[10px] ${danger ? 'text-rose-400' : 'bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/10'}`}>
        {badge}
      </span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-xl text-center">
      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
      <p className="text-xs text-slate-400 italic">{text}</p>
    </div>
  );
}

function SuggestedDirectionCard({
  suggestion,
  onApprove,
  onReject,
}: {
  suggestion: SuggestedDirection;
  onApprove: () => void;
  onReject: () => void;
}) {
  const isPending = suggestion.status === 'pending';
  const isApproved = suggestion.status === 'approved';
  const isRejected = suggestion.status === 'rejected';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-center bg-slate-950 px-3 py-1.5 rounded-lg text-[10px] text-slate-300 font-semibold">
        <span>{suggestion.userFullName}</span>
        <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${isApproved ? 'bg-emerald-500/10 text-emerald-400' : isRejected ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
          {isApproved ? 'Одобрено' : isRejected ? 'Отклонено' : 'На проверке'}
        </span>
      </div>
      <div className="text-xs space-y-1.5 text-left text-slate-200">
        <p className="font-extrabold text-white">{suggestion.nameRu}</p>
        <p className="text-slate-400">{suggestion.details}</p>
      </div>
      {isPending && (
        <div className="flex gap-2">
          <button onClick={onApprove} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2 px-3 rounded-lg">
            Одобрить
          </button>
          <button onClick={onReject} className="flex-1 bg-rose-950/40 hover:bg-rose-950 text-rose-400 border border-rose-900/40 font-bold text-xs py-2 px-3 rounded-lg">
            Отклонить
          </button>
        </div>
      )}
    </div>
  );
}
