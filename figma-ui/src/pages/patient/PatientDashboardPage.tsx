import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartPulse,
  History,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';

interface PatientSession {
  patientId: string;
  fullName: string;
  age?: number;
  phone: string;
  email: string;
}

interface QueuePositionResponse {
  tokenNumber: string;
  position: number;
  patientsAhead: number;
  status: string;
}

interface WaitingTimeResponse {
  tokenNumber: string;
  patientsAhead: number;
  estimatedMinMinutes: number;
  estimatedMaxMinutes: number;
  message: string;
}

interface QueueAppointment {
  id: number;
  tokenNumber: string;
  status: string;
  priority?: string;
}

interface Appointment {
  id: number;
  patientName: string;
  patientPhone?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: string;
  status: string;
  priority: string;

  doctor?: {
    id?: number;
    name?: string | null;
    specialization?: string | null;
    status?: string | null;
    department?: {
      id?: number;
      name?: string | null;
    } | null;
  } | null;

  hospital?: {
    id?: number;
    name?: string | null;
    address?: string | null;
    city?: string | null;
  } | null;
}

export default function PatientDashboardPage() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] =
    useState(true);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [queuePosition, setQueuePosition] =
    useState<QueuePositionResponse | null>(null);

  const [waitingTime, setWaitingTime] =
    useState<WaitingTimeResponse | null>(null);

  const [currentToken, setCurrentToken] =
    useState<string | null>(null);

  const [loadingQueue, setLoadingQueue] =
    useState(false);

  const [queueError, setQueueError] =
    useState(false);

  const [lastQueueUpdate, setLastQueueUpdate] =
    useState<Date | null>(null);

  /*
   * ============================================================
   * PATIENT SESSION
   * ============================================================
   */

  const storedPatient =
    sessionStorage.getItem('hospitalflow_patient');

  const patient: PatientSession | null =
    storedPatient
      ? JSON.parse(storedPatient)
      : null;

  /*
   * ============================================================
   * LOAD PATIENT APPOINTMENTS
   * ============================================================
   */

  useEffect(() => {
    if (!patient) {
      setLoadingAppointments(false);
      return;
    }

    const fetchAppointments = async () => {
      try {
        setLoadingAppointments(true);

        const response = await fetch(
          `/api/appointments/patient/${encodeURIComponent(
            patient.phone
          )}`
        );

        if (!response.ok) {
          throw new Error(
            'Failed to fetch appointments'
          );
        }

        const data: Appointment[] =
          await response.json();

        setAppointments(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          'Failed to load patient appointments:',
          error
        );

        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [patient?.phone]);

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  const handleLogout = () => {
    sessionStorage.removeItem(
      'hospitalflow_patient'
    );

    navigate('/patient/login');
  };

  /*
   * ============================================================
   * LOGIN CHECK
   * ============================================================
   */

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#031326] flex items-center justify-center px-5">

        <div className="w-full max-w-[430px] rounded-[24px] p-[1px] bg-gradient-to-br from-[#16d9e3]/40 via-white/10 to-transparent">

          <div className="rounded-[23px] bg-[#071b31] border border-white/[0.07] p-8 text-center">

            <div className="w-[68px] h-[68px] rounded-[20px] bg-[#16d9e3]/10 border border-[#16d9e3]/20 flex items-center justify-center mx-auto">

              <User className="w-8 h-8 text-[#16d9e3]" />

            </div>

            <h1 className="font-bold text-white text-[24px] mt-5">
              Login Required
            </h1>

            <p className="text-slate-400 text-[13px] mt-2">
              Please login to access your HospitalFlow
              patient dashboard.
            </p>

            <button
              onClick={() =>
                navigate('/patient/login')
              }
              className="mt-6 w-full h-[46px] rounded-[12px] bg-gradient-to-r from-[#16d9e3] to-[#0ea5e9] text-[#031326] font-bold text-[13px]"
            >
              Patient Login
              <ArrowRight className="inline ml-2 w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    );
  }

  /*
   * ============================================================
   * DATE + TIME HELPERS
   * ============================================================
   *
   * IMPORTANT:
   * Appointment date/time is checked here.
   * Therefore an old WAITING appointment will NOT remain
   * inside Active OPD after its scheduled time has passed.
   *
   * ============================================================
   */

  const getAppointmentDateTime = (
    appointment: Appointment
  ) => {
    const date =
      appointment.appointmentDate?.trim();

    const time =
      appointment.appointmentTime?.trim();

    if (!date || !time) {
      return null;
    }

    /*
     * Handles:
     * 10:00
     * 10:00:00
     */

    const normalizedTime =
      time.length === 5
        ? `${time}:00`
        : time;

    const result = new Date(
      `${date}T${normalizedTime}`
    );

    if (Number.isNaN(result.getTime())) {
      return null;
    }

    return result;
  };

  const isAppointmentTimePassed = (
    appointment: Appointment
  ) => {
    const appointmentDateTime =
      getAppointmentDateTime(appointment);

    if (!appointmentDateTime) {
      return false;
    }

    return (
      appointmentDateTime.getTime() <
      Date.now()
    );
  };

  const isAppointmentUpcoming = (
    appointment: Appointment
  ) => {
    const appointmentDateTime =
      getAppointmentDateTime(appointment);

    if (!appointmentDateTime) {
      return true;
    }

    return (
      appointmentDateTime.getTime() >=
      Date.now()
    );
  };

  /*
   * ============================================================
   * ACTIVE / COMPLETED / CANCELLED
   * ============================================================
   */

  const waitingAppointments =
    appointments.filter(
      (appointment) => {
        const activeStatus =
          appointment.status === 'WAITING' ||
          appointment.status === 'IN_PROGRESS' ||
          appointment.status === 'IN_CONSULTATION';

        /*
         * MAIN FIX:
         *
         * WAITING appointment whose scheduled
         * time has already passed is NOT active.
         */

        return (
          activeStatus &&
          !isAppointmentTimePassed(
            appointment
          )
        );
      }
    );

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === 'COMPLETED'
    );

  const cancelledAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === 'CANCELLED'
    );

  const activeAppointment =
    waitingAppointments.length > 0
      ? waitingAppointments[0]
      : null;

  /*
   * ============================================================
   * LIVE QUEUE
   * ============================================================
   */

  useEffect(() => {
    if (!activeAppointment) {
      setQueuePosition(null);
      setWaitingTime(null);
      setCurrentToken(null);
      setQueueError(false);
      setLastQueueUpdate(null);
      return;
    }

    let cancelled = false;

    const fetchLiveQueue = async () => {
      try {
        setLoadingQueue(true);
        setQueueError(false);

        const [
          positionResponse,
          waitingResponse,
          queueResponse,
        ] = await Promise.all([
          fetch(
            `/api/appointments/${activeAppointment.id}/queue-position`
          ),

          fetch(
            `/api/appointments/${activeAppointment.id}/waiting-time`
          ),

          activeAppointment.doctor?.id
            ? fetch(
                `/api/appointments/queue?doctorId=${activeAppointment.doctor.id}&appointmentDate=${encodeURIComponent(
                  activeAppointment.appointmentDate
                )}`
              )
            : Promise.resolve(null),
        ]);

        if (
          !positionResponse.ok ||
          !waitingResponse.ok
        ) {
          throw new Error(
            'Failed to fetch queue information'
          );
        }

        const [
          positionData,
          waitingData,
        ] = await Promise.all([
          positionResponse.json(),
          waitingResponse.json(),
        ]);

        let liveCurrentToken: string | null =
          null;

        if (
          queueResponse &&
          queueResponse.ok
        ) {
          const queueData: QueueAppointment[] =
            await queueResponse.json();

          if (
            Array.isArray(queueData) &&
            queueData.length > 0
          ) {
            /*
             * Prefer patient currently in consultation.
             */

            const inConsultation =
              queueData.find(
                (item) =>
                  item.status ===
                    'IN_CONSULTATION' ||
                  item.status ===
                    'IN_PROGRESS'
              );

            /*
             * Otherwise show first waiting token.
             */

            const firstWaiting =
              queueData.find(
                (item) =>
                  item.status === 'WAITING'
              );

            liveCurrentToken =
              inConsultation?.tokenNumber ||
              firstWaiting?.tokenNumber ||
              queueData[0]?.tokenNumber ||
              null;
          }
        }

        if (!cancelled) {
          setQueuePosition(positionData);
          setWaitingTime(waitingData);
          setCurrentToken(liveCurrentToken);
          setLastQueueUpdate(new Date());
        }

      } catch (error) {
        console.error(
          'Failed to load live OPD queue:',
          error
        );

        if (!cancelled) {
          setQueueError(true);
        }

      } finally {
        if (!cancelled) {
          setLoadingQueue(false);
        }
      }
    };

    /*
     * Initial request.
     */

    fetchLiveQueue();

    /*
     * Refresh every 10 seconds.
     */

    const intervalId =
      window.setInterval(
        fetchLiveQueue,
        10000
      );

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };

  }, [
    activeAppointment?.id,
    activeAppointment?.doctor?.id,
    activeAppointment?.appointmentDate,
  ]);

  /*
   * ============================================================
   * UPCOMING APPOINTMENTS
   * ============================================================
   */

  const upcomingAppointments =
    appointments
      .filter(
        (appointment) =>
          appointment.status !==
            'CANCELLED' &&
          appointment.status !==
            'COMPLETED' &&
          isAppointmentUpcoming(
            appointment
          )
      )
      .sort((a, b) => {
        const first =
          `${a.appointmentDate} ${a.appointmentTime}`;

        const second =
          `${b.appointmentDate} ${b.appointmentTime}`;

        return first.localeCompare(
          second
        );
      });

  const nextAppointment =
    upcomingAppointments.length > 0
      ? upcomingAppointments[0]
      : null;

  /*
   * ============================================================
   * INITIALS
   * ============================================================
   */

  const initials =
    patient.fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0)
      )
      .join('')
      .toUpperCase();

  /*
   * ============================================================
   * NAVIGATION
   * ============================================================
   */

  const goTo = (
    path: string
  ) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  /*
   * ============================================================
   * STATUS LABEL
   * ============================================================
   */

  const getStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case 'WAITING':
        return 'WAITING';

      case 'IN_PROGRESS':
        return 'IN PROGRESS';

      case 'IN_CONSULTATION':
        return 'IN CONSULTATION';

      case 'COMPLETED':
        return 'COMPLETED';

      case 'CANCELLED':
        return 'CANCELLED';

      default:
        return status.replace(
          /_/g,
          ' '
        );
    }
  };

  /*
   * ============================================================
   * MAIN UI
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-[#031326] text-white flex">

      {/* =====================================================
          DESKTOP SIDEBAR
          ===================================================== */}

      <aside className="hidden lg:flex w-[255px] shrink-0 bg-[#06182b] border-r border-white/[0.07] min-h-screen flex-col sticky top-0 h-screen">

        {/* Logo */}

        <div className="h-[78px] px-5 flex items-center border-b border-white/[0.07]">

          <div className="w-[42px] h-[42px] rounded-[12px] bg-white/[0.07] border border-white/10 flex items-center justify-center overflow-hidden">

            <img
              src="/assets/logo.png"
              alt="HospitalFlow"
              className="w-[34px] h-auto object-contain"
            />

          </div>

          <div className="ml-3">

            <h2 className="font-bold text-white text-[17px]">
              Hospital
              <span className="text-[#16d9e3]">
                Flow
              </span>
            </h2>

            <p className="text-slate-500 text-[9px] tracking-[0.1em] uppercase">
              Smart OPD Platform
            </p>

          </div>

        </div>

        {/* Patient */}

        <div className="px-4 pt-5">

          <div className="rounded-[14px] bg-[#0a2037] px-3 py-3 flex items-center">

            <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#16d9e3] to-[#0ea5e9] text-[#031326] flex items-center justify-center font-bold text-[12px]">

              {initials || 'P'}

            </div>

            <div className="ml-2.5 min-w-0">

              <p className="font-semibold text-white text-[12px] truncate">
                {patient.fullName}
              </p>

              <p className="text-slate-500 text-[10px] mt-1">
                Patient ID: {patient.patientId}
              </p>

            </div>

          </div>

        </div>

        {/* Navigation */}

        <nav className="px-3 mt-7 flex-1">

          <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.14em] px-3 mb-2">
            Main Menu
          </p>

          <button
            onClick={() =>
              goTo('/patient/dashboard')
            }
            className="w-full flex items-center gap-3 px-3 py-3 rounded-[11px] bg-[#16d9e3]/10 border border-[#16d9e3]/10 text-[#16d9e3] font-semibold text-[12px]"
          >
            <Activity size={18} />
            Dashboard
          </button>

          <button
            onClick={() =>
              goTo('/patient/hospital')
            }
            className="group w-full flex items-center gap-3 px-3 py-3 rounded-[11px] text-slate-400 hover:bg-white/[0.04] hover:text-[#16d9e3] font-medium text-[12px] mt-1.5"
          >
            <Plus size={18} />
            Book OPD
          </button>

          <button
            onClick={() =>
              goTo('/patient/appointments')
            }
            className="group w-full flex items-center justify-between px-3 py-3 rounded-[11px] text-slate-400 hover:bg-white/[0.04] hover:text-[#16d9e3] font-medium text-[12px] mt-1.5"
          >

            <span className="flex items-center gap-3">

              <CalendarDays size={18} />

              My Appointments

            </span>

            {appointments.length > 0 && (
              <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#16d9e3]/15 text-[#16d9e3] text-[9px] font-bold flex items-center justify-center">

                {appointments.length}

              </span>
            )}

          </button>

          <button
            onClick={() =>
              goTo('/patient/history')
            }
            className="group w-full flex items-center gap-3 px-3 py-3 rounded-[11px] text-slate-400 hover:bg-white/[0.04] hover:text-[#16d9e3] font-medium text-[12px] mt-1.5"
          >
            <History size={18} />
            OPD History
          </button>

          <button
            onClick={() =>
              goTo('/patient/profile')
            }
            className="group w-full flex items-center gap-3 px-3 py-3 rounded-[11px] text-slate-400 hover:bg-white/[0.04] hover:text-[#16d9e3] font-medium text-[12px] mt-1.5"
          >
            <User size={18} />
            My Profile
          </button>

        </nav>

        {/* Active OPD */}

        <div className="px-3 pb-4">

          {activeAppointment && (

            <div className="rounded-[13px] bg-[#16d9e3]/[0.06] border border-[#16d9e3]/15 p-3 mb-3">

              <div className="flex items-center gap-2">

                <span className="relative flex w-2 h-2">

                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#16d9e3] opacity-60 animate-ping" />

                  <span className="relative inline-flex rounded-full w-2 h-2 bg-[#16d9e3]" />

                </span>

                <p className="text-[#16d9e3] font-bold text-[9px] uppercase">
                  OPD Active
                </p>

              </div>

              <p className="font-bold text-white text-[18px] mt-2">
                {activeAppointment.tokenNumber}
              </p>

              <p className="text-slate-400 text-[10px] mt-1 truncate">
                {activeAppointment.doctor?.name ||
                  'Doctor assigned'}
              </p>

            </div>

          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-[11px] text-red-300/80 hover:text-red-300 hover:bg-red-400/[0.06] font-medium text-[12px]"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>

      {/* =====================================================
          MOBILE OVERLAY
          ===================================================== */}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />
      )}

      {/* =====================================================
          MOBILE SIDEBAR
          ===================================================== */}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-[275px] bg-[#06182b] z-50 lg:hidden flex flex-col border-r border-white/[0.07] transition-transform duration-300 ${
          mobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >

        <div className="h-[78px] px-5 flex items-center justify-between border-b border-white/[0.07]">

          <div className="flex items-center">

            <img
              src="/assets/logo.png"
              alt="HospitalFlow"
              className="w-[38px] h-auto object-contain"
            />

            <div className="ml-2.5">

              <h2 className="font-bold text-white text-[16px]">
                Hospital
                <span className="text-[#16d9e3]">
                  Flow
                </span>
              </h2>

              <p className="text-slate-500 text-[9px]">
                Smart OPD Platform
              </p>

            </div>

          </div>

          <button
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-slate-400"
          >
            <X size={18} />
          </button>

        </div>

        <div className="px-4 pt-5">

          <div className="bg-[#0a2037] rounded-[14px] p-3 flex items-center">

            <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#16d9e3] to-[#0ea5e9] text-[#031326] flex items-center justify-center font-bold text-[12px]">
              {initials || 'P'}
            </div>

            <div className="ml-2.5">

              <p className="font-semibold text-white text-[12px]">
                {patient.fullName}
              </p>

              <p className="text-slate-500 text-[10px] mt-1">
                Patient
              </p>

            </div>

          </div>

        </div>

        <nav className="px-3 mt-6 flex-1">

          <button
            onClick={() =>
              goTo('/patient/dashboard')
            }
            className="w-full flex items-center gap-3 px-3 py-3 rounded-[11px] bg-[#16d9e3]/10 text-[#16d9e3] font-semibold text-[12px]"
          >
            <Activity size={18} />
            Dashboard
          </button>

          <button
            onClick={() =>
              goTo('/patient/hospital')
            }
            className="w-full flex items-center gap-3 px-3 py-3 rounded-[11px] text-slate-400 mt-1"
          >
            <Plus size={18} />
            Book OPD
          </button>

          <button
            onClick={() =>
              goTo('/patient/appointments')
            }
            className="w-full flex items-center gap-3 px-3 py-3 rounded-[11px] text-slate-400 mt-1"
          >
            <CalendarDays size={18} />
            My Appointments
          </button>

          <button
            onClick={() =>
              goTo('/patient/history')
            }
            className="w-full flex items-center gap-3 px-3 py-3 rounded-[11px] text-slate-400 mt-1"
          >
            <History size={18} />
            OPD History
          </button>

          <button
            onClick={() =>
              goTo('/patient/profile')
            }
            className="w-full flex items-center gap-3 px-3 py-3 rounded-[11px] text-slate-400 mt-1"
          >
            <User size={18} />
            My Profile
          </button>

        </nav>

        <div className="px-3 pb-5">

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-[11px] text-red-300 bg-red-400/[0.06]"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
          ===================================================== */}

      <div className="flex-1 min-w-0 bg-[#f5f8fc]">

        {/* Header */}

        <header className="h-[78px] bg-[#06182b] border-b border-white/[0.07] flex items-center">

          <div className="w-full px-5 sm:px-7 lg:px-9 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                className="lg:hidden w-9 h-9 rounded-[10px] bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-300"
              >
                <Menu size={19} />
              </button>

              <div>

                <p className="text-[#16d9e3] font-bold text-[9px] uppercase tracking-[0.13em]">
                  Patient Dashboard
                </p>

                <h1 className="font-bold text-white text-[17px] sm:text-[20px] mt-1">
                  Welcome back,{' '}
                  {patient.fullName.split(' ')[0]} 👋
                </h1>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <button className="relative w-9 h-9 rounded-[10px] bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-300">

                <Bell size={17} />

                {activeAppointment && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#16d9e3]" />
                )}

              </button>

              <div className="hidden sm:flex w-9 h-9 rounded-full bg-gradient-to-br from-[#16d9e3] to-[#0ea5e9] text-[#031326] items-center justify-center font-bold text-[11px]">
                {initials || 'P'}
              </div>

            </div>

          </div>

        </header>

        {/* =====================================================
            CONTENT
            ===================================================== */}

        <main className="px-5 sm:px-7 lg:px-9 py-7">

          <div className="max-w-[1180px] mx-auto">

            {/* Intro */}

            <div className="mb-7 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">

              <p className="text-[#526176] text-[13px]">
                Manage your appointments, digital tokens and
                OPD journey from one place.
              </p>

              <div className="flex items-center gap-2 text-[11px] text-[#718096]">

                <ShieldCheck
                  size={14}
                  className="text-[#16a6b0]"
                />

                Patient ID:

                <span className="font-bold text-[#26364a]">
                  {patient.patientId}
                </span>

              </div>

            </div>

            {/* =================================================
                STATS
                ================================================= */}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">

              {/* Total */}

              <div className="bg-white border border-[#dce4ed] rounded-[16px] p-4 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="w-9 h-9 rounded-[10px] bg-[#eaf9fb] flex items-center justify-center text-[#0d9ca8]">
                    <CalendarDays size={18} />
                  </div>

                  <span className="text-[9px] uppercase text-[#93a0b0]">
                    Total
                  </span>

                </div>

                <p className="text-[24px] font-bold text-[#142033] mt-4">
                  {loadingAppointments
                    ? '—'
                    : appointments.length}
                </p>

                <p className="text-[10px] text-[#7b899c] mt-1">
                  Appointments
                </p>

              </div>

              {/* Active */}

              <div className="bg-white border border-[#dce4ed] rounded-[16px] p-4 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="w-9 h-9 rounded-[10px] bg-[#eaf9fb] flex items-center justify-center text-[#0d9ca8]">
                    <Activity size={18} />
                  </div>

                  <span className="text-[9px] uppercase text-[#93a0b0]">
                    Live
                  </span>

                </div>

                <p className="text-[24px] font-bold text-[#142033] mt-4">
                  {loadingAppointments
                    ? '—'
                    : waitingAppointments.length}
                </p>

                <p className="text-[10px] text-[#7b899c] mt-1">
                  Active OPD
                </p>

              </div>

              {/* Completed */}

              <div className="bg-white border border-[#dce4ed] rounded-[16px] p-4 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="w-9 h-9 rounded-[10px] bg-[#edf8f3] flex items-center justify-center text-[#18865b]">
                    <CheckCircle2 size={18} />
                  </div>

                  <span className="text-[9px] uppercase text-[#93a0b0]">
                    Done
                  </span>

                </div>

                <p className="text-[24px] font-bold text-[#142033] mt-4">
                  {loadingAppointments
                    ? '—'
                    : completedAppointments.length}
                </p>

                <p className="text-[10px] text-[#7b899c] mt-1">
                  Completed Visits
                </p>

              </div>

              {/* Cancelled */}

              <div className="bg-white border border-[#dce4ed] rounded-[16px] p-4 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="w-9 h-9 rounded-[10px] bg-[#fff2f3] flex items-center justify-center text-[#c53a45]">
                    <History size={18} />
                  </div>

                  <span className="text-[9px] uppercase text-[#93a0b0]">
                    Cancelled
                  </span>

                </div>

                <p className="text-[24px] font-bold text-[#142033] mt-4">
                  {loadingAppointments
                    ? '—'
                    : cancelledAppointments.length}
                </p>

                <p className="text-[10px] text-[#7b899c] mt-1">
                  Cancelled
                </p>

              </div>

            </div>

            {/* =================================================
                ACTIVE OPD
                ================================================= */}

            {activeAppointment && (

              <div className="relative overflow-hidden rounded-[20px] p-[1px] bg-gradient-to-r from-[#16d9e3]/60 via-[#0ea5e9]/30 to-transparent mb-6">

                <div className="relative rounded-[19px] bg-[#061b30] overflow-hidden">

                  <div className="absolute right-[-120px] top-[-150px] w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[100px]" />

                  <div className="relative p-5 sm:p-6">

                    {/* Heading */}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                      <div>

                        <div className="flex items-center gap-2 mb-2">

                          <span className="relative flex w-2 h-2">

                            <span className="absolute inline-flex h-full w-full rounded-full bg-[#16d9e3] opacity-60 animate-ping" />

                            <span className="relative inline-flex rounded-full w-2 h-2 bg-[#16d9e3]" />

                          </span>

                          <span className="text-[#16d9e3] text-[10px] font-bold uppercase tracking-[0.12em]">
                            Live OPD Queue
                          </span>

                        </div>

                        <h2 className="text-white font-bold text-[20px]">
                          Your appointment is active
                        </h2>

                        <p className="text-slate-400 text-[11px] mt-1">
                          Track your token and OPD status in real time.
                        </p>

                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            '/patient/appointment'
                          )
                        }
                        className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-white/[0.06] border border-white/10 text-[#16d9e3] text-[11px] font-semibold"
                      >
                        View Details
                        <ChevronRight size={14} />
                      </button>

                    </div>

                    {/* =================================================
                        LIVE QUEUE METRICS
                        ================================================= */}

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-6">

                      {/* Your Token */}

                      <div className="rounded-[14px] bg-white/[0.045] border border-[#16d9e3]/20 p-4">

                        <p className="text-slate-500 text-[9px] uppercase tracking-wide">
                          Your Token
                        </p>

                        <p className="text-[#16d9e3] text-[28px] font-bold mt-2">
                          {activeAppointment.tokenNumber}
                        </p>

                      </div>

                      {/* Current Token */}

                      <div className="rounded-[14px] bg-white/[0.045] border border-white/[0.07] p-4">

                        <div className="flex items-center justify-between">

                          <p className="text-slate-500 text-[9px] uppercase tracking-wide">
                            Current Token
                          </p>

                          {loadingQueue && (
                            <RefreshCw
                              size={11}
                              className="text-[#16d9e3] animate-spin"
                            />
                          )}

                        </div>

                        <p className="text-white text-[28px] font-bold mt-2">
                          {currentToken || '—'}
                        </p>

                      </div>

                      {/* Patients Ahead */}

                      <div className="rounded-[14px] bg-white/[0.045] border border-white/[0.07] p-4">

                        <p className="text-slate-500 text-[9px] uppercase tracking-wide">
                          Patients Ahead
                        </p>

                        <div className="flex items-center gap-2 mt-2">

                          <Users
                            size={17}
                            className="text-[#16d9e3]"
                          />

                          <p className="text-white text-[24px] font-bold">
                            {loadingQueue
                              ? '—'
                              : queuePosition?.patientsAhead ??
                                '—'}
                          </p>

                        </div>

                      </div>

                      {/* Queue Position */}

                      <div className="rounded-[14px] bg-white/[0.045] border border-white/[0.07] p-4">

                        <p className="text-slate-500 text-[9px] uppercase tracking-wide">
                          Queue Position
                        </p>

                        <p className="text-white text-[24px] font-bold mt-2">

                          {loadingQueue
                            ? '—'
                            : queuePosition?.position
                            ? `#${queuePosition.position}`
                            : '—'}

                        </p>

                      </div>

                      {/* Estimated Wait */}

                      <div className="rounded-[14px] bg-white/[0.045] border border-white/[0.07] p-4">

                        <p className="text-slate-500 text-[9px] uppercase tracking-wide">
                          Estimated Wait
                        </p>

                        <div className="flex items-center gap-2 mt-2">

                          <Clock3
                            size={16}
                            className="text-[#16d9e3]"
                          />

                          <p className="text-white text-[14px] font-bold">

                            {loadingQueue
                              ? 'Updating...'
                              : waitingTime
                              ? waitingTime.estimatedMinMinutes ===
                                waitingTime.estimatedMaxMinutes
                                ? `${waitingTime.estimatedMinMinutes} min`
                                : `${waitingTime.estimatedMinMinutes}-${waitingTime.estimatedMaxMinutes} min`
                              : '—'}

                          </p>

                        </div>

                      </div>

                      {/* Status */}

                      <div className="rounded-[14px] bg-white/[0.045] border border-white/[0.07] p-4">

                        <p className="text-slate-500 text-[9px] uppercase tracking-wide">
                          Status
                        </p>

                        <div className="flex items-center gap-2 mt-3">

                          <span className="relative flex w-2 h-2">

                            <span className="absolute inline-flex h-full w-full rounded-full bg-[#16d9e3] opacity-60 animate-ping" />

                            <span className="relative inline-flex rounded-full w-2 h-2 bg-[#16d9e3]" />

                          </span>

                          <p className="text-[#9efaff] text-[12px] font-bold">
                            {getStatusLabel(
                              queuePosition?.status ||
                                activeAppointment.status
                            )}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* Doctor + Hospital */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">

                      <div className="rounded-[14px] bg-white/[0.045] border border-white/[0.07] p-4">

                        <p className="text-slate-500 text-[9px] uppercase tracking-wide">
                          Doctor
                        </p>

                        <p className="text-white text-[13px] font-semibold mt-2 truncate">
                          {activeAppointment.doctor?.name ||
                            'Not assigned'}
                        </p>

                        <p className="text-slate-500 text-[10px] mt-1 truncate">
                          {activeAppointment.doctor?.specialization ||
                            'OPD'}
                        </p>

                      </div>

                      <div className="rounded-[14px] bg-white/[0.045] border border-white/[0.07] p-4">

                        <p className="text-slate-500 text-[9px] uppercase tracking-wide">
                          Hospital
                        </p>

                        <p className="text-white text-[13px] font-semibold mt-2 truncate">
                          {activeAppointment.hospital?.name ||
                            'Hospital'}
                        </p>

                        <p className="text-slate-500 text-[10px] mt-1 truncate">
                          {activeAppointment.hospital?.city ||
                            activeAppointment.hospital?.address ||
                            'Location available'}
                        </p>

                      </div>

                    </div>

                    {/* Live Update */}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">

                      <div className="flex items-center gap-2">

                        {loadingQueue ? (
                          <RefreshCw
                            size={11}
                            className="text-[#16d9e3] animate-spin"
                          />
                        ) : (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              queueError
                                ? 'bg-red-400'
                                : 'bg-[#16d9e3]'
                            }`}
                          />
                        )}

                        <p className="text-slate-500 text-[9px]">

                          {queueError
                            ? 'Unable to refresh live queue'
                            : lastQueueUpdate
                            ? `Live queue updated at ${lastQueueUpdate.toLocaleTimeString(
                                [],
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                }
                              )}`
                            : 'Connecting to live OPD queue...'}

                        </p>

                      </div>

                      <p className="text-slate-600 text-[9px]">
                        Auto refresh every 10 seconds
                      </p>

                    </div>

                    {/* AI message */}

                    {waitingTime?.message &&
                      !queueError && (

                        <div className="mt-3 rounded-[10px] bg-[#16d9e3]/[0.06] border border-[#16d9e3]/10 px-3 py-2">

                          <p className="text-[#9efaff] text-[9px]">
                            {waitingTime.message}
                          </p>

                        </div>

                      )}

                  </div>

                </div>

              </div>

            )}

            {/* =================================================
                LOWER SECTION
                ================================================= */}

            <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5">

              {/* Upcoming Appointment */}

              <div className="bg-white border border-[#dce4ed] rounded-[18px] shadow-sm overflow-hidden">

                <div className="px-5 py-4 border-b border-[#edf1f5] flex items-center justify-between">

                  <div>

                    <h2 className="font-bold text-[#142033] text-[15px]">
                      Upcoming Appointment
                    </h2>

                    <p className="text-[#8a97a8] text-[10px] mt-1">
                      Your next scheduled OPD visit
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        '/patient/appointments'
                      )
                    }
                    className="text-[#0d9ca8] text-[10px] font-semibold"
                  >
                    View all
                  </button>

                </div>

                <div className="p-5">

                  {loadingAppointments ? (

                    <div className="flex items-center gap-3 py-5">

                      <div className="w-10 h-10 rounded-[11px] bg-[#eef3f8] animate-pulse" />

                      <div className="flex-1">

                        <div className="h-3 w-40 bg-[#eef3f8] rounded animate-pulse" />

                        <div className="h-2 w-28 bg-[#eef3f8] rounded mt-2 animate-pulse" />

                      </div>

                    </div>

                  ) : nextAppointment ? (

                    <div className="rounded-[14px] bg-[#f7fafc] border border-[#e5ebf1] p-4">

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                        <div className="flex items-center gap-3">

                          <div className="w-[46px] h-[46px] rounded-[13px] bg-[#eaf9fb] flex items-center justify-center text-[#0d9ca8]">
                            <CalendarDays size={21} />
                          </div>

                          <div className="min-w-0">

                            <p className="font-bold text-[#142033] text-[14px] truncate">
                              {nextAppointment.doctor?.name ||
                                'Doctor'}
                            </p>

                            <p className="text-[#718096] text-[10px] mt-1">
                              {nextAppointment.doctor?.specialization ||
                                'General OPD'}
                            </p>

                          </div>

                        </div>

                        <div className="sm:text-right">

                          <p className="font-bold text-[#142033] text-[12px]">
                            {nextAppointment.appointmentDate}
                          </p>

                          <div className="flex items-center sm:justify-end gap-1 mt-1">

                            <Clock3
                              size={12}
                              className="text-[#0d9ca8]"
                            />

                            <span className="text-[#718096] text-[10px]">
                              {nextAppointment.appointmentTime}
                            </span>

                          </div>

                        </div>

                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">

                        <span className="px-2.5 py-1.5 rounded-full bg-white border border-[#dce4ed] text-[#526176] text-[9px]">
                          Token {nextAppointment.tokenNumber}
                        </span>

                        <span className="px-2.5 py-1.5 rounded-full bg-[#eaf9fb] text-[#0d8e99] text-[9px] font-semibold">
                          {getStatusLabel(
                            nextAppointment.status
                          )}
                        </span>

                        {nextAppointment.hospital?.name && (
                          <span className="px-2.5 py-1.5 rounded-full bg-white border border-[#dce4ed] text-[#526176] text-[9px]">
                            {nextAppointment.hospital.name}
                          </span>
                        )}

                      </div>

                    </div>

                  ) : (

                    <div className="py-7 text-center">

                      <div className="w-12 h-12 rounded-[14px] bg-[#f2f6fa] flex items-center justify-center mx-auto text-[#8a97a8]">
                        <CalendarDays size={21} />
                      </div>

                      <p className="font-semibold text-[#142033] text-[13px] mt-3">
                        No upcoming appointment
                      </p>

                      <p className="text-[#8a97a8] text-[10px] mt-1">
                        Book an OPD appointment whenever you need one.
                      </p>

                      <button
                        onClick={() =>
                          navigate(
                            '/patient/hospital'
                          )
                        }
                        className="mt-4 inline-flex items-center gap-2 text-[#0d9ca8] text-[11px] font-bold"
                      >
                        Book OPD
                        <ArrowRight size={13} />
                      </button>

                    </div>

                  )}

                </div>

              </div>

              {/* =================================================
                  QUICK ACTIONS
                  ================================================= */}

              <div className="bg-white border border-[#dce4ed] rounded-[18px] shadow-sm overflow-hidden">

                <div className="px-5 py-4 border-b border-[#edf1f5]">

                  <h2 className="font-bold text-[#142033] text-[15px]">
                    Quick Actions
                  </h2>

                  <p className="text-[#8a97a8] text-[10px] mt-1">
                    Frequently used patient services
                  </p>

                </div>

                <div className="p-4 space-y-2">

                  <button
                    onClick={() =>
                      navigate(
                        '/patient/hospital'
                      )
                    }
                    className="group w-full flex items-center gap-3 p-3 rounded-[12px] bg-[#f7fafc] border border-[#e5ebf1] hover:border-[#16d9e3]/40 transition-all text-left"
                  >

                    <div className="w-9 h-9 rounded-[10px] bg-[#eaf9fb] text-[#0d9ca8] flex items-center justify-center">
                      <Plus size={18} />
                    </div>

                    <div className="flex-1">

                      <p className="font-bold text-[#142033] text-[11px]">
                        Book OPD
                      </p>

                      <p className="text-[#8a97a8] text-[9px] mt-0.5">
                        Find a doctor and appointment
                      </p>

                    </div>

                    <ArrowRight
                      size={15}
                      className="text-[#9aa7b8]"
                    />

                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        '/patient/appointments'
                      )
                    }
                    className="group w-full flex items-center gap-3 p-3 rounded-[12px] bg-[#f7fafc] border border-[#e5ebf1] hover:border-[#16d9e3]/40 transition-all text-left"
                  >

                    <div className="w-9 h-9 rounded-[10px] bg-[#eef4ff] text-[#3978d8] flex items-center justify-center">
                      <CalendarDays size={18} />
                    </div>

                    <div className="flex-1">

                      <p className="font-bold text-[#142033] text-[11px]">
                        My Appointments
                      </p>

                      <p className="text-[#8a97a8] text-[9px] mt-0.5">
                        View and manage appointments
                      </p>

                    </div>

                    <ArrowRight
                      size={15}
                      className="text-[#9aa7b8]"
                    />

                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        '/patient/history'
                      )
                    }
                    className="group w-full flex items-center gap-3 p-3 rounded-[12px] bg-[#f7fafc] border border-[#e5ebf1] hover:border-[#16d9e3]/40 transition-all text-left"
                  >

                    <div className="w-9 h-9 rounded-[10px] bg-[#fff5e8] text-[#b66a00] flex items-center justify-center">
                      <History size={18} />
                    </div>

                    <div className="flex-1">

                      <p className="font-bold text-[#142033] text-[11px]">
                        OPD History
                      </p>

                      <p className="text-[#8a97a8] text-[9px] mt-0.5">
                        Review previous visits
                      </p>

                    </div>

                    <ArrowRight
                      size={15}
                      className="text-[#9aa7b8]"
                    />

                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        '/patient/profile'
                      )
                    }
                    className="group w-full flex items-center gap-3 p-3 rounded-[12px] bg-[#f7fafc] border border-[#e5ebf1] hover:border-[#16d9e3]/40 transition-all text-left"
                  >

                    <div className="w-9 h-9 rounded-[10px] bg-[#f1edff] text-[#7358d8] flex items-center justify-center">
                      <User size={18} />
                    </div>

                    <div className="flex-1">

                      <p className="font-bold text-[#142033] text-[11px]">
                        My Profile
                      </p>

                      <p className="text-[#8a97a8] text-[9px] mt-0.5">
                        Manage your patient details
                      </p>

                    </div>

                    <ArrowRight
                      size={15}
                      className="text-[#9aa7b8]"
                    />

                  </button>

                </div>

              </div>

            </div>

            {/* Footer */}

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[9px] text-[#8b98a8]">

              <span className="flex items-center gap-1.5">

                <ShieldCheck
                  size={12}
                  className="text-[#0d9ca8]"
                />

                Secure Patient Access

              </span>

              <span className="hidden sm:block w-1 h-1 rounded-full bg-[#c5ced8]" />

              <span className="flex items-center gap-1.5">

                <HeartPulse
                  size={12}
                  className="text-[#0d9ca8]"
                />

                Smart OPD Management

              </span>

              <span className="hidden sm:block w-1 h-1 rounded-full bg-[#c5ced8]" />

              <span>
                HospitalFlow
              </span>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}