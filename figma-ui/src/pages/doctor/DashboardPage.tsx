import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/DoctorLayout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import PatientInitials from '../../components/PatientInitials';
import { dashboardStats } from '../../data/mockData';
import { useQueue } from '../../context/QueueContext';
import type { DoctorStatus } from '../../types';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDoctorDashboard } from '../../components/Skeleton';

const imgUsers = '/assets/b6d92.svg';
const imgCalendar2 = '/assets/cd244.svg';
const imgCheckCircle = '/assets/18574.svg';
const imgCalendar1 = '/assets/a41a3.svg';
const imgMegaphone = '/assets/116f2.svg';
const imgChevronUp = '/assets/977fa.svg';
const imgIndicator = '/assets/4600b.svg';
const imgIndicator1 = '/assets/ade4c.svg';
const imgIndicator2 = '/assets/e633e.svg';
const imgIndicator3 = '/assets/38923.svg';
const imgIndicator4 = '/assets/2d7d4.svg';
const imgCheck = '/assets/a135e.svg';

const statusOptions: { label: DoctorStatus; icon: string }[] = [
  { label: 'Available', icon: imgIndicator1 },
  { label: 'Busy', icon: imgIndicator2 },
  { label: 'On Break', icon: imgIndicator3 },
  { label: 'Offline', icon: imgIndicator4 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentPatient, waitingPatients, completedCount, callNextPatient, completeConsultation, skipPatient, selectPatient } = useQueue();
  const [doctorStatus, setDoctorStatus] = useState<DoctorStatus>('Available');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const loading = usePageLoad(800);
  if (loading) return <DoctorLayout title="Live operations"><SkDoctorDashboard /></DoctorLayout>;

  const previewQueue = waitingPatients.slice(0, 3);
  const totalWaiting = waitingPatients.length;

  const handleViewPatient = () => {
    if (currentPatient) {
      selectPatient(currentPatient.id);
      navigate('/doctor/patients');
    }
  };

  const handleQueueRowClick = (id: string) => {
    selectPatient(id);
    navigate('/doctor/patients');
  };

  return (
    <DoctorLayout title="Live operations">
      {/* Welcome row */}
      <div className="flex items-end justify-between flex-wrap gap-3 mb-[20px]">
        <div>
          <h1 className="font-bold text-[#142033] text-[24px] leading-tight mb-[6px]">
            Good morning, Dr. Sharma
          </h1>
          <p className="font-normal text-[#526176] text-[14px]">
            Here's what's happening in your clinic today.
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-[10px] lg:gap-[14px] mb-[20px]">
        <StatCard
          icon={<img alt="" className="size-[20px]" src={imgUsers} />}
          iconBg="bg-[#6750a4]"
          label="Waiting"
          value={totalWaiting}
          sub={`${dashboardStats.priorityPatients} priority patients`}
        />
        <StatCard
          icon={<img alt="" className="size-[20px]" src={imgCalendar2} />}
          iconBg="bg-[#2475d0]"
          label="Today's Appointments"
          value={dashboardStats.todayAppointments}
          sub={`Next at ${dashboardStats.nextAppointment}`}
        />
        <StatCard
          icon={<img alt="" className="size-[20px]" src={imgCheckCircle} />}
          iconBg="bg-[#18865b]"
          label="Completed"
          value={completedCount}
          sub={`${Math.round((completedCount / dashboardStats.todayAppointments) * 100)}% of today's list`}
        />
      </div>

      {/* Operational overview */}
      <div className="flex flex-col lg:flex-row gap-[14px] lg:gap-[18px]">
        {/* Left: Current patient + queue preview */}
        <div className="flex flex-col gap-[18px] flex-1 min-w-0">

          {/* Current patient card */}
          {currentPatient ? (
            <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
              <div className="border-[#d8e1ec] border-b flex items-center justify-between px-[20px] py-[15px]">
                <div className="flex gap-[10px] items-center">
                  <div className="bg-[#18865b] h-[20px] rounded-[2px] shrink-0 w-[4px]" />
                  <p className="font-bold text-[#142033] text-[16px]">Current Patient</p>
                </div>
                <StatusBadge status="In consultation" showDot={false} />
              </div>

              <div className="flex gap-[18px] items-center p-[20px]">
                <PatientInitials initials={currentPatient.initials} size="lg" />
                <div className="flex flex-col gap-[5px] flex-1 min-w-0">
                  <p className="font-bold text-[#142033] text-[18px]">{currentPatient.name}</p>
                  <p className="font-normal text-[#526176] text-[12px]">
                    Age {currentPatient.age} · {currentPatient.gender} · {currentPatient.consultationType}
                  </p>
                  <p className="font-semibold text-[#155ead] text-[12px]">
                    Appointment {currentPatient.appointmentTime}
                  </p>
                </div>
                <div className="bg-[#f4f7fb] flex flex-col gap-[3px] items-center px-[16px] py-[11px] rounded-[12px] shrink-0">
                  <p className="font-bold text-[#7b899c] text-[9px]">TOKEN</p>
                  <p className="font-bold text-[#142033] text-[20px]">{currentPatient.token}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-[10px] items-center pb-[18px] px-[20px]">
                <Button variant="secondary" onClick={handleViewPatient}>View Patient</Button>
                <Button variant="success" onClick={() => { completeConsultation(); navigate('/doctor/queue'); }}>Complete</Button>
                <Button variant="danger" onClick={() => { skipPatient(); navigate('/doctor/queue'); }}>Skip</Button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[32px] flex flex-col items-center justify-center gap-[8px]">
              <p className="font-bold text-[#142033] text-[16px]">No Active Consultation</p>
              <p className="font-normal text-[#7b899c] text-[13px]">All patients have been seen.</p>
              <Button variant="primary" className="mt-[8px]" onClick={() => navigate('/doctor/appointments')}>View Appointments</Button>
            </div>
          )}

          {/* Queue preview */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] px-[20px] py-[16px]">
            <div className="flex flex-wrap items-center justify-between gap-[10px] mb-[12px]">
              <div>
                <p className="font-bold text-[#142033] text-[16px]">Current Queue</p>
                <p className="font-normal text-[#7b899c] text-[11px]">
                  {totalWaiting} patients waiting · Avg. wait 18 min
                </p>
              </div>
              <button
                onClick={() => navigate('/doctor/queue')}
                className="bg-[#155ead] flex gap-[8px] items-center px-[16px] py-[10px] rounded-[10px] cursor-pointer hover:bg-[#1250a0] transition-colors border border-[#155ead]"
              >
                <div className="relative shrink-0 size-[15px]">
                  <img alt="" className="absolute block inset-0 size-full" src={imgMegaphone} />
                </div>
                <p className="font-bold text-[13px] text-white whitespace-nowrap leading-none">Call Next Patient</p>
              </button>
            </div>

            {previewQueue.length === 0 ? (
              <div className="border-t border-[#d8e1ec] pt-[20px] text-center">
                <p className="font-normal text-[#7b899c] text-[13px]">Queue is empty</p>
              </div>
            ) : (
              previewQueue.map((patient, i) => (
                <div
                  key={patient.id}
                  className="border-[#d8e1ec] border-t flex gap-[14px] items-center py-[13px] cursor-pointer hover:bg-[#f4f7fb] -mx-[20px] px-[20px] transition-colors"
                  onClick={() => handleQueueRowClick(patient.id)}
                >
                  <div className={`flex flex-col h-[32px] items-center justify-center rounded-[8px] shrink-0 w-[54px] ${i === 0 ? 'bg-[#fff4de]' : 'bg-[#eaf3fd]'}`}>
                    <p className={`font-bold text-[12px] ${i === 0 ? 'text-[#a86508]' : 'text-[#155ead]'}`}>{patient.token}</p>
                  </div>
                  <div className="flex flex-col gap-[3px] flex-1 min-w-0">
                    <p className="font-normal text-[#142033] text-[14px]">{patient.name}</p>
                    <p className="font-normal text-[#7b899c] text-[11px]">Age {patient.age} · {patient.consultationType}</p>
                  </div>
                  <p className="font-semibold text-[#526176] text-[12px] whitespace-nowrap">{patient.appointmentTime}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Doctor status */}
        <div className="bg-white border border-[#d8e1ec] flex flex-col gap-[14px] items-start p-[18px] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] w-full lg:w-[300px] lg:shrink-0">
          <div className="flex flex-col gap-[8px] w-full">
            <p className="font-bold text-[#142033] text-[16px]">Doctor Status</p>
            <StatusBadge status={doctorStatus} />
          </div>

          <div className="bg-[#e8f7f1] flex flex-col gap-[10px] items-start p-[12px] rounded-[12px] w-full">
            <div className="relative shrink-0 size-[10px]">
              <img alt="" className="absolute block inset-0 size-full" src={imgIndicator} />
            </div>
            <div>
              <p className="font-bold text-[#18865b] text-[13px]">{doctorStatus}</p>
              <p className="font-normal text-[#526176] text-[10px]">Accepting next patient</p>
            </div>
          </div>

          <button
            onClick={() => setStatusMenuOpen(!statusMenuOpen)}
            className="border border-[#d8e1ec] flex items-center justify-between px-[12px] py-[10px] rounded-[8px] w-full cursor-pointer hover:bg-[#f4f7fb] transition-colors"
          >
            <p className="font-bold text-[#142033] text-[12px]">Change Status</p>
            <div className={`relative shrink-0 size-[14px] transition-transform ${statusMenuOpen ? '' : 'rotate-180'}`}>
              <img alt="" className="absolute block inset-0 size-full" src={imgChevronUp} />
            </div>
          </button>

          {statusMenuOpen && (
            <div className="bg-white border border-[#d8e1ec] flex flex-col gap-[2px] p-[6px] rounded-[12px] w-full">
              {statusOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => { setDoctorStatus(opt.label); setStatusMenuOpen(false); }}
                  className={`flex gap-[10px] items-center px-[12px] py-[9px] rounded-[8px] w-full cursor-pointer transition-colors ${
                    doctorStatus === opt.label ? 'bg-[#eaf3fd]' : 'bg-white hover:bg-[#f4f7fb]'
                  }`}
                >
                  <div className="relative shrink-0 size-[8px]">
                    <img alt="" className="absolute block inset-0 size-full" src={opt.icon} />
                  </div>
                  <p className={`text-[#142033] text-[13px] flex-1 text-left ${doctorStatus === opt.label ? 'font-bold' : 'font-medium'}`}>
                    {opt.label}
                  </p>
                  {doctorStatus === opt.label && (
                    <div className="relative shrink-0 size-[14px]">
                      <img alt="" className="absolute block inset-0 size-full" src={imgCheck} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="bg-[#f4f7fb] flex flex-col gap-[4px] items-start p-[12px] rounded-[8px] w-full">
            <p className="font-bold text-[#7b899c] text-[10px] uppercase">Next Break</p>
            <p className="font-normal text-[#142033] text-[13px]">12:30 PM · 30 minutes</p>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
