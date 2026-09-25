import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  type ReactNode,
} from 'react';

import type { QueuePatient, ConsultationStatus } from '../types';

const API_URL = '/api';

interface SharedQueueContextValue {
  queue: QueuePatient[];

  addPatientToken: (
    token: string,
    patientName?: string
  ) => void;

  advance: () => Promise<void>;

  skip: () => Promise<void>;

  startConsultation: (id: string) => Promise<void>;

  currentServing: string;

  refreshQueue: () => Promise<void>;
}

const SharedQueueContext =
  createContext<SharedQueueContextValue | null>(null);

/* -------------------------------------------------------
   Convert backend appointment → frontend QueuePatient
------------------------------------------------------- */

function appointmentToQueuePatient(
  appointment: any
): QueuePatient {
  const statusMap: Record<string, ConsultationStatus> = {
    WAITING: 'Waiting',
    IN_PROGRESS: 'In consultation',
    COMPLETED: 'Completed',
    SKIPPED: 'Skipped',
  };

  const backendStatus =
    String(appointment.status ?? 'WAITING').toUpperCase();

  const status =
    statusMap[backendStatus] ?? 'Waiting';

  const patientName =
    appointment.patientName ||
    `Patient ${appointment.tokenNumber || appointment.id}`;

  const initials = patientName
    .split(' ')
    .map((word: string) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return {
    id: String(appointment.id),

    token: String(
      appointment.tokenNumber ??
        `A${appointment.id}`
    ),

    initials,

    name: patientName,

    age: 0,

    gender: '—',

    consultationType: 'OPD Consultation',

    appointmentTime:
      appointment.appointmentTime ?? '—',

    priority:
      String(appointment.priority ?? 'NORMAL') ===
      'EMERGENCY'
        ? 'Urgent'
        : String(appointment.priority ?? 'NORMAL') ===
          'PRIORITY'
        ? 'Priority'
        : 'Normal',

    consultationStatus: status,

    waitTime: 0,
  };
}

/* -------------------------------------------------------
   Provider
------------------------------------------------------- */

export function SharedQueueProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [queue, setQueue] = useState<QueuePatient[]>([]);

  /* -----------------------------------------------------
     Load queue from Spring Boot
  ----------------------------------------------------- */

  const refreshQueue = useCallback(async () => {
    try {
      /*
       * Backend currently needs doctorId + appointmentDate.
       *
       * Your current test doctor:
       * Dr. Priya Sharma = ID 1
       *
       * We use today's date automatically.
       */

      const today = new Date()
        .toISOString()
        .split('T')[0];

      const response = await fetch(
        `${API_URL}/appointments/queue?doctorId=1&appointmentDate=${today}`
      );

      if (!response.ok) {
        throw new Error(
          `Queue request failed: ${response.status}`
        );
      }

      const appointments = await response.json();

      const backendQueue: QueuePatient[] =
        Array.isArray(appointments)
          ? appointments.map(
              appointmentToQueuePatient
            )
          : [];

      setQueue(backendQueue);
    } catch (error) {
      console.error(
        'HospitalFlow queue loading failed:',
        error
      );
    }
  }, []);

  /* -----------------------------------------------------
     Initial queue load
  ----------------------------------------------------- */

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

  /* -----------------------------------------------------
     Refresh every 5 seconds
     
     This gives the patient screen a live queue even
     when another user changes the queue.
  ----------------------------------------------------- */

  useEffect(() => {
    const interval = window.setInterval(() => {
      refreshQueue();
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [refreshQueue]);

  /* -----------------------------------------------------
     Current serving patient
  ----------------------------------------------------- */

  const currentServing =
    queue.find(
      (patient) =>
        patient.consultationStatus ===
        'In consultation'
    )?.token ?? '—';

  /* -----------------------------------------------------
     Add patient token
     
     Backend booking already creates the appointment.
     Therefore we only refresh the backend queue here.
  ----------------------------------------------------- */

  const addPatientToken = useCallback(
    async () => {
      await refreshQueue();
    },
    [refreshQueue]
  );

  /* -----------------------------------------------------
     Advance current patient
     
     1. Find IN_PROGRESS appointment
     2. Mark it COMPLETED
     3. Refresh queue
  ----------------------------------------------------- */

  const advance = useCallback(async () => {
    try {
      const current = queue.find(
        (patient) =>
          patient.consultationStatus ===
          'In consultation'
      );

      if (!current) {
        /*
         * No current patient.
         *
         * Automatically start the first waiting patient.
         */

        const next = queue.find(
          (patient) =>
            patient.consultationStatus ===
            'Waiting'
        );

        if (!next) {
          return;
        }

        await fetch(
          `${API_URL}/appointments/${next.id}/status?status=IN_PROGRESS`,
          {
            method: 'PATCH',
          }
        );

        await refreshQueue();

        return;
      }

      /* Complete current consultation */

      await fetch(
        `${API_URL}/appointments/${current.id}/status?status=COMPLETED`,
        {
          method: 'PATCH',
        }
      );

      /*
       * Backend currently controls queue ordering.
       * After completing current patient, start the
       * next waiting patient.
       */

      await refreshQueue();

      const updatedQueue =
        await fetch(
          `${API_URL}/appointments/queue?doctorId=1&appointmentDate=${
            new Date()
              .toISOString()
              .split('T')[0]
          }`
        );

      if (updatedQueue.ok) {
        const appointments =
          await updatedQueue.json();

        const nextAppointment =
          appointments.find(
            (appointment: any) =>
              String(
                appointment.status
              ).toUpperCase() === 'WAITING'
          );

        if (nextAppointment) {
          await fetch(
            `${API_URL}/appointments/${nextAppointment.id}/status?status=IN_PROGRESS`,
            {
              method: 'PATCH',
            }
          );
        }
      }

      await refreshQueue();
    } catch (error) {
      console.error(
        'Unable to advance queue:',
        error
      );
    }
  }, [queue, refreshQueue]);

  /* -----------------------------------------------------
     Skip current patient
  ----------------------------------------------------- */

  const skip = useCallback(async () => {
    try {
      const current = queue.find(
        (patient) =>
          patient.consultationStatus ===
          'In consultation'
      );

      if (!current) {
        return;
      }

      await fetch(
        `${API_URL}/appointments/${current.id}/status?status=SKIPPED`,
        {
          method: 'PATCH',
        }
      );

      await refreshQueue();

      const updatedQueue =
        await fetch(
          `${API_URL}/appointments/queue?doctorId=1&appointmentDate=${
            new Date()
              .toISOString()
              .split('T')[0]
          }`
        );

      if (updatedQueue.ok) {
        const appointments =
          await updatedQueue.json();

        const nextAppointment =
          appointments.find(
            (appointment: any) =>
              String(
                appointment.status
              ).toUpperCase() === 'WAITING'
          );

        if (nextAppointment) {
          await fetch(
            `${API_URL}/appointments/${nextAppointment.id}/status?status=IN_PROGRESS`,
            {
              method: 'PATCH',
            }
          );
        }
      }

      await refreshQueue();
    } catch (error) {
      console.error(
        'Unable to skip patient:',
        error
      );
    }
  }, [queue, refreshQueue]);

  /* -----------------------------------------------------
     Start specific consultation
  ----------------------------------------------------- */

  const startConsultation = useCallback(
    async (id: string) => {
      try {
        await fetch(
          `${API_URL}/appointments/${id}/status?status=IN_PROGRESS`,
          {
            method: 'PATCH',
          }
        );

        await refreshQueue();
      } catch (error) {
        console.error(
          'Unable to start consultation:',
          error
        );
      }
    },
    [refreshQueue]
  );

  return (
    <SharedQueueContext.Provider
      value={{
        queue,

        addPatientToken,

        advance,

        skip,

        startConsultation,

        currentServing,

        refreshQueue,
      }}
    >
      {children}
    </SharedQueueContext.Provider>
  );
}

export function useSharedQueue(): SharedQueueContextValue {
  const ctx = useContext(
    SharedQueueContext
  );

  if (!ctx) {
    throw new Error(
      'useSharedQueue must be used inside SharedQueueProvider'
    );
  }

  return ctx;
}