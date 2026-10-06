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
   RAZORPAY TYPES
========================================================= */

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

  handler: (
    response: RazorpayPaymentResponse
  ) => void | Promise<void>;

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

  on: (
    event: string,
    handler: (response: unknown) => void
  ) => void;
};

type BackendPayment = {
  id: number;
  amount: number;
  currency: string;
  paymentStatus: string;
  razorpayOrderId: string;
};

declare global {
  interface Window {
    Razorpay: new (
      options: RazorpayCheckoutOptions
    ) => RazorpayCheckout;
  }
}

/* =========================================================
   RAZORPAY SCRIPT
========================================================= */

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener(
        'load',
        () => resolve(true),
        { once: true }
      );

      existingScript.addEventListener(
        'error',
        () => resolve(false),
        { once: true }
      );

      return;
    }

    const script = document.createElement('script');

    script.src =
      'https://checkout.razorpay.com/v1/checkout.js';

    script.async = true;

    script.onload = () => resolve(true);

    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

/* =========================================================
   BACKEND TYPES
========================================================= */

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

/* =========================================================
   DATES
========================================================= */

const getAvailableDates = (): string[] => {
  const dates: string[] = [];

  const today = new Date();

  for (let i = 0; i < 5; i++) {
    const date = new Date(today);

    date.setDate(today.getDate() + i);

    const formattedDate =
      date.toLocaleDateString('en-GB', {
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

/* =========================================================
   COMPONENT
========================================================= */

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

  /* =======================================================
     STATE
  ======================================================= */

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState('');

  /*
   * ONLINE
   * PAY_AT_HOSPITAL
   */
  const [paymentMethod, setPaymentMethod] =
    useState<
      'ONLINE' | 'PAY_AT_HOSPITAL'
    >('ONLINE');

  /* Real backend slots */
  const [opdSlots, setOpdSlots] =
    useState<BackendSlot[]>([]);

  const [slotsLoading, setSlotsLoading] =
    useState(false);

  /* Current time for Live indicator */
  const [currentTime, setCurrentTime] =
    useState(new Date());

  /* Queue */
  const [patientsToday, setPatientsToday] =
    useState(0);

  const [currentlyWaiting, setCurrentlyWaiting] =
    useState(0);

  const [queueLoading, setQueueLoading] =
    useState(false);

  const [queueError, setQueueError] =
    useState('');

  /* =======================================================
     LIVE CLOCK
  ======================================================= */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  /* =======================================================
     SAFETY REDIRECT
  ======================================================= */

  useEffect(() => {
    if (
      !selectedHospital ||
      !selectedDepartment ||
      !selectedDoctor
    ) {
      navigate('/patient/hospital', {
        replace: true,
      });
    }
  }, [
    selectedHospital,
    selectedDepartment,
    selectedDoctor,
    navigate,
  ]);

  if (
    !selectedHospital ||
    !selectedDepartment ||
    !selectedDoctor
  ) {
    return null;
  }

  /* =======================================================
     DATE PARSER
  ======================================================= */

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

    const monthMap: Record<
      string,
      number
    > = {
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

    const monthNumber =
      monthMap[month];

    if (monthNumber === undefined) {
      return null;
    }

    return new Date(
      Number(year),
      monthNumber,
      Number(day)
    );
  };

  /* =======================================================
     BACKEND DATE
  ======================================================= */

  const getBackendDate = (
    dateString: string
  ): string | null => {
    const date =
      parseSelectedDate(dateString);

    if (!date) {
      return null;
    }

    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  /* =======================================================
     LOAD REAL SLOTS
  ======================================================= */

  useEffect(() => {
    const loadSlots = async () => {
      if (
        !selectedDoctor?.id ||
        !selectedDate
      ) {
        setOpdSlots([]);
        return;
      }

      const backendDate =
        getBackendDate(selectedDate);

      if (!backendDate) {
        setOpdSlots([]);
        return;
      }

      setSlotsLoading(true);
      setError('');

      /*
       * Date change resets old slot.
       */
      setSelectedSlot('');

      try {
        const response =
          await fetch(
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
            (data as {
              slots?: unknown;
            }).slots
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

  /* =======================================================
     LOAD REAL QUEUE
  ======================================================= */

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

      const backendDate =
        getBackendDate(selectedDate);

      if (!backendDate) {
        setPatientsToday(0);
        setCurrentlyWaiting(0);

        setQueueError(
          'Unable to read the selected date.'
        );

        return;
      }

      setQueueLoading(true);
      setQueueError('');

      try {
        /*
         * ALL APPOINTMENTS
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
          (
            appointmentsData as BackendAppointment[]
          )
            .filter(
              (appointment) =>
                Number(
                  appointment.doctor?.id
                ) ===
                Number(selectedDoctor.id)
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
         * LIVE QUEUE
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

  /* =======================================================
     TODAY CHECK
  ======================================================= */

  const isSelectedDateToday =
    (): boolean => {
      const selectedDateObject =
        parseSelectedDate(
          selectedDate
        );

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

  /* =======================================================
     SLOTS
  ======================================================= */

  const visibleSlots = opdSlots;

  const nextAvailableSlot =
    visibleSlots.find(
      (slot) => slot.available
    )?.time ??
    'No slots available';

  /* =======================================================
     SELECT SLOT
  ======================================================= */

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

    if (
      !slot ||
      !slot.available
    ) {
      return;
    }

    setSelectedSlot(slotTime);
    setError('');
  };

  /* =======================================================
     DATE CHANGE
  ======================================================= */

  const handleDateChange = (
    date: string
  ) => {
    setSelectedDate(date);
    setSelectedSlot('');
    setError('');
  };

  /* =======================================================
     BOOKING + PAYMENT
  ======================================================= */

  const handleBook = async () => {
    if (
      !selectedSlot ||
      submitting
    ) {
      return;
    }

    /*
     * Final availability check
     */
    const selectedSlotData =
      opdSlots.find(
        (slot) =>
          slot.time === selectedSlot
      );

    if (
      !selectedSlotData ||
      !selectedSlotData.available
    ) {
      setSelectedSlot('');

      setError(
        'This time slot is no longer available. Please select another slot.'
      );

      return;
    }

    /*
     * Patient validation
     */
    if (
      !hasMinimumLength(
        patientName,
        2
      )
    ) {
      setError(
        'Full name must be at least 2 characters.'
      );

      return;
    }

    if (
      !isTenDigitPhone(
        patientPhone
      )
    ) {
      setError(
        'Mobile number must be exactly 10 digits.'
      );

      return;
    }

    if (
      !reasonForVisit.trim()
    ) {
      setError(
        'Please enter your reason for visit.'
      );

      return;
    }

    /*
     * Consultation fee
     */
    const amount =
      Number(selectedDoctor.fee);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError(
        'Invalid consultation fee. Please contact the hospital.'
      );

      return;
    }

    /*
     * Razorpay key required ONLY
     * for online payment.
     */
    const razorpayKeyId =
      import.meta.env
        .VITE_RAZORPAY_KEY_ID;

    if (
      paymentMethod ===
        'ONLINE' &&
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
      /* =================================================
         STEP 1
         CREATE APPOINTMENT
      ================================================= */

      console.log(
        'Creating HospitalFlow appointment...'
      );

      const booking =
        await confirmBooking();

      console.log(
        'Appointment successfully created:',
        booking
      );

      if (
        !booking?.appointmentId
      ) {
        throw new Error(
          'Appointment was created but no appointment ID was returned.'
        );
      }

      /* =================================================
         PAY AT HOSPITAL
      ================================================= */

      if (
        paymentMethod ===
        'PAY_AT_HOSPITAL'
      ) {
        sessionStorage.setItem(
          'hospitalflow_payment_method',
          'PAY_AT_HOSPITAL'
        );

        localStorage.setItem(
          'hospitalflow_payment_method',
          'PAY_AT_HOSPITAL'
        );

        navigate(
          '/patient/confirmation'
        );

        return;
      }

      /* =================================================
         ONLINE PAYMENT
      ================================================= */

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

      /* =================================================
         CREATE RAZORPAY ORDER
      ================================================= */

      const createPaymentUrl =
        `http://localhost:8080/api/payments/create?appointmentId=${encodeURIComponent(
          booking.appointmentId
        )}&amount=${encodeURIComponent(
          amount
        )}`;

      const paymentResponse =
        await fetch(
          createPaymentUrl,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },
          }
        );

      const paymentData: unknown =
        await paymentResponse.json();

      if (
        !paymentResponse.ok
      ) {
        const backendMessage =
          paymentData &&
          typeof paymentData ===
            'object' &&
          'error' in paymentData
            ? String(
                (
                  paymentData as {
                    error?: unknown;
                  }
                ).error ??
                  'Unable to create payment.'
              )
            : 'Unable to create payment.';

        throw new Error(
          backendMessage
        );
      }

      if (
        !paymentData ||
        typeof paymentData !==
          'object'
      ) {
        throw new Error(
          'Invalid payment response from server.'
        );
      }

      const payment =
        paymentData as BackendPayment;

      if (
        !payment.id ||
        !payment.razorpayOrderId
      ) {
        throw new Error(
          'Payment was created but Razorpay order information is missing.'
        );
      }

      /* =================================================
         OPEN RAZORPAY
      ================================================= */

      await new Promise<void>(
        (resolve, reject) => {
          let settled = false;

          const finishResolve =
            () => {
              if (settled) return;

              settled = true;
              resolve();
            };

          const finishReject =
            (
              message: string
            ) => {
              if (settled) return;

              settled = true;
              reject(
                new Error(message)
              );
            };

          const checkout =
            new window.Razorpay({
              key: razorpayKeyId,

              amount:
                Math.round(
                  amount * 100
                ),

              currency:
                payment.currency ||
                'INR',

              name:
                'HospitalFlow',

              description:
                `OPD Consultation - Appointment #${booking.appointmentId}`,

              order_id:
                payment.razorpayOrderId,

              prefill: {
                name: patientName,
                contact:
                  patientPhone,
              },

              theme: {
                color:
                  '#16d9e3',
              },

              handler:
                async (
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
                          method:
                            'POST',

                          headers: {
                            'Content-Type':
                              'application/json',
                          },
                        }
                      );

                    const verifyData: unknown =
                      await verifyResponse.json();

                    if (
                      !verifyResponse.ok
                    ) {
                      const verifyMessage =
                        verifyData &&
                        typeof verifyData ===
                          'object' &&
                        'error' in
                          verifyData
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
                      'Razorpay payment verified:',
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
                ondismiss:
                  () => {
                    finishReject(
                      'Payment was cancelled. Please try again or choose Pay at Hospital.'
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
        }
      );

      /*
       * Navigate ONLY after successful
       * backend verification.
       */
      navigate(
        '/patient/confirmation'
      );
    } catch (err) {
      console.error(
        'Booking/payment failed:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to complete appointment booking and payment.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="relative min-h-screen text-white">

      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#031326]">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(22,217,227,0.10),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.08),transparent_28%),linear-gradient(180deg,#031326_0%,#020d1b_100%)]" />

        <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:40px_40px]" />

      </div>

      <PatientLayout
        step={3}
        backTo="/patient/doctor"
        maxWidth="max-w-[1000px]"
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16d9e3]/10 border border-[#16d9e3]/20 text-[#8ef8ff] text-[10px] font-semibold tracking-wide mb-4">

            <span className="w-1.5 h-1.5 rounded-full bg-[#16d9e3] shadow-[0_0_10px_#16d9e3]" />

            OPD BOOKING

          </div>

          <h1 className="text-white text-[28px] sm:text-[34px] font-bold tracking-[-0.03em]">

            Book your{' '}

            <span className="bg-gradient-to-r from-white via-cyan-100 to-[#16d9e3] bg-clip-text text-transparent">
              OPD Appointment
            </span>

          </h1>

          <p className="text-slate-400 text-[13px] mt-2">
            Review your details, select a live slot and choose your payment method.
          </p>

        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="flex flex-col lg:flex-row gap-5">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="flex-1 min-w-0 space-y-5">

            {/* BOOKING SUMMARY */}

            <div className="relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#071b31]/90 backdrop-blur-xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">

              <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-cyan-400/10 blur-[70px]" />

              <div className="relative flex items-center gap-3 mb-5">

                <div className="w-9 h-9 rounded-xl bg-[#16d9e3]/10 border border-[#16d9e3]/20 flex items-center justify-center">

                  <span className="text-[#16d9e3] text-sm">
                    ✓
                  </span>

                </div>

                <div>

                  <p className="text-white font-bold text-[15px]">
                    Booking Summary
                  </p>

                  <p className="text-slate-500 text-[10px]">
                    Your selected hospital and doctor
                  </p>

                </div>

              </div>

              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">

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
                ].map(
                  (row) => (
                    <div
                      key={
                        row.label
                      }
                      className="rounded-xl border border-white/[0.06] bg-[#031326]/60 px-4 py-3"
                    >

                      <p className="text-[9px] uppercase tracking-[0.12em] text-slate-500 mb-1">
                        {row.label}
                      </p>

                      <p className="text-[12px] font-semibold text-slate-100 truncate">
                        {row.value}
                      </p>

                    </div>
                  )
                )}

                <div className="rounded-xl border border-white/[0.06] bg-[#031326]/60 px-4 py-3">

                  <p className="text-[9px] uppercase tracking-[0.12em] text-slate-500 mb-1">
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

            {/* REASON */}

            <div className="rounded-[22px] border border-white/[0.08] bg-[#071b31]/90 backdrop-blur-xl p-5 sm:p-6">

              <div className="flex items-center justify-between mb-3">

                <div>

                  <p className="text-white font-bold text-[15px]">
                    Reason for Visit
                    <span className="text-red-400 ml-1">
                      *
                    </span>
                  </p>

                  <p className="text-slate-500 text-[11px] mt-1">
                    Briefly describe why you are visiting the doctor.
                  </p>

                </div>

                <span className="text-[#16d9e3] text-[10px] font-semibold px-2 py-1 rounded-full bg-[#16d9e3]/10 border border-[#16d9e3]/15">
                  Required
                </span>

              </div>

              <textarea
                value={reasonForVisit}
                onChange={(
                  event
                ) => {
                  setReasonForVisit(
                    event.target
                      .value
                  );

                  setError('');
                }}
                disabled={
                  submitting
                }
                rows={4}
                maxLength={500}
                placeholder="Example: Fever and weakness for the last 2 days"
                className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#031326]/70 px-4 py-3 text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-[#16d9e3]/60 focus:ring-2 focus:ring-[#16d9e3]/10 transition disabled:opacity-50"
              />

              <div className="flex justify-end mt-1">

                <span className="text-[9px] text-slate-600">
                  {reasonForVisit.length}/500
                </span>

              </div>

            </div>

            {/* DATE */}

            <div className="rounded-[22px] border border-white/[0.08] bg-[#071b31]/90 backdrop-blur-xl p-5 sm:p-6">

              <div className="flex items-center justify-between mb-4">

                <div>

                  <p className="text-white font-bold text-[15px]">
                    Select Date
                  </p>

                  <p className="text-slate-500 text-[11px] mt-1">
                    Choose your preferred OPD date.
                  </p>

                </div>

                <span className="text-[#8ef8ff] text-xs">
                  📅
                </span>

              </div>

              <div className="flex gap-2 flex-wrap">

                {DATES.map(
                  (date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() =>
                        handleDateChange(
                          date
                        )
                      }
                      disabled={
                        submitting
                      }
                      className={`px-4 py-2.5 rounded-xl text-[11px] font-semibold border transition-all ${
                        selectedDate ===
                        date
                          ? 'bg-[#16d9e3] text-[#031326] border-[#16d9e3] shadow-[0_0_25px_rgba(22,217,227,0.18)]'
                          : 'bg-[#031326]/60 text-slate-400 border-white/[0.08] hover:border-[#16d9e3]/40 hover:text-[#8ef8ff]'
                      } ${
                        submitting
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                      }`}
                    >
                      {date}
                    </button>
                  )
                )}

              </div>

            </div>

            {/* TIME SLOTS */}

            <div className="rounded-[22px] border border-white/[0.08] bg-[#071b31]/90 backdrop-blur-xl p-5 sm:p-6">

              <div className="flex items-center justify-between mb-4">

                <div>

                  <p className="text-white font-bold text-[15px]">
                    Select Time Slot
                  </p>

                  <p className="text-slate-500 text-[11px] mt-1">
                    Live availability from HospitalFlow.
                  </p>

                </div>

                {isSelectedDateToday() && (
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-[#8ef8ff] bg-[#16d9e3]/10 border border-[#16d9e3]/20 px-2.5 py-1.5 rounded-full">

                    <span className="w-1.5 h-1.5 rounded-full bg-[#16d9e3] shadow-[0_0_8px_#16d9e3]" />

                    LIVE

                  </span>
                )}

              </div>

              {slotsLoading ? (

                <div className="rounded-xl border border-white/[0.07] bg-[#031326]/60 px-5 py-7 text-center">

                  <div className="w-8 h-8 mx-auto rounded-full border-2 border-white/10 border-t-[#16d9e3] animate-spin mb-3" />

                  <p className="text-slate-300 font-semibold text-[12px]">
                    Loading available slots...
                  </p>

                  <p className="text-slate-600 text-[10px] mt-1">
                    Checking live availability.
                  </p>

                </div>

              ) : visibleSlots.length === 0 ? (

                <div className="rounded-xl border border-white/[0.07] bg-[#031326]/60 px-5 py-7 text-center">

                  <div className="text-2xl mb-2">
                    🕐
                  </div>

                  <p className="text-slate-300 font-semibold text-[12px]">
                    No available time slots
                  </p>

                  <p className="text-slate-600 text-[10px] mt-1">
                    Please select another date.
                  </p>

                </div>

              ) : (

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">

                  {visibleSlots.map(
                    (slot) => {
                      const isSelected =
                        selectedSlot ===
                        slot.time;

                      return (
                        <button
                          key={
                            slot.id
                          }
                          type="button"
                          onClick={() =>
                            handleSlotSelect(
                              slot.time
                            )
                          }
                          disabled={
                            !slot.available ||
                            submitting
                          }
                          className={`rounded-xl p-3 text-center border transition-all ${
                            !slot.available
                              ? 'bg-[#020d1b] border-white/[0.03] opacity-35 cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#16d9e3] border-[#16d9e3] text-[#031326] shadow-[0_0_25px_rgba(22,217,227,0.20)]'
                              : 'bg-[#031326]/60 border-white/[0.07] hover:border-[#16d9e3]/40 hover:bg-[#16d9e3]/5 cursor-pointer'
                          }`}
                        >

                          <p
                            className={`font-bold text-[11px] ${
                              isSelected
                                ? 'text-[#031326]'
                                : slot.available
                                ? 'text-white'
                                : 'text-slate-600'
                            }`}
                          >
                            {
                              slot.time
                            }
                          </p>

                          {slot.available ? (
                            <p
                              className={`text-[9px] mt-1 ${
                                isSelected
                                  ? 'text-[#031326]/70'
                                  : 'text-slate-500'
                              }`}
                            >
                              {
                                slot.remaining
                              } left
                            </p>
                          ) : (
                            <p className="text-slate-700 text-[9px] mt-1">
                              Full
                            </p>
                          )}

                        </button>
                      );
                    }
                  )}

                </div>

              )}

              {!slotsLoading &&
                !selectedSlot &&
                visibleSlots.length >
                  0 && (
                  <p className="text-amber-400/80 text-[10px] mt-3">
                    Select a time slot to continue.
                  </p>
                )}

            </div>

          </div>

          {/* =================================================
              RIGHT
          ================================================= */}

          <div className="w-full lg:w-[270px] lg:shrink-0 space-y-4">

            {/* QUEUE */}

            <div className="rounded-[22px] border border-white/[0.08] bg-[#071b31]/90 backdrop-blur-xl p-5">

              <div className="flex items-center justify-between mb-5">

                <div>

                  <p className="text-white font-bold text-[14px]">
                    Queue Summary
                  </p>

                  <p className="text-slate-600 text-[9px] mt-1">
                    Real-time OPD status
                  </p>

                </div>

                <div className="w-9 h-9 rounded-xl bg-[#16d9e3]/10 border border-[#16d9e3]/15 flex items-center justify-center">
                  <span className="text-[#16d9e3] text-sm">
                    ≋
                  </span>
                </div>

              </div>

              {queueError && (
                <div className="rounded-lg border border-red-400/10 bg-red-400/5 px-3 py-2 mb-3">

                  <p className="text-red-300 text-[9px]">
                    {queueError}
                  </p>

                </div>
              )}

              <div className="space-y-2">

                {[
                  {
                    label:
                      'Patients today',
                    value:
                      queueLoading
                        ? '...'
                        : patientsToday,
                  },

                  {
                    label:
                      'Currently waiting',
                    value:
                      queueLoading
                        ? '...'
                        : currentlyWaiting,
                  },

                  {
                    label:
                      'Est. wait',
                    value:
                      queueLoading
                        ? '...'
                        : currentlyWaiting ===
                          0
                        ? 'No wait'
                        : `~${
                            currentlyWaiting *
                            10
                          } min`,
                  },

                  {
                    label:
                      'Next slot',
                    value:
                      nextAvailableSlot,
                  },
                ].map(
                  (row) => (
                    <div
                      key={
                        row.label
                      }
                      className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0"
                    >

                      <p className="text-slate-500 text-[10px]">
                        {row.label}
                      </p>

                      <p className="text-slate-200 font-bold text-[11px] text-right">
                        {row.value}
                      </p>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* HOW IT WORKS */}

            <div className="rounded-[20px] border border-[#16d9e3]/15 bg-[#16d9e3]/5 p-4">

              <div className="flex items-center gap-2 mb-2">

                <span className="text-[#16d9e3]">
                  ✦
                </span>

                <p className="text-[#8ef8ff] font-bold text-[11px]">
                  How it works
                </p>

              </div>

              <p className="text-slate-500 text-[10px] leading-[1.7]">
                After booking, you'll receive a real token number. Track your position in the live queue and visit when it is your turn.
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            PAYMENT METHOD
        ================================================= */}

        <div className="relative overflow-hidden mt-5 rounded-[22px] border border-white/[0.08] bg-[#071b31]/90 backdrop-blur-xl p-5 sm:p-6">

          <div className="absolute -top-20 right-0 w-52 h-52 rounded-full bg-cyan-400/5 blur-[65px]" />

          <div className="relative flex items-center justify-between gap-4 mb-5">

            <div>

              <p className="text-white font-bold text-[15px]">
                Payment Method
              </p>

              <p className="text-slate-500 text-[10px] mt-1">
                Choose how you would like to pay for your OPD consultation.
              </p>

            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">

              <span className="text-slate-500 text-[9px]">
                Consultation
              </span>

              <span className="text-[#8ef8ff] font-bold text-[11px]">
                ₹{selectedDoctor.fee}
              </span>

            </div>

          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* ONLINE */}

            <button
              type="button"
              onClick={() => {
                setPaymentMethod(
                  'ONLINE'
                );

                setError('');
              }}
              disabled={submitting}
              className={`group relative text-left rounded-[16px] p-[1px] transition-all ${
                paymentMethod ===
                'ONLINE'
                  ? 'bg-gradient-to-r from-[#16d9e3] to-blue-400'
                  : 'bg-white/[0.07]'
              } ${
                submitting
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >

              <div className={`rounded-[15px] p-4 h-full ${
                paymentMethod ===
                'ONLINE'
                  ? 'bg-[#06182b]'
                  : 'bg-[#031326]/70 group-hover:bg-[#06182b]'
              }`}>

                <div className="flex items-start justify-between gap-3">

                  <div className="flex gap-3">

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      paymentMethod ===
                      'ONLINE'
                        ? 'bg-[#16d9e3]/10 border-[#16d9e3]/25'
                        : 'bg-white/[0.03] border-white/[0.06]'
                    }`}>

                      <span className="text-lg">
                        💳
                      </span>

                    </div>

                    <div>

                      <p className="text-white font-bold text-[13px]">
                        Pay Online
                      </p>

                      <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">
                        Secure payment through Razorpay using UPI, card, net banking or wallet.
                      </p>

                    </div>

                  </div>

                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    paymentMethod ===
                    'ONLINE'
                      ? 'border-[#16d9e3] bg-[#16d9e3]'
                      : 'border-slate-700'
                  }`}>

                    {paymentMethod ===
                      'ONLINE' && (
                      <span className="w-2 h-2 rounded-full bg-[#031326]" />
                    )}

                  </span>

                </div>

                {paymentMethod ===
                  'ONLINE' && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-2 text-[9px] text-[#8ef8ff]">

                    <span>
                      ✓
                    </span>

                    Instant payment confirmation

                  </div>
                )}

              </div>

            </button>

            {/* PAY AT HOSPITAL */}

            <button
              type="button"
              onClick={() => {
                setPaymentMethod(
                  'PAY_AT_HOSPITAL'
                );

                setError('');
              }}
              disabled={submitting}
              className={`group relative text-left rounded-[16px] p-[1px] transition-all ${
                paymentMethod ===
                'PAY_AT_HOSPITAL'
                  ? 'bg-gradient-to-r from-[#16d9e3] to-emerald-400'
                  : 'bg-white/[0.07]'
              } ${
                submitting
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >

              <div className={`rounded-[15px] p-4 h-full ${
                paymentMethod ===
                'PAY_AT_HOSPITAL'
                  ? 'bg-[#06182b]'
                  : 'bg-[#031326]/70 group-hover:bg-[#06182b]'
              }`}>

                <div className="flex items-start justify-between gap-3">

                  <div className="flex gap-3">

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      paymentMethod ===
                      'PAY_AT_HOSPITAL'
                        ? 'bg-emerald-400/10 border-emerald-400/20'
                        : 'bg-white/[0.03] border-white/[0.06]'
                    }`}>

                      <span className="text-lg">
                        🏥
                      </span>

                    </div>

                    <div>

                      <p className="text-white font-bold text-[13px]">
                        Pay at Hospital
                      </p>

                      <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">
                        Reserve your appointment now and pay the consultation fee at hospital reception.
                      </p>

                    </div>

                  </div>

                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    paymentMethod ===
                    'PAY_AT_HOSPITAL'
                      ? 'border-emerald-400 bg-emerald-400'
                      : 'border-slate-700'
                  }`}>

                    {paymentMethod ===
                      'PAY_AT_HOSPITAL' && (
                      <span className="w-2 h-2 rounded-full bg-[#031326]" />
                    )}

                  </span>

                </div>

                {paymentMethod ===
                  'PAY_AT_HOSPITAL' && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-2 text-[9px] text-emerald-300">

                    <span>
                      ✓
                    </span>

                    No online payment required now

                  </div>
                )}

              </div>

            </button>

          </div>

          {/* PAY AT HOSPITAL INFO */}

          {paymentMethod ===
            'PAY_AT_HOSPITAL' && (
            <div className="relative mt-3 rounded-xl border border-amber-300/10 bg-amber-300/5 px-4 py-3">

              <div className="flex items-start gap-2.5">

                <span className="text-amber-300 text-sm">
                  ℹ
                </span>

                <p className="text-amber-100/70 text-[10px] leading-[1.7]">
                  Your appointment will be confirmed without an online payment. Please pay the consultation fee at the hospital reception during your visit.
                </p>

              </div>

            </div>
          )}

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-4">

            <div className="rounded-2xl border border-red-400/15 bg-red-400/5 p-1">

              <ErrorState
                compact
                title="Booking could not be completed"
                description={
                  error
                }
                onRetry={
                  handleBook
                }
                retryLabel="Retry booking"
              />

            </div>

          </div>
        )}

        {/* =================================================
            FINAL CTA
        ================================================= */}

        <div className="mt-5 rounded-[22px] border border-white/[0.08] bg-[#071b31]/90 backdrop-blur-xl p-4 sm:p-5">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

            <div>

              <p className="text-slate-500 text-[9px] uppercase tracking-[0.12em] mb-1">
                Selected appointment
              </p>

              {selectedSlot ? (

                <p className="text-white text-[13px] font-semibold">

                  {selectedSlot}

                  <span className="text-slate-600 mx-2">
                    •
                  </span>

                  {selectedDate}

                </p>

              ) : (

                <p className="text-slate-600 text-[12px]">
                  Select a time slot to continue
                </p>

              )}

            </div>

            <Button
              variant="primary"
              onClick={
                handleBook
              }
              disabled={
                !selectedSlot ||
                submitting ||
                slotsLoading
              }
              loading={
                submitting
              }
              className="w-full sm:w-auto min-w-[230px] justify-center px-6 py-3 text-[13px] !bg-[#16d9e3] !text-[#031326] hover:!bg-[#5deaf0] !shadow-[0_0_30px_rgba(22,217,227,0.18)]"
            >

              {submitting
                ? paymentMethod ===
                  'ONLINE'
                  ? 'Processing Payment...'
                  : 'Confirming Appointment...'
                : paymentMethod ===
                  'ONLINE'
                ? 'Confirm & Pay Online'
                : 'Confirm & Pay at Hospital'}

            </Button>

          </div>

        </div>

      </PatientLayout>

    </div>
  );
}