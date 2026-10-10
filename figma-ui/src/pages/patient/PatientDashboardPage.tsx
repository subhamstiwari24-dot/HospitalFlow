
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartPulse,
  History,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';

interface PatientSession {
  patientId: string;
  fullName: string;
  age?: number;
  phone: string;
  email: string;
}

interface QueuePositionResponse {
  tokenNumber: string;
  position: number;
  patientsAhead: number;
  status: string;
}

interface WaitingTimeResponse {
  tokenNumber: string;
  patientsAhead: number;
  estimatedMinMinutes: number;
  estimatedMaxMinutes: number;
  message: string;
}

interface Appointment {
  id: number;
  patientName: string;
  patientPhone?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: string;
  status: string;
  priority: string;
  doctor?: {
    id?: number;
    name?: string | null;
    specialization?: string | null;
    status?: string | null;
    department?: {
      id?: number;
      name?: string | null;
    } | null;
  } | null;
  hospital?: {
    id?: number;
    name?: string | null;
    address?: string | null;
    city?: string | null;
  } | null;
}

interface QueueAppointment {
  id: number;
  tokenNumber: string;
  status: string;
}

const cardClass =
  'rounded-2xl border border-slate-200 bg-white shadow-sm';

const mutedText = 'text-slate-500';

function getStoredPatient(): PatientSession | null {
  try {
    const stored = sessionStorage.getItem('hospitalflow_patient');
    return stored ? (JSON.parse(stored) as PatientSession) : null;
  } catch {
    return null;
  }
}

function getAppointmentDateTime(appointment: Appointment): Date | null {
  if (!appointment.appointmentDate) return null;

  const date = appointment.appointmentDate.slice(0, 10);
  const time = appointment.appointmentTime || '00:00:00';
  const parsed = new Date(`${date}T${time}`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value: string): string {
  if (!value) return 'Date unavailable';

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(value: string): string {
  if (!value) return 'Time unavailable';

  const match = value.match(/^(\d{1,2}):(\d{2})/);

  if (!match) return value;

  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);

  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getStatusLabel(status?: string): string {
  switch ((status || '').toUpperCase()) {
    case 'WAITING':
      return 'Waiting';
    case 'IN_PROGRESS':
    case 'IN_CONSULTATION':
      return 'In consultation';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'CONFIRMED':
      return 'Confirmed';
    default:
      return status || 'Scheduled';
  }
}

export default function PatientDashboardPage() {
  const navigate = useNavigate();

  const [patient] = useState<PatientSession | null>(getStoredPatient);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [queuePosition, setQueuePosition] =
    useState<QueuePositionResponse | null>(null);

  const [waitingTime, setWaitingTime] =
    useState<WaitingTimeResponse | null>(null);

  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueError, setQueueError] = useState(false);
  const [lastQueueUpdate, setLastQueueUpdate] = useState<Date | null>(null);

  const initials = useMemo(() => {
    const name = patient?.fullName?.trim() || '';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }, [patient?.fullName]);

  const goTo = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('hospitalflow_patient');
    navigate('/patient/login');
  };

  useEffect(() => {
    if (!patient) {
      setLoadingAppointments(false);
      return;
    }

    let cancelled = false;

    const fetchAppointments = async () => {
      try {
        setLoadingAppointments(true);

        const response = await fetch(
          `/api/appointments/patient/${encodeURIComponent(patient.phone)}`,
        );

        if (!response.ok) {
          throw new Error('Failed to load appointments');
        }

        const data: Appointment[] = await response.json();

        if (!cancelled) {
          setAppointments(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to load patient appointments:', error);

        if (!cancelled) setAppointments([]);
      } finally {
        if (!cancelled) setLoadingAppointments(false);
      }
    };

    void fetchAppointments();

    return () => {
      cancelled = true;
    };
  }, [patient]);

  const isAppointmentTimePassed = (appointment: Appointment) => {
    const dateTime = getAppointmentDateTime(appointment);
    return dateTime ? dateTime.getTime() < Date.now() : false;
  };


const todayDateKey = (() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
})();

const waitingAppointments = appointments.filter((appointment) => {
  const status = appointment.status?.toUpperCase();

  const isActiveStatus = [
    'WAITING',
    'IN_PROGRESS',
    'IN_CONSULTATION',
  ].includes(status);

  const appointmentDate = appointment.appointmentDate?.slice(0, 10);

  return (
    isActiveStatus &&
    Boolean(appointmentDate) &&
    appointmentDate! >= todayDateKey
  );
});

const completedAppointments = appointments.filter(
  (appointment) => appointment.status?.toUpperCase() === 'COMPLETED',
);

const cancelledAppointments = appointments.filter(
  (appointment) => appointment.status?.toUpperCase() === 'CANCELLED',
);


  const activeAppointment = waitingAppointments[0] || null;

  
const upcomingAppointment = useMemo(() => {
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  return (
    appointments
      .filter((appointment) => {
        const status = appointment.status?.toUpperCase();
        const date = appointment.appointmentDate?.slice(0, 10);

        return (
          !['CANCELLED', 'COMPLETED'].includes(status) &&
          Boolean(date) &&
          date! >= today
        );
      })
      .sort((a, b) => {
        const first = getAppointmentDateTime(a)?.getTime() ?? Infinity;
        const second = getAppointmentDateTime(b)?.getTime() ?? Infinity;
        return first - second;
      })[0] || null
  );
}, [appointments]);

  useEffect(() => {
    if (!activeAppointment) {
      setQueuePosition(null);
      setWaitingTime(null);
      setCurrentToken(null);
      setQueueError(false);
      setLastQueueUpdate(null);
      setLoadingQueue(false);
      return;
    }

    let cancelled = false;

    const fetchLiveQueue = async () => {
      try {
        setLoadingQueue(true);
        setQueueError(false);

        const [positionResponse, waitingResponse, queueResponse] =
          await Promise.all([
            fetch(`/api/appointments/${activeAppointment.id}/queue-position`),
            fetch(`/api/appointments/${activeAppointment.id}/waiting-time`),
            activeAppointment.doctor?.id
              ? fetch(
                  `/api/appointments/queue?doctorId=${activeAppointment.doctor.id}&appointmentDate=${encodeURIComponent(activeAppointment.appointmentDate)}`,
                )
              : Promise.resolve(null),
          ]);

        if (!positionResponse.ok || !waitingResponse.ok) {
          throw new Error('Failed to fetch queue information');
        }

        const positionData: QueuePositionResponse =
          await positionResponse.json();

        const waitingData: WaitingTimeResponse =
          await waitingResponse.json();

        let liveToken: string | null = null;

        if (queueResponse?.ok) {
          const queueData: QueueAppointment[] = await queueResponse.json();

          if (Array.isArray(queueData) && queueData.length > 0) {
            const consulting = queueData.find((item) =>
              ['IN_CONSULTATION', 'IN_PROGRESS'].includes(
                item.status?.toUpperCase(),
              ),
            );

            const waiting = queueData.find(
              (item) => item.status?.toUpperCase() === 'WAITING',
            );

            liveToken =
              consulting?.tokenNumber ||
              waiting?.tokenNumber ||
              queueData[0]?.tokenNumber ||
              null;
          }
        }

        if (!cancelled) {
          setQueuePosition(positionData);
          setWaitingTime(waitingData);
          setCurrentToken(liveToken || positionData.tokenNumber || null);
          setLastQueueUpdate(new Date());
          setQueueError(false);
        }
      } catch (error) {
        console.error('Failed to refresh live queue:', error);

        if (!cancelled) setQueueError(true);
      } finally {
        if (!cancelled) setLoadingQueue(false);
      }
    };

    void fetchLiveQueue();

    const interval = window.setInterval(() => {
      void fetchLiveQueue();
    }, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [
    activeAppointment?.id,
    activeAppointment?.doctor?.id,
    activeAppointment?.appointmentDate,
  ]);

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
            <User size={30} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Login Required
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please login to access your HospitalFlow patient dashboard.
          </p>

          <button
            onClick={() => navigate('/patient/login')}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#082b45] px-4 py-3 font-semibold text-white transition hover:bg-[#10415f]"
          >
            Patient Login <ArrowRight size={17} />
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', path: '/patient/dashboard', icon: Activity },
    { label: 'Book OPD', path: '/patient/hospital', icon: Plus },
    {
      label: 'My Appointments',
      path: '/patient/appointments',
      icon: CalendarDays,
    },
    { label: 'OPD History', path: '/patient/history', icon: History },
    { label: 'My Profile', path: '/patient/profile', icon: User },
  ];

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <div className="flex h-[78px] items-center border-b border-slate-200 px-5">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img
            src="/assets/logo.png"
            alt="HospitalFlow"
            className="h-auto w-[34px] object-contain"
          />
        </div>

        <div className="ml-3">
          <h2 className="text-[17px] font-bold text-slate-900">
            Hospital<span className="text-cyan-700">Flow</span>
          </h2>
          <p className="text-[9px] uppercase tracking-wider text-slate-500">
            Smart OPD Platform
          </p>
        </div>

        {mobile && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="px-4 pt-5">
        <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-sky-500 text-xs font-bold text-[#082b45]">
            {initials || 'P'}
          </div>

          <div className="ml-3 min-w-0">
            <p className="truncate text-xs font-semibold text-slate-900">
              {patient.fullName}
            </p>
            <p className="mt-1 truncate text-[10px] text-slate-500">
              Patient ID: {patient.patientId}
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-7 flex-1 px-3">
        <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Main Menu
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.path === '/patient/dashboard';

          return (
            <button
              key={item.path}
              onClick={() => goTo(item.path)}
              className={`mt-1.5 flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-xs transition-colors ${
                active
                  ? 'border-cyan-100 bg-cyan-50 font-semibold text-[#082b45] shadow-[inset_3px_0_0_#0891b2]'
                  : 'border-transparent font-medium text-slate-600 hover:bg-slate-50 hover:text-cyan-700'
              }`}
            >
              <Icon size={18} className={active ? 'text-cyan-700' : ''} />
              <span>{item.label}</span>

              {item.label === 'My Appointments' && appointments.length > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-100 px-1.5 text-[9px] font-bold text-cyan-800">
                  {appointments.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        {activeAppointment && (
          <div className="mb-3 rounded-xl border border-cyan-100 bg-cyan-50 p-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-600" />
              <span className="text-[9px] font-bold uppercase text-cyan-800">
                OPD Active
              </span>
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {activeAppointment.tokenNumber || '—'}
            </p>
            <p className="mt-1 truncate text-[10px] text-slate-600">
              {activeAppointment.doctor?.name || 'Doctor assigned'}
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-xs font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#f5f8fc] text-slate-800">
      <aside className="sticky top-0 hidden h-screen min-h-screen w-[255px] shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <SidebarContent />
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[275px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent mobile />
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-[78px] items-center border-b border-slate-200 bg-white">
          <div className="flex w-full items-center justify-between px-5 sm:px-7 lg:px-9">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 lg:hidden"
              >
                <Menu size={19} />
              </button>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-cyan-700">
                  Patient Dashboard
                </p>
                <h1 className="mt-1 text-[17px] font-bold text-slate-900 sm:text-xl">
                  Welcome back, {patient.fullName.split(' ')[0]} 👋
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
              >
                <Bell size={17} />
                {activeAppointment && (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-cyan-500" />
                )}
              </button>

              <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-sky-500 text-[11px] font-bold text-[#082b45] sm:flex">
                {initials || 'P'}
              </div>
            </div>
          </div>
        </header>

        <main className="px-5 py-7 sm:px-7 lg:px-9">
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-[13px] text-slate-600">
                Manage your appointments, digital tokens and OPD journey from one place.
              </p>

              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <ShieldCheck size={14} className="text-cyan-700" />
                Patient ID:
                <span className="font-bold text-slate-800">{patient.patientId}</span>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className={`${cardClass} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                    <CalendarDays size={18} />
                  </div>
                  <span className="text-[9px] uppercase text-slate-500">Total</span>
                </div>
                <p className="mt-4 text-2xl font-bold text-slate-900">
                  {loadingAppointments ? '—' : appointments.length}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">Appointments</p>
              </div>

              <div className={`${cardClass} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Activity size={18} />
                  </div>
                  <span className="text-[9px] uppercase text-slate-500">Live</span>
                </div>
                <p className="mt-4 text-2xl font-bold text-slate-900">
                  {loadingAppointments ? '—' : waitingAppointments.length}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">Active OPD</p>
              </div>

              <div className={`${cardClass} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="text-[9px] uppercase text-slate-500">Done</span>
                </div>
                <p className="mt-4 text-2xl font-bold text-slate-900">
                  {loadingAppointments ? '—' : completedAppointments.length}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">Completed Visits</p>
              </div>

              <div className={`${cardClass} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <History size={18} />
                  </div>
                  <span className="text-[9px] uppercase text-slate-500">Cancelled</span>
                </div>
                <p className="mt-4 text-2xl font-bold text-slate-900">
                  {loadingAppointments ? '—' : cancelledAppointments.length}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">Cancelled</p>
              </div>
            </div>

            {activeAppointment && (
              <div className="mb-6 rounded-[20px] bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-100 p-[1px]">
                <section className="relative overflow-hidden rounded-[19px] bg-white p-5 sm:p-6">
                  <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-100/70 blur-3xl" />

                  <div className="relative">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-600" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">
                            Live OPD Queue
                          </span>
                        </div>

                        <h2 className="text-xl font-bold text-slate-900">
                          Your appointment is active
                        </h2>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Track your token and OPD status in real time.
                        </p>
                      </div>

                      <button
                        onClick={() => navigate('/patient/appointment')}
                        className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] font-semibold text-cyan-800 transition hover:bg-cyan-50 sm:self-auto"
                      >
                        View Details <ChevronRight size={14} />
                      </button>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
                      <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4">
                        <p className="text-[9px] uppercase tracking-wide text-slate-500">
                          Your Token
                        </p>
                        <p className="mt-2 text-[28px] font-bold text-cyan-800">
                          {activeAppointment.tokenNumber || '—'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[9px] uppercase tracking-wide text-slate-500">
                            Current Token
                          </p>
                          {loadingQueue && (
                            <RefreshCw size={12} className="animate-spin text-cyan-700" />
                          )}
                        </div>
                        <p className="mt-2 text-[28px] font-bold text-slate-900">
                          {currentToken || '—'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[9px] uppercase tracking-wide text-slate-500">
                          Patients Ahead
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Users size={17} className="text-cyan-700" />
                          <p className="text-2xl font-bold text-slate-900">
                            {loadingQueue ? '—' : queuePosition?.patientsAhead ?? '—'}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[9px] uppercase tracking-wide text-slate-500">
                          Queue Position
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                          {loadingQueue
                            ? '—'
                            : queuePosition?.position
                              ? `#${queuePosition.position}`
                              : '—'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[9px] uppercase tracking-wide text-slate-500">
                          Estimated Wait
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Clock3 size={16} className="text-cyan-700" />
                          <p className="text-sm font-bold text-slate-900">
                            {loadingQueue
                              ? 'Updating...'
                              : waitingTime
                                ? waitingTime.estimatedMinMinutes ===
                                  waitingTime.estimatedMaxMinutes
                                  ? `${waitingTime.estimatedMinMinutes} min`
                                  : `${waitingTime.estimatedMinMinutes}-${waitingTime.estimatedMaxMinutes} min`
                                : '—'}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[9px] uppercase tracking-wide text-slate-500">
                          Status
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-cyan-600" />
                          <p className="text-xs font-bold text-cyan-800">
                            {getStatusLabel(
                              queuePosition?.status || activeAppointment.status,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-[9px] uppercase tracking-wide text-slate-500">
                          Doctor
                        </p>
                        <p className="mt-2 truncate text-sm font-semibold text-slate-900">
                          {activeAppointment.doctor?.name || 'Not assigned'}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {activeAppointment.doctor?.specialization || 'OPD'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-[9px] uppercase tracking-wide text-slate-500">
                          Hospital
                        </p>
                        <p className="mt-2 truncate text-sm font-semibold text-slate-900">
                          {activeAppointment.hospital?.name || 'Hospital'}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-slate-500">
                          {activeAppointment.hospital?.city ||
                            activeAppointment.hospital?.address ||
                            'Location available'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {loadingQueue ? (
                          <RefreshCw size={11} className="animate-spin text-cyan-700" />
                        ) : (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              queueError ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                          />
                        )}

                        <p className="text-[9px] text-slate-500">
                          {queueError
                            ? 'Unable to refresh live queue'
                            : lastQueueUpdate
                              ? `Live queue updated at ${lastQueueUpdate.toLocaleTimeString()}`
                              : 'Connecting to live OPD queue...'}
                        </p>
                      </div>

                      <p className="text-[9px] text-slate-500">
                        Auto refresh every 10 seconds
                      </p>
                    </div>

                    {waitingTime?.message && !queueError && (
                      <div className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2">
                        <p className="text-[10px] text-cyan-900">
                          {waitingTime.message}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
              <section className={`${cardClass} overflow-hidden`}>
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-900">
                      Upcoming Appointment
                    </h2>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Your next scheduled OPD visit
                    </p>
                  </div>
                  <CalendarDays size={19} className="text-cyan-700" />
                </div>

                <div className="p-5">
                  {loadingAppointments ? (
                    <div className="py-8 text-center text-sm text-slate-500">
                      Loading appointments...
                    </div>
                  ) : upcomingAppointment ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                          <CalendarDays size={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {upcomingAppointment.doctor?.name || 'Doctor appointment'}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {upcomingAppointment.doctor?.specialization || 'OPD'}
                          </p>
                          <p className="mt-3 text-xs font-semibold text-slate-700">
                            {formatDate(upcomingAppointment.appointmentDate)}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {formatTime(upcomingAppointment.appointmentTime)}
                          </p>
                          <p className="mt-2 text-[11px] text-slate-600">
                            Token: {upcomingAppointment.tokenNumber || '—'}
                          </p>
                          <span className="mt-3 inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold text-cyan-800">
                            {getStatusLabel(upcomingAppointment.status)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate('/patient/appointments')}
                        className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-xs font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-800"
                      >
                        View My Appointments <ArrowRight size={15} />
                      </button>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <CalendarDays size={21} />
                      </div>
                      <p className="mt-3 text-[13px] font-semibold text-slate-900">
                        No upcoming appointment
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Book an OPD appointment whenever you need one.
                      </p>
                      <button
                        onClick={() => navigate('/patient/hospital')}
                        className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold text-cyan-800"
                      >
                        Book OPD <ArrowRight size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </section>

              <section className={`${cardClass} overflow-hidden`}>
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-[15px] font-bold text-slate-900">
                    Quick Actions
                  </h2>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Frequently used patient services
                  </p>
                </div>

                <div className="space-y-2 p-4">
                  {[
                    {
                      title: 'Book OPD',
                      description: 'Find a doctor and appointment',
                      path: '/patient/hospital',
                      icon: Plus,
                      color: 'bg-cyan-50 text-cyan-700',
                    },
                    {
                      title: 'My Appointments',
                      description: 'View and manage appointments',
                      path: '/patient/appointments',
                      icon: CalendarDays,
                      color: 'bg-blue-50 text-blue-700',
                    },
                    {
                      title: 'OPD History',
                      description: 'Review previous visits',
                      path: '/patient/history',
                      icon: History,
                      color: 'bg-amber-50 text-amber-700',
                    },
                    {
                      title: 'My Profile',
                      description: 'Manage your patient details',
                      path: '/patient/profile',
                      icon: User,
                      color: 'bg-violet-50 text-violet-700',
                    },
                  ].map((action) => {
                    const Icon = action.icon;

                    return (
                      <button
                        key={action.path}
                        onClick={() => navigate(action.path)}
                        className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-cyan-200 hover:bg-cyan-50/50"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${action.color}`}
                        >
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-slate-900">
                            {action.title}
                          </p>
                          <p className="mt-0.5 text-[9px] text-slate-500">
                            {action.description}
                          </p>
                        </div>

                        <ArrowRight
                          size={15}
                          className="text-slate-400 transition group-hover:text-cyan-700"
                        />
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <footer className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pb-3 text-[9px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-cyan-700" />
                Secure Patient Access
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
              <span className="flex items-center gap-1.5">
                <HeartPulse size={12} className="text-cyan-700" />
                Smart OPD Management
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
              <span>HospitalFlow</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
