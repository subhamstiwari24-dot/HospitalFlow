import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminLayout from '../../components/AdminLayout';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDoctorAppointments } from '../../components/Skeleton';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import PatientInitials from '../../components/PatientInitials';
import EmptyState, { EmptyIcons } from '../../components/EmptyState';
import { AdminApiError, getAdminAppointments, getAdminPayment } from '../../services/adminApi';
import type { AdminAppointment, AdminPayment } from '../../types/admin';

type DateFilter = 'TODAY' | 'ALL' | 'CUSTOM';
type StatusFilter = 'ALL' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const statusLabels: Record<string, string> = {
  WAITING: 'Waiting',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

function getTodayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).map((word) => word[0]).join('').slice(0, 2).toUpperCase();
}

function displayStatus(status: string) {
  return statusLabels[status.toUpperCase()] ?? status;
}

export default function AdminAppointmentsPage() {
  const navigate = useNavigate();
  const pageLoading = usePageLoad(500);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [payments, setPayments] = useState<Record<number, AdminPayment | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('TODAY');
  const [customDate, setCustomDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');
  const [doctorFilter, setDoctorFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminAppointments(controller.signal);
        setAppointments(data);

        const paymentEntries = await Promise.all(data.map(async (appointment) => {
          try {
            return [appointment.id, await getAdminPayment(appointment.id, controller.signal)] as const;
          } catch (paymentError) {
            if (paymentError instanceof AdminApiError && paymentError.status === 404) return [appointment.id, null] as const;
            throw paymentError;
          }
        }));
        setPayments(Object.fromEntries(paymentEntries));
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') return;
        if (loadError instanceof AdminApiError && loadError.status === 401) setError('Session expired. Please login again.');
        else if (loadError instanceof AdminApiError && loadError.status === 403) setError('You are not authorized to view appointments.');
        else setError('Unable to load appointments.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  const hospitals = useMemo(() => Array.from(new Set(appointments.map((appointment) => appointment.hospital?.name).filter((name): name is string => Boolean(name)))), [appointments]);
  const doctors = useMemo(() => Array.from(new Set(appointments.map((appointment) => appointment.doctor?.name).filter((name): name is string => Boolean(name)))), [appointments]);

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const selectedDate = dateFilter === 'TODAY' ? getTodayKey() : customDate;
    return appointments
      .filter((appointment) => dateFilter === 'ALL' || appointment.appointmentDate === selectedDate)
      .filter((appointment) => statusFilter === 'ALL' || appointment.status.toUpperCase() === statusFilter)
      .filter((appointment) => hospitalFilter === 'ALL' || appointment.hospital?.name === hospitalFilter)
      .filter((appointment) => doctorFilter === 'ALL' || appointment.doctor?.name === doctorFilter)
      .filter((appointment) => !normalizedSearch || appointment.patientName.toLowerCase().includes(normalizedSearch) || appointment.tokenNumber.toLowerCase().includes(normalizedSearch))
      .sort((first, second) => `${first.appointmentDate}${first.appointmentTime}`.localeCompare(`${second.appointmentDate}${second.appointmentTime}`));
  }, [appointments, dateFilter, customDate, statusFilter, hospitalFilter, doctorFilter, search]);

  const stats = [
    ['Total', filteredAppointments.length],
    ['Waiting', filteredAppointments.filter((appointment) => appointment.status === 'WAITING').length],
    ['In Progress', filteredAppointments.filter((appointment) => appointment.status === 'IN_PROGRESS').length],
    ['Completed', filteredAppointments.filter((appointment) => appointment.status === 'COMPLETED').length],
  ];

  const selectClass = 'bg-white border border-[#d8e1ec] rounded-[9px] px-[10px] py-[9px] text-[12px] text-[#142033]';

  if ((pageLoading || loading) && !error) return <AdminLayout title="Appointments"><SkDoctorAppointments /></AdminLayout>;

  return (
    <AdminLayout title="Appointments">
      <div className="flex flex-wrap items-start justify-between gap-[12px] mb-[20px]">
        <div><h1 className="font-bold text-[#142033] text-[24px] leading-tight">Appointments</h1><p className="text-[#526176] text-[14px] mt-[4px]">Live appointment records from HospitalFlow.</p></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[10px] mb-[20px]">
        {stats.map(([label, value]) => <div key={label} className="bg-white border border-[#d8e1ec] rounded-[12px] px-[14px] py-[13px]"><p className="font-bold text-[#155ead] text-[22px]">{value}</p><p className="text-[#526176] text-[12px]">{label}</p></div>)}
      </div>

      <div className="flex flex-wrap items-center gap-[10px] mb-[20px]">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patient or token" className={`${selectClass} w-full sm:w-[220px] outline-none focus:border-[#155ead]`} />
        <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value as DateFilter)} className={selectClass}><option value="TODAY">Today</option><option value="ALL">All dates</option><option value="CUSTOM">Custom date</option></select>
        {dateFilter === 'CUSTOM' && <input type="date" value={customDate} onChange={(event) => setCustomDate(event.target.value)} className={selectClass} />}
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className={selectClass}><option value="ALL">All statuses</option><option value="WAITING">Waiting</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select>
        <select value={hospitalFilter} onChange={(event) => setHospitalFilter(event.target.value)} className={selectClass}><option value="ALL">All hospitals</option>{hospitals.map((hospital) => <option key={hospital} value={hospital}>{hospital}</option>)}</select>
        <select value={doctorFilter} onChange={(event) => setDoctorFilter(event.target.value)} className={selectClass}><option value="ALL">All doctors</option>{doctors.map((doctor) => <option key={doctor} value={doctor}>{doctor}</option>)}</select>
      </div>

      {error ? <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-[10px] px-[16px] py-[14px] text-[#c53a45] text-[13px]">{error}</div> : filteredAppointments.length === 0 ? <EmptyState icon={EmptyIcons.calendar(28)} title="No appointments found." description="Try changing the date, status, or search filters." /> : (
        <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left"><thead className="bg-[#f4f7fb] border-b border-[#d8e1ec]"><tr>{['Token', 'Patient', 'Doctor', 'Hospital', 'Date / Time', 'Priority', 'Status', 'Payment', 'Action'].map((heading) => <th key={heading} className="px-[14px] py-[12px] text-[#7b899c] text-[10px] uppercase font-semibold">{heading}</th>)}</tr></thead>
            <tbody>{filteredAppointments.map((appointment) => <tr key={appointment.id} className="border-b border-[#d8e1ec] last:border-0 hover:bg-[#f8fbfe]">
              <td className="px-[14px] py-[13px] font-bold text-[#155ead] text-[12px]">{appointment.tokenNumber}</td>
              <td className="px-[14px] py-[13px]"><div className="flex items-center gap-2"><PatientInitials initials={getInitials(appointment.patientName)} size="sm" /><div><p className="font-semibold text-[#142033] text-[12px]">{appointment.patientName}</p><p className="text-[#7b899c] text-[11px]">{appointment.patientAge ?? 'Age not provided'} · {appointment.patientPhone ?? 'No phone'}</p></div></div></td>
              <td className="px-[14px] py-[13px] text-[#526176] text-[12px]">{appointment.doctor?.name ?? 'Not assigned'}</td>
              <td className="px-[14px] py-[13px] text-[#526176] text-[12px]">{appointment.hospital?.name ?? 'Not assigned'}</td>
              <td className="px-[14px] py-[13px] text-[#526176] text-[12px] whitespace-nowrap">{appointment.appointmentDate}<br />{appointment.appointmentTime}</td>
              <td className="px-[14px] py-[13px]"><StatusBadge status={appointment.priority} /></td>
              <td className="px-[14px] py-[13px]"><StatusBadge status={displayStatus(appointment.status)} /></td>
              <td className="px-[14px] py-[13px] text-[#526176] text-[12px]">{payments[appointment.id]?.paymentStatus ?? 'Not recorded'}</td>
              <td className="px-[14px] py-[13px]"><Button variant="secondary" onClick={() => navigate(`/admin/appointments/${appointment.id}`)}>View</Button></td>
            </tr>)}</tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}