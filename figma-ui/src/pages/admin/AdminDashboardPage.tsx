import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import PatientInitials from '../../components/PatientInitials';
import Button from '../../components/Button';
import { useAdmin } from '../../context/AdminContext';
import { appointments, adminStats } from '../../data/mockData';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkAdminDashboard } from '../../components/Skeleton';

const imgUsers = '/assets/b6d92.svg';
const imgUsers2 = '/assets/014f4.svg';
const imgCalendar2 = '/assets/cd244.svg';
const imgCalendar1 = '/assets/a41a3.svg';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { doctors, departments } = useAdmin();
  const loading = usePageLoad(900);

  const available = doctors.filter((d) => d.status === 'Available').length;

  if (loading) return <AdminLayout title="Admin Dashboard"><SkAdminDashboard /></AdminLayout>;

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="flex flex-wrap items-start gap-[12px] justify-between mb-[20px]">
        <div>
          <h1 className="font-bold text-[#142033] text-[24px] leading-tight mb-[6px]">
            Good morning, Admin
          </h1>
          <p className="font-normal text-[#526176] text-[14px]">
            North Campus overview for today.
          </p>
        </div>
        <div className="bg-white border border-[#d8e1ec] flex gap-[8px] items-center px-[14px] py-[9px] rounded-[8px]">
          <div className="relative shrink-0 size-[15px]">
            <img alt="" className="absolute block inset-0 size-full" src={imgCalendar1} />
          </div>
          <p className="font-semibold text-[#142033] text-[12px] whitespace-nowrap">
            Thursday, 24 September 2026
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[14px] mb-[24px]">
        <StatCard
          icon={<img alt="" className="size-[20px]" src={imgUsers2} />}
          iconBg="bg-[#2475d0]"
          label="Total Doctors"
          value={doctors.length}
          sub={`${available} available now`}
        />
        <StatCard
          icon={<img alt="" className="size-[20px]" src={imgUsers} />}
          iconBg="bg-[#6750a4]"
          label="Departments"
          value={departments.length}
          sub="Active across campus"
        />
        <StatCard
          icon={<img alt="" className="size-[20px]" src={imgCalendar2} />}
          iconBg="bg-[#155ead]"
          label="Today's Appointments"
          value={adminStats.todayAppointments}
          sub={`${adminStats.completedToday} completed`}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-[14px] lg:gap-[18px]">
        {/* Doctor status table */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">
            <div className="px-[20px] py-[16px] border-b border-[#d8e1ec] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#142033] text-[16px]">Doctor Status</p>
                <p className="font-normal text-[#7b899c] text-[11px] mt-[2px]">Real-time availability</p>
              </div>
              <Button
                variant="secondary"
                onClick={() => navigate('/admin/doctors')}
              >
                Manage Doctors →
              </Button>
            </div>
            <div className="grid grid-cols-[1fr_140px_110px_80px] gap-[16px] px-[20px] py-[10px] bg-[#f4f7fb] border-b border-[#d8e1ec]">
              {['Doctor', 'Specialization', 'Status', 'Patients'].map((h) => (
                <p key={h} className="font-semibold text-[#7b899c] text-[11px] uppercase">{h}</p>
              ))}
            </div>
            {doctors.slice(0, 6).map((doc) => (
              <div
                key={doc.id}
                className="grid grid-cols-[1fr_140px_110px_80px] gap-[16px] items-center px-[20px] py-[12px] border-b border-[#d8e1ec] last:border-0 hover:bg-[#f4f7fb] transition-colors cursor-pointer"
                onClick={() => navigate('/admin/doctors')}
              >
                <div className="flex gap-[10px] items-center min-w-0">
                  <div className="bg-[#eaf3fd] flex items-center justify-center rounded-[999px] shrink-0 size-[32px]">
                    <p className="font-bold text-[#155ead] text-[11px]">
                      {doc.name.replace('Dr. ', '').split(' ').map((w) => w[0]).join('').slice(0, 2)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#142033] text-[13px] truncate">{doc.name}</p>
                    <p className="font-normal text-[#7b899c] text-[11px]">{doc.room}</p>
                  </div>
                </div>
                <p className="font-normal text-[#526176] text-[13px] truncate">{doc.specialization}</p>
                <StatusBadge status={doc.status} />
                <p className="font-bold text-[#142033] text-[14px]">{doc.patients}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="w-full lg:w-[300px] lg:shrink-0 flex flex-col gap-[14px]">
          {/* Departments summary */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
            <div className="flex items-center justify-between mb-[14px]">
              <p className="font-bold text-[#142033] text-[15px]">Departments</p>
              <button
                onClick={() => navigate('/admin/departments')}
                className="text-[#155ead] text-[12px] font-semibold cursor-pointer hover:opacity-80"
              >
                View all →
              </button>
            </div>
            {departments.slice(0, 4).map((dept) => (
              <div
                key={dept.id}
                className="flex items-center justify-between py-[9px] border-t border-[#d8e1ec] first:border-0 cursor-pointer hover:bg-[#f4f7fb] -mx-[18px] px-[18px] rounded-[8px] transition-colors"
                onClick={() => navigate(`/admin/departments/${dept.id}`)}
              >
                <div className="flex gap-[8px] items-center min-w-0">
                  <div className="bg-[#eaf3fd] flex items-center justify-center rounded-[10px] size-[28px] shrink-0">
                    <p className="font-bold text-[#155ead] text-[10px]">
                      {dept.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                    </p>
                  </div>
                  <p className="font-semibold text-[#142033] text-[13px] truncate">{dept.name}</p>
                </div>
                <div className="flex items-center gap-[8px] shrink-0">
                  <p className="font-normal text-[#7b899c] text-[11px]">{dept.doctors} drs</p>
                  <StatusBadge status={dept.status} showDot={false} />
                </div>
              </div>
            ))}
          </div>

          {/* Today's appointments */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
            <p className="font-bold text-[#142033] text-[15px] mb-[14px]">Today's Appointments</p>
            {appointments.slice(0, 4).map((appt) => (
              <div key={appt.id} className="flex gap-[10px] items-center py-[10px] border-t border-[#d8e1ec] first:border-0">
                <PatientInitials initials={appt.patient.initials} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#142033] text-[13px] truncate">{appt.patient.name}</p>
                  <p className="font-normal text-[#7b899c] text-[11px]">{appt.time} · {appt.type}</p>
                </div>
                <StatusBadge status={appt.status} showDot={false} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
