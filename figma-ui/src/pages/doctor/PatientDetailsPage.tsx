import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/DoctorLayout';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkPatientDetails } from '../../components/Skeleton';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import PatientInitials from '../../components/PatientInitials';
import { useQueue } from '../../context/QueueContext';
import { patients } from '../../data/mockData';
import EmptyState, { EmptyIcons } from '../../components/EmptyState';

export default function PatientDetailsPage() {
  const navigate = useNavigate();
  const { selectedPatientId, currentPatient, queue, startConsultation, selectPatient } = useQueue();

  const loading = usePageLoad(650);
  if (loading) return <DoctorLayout title="Patient Details"><SkPatientDetails /></DoctorLayout>;

  // Resolve which patient to show: selected > current > first in queue > first mock patient
  const patient =
    (selectedPatientId ? queue.find((p) => p.id === selectedPatientId) : null) ??
    currentPatient ??
    queue[0] ??
    patients[0];

  if (!patient) {
    return (
      <DoctorLayout title="Patient Details">
        <div className="flex flex-col items-center justify-center py-[64px] gap-[12px]">
          <p className="font-bold text-[#142033] text-[18px]">No patient selected</p>
          <Button variant="secondary" onClick={() => navigate('/doctor/queue')}>Back to Queue</Button>
        </div>
      </DoctorLayout>
    );
  }

  const isCurrentlyActive = currentPatient?.id === patient.id;
  const isWaiting = patient.consultationStatus === 'Waiting';
  const isCompleted = patient.consultationStatus === 'Completed';
  const isSkipped = patient.consultationStatus === 'Skipped';

  const handleStartConsultation = () => {
    startConsultation(patient.id);
    navigate('/doctor/queue');
  };

  const otherPatients = queue.filter(
    (p) => p.id !== patient.id && p.consultationStatus === 'Waiting'
  ).slice(0, 4);

  return (
    <DoctorLayout title="Patient Details">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-[8px] text-[#155ead] text-[13px] font-semibold mb-[20px] cursor-pointer hover:opacity-80 transition-opacity"
      >
        ← Back
      </button>

      <div className="flex flex-col lg:flex-row gap-[14px] lg:gap-[18px]">
        {/* Left: Patient info */}
        <div className="flex flex-col gap-[18px] flex-1 min-w-0">

          {/* Header card */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[24px]">
            <div className="flex gap-[16px] items-start flex-wrap">
              <PatientInitials initials={patient.initials} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[12px] mb-[6px] flex-wrap">
                  <h1 className="font-bold text-[#142033] text-[22px]">{patient.name}</h1>
                  {patient.priority !== 'Normal' && <StatusBadge status={patient.priority} />}
                  {isCurrentlyActive && <StatusBadge status="In consultation" showDot={false} />}
                  {isCompleted && <StatusBadge status="Completed" showDot={false} />}
                  {isSkipped && <StatusBadge status="Waiting" />}
                </div>
                <p className="font-normal text-[#526176] text-[13px] mb-[4px]">
                  Age {patient.age} · {patient.gender} · {patient.bloodGroup ?? 'N/A'}
                </p>
                <p className="font-normal text-[#7b899c] text-[12px]">
                  {patient.phone ?? '—'} · {patient.email ?? '—'}
                </p>
              </div>
              <div className="bg-[#f4f7fb] flex flex-col gap-[3px] items-center px-[16px] py-[11px] rounded-[12px] shrink-0">
                <p className="font-bold text-[#7b899c] text-[9px]">TOKEN</p>
                <p className="font-bold text-[#142033] text-[20px]">{patient.token}</p>
              </div>
            </div>

            <div className="flex gap-[10px] mt-[20px] pt-[18px] border-t border-[#d8e1ec] flex-wrap">
              {isWaiting && !isCurrentlyActive && (
                <Button variant="primary" onClick={handleStartConsultation}>
                  Start Consultation
                </Button>
              )}
              {isCurrentlyActive && (
                <Button variant="success" onClick={() => navigate('/doctor/queue')}>
                  Back to Consultation
                </Button>
              )}
              <Button variant="secondary">Edit Record</Button>
              <Button variant="ghost">Print Summary</Button>
            </div>
          </div>

          {/* Vitals */}
          {patient.vitals && (
            <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[20px]">
              <div className="flex items-center gap-[10px] mb-[16px]">
                <div className="bg-[#18865b] h-[20px] rounded-[2px] shrink-0 w-[4px]" />
                <p className="font-bold text-[#142033] text-[16px]">Vitals</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-[14px]">
                {[
                  { label: 'Blood Pressure', value: patient.vitals.bp, unit: 'mmHg' },
                  { label: 'Pulse Rate', value: patient.vitals.pulse, unit: 'bpm' },
                  { label: 'Temperature', value: patient.vitals.temp, unit: '' },
                  { label: 'SpO₂', value: `${patient.vitals.spo2}%`, unit: '' },
                ].map((v) => (
                  <div key={v.label} className="bg-[#f4f7fb] rounded-[12px] p-[14px]">
                    <p className="font-normal text-[#7b899c] text-[11px] mb-[6px]">{v.label}</p>
                    <p className="font-bold text-[#142033] text-[20px] leading-none">{v.value}</p>
                    {v.unit && <p className="font-normal text-[#afc0d3] text-[10px] mt-[2px]">{v.unit}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical history */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[20px]">
            <div className="flex items-center gap-[10px] mb-[16px]">
              <div className="bg-[#2475d0] h-[20px] rounded-[2px] shrink-0 w-[4px]" />
              <p className="font-bold text-[#142033] text-[16px]">Medical History</p>
            </div>
            {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
              <div className="flex flex-col gap-[8px]">
                {patient.medicalHistory.map((item, i) => (
                  <div key={i} className="flex items-center gap-[10px] py-[8px] border-b border-[#d8e1ec] last:border-0">
                    <div className="size-[6px] rounded-full bg-[#526176] shrink-0" />
                    <p className="font-normal text-[#526176] text-[14px]">{item}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={EmptyIcons.file(20)}
                title="No previous visits"
                description="No visit history on record."
                compact
              />
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-full lg:w-[280px] lg:shrink-0 flex flex-col gap-[14px]">
          {/* Appointment info */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
            <p className="font-bold text-[#142033] text-[15px] mb-[14px]">Today's Appointment</p>
            <div className="flex flex-col gap-[12px]">
              {[
                { label: 'Time', value: patient.appointmentTime },
                { label: 'Type', value: patient.consultationType },
              ].map((row) => (
                <div key={row.label}>
                  <p className="font-semibold text-[#7b899c] text-[10px] uppercase mb-[3px]">{row.label}</p>
                  <p className="font-semibold text-[#142033] text-[13px]">{row.value}</p>
                </div>
              ))}
              <div>
                <p className="font-semibold text-[#7b899c] text-[10px] uppercase mb-[3px]">Status</p>
                <StatusBadge
                  status={
                    isCurrentlyActive ? 'In consultation' :
                    isCompleted ? 'Completed' :
                    isSkipped ? 'Waiting' :
                    'Scheduled'
                  }
                />
              </div>
            </div>
          </div>

          {/* Allergies */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
            <p className="font-bold text-[#142033] text-[15px] mb-[14px]">Allergies</p>
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-[6px]">
                {patient.allergies.map((a) => (
                  <span key={a} className="bg-[#fef3f2] text-[#c53a45] font-semibold text-[12px] px-[10px] py-[5px] rounded-[999px]">
                    {a}
                  </span>
                ))}
              </div>
            ) : (
              <p className="font-normal text-[#7b899c] text-[13px]">No known allergies</p>
            )}
          </div>

          {/* Other waiting patients */}
          {otherPatients.length > 0 && (
            <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
              <p className="font-bold text-[#142033] text-[15px] mb-[14px]">Others Waiting</p>
              {otherPatients.map((p) => (
                <div
                  key={p.id}
                  className="flex gap-[10px] items-center py-[8px] border-t border-[#d8e1ec] first:border-0 cursor-pointer hover:bg-[#f4f7fb] -mx-[18px] px-[18px] transition-colors rounded-[8px]"
                  onClick={() => { selectPatient(p.id); }}
                >
                  <PatientInitials initials={p.initials} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#142033] text-[13px] truncate">{p.name}</p>
                    <p className="font-normal text-[#7b899c] text-[11px]">{p.token} · {p.appointmentTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
}
