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
    id: number;
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

  // =====================================================
  // CANCELLATION / REFUND STATE
  // =====================================================

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

    /*
     * Once appointment is cancelled, there is no need
     * to keep requesting queue information.
     */
    if (liveStatus === 'CANCELLED') {
      setQueueLoading(false);
      return;
    }

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

      // =================================================
      // 1. GET ACTUAL APPOINTMENT
      // =================================================

      const appointmentResponse = await fetch(
        `${API_URL}/appointments/${appointmentId}`
      );

      if (!appointmentResponse.ok) {
        throw new Error('Unable to load appointment.');
      }

      const appointment: AppointmentResponse =
        await appointmentResponse.json();

      setLiveStatus(
        appointment.status || 'Confirmed'
      );

      // If appointment is already cancelled,
      // stop loading queue information.
      if (
        appointment.status?.toUpperCase() ===
        'CANCELLED'
      ) {
        setQueueLoading(false);
        return;
      }

      const doctorId =
        appointment.doctor?.id ??
        Number(booking.doctorId);

      const appointmentDate =
        appointment.appointmentDate;


      // =================================================
      // 2. GET REAL QUEUE POSITION
      // =================================================

      const positionResponse = await fetch(
        `${API_URL}/appointments/${appointmentId}/queue-position`
      );

      if (positionResponse.ok) {
        const positionData: QueuePositionResponse =
          await positionResponse.json();

        setQueuePosition(positionData);
      }


      // =================================================
      // 3. GET AI WAITING-TIME PREDICTION
      // =================================================

      const waitingResponse = await fetch(
        `${API_URL}/appointments/${appointmentId}/waiting-time`
      );

      if (waitingResponse.ok) {
        const waitingData: WaitingTimeResponse =
          await waitingResponse.json();

        setWaitingTime(waitingData);
      }


      // =================================================
      // 4. GET TODAY'S QUEUE
      // =================================================

      if (doctorId && appointmentDate) {
        const queueResponse = await fetch(
          `${API_URL}/appointments/queue?doctorId=${doctorId}&appointmentDate=${appointmentDate}`
        );

        if (queueResponse.ok) {
          const queueData: QueueAppointment[] =
            await queueResponse.json();

          const servingPatient =
            queueData.find(
              (item) =>
                item.status?.toUpperCase() ===
                  'IN_PROGRESS' ||
                item.status?.toUpperCase() ===
                  'IN PROGRESS'
            );

          if (servingPatient) {
            const token =
              String(
                servingPatient.tokenNumber
              );

            setCurrentServing(
              token.startsWith('A')
                ? token
                : `A${token}`
            );
          } else {
            setCurrentServing('—');
          }
        }
      }

    } catch (error) {

      console.error(
        'Failed to load live queue:',
        error
      );

      setQueueError(
        'Live queue information could not be loaded.'
      );

    } finally {

      setQueueLoading(false);
    }

  }, [booking, liveStatus]);


  // =====================================================
  // LOAD IMMEDIATELY + REFRESH EVERY 5 SECONDS
  // =====================================================

  useEffect(() => {
    if (!booking) return;

    loadLiveQueueData();

    const interval =
      window.setInterval(() => {
        loadLiveQueueData();
      }, 5000);

    return () =>
      window.clearInterval(interval);

  }, [
    booking,
    loadLiveQueueData
  ]);


  // =====================================================
  // CANCEL APPOINTMENT + REFUND
  // =====================================================

  const handleCancelAppointment =
    async () => {

      if (!booking) return;

      const appointmentId =
        booking.appointmentId ??
        Number(
          booking.bookingId.replace(
            'BK-',
            ''
          )
        );

      if (!appointmentId) {
        setCancelError(
          'Invalid appointment ID.'
        );
        return;
      }


      // =================================================
      // CONFIRMATION
      // =================================================

      const confirmed =
        window.confirm(
          'Are you sure you want to cancel this appointment?\n\nIf your payment was completed, the refund will be initiated automatically.'
        );

      if (!confirmed) {
        return;
      }


      try {

        setCancelling(true);
        setCancelError('');
        setCancelMessage('');
        setRefundStatus('');
        setRefundId('');


        // =================================================
        // CANCEL APPOINTMENT
        // =================================================

        const response =
          await fetch(
            `${API_URL}/appointments/${appointmentId}/cancel`,
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
              },
            }
          );


        // =================================================
        // READ RESPONSE
        // =================================================

        const data: CancelResponse =
          await response.json().catch(
            () => ({})
          );


        if (!response.ok) {

          throw new Error(
            data.error ||
              'Unable to cancel appointment.'
          );
        }


        // =================================================
        // UPDATE UI
        // =================================================

        setLiveStatus(
          data.appointment?.status ||
            'CANCELLED'
        );


        setCancelMessage(
          data.message ||
            'Appointment cancelled successfully.'
        );


        // =================================================
        // REFUND INFORMATION
        // =================================================

        if (data.payment) {

          setRefundStatus(
            data.payment.refundStatus ||
              ''
          );


          setRefundId(
            data.payment.razorpayRefundId ||
              ''
          );

        }

      } catch (error) {

        console.error(
          'Cancellation failed:',
          error
        );

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
      Number(
        booking.bookingId.replace('BK-', '')
      );

    if (!appointmentId) {
      return;
    }

    let mounted = true;

    const checkRefundStatus = async () => {
      try {
        const response = await fetch(
          `${API_URL}/payments/appointment/${appointmentId}`
        );

        if (!response.ok) {
          return;
        }

        const payment = await response.json();

        if (!mounted) {
          return;
        }

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

    // Check immediately
    checkRefundStatus();

    // Then check every 5 seconds
    const interval = window.setInterval(
      checkRefundStatus,
      5000
    );

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [
    booking,
    liveStatus,
    refundStatus
  ]);

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
        <div className="flex flex-col items-center justify-center py-[64px] gap-[16px]">

          <div className="size-[48px] rounded-full border-[3px] border-[#d8e1ec] border-t-[#155ead] animate-spin" />

          <p className="font-semibold text-[#526176] text-[14px]">
            Preparing your booking…
          </p>

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
        normalizedStatus ===
          'IN PROGRESS'
      ? 'In Progress'
      : normalizedStatus ===
        'COMPLETED'
      ? 'Completed'
      : normalizedStatus ===
        'CANCELLED'
      ? 'Cancelled'
      : 'Confirmed';


  // =====================================================
  // CAN CANCEL?
  // =====================================================

  const canCancel =
    normalizedStatus !==
      'CANCELLED' &&
    normalizedStatus !==
      'COMPLETED' &&
    normalizedStatus !==
      'IN_PROGRESS' &&
    normalizedStatus !==
      'IN PROGRESS' &&
    !cancelling;


  // =====================================================
  // RETURN UI
  // =====================================================

  return (
    <PatientLayout
      step={4}
      showBack={false}
      maxWidth="max-w-[720px]"
    >

      {/* =================================================
          SUCCESS HERO
      ================================================= */}

      <div className="text-center mb-[32px]">

        <div className="bg-[#e8f7f1] size-[80px] rounded-[999px] flex items-center justify-center mx-auto mb-[20px]">

          <span className="text-[#18865b] text-[36px]">
            {normalizedStatus ===
            'CANCELLED'
              ? '×'
              : '✓'}
          </span>

        </div>


        <h1 className="font-bold text-[#142033] text-[26px] mb-[6px]">

          {normalizedStatus ===
          'CANCELLED'
            ? 'Appointment Cancelled'
            : 'Booking Confirmed!'}

        </h1>


        <p className="font-normal text-[#526176] text-[15px]">

          {normalizedStatus ===
          'CANCELLED'
            ? 'Your OPD appointment has been cancelled.'
            : (
                <>
                  Your OPD appointment has been successfully booked,{' '}
                  {patientName}.
                </>
              )}

        </p>

      </div>


      {/* =================================================
          TOKEN HIGHLIGHT
      ================================================= */}

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


      {/* =================================================
          BOOKING DETAILS
      ================================================= */}

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
              value:
                booking.doctorSpecialization,
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


      {/* =================================================
          CANCEL / REFUND SUCCESS MESSAGE
      ================================================= */}

      {cancelMessage && (

        <div className="bg-[#e8f7f1] border border-[#b9e5d3] rounded-[14px] p-[18px] mb-[20px]">

          <div className="flex items-start gap-[12px]">

            <div className="bg-[#18865b] text-white size-[28px] rounded-full flex items-center justify-center shrink-0">
              ✓
            </div>


            <div>

              <p className="font-bold text-[#146b4a] text-[14px] mb-[4px]">
                Appointment Cancelled
              </p>


              <p className="text-[#526176] text-[12px]">
                {cancelMessage}
              </p>


              {refundStatus && (

                <p className="text-[#526176] text-[12px] mt-[6px]">
                  Refund Status:{' '}
                  <span className="font-semibold">
                    {refundStatus}
                  </span>
                </p>

              )}


              {refundId && (

                <p className="text-[#526176] text-[12px] mt-[4px] break-all">
                  Refund ID:{' '}
                  <span className="font-semibold">
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

        <div className="bg-[#fff1f1] border border-[#f3c2c2] rounded-[14px] p-[16px] mb-[20px]">

          <p className="font-bold text-[#b42318] text-[13px] mb-[4px]">
            Unable to cancel appointment
          </p>

          <p className="text-[#7b4a4a] text-[12px]">
            {cancelError}
          </p>

        </div>

      )}


      {/* =================================================
          LIVE QUEUE INFORMATION
      ================================================= */}

      {normalizedStatus !== 'CANCELLED' && (

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

                {queueLoading
                  ? 'Updating...'
                  : 'Live'}

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

              <div
                key={row.label}
                className="text-center"
              >

                <p className="font-bold text-[#142033] text-[20px]">
                  {row.value}
                </p>


                <p className="font-normal text-[#526176] text-[11px] mt-[2px]">
                  {row.label}
                </p>

              </div>

            ))}

          </div>


          {/* AI MESSAGE */}

          {waitingTime?.message && (

            <div className="mt-[14px] pt-[12px] border-t border-[#c3d9f7]">

              <p className="text-[11px] text-[#526176] text-center">
                🤖 {waitingTime.message}
              </p>

            </div>

          )}


          {queueError &&
            !queueLoading && (

              <div className="mt-[14px]">

                <ErrorState
                  compact
                  description={queueError}
                  onRetry={loadLiveQueueData}
                />

              </div>

            )}

        </div>

      )}


      {/* =================================================
          ACTIONS
      ================================================= */}

      <div className="flex gap-[12px] flex-wrap">

        <Button
          variant="primary"
          onClick={() =>
            navigate('/patient/token')
          }
          className="flex-1 justify-center py-[12px] text-[14px]"
        >
          Track My Token →
        </Button>


        <Button
          variant="secondary"
          onClick={() =>
            navigate('/patient/appointment')
          }
          className="py-[12px] text-[14px]"
        >
          Appointment Details
        </Button>

      </div>


      {/* =================================================
          CANCEL APPOINTMENT BUTTON
      ================================================= */}

      {canCancel && (

        <div className="mt-[16px]">

          <Button
            variant="secondary"
            onClick={handleCancelAppointment}
            disabled={cancelling}
            className="w-full justify-center py-[12px] text-[14px] border border-[#ef4444] text-[#dc2626]"
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

      {normalizedStatus ===
        'CANCELLED' &&
        refundStatus && (

          <div className="mt-[16px] bg-[#fff8e7] border border-[#f0d99a] rounded-[14px] p-[14px] text-center">

            <p className="font-semibold text-[#8a6200] text-[12px]">
              Refund Status
            </p>


            <p className="font-bold text-[#6b4f00] text-[14px] mt-[4px]">
              {refundStatus}
            </p>

          </div>

        )}


      {/* =================================================
          FOOTER MESSAGE
      ================================================= */}

      <p className="text-center font-normal text-[#7b899c] text-[12px] mt-[16px]">

        {normalizedStatus ===
        'CANCELLED'
          ? 'Your appointment has been cancelled. Please keep the refund details for your records.'
          : 'Show this token at the reception or track it online.'}

      </p>

    </PatientLayout>
  );
}