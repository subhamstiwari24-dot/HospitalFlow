import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PatientLayout from '../../components/PatientLayout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { usePatient } from '../../context/PatientContext';
import { usePageLoad } from '../../hooks/usePageLoad';
import { ErrorState } from '../../components/EmptyState';

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
    id?: number;
  };
}

interface CancelResponse {
  message?: string;
  error?: string;
  appointment?: AppointmentResponse;
  payment?: {
    id?: number;
    paymentStatus?: string;
    refundStatus?: string;
    razorpayRefundId?: string;
    refundedAt?: string;
  } | null;
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

  // Cancellation / refund
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelMessage, setCancelMessage] = useState('');
  const [refundStatus, setRefundStatus] = useState('');
  const [refundId, setRefundId] = useState('');

  useEffect(() => {
    if (!booking) {
      navigate('/patient/hospital');
    }
  }, [booking, navigate]);

  // =====================================================
  // LOAD LIVE QUEUE DATA
  // =====================================================

  const loadLiveQueueData = useCallback(async () => {
    if (!booking?.bookingId) return;

    if (liveStatus === 'CANCELLED') {
      setQueueLoading(false);
      return;
    }

    try {
      setQueueError('');

      const appointmentId =
        booking.appointmentId ??
        Number(booking.bookingId.replace('BK-', ''));

      if (!appointmentId) {
        throw new Error('Invalid appointment ID.');
      }

      // 1. Actual appointment
      const appointmentResponse = await fetch(
        `${API_URL}/appointments/${appointmentId}`
      );

      if (!appointmentResponse.ok) {
        throw new Error('Unable to load appointment.');
      }

      const appointment: AppointmentResponse =
        await appointmentResponse.json();

      setLiveStatus(appointment.status || 'Confirmed');

      if (appointment.status?.toUpperCase() === 'CANCELLED') {
        setQueueLoading(false);
        return;
      }

      const doctorId =
        appointment.doctor?.id ??
        Number(booking.doctorId);

      const appointmentDate = appointment.appointmentDate;

      // 2. Real queue position
      const positionResponse = await fetch(
        `${API_URL}/appointments/${appointmentId}/queue-position`
      );

      if (positionResponse.ok) {
        const positionData: QueuePositionResponse =
          await positionResponse.json();

        setQueuePosition(positionData);
      }

      // 3. AI waiting time
      const waitingResponse = await fetch(
        `${API_URL}/appointments/${appointmentId}/waiting-time`
      );

      if (waitingResponse.ok) {
        const waitingData: WaitingTimeResponse =
          await waitingResponse.json();

        setWaitingTime(waitingData);
      }

      // 4. Today's queue
      if (doctorId && appointmentDate) {
        const queueResponse = await fetch(
          `${API_URL}/appointments/queue?doctorId=${doctorId}&appointmentDate=${appointmentDate}`
        );

        if (queueResponse.ok) {
          const queueData: QueueAppointment[] =
            await queueResponse.json();

          const servingPatient = queueData.find(
            (item) =>
              item.status?.toUpperCase() === 'IN_PROGRESS' ||
              item.status?.toUpperCase() === 'IN PROGRESS'
          );

          if (servingPatient) {
            const token = String(
              servingPatient.tokenNumber
            );

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
  }, [booking, liveStatus]);

  // =====================================================
  // LOAD + REFRESH EVERY 5 SECONDS
  // =====================================================

  useEffect(() => {
    if (!booking) return;

    loadLiveQueueData();

    const interval = window.setInterval(() => {
      loadLiveQueueData();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [booking, loadLiveQueueData]);

  // =====================================================
  // CANCEL APPOINTMENT + REFUND
  // =====================================================

  const handleCancelAppointment = async () => {
    if (!booking) return;

    const appointmentId =
      booking.appointmentId ??
      Number(booking.bookingId.replace('BK-', ''));

    if (!appointmentId) {
      setCancelError('Invalid appointment ID.');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to cancel this appointment?\n\nIf your payment was completed, the refund will be initiated automatically.'
    );

    if (!confirmed) return;

    try {
      setCancelling(true);
      setCancelError('');
      setCancelMessage('');
      setRefundStatus('');
      setRefundId('');

      const response = await fetch(
        `${API_URL}/appointments/${appointmentId}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data: CancelResponse =
        await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to cancel appointment.'
        );
      }

      setLiveStatus(
        data.appointment?.status || 'CANCELLED'
      );

      setCancelMessage(
        data.message ||
          'Appointment cancelled successfully.'
      );

      if (data.payment) {
        setRefundStatus(
          data.payment.refundStatus || ''
        );

        setRefundId(
          data.payment.razorpayRefundId || ''
        );
      }
    } catch (error) {
      console.error('Cancellation failed:', error);

      setCancelError(
        error instanceof Error
          ? error.message
          : 'Unable to cancel appointment.'
      );
    } finally {
      setCancelling(false);
    }
  };

  // =====================================================
  // AUTO REFRESH REFUND STATUS
  // =====================================================

  useEffect(() => {
    if (!booking) return;

    if (liveStatus !== 'CANCELLED') {
      return;
    }

    if (refundStatus !== 'REFUND_PENDING') {
      return;
    }

    const appointmentId =
      booking.appointmentId ??
      Number(booking.bookingId.replace('BK-', ''));

    if (!appointmentId) return;

    let mounted = true;

    const checkRefundStatus = async () => {
      try {
        const response = await fetch(
          `${API_URL}/payments/appointment/${appointmentId}`
        );

        if (!response.ok) return;

        const payment = await response.json();

        if (!mounted) return;

        setRefundStatus(
          payment.refundStatus || ''
        );

        setRefundId(
          payment.razorpayRefundId || ''
        );
      } catch (error) {
        console.error(
          'Unable to refresh refund status:',
          error
        );
      }
    };

    checkRefundStatus();

    const interval = window.setInterval(
      checkRefundStatus,
      5000
    );

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [booking, liveStatus, refundStatus]);

  // =====================================================
  // NO BOOKING
  // =====================================================

  if (!booking) return null;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <PatientLayout
        step={4}
        showBack={false}
        maxWidth="max-w-[720px]"
      >
        <div className="min-h-[520px] flex flex-col items-center justify-center gap-5">

          <div className="relative">
            <div className="size-[64px] rounded-full border-[3px] border-cyan-500/15 border-t-[#16d9e3] animate-spin" />

            <div className="absolute inset-[10px] rounded-full bg-[#16d9e3]/5 blur-md" />
          </div>

          <div className="text-center">
            <p className="font-bold text-white text-[16px]">
              Preparing your booking…
            </p>

            <p className="text-slate-400 text-[12px] mt-1">
              Loading your appointment details
            </p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  // =====================================================
  // CALCULATE QUEUE DATA
  // =====================================================

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

  // =====================================================
  // DISPLAY STATUS
  // =====================================================

  const normalizedStatus =
    liveStatus?.toUpperCase();

  const displayStatus =
    normalizedStatus === 'WAITING'
      ? 'Confirmed'
      : normalizedStatus === 'IN_PROGRESS' ||
        normalizedStatus === 'IN PROGRESS'
      ? 'In Progress'
      : normalizedStatus === 'COMPLETED'
      ? 'Completed'
      : normalizedStatus === 'CANCELLED'
      ? 'Cancelled'
      : 'Confirmed';

  // =====================================================
  // CAN CANCEL?
  // =====================================================

  const canCancel =
    normalizedStatus !== 'CANCELLED' &&
    normalizedStatus !== 'COMPLETED' &&
    normalizedStatus !== 'IN_PROGRESS' &&
    normalizedStatus !== 'IN PROGRESS' &&
    !cancelling;

  return (
    <PatientLayout
      step={4}
      showBack={false}
      maxWidth="max-w-[820px]"
    >
      <div className="pb-8">

        {/* =================================================
            SUCCESS HERO
        ================================================= */}

        <div className="relative overflow-hidden rounded-[26px] border border-cyan-400/10 bg-gradient-to-br from-[#071b31] via-[#06172a] to-[#041224] px-6 py-9 mb-5 shadow-[0_20px_70px_rgba(0,0,0,0.25)]">

          <div className="absolute -top-24 -right-20 size-[220px] rounded-full bg-[#16d9e3]/10 blur-[70px]" />

          <div className="absolute -bottom-24 -left-20 size-[180px] rounded-full bg-cyan-500/5 blur-[60px]" />

          <div className="relative text-center">

            <div
              className={`size-[82px] rounded-full mx-auto mb-5 flex items-center justify-center border ${
                normalizedStatus === 'CANCELLED'
                  ? 'bg-red-500/10 border-red-400/20'
                  : 'bg-[#16d9e3]/10 border-[#16d9e3]/25'
              }`}
            >
              <span
                className={`text-[38px] font-light ${
                  normalizedStatus === 'CANCELLED'
                    ? 'text-red-400'
                    : 'text-[#16d9e3]'
                }`}
              >
                {normalizedStatus === 'CANCELLED'
                  ? '×'
                  : '✓'}
              </span>
            </div>

            <h1 className="font-black text-white text-[28px] tracking-tight">
              {normalizedStatus === 'CANCELLED'
                ? 'Appointment Cancelled'
                : 'Booking Confirmed!'}
            </h1>

            <p className="text-slate-400 text-[14px] mt-2">
              {normalizedStatus === 'CANCELLED' ? (
                'Your OPD appointment has been cancelled.'
              ) : (
                <>
                  Your OPD appointment has been successfully
                  booked,{' '}
                  <span className="text-[#8ef8ff] font-semibold">
                    {patientName}
                  </span>
                  .
                </>
              )}
            </p>
          </div>
        </div>

        {/* =================================================
            TOKEN HIGHLIGHT
        ================================================= */}

        <div className="relative overflow-hidden rounded-[24px] border border-cyan-400/20 bg-gradient-to-br from-[#0b2947] to-[#06182c] p-7 text-center mb-5 shadow-[0_15px_50px_rgba(0,0,0,0.22)]">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(22,217,227,0.13),transparent_45%)]" />

          <div className="relative">

            <p className="text-[#8ef8ff] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
              Your Token Number
            </p>

            <p className="font-black text-white text-[60px] leading-none tracking-[0.04em]">
              {booking.token}
            </p>

            <div className="mt-4 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
              <span className="text-slate-400 text-[11px]">
                Booking ID
              </span>

              <span className="ml-2 text-white text-[12px] font-bold">
                {booking.bookingId}
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            BOOKING DETAILS
        ================================================= */}

        <div className="rounded-[24px] border border-white/[0.07] bg-[#071b31]/90 p-5 sm:p-6 mb-5 shadow-[0_12px_40px_rgba(0,0,0,0.16)]">

          <div className="flex items-center gap-3 mb-6">

            <div className="size-9 rounded-xl bg-[#16d9e3]/10 border border-[#16d9e3]/20 flex items-center justify-center">
              <span className="text-[#16d9e3] text-[17px]">
                ◈
              </span>
            </div>

            <div>
              <p className="font-bold text-white text-[15px]">
                Appointment Details
              </p>

              <p className="text-slate-500 text-[10px] mt-0.5">
                Your OPD booking information
              </p>
            </div>

            <div className="ml-auto">
              <StatusBadge
                status={displayStatus}
                className="ml-auto"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {[
              {
                label: 'Hospital',
                value: booking.hospitalName,
                icon: '⌂',
              },
              {
                label: 'Department',
                value: booking.departmentName,
                icon: '◫',
              },
              {
                label: 'Doctor',
                value: booking.doctorName,
                icon: '◉',
              },
              {
                label: 'Specialization',
                value: booking.doctorSpecialization,
                icon: '✦',
              },
              {
                label: 'Date',
                value: booking.date,
                icon: '▣',
              },
              {
                label: 'Time Slot',
                value: booking.slot,
                icon: '◷',
              },
              {
                label: 'Room',
                value: booking.doctorRoom,
                icon: '▤',
              },
              {
                label: 'Booked At',
                value: booking.bookedAt,
                icon: '⌁',
              },
            ].map((row) => (
              <div
                key={row.label}
                className="group rounded-[16px] border border-white/[0.06] bg-white/[0.025] px-4 py-3.5 hover:border-cyan-400/15 hover:bg-cyan-400/[0.025] transition-all"
              >
                <div className="flex items-start gap-3">

                  <div className="size-8 shrink-0 rounded-lg bg-[#16d9e3]/[0.07] flex items-center justify-center text-[#16d9e3] text-[13px]">
                    {row.icon}
                  </div>

                  <div className="min-w-0">
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.12em] mb-1">
                      {row.label}
                    </p>

                    <p className="text-slate-200 text-[13px] font-semibold truncate">
                      {row.value || '—'}
                    </p>
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>

        {/* =================================================
            CANCEL / REFUND SUCCESS
        ================================================= */}

        {cancelMessage && (
          <div className="rounded-[20px] border border-emerald-400/15 bg-emerald-400/[0.06] p-5 mb-5">

            <div className="flex items-start gap-3">

              <div className="size-9 shrink-0 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
                ✓
              </div>

              <div>
                <p className="font-bold text-emerald-300 text-[14px]">
                  Appointment Cancelled
                </p>

                <p className="text-slate-400 text-[12px] mt-1">
                  {cancelMessage}
                </p>

                {refundStatus && (
                  <p className="text-slate-400 text-[12px] mt-2">
                    Refund Status:{' '}
                    <span className="font-bold text-white">
                      {refundStatus}
                    </span>
                  </p>
                )}

                {refundId && (
                  <p className="text-slate-400 text-[12px] mt-1 break-all">
                    Refund ID:{' '}
                    <span className="font-semibold text-slate-200">
                      {refundId}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            CANCELLATION ERROR
        ================================================= */}

        {cancelError && (
          <div className="rounded-[20px] border border-red-400/15 bg-red-400/[0.06] p-5 mb-5">

            <p className="font-bold text-red-300 text-[13px]">
              Unable to cancel appointment
            </p>

            <p className="text-red-200/70 text-[12px] mt-1">
              {cancelError}
            </p>
          </div>
        )}

        {/* =================================================
            LIVE QUEUE
        ================================================= */}

        {normalizedStatus !== 'CANCELLED' && (
          <div className="relative overflow-hidden rounded-[24px] border border-cyan-400/15 bg-[#071b31] p-5 sm:p-6 mb-5">

            <div className="absolute top-0 right-0 size-[160px] bg-[#16d9e3]/5 blur-[60px] rounded-full" />

            <div className="relative">

              <div className="flex items-center justify-between mb-5">

                <div className="flex items-center gap-3">

                  <div className="size-9 rounded-xl bg-[#16d9e3]/10 border border-[#16d9e3]/20 flex items-center justify-center">
                    <span className="text-[#16d9e3]">
                      ≋
                    </span>
                  </div>

                  <div>
                    <p className="font-bold text-white text-[14px]">
                      Live Queue
                    </p>

                    <p className="text-slate-500 text-[10px]">
                      Real-time OPD queue status
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">

                  <span
                    className={`size-[7px] rounded-full ${
                      queueLoading
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-emerald-400'
                    }`}
                  />

                  <span className="text-[10px] font-semibold text-slate-400">
                    {queueLoading ? 'Updating...' : 'Live'}
                  </span>

                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                {[
                  {
                    label: 'Currently Serving',
                    value: currentServing,
                    accent: true,
                  },
                  {
                    label: 'Patients Ahead',
                    value: patientsAhead,
                    accent: false,
                  },
                  {
                    label: 'Estimated Wait',
                    value: waitText,
                    accent: false,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="rounded-[18px] border border-white/[0.06] bg-white/[0.025] px-4 py-5 text-center"
                  >
                    <p
                      className={`font-black text-[24px] ${
                        row.accent
                          ? 'text-[#16d9e3]'
                          : 'text-white'
                      }`}
                    >
                      {row.value}
                    </p>

                    <p className="text-slate-500 text-[10px] uppercase tracking-[0.08em] font-semibold mt-1">
                      {row.label}
                    </p>
                  </div>
                ))}

              </div>

              {/* AI message */}
              {waitingTime?.message && (
                <div className="mt-4 rounded-[15px] border border-[#16d9e3]/10 bg-[#16d9e3]/[0.035] px-4 py-3">

                  <div className="flex items-start gap-2">

                    <span className="text-[#16d9e3] text-[14px]">
                      ✦
                    </span>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {waitingTime.message}
                    </p>

                  </div>
                </div>
              )}

              {queueError && !queueLoading && (
                <div className="mt-4">
                  <ErrorState
                    compact
                    description={queueError}
                    onRetry={loadLiveQueueData}
                  />
                </div>
              )}

            </div>
          </div>
        )}

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <Button
            variant="primary"
            onClick={() =>
              navigate('/patient/token')
            }
            className="w-full justify-center py-[13px] text-[14px] !bg-[#16d9e3] !text-[#031326] hover:!bg-[#5deaf0] font-bold rounded-[14px]"
          >
            Track My Token →
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              navigate('/patient/appointment')
            }
            className="w-full justify-center py-[13px] text-[14px] !bg-white/[0.04] !text-slate-200 !border-white/[0.08] hover:!bg-white/[0.07] rounded-[14px]"
          >
            Appointment Details
          </Button>

        </div>

        {/* =================================================
            CANCEL APPOINTMENT
        ================================================= */}

        {canCancel && (
          <div className="mt-3">

            <Button
              variant="secondary"
              onClick={handleCancelAppointment}
              disabled={cancelling}
              className="w-full justify-center py-[12px] text-[13px] !bg-red-500/[0.04] !text-red-400 !border-red-400/15 hover:!bg-red-500/[0.08] rounded-[14px]"
            >
              {cancelling
                ? 'Cancelling Appointment...'
                : 'Cancel Appointment'}
            </Button>

          </div>
        )}

        {/* =================================================
            REFUND STATUS
        ================================================= */}

        {normalizedStatus === 'CANCELLED' &&
          refundStatus && (
            <div className="mt-4 rounded-[18px] border border-amber-400/15 bg-amber-400/[0.05] p-4 text-center">

              <p className="text-amber-300 text-[10px] font-bold uppercase tracking-[0.12em]">
                Refund Status
              </p>

              <p className="text-white text-[14px] font-bold mt-1">
                {refundStatus}
              </p>

            </div>
          )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <p className="text-center text-slate-500 text-[11px] mt-5 px-4">
          {normalizedStatus === 'CANCELLED'
            ? 'Your appointment has been cancelled. Please keep the refund details for your records.'
            : 'Show this token at the reception or track it online.'}
        </p>

      </div>
    </PatientLayout>
  );
}