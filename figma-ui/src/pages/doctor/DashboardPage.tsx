import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DoctorLayout from '../../components/DoctorLayout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import PatientInitials from '../../components/PatientInitials';

import { useQueue } from '../../context/QueueContext';
import type { DoctorStatus } from '../../types';

import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDoctorDashboard } from '../../components/Skeleton';


// =====================================================
// ASSETS
// =====================================================

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


// =====================================================
// BACKEND TYPES
// =====================================================

type BackendDoctor = {
  id: number;
  name: string;
  specialization: string;
  qualification?: string;
  experience?: string | number;
  status?: string;
  consultationTime?: string;

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
  patientName: string;
  patientPhone?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: string;
  status: string;
  priority: string;

  doctor?: {
    id: number;
    name?: string;
  };

  hospital?: {
    id: number;
    name?: string;
  };
};


// =====================================================
// STATUS OPTIONS
// =====================================================

const statusOptions: {
  label: DoctorStatus;
  icon: string;
}[] = [
  {
    label: 'Available',
    icon: imgIndicator1,
  },
  {
    label: 'Busy',
    icon: imgIndicator2,
  },
  {
    label: 'On Break',
    icon: imgIndicator3,
  },
  {
    label: 'Offline',
    icon: imgIndicator4,
  },
];


// =====================================================
// TODAY
// =====================================================

function getTodayBackendDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    now.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


function formatToday() {
  const now = new Date();

  return now.toLocaleDateString(
    'en-IN',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );
}


// =====================================================
// TIME SORTING
// =====================================================

function getTimeValue(time?: string) {
  if (!time) {
    return Number.MAX_SAFE_INTEGER;
  }

  const match = time.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)?/i
  );

  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  let hour = Number(match[1]);

  const minute = Number(match[2]);

  const period =
    match[3]?.toUpperCase();

  if (
    period === 'PM' &&
    hour !== 12
  ) {
    hour += 12;
  }

  if (
    period === 'AM' &&
    hour === 12
  ) {
    hour = 0;
  }

  return hour * 60 + minute;
}


// =====================================================
// STATUS NORMALIZATION
// =====================================================

function normalizeDoctorStatus(
  status?: string
): DoctorStatus {

  if (!status) {
    return 'Offline';
  }

  const value =
    status
      .trim()
      .toLowerCase();

  if (value === 'available') {
    return 'Available';
  }

  if (value === 'busy') {
    return 'Busy';
  }

  if (
    value === 'on break' ||
    value === 'on_break'
  ) {
    return 'On Break';
  }

  return 'Offline';
}


// =====================================================
// APPOINTMENT STATUS
// =====================================================

function isWaiting(
  status: string
) {
  return (
    status.toUpperCase() ===
    'WAITING'
  );
}


function isInProgress(
  status: string
) {
  return (
    status.toUpperCase() ===
    'IN_PROGRESS'
  );
}


function isCompleted(
  status: string
) {
  return (
    status.toUpperCase() ===
    'COMPLETED'
  );
}


// =====================================================
// MAIN DASHBOARD
// =====================================================

export default function DashboardPage() {

  const navigate = useNavigate();

  // ===================================================
  // EXISTING QUEUE CONTEXT
  // ===================================================

  const {
    currentPatient,
    waitingPatients,
    callNextPatient,
    completeConsultation,
    skipPatient,
    selectPatient,
  } = useQueue();


  // ===================================================
  // LOCAL STATE
  // ===================================================

  const [doctor, setDoctor] =
    useState<BackendDoctor | null>(null);

  const [appointments, setAppointments] =
    useState<BackendAppointment[]>([]);

  const [doctorStatus, setDoctorStatus] =
    useState<DoctorStatus>('Available');

  const [statusMenuOpen, setStatusMenuOpen] =
    useState(false);

  const [loadingBackend, setLoadingBackend] =
    useState(true);

  const [error, setError] =
    useState('');

  const loading =
    usePageLoad(500);


  // ===================================================
  // FETCH DOCTOR + APPOINTMENTS
  // ===================================================

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        setLoadingBackend(true);
        setError('');

        const [
          doctorsResponse,
          appointmentsResponse,
        ] = await Promise.all([
          fetch('/api/doctors'),
          fetch('/api/appointments'),
        ]);


        if (!doctorsResponse.ok) {
          throw new Error(
            'Failed to load doctors'
          );
        }


        if (!appointmentsResponse.ok) {
          throw new Error(
            'Failed to load appointments'
          );
        }


        const doctorsData:
          BackendDoctor[] =
          await doctorsResponse.json();


        const appointmentsData:
          BackendAppointment[] =
          await appointmentsResponse.json();


        // ---------------------------------------------
        // CURRENT DOCTOR
        //
        // For now there is no real doctor authentication
        // session. Therefore we use the first backend
        // doctor.
        //
        // Later JWT login will provide doctor ID.
        // ---------------------------------------------

        const storedDoctor =
          sessionStorage.getItem(
            'hospitalflow_doctor'
          );


        let selectedDoctor:
          BackendDoctor | undefined;


        if (storedDoctor) {

          try {

            const parsed =
              JSON.parse(
                storedDoctor
              );

            const storedDoctorId =
              Number(
                parsed?.doctorId
              );


            if (
              Number.isFinite(
                storedDoctorId
              )
            ) {

              selectedDoctor =
                doctorsData.find(
                  (item) =>
                    item.id ===
                    storedDoctorId
                );
            }

          } catch {
            // Ignore invalid session data
          }
        }


        if (!selectedDoctor) {
          navigate('/login', { replace: true });
          return;
        }


        setDoctor(
          selectedDoctor ?? null
        );


        if (selectedDoctor) {

          setDoctorStatus(
            normalizeDoctorStatus(
              selectedDoctor.status
            )
          );


          const today =
            getTodayBackendDate();


          const todayAppointments =
            appointmentsData.filter(
              (appointment) =>
                appointment.appointmentDate ===
                  today &&
                appointment.doctor?.id ===
                  selectedDoctor.id
            );


          setAppointments(
            todayAppointments
          );

        } else {

          setAppointments([]);

        }

      } catch (err) {

        console.error(
          'Doctor dashboard error:',
          err
        );

        setError(
          'Unable to load doctor dashboard data.'
        );

      } finally {

        setLoadingBackend(false);

      }

    };


    loadDashboard();

  }, []);


  // ===================================================
  // BACKEND STATS
  // ===================================================

  const totalAppointments =
    appointments.length;


  const totalWaiting =
    appointments.filter(
      (appointment) =>
        isWaiting(
          appointment.status
        )
    ).length;


  const priorityPatients =
    appointments.filter(
      (appointment) =>
        isWaiting(
          appointment.status
        ) &&
        (
          appointment.priority
            ?.toUpperCase() ===
            'PRIORITY' ||
          appointment.priority
            ?.toUpperCase() ===
            'URGENT' ||
          appointment.priority
            ?.toUpperCase() ===
            'EMERGENCY'
        )
    ).length;


  const completedCount =
    appointments.filter(
      (appointment) =>
        isCompleted(
          appointment.status
        )
    ).length;


  // ===================================================
  // NEXT APPOINTMENT
  // ===================================================

  const nextAppointment =
    useMemo(() => {

      const upcoming =
        appointments
          .filter(
            (appointment) =>
              isWaiting(
                appointment.status
              ) ||
              isInProgress(
                appointment.status
              )
          )
          .sort(
            (a, b) =>
              getTimeValue(
                a.appointmentTime
              ) -
              getTimeValue(
                b.appointmentTime
              )
          );


      return (
        upcoming[0]
          ?.appointmentTime ||
        '—'
      );

    }, [appointments]);


  // ===================================================
  // COMPLETION %
  // ===================================================

  const completionPercentage =
    totalAppointments > 0
      ? Math.round(
          (
            completedCount /
            totalAppointments
          ) * 100
        )
      : 0;


  // ===================================================
  // BACKEND WAITING QUEUE
  // ===================================================

  const backendWaiting =
    useMemo(() => {

      return appointments
        .filter(
          (appointment) =>
            isWaiting(
              appointment.status
            )
        )
        .sort(
          (a, b) => {

            const priorityValue =
              (
                priority: string
              ) => {

                const value =
                  priority
                    ?.toUpperCase();

                if (
                  value ===
                  'EMERGENCY'
                ) {
                  return 3;
                }

                if (
                  value ===
                  'PRIORITY'
                ) {
                  return 2;
                }

                return 1;
              };


            const priorityDifference =
              priorityValue(
                b.priority
              ) -
              priorityValue(
                a.priority
              );


            if (
              priorityDifference !==
              0
            ) {
              return priorityDifference;
            }


            return a.id - b.id;

          }
        );

    }, [appointments]);


  const previewQueue =
    backendWaiting.slice(0, 3);


  // ===================================================
  // VIEW CURRENT PATIENT
  // ===================================================

  const handleViewPatient = () => {

    if (currentPatient) {

      selectPatient(
        currentPatient.id
      );

      navigate(
        '/doctor/patients'
      );

    }

  };


  // ===================================================
  // QUEUE ROW
  // ===================================================

  const handleQueueRowClick = (
    id: string
  ) => {

    selectPatient(id);

    navigate(
      '/doctor/patients'
    );

  };


  // ===================================================
  // CHANGE DOCTOR STATUS
  // ===================================================

  const handleStatusChange = async (
    status: DoctorStatus
  ) => {

    setDoctorStatus(status);
    setStatusMenuOpen(false);


    if (!doctor) {
      return;
    }


    try {

      const response =
        await fetch(
          `/api/doctors/${doctor.id}`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({

              name:
                doctor.name,

              specialization:
                doctor.specialization,

              qualification:
                doctor.qualification ??
                '',

              experience:
                doctor.experience ??
                '',

              status:
                status,

              consultationTime:
                doctor.consultationTime ??
                '',

              hospital:
                doctor.hospital
                  ? {
                      id:
                        doctor.hospital.id,
                    }
                  : undefined,

              department:
                doctor.department
                  ? {
                      id:
                        doctor.department.id,
                    }
                  : undefined,

            }),

          }
        );


      if (!response.ok) {

        throw new Error(
          'Failed to update doctor status'
        );

      }


      const updatedDoctor:
        BackendDoctor =
        await response.json();


      setDoctor(
        updatedDoctor
      );


    } catch (err) {

      console.error(
        'Status update error:',
        err
      );

      // Roll back UI if backend update fails.
      setDoctorStatus(
        normalizeDoctorStatus(
          doctor.status
        )
      );

    }

  };


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (
      <DoctorLayout
        title="Live operations"
      >
        <SkDoctorDashboard />
      </DoctorLayout>
    );

  }


  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <DoctorLayout
      title="Live operations"
    >

      {/* ============================================= */}
      {/* ERROR */}
      {/* ============================================= */}

      {error && (
        <div className="mb-[16px] rounded-[10px] border border-[#f1b5ba] bg-[#fff1f2] px-[14px] py-[10px]">

          <p className="text-[13px] text-[#b4232f] font-medium">
            {error}
          </p>

        </div>
      )}


      {/* ============================================= */}
      {/* WELCOME */}
      {/* ============================================= */}

      <div className="flex items-end justify-between flex-wrap gap-3 mb-[20px]">

        <div>

          <h1 className="font-bold text-[#142033] text-[24px] leading-tight mb-[6px]">

            Good morning,{' '}

            {doctor?.name ||
              'Doctor'}

          </h1>


          <p className="font-normal text-[#526176] text-[14px]">

            {doctor?.specialization ||
              'Doctor'}

            {doctor?.department?.name
              ? ` · ${doctor.department.name}`
              : ''}

          </p>

        </div>


        <div className="bg-white border border-[#d8e1ec] flex gap-[8px] items-center px-[14px] py-[9px] rounded-[8px] shrink-0">

          <div className="relative shrink-0 size-[15px]">

            <img
              alt=""
              className="absolute block inset-0 size-full"
              src={imgCalendar1}
            />

          </div>


          <p className="font-semibold text-[#142033] text-[12px] whitespace-nowrap">

            {formatToday()}

          </p>

        </div>

      </div>


      {/* ============================================= */}
      {/* DOCTOR INFORMATION */}
      {/* ============================================= */}

      {doctor && (
        <div className="bg-white border border-[#d8e1ec] rounded-[14px] px-[18px] py-[14px] mb-[20px]">

          <div className="flex flex-wrap items-center gap-x-[24px] gap-y-[8px]">

            <div>

              <p className="text-[10px] uppercase font-bold text-[#7b899c]">
                Doctor
              </p>

              <p className="text-[13px] font-semibold text-[#142033]">
                {doctor.name}
              </p>

            </div>


            <div>

              <p className="text-[10px] uppercase font-bold text-[#7b899c]">
                Specialization
              </p>

              <p className="text-[13px] font-semibold text-[#142033]">
                {doctor.specialization}
              </p>

            </div>


            <div>

              <p className="text-[10px] uppercase font-bold text-[#7b899c]">
                Department
              </p>

              <p className="text-[13px] font-semibold text-[#142033]">
                {doctor.department?.name ||
                  'Not assigned'}
              </p>

            </div>


            <div>

              <p className="text-[10px] uppercase font-bold text-[#7b899c]">
                Hospital
              </p>

              <p className="text-[13px] font-semibold text-[#142033]">
                {doctor.hospital?.name ||
                  'HospitalFlow'}
              </p>

            </div>

          </div>

        </div>
      )}


      {/* ============================================= */}
      {/* STATS */}
      {/* ============================================= */}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-[10px] lg:gap-[14px] mb-[20px]">

        <StatCard
          icon={
            <img
              alt=""
              className="size-[20px]"
              src={imgUsers}
            />
          }
          iconBg="bg-[#6750a4]"
          label="Waiting"
          value={totalWaiting}
          sub={`${priorityPatients} priority patients`}
        />


        <StatCard
          icon={
            <img
              alt=""
              className="size-[20px]"
              src={imgCalendar2}
            />
          }
          iconBg="bg-[#2475d0]"
          label="Today's Appointments"
          value={totalAppointments}
          sub={`Next at ${nextAppointment}`}
        />


        <StatCard
          icon={
            <img
              alt=""
              className="size-[20px]"
              src={imgCheckCircle}
            />
          }
          iconBg="bg-[#18865b]"
          label="Completed"
          value={completedCount}
          sub={`${completionPercentage}% of today's list`}
        />

      </div>


      {/* ============================================= */}
      {/* OPERATIONAL OVERVIEW */}
      {/* ============================================= */}

      <div className="flex flex-col lg:flex-row gap-[14px] lg:gap-[18px]">


        {/* =========================================== */}
        {/* LEFT */}
        {/* =========================================== */}

        <div className="flex flex-col gap-[18px] flex-1 min-w-0">


          {/* ========================================= */}
          {/* CURRENT PATIENT */}
          {/* ========================================= */}

          {currentPatient ? (

            <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

              <div className="border-[#d8e1ec] border-b flex items-center justify-between px-[20px] py-[15px]">

                <div className="flex gap-[10px] items-center">

                  <div className="bg-[#18865b] h-[20px] rounded-[2px] shrink-0 w-[4px]" />

                  <p className="font-bold text-[#142033] text-[16px]">
                    Current Patient
                  </p>

                </div>


                <StatusBadge
                  status="In consultation"
                  showDot={false}
                />

              </div>


              <div className="flex gap-[18px] items-center p-[20px]">

                <PatientInitials
                  initials={
                    currentPatient.initials
                  }
                  size="lg"
                />


                <div className="flex flex-col gap-[5px] flex-1 min-w-0">

                  <p className="font-bold text-[#142033] text-[18px]">
                    {currentPatient.name}
                  </p>


                  <p className="font-normal text-[#526176] text-[12px]">
                    {currentPatient.consultationType}
                  </p>


                  <p className="font-semibold text-[#155ead] text-[12px]">
                    Appointment{' '}
                    {currentPatient.appointmentTime}
                  </p>

                </div>


                <div className="bg-[#f4f7fb] flex flex-col gap-[3px] items-center px-[16px] py-[11px] rounded-[12px] shrink-0">

                  <p className="font-bold text-[#7b899c] text-[9px]">
                    TOKEN
                  </p>


                  <p className="font-bold text-[#142033] text-[20px]">
                    {currentPatient.token}
                  </p>

                </div>

              </div>


              <div className="flex flex-wrap gap-[10px] items-center pb-[18px] px-[20px]">

                <Button
                  variant="secondary"
                  onClick={
                    handleViewPatient
                  }
                >
                  View Patient
                </Button>


                <Button
                  variant="success"
                  onClick={() => {

                    completeConsultation();

                    navigate(
                      '/doctor/queue'
                    );

                  }}
                >
                  Complete
                </Button>


                <Button
                  variant="danger"
                  onClick={() => {

                    skipPatient();

                    navigate(
                      '/doctor/queue'
                    );

                  }}
                >
                  Skip
                </Button>

              </div>

            </div>

          ) : (

            <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[32px] flex flex-col items-center justify-center gap-[8px]">

              <p className="font-bold text-[#142033] text-[16px]">
                No Active Consultation
              </p>


              <p className="font-normal text-[#7b899c] text-[13px]">
                No patient is currently in consultation.
              </p>


              {waitingPatients.length > 0 && (

                <Button
                  variant="primary"
                  className="mt-[8px]"
                  onClick={
                    callNextPatient
                  }
                >
                  Call Next Patient
                </Button>

              )}

            </div>

          )}


          {/* ========================================= */}
          {/* QUEUE PREVIEW */}
          {/* ========================================= */}

          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] px-[20px] py-[16px]">

            <div className="flex flex-wrap items-center justify-between gap-[10px] mb-[12px]">

              <div>

                <p className="font-bold text-[#142033] text-[16px]">
                  Current Queue
                </p>


                <p className="font-normal text-[#7b899c] text-[11px]">

                  {totalWaiting}{' '}
                  patients waiting ·
                  Live backend queue

                </p>

              </div>


              <button
                onClick={() =>
                  navigate(
                    '/doctor/queue'
                  )
                }
                className="bg-[#155ead] flex gap-[8px] items-center px-[16px] py-[10px] rounded-[10px] cursor-pointer hover:bg-[#1250a0] transition-colors border border-[#155ead]"
              >

                <div className="relative shrink-0 size-[15px]">

                  <img
                    alt=""
                    className="absolute block inset-0 size-full"
                    src={imgMegaphone}
                  />

                </div>


                <p className="font-bold text-[13px] text-white whitespace-nowrap leading-none">
                  Call Next Patient
                </p>

              </button>

            </div>


            {previewQueue.length === 0 ? (

              <div className="border-t border-[#d8e1ec] pt-[20px] text-center">

                <p className="font-normal text-[#7b899c] text-[13px]">
                  Queue is empty
                </p>

              </div>

            ) : (

              previewQueue.map(
                (appointment, index) => (

                  <div
                    key={
                      appointment.id
                    }
                    className="border-[#d8e1ec] border-t flex gap-[14px] items-center py-[13px] cursor-pointer hover:bg-[#f4f7fb] -mx-[20px] px-[20px] transition-colors"
                    onClick={() =>
                      handleQueueRowClick(
                        String(
                          appointment.id
                        )
                      )
                    }
                  >

                    <div
                      className={`flex flex-col h-[32px] items-center justify-center rounded-[8px] shrink-0 w-[54px] ${
                        index === 0
                          ? 'bg-[#fff4de]'
                          : 'bg-[#eaf3fd]'
                      }`}
                    >

                      <p
                        className={`font-bold text-[12px] ${
                          index === 0
                            ? 'text-[#a86508]'
                            : 'text-[#155ead]'
                        }`}
                      >
                        {appointment.tokenNumber}
                      </p>

                    </div>


                    <div className="flex flex-col gap-[3px] flex-1 min-w-0">

                      <p className="font-normal text-[#142033] text-[14px]">
                        {appointment.patientName}
                      </p>


                      <p className="font-normal text-[#7b899c] text-[11px]">

                        {appointment.priority
                          ? appointment.priority
                          : 'Normal'}

                      </p>

                    </div>


                    <p className="font-semibold text-[#526176] text-[12px] whitespace-nowrap">

                      {appointment.appointmentTime}

                    </p>

                  </div>

                )
              )

            )}

          </div>

        </div>


        {/* =========================================== */}
        {/* RIGHT: DOCTOR STATUS */}
        {/* =========================================== */}

        <div className="bg-white border border-[#d8e1ec] flex flex-col gap-[14px] items-start p-[18px] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] w-full lg:w-[300px] lg:shrink-0">

          <div className="flex flex-col gap-[8px] w-full">

            <p className="font-bold text-[#142033] text-[16px]">
              Doctor Status
            </p>


            <StatusBadge
              status={doctorStatus}
            />

          </div>


          <div className="bg-[#e8f7f1] flex flex-col gap-[10px] items-start p-[12px] rounded-[12px] w-full">

            <div className="relative shrink-0 size-[10px]">

              <img
                alt=""
                className="absolute block inset-0 size-full"
                src={imgIndicator}
              />

            </div>


            <div>

              <p className="font-bold text-[#18865b] text-[13px]">
                {doctorStatus}
              </p>


              <p className="font-normal text-[#526176] text-[10px]">

                {doctorStatus ===
                'Available'
                  ? 'Accepting next patient'
                  : 'Status updated'}

              </p>

            </div>

          </div>


          <button
            onClick={() =>
              setStatusMenuOpen(
                !statusMenuOpen
              )
            }
            className="border border-[#d8e1ec] flex items-center justify-between px-[12px] py-[10px] rounded-[8px] w-full cursor-pointer hover:bg-[#f4f7fb] transition-colors"
          >

            <p className="font-bold text-[#142033] text-[12px]">
              Change Status
            </p>


            <div
              className={`relative shrink-0 size-[14px] transition-transform ${
                statusMenuOpen
                  ? ''
                  : 'rotate-180'
              }`}
            >

              <img
                alt=""
                className="absolute block inset-0 size-full"
                src={imgChevronUp}
              />

            </div>

          </button>


          {statusMenuOpen && (

            <div className="bg-white border border-[#d8e1ec] flex flex-col gap-[2px] p-[6px] rounded-[12px] w-full">

              {statusOptions.map(
                (opt) => (

                  <button
                    key={opt.label}
                    onClick={() =>
                      handleStatusChange(
                        opt.label
                      )
                    }
                    className={`flex gap-[10px] items-center px-[12px] py-[9px] rounded-[8px] w-full cursor-pointer transition-colors ${
                      doctorStatus ===
                      opt.label
                        ? 'bg-[#eaf3fd]'
                        : 'bg-white hover:bg-[#f4f7fb]'
                    }`}
                  >

                    <div className="relative shrink-0 size-[8px]">

                      <img
                        alt=""
                        className="absolute block inset-0 size-full"
                        src={opt.icon}
                      />

                    </div>


                    <p
                      className={`text-[#142033] text-[13px] flex-1 text-left ${
                        doctorStatus ===
                        opt.label
                          ? 'font-bold'
                          : 'font-medium'
                      }`}
                    >
                      {opt.label}
                    </p>


                    {doctorStatus ===
                      opt.label && (

                      <div className="relative shrink-0 size-[14px]">

                        <img
                          alt=""
                          className="absolute block inset-0 size-full"
                          src={imgCheck}
                        />

                      </div>

                    )}

                  </button>

                )
              )}

            </div>

          )}


          <div className="bg-[#f4f7fb] flex flex-col gap-[4px] items-start p-[12px] rounded-[8px] w-full">

            <p className="font-bold text-[#7b899c] text-[10px] uppercase">
              Department
            </p>


            <p className="font-normal text-[#142033] text-[13px]">

              {doctor?.department?.name ||
                'Not assigned'}

            </p>

          </div>

        </div>

      </div>

    </DoctorLayout>
  );
}