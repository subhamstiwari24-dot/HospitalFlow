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

function formatToken(tokenNumber: number | string) {
  const token = String(tokenNumber);

  return token.startsWith('A') ? token : `A${token}`;
}

function mapStatus(status: string): QueueStatus {
  const normalized = status.toUpperCase();

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

export default function TokenDetailsPage() {
  const navigate = useNavigate();
  const { booking } = usePatient();

  const [queueTokens, setQueueTokens] = useState<QueueItem[]>([]);
  const [currentServing, setCurrentServing] = useState('—');
  const [patientsAhead, setPatientsAhead] = useState(0);

  const [estimatedMin, setEstimatedMin] = useState(0);
  const [estimatedMax, setEstimatedMax] = useState(0);

  const [myStatus, setMyStatus] =
    useState<QueueStatus>('Waiting');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!booking) {
      navigate('/patient/hospital');
    }
  }, [booking, navigate]);

  const loadTokenData = useCallback(async () => {
    if (!booking?.bookingId) return;

    try {
      setError('');

      // BK-7 -> 7
      const appointmentId =
        booking.appointmentId ??
        Number(
          booking.bookingId.replace('BK-', '')
        );

      if (!appointmentId) {
        throw new Error('Invalid appointment ID.');
      }

      // 1. Get patient's appointment
      const appointmentResponse = await fetch(
        `${API_URL}/appointments/${appointmentId}`
      );

      if (!appointmentResponse.ok) {
        throw new Error('Unable to load appointment.');
      }

      const appointment: Appointment =
        await appointmentResponse.json();

      const doctorId =
        appointment.doctor?.id ?? Number(booking.doctorId);

      const appointmentDate =
        appointment.appointmentDate;

      // 2. Get doctor's queue for the selected date
      const queueResponse = await fetch(
        `${API_URL}/appointments/queue?doctorId=${doctorId}&appointmentDate=${appointmentDate}`
      );

      if (!queueResponse.ok) {
        throw new Error('Unable to load live queue.');
      }

      const backendQueue: QueueAppointment[] =
        await queueResponse.json();

      // 3. Convert backend queue into UI queue
      const mappedQueue: QueueItem[] = backendQueue.map(
        (item) => ({
          id: item.id,
          token: formatToken(item.tokenNumber),
          status: mapStatus(item.status),
        })
      );

      setQueueTokens(mappedQueue);

      // 4. Find patient's current status
      setMyStatus(mapStatus(appointment.status));

      // 5. Find currently serving patient
      const servingPatient = backendQueue.find((item) => {
        const status = item.status.toUpperCase();

        return (
          status === 'IN_PROGRESS' ||
          status === 'IN PROGRESS'
        );
      });

      if (servingPatient) {
        setCurrentServing(
          formatToken(servingPatient.tokenNumber)
        );
      } else {
        setCurrentServing('—');
      }

      // 6. Get real queue position
      const positionResponse = await fetch(
        `${API_URL}/appointments/${appointmentId}/queue-position`
      );

      if (positionResponse.ok) {
        const positionData: QueuePositionResponse =
          await positionResponse.json();

        setPatientsAhead(
          Number(positionData.patientsAhead ?? 0)
        );
      }

      // 7. Get AI waiting-time prediction
      const waitingResponse = await fetch(
        `${API_URL}/appointments/${appointmentId}/waiting-time`
      );

      if (waitingResponse.ok) {
        const waitingData: WaitingTimeResponse =
          await waitingResponse.json();

        setEstimatedMin(
          Number(waitingData.estimatedMinMinutes ?? 0)
        );

        setEstimatedMax(
          Number(waitingData.estimatedMaxMinutes ?? 0)
        );
      }
    } catch (err) {
      console.error('Token tracker error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load token information.'
      );
    } finally {
      setLoading(false);
    }
  }, [booking]);

  // Initial load + automatic refresh every 5 seconds
  useEffect(() => {
    if (!booking) return;

    loadTokenData();

    const interval = window.setInterval(() => {
      loadTokenData();
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [booking, loadTokenData]);

  if (!booking) return null;

  const myToken = booking.token;

  const waitText =
    myStatus === 'In consultation'
      ? 'Your turn!'
      : estimatedMin === estimatedMax
        ? `~${estimatedMin} min`
        : `${estimatedMin}-${estimatedMax} min`;

  return (
    <PatientLayout
      step={4}
      showBack={false}
      maxWidth="max-w-[640px]"
    >
      {/* Header */}
      <div className="text-center mb-[28px]">
        <h1 className="font-bold text-[#142033] text-[24px] mb-[4px]">
          Token Tracker
        </h1>

        <p className="font-normal text-[#526176] text-[14px]">
          {booking.doctorName} · {booking.departmentName}
        </p>
      </div>

      {error && !loading && (
        <div className="mb-[16px]">
          <ErrorState
            compact
            description={error}
            onRetry={loadTokenData}
          />
        </div>
      )}

      {/* My token card */}
      <div className="bg-[#13243a] rounded-[14px] p-[20px] sm:p-[32px] text-center mb-[20px]">
        <p className="font-semibold text-[#afc0d3] text-[12px] uppercase tracking-widest mb-[12px]">
          Your Token
        </p>

        <p className="font-bold text-white text-[64px] leading-none mb-[16px]">
          {myToken}
        </p>

        <div className="flex justify-center">
          <StatusBadge status={myStatus} />
        </div>
      </div>

      {/* Queue stats */}
      <div className="grid grid-cols-3 gap-[12px] mb-[20px]">
        {[
          {
            label: 'Currently Serving',
            value: currentServing,
            accent: true,
          },
          {
            label: 'Patients Ahead',
            value:
              myStatus === 'In consultation'
                ? '0'
                : String(patientsAhead),
            accent: false,
          },
          {
            label: 'Est. Wait',
            value: waitText,
            accent: false,
          },
        ].map((stat) => (
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
        ))}
      </div>

      {/* Live indicator */}
      <div className="flex items-center justify-center gap-[6px] mb-[16px]">
        <span className="size-[7px] rounded-full bg-[#18865b] animate-pulse" />

        <span className="text-[11px] font-semibold text-[#18865b]">
          {loading
            ? 'Updating queue...'
            : 'Live queue • Updates every 5 seconds'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] mb-[20px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]">
        <p className="font-bold text-[#142033] text-[13px] mb-[14px]">
          Queue Progress
        </p>

        {queueTokens.length > 0 ? (
          <div className="flex items-center gap-[6px] flex-wrap">
            {queueTokens.map((t) => {
              const isMe = t.token === myToken;

              const bg =
                t.status === 'Completed'
                  ? 'bg-[#d8e1ec]'
                  : t.status === 'In consultation'
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
            })}
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
          ].map((leg) => (
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
          ))}
        </div>
      </div>

      {/* AI waiting information */}
      <div className="bg-[#f4f8fd] border border-[#d8e7f7] rounded-[14px] p-[16px] mb-[20px]">
        <div className="flex items-center gap-[8px] mb-[5px]">
          <span className="text-[15px]">🤖</span>

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

      {/* Booking mini details */}
      <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] mb-[20px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
          {[
            {
              label: 'Hospital',
              value: booking.hospitalName,
            },
            {
              label: 'Slot',
              value: booking.slot,
            },
            {
              label: 'Date',
              value: booking.date,
            },
            {
              label: 'Room',
              value: booking.doctorRoom,
            },
          ].map((row) => (
            <div key={row.label}>
              <p className="font-semibold text-[#7b899c] text-[10px] uppercase mb-[2px]">
                {row.label}
              </p>

              <p className="font-semibold text-[#142033] text-[12px]">
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-[10px] flex-wrap">
        <Button
          variant="secondary"
          onClick={() => loadTokenData()}
          className="text-[13px] py-[10px]"
        >
          ↻ Refresh
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigate('/patient/queue')}
          className="text-[13px] py-[10px]"
        >
          Live Queue
        </Button>

        <Button
          variant="primary"
          onClick={() => navigate('/patient/appointment')}
          className="flex-1 justify-center text-[13px] py-[10px]"
        >
          Appointment Details
        </Button>
      </div>
    </PatientLayout>
  );
}