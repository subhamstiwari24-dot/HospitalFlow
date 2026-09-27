import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  CalendarDays,
  Clock3,
  HeartPulse,
  History,
  LogOut,
  Menu,
  Plus,
  User,
  X,
} from 'lucide-react';

interface PatientSession {
  patientId: string;
  fullName: string;
  age?: number;
  phone: string;
  email: string;
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
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const storedPatient =
    sessionStorage.getItem('hospitalflow_patient');

  const patient: PatientSession | null = storedPatient
    ? JSON.parse(storedPatient)
    : null;

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

  const handleLogout = () => {
    sessionStorage.removeItem(
      'hospitalflow_patient'
    );

    navigate('/patient/login');
  };

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center px-[24px]">

        <div className="bg-white border border-[#d8e1ec] rounded-[16px] p-[32px] text-center shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

          <div className="w-[52px] h-[52px] rounded-full bg-[#eaf3ff] text-[#155ead] flex items-center justify-center mx-auto">
            <User size={25} />
          </div>

          <h1 className="font-bold text-[#142033] text-[22px] mt-[16px]">
            Login Required
          </h1>

          <p className="text-[#526176] text-[14px] mt-[8px]">
            Please login to access your patient dashboard.
          </p>

          <button
            onClick={() =>
              navigate('/patient/login')
            }
            className="bg-[#155ead] text-white font-semibold text-[13px] px-[20px] py-[11px] rounded-[9px] mt-[20px] cursor-pointer hover:bg-[#0f4f95]"
          >
            Patient Login →
          </button>

        </div>

      </div>
    );
  }

  const waitingAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === 'WAITING' ||
        appointment.status === 'IN_PROGRESS'
    );

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === 'COMPLETED'
    );

  const initials = patient.fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  const goTo = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="hidden lg:flex w-[250px] shrink-0 bg-white border-r border-[#d8e1ec] min-h-screen flex-col sticky top-0 h-screen">

        {/* Brand */}

        <div className="h-[76px] px-[22px] flex items-center border-b border-[#edf1f6]">

          <div className="w-[40px] h-[40px] rounded-[11px] bg-[#eaf3ff] text-[#155ead] flex items-center justify-center shrink-0">
            <HeartPulse size={21} />
          </div>

          <div className="ml-[11px]">

            <h2 className="font-bold text-[#142033] text-[17px]">
              HospitalFlow
            </h2>

            <p className="text-[#7b899c] text-[10px] mt-[1px]">
              Smart OPD Care
            </p>

          </div>

        </div>

        {/* Patient Mini Profile */}

        <div className="px-[16px] pt-[22px]">

          <div className="bg-[#f5f8fc] rounded-[13px] p-[13px] flex items-center">

            <div className="w-[40px] h-[40px] rounded-full bg-[#155ead] text-white flex items-center justify-center font-bold text-[13px] shrink-0">
              {initials || 'P'}
            </div>

            <div className="ml-[10px] min-w-0">

              <p className="font-semibold text-[#142033] text-[12px] truncate">
                {patient.fullName}
              </p>

              <p className="text-[#7b899c] text-[10px] mt-[2px]">
                Patient
              </p>

            </div>

          </div>

        </div>

        {/* Navigation */}

        <nav className="px-[14px] mt-[24px] flex-1">

          <p className="text-[#9aa7b8] text-[10px] font-semibold uppercase tracking-[0.08em] px-[12px] mb-[9px]">
            Main Menu
          </p>

          {/* Dashboard */}

          <button
            onClick={() =>
              goTo('/patient/dashboard')
            }
            className="w-full flex items-center gap-[11px] px-[12px] py-[11px] rounded-[9px] bg-[#eaf3ff] text-[#155ead] font-semibold text-[12px] cursor-pointer"
          >
            <Activity size={18} />

            <span>
              Dashboard
            </span>
          </button>

          {/* Book OPD */}

          <button
            onClick={() =>
              goTo('/patient/hospital')
            }
            className="w-full flex items-center gap-[11px] px-[12px] py-[11px] rounded-[9px] text-[#526176] hover:bg-[#f5f8fc] hover:text-[#155ead] font-medium text-[12px] mt-[4px] cursor-pointer"
          >
            <Plus size={18} />

            <span>
              Book OPD
            </span>
          </button>

          {/* Appointments */}

          <button
            onClick={() =>
              goTo('/patient/appointments')
            }
            className="w-full flex items-center justify-between px-[12px] py-[11px] rounded-[9px] text-[#526176] hover:bg-[#f5f8fc] hover:text-[#155ead] font-medium text-[12px] mt-[4px] cursor-pointer"
          >

            <span className="flex items-center gap-[11px]">
              <CalendarDays size={18} />

              My Appointments
            </span>

            {appointments.length > 0 && (
              <span className="min-w-[21px] h-[21px] px-[5px] rounded-full bg-[#155ead] text-white text-[9px] font-bold flex items-center justify-center">
                {appointments.length}
              </span>
            )}

          </button>

          {/* OPD History */}

          <button
            onClick={() =>
              goTo('/patient/history')
            }
            className="w-full flex items-center gap-[11px] px-[12px] py-[11px] rounded-[9px] text-[#526176] hover:bg-[#f5f8fc] hover:text-[#155ead] font-medium text-[12px] mt-[4px] cursor-pointer"
          >
            <History size={18} />

            <span>
              OPD History
            </span>
          </button>

          {/* My Profile */}

          <button
            onClick={() =>
              goTo('/patient/profile')
            }
            className="w-full flex items-center gap-[11px] px-[12px] py-[11px] rounded-[9px] text-[#526176] hover:bg-[#f5f8fc] hover:text-[#155ead] font-medium text-[12px] mt-[4px] cursor-pointer"
          >
            <User size={18} />

            <span>
              My Profile
            </span>
          </button>

        </nav>

        {/* Sidebar Bottom */}

        <div className="px-[14px] pb-[18px]">

          {/* Active Appointment mini card */}

          {waitingAppointments.length > 0 && (
            <div className="bg-[#edf8f3] border border-[#d8eee3] rounded-[11px] p-[12px] mb-[12px]">

              <div className="flex items-center gap-[7px]">

                <span className="w-[7px] h-[7px] rounded-full bg-[#18865b]" />

                <p className="text-[#18865b] font-semibold text-[10px]">
                  OPD ACTIVE
                </p>

              </div>

              <p className="font-bold text-[#142033] text-[15px] mt-[7px]">
                {waitingAppointments[0].tokenNumber}
              </p>

              <p className="text-[#526176] text-[10px] mt-[2px]">
                {waitingAppointments[0].doctor?.name ||
                  'Doctor assigned'}
              </p>

            </div>
          )}

          {/* Logout */}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-[11px] px-[12px] py-[11px] rounded-[9px] text-[#c53a45] hover:bg-[#fff3f4] font-medium text-[12px] cursor-pointer"
          >
            <LogOut size={18} />

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* =====================================================
          MOBILE SIDEBAR OVERLAY
          ===================================================== */}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />
      )}

      {/* Mobile Sidebar */}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-[270px] bg-white z-50 lg:hidden flex flex-col border-r border-[#d8e1ec] transition-transform duration-200 ${
          mobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >

        <div className="h-[76px] px-[20px] flex items-center justify-between border-b border-[#edf1f6]">

          <div className="flex items-center">

            <div className="w-[40px] h-[40px] rounded-[11px] bg-[#eaf3ff] text-[#155ead] flex items-center justify-center">
              <HeartPulse size={21} />
            </div>

            <div className="ml-[10px]">

              <h2 className="font-bold text-[#142033] text-[17px]">
                HospitalFlow
              </h2>

              <p className="text-[#7b899c] text-[10px]">
                Smart OPD Care
              </p>

            </div>

          </div>

          <button
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="text-[#526176] cursor-pointer"
          >
            <X size={20} />
          </button>

        </div>

        <div className="px-[16px] pt-[22px]">

          <div className="bg-[#f5f8fc] rounded-[13px] p-[13px] flex items-center">

            <div className="w-[40px] h-[40px] rounded-full bg-[#155ead] text-white flex items-center justify-center font-bold text-[13px]">
              {initials || 'P'}
            </div>

            <div className="ml-[10px]">

              <p className="font-semibold text-[#142033] text-[12px]">
                {patient.fullName}
              </p>

              <p className="text-[#7b899c] text-[10px] mt-[2px]">
                Patient
              </p>

            </div>

          </div>

        </div>

        <nav className="px-[14px] mt-[24px] flex-1">

          <button
            onClick={() =>
              goTo('/patient/dashboard')
            }
            className="w-full flex items-center gap-[11px] px-[12px] py-[11px] rounded-[9px] bg-[#eaf3ff] text-[#155ead] font-semibold text-[12px]"
          >
            <Activity size={18} />
            Dashboard
          </button>

          <button
            onClick={() =>
              goTo('/patient/hospital')
            }
            className="w-full flex items-center gap-[11px] px-[12px] py-[11px] rounded-[9px] text-[#526176] mt-[4px]"
          >
            <Plus size={18} />
            Book OPD
          </button>

          <button
            onClick={() =>
              goTo('/patient/appointments')
            }
            className="w-full flex items-center gap-[11px] px-[12px] py-[11px] rounded-[9px] text-[#526176] mt-[4px]"
          >
            <CalendarDays size={18} />
            My Appointments
          </button>

          <button
            onClick={() =>
              goTo('/patient/history')
            }
            className="w-full flex items-center gap-[11px] px-[12px] py-[11px] rounded-[9px] text-[#526176] mt-[4px]"
          >
            <History size={18} />
            OPD History
          </button>

          <button
            onClick={() =>
              goTo('/patient/profile')
            }
            className="w-full flex items-center gap-[11px] px-[12px] py-[11px] rounded-[9px] text-[#526176] mt-[4px]"
          >
            <User size={18} />
            My Profile
          </button>

        </nav>

        <div className="px-[14px] pb-[18px]">

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-[11px] px-[12px] py-[11px] rounded-[9px] text-[#c53a45] bg-[#fff3f4]"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <div className="flex-1 min-w-0">

        {/* Top Header */}

        <header className="h-[76px] bg-white border-b border-[#d8e1ec] flex items-center">

          <div className="w-full px-[20px] sm:px-[28px] lg:px-[36px] flex items-center justify-between">

            <div className="flex items-center gap-[12px]">

              {/* Mobile menu */}

              <button
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                className="lg:hidden w-[38px] h-[38px] rounded-[9px] border border-[#d8e1ec] flex items-center justify-center text-[#526176] cursor-pointer"
              >
                <Menu size={20} />
              </button>

              <div>

                <p className="text-[#155ead] font-semibold text-[10px] uppercase tracking-wide">
                  Patient Dashboard
                </p>

                <h1 className="font-bold text-[#142033] text-[18px] sm:text-[21px] mt-[2px]">
                  Patient Dashboard
                </h1>

              </div>

            </div>

            {/* Patient avatar only */}

            <div className="hidden sm:flex items-center">

              <div className="w-[38px] h-[38px] rounded-full bg-[#155ead] text-white flex items-center justify-center font-bold text-[12px]">
                {initials || 'P'}
              </div>

            </div>

          </div>

        </header>

        {/* Main Content */}

        <main className="px-[20px] sm:px-[28px] lg:px-[36px] py-[28px]">

          <div className="max-w-[1150px]">

            {/* Welcome Text */}

            <div className="mb-[26px]">

              <p className="text-[#526176] text-[13px]">
                Manage your OPD appointments, tokens, and medical visit history.
              </p>

            </div>

            {/* Patient ID */}

            <div className="mb-[26px]">

              <div className="inline-block min-w-[230px] bg-white border border-[#d8e1ec] rounded-[11px] p-[15px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.03)]">

                <p className="text-[#7b899c] text-[10px]">
                  Patient ID
                </p>

                <p className="font-bold text-[#142033] text-[15px] mt-[5px]">
                  {patient.patientId}
                </p>

              </div>

            </div>

            {/* Quick Actions */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[15px]">

              {/* Book OPD */}

              <button
                onClick={() =>
                  navigate('/patient/hospital')
                }
                className="bg-white border border-[#d8e1ec] rounded-[14px] p-[21px] text-left shadow-[0px_3px_14px_0px_rgba(19,36,58,0.04)] hover:border-[#155ead] transition-colors cursor-pointer"
              >

                <div className="w-[42px] h-[42px] rounded-[10px] bg-[#eaf3ff] flex items-center justify-center text-[#155ead]">
                  <Plus size={21} />
                </div>

                <h2 className="font-bold text-[#142033] text-[16px] mt-[15px]">
                  Book OPD
                </h2>

                <p className="text-[#7b899c] text-[12px] mt-[5px]">
                  Find a hospital, department, and doctor.
                </p>

              </button>

              {/* Appointments */}

              <button
                onClick={() =>
                  navigate('/patient/appointments')
                }
                className="relative bg-white border border-[#d8e1ec] rounded-[14px] p-[21px] text-left shadow-[0px_3px_14px_0px_rgba(19,36,58,0.04)] hover:border-[#155ead] transition-colors cursor-pointer"
              >

                {appointments.length > 0 && (
                  <span className="absolute top-[16px] right-[16px] min-w-[23px] h-[23px] px-[6px] rounded-full bg-[#155ead] text-white text-[10px] font-bold flex items-center justify-center">
                    {appointments.length}
                  </span>
                )}

                <div className="w-[42px] h-[42px] rounded-[10px] bg-[#edf8f3] flex items-center justify-center text-[#18865b]">
                  <CalendarDays size={20} />
                </div>

                <h2 className="font-bold text-[#142033] text-[16px] mt-[15px]">
                  My Appointments
                </h2>

                <p className="text-[#7b899c] text-[12px] mt-[5px]">
                  {loadingAppointments
                    ? 'Loading your appointments...'
                    : appointments.length > 0
                      ? `${appointments.length} appointment${appointments.length > 1 ? 's' : ''} found.`
                      : 'View your upcoming and previous appointments.'}
                </p>

              </button>

              {/* History */}

              <button
                onClick={() =>
                  navigate('/patient/history')
                }
                className="relative bg-white border border-[#d8e1ec] rounded-[14px] p-[21px] text-left shadow-[0px_3px_14px_0px_rgba(19,36,58,0.04)] hover:border-[#155ead] transition-colors cursor-pointer"
              >

                {completedAppointments.length > 0 && (
                  <span className="absolute top-[16px] right-[16px] min-w-[23px] h-[23px] px-[6px] rounded-full bg-[#b66a00] text-white text-[10px] font-bold flex items-center justify-center">
                    {completedAppointments.length}
                  </span>
                )}

                <div className="w-[42px] h-[42px] rounded-[10px] bg-[#fff5e8] flex items-center justify-center text-[#b66a00]">
                  <History size={20} />
                </div>

                <h2 className="font-bold text-[#142033] text-[16px] mt-[15px]">
                  OPD History
                </h2>

                <p className="text-[#7b899c] text-[12px] mt-[5px]">
                  {completedAppointments.length > 0
                    ? `${completedAppointments.length} completed visit${completedAppointments.length > 1 ? 's' : ''}.`
                    : 'View your previous OPD visits and records.'}
                </p>

              </button>

            </div>

            {/* Active Appointment */}

            {waitingAppointments.length > 0 && (

              <div className="mt-[26px] bg-white border border-[#d8e1ec] rounded-[14px] p-[22px] shadow-[0px_3px_14px_0px_rgba(19,36,58,0.04)]">

                <div className="flex items-center justify-between mb-[18px]">

                  <div>

                    <h2 className="font-bold text-[#142033] text-[17px]">
                      Active Appointment
                    </h2>

                    <p className="text-[#7b899c] text-[11px] mt-[3px]">
                      Your current OPD appointment
                    </p>

                  </div>

                  <span className="px-[10px] py-[5px] rounded-full bg-[#edf8f3] text-[#18865b] text-[10px] font-semibold">
                    {waitingAppointments[0].status}
                  </span>

                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-[18px]">

                  <div>

                    <p className="text-[#7b899c] text-[10px]">
                      Token
                    </p>

                    <p className="font-bold text-[#155ead] text-[18px] mt-[4px]">
                      {waitingAppointments[0].tokenNumber}
                    </p>

                  </div>

                  <div>

                    <p className="text-[#7b899c] text-[10px]">
                      Doctor
                    </p>

                    <p className="font-semibold text-[#142033] text-[13px] mt-[4px]">
                      {waitingAppointments[0].doctor?.name ||
                        'Not assigned'}
                    </p>

                  </div>

                  <div>

                    <p className="text-[#7b899c] text-[10px]">
                      Date
                    </p>

                    <p className="font-semibold text-[#142033] text-[13px] mt-[4px]">
                      {waitingAppointments[0].appointmentDate}
                    </p>

                  </div>

                  <div>

                    <p className="text-[#7b899c] text-[10px]">
                      Time
                    </p>

                    <div className="flex items-center gap-[5px] mt-[4px]">

                      <Clock3
                        size={13}
                        className="text-[#155ead]"
                      />

                      <p className="font-semibold text-[#142033] text-[13px]">
                        {waitingAppointments[0].appointmentTime}
                      </p>

                    </div>

                  </div>

                </div>

                <button
                  onClick={() =>
                    navigate('/patient/appointment')
                  }
                  className="mt-[20px] text-[#155ead] font-semibold text-[12px] hover:underline cursor-pointer"
                >
                  View Appointment Details →
                </button>

              </div>

            )}

            {/* No Active Appointment */}

            {!loadingAppointments &&
              waitingAppointments.length === 0 && (
                <div className="mt-[26px] bg-white border border-[#d8e1ec] rounded-[14px] p-[22px]">

                  <div className="flex items-center gap-[13px]">

                    <div className="w-[40px] h-[40px] rounded-[10px] bg-[#f5f8fc] flex items-center justify-center text-[#7b899c]">
                      <Clock3 size={19} />
                    </div>

                    <div>

                      <p className="font-semibold text-[#142033] text-[13px]">
                        No active appointment
                      </p>

                      <p className="text-[#7b899c] text-[11px] mt-[2px]">
                        Book an OPD appointment to receive your digital token.
                      </p>

                    </div>

                  </div>

                </div>
              )}

          </div>

        </main>

      </div>

    </div>
  );
}