import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PatientLayout from '../../components/PatientLayout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { usePatient } from '../../context/PatientContext';
import { ErrorState } from '../../components/EmptyState';

const API_URL = '/api';

interface Appointment {
  id: number;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: number | string;
  status: string;
  priority?: string;
  doctor?: {
    id: number;
  };
}

interface QueueAppointment {
  id: number;
  tokenNumber: number | string;
  status: string;
  priority?: string;
  appointmentDate: string;
  appointmentTime: string;
  doctor?: {
    id: number;
  };
}

interface QueuePositionResponse {
  tokenNumber: number | string;
  position: number;
  patientsAhead: number;
  status: string;
}

interface WaitingTimeResponse {
  tokenNumber: number | string;
  patientsAhead: number;
  estimatedMinMinutes: number;
  estimatedMaxMinutes: number;
  message: string;
}

type QueueStatus =
  | 'Waiting'
  | 'In consultation'
  | 'Completed'
  | 'Skipped';

interface QueueItem {
  id: number;
  token: string;
  status: QueueStatus;
}

/* =========================================================
   TOKEN FORMAT
========================================================= */

function formatToken(tokenNumber: number | string) {
  const token = String(tokenNumber);

  if (token.startsWith('A')) {
    return token;
  }

  return `A${token}`;
}

/* =========================================================
   STATUS MAPPING
========================================================= */

function mapStatus(status: string): QueueStatus {
  const normalized = String(status ?? '').toUpperCase();

  if (
    normalized === 'IN_PROGRESS' ||
    normalized === 'IN PROGRESS'
  ) {
    return 'In consultation';
  }

  if (normalized === 'COMPLETED') {
    return 'Completed';
  }

  if (normalized === 'SKIPPED') {
    return 'Skipped';
  }

  return 'Waiting';
}

/* =========================================================
   PRIORITY
========================================================= */

function priorityValue(priority?: string) {
  const normalized = String(priority ?? 'NORMAL').toUpperCase();

  if (normalized === 'EMERGENCY') {
    return 3;
  }

  if (normalized === 'PRIORITY') {
    return 2;
  }

  return 1;
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDisplayDate(date: string) {
  if (!date) {
    return '—';
  }

  try {
    const parsed = new Date(`${date}T00:00:00`);

    return parsed.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return date;
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TokenDetailsPage() {
  const navigate = useNavigate();
  const { booking } = usePatient();

  /* -------------------------------------------------------
     QUEUE
  ------------------------------------------------------- */

  const [queueTokens, setQueueTokens] =
    useState<QueueItem[]>([]);

  /* -------------------------------------------------------
     LIVE QUEUE DATA
  ------------------------------------------------------- */

  const [currentServing, setCurrentServing] =
    useState('—');

  const [patientsAhead, setPatientsAhead] =
    useState(0);

  const [estimatedMin, setEstimatedMin] =
    useState(0);

  const [estimatedMax, setEstimatedMax] =
    useState(0);

  const [myStatus, setMyStatus] =
    useState<QueueStatus>('Waiting');

  /* -------------------------------------------------------
     UI STATE
  ------------------------------------------------------- */

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  /* =======================================================
     REDIRECT IF BOOKING IS MISSING
  ======================================================= */

  useEffect(() => {
    if (!booking) {
      navigate('/patient/hospital');
    }
  }, [booking, navigate]);

  /* =======================================================
     LOAD TOKEN DATA
  ======================================================= */

  const loadTokenData = useCallback(async () => {
    if (!booking?.bookingId) {
      return;
    }

    try {
      setError('');

      /* ---------------------------------------------------
         GET APPOINTMENT ID
      --------------------------------------------------- */

      let appointmentId =
        booking.appointmentId;

      /*
       * Fallback:
       * BK-29 -> 29
       */

      if (!appointmentId) {
        const bookingId =
          String(booking.bookingId);

        const numericId =
          Number(
            bookingId.replace('BK-', '')
          );

        if (
          Number.isFinite(numericId) &&
          numericId > 0
        ) {
          appointmentId = numericId;
        }
      }

      if (
        !appointmentId ||
        !Number.isFinite(
          Number(appointmentId)
        )
      ) {
        throw new Error(
          'Invalid appointment ID.'
        );
      }

      const numericAppointmentId =
        Number(appointmentId);

      /* =================================================
         1. GET MY APPOINTMENT
      ================================================= */

      const appointmentResponse =
        await fetch(
          `${API_URL}/appointments/${numericAppointmentId}`
        );

      if (!appointmentResponse.ok) {
        throw new Error(
          `Unable to load appointment. Status: ${appointmentResponse.status}`
        );
      }

      const appointment: Appointment =
        await appointmentResponse.json();

      /* ---------------------------------------------------
         DOCTOR ID
      --------------------------------------------------- */

      const doctorId =
        appointment.doctor?.id ??
        Number(booking.doctorId);

      if (!doctorId) {
        throw new Error(
          'Doctor information is missing.'
        );
      }

      /* ---------------------------------------------------
         APPOINTMENT DATE
      --------------------------------------------------- */

      const appointmentDate =
        appointment.appointmentDate;

      if (!appointmentDate) {
        throw new Error(
          'Appointment date is missing.'
        );
      }

      /* =================================================
         2. GET WAITING QUEUE
      ================================================= */

      const queueResponse =
        await fetch(
          `${API_URL}/appointments/queue?doctorId=${doctorId}&appointmentDate=${appointmentDate}`
        );

      let waitingQueue: QueueAppointment[] = [];

      if (queueResponse.ok) {
        const queueData =
          await queueResponse.json();

        if (Array.isArray(queueData)) {
          waitingQueue = queueData;
        }
      }

      /* =================================================
         3. GET ALL APPOINTMENTS
         
         This is important because the queue endpoint
         may contain WAITING patients only.

         We use all appointments to find:
         - IN_PROGRESS patient
         - completed patients
         - exact queue state
      ================================================= */

      let allAppointments: Appointment[] = [];

      try {
        const allResponse =
          await fetch(
            `${API_URL}/appointments`
          );

        if (allResponse.ok) {
          const allData =
            await allResponse.json();

          if (Array.isArray(allData)) {
            allAppointments =
              allData.filter(
                (item: Appointment) =>
                  Number(
                    item.doctor?.id
                  ) === Number(doctorId) &&
                  item.appointmentDate ===
                    appointmentDate
              );
          }
        }
      } catch (allError) {
        console.warn(
          'Could not load all appointments:',
          allError
        );
      }

      /* =================================================
         4. CREATE COMPLETE QUEUE SOURCE
      ================================================= */

      /*
       * If /appointments worked, use it.
       * Otherwise fall back to queue endpoint.
       */

      const sourceAppointments =
        allAppointments.length > 0
          ? allAppointments
          : waitingQueue.map(
              (item) => ({
                id: item.id,
                patientName: '',
                appointmentDate:
                  item.appointmentDate,
                appointmentTime:
                  item.appointmentTime,
                tokenNumber:
                  item.tokenNumber,
                status: item.status,
                priority: item.priority,
                doctor: item.doctor,
              })
            );

      /* =================================================
         5. FIND CURRENTLY SERVING PATIENT
      ================================================= */

      const servingPatient =
        sourceAppointments.find(
          (item) =>
            String(item.status)
              .toUpperCase() ===
              'IN_PROGRESS'
        );

      if (servingPatient) {
        setCurrentServing(
          formatToken(
            servingPatient.tokenNumber
          )
        );
      } else {
        setCurrentServing('—');
      }

      /* =================================================
         6. MY STATUS
      ================================================= */

      const currentStatus =
        mapStatus(
          appointment.status
        );

      setMyStatus(currentStatus);

      /* =================================================
         7. BUILD QUEUE FOR UI
      ================================================= */

      const activeAppointments =
        sourceAppointments
          .filter((item) => {
            const status =
              String(item.status)
                .toUpperCase();

            return (
              status !== 'CANCELLED'
            );
          })
          .sort((a, b) => {
            /*
             * IN_PROGRESS first
             */
            const statusOrder: Record<
              string,
              number
            > = {
              IN_PROGRESS: 0,
              WAITING: 1,
              COMPLETED: 2,
              SKIPPED: 3,
            };

            const aStatus =
              String(a.status)
                .toUpperCase();

            const bStatus =
              String(b.status)
                .toUpperCase();

            const statusDifference =
              (statusOrder[aStatus] ?? 1) -
              (statusOrder[bStatus] ?? 1);

            if (
              statusDifference !== 0
            ) {
              return statusDifference;
            }

            /*
             * Priority applies mainly to
             * waiting patients.
             */

            if (
              aStatus === 'WAITING' &&
              bStatus === 'WAITING'
            ) {
              const priorityDifference =
                priorityValue(
                  b.priority
                ) -
                priorityValue(
                  a.priority
                );

              if (
                priorityDifference !== 0
              ) {
                return priorityDifference;
              }
            }

            /*
             * Older appointment first
             */

            return (
              Number(a.id) -
              Number(b.id)
            );
          });

      const mappedQueue: QueueItem[] =
        activeAppointments.map(
          (item) => ({
            id: item.id,
            token: formatToken(
              item.tokenNumber
            ),
            status: mapStatus(
              item.status
            ),
          })
        );

      setQueueTokens(
        mappedQueue
      );

      /* =================================================
         8. CALCULATE PATIENTS AHEAD LOCALLY
         
         This prevents the UI from showing 0 when the
         queue-position endpoint is temporarily unavailable.
      ================================================= */

      let calculatedPatientsAhead = 0;

      const myIndex =
        activeAppointments.findIndex(
          (item) =>
            Number(item.id) ===
            numericAppointmentId
        );

      if (
        myIndex >= 0 &&
        currentStatus !== 'In consultation' &&
        currentStatus !== 'Completed' &&
        currentStatus !== 'Skipped'
      ) {
        for (
          let i = 0;
          i < myIndex;
          i++
        ) {
          const status =
            String(
              activeAppointments[i]
                .status
            ).toUpperCase();

          /*
           * Only active patients ahead
           */
          if (
            status === 'WAITING' ||
            status === 'IN_PROGRESS'
          ) {
            calculatedPatientsAhead++;
          }
        }
      }

      /* =================================================
         9. TRY REAL QUEUE POSITION API
      ================================================= */

      try {
        const positionResponse =
          await fetch(
            `${API_URL}/appointments/${numericAppointmentId}/queue-position`
          );

        if (positionResponse.ok) {
          const positionData:
            QueuePositionResponse =
            await positionResponse.json();

          const backendAhead =
            Number(
              positionData
                ?.patientsAhead
            );

          if (
            Number.isFinite(
              backendAhead
            )
          ) {
            calculatedPatientsAhead =
              backendAhead;
          }
        }
      } catch (positionError) {
        console.warn(
          'Queue position API unavailable, using local calculation:',
          positionError
        );
      }

      if (
        currentStatus ===
        'In consultation'
      ) {
        calculatedPatientsAhead = 0;
      }

      if (
        currentStatus ===
        'Completed'
      ) {
        calculatedPatientsAhead = 0;
      }

      if (
        currentStatus ===
        'Skipped'
      ) {
        calculatedPatientsAhead = 0;
      }

      setPatientsAhead(
        Math.max(
          calculatedPatientsAhead,
          0
        )
      );

      /* =================================================
         10. TRY AI WAITING-TIME API
      ================================================= */

      let finalMin =
        Math.max(
          calculatedPatientsAhead * 10,
          0
        );

      let finalMax =
        Math.max(
          calculatedPatientsAhead * 12,
          0
        );

      try {
        const waitingResponse =
          await fetch(
            `${API_URL}/appointments/${numericAppointmentId}/waiting-time`
          );

        if (waitingResponse.ok) {
          const waitingData:
            WaitingTimeResponse =
            await waitingResponse.json();

          const backendMin =
            Number(
              waitingData
                ?.estimatedMinMinutes
            );

          const backendMax =
            Number(
              waitingData
                ?.estimatedMaxMinutes
            );

          if (
            Number.isFinite(
              backendMin
            ) &&
            Number.isFinite(
              backendMax
            )
          ) {
            finalMin =
              Math.max(
                backendMin,
                0
              );

            finalMax =
              Math.max(
                backendMax,
                finalMin
              );
          }
        }
      } catch (waitingError) {
        console.warn(
          'Waiting-time API unavailable, using queue calculation:',
          waitingError
        );
      }

      /* ---------------------------------------------------
         SPECIAL STATUS HANDLING
      --------------------------------------------------- */

      if (
        currentStatus ===
        'In consultation'
      ) {
        finalMin = 0;
        finalMax = 0;
      }

      if (
        currentStatus ===
        'Completed'
      ) {
        finalMin = 0;
        finalMax = 0;
      }

      if (
        currentStatus ===
        'Skipped'
      ) {
        finalMin = 0;
        finalMax = 0;
      }

      setEstimatedMin(
        finalMin
      );

      setEstimatedMax(
        finalMax
      );

    } catch (err) {
      console.error(
        'Token tracker error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load token information.'
      );

    } finally {
      setLoading(false);
    }
  }, [booking]);

  /* =======================================================
     INITIAL LOAD + LIVE REFRESH
  ======================================================= */

  useEffect(() => {
    if (!booking) {
      return;
    }

    loadTokenData();

    const interval =
      window.setInterval(() => {
        loadTokenData();
      }, 5000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    booking,
    loadTokenData,
  ]);

  /* =======================================================
     NO BOOKING
  ======================================================= */

  if (!booking) {
    return null;
  }

  /* =======================================================
     DISPLAY VALUES
  ======================================================= */

  const myToken =
    booking.token;

  const waitText =
    myStatus ===
    'In consultation'
      ? 'Your turn!'
      : myStatus ===
        'Completed'
      ? 'Completed'
      : myStatus ===
        'Skipped'
      ? 'Skipped'
      : estimatedMin ===
        estimatedMax
      ? `~${estimatedMin} min`
      : `${estimatedMin}-${estimatedMax} min`;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <PatientLayout
      step={4}
      showBack={false}
      maxWidth="max-w-[640px]"
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="text-center mb-[28px]">

        <h1 className="font-bold text-[#142033] text-[24px] mb-[4px]">
          Token Tracker
        </h1>

        <p className="font-normal text-[#526176] text-[14px]">
          {booking.doctorName} ·{' '}
          {booking.departmentName}
        </p>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && !loading && (

        <div className="mb-[16px]">

          <ErrorState
            compact
            description={error}
            onRetry={loadTokenData}
          />

        </div>

      )}

      {/* =================================================
          MY TOKEN
      ================================================= */}

      <div className="bg-[#13243a] rounded-[14px] p-[20px] sm:p-[32px] text-center mb-[20px]">

        <p className="font-semibold text-[#afc0d3] text-[12px] uppercase tracking-widest mb-[12px]">
          Your Token
        </p>

        <p className="font-bold text-white text-[64px] leading-none mb-[16px]">
          {myToken}
        </p>

        <div className="flex justify-center">

          <StatusBadge
            status={myStatus}
          />

        </div>

      </div>

      {/* =================================================
          QUEUE STATS
      ================================================= */}

      <div className="grid grid-cols-3 gap-[12px] mb-[20px]">

        {[
          {
            label: 'Currently Serving',
            value:
              loading
                ? '...'
                : currentServing,
            accent: true,
          },

          {
            label: 'Patients Ahead',
            value:
              loading
                ? '...'
                : myStatus ===
                  'In consultation'
                ? '0'
                : myStatus ===
                  'Completed'
                ? '0'
                : String(
                    patientsAhead
                  ),
            accent: false,
          },

          {
            label: 'Est. Wait',
            value:
              loading
                ? '...'
                : waitText,
            accent: false,
          },
        ].map(
          (stat) => (

            <div
              key={stat.label}
              className={`rounded-[14px] p-[16px] text-center border ${
                stat.accent
                  ? 'bg-[#eaf3fd] border-[#c3d9f7]'
                  : 'bg-white border-[#d8e1ec] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]'
              }`}
            >

              <p
                className={`font-bold text-[20px] mb-[4px] ${
                  stat.accent
                    ? 'text-[#155ead]'
                    : 'text-[#142033]'
                }`}
              >
                {stat.value}
              </p>

              <p className="font-normal text-[#7b899c] text-[11px]">
                {stat.label}
              </p>

            </div>

          )
        )}

      </div>

      {/* =================================================
          LIVE INDICATOR
      ================================================= */}

      <div className="flex items-center justify-center gap-[6px] mb-[16px]">

        <span className="size-[7px] rounded-full bg-[#18865b] animate-pulse" />

        <span className="text-[11px] font-semibold text-[#18865b]">
          {loading
            ? 'Updating queue...'
            : 'Live queue • Updates every 5 seconds'}
        </span>

      </div>

      {/* =================================================
          QUEUE PROGRESS
      ================================================= */}

      <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] mb-[20px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]">

        <p className="font-bold text-[#142033] text-[13px] mb-[14px]">
          Queue Progress
        </p>

        {queueTokens.length > 0 ? (

          <div className="flex items-center gap-[6px] flex-wrap">

            {queueTokens.map(
              (t) => {

                const isMe =
                  t.token ===
                  myToken;

                const bg =
                  t.status ===
                  'Completed'
                    ? 'bg-[#d8e1ec]'
                    : t.status ===
                      'In consultation'
                    ? 'bg-[#18865b]'
                    : isMe
                    ? 'bg-[#155ead]'
                    : 'bg-[#eaf3fd]';

                return (

                  <div
                    key={t.id}
                    title={t.token}
                    className={`h-[8px] flex-1 rounded-[4px] min-w-[20px] ${bg} transition-all`}
                  />

                );
              }
            )}

          </div>

        ) : (

          <p className="text-center text-[#7b899c] text-[12px] py-[10px]">
            Loading queue...
          </p>

        )}

        <div className="flex items-center justify-between mt-[8px]">

          <p className="font-normal text-[#7b899c] text-[11px]">
            Start
          </p>

          <p className="font-normal text-[#7b899c] text-[11px]">
            End
          </p>

        </div>

        <div className="flex items-center gap-[16px] mt-[10px] flex-wrap">

          {[
            {
              color: 'bg-[#18865b]',
              label: 'In consultation',
            },

            {
              color: 'bg-[#155ead]',
              label: 'Your token',
            },

            {
              color:
                'bg-[#eaf3fd] border border-[#c3d9f7]',
              label: 'Waiting',
            },

            {
              color: 'bg-[#d8e1ec]',
              label: 'Completed',
            },
          ].map(
            (leg) => (

              <div
                key={leg.label}
                className="flex items-center gap-[5px]"
              >

                <div
                  className={`h-[8px] w-[16px] rounded-[3px] ${leg.color}`}
                />

                <p className="font-normal text-[#7b899c] text-[11px]">
                  {leg.label}
                </p>

              </div>

            )
          )}

        </div>

      </div>

      {/* =================================================
          AI WAITING INFORMATION
      ================================================= */}

      <div className="bg-[#f4f8fd] border border-[#d8e7f7] rounded-[14px] p-[16px] mb-[20px]">

        <div className="flex items-center gap-[8px] mb-[5px]">

          <span className="text-[15px]">
            🤖
          </span>

          <p className="font-bold text-[#155ead] text-[12px]">
            AI Waiting-Time Prediction
          </p>

        </div>

        <p className="text-[#526176] text-[11px]">

          Current estimated waiting time:{' '}

          <span className="font-bold text-[#142033]">
            {waitText}
          </span>

        </p>

        <p className="text-[#7b899c] text-[10px] mt-[4px]">
          Estimate updates automatically based on current OPD
          queue conditions.
        </p>

      </div>

      {/* =================================================
          BOOKING DETAILS
      ================================================= */}

      <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] mb-[20px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">

          {[
            {
              label: 'Hospital',
              value:
                booking.hospitalName,
            },

            {
              label: 'Slot',
              value:
                booking.slot,
            },

            {
              label: 'Date',
              value:
                booking.date,
            },

            {
              label: 'Room',
              value:
                booking.doctorRoom ||
                'Room not assigned',
            },
          ].map(
            (row) => (

              <div
                key={row.label}
              >

                <p className="font-semibold text-[#7b899c] text-[10px] uppercase mb-[2px]">
                  {row.label}
                </p>

                <p className="font-semibold text-[#142033] text-[12px]">
                  {row.value}
                </p>

              </div>

            )
          )}

        </div>

      </div>

      {/* =================================================
          ACTIONS
      ================================================= */}

      <div className="flex gap-[10px] flex-wrap">

        <Button
          variant="secondary"
          onClick={() =>
            loadTokenData()
          }
          className="text-[13px] py-[10px]"
        >
          ↻ Refresh
        </Button>

        <Button
          variant="secondary"
          onClick={() =>
            navigate(
              '/patient/queue'
            )
          }
          className="text-[13px] py-[10px]"
        >
          Live Queue
        </Button>

        <Button
          variant="primary"
          onClick={() =>
            navigate(
              '/patient/appointment'
            )
          }
          className="flex-1 justify-center text-[13px] py-[10px]"
        >
          Appointment Details
        </Button>

      </div>

    </PatientLayout>
  );
}