import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PatientLayout from '../../components/PatientLayout';
import { usePatient } from '../../context/PatientContext';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDoctorSelect } from '../../components/Skeleton';
import { ErrorState } from '../../components/EmptyState';

/* =====================================================
   BACKEND TYPES
===================================================== */

type BackendDoctor = {
  id: number;
  name: string;
  specialization: string;
  qualification?: string;
  experience?: string | number;
  status?: string;
  consultationTime?: string | number;
  consultationFee?: number;

  hospital?: {
    id: number;
    name?: string;
  };

  department?: {
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

/* =====================================================
   FRONTEND DOCTOR TYPE
===================================================== */

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
  patientsToday: number;
  nextSlot: string;
};

/* =====================================================
   STATUS
===================================================== */

function normalizeStatus(status?: string): string {
  if (!status) {
    return 'Unavailable';
  }

  const value = status.toLowerCase().trim();

  if (value === 'available') return 'Available';
  if (value === 'busy') return 'Busy';
  if (value === 'delayed') return 'Delayed';
  if (value === 'on break') return 'On Break';
  if (value === 'offline') return 'Offline';
  if (value === 'unavailable') return 'Unavailable';

  return status;
}

/* =====================================================
   STATUS STYLE
===================================================== */

function getStatusStyle(status: string) {
  switch (status.toLowerCase()) {
    case 'available':
      return {
        dot: 'bg-emerald-400',
        text: 'text-emerald-300',
        bg: 'bg-emerald-400/[0.07]',
        border: 'border-emerald-400/10',
      };

    case 'busy':
      return {
        dot: 'bg-amber-400',
        text: 'text-amber-300',
        bg: 'bg-amber-400/[0.07]',
        border: 'border-amber-400/10',
      };

    case 'delayed':
      return {
        dot: 'bg-orange-400',
        text: 'text-orange-300',
        bg: 'bg-orange-400/[0.07]',
        border: 'border-orange-400/10',
      };

    default:
      return {
        dot: 'bg-slate-500',
        text: 'text-slate-400',
        bg: 'bg-white/[0.03]',
        border: 'border-white/[0.06]',
      };
  }
}

/* =====================================================
   QUEUE COLOR
===================================================== */

function getQueueColor(length: number) {
  if (length <= 2) {
    return 'text-emerald-300';
  }

  if (length <= 5) {
    return 'text-amber-300';
  }

  return 'text-red-300';
}

/* =====================================================
   TODAY DATE
===================================================== */

function getTodayBackendDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    today.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/* =====================================================
   MAIN PAGE
===================================================== */

export default function SelectDoctorPage() {
  const navigate = useNavigate();

  const {
    selectedHospital,
    selectedDepartment,
    selectedDoctor,
    setSelectedDoctor,
    setSelectedSlot,
  } = usePatient();

  const loading = usePageLoad(500);

  const [backendDoctors, setBackendDoctors] =
    useState<BackendDoctor[]>([]);

  const [appointments, setAppointments] =
    useState<BackendAppointment[]>([]);

  const [loadingDoctors, setLoadingDoctors] =
    useState(true);

  const [error, setError] = useState('');

  const [retryKey, setRetryKey] =
    useState(0);

  const API_URL = '/api';

  /* =====================================================
     CHECK PREVIOUS STEPS
  ===================================================== */

  useEffect(() => {
    if (!selectedHospital || !selectedDepartment) {
      navigate('/patient/hospital', {
        replace: true,
      });
    }
  }, [
    selectedHospital,
    selectedDepartment,
    navigate,
  ]);

  /* =====================================================
     LOAD DOCTORS + APPOINTMENTS
  ===================================================== */

  useEffect(() => {
    if (
      !selectedHospital ||
      !selectedDepartment
    ) {
      return;
    }

    const loadData = async () => {
      try {
        setLoadingDoctors(true);
        setError('');

        const [
          doctorResponse,
          appointmentResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/doctors`),
          fetch(`${API_URL}/appointments`),
        ]);

        if (!doctorResponse.ok) {
          throw new Error(
            'Unable to load doctors'
          );
        }

        if (!appointmentResponse.ok) {
          throw new Error(
            'Unable to load appointments'
          );
        }

        const doctorsData: BackendDoctor[] =
          await doctorResponse.json();

        const appointmentsData: BackendAppointment[] =
          await appointmentResponse.json();

        setBackendDoctors(doctorsData);
        setAppointments(appointmentsData);
      } catch (err) {
        console.error(
          'Doctor loading error:',
          err
        );

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
  }, [
    selectedHospital,
    selectedDepartment,
    retryKey,
  ]);

  /* =====================================================
     CONVERT BACKEND DOCTORS
  ===================================================== */

  const doctors = useMemo<DoctorView[]>(() => {
    if (
      !selectedHospital ||
      !selectedDepartment
    ) {
      return [];
    }

    /*
     * Only doctors belonging to selected
     * hospital + selected department.
     *
     * Supports both:
     * doctor.department.name
     * and specialization fallback.
     */

    const hospitalDoctors =
      backendDoctors.filter((doctor) => {
        const sameHospital =
          Number(doctor.hospital?.id) ===
          Number(selectedHospital.id);

        const departmentName =
          doctor.department?.name ||
          doctor.specialization ||
          '';

        const sameDepartment =
          departmentName
            .trim()
            .toLowerCase() ===
          selectedDepartment
            .trim()
            .toLowerCase();

        return (
          sameHospital &&
          sameDepartment
        );
      });

    const today =
      getTodayBackendDate();

    return hospitalDoctors.map(
      (doctor) => {
        const doctorAppointments =
          appointments.filter(
            (appointment) =>
              Number(
                appointment.doctor?.id
              ) === Number(doctor.id) &&
              appointment.appointmentDate ===
                today
          );

        const waitingAppointments =
          doctorAppointments.filter(
            (appointment) =>
              appointment.status
                ?.toUpperCase() ===
              'WAITING'
          );

        return {
          id: String(doctor.id),

          name: doctor.name,

          specialization:
            doctor.specialization,

          department:
            doctor.department?.name ??
            selectedDepartment,

          status:
            normalizeStatus(
              doctor.status
            ),

          room:
            'Room not assigned',

          experience:
            doctor.experience !== undefined
              ? `${doctor.experience} years experience`
              : 'Experience not specified',

          fee: Number(
            doctor.consultationFee ?? 0
          ),

          queueLength:
            waitingAppointments.length,

          patientsToday:
            doctorAppointments.length,

          nextSlot:
            'Slot selection next',
        };
      }
    );
  }, [
    backendDoctors,
    appointments,
    selectedHospital,
    selectedDepartment,
  ]);

  /* =====================================================
     SELECT DOCTOR
  ===================================================== */

  const handleSelect = (
    doctor: DoctorView
  ) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(null);
  };

  /* =====================================================
     ESTIMATED WAIT
  ===================================================== */

  const getEstimatedWait = (
    doctor: DoctorView
  ) => {
    if (doctor.queueLength === 0) {
      return 0;
    }

    return doctor.queueLength * 10;
  };

  /* =====================================================
     SAFETY
  ===================================================== */

  if (
    !selectedHospital ||
    !selectedDepartment
  ) {
    return null;
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <PatientLayout
        step={2}
        backTo="/patient/department"
        maxWidth="max-w-[1050px]"
      >
        <SkDoctorSelect />
      </PatientLayout>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <PatientLayout
      step={2}
      backTo="/patient/department"
      maxWidth="max-w-[1050px]"
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="relative mb-8 sm:mb-10">
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-[80px]" />

        <div className="relative">
          {/* Breadcrumb */}

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-500">
              {selectedHospital.name}
            </span>

            <span className="text-slate-700">
              /
            </span>

            <span className="text-[11px] text-slate-500">
              {selectedDepartment}
            </span>

            <span className="text-slate-700">
              /
            </span>

            <span className="text-[11px] font-semibold text-[#8ef8ff]">
              Doctor
            </span>
          </div>

          {/* Badge */}

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16d9e3] shadow-[0_0_8px_#16d9e3]" />

            <span className="text-[11px] font-semibold tracking-wide text-[#8ef8ff]">
              STEP 3 OF 5
            </span>
          </div>

          <h1 className="text-[30px] sm:text-[36px] font-bold leading-tight tracking-[-0.5px] text-white">
            Choose Your Doctor
          </h1>

          <p className="mt-2 max-w-[650px] text-[13px] sm:text-[14px] text-slate-400">
            Select a doctor from{' '}
            <span className="font-semibold text-slate-300">
              {selectedDepartment}
            </span>{' '}
            and continue to book your OPD appointment.
          </p>
        </div>
      </div>

      {/* =================================================
          SUMMARY PANEL
      ================================================= */}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Hospital */}

        <div className="rounded-[16px] border border-white/[0.07] bg-[#071b31]/80 p-4">
          <p className="text-[10px] uppercase tracking-wide text-slate-600">
            Hospital
          </p>

          <p className="mt-1 truncate text-[13px] font-semibold text-white">
            {selectedHospital.name}
          </p>
        </div>

        {/* Department */}

        <div className="rounded-[16px] border border-white/[0.07] bg-[#071b31]/80 p-4">
          <p className="text-[10px] uppercase tracking-wide text-slate-600">
            Department
          </p>

          <p className="mt-1 truncate text-[13px] font-semibold text-white">
            {selectedDepartment}
          </p>
        </div>

        {/* Doctors */}

        <div className="rounded-[16px] border border-[#16d9e3]/10 bg-[#071b31]/80 p-4">
          <p className="text-[10px] uppercase tracking-wide text-slate-600">
            Available Doctors
          </p>

          <p className="mt-1 text-[13px] font-semibold text-[#8ef8ff]">
            {doctors.length}{' '}
            {doctors.length === 1
              ? 'Doctor'
              : 'Doctors'}
          </p>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && !loadingDoctors && (
        <div className="mb-6">
          <ErrorState
            description={error}
            onRetry={() =>
              setRetryKey(
                (key) => key + 1
              )
            }
          />
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loadingDoctors && (
        <div className="rounded-[22px] border border-white/[0.08] bg-[#071b31]/90 p-10 text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-[#16d9e3]" />

          <p className="text-[13px] text-slate-400">
            Loading doctors from HospitalFlow...
          </p>
        </div>
      )}

      {/* =================================================
          DOCTOR LIST
      ================================================= */}

      {!loadingDoctors &&
        !error && (
          <div className="mb-8">
            {/* Result */}

            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-medium tracking-wide text-slate-500">
                  AVAILABLE DOCTORS
                </p>

                <p className="mt-1 text-[14px] font-semibold text-white">
                  {doctors.length}{' '}
                  {doctors.length === 1
                    ? 'doctor'
                    : 'doctors'}{' '}
                  found
                </p>
              </div>

              {selectedDoctor && (
                <div className="hidden items-center gap-2 text-[11px] font-medium text-[#8ef8ff] sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16d9e3] shadow-[0_0_8px_#16d9e3]" />

                  Doctor selected
                </div>
              )}
            </div>

            {/* Cards */}

            <div className="flex flex-col gap-4">
              {doctors.map((doctor) => {
                const isSelected =
                  selectedDoctor?.id ===
                  doctor.id;

                const waitMins =
                  getEstimatedWait(
                    doctor
                  );

                const statusStyle =
                  getStatusStyle(
                    doctor.status
                  );

                const queueColor =
                  getQueueColor(
                    doctor.queueLength
                  );

                const initials =
                  doctor.name
                    .replace(
                      /^Dr\.\s*/i,
                      ''
                    )
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(
                      (word) =>
                        word[0]
                    )
                    .join('')
                    .toUpperCase();

                return (
                  <div
                    key={doctor.id}
                    onClick={() =>
                      handleSelect(
                        doctor
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                          'Enter' ||
                        event.key ===
                          ' '
                      ) {
                        event.preventDefault();

                        handleSelect(
                          doctor
                        );
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={
                      isSelected
                        ? `
                          group
                          relative
                          overflow-hidden
                          cursor-pointer
                          rounded-[22px]
                          border
                          border-[#16d9e3]/70
                          bg-[#0a243d]
                          p-5
                          sm:p-6
                          shadow-[0_0_0_1px_rgba(22,217,227,0.12),0_15px_45px_rgba(0,0,0,0.22),0_0_35px_rgba(22,217,227,0.07)]
                          transition-all
                          duration-300
                        `
                        : `
                          group
                          relative
                          overflow-hidden
                          cursor-pointer
                          rounded-[22px]
                          border
                          border-white/[0.08]
                          bg-[#071b31]/90
                          p-5
                          sm:p-6
                          shadow-[0_15px_40px_rgba(0,0,0,0.12)]
                          transition-all
                          duration-300
                          hover:-translate-y-[2px]
                          hover:border-[#16d9e3]/30
                          hover:bg-[#092039]
                          hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)]
                        `
                    }
                  >
                    {/* Glow */}

                    {isSelected && (
                      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#16d9e3]/10 blur-[60px]" />
                    )}

                    <div className="relative">
                      <div className="flex items-start gap-4">
                        {/* =================================
                            DOCTOR AVATAR
                        ================================= */}

                        <div
                          className={
                            isSelected
                              ? 'flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[18px] border border-[#16d9e3]/30 bg-[#16d9e3]/10 shadow-[0_0_25px_rgba(22,217,227,0.12)]'
                              : 'flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[18px] border border-white/[0.07] bg-[#0b2742]'
                          }
                        >
                          <span
                            className={
                              isSelected
                                ? 'text-[18px] font-bold text-[#8ef8ff]'
                                : 'text-[18px] font-bold text-[#16d9e3]'
                            }
                          >
                            {initials}
                          </span>
                        </div>

                        {/* =================================
                            MAIN DETAILS
                        ================================= */}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start gap-2 pr-8">
                            <h2 className="text-[16px] sm:text-[18px] font-bold text-white">
                              {doctor.name}
                            </h2>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                              />

                              {doctor.status}
                            </span>
                          </div>

                          <p className="mt-1.5 text-[12px] text-[#8ef8ff]">
                            {doctor.specialization}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-500">
                            {doctor.qualification ||
                              'Medical specialist'}
                          </p>

                          {/* Stats */}

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-[9px] border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[10px] text-slate-400">
                              🎓 {doctor.experience}
                            </span>

                            <span className="rounded-[9px] border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[10px] text-slate-400">
                              👥{' '}
                              {doctor.patientsToday}{' '}
                              today
                            </span>

                            <span
                              className={`rounded-[9px] border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-semibold ${queueColor}`}
                            >
                              ⏳{' '}
                              {doctor.queueLength ===
                              0
                                ? 'No queue'
                                : `${doctor.queueLength} ahead`}
                            </span>

                            <span className="rounded-[9px] border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[10px] text-slate-400">
                              🕐{' '}
                              {waitMins === 0
                                ? 'No current wait'
                                : `~${waitMins} min`}
                            </span>
                          </div>
                        </div>

                        {/* =================================
                            SELECT CIRCLE
                        ================================= */}

                        <div
                          className={
                            isSelected
                              ? 'absolute right-0 top-0 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#16d9e3] bg-[#16d9e3] shadow-[0_0_16px_rgba(22,217,227,0.35)]'
                              : 'absolute right-0 top-0 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-white/15 bg-white/[0.02] group-hover:border-[#16d9e3]/40'
                          }
                        >
                          {isSelected && (
                            <span className="text-[12px] font-black text-[#031326]">
                              ✓
                            </span>
                          )}
                        </div>
                      </div>

                      {/* =================================
                          LOWER INFORMATION
                      ================================= */}

                      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-4 sm:grid-cols-4">
                        {/* Fee */}

                        <div>
                          <p className="text-[9px] uppercase tracking-wide text-slate-600">
                            Consultation
                          </p>

                          <p className="mt-1 text-[12px] font-semibold text-slate-300">
                            {doctor.fee > 0
                              ? `₹${doctor.fee}`
                              : 'Not specified'}
                          </p>
                        </div>

                        {/* Queue */}

                        <div>
                          <p className="text-[9px] uppercase tracking-wide text-slate-600">
                            Queue
                          </p>

                          <p
                            className={`mt-1 text-[12px] font-semibold ${queueColor}`}
                          >
                            {doctor.queueLength ===
                            0
                              ? 'No wait'
                              : `${doctor.queueLength} patients`}
                          </p>
                        </div>

                        {/* Room */}

                        <div>
                          <p className="text-[9px] uppercase tracking-wide text-slate-600">
                            Room
                          </p>

                          <p className="mt-1 truncate text-[12px] font-semibold text-slate-400">
                            {doctor.room}
                          </p>
                        </div>

                        {/* Connection */}

                        <div>
                          <p className="text-[9px] uppercase tracking-wide text-slate-600">
                            OPD
                          </p>

                          <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Connected
                          </p>
                        </div>
                      </div>

                      {/* Selected footer */}

                      {isSelected && (
                        <div className="mt-4 flex items-center justify-between rounded-[11px] border border-[#16d9e3]/10 bg-[#16d9e3]/[0.04] px-3 py-2.5">
                          <span className="text-[10px] font-semibold text-[#8ef8ff]">
                            ✓ Doctor selected
                          </span>

                          <span className="text-[10px] text-slate-500">
                            Ready to book OPD
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* No doctors */}

              {doctors.length === 0 && (
                <div className="rounded-[22px] border border-white/[0.08] bg-[#071b31]/90 px-6 py-14 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.03] text-2xl">
                    👨‍⚕️
                  </div>

                  <h3 className="text-[16px] font-bold text-white">
                    No doctors available
                  </h3>

                  <p className="mx-auto mt-2 max-w-[430px] text-[12px] leading-relaxed text-slate-500">
                    There are currently no doctors
                    assigned to{' '}
                    {selectedDepartment} at{' '}
                    {selectedHospital.name}.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      {/* =================================================
          BOTTOM CTA
      ================================================= */}

      {!loadingDoctors &&
        !error &&
        doctors.length > 0 && (
          <div className="sticky bottom-4 z-10 rounded-[18px] border border-white/[0.08] bg-[#06182b]/95 p-3 sm:p-3.5 shadow-[0_15px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="hidden min-w-0 sm:block">
                <p className="text-[10px] text-slate-500">
                  Selected doctor
                </p>

                <p className="mt-0.5 max-w-[320px] truncate text-[12px] font-semibold text-white">
                  {selectedDoctor
                    ? selectedDoctor.name
                    : 'Please select a doctor'}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate('/patient/book')
                }
                disabled={!selectedDoctor}
                className="ml-auto rounded-[12px] bg-[#16d9e3] px-6 py-3 text-[12px] font-bold text-[#031326] shadow-[0_0_20px_rgba(22,217,227,0.16)] transition-all hover:bg-[#5deaf0] hover:shadow-[0_0_28px_rgba(22,217,227,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none sm:px-7 sm:text-[13px]"
              >
                Continue to Book OPD →
              </button>
            </div>
          </div>
        )}
    </PatientLayout>
  );
}