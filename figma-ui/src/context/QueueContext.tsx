import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

import type {
  QueuePatient,
  ConsultationStatus,
} from '../types';

import { useSharedQueue } from './SharedQueueContext';

const API_URL = '/api';

interface QueueContextValue {
  queue: QueuePatient[];

  currentIndex: number;

  completedCount: number;

  selectedPatientId: string | null;

  currentPatient: QueuePatient | null;

  waitingPatients: QueuePatient[];

  callNextPatient: () => void;

  completeConsultation: () => void;

  skipPatient: () => void;

  selectPatient: (id: string) => void;

  startConsultation: (id: string) => void;
}

const QueueContext =
  createContext<QueueContextValue | null>(null);

/* -------------------------------------------------------
   Get today's local date
------------------------------------------------------- */

function getTodayDate(): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    now.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/* -------------------------------------------------------
   Backend appointment → QueuePatient
------------------------------------------------------- */

function appointmentToQueuePatient(
  appointment: any
): QueuePatient {
  const statusMap: Record<
    string,
    ConsultationStatus
  > = {
    WAITING: 'Waiting',
    IN_PROGRESS: 'In consultation',
    COMPLETED: 'Completed',
    SKIPPED: 'Skipped',
  };

  const backendStatus =
    String(
      appointment.status ?? 'WAITING'
    ).toUpperCase();

  const consultationStatus =
    statusMap[backendStatus] ?? 'Waiting';

  const patientName =
    appointment.patientName ||
    `Patient ${appointment.tokenNumber ?? appointment.id}`;

  const initials =
    patientName
      .split(' ')
      .map(
        (word: string) => word[0]
      )
      .join('')
      .slice(0, 2)
      .toUpperCase();

  let priority:
    | 'Normal'
    | 'Priority'
    | 'Urgent' = 'Normal';

  const backendPriority =
    String(
      appointment.priority ?? 'NORMAL'
    ).toUpperCase();

  if (backendPriority === 'EMERGENCY') {
    priority = 'Urgent';
  } else if (
    backendPriority === 'PRIORITY'
  ) {
    priority = 'Priority';
  }

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

    consultationType:
      'OPD Consultation',

    appointmentTime:
      appointment.appointmentTime ?? '—',

    priority,

    consultationStatus,

    waitTime: 0,
  };
}

/* -------------------------------------------------------
   Provider
------------------------------------------------------- */

export function QueueProvider({
  children,
}: {
  children: ReactNode;
}) {
  const shared = useSharedQueue();

  const [queue, setQueue] =
    useState<QueuePatient[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [selectedPatientId, setSelectedPatientId] =
    useState<string | null>(null);

  /* -----------------------------------------------------
     Load REAL backend appointments
  ----------------------------------------------------- */

  const loadQueue = useCallback(
    async () => {
      try {
        const today =
          getTodayDate();

        /*
         * We intentionally use /appointments
         * instead of the queue endpoint so that
         * Doctor Dashboard also receives:
         *
         * WAITING
         * IN_PROGRESS
         * COMPLETED
         * SKIPPED
         */

        const response =
          await fetch(
            `${API_URL}/appointments`
          );

        if (!response.ok) {
          throw new Error(
            `Failed to load appointments: ${response.status}`
          );
        }

        const appointments =
          await response.json();

        if (!Array.isArray(appointments)) {
          setQueue([]);
          return;
        }

        const doctorAppointments =
          appointments.filter(
            (appointment: any) => {
              const appointmentDate =
                String(
                  appointment.appointmentDate ??
                    ''
                );

              const doctorId =
                Number(
                  appointment.doctor?.id
                );

              /*
               * HospitalFlow currently uses
               * Dr. Priya Sharma = doctor ID 1
               */

              return (
                appointmentDate ===
                  today &&
                doctorId === 1
              );
            }
          );

        /*
         * Sort:
         *
         * 1. In consultation
         * 2. Waiting
         * 3. Completed / skipped
         *
         * Within waiting:
         * Emergency / Priority first,
         * then token/id order.
         */

        const priorityValue = (
          appointment: any
        ) => {
          const priority =
            String(
              appointment.priority ??
                'NORMAL'
            ).toUpperCase();

          if (
            priority === 'EMERGENCY'
          ) {
            return 3;
          }

          if (
            priority === 'PRIORITY'
          ) {
            return 2;
          }

          return 1;
        };

        doctorAppointments.sort(
          (
            a: any,
            b: any
          ) => {
            const statusOrder: Record<
              string,
              number
            > = {
              IN_PROGRESS: 0,
              WAITING: 1,
              COMPLETED: 2,
              SKIPPED: 3,
            };

            const aStatus =
              String(
                a.status ??
                  'WAITING'
              ).toUpperCase();

            const bStatus =
              String(
                b.status ??
                  'WAITING'
              ).toUpperCase();

            const statusDifference =
              (statusOrder[
                aStatus
              ] ?? 1) -
              (statusOrder[
                bStatus
              ] ?? 1);

            if (
              statusDifference !== 0
            ) {
              return statusDifference;
            }

            if (
              aStatus === 'WAITING' &&
              bStatus === 'WAITING'
            ) {
              const priorityDifference =
                priorityValue(b) -
                priorityValue(a);

              if (
                priorityDifference !== 0
              ) {
                return priorityDifference;
              }
            }

            return (
              Number(a.id) -
              Number(b.id)
            );
          }
        );

        const convertedQueue =
          doctorAppointments.map(
            appointmentToQueuePatient
          );

        setQueue(
          convertedQueue
        );

        /*
         * Keep current index aligned
         * with the current consultation.
         */

        const activeIndex =
          convertedQueue.findIndex(
            (patient) =>
              patient.consultationStatus ===
              'In consultation'
          );

        setCurrentIndex(
          activeIndex >= 0
            ? activeIndex
            : 0
        );
      } catch (error) {
        console.error(
          'HospitalFlow Doctor Queue error:',
          error
        );
      }
    },
    []
  );

  /* -----------------------------------------------------
     Initial load
  ----------------------------------------------------- */

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  /* -----------------------------------------------------
     Auto refresh every 5 seconds
  ----------------------------------------------------- */

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        loadQueue();
      }, 5000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [loadQueue]);

  /* -----------------------------------------------------
     Current consultation
  ----------------------------------------------------- */

  const currentPatient =
    queue.find(
      (patient) =>
        patient.consultationStatus ===
        'In consultation'
    ) ?? null;

  /* -----------------------------------------------------
     Waiting patients
  ----------------------------------------------------- */

  const waitingPatients =
    queue.filter(
      (patient) =>
        patient.consultationStatus ===
        'Waiting'
    );

  /* -----------------------------------------------------
     Completed count
  ----------------------------------------------------- */

  const completedCount =
    queue.filter(
      (patient) =>
        patient.consultationStatus ===
        'Completed'
    ).length;

  /* -----------------------------------------------------
     CALL NEXT PATIENT
  ----------------------------------------------------- */

  const callNextPatient =
    useCallback(() => {
      shared
        .advance()
        .then(() => {
          loadQueue();
        })
        .catch((error) => {
          console.error(
            'Call next patient failed:',
            error
          );
        });

      setCurrentIndex(
        (index) => index + 1
      );
    }, [
      shared,
      loadQueue,
    ]);

  /* -----------------------------------------------------
     COMPLETE CONSULTATION
  ----------------------------------------------------- */

  const completeConsultation =
    useCallback(() => {
      shared
        .advance()
        .then(() => {
          loadQueue();
        })
        .catch((error) => {
          console.error(
            'Complete consultation failed:',
            error
          );
        });

      setCurrentIndex(
        (index) => index + 1
      );
    }, [
      shared,
      loadQueue,
    ]);

  /* -----------------------------------------------------
     SKIP PATIENT
  ----------------------------------------------------- */

  const skipPatient =
    useCallback(() => {
      shared
        .skip()
        .then(() => {
          loadQueue();
        })
        .catch((error) => {
          console.error(
            'Skip patient failed:',
            error
          );
        });

      setCurrentIndex(
        (index) => index + 1
      );
    }, [
      shared,
      loadQueue,
    ]);

  /* -----------------------------------------------------
     SELECT PATIENT
  ----------------------------------------------------- */

  const selectPatient =
    useCallback(
      (id: string) => {
        setSelectedPatientId(
          id
        );
      },
      []
    );

  /* -----------------------------------------------------
     START CONSULTATION
  ----------------------------------------------------- */

  const startConsultation =
    useCallback(
      (id: string) => {
        shared
          .startConsultation(id)
          .then(() => {
            loadQueue();
          })
          .catch((error) => {
            console.error(
              'Start consultation failed:',
              error
            );
          });
      },
      [
        shared,
        loadQueue,
      ]
    );

  return (
    <QueueContext.Provider
      value={{
        queue,

        currentIndex,

        completedCount,

        selectedPatientId,

        currentPatient,

        waitingPatients,

        callNextPatient,

        completeConsultation,

        skipPatient,

        selectPatient,

        startConsultation,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

/* -------------------------------------------------------
   Hook
------------------------------------------------------- */

export function useQueue(): QueueContextValue {
  const ctx =
    useContext(
      QueueContext
    );

  if (!ctx) {
    throw new Error(
      'useQueue must be used inside QueueProvider'
    );
  }

  return ctx;
}