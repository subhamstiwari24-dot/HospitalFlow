import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/DoctorLayout';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDoctorQueue } from '../../components/Skeleton';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import PatientInitials from '../../components/PatientInitials';
import { useQueue } from '../../context/QueueContext';
import EmptyState, { EmptyIcons } from '../../components/EmptyState';

const imgMegaphone = '/assets/116f2.svg';

export default function QueuePage() {
  const navigate = useNavigate();
  const {
    queue,
    currentPatient,
    waitingPatients,
    completedCount,
    callNextPatient,
    completeConsultation,
    skipPatient,
    selectPatient,
  } = useQueue();

  const loading = usePageLoad(700);
  if (loading) return <DoctorLayout title="Queue"><SkDoctorQueue /></DoctorLayout>;

  const handlePatientClick = (id: string) => {
    selectPatient(id);
    navigate('/doctor/patients');
  };

  const handleViewCurrent = () => {
    if (currentPatient) {
      selectPatient(currentPatient.id);
      navigate('/doctor/patients');
    }
  };

  const skippedPatients = queue.filter((p) => p.consultationStatus === 'Skipped');
  const completedPatients = queue.filter((p) => p.consultationStatus === 'Completed');

  return (
    <DoctorLayout title="Queue">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-[24px]">
        <div>
          <h1 className="font-bold text-[#142033] text-[24px] leading-tight">Doctor Queue</h1>
          <p className="font-normal text-[#526176] text-[14px] mt-[4px]">
            Manage your patient queue for today
          </p>
        </div>
        <button
          onClick={callNextPatient}
          disabled={waitingPatients.length === 0}
          className="bg-[#155ead] flex gap-[8px] items-center px-[16px] py-[10px] rounded-[10px] cursor-pointer hover:bg-[#1250a0] transition-colors border border-[#155ead] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div className="relative shrink-0 size-[16px]">
            <img alt="" className="absolute block inset-0 size-full" src={imgMegaphone} />
          </div>
          <p className="font-bold text-[13px] text-white leading-none">Call Next Patient</p>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-[14px] lg:gap-[18px]">
        {/* Left: Current + waiting queue */}
        <div className="flex-1 min-w-0 flex flex-col gap-[18px]">

          {/* Current patient */}
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
                <div className="flex flex-col gap-[5px] flex-1">
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
                <Button variant="secondary" onClick={handleViewCurrent}>
                  Patient Details
                </Button>
                <Button variant="success" onClick={completeConsultation}>
                  Complete Consultation
                </Button>
                <Button variant="danger" onClick={skipPatient}>
                  Skip Patient
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[32px] flex flex-col items-center gap-[8px]">
              <p className="font-bold text-[#142033] text-[16px]">No Active Consultation</p>
              <p className="font-normal text-[#7b899c] text-[13px]">
                {waitingPatients.length > 0 ? 'Press "Call Next Patient" to begin.' : 'All patients have been seen today.'}
              </p>
            </div>
          )}

          {/* Waiting queue */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
            <div className="px-[20px] py-[16px] border-b border-[#d8e1ec]">
              <p className="font-bold text-[#142033] text-[16px]">Waiting Queue</p>
              <p className="font-normal text-[#7b899c] text-[11px] mt-[2px]">
                {waitingPatients.length} patients waiting · Avg. wait 18 min
              </p>
            </div>

            {waitingPatients.length === 0 ? (
              <EmptyState
                icon={EmptyIcons.queue(28)}
                title="Queue is clear"
                description="All patients have been seen. Waiting for new arrivals."
              />
            ) : (
              waitingPatients.map((patient, i) => (
                <div
                  key={patient.id}
                  className="border-t border-[#d8e1ec] flex gap-[14px] items-center px-[20px] py-[13px] cursor-pointer hover:bg-[#f4f7fb] transition-colors"
                  onClick={() => handlePatientClick(patient.id)}
                >
                  <div className={`flex flex-col h-[32px] items-center justify-center rounded-[8px] shrink-0 w-[54px] ${i === 0 ? 'bg-[#fff4de]' : 'bg-[#eaf3fd]'}`}>
                    <p className={`font-bold text-[12px] ${i === 0 ? 'text-[#a86508]' : 'text-[#155ead]'}`}>
                      {patient.token}
                    </p>
                  </div>
                  <div className="flex flex-col gap-[3px] flex-1 min-w-0">
                    <p className="font-normal text-[#142033] text-[14px]">{patient.name}</p>
                    <p className="font-normal text-[#7b899c] text-[11px]">
                      Age {patient.age} · {patient.consultationType}
                    </p>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    {patient.priority === 'Priority' && <StatusBadge status="Priority" />}
                    <p className="font-semibold text-[#526176] text-[12px] whitespace-nowrap">
                      {patient.appointmentTime}
                    </p>
                  </div>
                </div>
              ))
            )}

            {/* Skipped patients (re-appended at bottom) */}
            {skippedPatients.length > 0 && (
              <>
                <div className="border-t border-[#d8e1ec] px-[20px] py-[10px] bg-[#f4f7fb]">
                  <p className="font-semibold text-[#7b899c] text-[11px] uppercase">Skipped</p>
                </div>
                {skippedPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="border-t border-[#d8e1ec] flex gap-[14px] items-center px-[20px] py-[13px] opacity-60 cursor-pointer hover:bg-[#f4f7fb] transition-colors"
                    onClick={() => handlePatientClick(patient.id)}
                  >
                    <div className="flex flex-col h-[32px] items-center justify-center rounded-[8px] shrink-0 w-[54px] bg-[#f4f7fb]">
                      <p className="font-bold text-[12px] text-[#7b899c]">{patient.token}</p>
                    </div>
                    <div className="flex flex-col gap-[3px] flex-1 min-w-0">
                      <p className="font-normal text-[#142033] text-[14px]">{patient.name}</p>
                      <p className="font-normal text-[#7b899c] text-[11px]">Age {patient.age} · {patient.consultationType}</p>
                    </div>
                    <StatusBadge status="Waiting" />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right: Queue summary */}
        <div className="w-full lg:w-[280px] lg:shrink-0 flex flex-col gap-[14px]">
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
            <p className="font-bold text-[#142033] text-[15px] mb-[14px]">Queue Summary</p>
            <div className="flex flex-col gap-[10px]">
              {[
                { label: 'Total today', value: queue.length, color: 'text-[#142033]' },
                { label: 'Waiting', value: waitingPatients.length, color: 'text-[#a86508]' },
                { label: 'Completed', value: completedCount, color: 'text-[#18865b]' },
                { label: 'Skipped', value: skippedPatients.length, color: 'text-[#526176]' },
                { label: 'Avg. wait time', value: '18 min', color: 'text-[#155ead]' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-[4px] border-b border-[#f4f7fb] last:border-0">
                  <p className="font-normal text-[#526176] text-[13px]">{row.label}</p>
                  <p className={`font-bold text-[14px] ${row.color}`}>{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Priority patients */}
          {queue.filter(p => p.priority === 'Priority' && p.consultationStatus === 'Waiting').length > 0 && (
            <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
              <p className="font-bold text-[#142033] text-[15px] mb-[14px]">Priority Patients</p>
              {queue.filter(p => p.priority === 'Priority' && p.consultationStatus === 'Waiting').map(p => (
                <div
                  key={p.id}
                  className="flex gap-[10px] items-center py-[8px] border-t border-[#d8e1ec] first:border-0 cursor-pointer hover:bg-[#f4f7fb] -mx-[18px] px-[18px] rounded-[8px] transition-colors"
                  onClick={() => handlePatientClick(p.id)}
                >
                  <PatientInitials initials={p.initials} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#142033] text-[13px] truncate">{p.name}</p>
                    <p className="font-normal text-[#7b899c] text-[11px]">{p.token}</p>
                  </div>
                  <StatusBadge status="Priority" />
                </div>
              ))}
            </div>
          )}

          {/* Completed log */}
          {completedPatients.length > 0 && (
            <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
              <p className="font-bold text-[#142033] text-[15px] mb-[14px]">Completed</p>
              {completedPatients.map(p => (
                <div key={p.id} className="flex gap-[10px] items-center py-[8px] border-t border-[#d8e1ec] first:border-0">
                  <PatientInitials initials={p.initials} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#142033] text-[13px] truncate">{p.name}</p>
                    <p className="font-normal text-[#7b899c] text-[11px]">{p.token}</p>
                  </div>
                  <StatusBadge status="Completed" showDot={false} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
}
