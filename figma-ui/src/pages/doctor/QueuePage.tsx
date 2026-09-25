import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';

import DoctorLayout from '../../components/DoctorLayout';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDoctorQueue } from '../../components/Skeleton';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import PatientInitials from '../../components/PatientInitials';
import EmptyState, { EmptyIcons } from '../../components/EmptyState';

const API_URL = '/api';
const DOCTOR_ID = 1;

type BackendStatus =
  | 'WAITING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'SKIPPED';

type BackendPriority =
  | 'NORMAL'
  | 'PRIORITY'
  | 'EMERGENCY';

interface BackendAppointment {
  id: number;
  patientName: string;
  patientPhone?: string;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: string | number;
  status: BackendStatus;
  priority: BackendPriority;

  doctor?: {
    id: number;
    name: string;
    specialization: string;
  };

  hospital?: {
    id: number;
    name: string;
  };
}

interface QueuePatient {
  id: string;
  backendId: number;
  token: string;
  initials: string;
  name: string;
  age: number;
  gender: string;
  consultationType: string;
  appointmentTime: string;
  priority: 'Normal' | 'Priority' | 'Urgent';
  backendPriority: BackendPriority;
  status: BackendStatus;
}

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatToken(token: string | number) {
  const value = String(token);

  if (/^[A-Za-z]+-?\d+$/.test(value)) {
    return value.replace('-', '');
  }

  if (/^\d+$/.test(value)) {
    return `A${value.padStart(2, '0')}`;
  }

  return value;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function mapPriority(
  priority: BackendPriority
): 'Normal' | 'Priority' | 'Urgent' {
  if (priority === 'EMERGENCY') {
    return 'Urgent';
  }

  if (priority === 'PRIORITY') {
    return 'Priority';
  }

  return 'Normal';
}

function priorityRank(priority: BackendPriority) {
  if (priority === 'EMERGENCY') {
    return 3;
  }

  if (priority === 'PRIORITY') {
    return 2;
  }

  return 1;
}

function statusRank(status: BackendStatus) {
  if (status === 'IN_PROGRESS') {
    return 1;
  }

  if (status === 'WAITING') {
    return 2;
  }

  if (status === 'COMPLETED') {
    return 3;
  }

  return 4;
}

function mapAppointment(
  appointment: BackendAppointment
): QueuePatient {
  return {
    id: String(appointment.id),
    backendId: appointment.id,

    token: formatToken(
      appointment.tokenNumber
    ),

    initials: getInitials(
      appointment.patientName
    ),

    name: appointment.patientName,

    age: 0,

    gender: '—',

    consultationType:
      'OPD Consultation',

    appointmentTime:
      appointment.appointmentTime,

    priority:
      mapPriority(
        appointment.priority
      ),

    backendPriority:
      appointment.priority,

    status:
      appointment.status,
  };
}

export default function QueuePage() {
  const navigate = useNavigate();

  const loading = usePageLoad(700);

  const [appointments, setAppointments] =
    useState<BackendAppointment[]>([]);

  const [loadingQueue, setLoadingQueue] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const today = getTodayDate();

  /**
   * Load all appointments from backend.
   *
   * We intentionally fetch the complete appointment list
   * and filter doctor + date on the frontend.
   *
   * This is because the current Spring Boot
   * GET /api/appointments endpoint returns all appointments.
   */
  const loadQueue = useCallback(async () => {
    try {
      setError('');

      const response = await fetch(
        `${API_URL}/appointments`,
        {
          method: 'GET',
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load appointments (${response.status})`
        );
      }

      const data: BackendAppointment[] =
        await response.json();

      console.log(
        'HospitalFlow API total:',
        data.length
      );

      console.log(
        'HospitalFlow today:',
        today
      );

      const todayAppointments =
        data.filter((appointment) => {
          const appointmentDate =
            String(
              appointment.appointmentDate
            ).trim();

          const doctorId =
            Number(
              appointment.doctor?.id
            );

          return (
            appointmentDate === today &&
            doctorId === DOCTOR_ID
          );
        });

      console.log(
        'HospitalFlow Doctor Queue:',
        todayAppointments
      );

      setAppointments(
        todayAppointments
      );
    } catch (err) {
      console.error(
        'Doctor queue load failed:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load doctor queue.'
      );
    } finally {
      setLoadingQueue(false);
    }
  }, [today]);

  /**
   * Initial load + automatic refresh.
   *
   * Every 5 seconds the queue is refreshed.
   */
  useEffect(() => {
    loadQueue();

    const interval =
      window.setInterval(
        () => {
          loadQueue();
        },
        5000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [loadQueue]);

  /**
   * WebSocket connection.
   *
   * Backend broadcasts /topic/queue
   * whenever appointment status changes.
   *
   * REST polling above remains as a fallback.
   */
  useEffect(() => {
    const client = new Client({
      brokerURL:
        'ws://127.0.0.1:8080/ws',

      reconnectDelay: 5000,

      onConnect: () => {
        console.log(
          'Doctor Queue WebSocket connected'
        );

        client.subscribe(
          '/topic/queue',
          () => {
            console.log(
              'Doctor Queue update received'
            );

            loadQueue();
          }
        );
      },

      onStompError: (frame) => {
        console.error(
          'Doctor Queue WebSocket error:',
          frame
        );
      },

      onWebSocketError: (event) => {
        console.error(
          'Doctor Queue WebSocket connection error:',
          event
        );
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [loadQueue]);

  /**
   * Convert backend appointments into
   * UI queue patients and sort them.
   */
  const queue = useMemo(() => {
    return appointments
      .map(mapAppointment)
      .sort((a, b) => {
        /**
         * Current consultation first.
         */
        const statusDifference =
          statusRank(a.status) -
          statusRank(b.status);

        if (
          statusDifference !== 0
        ) {
          return statusDifference;
        }

        /**
         * Within waiting patients:
         *
         * Emergency
         * Priority
         * Normal
         */
        const priorityDifference =
          priorityRank(
            b.backendPriority
          ) -
          priorityRank(
            a.backendPriority
          );

        if (
          priorityDifference !== 0
        ) {
          return priorityDifference;
        }

        /**
         * Older appointment ID first.
         */
        return (
          a.backendId -
          b.backendId
        );
      });
  }, [appointments]);

  const currentPatient =
    queue.find(
      (patient) =>
        patient.status ===
        'IN_PROGRESS'
    ) ?? null;

  const waitingPatients =
    queue.filter(
      (patient) =>
        patient.status ===
        'WAITING'
    );

  const completedPatients =
    queue.filter(
      (patient) =>
        patient.status ===
        'COMPLETED'
    );

  const skippedPatients =
    queue.filter(
      (patient) =>
        patient.status ===
        'SKIPPED'
    );

  /**
   * Update appointment status.
   */
  const updateStatus = async (
    appointmentId: number,
    status: BackendStatus
  ) => {
    try {
      setActionLoading(true);
      setError('');

      const response =
        await fetch(
          `${API_URL}/appointments/${appointmentId}/status?status=${status}`,
          {
            method: 'PATCH',
          }
        );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            `Unable to update status (${response.status})`
        );
      }

      await loadQueue();
    } catch (err) {
      console.error(
        'Appointment status update failed:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update appointment status.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Call next waiting patient.
   */
  const callNextPatient =
    async () => {
      if (
        currentPatient ||
        waitingPatients.length ===
          0
      ) {
        return;
      }

      const nextPatient =
        waitingPatients[0];

      await updateStatus(
        nextPatient.backendId,
        'IN_PROGRESS'
      );
    };

  /**
   * Complete current consultation.
   */
  const completeConsultation =
    async () => {
      if (!currentPatient) {
        return;
      }

      await updateStatus(
        currentPatient.backendId,
        'COMPLETED'
      );
    };

  /**
   * Skip current consultation.
   */
  const skipPatient = async () => {
    if (!currentPatient) {
      return;
    }

    await updateStatus(
      currentPatient.backendId,
      'SKIPPED'
    );
  };

  /**
   * Open patient details.
   */
  const handlePatientClick = (
    id: string
  ) => {
    navigate(
      `/doctor/patients?appointmentId=${id}`
    );
  };

  /**
   * Temporary queue estimate.
   *
   * AI waiting-time integration can be
   * connected here later.
   */
  const avgWaitTime =
    waitingPatients.length > 0
      ? waitingPatients.length * 10
      : 18;

  if (loading) {
    return (
      <DoctorLayout title="Queue">
        <SkDoctorQueue />
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout title="Queue">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-[24px]">

        <div>
          <h1 className="font-bold text-[#142033] text-[24px] leading-tight">
            Doctor Queue
          </h1>

          <p className="font-normal text-[#526176] text-[14px] mt-[4px]">
            Manage your patient queue for today
          </p>
        </div>

        <button
          onClick={
            callNextPatient
          }
          disabled={
            currentPatient !== null ||
            waitingPatients.length ===
              0 ||
            actionLoading
          }
          className="bg-[#155ead] flex gap-[8px] items-center px-[16px] py-[10px] rounded-[10px] cursor-pointer hover:bg-[#1250a0] transition-colors border border-[#155ead] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-white text-[16px]">
            📢
          </span>

          <p className="font-bold text-[13px] text-white leading-none">
            {actionLoading
              ? 'Updating...'
              : 'Call Next Patient'}
          </p>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-[18px] bg-red-50 border border-red-200 text-red-700 rounded-[10px] px-[16px] py-[12px] text-[13px]">
          {error}
        </div>
      )}

      {/* Loading */}
      {loadingQueue && (
        <div className="mb-[18px] bg-blue-50 border border-blue-200 text-blue-700 rounded-[10px] px-[16px] py-[12px] text-[13px]">
          Loading today's OPD queue...
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-[14px] lg:gap-[18px]">

        {/* LEFT */}
        <div className="flex-1 min-w-0 flex flex-col gap-[18px]">

          {/* Current Patient */}
          {currentPatient ? (
            <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

              <div className="border-[#d8e1ec] border-b flex items-center justify-between px-[20px] py-[15px]">

                <div className="flex gap-[10px] items-center">

                  <div className="bg-[#18865b] h-[20px] rounded-[2px] shrink-0 w-[4px]" />

                  <p className="font-bold text-[#142033] text-[16px]">
                    Current Patient
                  </p>

                </div>

                <StatusBadge
                  status="In consultation"
                  showDot={false}
                />
              </div>

              <div className="flex gap-[18px] items-center p-[20px]">

                <PatientInitials
                  initials={
                    currentPatient.initials
                  }
                  size="lg"
                />

                <div className="flex flex-col gap-[5px] flex-1">

                  <p className="font-bold text-[#142033] text-[18px]">
                    {currentPatient.name}
                  </p>

                  <p className="font-normal text-[#526176] text-[12px]">
                    Age {currentPatient.age} ·{' '}
                    {currentPatient.gender} ·{' '}
                    {currentPatient.consultationType}
                  </p>

                  <p className="font-semibold text-[#155ead] text-[12px]">
                    Appointment{' '}
                    {
                      currentPatient.appointmentTime
                    }
                  </p>

                </div>

                <div className="bg-[#f4f7fb] flex flex-col gap-[3px] items-center px-[16px] py-[11px] rounded-[12px] shrink-0">

                  <p className="font-bold text-[#7b899c] text-[9px]">
                    TOKEN
                  </p>

                  <p className="font-bold text-[#142033] text-[20px]">
                    {
                      currentPatient.token
                    }
                  </p>

                </div>

              </div>

              <div className="flex flex-wrap gap-[10px] items-center pb-[18px] px-[20px]">

                <Button
                  variant="secondary"
                  onClick={() =>
                    handlePatientClick(
                      currentPatient.id
                    )
                  }
                >
                  Patient Details
                </Button>

                <Button
                  variant="success"
                  onClick={
                    completeConsultation
                  }
                >
                  Complete Consultation
                </Button>

                <Button
                  variant="danger"
                  onClick={
                    skipPatient
                  }
                >
                  Skip Patient
                </Button>

              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[32px] flex flex-col items-center gap-[8px]">

              <p className="font-bold text-[#142033] text-[16px]">
                No Active Consultation
              </p>

              <p className="font-normal text-[#7b899c] text-[13px]">
                {waitingPatients.length >
                0
                  ? 'Press "Call Next Patient" to begin.'
                  : 'All patients have been seen today.'}
              </p>

            </div>
          )}

          {/* Waiting Queue */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

            <div className="px-[20px] py-[16px] border-b border-[#d8e1ec]">

              <p className="font-bold text-[#142033] text-[16px]">
                Waiting Queue
              </p>

              <p className="font-normal text-[#7b899c] text-[11px] mt-[2px]">
                {
                  waitingPatients.length
                }{' '}
                patients waiting · Avg. wait{' '}
                {avgWaitTime} min
              </p>

            </div>

            {waitingPatients.length ===
            0 ? (
              <EmptyState
                icon={EmptyIcons.queue(
                  28
                )}
                title="Queue is clear"
                description="All patients have been seen. Waiting for new arrivals."
              />
            ) : (
              waitingPatients.map(
                (
                  patient,
                  index
                ) => (
                  <div
                    key={
                      patient.id
                    }
                    className="border-t border-[#d8e1ec] flex gap-[14px] items-center px-[20px] py-[13px] cursor-pointer hover:bg-[#f4f7fb] transition-colors"
                    onClick={() =>
                      handlePatientClick(
                        patient.id
                      )
                    }
                  >

                    <div
                      className={`flex flex-col h-[32px] items-center justify-center rounded-[8px] shrink-0 w-[54px] ${
                        index ===
                        0
                          ? 'bg-[#fff4de]'
                          : 'bg-[#eaf3fd]'
                      }`}
                    >

                      <p
                        className={`font-bold text-[12px] ${
                          index ===
                          0
                            ? 'text-[#a86508]'
                            : 'text-[#155ead]'
                        }`}
                      >
                        {
                          patient.token
                        }
                      </p>

                    </div>

                    <div className="flex flex-col gap-[3px] flex-1 min-w-0">

                      <p className="font-normal text-[#142033] text-[14px]">
                        {
                          patient.name
                        }
                      </p>

                      <p className="font-normal text-[#7b899c] text-[11px]">
                        Age{' '}
                        {
                          patient.age
                        }{' '}
                        ·{' '}
                        {
                          patient.consultationType
                        }
                      </p>

                    </div>

                    <div className="flex items-center gap-[12px]">

                      {patient.priority ===
                        'Priority' && (
                        <StatusBadge
                          status="Priority"
                        />
                      )}

                      {patient.priority ===
                        'Urgent' && (
                        <StatusBadge
                          status="Urgent"
                        />
                      )}

                      <p className="font-semibold text-[#526176] text-[12px] whitespace-nowrap">
                        {
                          patient.appointmentTime
                        }
                      </p>

                    </div>

                  </div>
                )
              )
            )}

          </div>

          {/* Skipped */}
          {skippedPatients.length >
            0 && (
            <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

              <div className="border-t border-[#d8e1ec] px-[20px] py-[10px] bg-[#f4f7fb]">

                <p className="font-semibold text-[#7b899c] text-[11px] uppercase">
                  Skipped
                </p>

              </div>

              {skippedPatients.map(
                (patient) => (
                  <div
                    key={
                      patient.id
                    }
                    className="border-t border-[#d8e1ec] flex gap-[14px] items-center px-[20px] py-[13px] opacity-60 cursor-pointer hover:bg-[#f4f7fb] transition-colors"
                    onClick={() =>
                      handlePatientClick(
                        patient.id
                      )
                    }
                  >

                    <div className="flex flex-col h-[32px] items-center justify-center rounded-[8px] shrink-0 w-[54px] bg-[#f4f7fb]">

                      <p className="font-bold text-[12px] text-[#7b899c]">
                        {
                          patient.token
                        }
                      </p>

                    </div>

                    <div className="flex flex-col gap-[3px] flex-1 min-w-0">

                      <p className="font-normal text-[#142033] text-[14px]">
                        {
                          patient.name
                        }
                      </p>

                      <p className="font-normal text-[#7b899c] text-[11px]">
                        Age{' '}
                        {
                          patient.age
                        }{' '}
                        ·{' '}
                        {
                          patient.consultationType
                        }
                      </p>

                    </div>

                    <StatusBadge
                      status="Skipped"
                    />

                  </div>
                )
              )}

            </div>
          )}

        </div>

        {/* RIGHT */}
        <div className="w-full lg:w-[280px] lg:shrink-0 flex flex-col gap-[14px]">

          {/* Queue Summary */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

            <p className="font-bold text-[#142033] text-[15px] mb-[14px]">
              Queue Summary
            </p>

            <div className="flex flex-col gap-[10px]">

              {[
                {
                  label:
                    'Total today',
                  value:
                    queue.length,
                  color:
                    'text-[#142033]',
                },
                {
                  label:
                    'Waiting',
                  value:
                    waitingPatients.length,
                  color:
                    'text-[#a86508]',
                },
                {
                  label:
                    'In Progress',
                  value:
                    currentPatient
                      ? 1
                      : 0,
                  color:
                    'text-[#155ead]',
                },
                {
                  label:
                    'Completed',
                  value:
                    completedPatients.length,
                  color:
                    'text-[#18865b]',
                },
                {
                  label:
                    'Skipped',
                  value:
                    skippedPatients.length,
                  color:
                    'text-[#526176]',
                },
              ].map(
                (row) => (
                  <div
                    key={
                      row.label
                    }
                    className="flex items-center justify-between py-[4px] border-b border-[#f4f7fb] last:border-0"
                  >

                    <p className="font-normal text-[#526176] text-[13px]">
                      {
                        row.label
                      }
                    </p>

                    <p
                      className={`font-bold text-[14px] ${row.color}`}
                    >
                      {
                        row.value
                      }
                    </p>

                  </div>
                )
              )}

            </div>
          </div>

          {/* Priority Patients */}
          {queue.filter(
            (patient) =>
              (
                patient.priority ===
                  'Priority' ||
                patient.priority ===
                  'Urgent'
              ) &&
              patient.status ===
                'WAITING'
          ).length > 0 && (
            <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

              <p className="font-bold text-[#142033] text-[15px] mb-[14px]">
                Priority Patients
              </p>

              {queue
                .filter(
                  (patient) =>
                    (
                      patient.priority ===
                        'Priority' ||
                      patient.priority ===
                        'Urgent'
                    ) &&
                    patient.status ===
                      'WAITING'
                )
                .map(
                  (patient) => (
                    <div
                      key={
                        patient.id
                      }
                      className="flex gap-[10px] items-center py-[8px] border-t border-[#d8e1ec] first:border-0 cursor-pointer hover:bg-[#f4f7fb] -mx-[18px] px-[18px] rounded-[8px] transition-colors"
                      onClick={() =>
                        handlePatientClick(
                          patient.id
                        )
                      }
                    >

                      <PatientInitials
                        initials={
                          patient.initials
                        }
                        size="sm"
                      />

                      <div className="flex-1 min-w-0">

                        <p className="font-semibold text-[#142033] text-[13px] truncate">
                          {
                            patient.name
                          }
                        </p>

                        <p className="font-normal text-[#7b899c] text-[11px]">
                          {
                            patient.token
                          }
                        </p>

                      </div>

                      <StatusBadge
                        status={
                          patient.priority ===
                          'Urgent'
                            ? 'Urgent'
                            : 'Priority'
                        }
                      />

                    </div>
                  )
                )}

            </div>
          )}

          {/* Completed */}
          {completedPatients.length >
            0 && (
            <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

              <p className="font-bold text-[#142033] text-[15px] mb-[14px]">
                Completed
              </p>

              {completedPatients.map(
                (patient) => (
                  <div
                    key={
                      patient.id
                    }
                    className="flex gap-[10px] items-center py-[8px] border-t border-[#d8e1ec] first:border-0"
                  >

                    <PatientInitials
                      initials={
                        patient.initials
                      }
                      size="sm"
                    />

                    <div className="flex-1 min-w-0">

                      <p className="font-semibold text-[#142033] text-[13px] truncate">
                        {
                          patient.name
                        }
                      </p>

                      <p className="font-normal text-[#7b899c] text-[11px]">
                        {
                          patient.token
                        }
                      </p>

                    </div>

                    <StatusBadge
                      status="Completed"
                      showDot={
                        false
                      }
                    />

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </div>
    </DoctorLayout>
  );
}