import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/PatientLayout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { usePatient } from '../../context/PatientContext';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDoctorSelect } from '../../components/Skeleton';
import EmptyState, { EmptyIcons } from '../../components/EmptyState';

type BackendDoctor = {
  id: number;
  name: string;
  specialization: string;
  qualification?: string;
  experience?: number;
  status?: string;
  consultationTime?: number;
  hospital?: {
    id: number;
    name: string;
  };
};

type BackendAppointment = {
  id: number;
  doctor?: {
    id: number;
  };
  appointmentDate: string;
  status: string;
};

type DoctorView = {
  id: string;
  name: string;
  specialization: string;
  department: string;
  status: string;
  room: string;
  experience: string;
  fee: number;
  queueLength: number;
  rating: number;
  patientsToday: number;
  nextSlot: string;
};

function QueueIndicator({ length }: { length: number }) {
  const color =
    length <= 2
      ? 'text-[#18865b]'
      : length <= 5
        ? 'text-[#a86508]'
        : 'text-[#c53a45]';

  const label =
    length === 0 ? 'No wait' : `${length} ahead`;

  return (
    <p className={`font-semibold text-[12px] ${color}`}>
      {label}
    </p>
  );
}

function normalizeStatus(status?: string): string {
  if (!status) return 'Unavailable';

  const value = status.toLowerCase().trim();

  if (value === 'available') return 'Available';
  if (value === 'busy') return 'Busy';
  if (value === 'delayed') return 'Delayed';
  if (value === 'on break') return 'On Break';
  if (value === 'offline') return 'Offline';
  if (value === 'unavailable') return 'Unavailable';

  return status;
}

/*
 * Converts:
 * "Thu, 24 Sep 2026"
 * into:
 * "2026-09-24"
 *
 * Backend queue API expects yyyy-MM-dd.
 */
function convertDateToBackendFormat(date: string): string {
  const parsed = new Date(date);

  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /*
   * Fallback for strings such as:
   * Thu, 24 Sep 2026
   */
  const match = date.match(
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i
  );

  if (!match) {
    return date;
  }

  const months: Record<string, string> = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12',
  };

  const day = match[1].padStart(2, '0');
  const month = months[match[2].slice(0, 3)];
  const year = match[3];

  return `${year}-${month}-${day}`;
}

export default function SelectDoctorPage() {
  const navigate = useNavigate();

  const {
    selectedHospital,
    selectedDepartment,
    selectedDoctor,
    setSelectedDoctor,
    setSelectedSlot,
    selectedDate,
  } = usePatient();

  const loading = usePageLoad(500);

  const [backendDoctors, setBackendDoctors] = useState<BackendDoctor[]>(
    []
  );

  const [appointments, setAppointments] = useState<
    BackendAppointment[]
  >([]);

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [error, setError] = useState('');

  const API_URL = '/api';

  /*
   * Redirect if patient skipped previous steps.
   */
  useEffect(() => {
    if (!selectedHospital || !selectedDepartment) {
      navigate('/patient/hospital', { replace: true });
    }
  }, [
    selectedHospital,
    selectedDepartment,
    navigate,
  ]);

  /*
   * Load real doctors and appointments.
   */
  useEffect(() => {
    if (!selectedHospital || !selectedDepartment) {
      return;
    }

    const loadData = async () => {
      try {
        setLoadingDoctors(true);
        setError('');

        const [doctorResponse, appointmentResponse] =
          await Promise.all([
            fetch(`${API_URL}/doctors`),
            fetch(`${API_URL}/appointments`),
          ]);

        if (!doctorResponse.ok) {
          throw new Error('Unable to load doctors');
        }

        if (!appointmentResponse.ok) {
          throw new Error('Unable to load appointments');
        }

        const doctorsData: BackendDoctor[] =
          await doctorResponse.json();

        const appointmentsData: BackendAppointment[] =
          await appointmentResponse.json();

        setBackendDoctors(doctorsData);
        setAppointments(appointmentsData);
      } catch (err) {
        console.error('Doctor loading error:', err);

        setError(
          'Unable to load doctors from HospitalFlow backend.'
        );

        setBackendDoctors([]);
        setAppointments([]);
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadData();
  }, [selectedHospital, selectedDepartment]);

  /*
   * Convert backend doctors into the structure
   * expected by the existing PatientContext.
   */
  const doctors = useMemo<DoctorView[]>(() => {
    if (!selectedHospital || !selectedDepartment) {
      return [];
    }

    const hospitalDoctors = backendDoctors.filter(
      (doctor) =>
        doctor.hospital?.id === selectedHospital.id &&
        doctor.specialization?.trim().toLowerCase() ===
          selectedDepartment.trim().toLowerCase()
    );

    return hospitalDoctors.map((doctor) => {
      const doctorAppointments = appointments.filter(
        (appointment) =>
          appointment.doctor?.id === doctor.id
      );

      const waitingAppointments =
        doctorAppointments.filter(
          (appointment) =>
            appointment.status.toUpperCase() === 'WAITING'
        );

      return {
        id: String(doctor.id),
        name: doctor.name,
        specialization: doctor.specialization,
        department: selectedDepartment,
        status: normalizeStatus(doctor.status),
        room: 'Room not assigned',
        experience:
          doctor.experience !== undefined
            ? `${doctor.experience} years experience`
            : 'Experience not specified',
        fee: 0,
        queueLength: waitingAppointments.length,
        rating: 0,
        patientsToday: doctorAppointments.length,
        nextSlot: 'Slot selection next',
      };
    });
  }, [
    backendDoctors,
    appointments,
    selectedHospital,
    selectedDepartment,
  ]);

  /*
   * Select doctor.
   */
  const handleSelect = (doctor: DoctorView) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(null);
  };

  /*
   * Calculate selected doctor's wait.
   *
   * This is only a visual queue indication.
   * Actual waiting-time prediction will come from
   * the existing AI service later in the flow.
   */
  const getEstimatedWait = (doctor: DoctorView) => {
    if (doctor.queueLength === 0) {
      return 0;
    }

    return doctor.queueLength * 10;
  };

  if (!selectedHospital || !selectedDepartment) {
    return null;
  }

  if (loading) {
    return (
      <PatientLayout
        step={2}
        backTo="/patient/department"
        maxWidth="max-w-[860px]"
      >
        <SkDoctorSelect />
      </PatientLayout>
    );
  }

  return (
    <PatientLayout
      step={2}
      backTo="/patient/department"
      maxWidth="max-w-[860px]"
    >
      {/* HEADER */}
      <div className="mb-[24px]">
        <div className="flex items-center gap-[8px] flex-wrap mb-[6px]">
          <p className="font-normal text-[#7b899c] text-[13px]">
            {selectedHospital.name}
          </p>

          <span className="text-[#d8e1ec]">›</span>

          <p className="font-normal text-[#7b899c] text-[13px]">
            {selectedDepartment}
          </p>

          <span className="text-[#d8e1ec]">›</span>

          <p className="font-semibold text-[#142033] text-[13px]">
            Select Doctor
          </p>
        </div>

        <h1 className="font-bold text-[#142033] text-[24px]">
          Choose Your Doctor
        </h1>

        <p className="font-normal text-[#526176] text-[14px] mt-[4px]">
          {doctors.length} doctor
          {doctors.length !== 1 ? 's' : ''} available in{' '}
          {selectedDepartment}
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-[20px] bg-[#fff3f3] border border-[#f1c5c5] rounded-[12px] px-[16px] py-[14px]">
          <p className="text-[#c53a45] text-[13px] font-semibold">
            {error}
          </p>
        </div>
      )}

      {/* LOADING */}
      {loadingDoctors && (
        <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[24px] text-center mb-[28px]">
          <p className="text-[#526176] text-[14px]">
            Loading doctors from HospitalFlow...
          </p>
        </div>
      )}

      {/* DOCTORS */}
      {!loadingDoctors && (
        <div className="flex flex-col gap-[12px] mb-[28px]">
          {doctors.map((doctor) => {
            const isSelected =
              selectedDoctor?.id === doctor.id;

            const waitMins =
              getEstimatedWait(doctor);

            return (
              <div
                key={doctor.id}
                onClick={() => handleSelect(doctor)}
                className={`bg-white border rounded-[14px] p-[20px] cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#155ead] shadow-[0px_0px_0px_3px_rgba(21,94,173,0.12)]'
                    : 'border-[#d8e1ec] hover:border-[#afc0d3] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]'
                }`}
              >
                <div className="flex gap-[16px] items-start">
                  {/* AVATAR */}
                  <div
                    className={`size-[52px] rounded-[14px] flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-[#eaf3fd]'
                        : 'bg-[#f4f7fb]'
                    }`}
                  >
                    <p
                      className={`font-bold text-[16px] ${
                        isSelected
                          ? 'text-[#155ead]'
                          : 'text-[#526176]'
                      }`}
                    >
                      {doctor.name
                        .replace(/^Dr\.\s*/i, '')
                        .split(' ')
                        .map((word) => word[0])
                        .join('')
                        .slice(0, 2)}
                    </p>
                  </div>

                  {/* INFO */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[10px] flex-wrap mb-[3px]">
                      <p className="font-bold text-[#142033] text-[16px]">
                        {doctor.name}
                      </p>

                      <StatusBadge status={doctor.status} />
                    </div>

                    <p className="font-normal text-[#526176] text-[13px] mb-[10px]">
                      {doctor.specialization}
                    </p>

                    <div className="flex items-center gap-[18px] flex-wrap">
                      <div className="flex items-center gap-[6px]">
                        <span className="text-[#7b899c] text-[12px]">
                          🎓
                        </span>

                        <p className="font-normal text-[#526176] text-[12px]">
                          {doctor.experience}
                        </p>
                      </div>

                      <div className="flex items-center gap-[6px]">
                        <span className="text-[#7b899c] text-[12px]">
                          👥
                        </span>

                        <p className="font-normal text-[#526176] text-[12px]">
                          {doctor.patientsToday} appointments
                        </p>
                      </div>

                      <div className="flex items-center gap-[6px]">
                        <span className="text-[#7b899c] text-[12px]">
                          ⏳
                        </span>

                        <QueueIndicator
                          length={doctor.queueLength}
                        />
                      </div>

                      <div className="flex items-center gap-[6px]">
                        <span className="text-[#7b899c] text-[12px]">
                          🕐
                        </span>

                        <p className="font-normal text-[#526176] text-[12px]">
                          {waitMins === 0
                            ? 'No current wait'
                            : `~${waitMins} min estimated`}
                        </p>
                      </div>
                    </div>

                    {/* BACKEND INFORMATION */}
                    <div className="flex gap-[6px] mt-[12px] flex-wrap">
                      {doctor.room !== 'Room not assigned' && (
                        <span className="bg-[#f4f7fb] text-[#526176] text-[11px] font-medium px-[8px] py-[3px] rounded-[6px]">
                          {doctor.room}
                        </span>
                      )}

                      <span className="bg-[#e8f7f1] text-[#18865b] text-[11px] font-semibold px-[8px] py-[3px] rounded-[6px]">
                        HospitalFlow Connected
                      </span>
                    </div>
                  </div>

                  {/* SELECTOR */}
                  <div className="flex flex-col items-end gap-[10px] shrink-0">
                    <div
                      className={`size-[22px] rounded-[999px] border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-[#155ead] bg-[#155ead]'
                          : 'border-[#d8e1ec]'
                      }`}
                    >
                      {isSelected && (
                        <span className="text-white text-[11px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-[#526176] text-[12px]">
                        Consultation fee
                      </p>

                      <p className="font-normal text-[#7b899c] text-[10px]">
                        Not specified
                      </p>
                    </div>

                    <div className="bg-[#eaf3fd] px-[8px] py-[3px] rounded-[6px]">
                      <p className="font-semibold text-[#155ead] text-[11px]">
                        Next: Select slot
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* EMPTY */}
          {doctors.length === 0 && !error && (
            <EmptyState
              icon={EmptyIcons.stethoscope(28)}
              title="No doctors available"
              description="There are no doctors available in this department for the selected hospital."
            />
          )}
        </div>
      )}

      {/* CTA */}
      <Button
        variant="primary"
        onClick={() => navigate('/patient/book')}
        disabled={!selectedDoctor}
        className="px-[28px] py-[12px] text-[14px]"
      >
        Book OPD Appointment →
      </Button>
    </PatientLayout>
  );
}