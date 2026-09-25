import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/PatientLayout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { usePatient } from '../../context/PatientContext';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkLiveQueue } from '../../components/Skeleton';

const API_URL = '/api';

interface BackendAppointment {
  id: number;
  patientName: string;
  patientPhone?: string;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: number | string;
  status: string;
  priority?: string;
  doctor?: {
    id: number;
    name?: string;
  };
  hospital?: {
    id: number;
    name?: string;
  };
}

interface QueueItem {
  id: number;
  token: string;
  status: 'Waiting' | 'In consultation' | 'Completed' | 'Skipped';
  priority?: string;
  appointmentTime: string;
}

function formatToken(tokenNumber: number | string) {
  const token = String(tokenNumber);

  if (token.startsWith('A')) {
    return token;
  }

  return `A${token}`;
}

function mapStatus(status: string): QueueItem['status'] {
  const normalized = status.toUpperCase();

  if (normalized === 'IN_PROGRESS' || normalized === 'IN PROGRESS') {
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

export default function LiveQueuePage() {
  const navigate = useNavigate();
  const { booking } = usePatient();
  const loading = usePageLoad(700);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentServing, setCurrentServing] = useState('—');
  const [patientsAhead, setPatientsAhead] = useState(0);
  const [estimatedMin, setEstimatedMin] = useState(0);
  const [estimatedMax, setEstimatedMax] = useState(0);
  const [queueLoading, setQueueLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!booking) {
      navigate('/patient/hospital');
    }
  }, [booking, navigate]);

  const loadLiveQueue = useCallback(async () => {
    if (!booking?.bookingId) return;

    try {
      setError('');

      const appointmentId =
        booking.appointmentId ??
        Number(
          booking.bookingId.replace('BK-', '')
        );

      if (!appointmentId) {
        throw new Error('Invalid appointment ID.');
      }

      // 1. Get patient's actual appointment
      const appointmentResponse = await fetch(
        `${API_URL}/appointments/${appointmentId}`
      );

      if (!appointmentResponse.ok) {
        throw new Error('Unable to load appointment.');
      }

      const appointment: BackendAppointment =
        await appointmentResponse.json();

      const doctorId =
        appointment.doctor?.id ?? Number(booking.doctorId);

      const appointmentDate = appointment.appointmentDate;

      console.log(
        'HospitalFlow Patient appointment:',
        {
          id: appointment.id,
          tokenNumber: appointment.tokenNumber,
          appointmentDate,
          doctorId,
          status: appointment.status,
        }
      );

      // 2. Get the same active doctor/date queue used by the backend
      const queueResponse = await fetch(
        `${API_URL}/appointments/queue?doctorId=${encodeURIComponent(
          String(doctorId)
        )}&appointmentDate=${encodeURIComponent(
          appointmentDate
        )}`,
        {
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!queueResponse.ok) {
        throw new Error('Unable to load live queue.');
      }

      const doctorAppointments: BackendAppointment[] =
        await queueResponse.json();

      console.log(
        'HospitalFlow Patient queue:',
        doctorAppointments.map((item) => ({
          id: item.id,
          tokenNumber: item.tokenNumber,
          appointmentDate: item.appointmentDate,
          status: item.status,
          doctorId: item.doctor?.id,
        }))
      );

      // 4. Convert backend appointments into queue items
      const queueItems: QueueItem[] = doctorAppointments
        .map((item) => ({
          id: item.id,
          token: formatToken(item.tokenNumber),
          status: mapStatus(item.status),
          priority: item.priority,
          appointmentTime: item.appointmentTime,
        }))
        .sort((a, b) => a.id - b.id);

      setQueue(queueItems);

      // 5. Find currently serving patient
      const servingPatient = doctorAppointments.find(
        (item) => {
          const status = item.status.toUpperCase();

          return (
            status === 'IN_PROGRESS' ||
            status === 'IN PROGRESS'
          );
        }
      );

      if (servingPatient) {
        setCurrentServing(
          formatToken(servingPatient.tokenNumber)
        );
      } else {
        setCurrentServing('—');
      }

      // 6. Get patient's real queue position
      const positionResponse = await fetch(
        `${API_URL}/appointments/${appointmentId}/queue-position`
      );

      if (positionResponse.ok) {
        const positionData = await positionResponse.json();

        setPatientsAhead(
          Number(positionData.patientsAhead ?? 0)
        );
      } else {
        // Fallback calculation
        const myIndex = queueItems.findIndex(
          (item) => item.id === appointmentId
        );

        if (myIndex >= 0) {
          const ahead = queueItems
            .slice(0, myIndex)
            .filter(
              (item) =>
                item.status !== 'Completed' &&
                item.status !== 'Skipped'
            ).length;

          setPatientsAhead(ahead);
        }
      }

      // 7. Get AI waiting-time prediction
      const waitingResponse = await fetch(
        `${API_URL}/appointments/${appointmentId}/waiting-time`
      );

      if (waitingResponse.ok) {
        const waitingData = await waitingResponse.json();

        setEstimatedMin(
          Number(waitingData.estimatedMinMinutes ?? 0)
        );

        setEstimatedMax(
          Number(waitingData.estimatedMaxMinutes ?? 0)
        );
      }
    } catch (err) {
      console.error('Live queue error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load live queue.'
      );
    } finally {
      setQueueLoading(false);
    }
  }, [booking]);

  // Initial load + automatic refresh every 5 seconds
  useEffect(() => {
    if (!booking) return;

    loadLiveQueue();

    const interval = window.setInterval(() => {
      loadLiveQueue();
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [booking, loadLiveQueue]);

  if (!booking) return null;

  if (loading) {
    return (
      <PatientLayout
        step={4}
        showBack={false}
        maxWidth="max-w-[700px]"
      >
        <SkLiveQueue />
      </PatientLayout>
    );
  }

  const waiting = queue.filter(
    (item) => item.status === 'Waiting'
  ).length;

  const serving = queue.filter(
    (item) => item.status === 'In consultation'
  ).length;

  const completed = queue.filter(
    (item) => item.status === 'Completed'
  ).length;

  const total = queue.length;

  const waitText =
    estimatedMin === estimatedMax
      ? `~${estimatedMin} min`
      : `${estimatedMin}-${estimatedMax} min`;

  return (
    <PatientLayout
      step={4}
      showBack={false}
      maxWidth="max-w-[700px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-[10px] flex-wrap mb-[24px]">
        <div>
          <h1 className="font-bold text-[#142033] text-[24px] mb-[2px]">
            Live Queue
          </h1>

          <p className="font-normal text-[#526176] text-[14px]">
            {booking.doctorName} · {booking.departmentName}
          </p>
        </div>

        <div className="bg-[#e8f7f1] px-[14px] py-[8px] rounded-[10px] flex items-center gap-[8px]">
          <span className="size-[8px] rounded-[4px] bg-[#18865b] animate-pulse inline-block" />

          <p className="font-bold text-[#18865b] text-[13px]">
            {queueLoading ? 'Updating...' : 'Live'}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#fff4de] border border-[#f3d7a0] rounded-[12px] px-[14px] py-[10px] mb-[16px]">
          <p className="text-[12px] text-[#8a5a00]">
            {error}
          </p>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[10px] mb-[20px]">
        {[
          {
            label: 'Total',
            value: total,
            color: 'text-[#142033]',
            bg: 'bg-white',
          },
          {
            label: 'Serving',
            value: serving,
            color: 'text-[#18865b]',
            bg: 'bg-[#e8f7f1]',
          },
          {
            label: 'Waiting',
            value: waiting,
            color: 'text-[#a86508]',
            bg: 'bg-[#fff4de]',
          },
          {
            label: 'Done',
            value: completed,
            color: 'text-[#526176]',
            bg: 'bg-[#f4f7fb]',
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} border border-[#d8e1ec] rounded-[14px] p-[14px] text-center`}
          >
            <p
              className={`font-bold text-[22px] ${s.color}`}
            >
              {s.value}
            </p>

            <p className="font-normal text-[#7b899c] text-[11px] mt-[2px]">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* My queue status */}
      <div className="bg-[#eaf3fd] border border-[#c3d9f7] rounded-[14px] p-[18px] mb-[20px]">
        <p className="font-bold text-[#155ead] text-[14px] mb-[12px]">
          📍 Your Queue Status
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
          <div className="text-center">
            <p className="font-bold text-[#142033] text-[22px]">
              {booking.token}
            </p>
            <p className="text-[#526176] text-[11px]">
              Your token
            </p>
          </div>

          <div className="text-center">
            <p className="font-bold text-[#142033] text-[22px]">
              {patientsAhead}
            </p>
            <p className="text-[#526176] text-[11px]">
              Patients ahead
            </p>
          </div>

          <div className="text-center">
            <p className="font-bold text-[#142033] text-[22px]">
              {waitText}
            </p>
            <p className="text-[#526176] text-[11px]">
              Estimated wait
            </p>
          </div>
        </div>
      </div>

      {/* Queue list */}
      <div className="bg-white border border-[#d8e1ec] rounded-[14px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] mb-[20px]">
        <div className="flex items-center gap-[8px] px-[20px] py-[14px] border-b border-[#f4f7fb]">
          <div className="bg-[#155ead] h-[20px] rounded-[2px] w-[4px]" />

          <p className="font-bold text-[#142033] text-[14px]">
            Queue List
          </p>

          <p className="font-normal text-[#7b899c] text-[12px] ml-auto">
            Currently serving:{' '}
            <span className="font-bold text-[#18865b]">
              {currentServing}
            </span>
          </p>
        </div>

        <div className="divide-y divide-[#f4f7fb]">
          {queue.length === 0 ? (
            <div className="px-[20px] py-[32px] text-center">
              <p className="text-[#526176] text-[13px]">
                No queue data available.
              </p>
            </div>
          ) : (
            queue.map((item, idx) => {
              const isMe = item.token === booking.token;
              const isServing =
                item.status === 'In consultation';
              const isDone =
                item.status === 'Completed';

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-[14px] px-[20px] py-[14px] transition-colors ${
                    isMe
                      ? 'bg-[#eaf3fd]'
                      : isServing
                        ? 'bg-[#f0faf5]'
                        : ''
                  }`}
                >
                  {/* Position */}
                  <div
                    className={`size-[36px] rounded-[10px] flex items-center justify-center shrink-0 font-bold text-[14px] ${
                      isServing
                        ? 'bg-[#18865b] text-white'
                        : isDone
                          ? 'bg-[#f4f7fb] text-[#afc0d3]'
                          : isMe
                            ? 'bg-[#155ead] text-white'
                            : 'bg-[#f4f7fb] text-[#526176]'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  {/* Token */}
                  <div className="flex-1">
                    <div className="flex items-center gap-[8px]">
                      <p
                        className={`font-bold text-[15px] ${
                          isDone
                            ? 'text-[#afc0d3] line-through'
                            : 'text-[#142033]'
                        }`}
                      >
                        {item.token}
                      </p>

                      {isMe && (
                        <span className="bg-[#155ead] text-white text-[10px] font-bold px-[8px] py-[2px] rounded-[999px]">
                          You
                        </span>
                      )}
                    </div>

                    {!isDone && !isServing && (
                      <p className="font-normal text-[#7b899c] text-[11px] mt-[1px]">
                        Waiting for consultation
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <StatusBadge status={item.status} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-[10px] flex-wrap">
        <Button
          variant="secondary"
          onClick={() => loadLiveQueue()}
          className="text-[13px] py-[10px]"
        >
          ↻ Refresh
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigate('/patient/token')}
          className="text-[13px] py-[10px]"
        >
          My Token
        </Button>

        <Button
          variant="primary"
          onClick={() => navigate('/patient/appointment')}
          className="flex-1 justify-center text-[13px] py-[10px]"
        >
          Appointment Details
        </Button>
      </div>

      <p className="text-center text-[#7b899c] text-[11px] mt-[16px]">
        Queue updates automatically every 5 seconds.
      </p>
    </PatientLayout>
  );
}