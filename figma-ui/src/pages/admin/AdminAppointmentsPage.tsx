import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDoctorAppointments } from '../../components/Skeleton';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import PatientInitials from '../../components/PatientInitials';
import EmptyState, { EmptyIcons } from '../../components/EmptyState';
import type { AppointmentStatus } from '../../types';

const imgCalendar1 = '/assets/a41a3.svg';

type AdminAppointmentStatus = AppointmentStatus | 'Skipped';

interface BackendAppointment {
  id: number;
  patientName: string;
  patientPhone?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: string;
  status: string;
  priority: string;
  doctor: Record<string, unknown> | null;
  hospital: Record<string, unknown> | null;
}

interface AdminAppointment extends BackendAppointment {
  status: AdminAppointmentStatus;
  initials: string;
}

const statusMap: Record<string, AdminAppointmentStatus> = {
  WAITING: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  SKIPPED: 'Skipped',
};

function getTodayKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getTimeSortValue(value: string): number {
  const normalized = value.trim().toUpperCase();
  const match = normalized.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/);
  if (!match) return Number.MAX_SAFE_INTEGER;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (match[3] === 'AM' && hours === 12) hours = 0;
  if (match[3] === 'PM' && hours !== 12) hours += 12;
  return hours * 60 + minutes;
}

export default function AdminAppointmentsPage() {
  const navigate = useNavigate();
  const pageLoading = usePageLoad(750);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAppointments() {
      try {
        setAppointmentsLoading(true);
        setError(null);
        const response = await fetch('/api/appointments', { signal: controller.signal });
        if (!response.ok) throw new Error(`Unable to load appointments (${response.status})`);

        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error('The appointments response was invalid.');

        setAppointments((data as BackendAppointment[]).map((appointment) => ({
          ...appointment,
          status: statusMap[appointment.status.toUpperCase()] ?? 'Scheduled',
          initials: getInitials(appointment.patientName),
        })));
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load appointments.');
      } finally {
        if (!controller.signal.aborted) setAppointmentsLoading(false);
      }
    }

    void fetchAppointments();
    return () => controller.abort();
  }, []);

  const todayKey = getTodayKey();
  const formattedToday = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  const todaysAppointments = appointments
    .filter((appointment) => appointment.appointmentDate === todayKey)
    .sort((first, second) => {
      const timeDifference = getTimeSortValue(first.appointmentTime) - getTimeSortValue(second.appointmentTime);
      return timeDifference || first.id - second.id;
    });

  const stats = [
    { label: 'Total', value: todaysAppointments.length, bg: 'bg-[#eaf3fd]', text: 'text-[#155ead]' },
    { label: 'Completed', value: todaysAppointments.filter((appointment) => appointment.status === 'Completed').length, bg: 'bg-[#e8f7f1]', text: 'text-[#18865b]' },
    { label: 'In Progress', value: todaysAppointments.filter((appointment) => appointment.status === 'In Progress').length, bg: 'bg-[#e8f7f1]', text: 'text-[#18865b]' },
    { label: 'Scheduled', value: todaysAppointments.filter((appointment) => appointment.status === 'Scheduled').length, bg: 'bg-[#f4f7fb]', text: 'text-[#526176]' },
  ];

  const renderEmptyState = () => (
    <EmptyState
      icon={EmptyIcons.calendar(28)}
      title="No appointments scheduled for today."
      description="There are no appointments scheduled for today."
    />
  );

  const renderError = () => (
    <div className="px-[20px] py-[32px] text-center">
      <p className="font-semibold text-[#c53a45] text-[14px]">{error}</p>
    </div>
  );

  if ((pageLoading || appointmentsLoading) && !error) return <AdminLayout title="Appointments"><SkDoctorAppointments /></AdminLayout>;

  return (
    <AdminLayout title="Appointments">
      <div className="flex flex-wrap items-start gap-[12px] justify-between mb-[24px]">
        <div>
          <h1 className="font-bold text-[#142033] text-[24px] leading-tight">Appointments</h1>
          <p className="font-normal text-[#526176] text-[14px] mt-[4px]">
            Today's scheduled appointments
          </p>
        </div>
        <div className="bg-white border border-[#d8e1ec] flex gap-[8px] items-center px-[14px] py-[9px] rounded-[8px] shrink-0">
          <div className="relative shrink-0 size-[15px]">
            <img alt="" className="absolute block inset-0 size-full" src={imgCalendar1} />
          </div>
          <p className="font-semibold text-[#142033] text-[12px] whitespace-nowrap">
            {formattedToday}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[10px] mb-[24px]">
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.bg} flex-1 flex flex-col items-center py-[16px] rounded-[14px]`}>
            <p className={`font-bold text-[24px] ${stat.text}`}>{stat.value}</p>
            <p className="font-normal text-[#526176] text-[12px]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Appointments — mobile card list */}
      <div className="sm:hidden bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden divide-y divide-[#d8e1ec]">
        {error ? renderError() : appointmentsLoading ? (
          <div className="px-[20px] py-[32px] text-center text-[#7b899c] text-[14px]">Loading appointments...</div>
        ) : todaysAppointments.length === 0 ? renderEmptyState() : todaysAppointments.map((appointment) => (
          <div key={appointment.id} className="p-[16px]">
            <div className="flex items-center gap-[10px] mb-[10px]">
              <div className="bg-[#eaf3fd] flex h-[30px] items-center justify-center rounded-[8px] w-[54px] shrink-0">
                <p className="font-bold text-[#155ead] text-[12px]">{appointment.tokenNumber}</p>
              </div>
              <div className="flex items-center gap-[8px] flex-1 min-w-0">
                <PatientInitials initials={appointment.initials} size="sm" />
                <div className="min-w-0">
                  <p className="font-semibold text-[#142033] text-[14px] truncate">{appointment.patientName}</p>
                  <p className="font-normal text-[#7b899c] text-[11px]">OPD Patient</p>
                </div>
              </div>
              <StatusBadge status={appointment.status} />
            </div>
            <div className="flex items-center justify-between gap-[10px]">
              <p className="font-normal text-[#526176] text-[12px] truncate">{appointment.appointmentTime} · OPD Consultation</p>
              <Button variant="secondary" onClick={() => navigate(`/admin/appointments/${appointment.id}`)}>View</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Appointments — desktop table (sm+) */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_130px_130px_120px_100px] gap-[16px] px-[20px] py-[12px] bg-[#f4f7fb] border-b border-[#d8e1ec]">
            {['Token', 'Patient', 'Time', 'Type', 'Status', 'Action'].map((heading) => (
              <p key={heading} className="font-semibold text-[#7b899c] text-[11px] uppercase">{heading}</p>
            ))}
          </div>
          {error ? renderError() : appointmentsLoading ? (
            <div className="px-[20px] py-[32px] text-center text-[#7b899c] text-[14px]">Loading appointments...</div>
          ) : todaysAppointments.length === 0 ? renderEmptyState() : todaysAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="grid grid-cols-[80px_1fr_130px_130px_120px_100px] gap-[16px] items-center px-[20px] py-[14px] border-b border-[#d8e1ec] last:border-0 hover:bg-[#f4f7fb] transition-colors"
            >
              <div className="bg-[#eaf3fd] flex h-[30px] items-center justify-center rounded-[8px] w-[54px]">
                <p className="font-bold text-[#155ead] text-[12px]">{appointment.tokenNumber}</p>
              </div>
              <div className="flex gap-[10px] items-center min-w-0">
                <PatientInitials initials={appointment.initials} size="sm" />
                <div className="min-w-0">
                  <p className="font-semibold text-[#142033] text-[14px] truncate">{appointment.patientName}</p>
                  <p className="font-normal text-[#7b899c] text-[11px]">OPD Patient</p>
                </div>
              </div>
              <p className="font-semibold text-[#142033] text-[13px]">{appointment.appointmentTime}</p>
              <p className="font-normal text-[#526176] text-[13px] truncate">OPD Consultation</p>
              <StatusBadge status={appointment.status} />
              <Button variant="secondary" onClick={() => navigate(`/admin/appointments/${appointment.id}`)}>View</Button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}