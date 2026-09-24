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

  // Live queue view
  queueTokens: TokenView[];
  currentServing: string;
  advanceQueue: () => void;
}

const PatientContext = createContext<PatientContextValue | null>(null);

/**
 * Converts UI date:
 * "Thu, 24 Sep 2026"
 *
 * to backend date:
 * "2026-09-24"
 */
function convertDateToBackendFormat(dateString: string): string {
  const parsed = new Date(dateString);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  // Fallback for "Thu, 24 Sep 2026"
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

/**
 * Extract numeric part from token.
 *
 * Example:
 * "A03"  -> 3
 * "A-1041" -> 1041
 */
function extractTokenNumber(token: string): number {
  const match = token.match(/\d+/);

  if (!match) {
    return 0;
  }

  return Number(match[0]);
}

export function PatientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const shared = useSharedQueue();

  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');

  const [selectedHospital, setSelectedHospital] =
    useState<Hospital | null>(null);

  const [selectedDepartment, setSelectedDepartment] =
    useState<string | null>(null);

  const [selectedDoctor, setSelectedDoctor] =
    useState<SelectedDoctor | null>(null);

  const [selectedDate, setSelectedDate] =
    useState<string>('Thu, 24 Sep 2026');

  const [selectedSlot, setSelectedSlot] =
    useState<string | null>(null);

  const [booking, setBooking] =
    useState<PatientBooking | null>(null);

  const setPatientIdentity = useCallback(
    (name: string, phone: string) => {
      setPatientName(name);
      setPatientPhone(phone);
    },
    []
  );

  // Existing shared queue remains available for the UI.
  // Real backend queue integration will replace this next.
  const queueTokens: TokenView[] = shared.queue.map((p) => ({
    token: p.token,
    status: p.consultationStatus,
  }));

  const currentServing = shared.currentServing;

  /**
   * REAL BACKEND BOOKING
   *
   * Creates appointment in:
   * Spring Boot -> PostgreSQL
   */
  const confirmBooking = useCallback(async (): Promise<PatientBooking> => {
    if (!selectedHospital) {
      throw new Error('Hospital is not selected.');
    }

    if (!selectedDepartment) {
      throw new Error('Department is not selected.');
    }

    if (!selectedDoctor) {
      throw new Error('Doctor is not selected.');
    }

    if (!selectedSlot) {
      throw new Error('Time slot is not selected.');
    }

    if (!patientName.trim()) {
      throw new Error('Patient name is required.');
    }

    if (!patientPhone.trim()) {
      throw new Error('Patient phone number is required.');
    }

    const backendDate = convertDateToBackendFormat(selectedDate);

    /**
     * Spring Boot Appointment entity expects:
     * patientName
     * patientPhone
     * appointmentDate
     * appointmentTime
     * doctor
     * hospital
     *
     * doctor/hospital are connected using their database IDs.
     */
    const appointmentPayload = {
      patientName: patientName.trim(),

      patientPhone: patientPhone.trim(),

      appointmentDate: backendDate,

      appointmentTime: selectedSlot,

      doctor: {
        id: Number(selectedDoctor.id),
      },

      hospital: {
        id: Number(selectedHospital.id),
      },

      status: 'WAITING',

      priority: 'NORMAL',
    };

    console.log(
      'HospitalFlow booking request:',
      appointmentPayload
    );

    const response = await fetch(
      `${API_URL}/appointments`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(appointmentPayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        errorText ||
          `Booking failed with status ${response.status}`
      );
    }

    const createdAppointment = await response.json();

    console.log(
      'HospitalFlow booking created:',
      createdAppointment
    );

    /**
     * Backend token.
     *
     * We intentionally use the token returned by Spring Boot
     * instead of generating a fake frontend token.
     */
    const backendToken =
      createdAppointment.tokenNumber ||
      createdAppointment.token ||
      `A${createdAppointment.id}`;

    const token = String(backendToken);

    const tokenNumber =
      typeof createdAppointment.tokenNumber === 'number'
        ? createdAppointment.tokenNumber
        : extractTokenNumber(token);

    /**
     * Backend appointment response becomes
     * PatientBooking for the Figma confirmation screen.
     */
    const newBooking: PatientBooking = {
      bookingId: `BK-${createdAppointment.id}`,

      token,

      tokenNumber,

      hospitalId: String(
        createdAppointment.hospital?.id ??
          selectedHospital.id
      ),

      hospitalName:
        createdAppointment.hospital?.name ??
        selectedHospital.name,

      departmentId: selectedDepartment,

      departmentName: selectedDepartment,

      doctorId: String(
        createdAppointment.doctor?.id ??
          selectedDoctor.id
      ),

      doctorName:
        createdAppointment.doctor?.name ??
        selectedDoctor.name,

      doctorSpecialization:
        createdAppointment.doctor?.specialization ??
        selectedDoctor.specialization,

      doctorRoom:
        createdAppointment.doctor?.room ??
        selectedDoctor.room ??
        'Room not assigned',

      date: selectedDate,

      slot:
        createdAppointment.appointmentTime ??
        selectedSlot,

      bookedAt: new Date().toLocaleTimeString(
        'en-IN',
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      ),

      status: 'Confirmed',

      patientsAhead: 0,

      currentServing: currentServing || '—',

      avgWaitMinutes: 0,
    };

    setBooking(newBooking);

    return newBooking;
  }, [
    selectedHospital,
    selectedDepartment,
    selectedDoctor,
    selectedDate,
    selectedSlot,
    patientName,
    patientPhone,
    currentServing,
  ]);

  const cancelBooking = useCallback(() => {
    setBooking((currentBooking) =>
      currentBooking
        ? {
            ...currentBooking,
            status: 'Cancelled',
          }
        : null
    );
  }, []);

  const advanceQueue = useCallback(() => {
    shared.advance();
  }, [shared]);

  return (
    <PatientContext.Provider
      value={{
        patientName,
        patientPhone,

        setPatientIdentity,

        selectedHospital,
        setSelectedHospital,

        selectedDepartment,
        setSelectedDepartment,

        selectedDoctor,
        setSelectedDoctor,

        selectedDate,
        setSelectedDate,

        selectedSlot,
        setSelectedSlot,

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

export function usePatient(): PatientContextValue {
  const ctx = useContext(PatientContext);

  if (!ctx) {
    throw new Error(
      'usePatient must be used inside PatientProvider'
    );
  }

  return ctx;
}