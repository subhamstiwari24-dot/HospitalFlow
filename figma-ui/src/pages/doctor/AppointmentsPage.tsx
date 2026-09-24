import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/DoctorLayout';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDoctorAppointments } from '../../components/Skeleton';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import PatientInitials from '../../components/PatientInitials';
import { appointments } from '../../data/mockData';
import EmptyState, { EmptyIcons } from '../../components/EmptyState';

const imgCalendar1 = '/assets/a41a3.svg';

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const loading = usePageLoad(750);
  if (loading) return <DoctorLayout title="Appointments"><SkDoctorAppointments /></DoctorLayout>;

  return (
    <DoctorLayout title="Appointments">
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
            Thursday, 24 September 2026
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[10px] mb-[24px]">
        {[
          { label: 'Total', value: appointments.length, bg: 'bg-[#eaf3fd]', text: 'text-[#155ead]' },
          { label: 'Completed', value: appointments.filter(a => a.status === 'Completed').length, bg: 'bg-[#e8f7f1]', text: 'text-[#18865b]' },
          { label: 'In Progress', value: appointments.filter(a => a.status === 'In Progress').length, bg: 'bg-[#e8f7f1]', text: 'text-[#18865b]' },
          { label: 'Scheduled', value: appointments.filter(a => a.status === 'Scheduled').length, bg: 'bg-[#f4f7fb]', text: 'text-[#526176]' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} flex-1 flex flex-col items-center py-[16px] rounded-[14px]`}>
            <p className={`font-bold text-[24px] ${s.text}`}>{s.value}</p>
            <p className="font-normal text-[#526176] text-[12px]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Appointments — mobile card list */}
      <div className="sm:hidden bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden divide-y divide-[#d8e1ec]">
        {appointments.length === 0 ? (
          <EmptyState
            icon={EmptyIcons.calendar(28)}
            title="No appointments today"
            description="There are no appointments scheduled for today."
          />
        ) : appointments.map((appt) => (
          <div key={appt.id} className="p-[16px]">
            <div className="flex items-center gap-[10px] mb-[10px]">
              <div className="bg-[#eaf3fd] flex h-[30px] items-center justify-center rounded-[8px] w-[54px] shrink-0">
                <p className="font-bold text-[#155ead] text-[12px]">{appt.patient.token}</p>
              </div>
              <div className="flex items-center gap-[8px] flex-1 min-w-0">
                <PatientInitials initials={appt.patient.initials} size="sm" />
                <div className="min-w-0">
                  <p className="font-semibold text-[#142033] text-[14px] truncate">{appt.patient.name}</p>
                  <p className="font-normal text-[#7b899c] text-[11px]">Age {appt.patient.age} · {appt.patient.gender}</p>
                </div>
              </div>
              <StatusBadge status={appt.status} />
            </div>
            <div className="flex items-center justify-between gap-[10px]">
              <p className="font-normal text-[#526176] text-[12px] truncate">{appt.time} · {appt.type}</p>
              <Button variant="secondary" onClick={() => navigate('/doctor/patients')}>View</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Appointments — desktop table (sm+) */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_130px_130px_120px_100px] gap-[16px] px-[20px] py-[12px] bg-[#f4f7fb] border-b border-[#d8e1ec]">
            {['Token', 'Patient', 'Time', 'Type', 'Status', 'Action'].map((h) => (
              <p key={h} className="font-semibold text-[#7b899c] text-[11px] uppercase">{h}</p>
            ))}
          </div>
          {appointments.length === 0 ? (
            <EmptyState
              icon={EmptyIcons.calendar(28)}
              title="No appointments today"
              description="There are no appointments scheduled for today."
            />
          ) : appointments.map((appt) => (
            <div
              key={appt.id}
              className="grid grid-cols-[80px_1fr_130px_130px_120px_100px] gap-[16px] items-center px-[20px] py-[14px] border-b border-[#d8e1ec] last:border-0 hover:bg-[#f4f7fb] transition-colors"
            >
              <div className="bg-[#eaf3fd] flex h-[30px] items-center justify-center rounded-[8px] w-[54px]">
                <p className="font-bold text-[#155ead] text-[12px]">{appt.patient.token}</p>
              </div>
              <div className="flex gap-[10px] items-center min-w-0">
                <PatientInitials initials={appt.patient.initials} size="sm" />
                <div className="min-w-0">
                  <p className="font-semibold text-[#142033] text-[14px] truncate">{appt.patient.name}</p>
                  <p className="font-normal text-[#7b899c] text-[11px]">Age {appt.patient.age} · {appt.patient.gender}</p>
                </div>
              </div>
              <p className="font-semibold text-[#142033] text-[13px]">{appt.time}</p>
              <p className="font-normal text-[#526176] text-[13px] truncate">{appt.type}</p>
              <StatusBadge status={appt.status} />
              <Button variant="secondary" onClick={() => navigate('/doctor/patients')}>View</Button>
            </div>
          ))}
        </div>
      </div>
    </DoctorLayout>
  );
}
