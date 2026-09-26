import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

import type {
  Hospital,
  PatientBooking,
  ConsultationStatus,
} from '../types';

import { useSharedQueue } from './SharedQueueContext';

const API_URL = '/api';

const STORAGE_KEYS = {
  booking: 'hospitalflow_patient_booking',
  patientName: 'hospitalflow_patient_name',
  patientPhone: 'hospitalflow_patient_phone',
  selectedHospital: 'hospitalflow_selected_hospital',
  selectedDepartment: 'hospitalflow_selected_department',
  selectedDepartmentId: 'hospitalflow_selected_department_id',
  selectedDoctor: 'hospitalflow_selected_doctor',
  selectedDate: 'hospitalflow_selected_date',
  selectedSlot: 'hospitalflow_selected_slot',
};

interface SelectedDoctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  status: string;
  room: string;
  experience: string;
  fee: number;
  queueLength: number;
  rating: number;
  patientsToday: number;
  nextSlot: string;
}

export interface TokenView {
  token: string;
  status: ConsultationStatus;
}

interface PatientContextValue {
  // Patient identity
  patientName: string;
  patientPhone: string;
  setPatientIdentity: (name: string, phone: string) => void;

  // Booking funnel selections
  selectedHospital: Hospital | null;
  setSelectedHospital: (h: Hospital | null) => void;

  selectedDepartment: string | null;
  setSelectedDepartment: (d: string | null) => void;
  selectedDepartmentId: number | null;
  setSelectedDepartmentId: (id: number | null) => void;
  selectedDoctor: SelectedDoctor | null;
  setSelectedDoctor: (d: SelectedDoctor | null) => void;

  selectedDate: string;
  setSelectedDate: (date: string) => void;

  selectedSlot: string | null;
  setSelectedSlot: (slot: string | null) => void;

  // Confirmed booking
  booking: PatientBooking | null;
  confirmBooking: () => Promise<PatientBooking>;
  cancelBooking: () => void;

  // Live queue
  queueTokens: TokenView[];
  currentServing: string;
  advanceQueue: () => void;
}

const PatientContext = createContext<PatientContextValue | null>(null);

/* ============================================================
   LOCAL STORAGE HELPERS
   ============================================================ */

function readStorage<T>(
  key: string,
  fallback: T
): T {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function writeStorage(
  key: string,
  value: unknown
) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch {
    console.warn(
      `Unable to save HospitalFlow data: ${key}`
    );
  }
}

function removeStorage(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}

/* ============================================================
   DATE HELPER
   ============================================================ */

/**
 * Converts UI date:
 *
 * "Thu, 24 Sep 2026"
 *
 * to:
 *
 * "2026-09-24"
 */
function convertDateToBackendFormat(
  dateString: string
): string {
  const parsed = new Date(dateString);

  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(
      parsed.getMonth() + 1
    ).padStart(2, '0');
    const day = String(
      parsed.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const parts = dateString.split(' ');

  if (parts.length >= 4) {
    const day = parts[1];
    const monthName = parts[2];
    const year = parts[3];

    const months: Record<string, string> = {
      Jan: '01',
      Feb: '02',
      Mar: '03',
      Apr: '04',
      May: '05',
      Jun: '06',
      Jul: '07',
      Aug: '08',
      Sep: '09',
      Oct: '10',
      Nov: '11',
      Dec: '12',
    };

    const month = months[monthName];

    if (month) {
      return `${year}-${month}-${day.padStart(2, '0')}`;
    }
  }

  return dateString;
}

function getTodayDisplayDate(): string {
  const now = new Date();
  const weekdays = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return `${weekdays[now.getDay()]}, ${String(
    now.getDate()
  ).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

/* ============================================================
   TOKEN HELPER
   ============================================================ */

function extractTokenNumber(
  token: string
): number {
  const match = token.match(/\d+/);

  if (!match) {
    return 0;
  }

  return Number(match[0]);
}

/* ============================================================
   PATIENT PROVIDER
   ============================================================ */

export function PatientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const shared = useSharedQueue();

  /*
   * IMPORTANT:
   *
   * These values are initialized directly from localStorage.
   *
   * This means when user refreshes:
   *
   * /patient/queue
   *
   * booking is restored immediately instead of becoming null.
   */

  const [patientName, setPatientName] =
    useState<string>(() =>
      readStorage(
        STORAGE_KEYS.patientName,
        ''
      )
    );

  const [patientPhone, setPatientPhone] =
    useState<string>(() =>
      readStorage(
        STORAGE_KEYS.patientPhone,
        ''
      )
    );

  const [selectedHospital, setSelectedHospital] =
    useState<Hospital | null>(() =>
      readStorage<Hospital | null>(
        STORAGE_KEYS.selectedHospital,
        null
      )
    );

  const [selectedDepartment, setSelectedDepartment] =
    useState<string | null>(() =>
      readStorage<string | null>(
        STORAGE_KEYS.selectedDepartment,
        null
      )
    );

  const [selectedDepartmentId, setSelectedDepartmentId] =
    useState<number | null>(() =>
      readStorage<number | null>(
        STORAGE_KEYS.selectedDepartmentId,
        null
      )
    );

  const [selectedDoctor, setSelectedDoctor] =
    useState<SelectedDoctor | null>(() =>
      readStorage<SelectedDoctor | null>(
        STORAGE_KEYS.selectedDoctor,
        null
      )
    );

  const [selectedDate, setSelectedDate] =
    useState<string>(() =>
      readStorage(
        STORAGE_KEYS.selectedDate,
        getTodayDisplayDate()
      )
    );

  const [selectedSlot, setSelectedSlot] =
    useState<string | null>(() =>
      readStorage<string | null>(
        STORAGE_KEYS.selectedSlot,
        null
      )
    );

  /*
   * THIS IS THE MAIN FIX.
   *
   * Booking is restored from localStorage
   * immediately when the page loads.
   */
  const [booking, setBooking] =
    useState<PatientBooking | null>(() =>
      readStorage<PatientBooking | null>(
        STORAGE_KEYS.booking,
        null
      )
    );

  /* ============================================================
     PATIENT IDENTITY
     ============================================================ */

  const setPatientIdentity = useCallback(
    (name: string, phone: string) => {
      const identityChanged =
        patientName !== name ||
        patientPhone !== phone;

      setPatientName(name);
      setPatientPhone(phone);

      if (identityChanged) {
        setBooking(null);
        removeStorage(STORAGE_KEYS.booking);

        const today = getTodayDisplayDate();

        setSelectedDate(today);
        writeStorage(
          STORAGE_KEYS.selectedDate,
          today
        );

        setSelectedSlot(null);
        removeStorage(STORAGE_KEYS.selectedSlot);
      }

      writeStorage(
        STORAGE_KEYS.patientName,
        name
      );

      writeStorage(
        STORAGE_KEYS.patientPhone,
        phone
      );
    },
    [patientName, patientPhone]
  );

  /* ============================================================
     PERSIST SELECTIONS
     ============================================================ */

  const updateSelectedHospital = useCallback(
    (hospital: Hospital | null) => {
      setSelectedHospital(hospital);

      if (hospital) {
        writeStorage(
          STORAGE_KEYS.selectedHospital,
          hospital
        );
      } else {
        removeStorage(
          STORAGE_KEYS.selectedHospital
        );
      }
    },
    []
  );

  const updateSelectedDepartment = useCallback(
    (department: string | null) => {
      setSelectedDepartment(department);

      if (department) {
        writeStorage(
          STORAGE_KEYS.selectedDepartment,
          department
        );
      } else {
        removeStorage(
          STORAGE_KEYS.selectedDepartment
        );
      }
    },
    []
  );

  const updateSelectedDepartmentId = useCallback(
    (departmentId: number | null) => {
      setSelectedDepartmentId(departmentId);
      if (departmentId !== null) {
        writeStorage(STORAGE_KEYS.selectedDepartmentId, departmentId);
      } else {
        removeStorage(STORAGE_KEYS.selectedDepartmentId);
      }
    },
    []
  );

  const updateSelectedDoctor = useCallback(
    (doctor: SelectedDoctor | null) => {
      setSelectedDoctor(doctor);

      if (doctor) {
        writeStorage(
          STORAGE_KEYS.selectedDoctor,
          doctor
        );
      } else {
        removeStorage(
          STORAGE_KEYS.selectedDoctor
        );
      }
    },
    []
  );

  const updateSelectedDate = useCallback(
    (date: string) => {
      setSelectedDate(date);

      writeStorage(
        STORAGE_KEYS.selectedDate,
        date
      );
    },
    []
  );

  const updateSelectedSlot = useCallback(
    (slot: string | null) => {
      setSelectedSlot(slot);

      if (slot) {
        writeStorage(
          STORAGE_KEYS.selectedSlot,
          slot
        );
      } else {
        removeStorage(
          STORAGE_KEYS.selectedSlot
        );
      }
    },
    []
  );

  /* ============================================================
     LIVE QUEUE
     ============================================================ */

  /*
   * SharedQueueContext is now the backend source of truth.
   *
   * Example:
   *
   * Backend:
   * A01 -> COMPLETED
   * A02 -> COMPLETED
   * A03 -> IN_PROGRESS
   * A04 -> WAITING
   * A05 -> WAITING
   *
   * Patient UI receives the same statuses.
   */

  const queueTokens: TokenView[] =
    shared.queue.map((patient) => ({
      token: patient.token,
      status: patient.consultationStatus,
    }));

  const currentServing =
    shared.currentServing;

  /* ============================================================
     REAL BACKEND BOOKING
     ============================================================ */

  const confirmBooking = useCallback(
    async (): Promise<PatientBooking> => {
      if (!selectedHospital) {
        throw new Error(
          'Hospital is not selected.'
        );
      }

      if (!selectedDepartment) {
        throw new Error(
          'Department is not selected.'
        );
      }

      if (!selectedDoctor) {
        throw new Error(
          'Doctor is not selected.'
        );
      }

      if (!selectedSlot) {
        throw new Error(
          'Time slot is not selected.'
        );
      }

      if (!patientName.trim()) {
        throw new Error(
          'Patient name is required.'
        );
      }

      if (!patientPhone.trim()) {
        throw new Error(
          'Patient phone number is required.'
        );
      }

      const backendDate =
        convertDateToBackendFormat(
          selectedDate
        );

      const appointmentPayload = {
        patientName:
          patientName.trim(),

        patientPhone:
          patientPhone.trim(),

        appointmentDate:
          backendDate,

        appointmentTime:
          selectedSlot,

        doctor: {
          id: Number(
            selectedDoctor.id
          ),
        },

        hospital: {
          id: Number(
            selectedHospital.id
          ),
        },

        status: 'WAITING',

        priority: 'NORMAL',
      };

      console.log(
        'HospitalFlow booking request:',
        appointmentPayload
      );

      const response =
        await fetch(
          `${API_URL}/appointments`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify(
              appointmentPayload
            ),
          }
        );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            `Booking failed with status ${response.status}`
        );
      }

      const createdAppointment =
        await response.json();

      const appointmentId = Number(
        createdAppointment.id
      );

      if (!Number.isInteger(appointmentId)) {
        throw new Error(
          'Booking response did not include a valid appointment ID.'
        );
      }

      console.log(
        'HospitalFlow booking created:',
        createdAppointment
      );

      /* ========================================================
         BACKEND TOKEN
         ======================================================== */

      const backendToken =
        createdAppointment.tokenNumber ||
        createdAppointment.token ||
        `A${createdAppointment.id}`;

      const token =
        String(backendToken);

      const tokenNumber =
        typeof createdAppointment.tokenNumber ===
        'number'
          ? createdAppointment.tokenNumber
          : extractTokenNumber(token);

      /* ========================================================
         CREATE PATIENT BOOKING OBJECT
         ======================================================== */

      const newBooking:
        PatientBooking = {
        bookingId:
          `BK-${appointmentId}`,

        appointmentId,

        token,

        tokenNumber,

        hospitalId:
          String(
            createdAppointment
              .hospital?.id ??
              selectedHospital.id
          ),

        hospitalName:
          createdAppointment
            .hospital?.name ??
          selectedHospital.name,

        departmentId:
          selectedDepartment,

        departmentName:
          selectedDepartment,

        doctorId:
          String(
            createdAppointment
              .doctor?.id ??
              selectedDoctor.id
          ),

        doctorName:
          createdAppointment
            .doctor?.name ??
          selectedDoctor.name,

        doctorSpecialization:
          createdAppointment
            .doctor?.specialization ??
          selectedDoctor.specialization,

        doctorRoom:
          createdAppointment
            .doctor?.room ??
          selectedDoctor.room ??
          'Room not assigned',

        date:
          selectedDate,

        slot:
          createdAppointment
            .appointmentTime ??
          selectedSlot,

        bookedAt:
          new Date().toLocaleTimeString(
            'en-IN',
            {
              hour: '2-digit',
              minute: '2-digit',
            }
          ),

        status: 'Confirmed',

        patientsAhead: 0,

        currentServing:
          currentServing || '—',

        avgWaitMinutes: 0,
      };

      /* ========================================================
         SAVE BOOKING TO REACT + LOCAL STORAGE
         ======================================================== */

      setBooking(newBooking);

      writeStorage(
        STORAGE_KEYS.booking,
        newBooking
      );

      /*
       * SharedQueueContext already listens to
       * backend/WebSocket.
       *
       * Force a refresh so newly created
       * appointment appears immediately.
       */
      await shared.refreshQueue();

      return newBooking;
    },
    [
      selectedHospital,
      selectedDepartment,
      selectedDoctor,
      selectedDate,
      selectedSlot,
      patientName,
      patientPhone,
      currentServing,
      shared,
    ]
  );

  /* ============================================================
     CANCEL BOOKING
     ============================================================ */

  const cancelBooking =
    useCallback(() => {
      setBooking(
        (currentBooking) => {
          if (!currentBooking) {
            return null;
          }

          const cancelledBooking = {
            ...currentBooking,
            status: 'Cancelled' as const,
          };

          writeStorage(
            STORAGE_KEYS.booking,
            cancelledBooking
          );

          return cancelledBooking;
        }
      );
    }, []);

  /* ============================================================
     DOCTOR / PATIENT QUEUE ACTION
     ============================================================ */

  const advanceQueue =
    useCallback(() => {
      shared.advance();
    }, [shared]);

  /* ============================================================
     PROVIDER
     ============================================================ */

  return (
    <PatientContext.Provider
      value={{
        patientName,
        patientPhone,

        setPatientIdentity,

        selectedHospital,
        setSelectedHospital:
          updateSelectedHospital,

        selectedDepartment,
        setSelectedDepartment:
          updateSelectedDepartment,

        selectedDepartmentId,
        setSelectedDepartmentId:
          updateSelectedDepartmentId,

        selectedDoctor,
        setSelectedDoctor:
          updateSelectedDoctor,

        selectedDate,
        setSelectedDate:
          updateSelectedDate,

        selectedSlot,
        setSelectedSlot:
          updateSelectedSlot,

        booking,
        confirmBooking,
        cancelBooking,

        queueTokens,
        currentServing,
        advanceQueue,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

/* ==============================================================
   HOOK
   ============================================================== */

export function usePatient():
  PatientContextValue {
  const ctx =
    useContext(PatientContext);

  if (!ctx) {
    throw new Error(
      'usePatient must be used inside PatientProvider'
    );
  }

  return ctx;
}