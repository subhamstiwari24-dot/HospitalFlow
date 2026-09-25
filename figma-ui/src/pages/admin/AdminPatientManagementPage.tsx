import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import EmptyState, { EmptyIcons } from '../../components/EmptyState';
import PatientInitials from '../../components/PatientInitials';
import StatusBadge from '../../components/StatusBadge';
import { SkDoctorAppointments } from '../../components/Skeleton';
import { usePageLoad } from '../../hooks/usePageLoad';

type PatientStatus = 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled' | 'Skipped';
type StatusFilter = 'All' | PatientStatus;

interface BackendAppointment {
  id: number;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: string;
  status: string;
  doctor?: { name?: string | null } | null;
}

interface PatientAppointment extends BackendAppointment {
  status: PatientStatus;
  initials: string;
  doctorName: string;
}

const statusMap: Record<string, PatientStatus> = {
  WAITING: 'Waiting',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  SKIPPED: 'Skipped',
};

const statusFilters: StatusFilter[] = ['All', 'Waiting', 'In Progress', 'Completed', 'Cancelled', 'Skipped'];

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

export default function AdminPatientManagementPage() {
  const navigate = useNavigate();
  const pageLoading = usePageLoad(650);
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAppointments() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/appointments', { signal: controller.signal });
        if (!response.ok) throw new Error(`Unable to load patients (${response.status})`);

        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error('The appointments response was invalid.');

        setAppointments((data as BackendAppointment[]).map((appointment) => ({
          ...appointment,
          status: statusMap[appointment.status.toUpperCase()] ?? 'Waiting',
          initials: getInitials(appointment.patientName),
          doctorName: appointment.doctor?.name ?? 'Doctor not assigned',
        })));
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load patients.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void fetchAppointments();
    return () => controller.abort();
  }, []);

  const todayAppointments = appointments.filter((appointment) => appointment.appointmentDate === getTodayKey());
  const normalizedSearch = search.trim().toLowerCase();
  const filteredAppointments = todayAppointments.filter((appointment) => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(normalizedSearch)
      || appointment.tokenNumber.toLowerCase().includes(normalizedSearch);
    const matchesStatus = statusFilter === 'All' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if ((pageLoading || loading) && !error) {
    return <AdminLayout title="Patient Management"><SkDoctorAppointments /></AdminLayout>;
  }

  return (
    <AdminLayout title="Patient Management">
      <div className="flex flex-wrap items-start gap-[12px] justify-between mb-[24px]">
        <div>
          <h1 className="font-bold text-[#142033] text-[24px] leading-tight">Patient Management</h1>
          <p className="font-normal text-[#526176] text-[14px] mt-[4px]">Today's patients</p>
        </div>
        <p className="font-semibold text-[#526176] text-[13px]">{todayAppointments.length} patients today</p>
      </div>

      <div className="flex items-center gap-[12px] mb-[20px] flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by patient name or token"
          className="bg-white border border-[#d8e1ec] rounded-[10px] px-[14px] py-[10px] text-[14px] text-[#142033] placeholder:text-[#afc0d3] outline-none focus:border-[#155ead] transition-colors w-[280px]"
        />
        <div className="flex gap-[6px] flex-wrap">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-[14px] py-[8px] rounded-[8px] text-[13px] font-semibold transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#155ead] text-white'
                  : 'bg-white border border-[#d8e1ec] text-[#526176] hover:bg-[#f4f7fb]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">
        {error ? (
          <div className="px-[20px] py-[36px] text-center">
            <p className="font-semibold text-[#c53a45] text-[14px]">{error}</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <EmptyState
            icon={EmptyIcons.queue(28)}
            title={todayAppointments.length === 0 ? 'No patients today' : 'No matching patients'}
            description={todayAppointments.length === 0 ? 'There are no appointments scheduled for today.' : 'Try changing the search or status filter.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[90px_1.4fr_1.2fr_130px_120px_90px] gap-[16px] px-[20px] py-[10px] bg-[#f4f7fb] border-b border-[#d8e1ec]">
                {['Token', 'Patient', 'Doctor', 'Time', 'Status', 'Action'].map((heading) => (
                  <p key={heading} className="font-semibold text-[#7b899c] text-[11px] uppercase">{heading}</p>
                ))}
              </div>
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="grid grid-cols-[90px_1.4fr_1.2fr_130px_120px_90px] gap-[16px] items-center px-[20px] py-[14px] border-b border-[#d8e1ec] last:border-0 hover:bg-[#f4f7fb] transition-colors">
                  <p className="font-bold text-[#155ead] text-[13px]">{appointment.tokenNumber}</p>
                  <div className="flex gap-[10px] items-center min-w-0">
                    <PatientInitials initials={appointment.initials} size="sm" />
                    <p className="font-semibold text-[#142033] text-[14px] truncate">{appointment.patientName}</p>
                  </div>
                  <p className="font-normal text-[#526176] text-[13px] truncate">{appointment.doctorName}</p>
                  <p className="font-semibold text-[#142033] text-[13px]">{appointment.appointmentTime}</p>
                  <StatusBadge status={appointment.status} />
                  <Button variant="secondary" onClick={() => navigate(`/admin/patients/${appointment.id}`)}>View</Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}