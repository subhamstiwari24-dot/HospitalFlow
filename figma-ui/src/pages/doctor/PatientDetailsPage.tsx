import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import DoctorLayout from '../../components/DoctorLayout';
import { SkPatientDetails } from '../../components/Skeleton';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import PatientInitials from '../../components/PatientInitials';
import { useQueue } from '../../context/QueueContext';
import EmptyState, { EmptyIcons } from '../../components/EmptyState';

interface BackendAppointment {
  id: number;
  patientName: string;
  patientAge?: number | null;
  patientPhone?: string | null;
  appointmentDate?: string | null;
  appointmentTime?: string | null;
  reasonForVisit?: string | null;
  tokenNumber?: string | null;
  status?: string | null;
  priority?: string | null;

  doctor?: {
    id?: number;
    name?: string;
    specialization?: string;
  };

  hospital?: {
    id?: number;
    name?: string;
    address?: string;
    city?: string;
  };
}

const API_URL = '/api';

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'P';
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

function normalizeStatus(status?: string | null): string {
  return (status ?? 'WAITING').trim().toUpperCase();
}

function getStatusLabel(status?: string | null): string {
  switch (normalizeStatus(status)) {
    case 'IN_PROGRESS':
      return 'In consultation';

    case 'COMPLETED':
      return 'Completed';

    case 'SKIPPED':
      return 'Skipped';

    case 'CANCELLED':
      return 'Cancelled';

    case 'WAITING':
      return 'Waiting';

    default:
      return 'Scheduled';
  }
}

export default function PatientDetailsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    queue,
    startConsultation,
    selectPatient,
  } = useQueue();

  /*
   * Supports both:
   *
   * /doctor/patients?id=25
   *
   * and
   *
   * /doctor/patients?appointmentId=25
   */
  const appointmentId =
    searchParams.get('appointmentId') ??
    searchParams.get('id');

  const [appointment, setAppointment] =
    useState<BackendAppointment | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  /* ============================================================
     LOAD REAL APPOINTMENT
     ============================================================ */

  useEffect(() => {
    let cancelled = false;

    const loadAppointment = async () => {
      if (!appointmentId) {
        setError('No appointment was selected.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_URL}/appointments/${encodeURIComponent(
            appointmentId
          )}`
        );

        if (!response.ok) {
          throw new Error(
            `Unable to load appointment (${response.status})`
          );
        }

        const data: BackendAppointment =
          await response.json();

        if (!cancelled) {
          setAppointment(data);
        }
      } catch (err) {
        console.error(
          'Unable to load patient appointment:',
          err
        );

        if (!cancelled) {
          setError(
            'Unable to load patient details from the server.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAppointment();

    return () => {
      cancelled = true;
    };
  }, [appointmentId]);

  /* ============================================================
     LOADING
     ============================================================ */

  if (loading) {
    return (
      <DoctorLayout title="Patient Details">
        <SkPatientDetails />
      </DoctorLayout>
    );
  }

  /* ============================================================
     ERROR
     ============================================================ */

  if (error || !appointment) {
    return (
      <DoctorLayout title="Patient Details">
        <div className="flex flex-col items-center justify-center py-[64px] gap-[12px]">
          <p className="font-bold text-[#142033] text-[18px]">
            {error || 'Patient details not found'}
          </p>

          <Button
            variant="secondary"
            onClick={() =>
              navigate('/doctor/queue')
            }
          >
            Back to Queue
          </Button>
        </div>
      </DoctorLayout>
    );
  }

  /* ============================================================
     REAL PATIENT DATA
     ============================================================ */

  const patientName =
    appointment.patientName ||
    'Unknown Patient';

  const patientAge =
    appointment.patientAge !== null &&
    appointment.patientAge !== undefined
      ? appointment.patientAge
      : 'N/A';

  const patientPhone =
    appointment.patientPhone?.trim() || '—';

  const patientToken =
    appointment.tokenNumber?.trim() ||
    `A${String(appointment.id).padStart(2, '0')}`;

  const patientInitials =
    getInitials(patientName);

  const status =
    normalizeStatus(appointment.status);

  const priority =
    appointment.priority?.trim() || 'NORMAL';

  const reasonForVisit =
    appointment.reasonForVisit?.trim() || '';

  const appointmentTime =
    appointment.appointmentTime || '—';

  const specialization =
    appointment.doctor?.specialization ||
    'OPD Consultation';

  const consultationType =
    specialization || 'OPD Consultation';

  /*
   * IMPORTANT:
   * Normal variable instead of useMemo.
   * This prevents React Hooks order errors.
   */
  const queuePatient = queue.find(
    (p) =>
      String(p.id) ===
      String(appointment.id)
  );

  const isCurrentlyActive =
    queuePatient?.consultationStatus ===
    'In consultation';

  const isWaiting =
    status === 'WAITING';

  const isCompleted =
    status === 'COMPLETED';

  const isSkipped =
    status === 'SKIPPED';

  /* ============================================================
     START CONSULTATION
     ============================================================ */

  const handleStartConsultation = () => {
    startConsultation(
      queuePatient?.id ??
        String(appointment.id)
    );

    navigate('/doctor/queue');
  };

  /* ============================================================
     OTHER WAITING PATIENTS
     ============================================================ */

  const otherPatients = queue
    .filter(
      (p) =>
        String(p.id) !==
          String(appointment.id) &&
        p.consultationStatus === 'Waiting'
    )
    .slice(0, 4);

  /* ============================================================
     UI
     ============================================================ */

  return (
    <DoctorLayout title="Patient Details">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-[8px] text-[#155ead] text-[13px] font-semibold mb-[20px] cursor-pointer hover:opacity-80 transition-opacity"
      >
        ← Back
      </button>

      <div className="flex flex-col lg:flex-row gap-[14px] lg:gap-[18px]">

        {/* ======================================================
            LEFT SIDE
            ====================================================== */}

        <div className="flex flex-col gap-[18px] flex-1 min-w-0">

          {/* ====================================================
              PATIENT HEADER
              ==================================================== */}

          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[24px]">

            <div className="flex gap-[16px] items-start flex-wrap">

              <PatientInitials
                initials={patientInitials}
                size="lg"
              />

              <div className="flex-1 min-w-0">

                <div className="flex items-center gap-[12px] mb-[6px] flex-wrap">

                  <h1 className="font-bold text-[#142033] text-[22px]">
                    {patientName}
                  </h1>

                  {priority.toUpperCase() !==
                    'NORMAL' && (
                    <StatusBadge
                      status={
                        priority.charAt(0) +
                        priority
                          .slice(1)
                          .toLowerCase()
                      }
                    />
                  )}



                  {isCurrentlyActive && (
                    <StatusBadge
                      status="In consultation"
                      showDot={false}
                    />
                  )}

                  {isCompleted && (
                    <StatusBadge
                      status="Completed"
                      showDot={false}
                    />
                  )}

                  {isSkipped && (
                    <StatusBadge
                      status="Skipped"
                      showDot={false}
                    />
                  )}

                </div>

                <p className="font-normal text-[#526176] text-[13px] mb-[4px]">
                  Age {patientAge}
                </p>

                <p className="font-normal text-[#7b899c] text-[12px]">
                  {patientPhone}
                </p>

              </div>

              {/* Token */}
              <div className="bg-[#f4f7fb] flex flex-col gap-[3px] items-center px-[16px] py-[11px] rounded-[12px] shrink-0">

                <p className="font-bold text-[#7b899c] text-[9px]">
                  TOKEN
                </p>

                <p className="font-bold text-[#142033] text-[20px]">
                  {patientToken}
                </p>

              </div>

            </div>

            {/* Buttons */}
            <div className="flex gap-[10px] mt-[20px] pt-[18px] border-t border-[#d8e1ec] flex-wrap">

              {isWaiting &&
                !isCurrentlyActive && (
                  <Button
                    variant="primary"
                    onClick={
                      handleStartConsultation
                    }
                  >
                    Start Consultation
                  </Button>
                )}

              {isCurrentlyActive && (
                <Button
                  variant="success"
                  onClick={() =>
                    navigate('/doctor/queue')
                  }
                >
                  Back to Consultation
                </Button>
              )}

              <Button variant="secondary">
                Edit Record
              </Button>

              <Button variant="ghost">
                Print Summary
              </Button>

            </div>

          </div>

          {/* ====================================================
              REASON FOR VISIT
              ==================================================== */}

          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[20px]">

            <div className="flex items-center gap-[10px] mb-[16px]">

              <div className="bg-[#2475d0] h-[20px] rounded-[2px] shrink-0 w-[4px]" />

              <p className="font-bold text-[#142033] text-[16px]">
                Reason for Visit
              </p>

            </div>

            {reasonForVisit ? (
              <div className="bg-[#f4f7fb] rounded-[12px] p-[14px]">

                <p className="font-normal text-[#526176] text-[14px] leading-[1.6]">
                  {reasonForVisit}
                </p>

              </div>
            ) : (
              <p className="font-normal text-[#7b899c] text-[13px]">
                No reason for visit provided.
              </p>
            )}

          </div>

          {/* ====================================================
              APPOINTMENT INFORMATION
              ==================================================== */}

          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[20px]">

            <div className="flex items-center gap-[10px] mb-[16px]">

              <div className="bg-[#18865b] h-[20px] rounded-[2px] shrink-0 w-[4px]" />

              <p className="font-bold text-[#142033] text-[16px]">
                Appointment Information
              </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">

              {/* Appointment ID */}
              <div className="bg-[#f4f7fb] rounded-[12px] p-[14px]">

                <p className="font-normal text-[#7b899c] text-[11px] mb-[6px]">
                  Appointment ID
                </p>

                <p className="font-bold text-[#142033] text-[16px]">
                  {appointment.id}
                </p>

              </div>

              {/* Appointment Time */}
              <div className="bg-[#f4f7fb] rounded-[12px] p-[14px]">

                <p className="font-normal text-[#7b899c] text-[11px] mb-[6px]">
                  Appointment Time
                </p>

                <p className="font-bold text-[#142033] text-[16px]">
                  {appointmentTime}
                </p>

              </div>

              {/* Specialization */}
              <div className="bg-[#f4f7fb] rounded-[12px] p-[14px]">

                <p className="font-normal text-[#7b899c] text-[11px] mb-[6px]">
                  Specialization
                </p>

                <p className="font-bold text-[#142033] text-[16px]">
                  {specialization}
                </p>

              </div>

              {/* Priority */}
              <div className="bg-[#f4f7fb] rounded-[12px] p-[14px]">

                <p className="font-normal text-[#7b899c] text-[11px] mb-[6px]">
                  Priority
                </p>

                <p className="font-bold text-[#142033] text-[16px]">
                  {priority}
                </p>

              </div>

              {/* Appointment Date */}
              <div className="bg-[#f4f7fb] rounded-[12px] p-[14px]">

                <p className="font-normal text-[#7b899c] text-[11px] mb-[6px]">
                  Appointment Date
                </p>

                <p className="font-bold text-[#142033] text-[16px]">
                  {appointment.appointmentDate ||
                    '—'}
                </p>

              </div>

              {/* Phone */}
              <div className="bg-[#f4f7fb] rounded-[12px] p-[14px]">

                <p className="font-normal text-[#7b899c] text-[11px] mb-[6px]">
                  Phone
                </p>

                <p className="font-bold text-[#142033] text-[16px]">
                  {patientPhone}
                </p>

              </div>

            </div>

          </div>

          {/* ====================================================
              MEDICAL HISTORY
              ==================================================== */}

          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[20px]">

            <div className="flex items-center gap-[10px] mb-[16px]">

              <div className="bg-[#2475d0] h-[20px] rounded-[2px] shrink-0 w-[4px]" />

              <p className="font-bold text-[#142033] text-[16px]">
                Medical History
              </p>

            </div>

            <EmptyState
              icon={EmptyIcons.file(20)}
              title="No medical history available"
              description="Previous medical history is not available in the appointment data."
              compact
            />

          </div>

        </div>

        {/* ======================================================
            RIGHT SIDEBAR
            ====================================================== */}

        <div className="w-full lg:w-[280px] lg:shrink-0 flex flex-col gap-[14px]">

          {/* Today's Appointment */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

            <p className="font-bold text-[#142033] text-[15px] mb-[14px]">
              Today's Appointment
            </p>

            <div className="flex flex-col gap-[12px]">

              {/* Time */}
              <div>

                <p className="font-semibold text-[#7b899c] text-[10px] uppercase mb-[3px]">
                  Time
                </p>

                <p className="font-semibold text-[#142033] text-[13px]">
                  {appointmentTime}
                </p>

              </div>

              {/* Type */}
              <div>

                <p className="font-semibold text-[#7b899c] text-[10px] uppercase mb-[3px]">
                  Type
                </p>

                <p className="font-semibold text-[#142033] text-[13px]">
                  {consultationType}
                </p>

              </div>

              {/* Status */}
              <div>

                <p className="font-semibold text-[#7b899c] text-[10px] uppercase mb-[3px]">
                  Status
                </p>

                <StatusBadge
                  status={
                    isCurrentlyActive
                      ? 'In consultation'
                      : getStatusLabel(
                          appointment.status
                        )
                  }
                />

              </div>

            </div>

          </div>

          {/* Hospital */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

            <p className="font-bold text-[#142033] text-[15px] mb-[14px]">
              Hospital
            </p>

            <p className="font-semibold text-[#142033] text-[13px]">
              {appointment.hospital?.name ||
                'Metro Health Hospital'}
            </p>

            {appointment.hospital?.address && (
              <p className="font-normal text-[#7b899c] text-[12px] mt-[5px]">
                {appointment.hospital.address}
              </p>
            )}

            {appointment.hospital?.city && (
              <p className="font-normal text-[#7b899c] text-[12px]">
                {appointment.hospital.city}
              </p>
            )}

          </div>

          {/* Other Waiting Patients */}
          {otherPatients.length > 0 && (
            <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

              <p className="font-bold text-[#142033] text-[15px] mb-[14px]">
                Others Waiting
              </p>

              {otherPatients.map((p) => (
                <div
                  key={p.id}
                  className="flex gap-[10px] items-center py-[8px] border-t border-[#d8e1ec] first:border-0 cursor-pointer hover:bg-[#f4f7fb] -mx-[18px] px-[18px] transition-colors rounded-[8px]"
                  onClick={() => {
                    selectPatient(p.id);
                  }}
                >

                  <PatientInitials
                    initials={p.initials}
                    size="sm"
                  />

                  <div className="flex-1 min-w-0">

                    <p className="font-semibold text-[#142033] text-[13px] truncate">
                      {p.name}
                    </p>

                    <p className="font-normal text-[#7b899c] text-[11px]">
                      {p.token} ·{' '}
                      {p.appointmentTime}
                    </p>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </DoctorLayout>
  );
}