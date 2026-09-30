import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PatientLayout from '../../components/PatientLayout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { usePatient } from '../../context/PatientContext';
import { ErrorState } from '../../components/EmptyState';

import {
  hasMinimumLength,
  isTenDigitPhone,
} from '../../utils/validation';



/* =========================================================
 * RAZORPAY TYPES
 * ========================================================= */
type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    contact?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayPaymentResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayCheckout = {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
};

type BackendPayment = {
  id: number;
  amount: number;
  currency: string;
  paymentStatus: string;
  razorpayOrderId?: string;
  paymentMethod?: string;
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayCheckout;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src=\"https://checkout.razorpay.com/v1/checkout.js\"]'
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

type BackendSlot = {
  id: string;
  time: string;
  available: boolean;
  remaining: number;
};

type BackendAppointment = {
  id: number;
  appointmentDate?: string;
  appointmentTime?: string;
  status?: string;
  doctor?: {
    id?: number;
  };
};

/*
 * Generate today's date + next 4 days.
 */
const getAvailableDates = (): string[] => {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < 5; i++) {
    const date = new Date(today);

    date.setDate(today.getDate() + i);

    const formattedDate = date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    dates.push(formattedDate);
  }

  return dates;
};

const DATES = getAvailableDates();

export default function BookOPDPage() {
  const navigate = useNavigate();

  const {
    selectedHospital,
    selectedDepartment,
    selectedDoctor,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    patientName,
    patientPhone,
    reasonForVisit,
    setReasonForVisit,
    confirmBooking,
  } = usePatient();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  /*
   * PAYMENT METHOD
   */
  const [paymentMethod, setPaymentMethod] =
    useState<'ONLINE' | 'PAY_AT_HOSPITAL'>('ONLINE');

  /*
   * REAL BACKEND SLOTS
   *
   * No mock opdSlots are used.
   */
  const [opdSlots, setOpdSlots] = useState<BackendSlot[]>([]);

  /*
   * Loading state while backend slots are being fetched.
   */
  const [slotsLoading, setSlotsLoading] = useState(false);

  /*
   * Current time is kept only for the Live indicator.
   *
   * Slot availability itself is decided by backend.
   */
  const [currentTime, setCurrentTime] = useState(
    new Date()
  );

  /*
   * REAL QUEUE SUMMARY
   *
   * These values come from PostgreSQL through the
   * Appointment API. No patientsToday / queueLength /
   * nextSlot mock values are used here.
   */
  const [patientsToday, setPatientsToday] =
    useState(0);

  const [currentlyWaiting, setCurrentlyWaiting] =
    useState(0);

  const [queueLoading, setQueueLoading] =
    useState(false);

  const [queueError, setQueueError] =
    useState('');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  /*
   * If required selection is missing,
   * return to hospital selection.
   */
  if (
    !selectedHospital ||
    !selectedDepartment ||
    !selectedDoctor
  ) {
    navigate('/patient/hospital');
    return null;
  }

  /*
   * Convert:
   *
   * Mon, 28 Sep 2026
   *
   * into a JavaScript Date.
   */
  const parseSelectedDate = (
    dateString: string
  ): Date | null => {
    const match = dateString.match(
      /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s(\d{1,2})\s([A-Za-z]{3,9})\s(\d{4})$/
    );

    if (!match) {
      return null;
    }

    const [, day, month, year] = match;

    const monthMap: Record<string, number> = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Sept: 8,
      September: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };

    const monthNumber = monthMap[month];

    if (monthNumber === undefined) {
      return null;
    }

    return new Date(
      Number(year),
      monthNumber,
      Number(day)
    );
  };

  /*
   * =====================================================
   * FETCH REAL SLOTS FROM BACKEND
   * =====================================================
   *
   * Example:
   *
   * GET
   * http://localhost:8080/api/doctors/1/slots?date=2026-09-28
   */
  useEffect(() => {
    const loadSlots = async () => {
      if (
        !selectedDoctor?.id ||
        !selectedDate
      ) {
        setOpdSlots([]);
        return;
      }

      const selectedDateObject =
        parseSelectedDate(selectedDate);

      if (!selectedDateObject) {
        setOpdSlots([]);
        return;
      }

      const year =
        selectedDateObject.getFullYear();

      const month = String(
        selectedDateObject.getMonth() + 1
      ).padStart(2, '0');

      const day = String(
        selectedDateObject.getDate()
      ).padStart(2, '0');

      const backendDate =
        `${year}-${month}-${day}`;

      setSlotsLoading(true);
      setError('');

      /*
       * Whenever date changes, remove old selected slot.
       */
      setSelectedSlot('');

      try {
        const response = await fetch(
          `http://localhost:8080/api/doctors/${selectedDoctor.id}/slots?date=${backendDate}`
        );

        if (!response.ok) {
          throw new Error(
            `Unable to load time slots (${response.status})`
          );
        }

        const data: unknown =
          await response.json();

        if (
          !data ||
          typeof data !== 'object' ||
          !Array.isArray(
            (data as { slots?: unknown }).slots
          )
        ) {
          throw new Error(
            'Invalid slot response from server.'
          );
        }

        const slots =
          (data as {
            slots: BackendSlot[];
          }).slots;

        setOpdSlots(slots);

      } catch (err) {
        console.error(
          'Unable to load slots:',
          err
        );

        setOpdSlots([]);

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load available time slots.'
        );

      } finally {
        setSlotsLoading(false);
      }
    };

    void loadSlots();

  }, [
    selectedDoctor?.id,
    selectedDate,
  ]);

  /*
   * =====================================================
   * FETCH REAL QUEUE SUMMARY FROM BACKEND
   * =====================================================
   *
   * Patients today:
   *   All non-cancelled appointments for this doctor/date.
   *
   * Currently waiting:
   *   WAITING appointments returned by the queue endpoint.
   *
   * The existing backend APIs are used; no new backend
   * endpoint is required for this summary.
   */
  useEffect(() => {
    const loadQueueSummary = async () => {
      if (
        !selectedDoctor?.id ||
        !selectedDate
      ) {
        setPatientsToday(0);
        setCurrentlyWaiting(0);
        setQueueError('');
        return;
      }

      const selectedDateObject =
        parseSelectedDate(selectedDate);

      if (!selectedDateObject) {
        setPatientsToday(0);
        setCurrentlyWaiting(0);
        setQueueError(
          'Unable to read the selected date.'
        );
        return;
      }

      const year =
        selectedDateObject.getFullYear();

      const month = String(
        selectedDateObject.getMonth() + 1
      ).padStart(2, '0');

      const day = String(
        selectedDateObject.getDate()
      ).padStart(2, '0');

      const backendDate =
        `${year}-${month}-${day}`;

      setQueueLoading(true);
      setQueueError('');

      try {
        /*
         * 1. Get all appointments.
         * Used to calculate total patients for
         * the selected doctor/date.
         */
        const appointmentsResponse =
          await fetch(
            'http://localhost:8080/api/appointments'
          );

        if (!appointmentsResponse.ok) {
          throw new Error(
            `Unable to load today's appointments (${appointmentsResponse.status})`
          );
        }

        const appointmentsData: unknown =
          await appointmentsResponse.json();

        if (!Array.isArray(appointmentsData)) {
          throw new Error(
            'Invalid appointments response from server.'
          );
        }

        const doctorAppointments =
          (appointmentsData as BackendAppointment[])
            .filter(
              (appointment) =>
                Number(
                  appointment.doctor?.id
                ) === Number(selectedDoctor.id)
            )
            .filter(
              (appointment) =>
                appointment.appointmentDate ===
                backendDate
            )
            .filter(
              (appointment) =>
                String(
                  appointment.status ?? ''
                ).toUpperCase() !==
                'CANCELLED'
            );

        setPatientsToday(
          doctorAppointments.length
        );

        /*
         * 2. Get the active waiting queue.
         */
        const queueResponse =
          await fetch(
            `http://localhost:8080/api/appointments/queue?doctorId=${selectedDoctor.id}&appointmentDate=${backendDate}`
          );

        if (!queueResponse.ok) {
          throw new Error(
            `Unable to load live queue (${queueResponse.status})`
          );
        }

        const queueData: unknown =
          await queueResponse.json();

        if (!Array.isArray(queueData)) {
          throw new Error(
            'Invalid queue response from server.'
          );
        }

        /*
         * The current queue endpoint returns WAITING
         * appointments. Count them directly.
         */
        setCurrentlyWaiting(
          queueData.length
        );

      } catch (err) {
        console.error(
          'Unable to load queue summary:',
          err
        );

        setPatientsToday(0);
        setCurrentlyWaiting(0);

        setQueueError(
          err instanceof Error
            ? err.message
            : 'Unable to load live queue.'
        );

      } finally {
        setQueueLoading(false);
      }
    };

    void loadQueueSummary();

  }, [
    selectedDoctor?.id,
    selectedDate,
  ]);

  /*
   * Check whether selected date is today.
   *
   * Used only for the "Live" indicator.
   */
  const isSelectedDateToday = (): boolean => {
    const selectedDateObject =
      parseSelectedDate(selectedDate);

    if (!selectedDateObject) {
      return false;
    }

    return (
      selectedDateObject.getFullYear() ===
        currentTime.getFullYear() &&
      selectedDateObject.getMonth() ===
        currentTime.getMonth() &&
      selectedDateObject.getDate() ===
        currentTime.getDate()
    );
  };

  /*
   * IMPORTANT:
   *
   * Do NOT filter slots on frontend based on current time.
   *
   * Backend SlotService already decides:
   *
   * available: true / false
   * remaining: number
   *
   * Therefore frontend simply displays the backend result.
   */
  const visibleSlots = opdSlots;

  /*
   * First available slot from the backend.
   *
   * This replaces selectedDoctor.nextSlot mock data.
   */
  const nextAvailableSlot =
    visibleSlots.find(
      (slot) => slot.available
    )?.time ?? 'No slots available';

  /*
   * Select a time slot.
   */
  const handleSlotSelect = (
    slotTime: string
  ) => {
    if (submitting) {
      return;
    }

    const slot =
      opdSlots.find(
        (item) =>
          item.time === slotTime
      );

    /*
     * Extra protection:
     * only an available backend slot can be selected.
     */
    if (!slot || !slot.available) {
      return;
    }

    setSelectedSlot(slotTime);
    setError('');
  };

  /*
   * Change selected date.
   */
  const handleDateChange = (
    date: string
  ) => {
    setSelectedDate(date);
    setSelectedSlot('');
    setError('');
  };

  /*
   * =====================================================
   * CONFIRM BOOKING
   * =====================================================
   */
  const handleBook = async () => {
    if (!selectedSlot || submitting) {
      return;
    }

    /*
     * Final slot availability check before creating the appointment.
     */
    const selectedSlotData = opdSlots.find(
      (slot) => slot.time === selectedSlot
    );

    if (!selectedSlotData || !selectedSlotData.available) {
      setSelectedSlot('');
      setError(
        'This time slot is no longer available. Please select another slot.'
      );
      return;
    }

    /* Patient validation */
    if (!hasMinimumLength(patientName, 2)) {
      setError('Full name must be at least 2 characters.');
      return;
    }

    if (!isTenDigitPhone(patientPhone)) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    if (!reasonForVisit.trim()) {
      setError('Please enter your reason for visit.');
      return;
    }

    const amount = Number(selectedDoctor.fee);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Invalid consultation fee. Please contact the hospital.');
      return;
    }

    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (
      paymentMethod === 'ONLINE' &&
      !razorpayKeyId
    ) {
      setError(
        'Razorpay Key ID is missing. Add VITE_RAZORPAY_KEY_ID to the frontend .env file and restart Vite.'
      );
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      /*
       * STEP 1: Create the HospitalFlow appointment.
       *
       * The existing confirmBooking() is preserved, so the real
       * backend slot/queue/token flow continues to work.
       */
      console.log('Creating HospitalFlow appointment...');

      const booking = await confirmBooking();

      console.log('Appointment successfully created:', booking);

      if (!booking?.appointmentId) {
        throw new Error(
          'Appointment was created but no appointment ID was returned.'
        );
      }

      /*
       * STEP 2: Create the payment record.
       *
       * ONLINE:
       * - Backend creates a Razorpay order.
       * - Razorpay Checkout is opened.
       * - Backend verifies the Razorpay signature.
       *
       * PAY_AT_HOSPITAL:
       * - Backend creates a PENDING payment record.
       * - No Razorpay order is created.
       * - Appointment is confirmed directly.
       */
      const createPaymentUrl =
        `http://localhost:8080/api/payments/create?appointmentId=${encodeURIComponent(
          booking.appointmentId
        )}&amount=${encodeURIComponent(
          amount
        )}&paymentMethod=${encodeURIComponent(
          paymentMethod
        )}`;

      const paymentResponse = await fetch(
        createPaymentUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const paymentData: unknown =
        await paymentResponse.json();

      if (!paymentResponse.ok) {
        const backendMessage =
          paymentData &&
          typeof paymentData === 'object' &&
          'error' in paymentData
            ? String(
                (paymentData as { error?: unknown }).error ??
                  'Unable to create payment.'
              )
            : 'Unable to create payment.';

        throw new Error(backendMessage);
      }

      if (
        !paymentData ||
        typeof paymentData !== 'object'
      ) {
        throw new Error(
          'Invalid payment response from server.'
        );
      }

      const payment =
        paymentData as BackendPayment;

      if (!payment.id) {
        throw new Error(
          'Payment record was not created.'
        );
      }

      /*
       * =====================================================
       * PAY AT HOSPITAL
       * =====================================================
       */
      if (paymentMethod === 'PAY_AT_HOSPITAL') {

        console.log(
          'Appointment confirmed with Pay at Hospital:',
          payment
        );

        /*
         * No Razorpay verification is required.
         * Payment intentionally remains PENDING.
         */
        navigate('/patient/confirmation');
        return;
      }

      /*
       * =====================================================
       * ONLINE PAYMENT
       * =====================================================
       */

      if (!payment.razorpayOrderId) {
        throw new Error(
          'Payment was created but Razorpay order information is missing.'
        );
      }

      /*
       * STEP 3: Load Razorpay Checkout.js.
       */
      const razorpayLoaded =
        await loadRazorpayScript();

      if (
        !razorpayLoaded ||
        !window.Razorpay
      ) {
        throw new Error(
          'Unable to load Razorpay Checkout. Please check your internet connection and try again.'
        );
      }

      /*
       * STEP 4: Open Razorpay Checkout.
       */
      await new Promise<void>((resolve, reject) => {

        let settled = false;

        const finishResolve = () => {
          if (settled) return;
          settled = true;
          resolve();
        };

        const finishReject = (
          message: string
        ) => {
          if (settled) return;
          settled = true;
          reject(new Error(message));
        };

        const checkout =
          new window.Razorpay({

            key: razorpayKeyId as string,

            amount:
              Math.round(amount * 100),

            currency:
              payment.currency || 'INR',

            name: 'HospitalFlow',

            description:
              `OPD Consultation - Appointment #${booking.appointmentId}`,

            order_id:
              payment.razorpayOrderId,

            prefill: {
              name: patientName,
              contact: patientPhone,
            },

            theme: {
              color: '#155ead',
            },

            /*
             * STEP 5: Razorpay returns payment ID + signature.
             * Send both to our backend for HMAC verification.
             */
            handler: async (
              response
            ) => {

              try {

                const verifyUrl =
                  `http://localhost:8080/api/payments/verify?paymentId=${encodeURIComponent(
                    payment.id
                  )}&razorpayPaymentId=${encodeURIComponent(
                    response.razorpay_payment_id
                  )}&razorpaySignature=${encodeURIComponent(
                    response.razorpay_signature
                  )}`;

                const verifyResponse =
                  await fetch(
                    verifyUrl,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type':
                          'application/json',
                      },
                    }
                  );

                const verifyData: unknown =
                  await verifyResponse.json();

                if (!verifyResponse.ok) {

                  const verifyMessage =
                    verifyData &&
                    typeof verifyData ===
                      'object' &&
                    'error' in verifyData
                      ? String(
                          (
                            verifyData as {
                              error?: unknown;
                            }
                          ).error ??
                            'Payment verification failed.'
                        )
                      : 'Payment verification failed.';

                  finishReject(
                    verifyMessage
                  );

                  return;
                }

                const verifiedPayment =
                  verifyData as Partial<BackendPayment>;

                if (
                  verifiedPayment.paymentStatus !==
                  'PAID'
                ) {

                  finishReject(
                    'Payment was received but could not be verified.'
                  );

                  return;
                }

                console.log(
                  'Razorpay payment verified successfully:',
                  verifiedPayment
                );

                finishResolve();

              } catch (
                verificationError
              ) {

                console.error(
                  'Payment verification error:',
                  verificationError
                );

                finishReject(
                  verificationError instanceof
                    Error
                    ? verificationError.message
                    : 'Payment verification failed.'
                );
              }
            },

            modal: {

              ondismiss: () => {

                finishReject(
                  'Payment was cancelled. Your appointment has not been confirmed as paid.'
                );

              },

            },

          });

        checkout.on(
          'payment.failed',
          () => {

            finishReject(
              'Payment failed. Please try again or choose another payment method.'
            );

          }
        );

        checkout.open();

      });

      /*
       * Only navigate after backend payment verification succeeds.
       */
      navigate('/patient/confirmation');


    } catch (err) {
      console.error('Booking/payment failed:', err);

      const message =
        err instanceof Error
          ? err.message
          : 'Unable to complete appointment booking and payment.';

      setError(message);

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PatientLayout
      step={3}
      backTo="/patient/doctor"
      maxWidth="max-w-[860px]"
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-[24px]">

        <h1 className="font-bold text-[#142033] text-[24px]">
          Book OPD Appointment
        </h1>

        <p className="font-normal text-[#526176] text-[14px] mt-[4px]">
          Review your selections and choose a time slot.
        </p>

      </div>

      <div className="flex flex-col lg:flex-row gap-[14px] lg:gap-[18px]">

        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <div className="flex-1 min-w-0 flex flex-col gap-[16px]">

          {/* =================================================
              BOOKING SUMMARY
          ================================================= */}

          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]">

            <div className="flex items-center gap-[8px] mb-[16px] pb-[14px] border-b border-[#d8e1ec]">

              <div className="bg-[#18865b] h-[20px] rounded-[2px] w-[4px]" />

              <p className="font-bold text-[#142033] text-[15px]">
                Booking Summary
              </p>

            </div>

            <div className="flex flex-col gap-[12px]">

              {[
                {
                  label: 'Patient',
                  value:
                    patientName ||
                    'Not entered',
                },
                {
                  label: 'Hospital',
                  value:
                    selectedHospital.name,
                },
                {
                  label: 'Department',
                  value:
                    selectedDepartment,
                },
                {
                  label: 'Doctor',
                  value:
                    selectedDoctor.name,
                },
                {
                  label: 'Specialization',
                  value:
                    selectedDoctor.specialization,
                },
                {
                  label: 'Room',
                  value:
                    selectedDoctor.room ||
                    'Room not assigned',
                },
                {
                  label: 'Consultation Fee',
                  value:
                    `₹${selectedDoctor.fee}`,
                },
              ].map((row) => (

                <div
                  key={row.label}
                  className="flex items-center justify-between gap-[16px]"
                >

                  <p className="font-normal text-[#7b899c] text-[13px] shrink-0">
                    {row.label}
                  </p>

                  <p className="font-semibold text-[#142033] text-[13px] text-right">
                    {row.value}
                  </p>

                </div>

              ))}

              <div className="flex items-center justify-between gap-[16px]">

                <p className="font-normal text-[#7b899c] text-[13px]">
                  Doctor Status
                </p>

                <StatusBadge
                  status={
                    selectedDoctor.status
                  }
                />

              </div>

            </div>

          </div>

          {/* =================================================
              REASON FOR VISIT
          ================================================= */}

          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]">

            <div className="flex items-center gap-[8px] mb-[12px]">

              <div className="bg-[#6750a4] h-[20px] rounded-[2px] w-[4px]" />

              <p className="font-bold text-[#142033] text-[15px]">
                Reason for Visit
              </p>

              <span className="text-[#d14343] text-[13px]">
                *
              </span>

            </div>

            <p className="font-normal text-[#7b899c] text-[12px] mb-[8px]">
              Briefly describe why you are visiting the doctor.
            </p>

            <textarea
              value={reasonForVisit}
              onChange={(event) => {
                setReasonForVisit(
                  event.target.value
                );

                setError('');
              }}
              disabled={submitting}
              rows={4}
              maxLength={500}
              placeholder="Example: Fever and weakness for the last 2 days"
              className="w-full resize-none rounded-[10px] border border-[#d8e1ec] bg-white px-[12px] py-[10px] text-[13px] text-[#142033] outline-none transition-colors placeholder:text-[#9aa7b8] focus:border-[#155ead] focus:ring-2 focus:ring-[#155ead]/10 disabled:bg-[#f4f7fb] disabled:cursor-not-allowed"
            />

            <div className="flex justify-end mt-[5px]">

              <span className="text-[10px] text-[#7b899c]">
                {reasonForVisit.length}/500
              </span>

            </div>

          </div>

          {/* =================================================
              SELECT DATE
          ================================================= */}

          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]">

            <div className="flex items-center gap-[8px] mb-[14px]">

              <div className="bg-[#2475d0] h-[20px] rounded-[2px] w-[4px]" />

              <p className="font-bold text-[#142033] text-[15px]">
                Select Date
              </p>

            </div>

            <div className="flex gap-[8px] flex-wrap">

              {DATES.map((date) => (

                <button
                  key={date}
                  onClick={() =>
                    handleDateChange(
                      date
                    )
                  }
                  disabled={submitting}
                  className={`px-[14px] py-[9px] rounded-[10px] text-[12px] font-semibold border transition-colors ${
                    selectedDate === date
                      ? 'bg-[#155ead] text-white border-[#155ead]'
                      : 'bg-white border-[#d8e1ec] text-[#526176] hover:bg-[#f4f7fb]'
                  } ${
                    submitting
                      ? 'opacity-60 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  {date}
                </button>

              ))}

            </div>

          </div>

          {/* =================================================
              SELECT TIME SLOT
          ================================================= */}

          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]">

            <div className="flex items-center justify-between gap-[10px] mb-[14px]">

              <div className="flex items-center gap-[8px]">

                <div className="bg-[#6750a4] h-[20px] rounded-[2px] w-[4px]" />

                <p className="font-bold text-[#142033] text-[15px]">
                  Select Time Slot
                </p>

              </div>

              {isSelectedDateToday() && (
                <span className="text-[10px] font-semibold text-[#18865b] bg-[#e8f7f1] px-[8px] py-[4px] rounded-full">
                  Live
                </span>
              )}

            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {slotsLoading ? (

              <div className="bg-[#f4f7fb] border border-[#d8e1ec] rounded-[10px] px-[14px] py-[18px] text-center">

                <p className="font-semibold text-[#526176] text-[13px]">
                  Loading available time slots...
                </p>

                <p className="font-normal text-[#7b899c] text-[11px] mt-[4px]">
                  Checking live availability.
                </p>

              </div>

            ) : visibleSlots.length === 0 ? (

              <div className="bg-[#f4f7fb] border border-[#d8e1ec] rounded-[10px] px-[14px] py-[18px] text-center">

                <p className="font-semibold text-[#526176] text-[13px]">
                  No available time slots
                </p>

                <p className="font-normal text-[#7b899c] text-[11px] mt-[4px]">
                  There are currently no slots returned by the server for this date.
                  Please select another date.
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-[8px]">

                {visibleSlots.map((slot) => {

                  const isSelected =
                    selectedSlot ===
                    slot.time;

                  return (

                    <button
                      key={slot.id}
                      onClick={() =>
                        handleSlotSelect(
                          slot.time
                        )
                      }
                      disabled={
                        !slot.available ||
                        submitting
                      }
                      className={`rounded-[10px] p-[10px] text-center border transition-colors ${
                        !slot.available
                          ? 'bg-[#f4f7fb] border-[#f4f7fb] opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#155ead] border-[#155ead] text-white'
                          : 'bg-white border-[#d8e1ec] hover:border-[#afc0d3] cursor-pointer'
                      }`}
                    >

                      <p
                        className={`font-bold text-[12px] ${
                          isSelected
                            ? 'text-white'
                            : slot.available
                            ? 'text-[#142033]'
                            : 'text-[#afc0d3]'
                        }`}
                      >
                        {slot.time}
                      </p>

                      {slot.available ? (

                        <p
                          className={`font-normal text-[10px] mt-[2px] ${
                            isSelected
                              ? 'text-[rgba(255,255,255,0.8)]'
                              : 'text-[#7b899c]'
                          }`}
                        >
                          {slot.remaining} left
                        </p>

                      ) : (

                        <p className="font-normal text-[#afc0d3] text-[10px] mt-[2px]">
                          Full
                        </p>

                      )}

                    </button>

                  );

                })}

              </div>

            )}

            {!slotsLoading &&
              !selectedSlot &&
              visibleSlots.length > 0 && (

                <p className="font-normal text-[#a86508] text-[12px] mt-[10px]">
                  Please select a time slot to continue.
                </p>

              )}

          </div>


        {/* =================================================
            PAYMENT METHOD
        ================================================= */}

        <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]">

          <div className="flex items-center gap-[8px] mb-[6px]">

            <div className="bg-[#18865b] h-[20px] rounded-[2px] w-[4px]" />

            <p className="font-bold text-[#142033] text-[15px]">
              Payment Method
            </p>

          </div>

          <p className="font-normal text-[#7b899c] text-[12px] mb-[14px]">
            Choose how you want to pay your consultation fee.
          </p>

          <div className="flex flex-col gap-[10px]">

            <button
              type="button"
              onClick={() => {
                setPaymentMethod('ONLINE');
                setError('');
              }}
              disabled={submitting}
              className={`w-full text-left rounded-[12px] border p-[14px] transition-colors ${
                paymentMethod === 'ONLINE'
                  ? 'border-[#155ead] bg-[#eef6ff]'
                  : 'border-[#d8e1ec] bg-white hover:bg-[#f8fafc]'
              } ${
                submitting
                  ? 'opacity-60 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >

              <div className="flex items-start gap-[12px]">

                <div
                  className={`mt-[2px] h-[18px] w-[18px] rounded-full border flex items-center justify-center shrink-0 ${
                    paymentMethod === 'ONLINE'
                      ? 'border-[#155ead]'
                      : 'border-[#9aa7b8]'
                  }`}
                >
                  {paymentMethod === 'ONLINE' && (
                    <div className="h-[8px] w-[8px] rounded-full bg-[#155ead]" />
                  )}
                </div>

                <div className="min-w-0">

                  <p className="font-bold text-[#142033] text-[13px]">
                    Pay Online
                  </p>

                  <p className="font-normal text-[#526176] text-[11px] mt-[3px] leading-relaxed">
                    Secure payment through Razorpay using UPI, card, net banking or wallet.
                  </p>

                </div>

              </div>

            </button>

            <button
              type="button"
              onClick={() => {
                setPaymentMethod('PAY_AT_HOSPITAL');
                setError('');
              }}
              disabled={submitting}
              className={`w-full text-left rounded-[12px] border p-[14px] transition-colors ${
                paymentMethod === 'PAY_AT_HOSPITAL'
                  ? 'border-[#18865b] bg-[#effaf6]'
                  : 'border-[#d8e1ec] bg-white hover:bg-[#f8fafc]'
              } ${
                submitting
                  ? 'opacity-60 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >

              <div className="flex items-start gap-[12px]">

                <div
                  className={`mt-[2px] h-[18px] w-[18px] rounded-full border flex items-center justify-center shrink-0 ${
                    paymentMethod === 'PAY_AT_HOSPITAL'
                      ? 'border-[#18865b]'
                      : 'border-[#9aa7b8]'
                  }`}
                >
                  {paymentMethod === 'PAY_AT_HOSPITAL' && (
                    <div className="h-[8px] w-[8px] rounded-full bg-[#18865b]" />
                  )}
                </div>

                <div className="min-w-0">

                  <p className="font-bold text-[#142033] text-[13px]">
                    Pay at Hospital
                  </p>

                  <p className="font-normal text-[#526176] text-[11px] mt-[3px] leading-relaxed">
                    Confirm your appointment now and pay the consultation fee at the hospital.
                  </p>

                </div>

              </div>

            </button>

          </div>

          <div className="mt-[12px] rounded-[9px] bg-[#f4f7fb] px-[11px] py-[9px]">

            <div className="flex items-center justify-between gap-[12px]">

              <span className="font-normal text-[#7b899c] text-[11px]">
                Consultation fee
              </span>

              <span className="font-bold text-[#142033] text-[13px]">
                ₹{selectedDoctor.fee}
              </span>

            </div>

            {paymentMethod === 'PAY_AT_HOSPITAL' && (
              <p className="font-normal text-[#526176] text-[10px] mt-[5px] leading-relaxed">
                No online payment will be charged now.
              </p>
            )}

          </div>

        </div>


        </div>

        {/* ===================================================
            RIGHT SIDE
        =================================================== */}

        <div className="w-full lg:w-[240px] lg:shrink-0 flex flex-col gap-[14px]">

          {/* =================================================
              TODAY'S QUEUE
          ================================================= */}

          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]">

            <p className="font-bold text-[#142033] text-[14px] mb-[12px]">
              Queue Summary
            </p>

            {queueError && (
              <p className="text-[#b42318] text-[11px] mb-[8px]">
                {queueError}
              </p>
            )}

            <div className="flex flex-col gap-[6px]">

              {[
                {
                  label: 'Patients today',
                  value:
                    queueLoading
                      ? '...'
                      : patientsToday,
                },
                {
                  label: 'Currently waiting',
                  value:
                    queueLoading
                      ? '...'
                      : currentlyWaiting,
                },
                {
                  label: 'Est. wait',
                  value:
                    queueLoading
                      ? '...'
                      : currentlyWaiting === 0
                      ? 'No wait'
                      : `~${currentlyWaiting * 10} min`,
                },
                {
                  label: 'Next slot',
                  value:
                    nextAvailableSlot,
                },
              ].map((row) => (

                <div
                  key={row.label}
                  className="flex items-center justify-between py-[5px] border-b border-[#f4f7fb] last:border-0"
                >

                  <p className="font-normal text-[#526176] text-[12px]">
                    {row.label}
                  </p>

                  <p className="font-bold text-[#142033] text-[12px]">
                    {row.value}
                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* =================================================
              HOW IT WORKS
          ================================================= */}

          <div className="bg-[#eaf3fd] border border-[#c3d9f7] rounded-[12px] p-[14px]">

            <p className="font-bold text-[#155ead] text-[12px] mb-[4px]">
              💡 How it works
            </p>

            <p className="font-normal text-[#526176] text-[12px] leading-relaxed">
              After booking, you'll receive a real token number.
              Track your position in the live queue and visit when
              it's your turn.
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="mt-[18px]">

          <ErrorState
            compact
            title="Booking could not be completed"
            description={error}
            onRetry={handleBook}
            retryLabel="Retry booking"
          />

        </div>

      )}

      {/* =====================================================
          CONFIRM BOOKING
      ===================================================== */}

      <div className="mt-[24px] flex items-center gap-[12px] flex-wrap">

        <Button
          variant="primary"
          onClick={handleBook}
          disabled={
            !selectedSlot ||
            submitting ||
            slotsLoading
          }
          loading={submitting}
          className="px-[32px] py-[13px] text-[15px]"
        >
          {submitting
            ? paymentMethod === 'ONLINE'
              ? 'Processing Payment...'
              : 'Confirming Appointment...'
            : paymentMethod === 'ONLINE'
            ? 'Confirm & Pay Online'
            : 'Confirm & Pay at Hospital'}
        </Button>

        <div className="text-[#526176] text-[13px]">

          {selectedSlot ? (

            <span>

              Slot:{' '}

              <span className="font-semibold text-[#142033]">
                {selectedSlot}
              </span>{' '}

              on{' '}

              <span className="font-semibold text-[#142033]">
                {selectedDate}
              </span>

            </span>

          ) : (

            'Select a slot to book'

          )}

        </div>

      </div>

    </PatientLayout>
  );
}