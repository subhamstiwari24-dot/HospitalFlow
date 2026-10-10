
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Activity,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  HeartPulse,
  Megaphone,
  Users,
  UserRound,
  Building2,
  Stethoscope,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import DoctorLayout from '../../components/DoctorLayout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import PatientInitials from '../../components/PatientInitials';
import { useQueue } from '../../context/QueueContext';
import type { DoctorStatus } from '../../types';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDoctorDashboard } from '../../components/Skeleton';

type BackendDoctor = {
  id: number;
  name: string;
  specialization: string;
  qualification?: string;
  experience?: string | number;
  status?: string;
  consultationTime?: string;
  hospital?: { id: number; name?: string };
  department?: { id: number; name: string };
};

type BackendAppointment = {
  id: number;
  patientName: string;
  patientPhone?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: string;
  status: string;
  priority: string;
  doctor?: { id: number; name?: string };
  hospital?: { id: number; name?: string };
};

const statusOptions: {
  label: DoctorStatus;
  color: string;
  description: string;
}[] = [
  {
    label: 'Available',
    color: 'bg-emerald-500',
    description: 'Ready to see patients',
  },
  {
    label: 'Busy',
    color: 'bg-amber-500',
    description: 'Currently consulting',
  },
  {
    label: 'On Break',
    color: 'bg-orange-500',
    description: 'Temporarily unavailable',
  },
  {
    label: 'Offline',
    color: 'bg-slate-400',
    description: 'Not accepting patients',
  },
];

function getTodayBackendDate() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

function formatSelectedDate(date: string) {
  if (!date) return 'Select a date';

  const [year, month, day] = date.split('-').map(Number);

  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';

  return 'Good evening';
}

function getTimeValue(time?: string) {
  if (!time) return Number.MAX_SAFE_INTEGER;

  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);

  if (!match) return Number.MAX_SAFE_INTEGER;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3]?.toUpperCase();

  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  return hour * 60 + minute;
}

function normalizeDoctorStatus(status?: string): DoctorStatus {
  const value = status?.trim().toLowerCase();

  if (value === 'available') return 'Available';
  if (value === 'busy') return 'Busy';

  if (value === 'on break' || value === 'on_break') {
    return 'On Break';
  }

  return 'Offline';
}

function isWaiting(status?: string) {
  return status?.toUpperCase() === 'WAITING';
}

function isInProgress(status?: string) {
  return status?.toUpperCase() === 'IN_PROGRESS';
}

function isCompleted(status?: string) {
  return status?.toUpperCase() === 'COMPLETED';
}

function getPriorityValue(priority?: string) {
  const value = priority?.toUpperCase();

  if (value === 'EMERGENCY') return 3;
  if (value === 'PRIORITY' || value === 'URGENT' || value === 'HIGH') {
    return 2;
  }

  return 1;
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const {
    currentPatient,
    waitingPatients,
    callNextPatient,
    completeConsultation,
    skipPatient,
    selectPatient,
  } = useQueue();

  const [doctor, setDoctor] = useState<BackendDoctor | null>(null);
  const [appointments, setAppointments] = useState<BackendAppointment[]>([]);

  const [selectedDate, setSelectedDate] = useState(getTodayBackendDate());
  const [greeting, setGreeting] = useState(getGreeting());

  const [doctorStatus, setDoctorStatus] =
    useState<DoctorStatus>('Available');

  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [error, setError] = useState('');

  const loading = usePageLoad(500);

  // Update greeting automatically.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setGreeting(getGreeting());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  // Load the logged-in doctor.
  useEffect(() => {
    let cancelled = false;

    async function loadDoctor() {
      try {
        setLoadingDoctor(true);
        setError('');

        const storedDoctor = sessionStorage.getItem('hospitalflow_doctor');

        if (!storedDoctor) {
          navigate('/login', { replace: true });
          return;
        }

        let doctorId: number;

        try {
          const parsed = JSON.parse(storedDoctor);
          doctorId = Number(parsed?.doctorId ?? parsed?.id);
        } catch {
          navigate('/login', { replace: true });
          return;
        }

        if (!Number.isFinite(doctorId) || doctorId <= 0) {
          navigate('/login', { replace: true });
          return;
        }

        const response = await fetch('/api/doctors');

        if (!response.ok) {
          throw new Error('Could not load doctors.');
        }

        const doctors: BackendDoctor[] = await response.json();

        const loggedInDoctor = doctors.find(
          (item) => Number(item.id) === doctorId,
        );

        if (!loggedInDoctor) {
          throw new Error('Logged-in doctor was not found.');
        }

        if (cancelled) return;

        setDoctor(loggedInDoctor);
        setDoctorStatus(normalizeDoctorStatus(loggedInDoctor.status));
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Could not load doctor.',
          );
        }
      } finally {
        if (!cancelled) setLoadingDoctor(false);
      }
    }

    void loadDoctor();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Fetch appointments whenever the doctor or selected date changes.
  useEffect(() => {
    if (!doctor || !selectedDate) return;

    const controller = new AbortController();
    let cancelled = false;

    async function loadSelectedDate() {
      try {
        setLoadingAppointments(true);
        setError('');

        const params = new URLSearchParams({
          doctorId: String(doctor.id),
          appointmentDate: selectedDate,
        });

        const response = await fetch(
          `/api/appointments?${params.toString()}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(
            'Could not load appointments for the selected date.',
          );
        }

        const data: BackendAppointment[] = await response.json();

        if (cancelled) return;

        const filtered = (Array.isArray(data) ? data : []).filter(
          (appointment) =>
            appointment.appointmentDate === selectedDate &&
            Number(appointment.doctor?.id) === Number(doctor.id),
        );

        setAppointments(filtered);
      } catch (err) {
        if (cancelled || (err instanceof Error && err.name === 'AbortError')) {
          return;
        }

        console.error('Appointment fetch error:', err);
        setAppointments([]);

        setError(
          err instanceof Error
            ? err.message
            : 'Could not load selected-date appointments.',
        );
      } finally {
        if (!cancelled) setLoadingAppointments(false);
      }
    }

    void loadSelectedDate();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [doctor, selectedDate]);

  // Statistics are calculated only from the selected-date appointments.
  const totalAppointments = appointments.length;

  const totalWaiting = appointments.filter((item) =>
    isWaiting(item.status),
  ).length;

  const priorityPatients = appointments.filter(
    (item) =>
      isWaiting(item.status) && getPriorityValue(item.priority) > 1,
  ).length;

  const completedCount = appointments.filter((item) =>
    isCompleted(item.status),
  ).length;

  const completionPercentage =
    totalAppointments > 0
      ? Math.round((completedCount / totalAppointments) * 100)
      : 0;

  const nextAppointment = useMemo(() => {
    const upcoming = appointments
      .filter(
        (item) => isWaiting(item.status) || isInProgress(item.status),
      )
      .slice()
      .sort(
        (a, b) =>
          getTimeValue(a.appointmentTime) -
          getTimeValue(b.appointmentTime),
      );

    return upcoming[0]?.appointmentTime || '—';
  }, [appointments]);

  const sortedAppointments = useMemo(
    () =>
      appointments
        .slice()
        .sort(
          (a, b) =>
            getTimeValue(a.appointmentTime) -
            getTimeValue(b.appointmentTime),
        ),
    [appointments],
  );

  const handleViewPatient = () => {
    if (!currentPatient) return;

    selectPatient(currentPatient.id);
    navigate('/doctor/patients');
  };

  // Update doctor availability.
  const handleStatusChange = async (status: DoctorStatus) => {
    if (!doctor || statusSaving) return;

    const previousStatus = doctorStatus;

    setDoctorStatus(status);
    setStatusMenuOpen(false);
    setStatusSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/doctors/${doctor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: doctor.name,
          specialization: doctor.specialization,
          qualification: doctor.qualification ?? '',
          experience: doctor.experience ?? '',
          status,
          consultationTime: doctor.consultationTime ?? '',
          hospital: doctor.hospital
            ? { id: doctor.hospital.id }
            : undefined,
          department: doctor.department
            ? { id: doctor.department.id }
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Could not update doctor status.');
      }

      const updatedDoctor: BackendDoctor = await response.json();

      setDoctor(updatedDoctor);
      setDoctorStatus(normalizeDoctorStatus(updatedDoctor.status));
    } catch (err) {
      setDoctorStatus(previousStatus);

      setError(
        err instanceof Error
          ? err.message
          : 'Could not update doctor status.',
      );
    } finally {
      setStatusSaving(false);
    }
  };

  const activeStatusOption = statusOptions.find(
    (option) => option.label === doctorStatus,
  );

  if (loading || loadingDoctor) {
    return (
      <DoctorLayout title="Live operations">
        <SkDoctorDashboard />
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout title="Live operations">
      <div className="min-h-full space-y-6 text-slate-800">
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-800">
                Something went wrong
              </p>
              <p className="mt-1 text-sm text-rose-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* Welcome and date selector */}
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dce7f0] bg-white p-5 shadow-sm sm:p-6">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
              Doctor workspace
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#071b31] sm:text-3xl">
              {greeting}, {doctor?.name || 'Doctor'}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {doctor?.specialization || 'Doctor'}
              {doctor?.department?.name
                ? ` · ${doctor.department.name}`
                : ''}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {selectedDate === getTodayBackendDate()
                ? "Here's your OPD overview for today."
                : `Appointments for ${formatSelectedDate(selectedDate)}.`}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#dce7f0] bg-[#f5f9fc] px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#071b31] text-cyan-300">
              <CalendarDays size={19} />
            </div>

            <div>
              <label
                htmlFor="dashboard-date"
                className="block text-[10px] font-bold uppercase tracking-wider text-slate-400"
              >
                Select date
              </label>

              <input
                id="dashboard-date"
                type="date"
                value={selectedDate}
                onChange={(event) => {
                  if (event.target.value) {
                    setSelectedDate(event.target.value);
                  }
                }}
                className="mt-1 cursor-pointer border-0 bg-transparent text-sm font-semibold text-[#071b31] outline-none"
              />

              <p className="mt-1 text-[10px] text-slate-500">
                {formatSelectedDate(selectedDate)}
              </p>

              <button
                type="button"
                onClick={() => setSelectedDate(getTodayBackendDate())}
                className="mt-1 text-[11px] font-semibold text-cyan-800 hover:text-cyan-950"
              >
                Return to today
              </button>
            </div>
          </div>
        </section>

        {/* Doctor profile */}
        {doctor && (
          <section className="rounded-2xl border border-[#12374e] bg-gradient-to-r from-[#071b31] via-[#0a2940] to-[#0c4055] p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-300">
                <Stethoscope size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Professional profile
                </p>
                <p className="text-xs text-slate-400">
                  Hospital and department details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Doctor', value: doctor.name },
                {
                  label: 'Specialization',
                  value: doctor.specialization || 'Not specified',
                },
                {
                  label: 'Department',
                  value: doctor.department?.name || 'Not assigned',
                },
                {
                  label: 'Hospital',
                  value: doctor.hospital?.name || 'HospitalFlow',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border-t border-white/10 pt-3"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Statistics for selected date */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#071b31]">
                Appointment overview
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {formatSelectedDate(selectedDate)}
              </p>
            </div>

            {loadingAppointments ? (
              <span className="text-xs font-medium text-cyan-800">
                Loading appointments...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {totalAppointments} appointments loaded
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              icon={<Users className="h-5 w-5 text-white" />}
              iconBg="bg-[#0d344b]"
              label="Waiting"
              value={totalWaiting}
              sub={`${priorityPatients} priority patients`}
            />

            <StatCard
              icon={<CalendarDays className="h-5 w-5 text-white" />}
              iconBg="bg-[#087e9b]"
              label="Appointments"
              value={totalAppointments}
              sub={`Next at ${nextAppointment}`}
            />

            <StatCard
              icon={<CheckCircle2 className="h-5 w-5 text-white" />}
              iconBg="bg-emerald-600"
              label="Completed"
              value={completedCount}
              sub={`${completionPercentage}% completed`}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
          <div className="min-w-0 space-y-5">
            {/* Current consultation */}
            <div className="overflow-hidden rounded-2xl border border-[#dce7f0] bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-[#e5edf4] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800">
                    <HeartPulse size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#071b31]">
                      Current patient
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Active consultation
                    </p>
                  </div>
                </div>

                {currentPatient && (
                  <StatusBadge status="In consultation" showDot={false} />
                )}
              </div>

              {currentPatient ? (
                <>
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <PatientInitials
                      initials={currentPatient.initials}
                      size="lg"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-lg font-bold text-[#071b31]">
                        {currentPatient.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {currentPatient.consultationType}
                      </p>
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-cyan-800">
                        <Clock3 size={14} />
                        Appointment {currentPatient.appointmentTime}
                      </p>
                    </div>

                    <div className="flex min-w-[90px] items-center gap-3 rounded-xl border border-cyan-100 bg-cyan-50 p-3 sm:flex-col sm:gap-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">
                        Token
                      </p>
                      <p className="text-2xl font-extrabold text-[#071b31]">
                        {currentPatient.token}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-[#e5edf4] bg-[#f8fbfd] px-5 py-4">
                    <Button variant="secondary" onClick={handleViewPatient}>
                      View Patient
                    </Button>

                    <Button
                      variant="success"
                      onClick={() => {
                        completeConsultation();
                        navigate('/doctor/queue');
                      }}
                    >
                      Complete
                    </Button>

                    <Button
                      variant="danger"
                      onClick={() => {
                        skipPatient();
                        navigate('/doctor/queue');
                      }}
                    >
                      Skip
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center px-5 py-10 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <UserRound size={26} />
                  </div>
                  <h3 className="text-base font-bold text-[#071b31]">
                    No Active Consultation
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    No patient is currently in consultation.
                  </p>

                  {waitingPatients.length > 0 && (
                    <div className="mt-5">
                      <Button variant="primary" onClick={callNextPatient}>
                        <span className="inline-flex items-center gap-2">
                          <Megaphone size={16} />
                          Call Next Patient
                        </span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Appointments for selected date */}
            <div className="overflow-hidden rounded-2xl border border-[#dce7f0] bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5edf4] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071b31] text-cyan-300">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#071b31]">
                      Appointments
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatSelectedDate(selectedDate)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/doctor/queue')}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#071b31] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#103b55]"
                >
                  Open Queue
                  <ArrowRight size={15} />
                </button>
              </div>

              {loadingAppointments ? (
                <div className="px-5 py-10 text-center text-sm text-slate-500">
                  Loading appointments for {formatSelectedDate(selectedDate)}...
                </div>
              ) : sortedAppointments.length === 0 ? (
                <div className="flex flex-col items-center px-5 py-9 text-center">
                  <CalendarDays className="mb-2 h-8 w-8 text-slate-400" />
                  <p className="text-sm font-semibold text-[#071b31]">
                    No appointments found
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    No appointments were returned for this date.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(getTodayBackendDate())}
                    className="mt-3 text-xs font-semibold text-cyan-800 hover:text-cyan-950"
                  >
                    Return to today
                  </button>
                </div>
              ) : (
                <div>
                  {sortedAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center gap-3 border-b border-[#edf2f6] px-5 py-4 last:border-b-0"
                    >
                      <div className="flex h-11 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-cyan-50 text-cyan-800">
                        <span className="text-[9px] font-bold uppercase">
                          Token
                        </span>
                        <span className="text-sm font-extrabold">
                          {appointment.tokenNumber}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#071b31]">
                          {appointment.patientName}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-slate-500">
                            {appointment.appointmentTime}
                          </span>
                          <span className="text-[11px] text-slate-400">·</span>
                          <span className="text-[11px] text-slate-500">
                            {appointment.priority || 'Normal'} priority
                          </span>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          isCompleted(appointment.status)
                            ? 'bg-emerald-50 text-emerald-700'
                            : isInProgress(appointment.status)
                              ? 'bg-cyan-50 text-cyan-800'
                              : isWaiting(appointment.status)
                                ? 'bg-amber-50 text-amber-700'
                                : appointment.status?.toUpperCase() === 'CANCELLED'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {(appointment.status || 'UNKNOWN').replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Doctor availability */}
          <aside className="rounded-2xl border border-[#dce7f0] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800">
                <Activity size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#071b31]">
                  Doctor status
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Manage your availability
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-[#e5edf4] bg-[#f8fbfd] p-4">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    activeStatusOption?.color || 'bg-slate-400'
                  }`}
                />
                <span className="text-sm font-bold text-[#071b31]">
                  {doctorStatus}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {activeStatusOption?.description}
              </p>
            </div>

            <div className="relative mt-4">
              <button
                type="button"
                disabled={statusSaving}
                onClick={() => setStatusMenuOpen((open) => !open)}
                className="flex w-full items-center justify-between rounded-xl border border-[#dce7f0] px-4 py-3 text-left transition hover:bg-[#f5fbfd] disabled:opacity-60"
              >
                <span className="text-sm font-semibold text-[#071b31]">
                  {statusSaving ? 'Updating status...' : 'Change status'}
                </span>
                <ChevronDown
                  size={17}
                  className={`text-slate-500 transition ${
                    statusMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {statusMenuOpen && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-[#dce7f0] bg-white p-2 shadow-xl">
                  {statusOptions.map((option) => {
                    const selected = doctorStatus === option.label;

                    return (
                      <button
                        type="button"
                        key={option.label}
                        onClick={() => void handleStatusChange(option.label)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition ${
                          selected ? 'bg-cyan-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${option.color}`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-[#071b31]">
                            {option.label}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-slate-500">
                            {option.description}
                          </span>
                        </span>
                        {selected && (
                          <Check size={16} className="text-cyan-700" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-5 space-y-3 border-t border-[#e5edf4] pt-5">
              <div className="flex items-start gap-3">
                <Building2 size={17} className="mt-0.5 text-cyan-800" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Department
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-[#071b31]">
                    {doctor?.department?.name || 'Not assigned'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 size={17} className="mt-0.5 text-cyan-800" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Hospital
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-[#071b31]">
                    {doctor?.hospital?.name || 'HospitalFlow'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-[#071b31] p-4 text-white">
              <div className="flex items-center gap-2 text-cyan-300">
                <Clock3 size={16} />
                <span className="text-xs font-semibold">Selected date</span>
              </div>
              <p className="mt-2 text-lg font-bold">
                {formatSelectedDate(selectedDate)}
              </p>
              <p className="mt-1 text-xs text-slate-300">
                {totalAppointments} appointments assigned
              </p>
            </div>
          </aside>
        </section>
      </div>
    </DoctorLayout>
  );
}
