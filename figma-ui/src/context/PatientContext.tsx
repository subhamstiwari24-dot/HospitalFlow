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
  patientAge: 'hospitalflow_patient_age',
  patientPhone: 'hospitalflow_patient_phone',
  reasonForVisit: 'hospitalflow_patient_reason',
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
  patientAge: number | null;
  patientPhone: string;
  reasonForVisit: string;

  setPatientIdentity: (name: string, phone: string) => void;
  setPatientAge: (age: number | null) => void;
  setReasonForVisit: (reason: string) => void;

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
 * "Sun, 27 Sep 2026"
 *
 * to:
 *
 * "2026-09-27"
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
   * These values are initialized directly from localStorage.
   *
   * This means when user refreshes the patient flow,
   * patient information remains available.
   */

  const [patientName, setPatientName] =
    useState<string>(() =>
      readStorage(
        STORAGE_KEYS.patientName,
        ''
      )
    );

  const [patientAge, setPatientAgeState] =
    useState<number | null>(() =>
      readStorage<number | null>(
        STORAGE_KEYS.patientAge,
        null
      )
    );

  const [patientPhone, setPatientPhone] =
    useState<string>(() =>
      readStorage(
        STORAGE_KEYS.patientPhone,
        ''
      )
    );

  const [reasonForVisit, setReasonForVisitState] =
    useState<string>(() =>
      readStorage(
        STORAGE_KEYS.reasonForVisit,
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

        removeStorage(
          STORAGE_KEYS.selectedSlot
        );
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
     PATIENT AGE
     ============================================================ */

  const updatePatientAge = useCallback(
    (age: number | null) => {
      setPatientAgeState(age);

      if (age === null) {
        removeStorage(
          STORAGE_KEYS.patientAge
        );
        return;
      }

      writeStorage(
        STORAGE_KEYS.patientAge,
        age
      );
    },
    []
  );

  /* ============================================================
     REASON FOR VISIT
     ============================================================ */

  const updateReasonForVisit = useCallback(
    (reason: string) => {
      setReasonForVisitState(reason);

      writeStorage(
        STORAGE_KEYS.reasonForVisit,
        reason
      );
    },
    []
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
      setSelectedDepartmentId(
        departmentId
      );

      if (departmentId !== null) {
        writeStorage(
          STORAGE_KEYS.selectedDepartmentId,
          departmentId
        );
      } else {
        removeStorage(
          STORAGE_KEYS.selectedDepartmentId
        );
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
   * SharedQueueContext is the backend source of truth.
   */

  const queueTokens: TokenView[] =
    shared.queue.map((patient) => ({
      token: patient.token,
      status: patient.consultationStatus,
    }));

  const currentServing =
    shared.currentServing;

  /* ============================================================
     SYNC LOGGED-IN PATIENT PROFILE
     ============================================================ */

  const fetchLatestLoggedInPatientProfile = useCallback(
    async (): Promise<{
      fullName?: string;
      age?: number | string;
      phone?: string;
    } | null> => {
      try {
        const storedPatient =
          sessionStorage.getItem('hospitalflow_patient');

        if (!storedPatient) {
          return null;
        }

        const patientSession = JSON.parse(storedPatient);

        if (!patientSession?.phone) {
          return null;
        }

        const response = await fetch(
          `${API_URL}/patients/profile/${encodeURIComponent(
            patientSession.phone
          )}`
        );

        if (!response.ok) {
          return null;
        }

        const profile = await response.json();

        /*
         * Sync latest name from backend profile.
         */
        if (
          typeof profile.fullName === 'string' &&
          profile.fullName.trim()
        ) {
          const latestName =
            profile.fullName.trim();

          setPatientName(latestName);

          writeStorage(
            STORAGE_KEYS.patientName,
            latestName
          );
        }

        /*
         * Sync latest age from backend profile.
         */
        const normalizedAge = Number(profile.age);

        if (
          Number.isInteger(normalizedAge) &&
          normalizedAge >= 1 &&
          normalizedAge <= 120
        ) {
          setPatientAgeState(normalizedAge);

          writeStorage(
            STORAGE_KEYS.patientAge,
            normalizedAge
          );
        }

        /*
         * IMPORTANT:
         * Sync the latest phone from the backend profile.
         *
         * This prevents an old phone number stored in
         * localStorage from being used during booking.
         */
        if (
          typeof profile.phone === 'string' &&
          profile.phone.trim()
        ) {
          const latestPhone =
            profile.phone.trim();

          setPatientPhone(latestPhone);

          writeStorage(
            STORAGE_KEYS.patientPhone,
            latestPhone
          );
        }

        return profile;
      } catch (error) {
        console.error(
          'Unable to sync latest patient profile:',
          error
        );

        return null;
      }
    },
    []
  );

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

      /*
       * IMPORTANT:
       * For a logged-in patient, always fetch the latest
       * profile before booking. This prevents old name,
       * age, or phone values in localStorage from being used
       * after the patient edits their profile.
       */
      const latestProfile =
        await fetchLatestLoggedInPatientProfile();

      const bookingName =
        typeof latestProfile?.fullName === 'string' &&
        latestProfile.fullName.trim()
          ? latestProfile.fullName.trim()
          : patientName;

      const profileAge =
        Number(latestProfile?.age);

      const bookingAge =
        Number.isInteger(profileAge) &&
        profileAge >= 1 &&
        profileAge <= 120
          ? profileAge
          : patientAge;

      /*
       * IMPORTANT:
       * Always prefer the latest phone returned by
       * the backend patient profile.
       *
       * Fallback to the existing patientPhone only when
       * the profile does not contain a valid phone.
       */
      const profilePhone =
        typeof latestProfile?.phone === 'string' &&
        latestProfile.phone.trim()
          ? latestProfile.phone.trim()
          : patientPhone.trim();

      if (bookingAge !== null) {
        setPatientAgeState(bookingAge);

        writeStorage(
          STORAGE_KEYS.patientAge,
          bookingAge
        );
      }

      if (!bookingName.trim()) {
        throw new Error(
          'Patient name is required.'
        );
      }

      if (
        bookingAge === null ||
        bookingAge < 1 ||
        bookingAge > 120
      ) {
        throw new Error(
          'Patient age must be between 1 and 120.'
        );
      }

      if (!profilePhone.trim()) {
        throw new Error(
          'Patient phone number is required.'
        );
      }

      if (!reasonForVisit.trim()) {
        throw new Error(
          'Reason for visit is required.'
        );
      }

      const backendDate =
        convertDateToBackendFormat(
          selectedDate
        );

      /*
       * Appointment payload sent to Spring Boot.
       *
       * This includes:
       * - latest patient name
       * - latest patient age
       * - latest patient phone
       * - reasonForVisit
       */

      const appointmentPayload = {
        patientName:
          bookingName.trim(),

        patientAge:
          bookingAge,

        patientPhone:
          profilePhone,

        reasonForVisit:
          reasonForVisit.trim(),

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

      const appointmentId =
        Number(
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
       * SharedQueueContext listens to backend/WebSocket.
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
      patientAge,
      patientPhone,
      reasonForVisit,
      currentServing,
      shared,
      fetchLatestLoggedInPatientProfile,
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
        // Patient identity
        patientName,
        patientAge,
        patientPhone,
        reasonForVisit,

        setPatientIdentity,

        setPatientAge:
          updatePatientAge,

        setReasonForVisit:
          updateReasonForVisit,

        // Booking selections
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

        // Booking
        booking,
        confirmBooking,
        cancelBooking,

        // Queue
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