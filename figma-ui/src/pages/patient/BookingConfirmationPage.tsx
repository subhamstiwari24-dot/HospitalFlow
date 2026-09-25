import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/PatientLayout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { usePatient } from '../../context/PatientContext';
import { usePageLoad } from '../../hooks/usePageLoad';

const API_URL = '/api';

interface AppointmentResponse {
  id: number;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: number | string;
  token?: string;
  status: string;
  priority?: string;
  doctor?: {
    id: number;
    name: string;
  };
  hospital?: {
    id: number;
    name: string;
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

interface QueueAppointment {
  id: number;
  tokenNumber: number | string;
  status: string;
  appointmentDate: string;
  appointmentTime: string;
  doctor?: {
    id: number;
  };
}

export default function BookingConfirmationPage() {
  const navigate = useNavigate();
  const { booking, patientName } = usePatient();
  const loading = usePageLoad(800);

  const [queuePosition, setQueuePosition] =
    useState<QueuePositionResponse | null>(null);

  const [waitingTime, setWaitingTime] =
    useState<WaitingTimeResponse | null>(null);

  const [currentServing, setCurrentServing] = useState<string>('—');
  const [liveStatus, setLiveStatus] = useState<string>('Confirmed');
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState('');

  useEffect(() => {
    if (!booking) {
      navigate('/patient/hospital');
    }
  }, [booking, navigate]);

  const loadLiveQueueData = useCallback(async () => {
    if (!booking?.bookingId) return;

    try {
      setQueueError('');

      // BK-6 -> 6
      const appointmentId =
        booking.appointmentId ??
        Number(
          booking.bookingId.replace('BK-', '')
        );

      if (!appointmentId) {
        throw new Error('Invalid appointment ID.');
      }

      // 1. Get the actual appointment from backend
      const appointmentResponse = await fetch(
        `${API_URL}/appointments/${appointmentId}`
      );

      if (!appointmentResponse.ok) {
        throw new Error('Unable to load appointment.');
      }

      const appointment: AppointmentResponse =
        await appointmentResponse.json();

      setLiveStatus(appointment.status || 'Confirmed');

      const doctorId =
        appointment.doctor?.id ?? Number(booking.doctorId);

      const appointmentDate = appointment.appointmentDate;

      // 2. Get real queue position
      const positionResponse = await fetch(
        `${API_URL}/appointments/${appointmentId}/queue-position`
      );

      if (positionResponse.ok) {
        const positionData: QueuePositionResponse =
          await positionResponse.json();

        setQueuePosition(positionData);
      }

      // 3. Get AI waiting-time prediction
      const waitingResponse = await fetch(
        `${API_URL}/appointments/${appointmentId}/waiting-time`
      );

      if (waitingResponse.ok) {
        const waitingData: WaitingTimeResponse =
          await waitingResponse.json();

        setWaitingTime(waitingData);
      }

      // 4. Get today's queue to identify currently serving patient
      if (doctorId && appointmentDate) {
        const queueResponse = await fetch(
          `${API_URL}/appointments/queue?doctorId=${doctorId}&appointmentDate=${appointmentDate}`
        );

        if (queueResponse.ok) {
          const queueData: QueueAppointment[] =
            await queueResponse.json();

          // Find an appointment which is actually IN_PROGRESS
          const servingPatient = queueData.find(
            (item) =>
              item.status?.toUpperCase() === 'IN_PROGRESS' ||
              item.status?.toUpperCase() === 'IN PROGRESS'
          );

          if (servingPatient) {
            const token = String(servingPatient.tokenNumber);

            setCurrentServing(
              token.startsWith('A') ? token : `A${token}`
            );
          } else {
            setCurrentServing('—');
          }
        }
      }
    } catch (error) {
      console.error('Failed to load live queue:', error);
      setQueueError(
        'Live queue information could not be loaded.'
      );
    } finally {
      setQueueLoading(false);
    }
  }, [booking]);

  // Load immediately + refresh every 5 seconds
  useEffect(() => {
    if (!booking) return;

    loadLiveQueueData();

    const interval = window.setInterval(() => {
      loadLiveQueueData();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [booking, loadLiveQueueData]);

  if (!booking) return null;

  if (loading) {
    return (
      <PatientLayout
        step={4}
        showBack={false}
        maxWidth="max-w-[720px]"
      >
        <div className="flex flex-col items-center justify-center py-[64px] gap-[16px]">
          <div className="size-[48px] rounded-full border-[3px] border-[#d8e1ec] border-t-[#155ead] animate-spin" />

          <p className="font-semibold text-[#526176] text-[14px]">
            Preparing your booking…
          </p>
        </div>
      </PatientLayout>
    );
  }

  const patientsAhead =
    queuePosition?.patientsAhead ??
    waitingTime?.patientsAhead ??
    booking.patientsAhead ??
    0;

  const minWait =
    waitingTime?.estimatedMinMinutes ??
    booking.avgWaitMinutes ??
    0;

  const maxWait =
    waitingTime?.estimatedMaxMinutes ??
    minWait;

  const waitText =
    minWait === maxWait
      ? `~${minWait} min`
      : `${minWait}-${maxWait} min`;

  const displayStatus =
    liveStatus === 'WAITING'
      ? 'Confirmed'
      : liveStatus === 'IN_PROGRESS' ||
        liveStatus === 'IN PROGRESS'
        ? 'In Progress'
        : liveStatus === 'COMPLETED'
        ? 'Completed'
        : 'Confirmed';

  return (
    <PatientLayout
      step={4}
      showBack={false}
      maxWidth="max-w-[720px]"
    >
      {/* Success hero */}
      <div className="text-center mb-[32px]">
        <div className="bg-[#e8f7f1] size-[80px] rounded-[999px] flex items-center justify-center mx-auto mb-[20px]">
          <span className="text-[#18865b] text-[36px]">
            ✓
          </span>
        </div>

        <h1 className="font-bold text-[#142033] text-[26px] mb-[6px]">
          Booking Confirmed!
        </h1>

        <p className="font-normal text-[#526176] text-[15px]">
          Your OPD appointment has been successfully booked,{' '}
          {patientName}.
        </p>
      </div>

      {/* Token highlight */}
      <div className="bg-[#13243a] rounded-[14px] p-[28px] text-center mb-[20px]">
        <p className="font-semibold text-[#afc0d3] text-[13px] uppercase tracking-[0.08em] mb-[8px]">
          Your Token Number
        </p>

        <p className="font-bold text-white text-[56px] leading-none tracking-wide mb-[8px]">
          {booking.token}
        </p>

        <p className="font-normal text-[#afc0d3] text-[13px]">
          Booking ID: {booking.bookingId}
        </p>
      </div>

      {/* Booking details card */}
      <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[24px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] mb-[20px]">
        <div className="flex items-center gap-[8px] mb-[18px]">
          <div className="bg-[#18865b] h-[20px] rounded-[2px] w-[4px]" />

          <p className="font-bold text-[#142033] text-[15px]">
            Appointment Details
          </p>

          <StatusBadge
            status={displayStatus}
            className="ml-auto"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
          {[
            {
              label: 'Hospital',
              value: booking.hospitalName,
            },
            {
              label: 'Department',
              value: booking.departmentName,
            },
            {
              label: 'Doctor',
              value: booking.doctorName,
            },
            {
              label: 'Specialization',
              value: booking.doctorSpecialization,
            },
            {
              label: 'Date',
              value: booking.date,
            },
            {
              label: 'Time Slot',
              value: booking.slot,
            },
            {
              label: 'Room',
              value: booking.doctorRoom,
            },
            {
              label: 'Booked At',
              value: booking.bookedAt,
            },
          ].map((row) => (
            <div key={row.label}>
              <p className="font-semibold text-[#7b899c] text-[10px] uppercase mb-[3px]">
                {row.label}
              </p>

              <p className="font-semibold text-[#142033] text-[13px]">
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* LIVE Queue information */}
      <div className="bg-[#eaf3fd] border border-[#c3d9f7] rounded-[14px] p-[18px] mb-[24px]">
        <div className="flex items-center justify-between mb-[10px]">
          <p className="font-bold text-[#155ead] text-[14px]">
            📋 Live Queue Information
          </p>

          <div className="flex items-center gap-[6px]">
            <span
              className={`size-[7px] rounded-full ${
                queueLoading
                  ? 'bg-[#f59e0b] animate-pulse'
                  : 'bg-[#18865b]'
              }`}
            />

            <span className="text-[10px] font-semibold text-[#526176]">
              {queueLoading ? 'Updating...' : 'Live'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
          {[
            {
              label: 'Currently serving',
              value: currentServing,
            },
            {
              label: 'Patients ahead',
              value: patientsAhead,
            },
            {
              label: 'Est. wait time',
              value: waitText,
            },
          ].map((row) => (
            <div key={row.label} className="text-center">
              <p className="font-bold text-[#142033] text-[20px]">
                {row.value}
              </p>

              <p className="font-normal text-[#526176] text-[11px] mt-[2px]">
                {row.label}
              </p>
            </div>
          ))}
        </div>

        {/* AI message */}
        {waitingTime?.message && (
          <div className="mt-[14px] pt-[12px] border-t border-[#c3d9f7]">
            <p className="text-[11px] text-[#526176] text-center">
              🤖 {waitingTime.message}
            </p>
          </div>
        )}

        {queueError && (
          <p className="text-[11px] text-[#b45309] text-center mt-[10px]">
            {queueError}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-[12px] flex-wrap">
        <Button
          variant="primary"
          onClick={() => navigate('/patient/token')}
          className="flex-1 justify-center py-[12px] text-[14px]"
        >
          Track My Token →
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigate('/patient/appointment')}
          className="py-[12px] text-[14px]"
        >
          Appointment Details
        </Button>
      </div>

      <p className="text-center font-normal text-[#7b899c] text-[12px] mt-[16px]">
        Show this token at the reception or track it online.
      </p>
    </PatientLayout>
  );
}