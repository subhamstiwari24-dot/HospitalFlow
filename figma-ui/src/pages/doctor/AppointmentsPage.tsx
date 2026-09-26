import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DoctorLayout from '../../components/DoctorLayout';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDoctorAppointments } from '../../components/Skeleton';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import PatientInitials from '../../components/PatientInitials';
import EmptyState, { EmptyIcons } from '../../components/EmptyState';

const imgCalendar1 = '/assets/a41a3.svg';


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
// TODAY
// =====================================================

function getTodayDate(): string {

  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      now.getDate()
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


function formatToday(): string {

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
// STATUS MAPPING
// =====================================================

function getDisplayStatus(
  status: string
): string {

  switch (
    status?.toUpperCase()
  ) {

    case 'WAITING':
      return 'Scheduled';

    case 'IN_PROGRESS':
      return 'In Progress';

    case 'COMPLETED':
      return 'Completed';

    case 'CANCELLED':
      return 'Cancelled';

    case 'SKIPPED':
      return 'Skipped';

    default:
      return status || 'Scheduled';
  }
}


// =====================================================
// INITIALS
// =====================================================

function getInitials(
  name: string
): string {

  if (!name) {
    return 'PT';
  }

  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}


// =====================================================
// TIME SORT
// =====================================================

function getTimeValue(
  time?: string
): number {

  if (!time) {
    return Number.MAX_SAFE_INTEGER;
  }

  const match =
    time.match(
      /(\d{1,2}):(\d{2})\s*(AM|PM)?/i
    );

  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  let hour =
    Number(match[1]);

  const minute =
    Number(match[2]);

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

  return (
    hour * 60 +
    minute
  );
}


// =====================================================
// MAIN COMPONENT
// =====================================================

export default function AppointmentsPage() {

  const navigate =
    useNavigate();

  const loading =
    usePageLoad(500);


  // ===================================================
  // STATE
  // ===================================================

  const [doctor, setDoctor] =
    useState<BackendDoctor | null>(
      null
    );

  const [
    appointments,
    setAppointments,
  ] = useState<
    BackendAppointment[]
  >([]);

  const [
    loadingBackend,
    setLoadingBackend,
  ] = useState(true);

  const [error, setError] =
    useState('');

  const today = getTodayDate();


  // ===================================================
  // FETCH BACKEND DATA
  // ===================================================

  useEffect(() => {

    const loadAppointments =
      async () => {

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


          if (
            !doctorsResponse.ok
          ) {
            throw new Error(
              'Failed to load doctors'
            );
          }


          if (
            !appointmentsResponse.ok
          ) {
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


          // -------------------------------------------
          // FIND LOGGED-IN DOCTOR
          // -------------------------------------------

          let selectedDoctor:
            BackendDoctor | undefined;


          const storedDoctor =
            sessionStorage.getItem(
              'hospitalflow_doctor'
            );


          if (storedDoctor) {

            try {

              const parsed =
                JSON.parse(
                  storedDoctor
                );

              const doctorId =
                Number(
                  parsed?.doctorId
                );


              if (
                Number.isFinite(
                  doctorId
                )
              ) {

                selectedDoctor =
                  doctorsData.find(
                    (item) =>
                      item.id ===
                      doctorId
                  );

              }

            } catch {

              // Invalid session data.
              // Fallback below.

            }

          }


          setDoctor(
            selectedDoctor ?? null
          );


          // -------------------------------------------
          // FILTER TODAY'S APPOINTMENTS
          // FOR THIS DOCTOR
          // -------------------------------------------

          if (!selectedDoctor) {
            navigate('/login', { replace: true });
            return;
          }


            const doctorAppointments =
              appointmentsData
                .filter(
                  (appointment) =>
                    appointment.appointmentDate ===
                      today &&
                    appointment.doctor?.id ===
                      selectedDoctor.id
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


            setAppointments(
              doctorAppointments
            );

        } catch (err) {

          console.error(
            'Doctor appointments error:',
            err
          );

          setError(
            'Unable to load appointments from backend.'
          );

        } finally {

          setLoadingBackend(false);

        }

      };


    loadAppointments();

  }, []);


  // ===================================================
  // STATS
  // ===================================================

  const total =
    appointments.length;


  const completed =
    appointments.filter(
      (appointment) =>
        appointment.status
          ?.toUpperCase() ===
        'COMPLETED'
    ).length;


  const inProgress =
    appointments.filter(
      (appointment) =>
        appointment.status
          ?.toUpperCase() ===
        'IN_PROGRESS'
    ).length;


  const scheduled =
    appointments.filter(
      (appointment) =>
        appointment.status
          ?.toUpperCase() ===
          'WAITING'
    ).length;


  // ===================================================
  // SORTED APPOINTMENTS
  // ===================================================

  const sortedAppointments =
    useMemo(() => {

      return [...appointments]
        .sort(
          (a, b) =>
            getTimeValue(
              a.appointmentTime
            ) -
            getTimeValue(
              b.appointmentTime
            )
        );

    }, [appointments]);


  // ===================================================
  // VIEW PATIENT
  // ===================================================

  const handleViewPatient = (
    appointment: BackendAppointment
  ) => {

    /*
     * PatientDetailsPage can later receive the
     * appointment ID through query params.
     *
     * For now we send the appointment ID so the
     * next doctor-module step can use it.
     */

    navigate(
      `/doctor/patients?id=${appointment.id}`
    );

  };


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (
      <DoctorLayout
        title="Appointments"
      >
        <SkDoctorAppointments />
      </DoctorLayout>
    );

  }


  // ===================================================
  // UI
  // ===================================================

  return (
    <DoctorLayout
      title="Appointments"
    >

      {/* ============================================= */}
      {/* HEADER */}
      {/* ============================================= */}

      <div className="flex flex-wrap items-start gap-[12px] justify-between mb-[24px]">

        <div>

          <h1 className="font-bold text-[#142033] text-[24px] leading-tight">
            Appointments
          </h1>


          <p className="font-normal text-[#526176] text-[14px] mt-[4px]">

            {doctor?.name
              ? `${doctor.name} · Today's scheduled appointments`
              : "Today's scheduled appointments"}

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
      {/* ERROR */}
      {/* ============================================= */}

      {error && (

        <div className="mb-[20px] rounded-[10px] border border-[#f1b5ba] bg-[#fff1f2] px-[14px] py-[11px]">

          <p className="font-medium text-[#b4232f] text-[13px]">
            {error}
          </p>

        </div>

      )}


      {/* ============================================= */}
      {/* BACKEND LOADING */}
      {/* ============================================= */}

      {loadingBackend ? (

        <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[40px] text-center mb-[24px]">

          <p className="text-[#526176] text-[13px]">
            Loading appointments...
          </p>

        </div>

      ) : (

        <>


          {/* ========================================= */}
          {/* STATS */}
          {/* ========================================= */}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-[10px] mb-[24px]">

            {[
              {
                label: 'Total',
                value: total,
                bg: 'bg-[#eaf3fd]',
                text: 'text-[#155ead]',
              },
              {
                label: 'Completed',
                value: completed,
                bg: 'bg-[#e8f7f1]',
                text: 'text-[#18865b]',
              },
              {
                label: 'In Progress',
                value: inProgress,
                bg: 'bg-[#e8f7f1]',
                text: 'text-[#18865b]',
              },
              {
                label: 'Scheduled',
                value: scheduled,
                bg: 'bg-[#f4f7fb]',
                text: 'text-[#526176]',
              },
            ].map(
              (stat) => (

                <div
                  key={stat.label}
                  className={`${stat.bg} flex-1 flex flex-col items-center py-[16px] rounded-[14px]`}
                >

                  <p
                    className={`font-bold text-[24px] ${stat.text}`}
                  >
                    {stat.value}
                  </p>


                  <p className="font-normal text-[#526176] text-[12px]">
                    {stat.label}
                  </p>

                </div>

              )
            )}

          </div>


          {/* ========================================= */}
          {/* MOBILE LIST */}
          {/* ========================================= */}

          <div className="sm:hidden bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden divide-y divide-[#d8e1ec]">

            {sortedAppointments.length === 0 ? (

              <EmptyState
                icon={
                  EmptyIcons.calendar(28)
                }
                title="No appointments today"
                description="There are no appointments scheduled for this doctor today."
              />

            ) : (

              sortedAppointments.map(
                (appointment) => (

                  <div
                    key={
                      appointment.id
                    }
                    className="p-[16px]"
                  >

                    <div className="flex items-center gap-[10px] mb-[10px]">

                      {/* TOKEN */}

                      <div className="bg-[#eaf3fd] flex h-[30px] items-center justify-center rounded-[8px] w-[54px] shrink-0">

                        <p className="font-bold text-[#155ead] text-[12px]">
                          {
                            appointment.tokenNumber
                          }
                        </p>

                      </div>


                      {/* PATIENT */}

                      <div className="flex items-center gap-[8px] flex-1 min-w-0">

                        <PatientInitials
                          initials={getInitials(
                            appointment.patientName
                          )}
                          size="sm"
                        />


                        <div className="min-w-0">

                          <p className="font-semibold text-[#142033] text-[14px] truncate">

                            {
                              appointment.patientName
                            }

                          </p>


                          <p className="font-normal text-[#7b899c] text-[11px]">

                            Patient

                          </p>

                        </div>

                      </div>


                      {/* STATUS */}

                      <StatusBadge
                        status={getDisplayStatus(
                          appointment.status
                        )}
                      />

                    </div>


                    <div className="flex items-center justify-between gap-[10px]">

                      <p className="font-normal text-[#526176] text-[12px] truncate">

                        {
                          appointment.appointmentTime
                        }

                        {' · '}

                        OPD Consultation

                      </p>


                      <Button
                        variant="secondary"
                        onClick={() =>
                          handleViewPatient(
                            appointment
                          )
                        }
                      >
                        View
                      </Button>

                    </div>

                  </div>

                )
              )

            )}

          </div>


          {/* ========================================= */}
          {/* DESKTOP TABLE */}
          {/* ========================================= */}

          <div className="hidden sm:block overflow-x-auto">

            <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">


              {/* TABLE HEADER */}

              <div className="grid grid-cols-[80px_1fr_130px_130px_120px_100px] gap-[16px] px-[20px] py-[12px] bg-[#f4f7fb] border-b border-[#d8e1ec]">

                {[
                  'Token',
                  'Patient',
                  'Time',
                  'Type',
                  'Status',
                  'Action',
                ].map(
                  (heading) => (

                    <p
                      key={heading}
                      className="font-semibold text-[#7b899c] text-[11px] uppercase"
                    >
                      {heading}
                    </p>

                  )
                )}

              </div>


              {/* EMPTY */}

              {sortedAppointments.length === 0 ? (

                <EmptyState
                  icon={
                    EmptyIcons.calendar(28)
                  }
                  title="No appointments today"
                  description="There are no appointments scheduled for this doctor today."
                />

              ) : (

                sortedAppointments.map(
                  (appointment) => (

                    <div
                      key={
                        appointment.id
                      }
                      className="grid grid-cols-[80px_1fr_130px_130px_120px_100px] gap-[16px] items-center px-[20px] py-[14px] border-b border-[#d8e1ec] last:border-0 hover:bg-[#f4f7fb] transition-colors"
                    >


                      {/* TOKEN */}

                      <div className="bg-[#eaf3fd] flex h-[30px] items-center justify-center rounded-[8px] w-[54px]">

                        <p className="font-bold text-[#155ead] text-[12px]">

                          {
                            appointment.tokenNumber
                          }

                        </p>

                      </div>


                      {/* PATIENT */}

                      <div className="flex gap-[10px] items-center min-w-0">

                        <PatientInitials
                          initials={getInitials(
                            appointment.patientName
                          )}
                          size="sm"
                        />


                        <div className="min-w-0">

                          <p className="font-semibold text-[#142033] text-[14px] truncate">

                            {
                              appointment.patientName
                            }

                          </p>


                          <p className="font-normal text-[#7b899c] text-[11px]">

                            Patient

                          </p>

                        </div>

                      </div>


                      {/* TIME */}

                      <p className="font-semibold text-[#142033] text-[13px]">

                        {
                          appointment.appointmentTime
                        }

                      </p>


                      {/* TYPE */}

                      <p className="font-normal text-[#526176] text-[13px] truncate">

                        OPD Consultation

                      </p>


                      {/* STATUS */}

                      <StatusBadge
                        status={getDisplayStatus(
                          appointment.status
                        )}
                      />


                      {/* ACTION */}

                      <Button
                        variant="secondary"
                        onClick={() =>
                          handleViewPatient(
                            appointment
                          )
                        }
                      >
                        View
                      </Button>

                    </div>

                  )
                )

              )}

            </div>

          </div>

        </>

      )}

    </DoctorLayout>
  );
}