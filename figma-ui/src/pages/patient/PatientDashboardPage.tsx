import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const storedPatient = sessionStorage.getItem('hospitalflow_patient');

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
          `/api/appointments/patient/${encodeURIComponent(patient.phone)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }

        const data: Appointment[] = await response.json();

        setAppointments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load patient appointments:', error);
        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [patient?.phone]);

  const handleLogout = () => {
    sessionStorage.removeItem('hospitalflow_patient');
    navigate('/patient/login');
  };

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center px-[24px]">
        <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[32px] text-center shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

          <h1 className="font-bold text-[#142033] text-[22px]">
            Login Required
          </h1>

          <p className="text-[#526176] text-[14px] mt-[8px]">
            Please login to access your patient dashboard.
          </p>

          <button
            onClick={() => navigate('/patient/login')}
            className="bg-[#155ead] text-white font-semibold text-[13px] px-[20px] py-[11px] rounded-[9px] mt-[20px] cursor-pointer"
          >
            Patient Login →
          </button>

        </div>
      </div>
    );
  }

  const waitingAppointments = appointments.filter(
    (appointment) =>
      appointment.status === 'WAITING' ||
      appointment.status === 'IN_PROGRESS'
  );

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === 'COMPLETED'
  );

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-[#d8e1ec]">

        <div className="max-w-[1100px] mx-auto px-[24px] h-[64px] flex items-center justify-between">

          <img
            src="/assets/logo.png"
            alt="HospitalFlow"
            className="h-[34px] w-auto object-contain"
          />

          <div className="flex items-center gap-[16px]">

            <div className="hidden sm:block text-right">

              <p className="font-semibold text-[#142033] text-[13px]">
                {patient.fullName}
              </p>

              <p className="text-[#7b899c] text-[11px]">
                {patient.phone}
              </p>

            </div>

            <button
              onClick={handleLogout}
              className="font-semibold text-[#c53a45] text-[12px] cursor-pointer hover:opacity-80"
            >
              Logout
            </button>

          </div>

        </div>

      </header>


      {/* Main */}
      <main className="flex-1">

        <div className="max-w-[1100px] mx-auto px-[24px] py-[36px]">

          {/* Welcome */}
          <div className="mb-[28px]">

            <p className="text-[#155ead] font-semibold text-[12px] uppercase tracking-wide">
              Patient Dashboard
            </p>

            <h1 className="font-bold text-[#142033] text-[28px] mt-[5px]">
              Welcome, {patient.fullName}
            </h1>

            <p className="text-[#526176] text-[14px] mt-[6px]">
              Manage your OPD appointments, tokens, and medical visit history.
            </p>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-[12px] mb-[28px]">
            {[
              ['Patient ID', patient.patientId],
              ['Full Name', patient.fullName],
              ['Age', patient.age ?? 'Not available'],
              ['Mobile', patient.phone],
              ['Email', patient.email],
            ].map(([label, value]) => (
              <div key={label} className="bg-white border border-[#d8e1ec] rounded-[10px] p-[14px]">
                <p className="text-[#7b899c] text-[11px]">{label}</p>
                <p className="font-semibold text-[#142033] text-[13px] mt-[5px] break-words">{value}</p>
              </div>
            ))}
          </div>


          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">

            {/* Book OPD */}
            <button
              onClick={() => navigate('/patient/hospital')}
              className="bg-white border border-[#d8e1ec] rounded-[14px] p-[22px] text-left shadow-[0px_3px_14px_0px_rgba(19,36,58,0.04)] hover:border-[#155ead] transition-colors cursor-pointer"
            >

              <div className="w-[42px] h-[42px] rounded-[10px] bg-[#eaf3ff] flex items-center justify-center text-[#155ead] font-bold text-[18px]">
                +
              </div>

              <h2 className="font-bold text-[#142033] text-[16px] mt-[16px]">
                Book OPD
              </h2>

              <p className="text-[#7b899c] text-[13px] mt-[5px]">
                Find a hospital, department, and doctor.
              </p>

            </button>


            {/* Appointments */}
            <button
              onClick={() => navigate('/patient/appointments')}
              className="relative bg-white border border-[#d8e1ec] rounded-[14px] p-[22px] text-left shadow-[0px_3px_14px_0px_rgba(19,36,58,0.04)] hover:border-[#155ead] transition-colors cursor-pointer"
            >

              {appointments.length > 0 && (
                <span className="absolute top-[18px] right-[18px] min-w-[24px] h-[24px] px-[7px] rounded-full bg-[#155ead] text-white text-[11px] font-bold flex items-center justify-center">
                  {appointments.length}
                </span>
              )}

              <div className="w-[42px] h-[42px] rounded-[10px] bg-[#edf8f3] flex items-center justify-center text-[#18865b] font-bold text-[17px]">
                A
              </div>

              <h2 className="font-bold text-[#142033] text-[16px] mt-[16px]">
                My Appointments
              </h2>

              <p className="text-[#7b899c] text-[13px] mt-[5px]">
                {loadingAppointments
                  ? 'Loading your appointments...'
                  : appointments.length > 0
                    ? `${appointments.length} appointment${appointments.length > 1 ? 's' : ''} found.`
                    : 'View your upcoming and previous appointments.'}
              </p>

            </button>


            {/* OPD History */}
            <button
              onClick={() => navigate('/patient/history')}
              className="relative bg-white border border-[#d8e1ec] rounded-[14px] p-[22px] text-left shadow-[0px_3px_14px_0px_rgba(19,36,58,0.04)] hover:border-[#155ead] transition-colors cursor-pointer"
            >

              {completedAppointments.length > 0 && (
                <span className="absolute top-[18px] right-[18px] min-w-[24px] h-[24px] px-[7px] rounded-full bg-[#b66a00] text-white text-[11px] font-bold flex items-center justify-center">
                  {completedAppointments.length}
                </span>
              )}

              <div className="w-[42px] h-[42px] rounded-[10px] bg-[#fff5e8] flex items-center justify-center text-[#b66a00] font-bold text-[16px]">
                H
              </div>

              <h2 className="font-bold text-[#142033] text-[16px] mt-[16px]">
                OPD History
              </h2>

              <p className="text-[#7b899c] text-[13px] mt-[5px]">
                {completedAppointments.length > 0
                  ? `${completedAppointments.length} completed visit${completedAppointments.length > 1 ? 's' : ''}.`
                  : 'View your previous OPD visits and records.'}
              </p>

            </button>

          </div>


          {/* Current Appointment Summary */}
          {waitingAppointments.length > 0 && (
            <div className="mt-[28px] bg-white border border-[#d8e1ec] rounded-[14px] p-[24px] shadow-[0px_3px_14px_0px_rgba(19,36,58,0.04)]">

              <div className="flex items-center justify-between mb-[18px]">

                <div>
                  <h2 className="font-bold text-[#142033] text-[17px]">
                    Active Appointment
                  </h2>

                  <p className="text-[#7b899c] text-[12px] mt-[3px]">
                    Your current OPD appointment
                  </p>
                </div>

                <span className="px-[10px] py-[5px] rounded-full bg-[#edf8f3] text-[#18865b] text-[11px] font-semibold">
                  {waitingAppointments[0].status}
                </span>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-[18px]">

                <div>
                  <p className="text-[#7b899c] text-[11px]">
                    Token
                  </p>

                  <p className="font-bold text-[#155ead] text-[18px] mt-[4px]">
                    {waitingAppointments[0].tokenNumber}
                  </p>
                </div>

                <div>
                  <p className="text-[#7b899c] text-[11px]">
                    Doctor
                  </p>

                  <p className="font-semibold text-[#142033] text-[14px] mt-[4px]">
                    {waitingAppointments[0].doctor?.name || 'Not assigned'}
                  </p>
                </div>

                <div>
                  <p className="text-[#7b899c] text-[11px]">
                    Date
                  </p>

                  <p className="font-semibold text-[#142033] text-[14px] mt-[4px]">
                    {waitingAppointments[0].appointmentDate}
                  </p>
                </div>

                <div>
                  <p className="text-[#7b899c] text-[11px]">
                    Time
                  </p>

                  <p className="font-semibold text-[#142033] text-[14px] mt-[4px]">
                    {waitingAppointments[0].appointmentTime}
                  </p>
                </div>

              </div>

              <button
                onClick={() => navigate('/patient/appointment')}
                className="mt-[20px] text-[#155ead] font-semibold text-[12px] hover:underline cursor-pointer"
              >
                View Appointment Details →
              </button>

            </div>
          )}


          {/* Profile */}
          <div className="mt-[28px] bg-white border border-[#d8e1ec] rounded-[14px] p-[24px] shadow-[0px_3px_14px_0px_rgba(19,36,58,0.04)]">

            <div className="flex items-center justify-between mb-[20px]">

              <div>

                <h2 className="font-bold text-[#142033] text-[17px]">
                  My Profile
                </h2>

                <p className="text-[#7b899c] text-[12px] mt-[3px]">
                  Your registered patient information
                </p>

              </div>

            </div>


            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[18px]">

              <div>

                <p className="text-[#7b899c] text-[11px]">
                  Full Name
                </p>

                <p className="font-semibold text-[#142033] text-[14px] mt-[4px]">
                  {patient.fullName}
                </p>

              </div>


              <div>

                <p className="text-[#7b899c] text-[11px]">
                  Mobile Number
                </p>

                <p className="font-semibold text-[#142033] text-[14px] mt-[4px]">
                  {patient.phone}
                </p>

              </div>


              <div>

                <p className="text-[#7b899c] text-[11px]">
                  Email Address
                </p>

                <p className="font-semibold text-[#142033] text-[14px] mt-[4px] break-all">
                  {patient.email}
                </p>

              </div>

            </div>

          </div>


          {/* Guest Booking */}
          <div className="mt-[20px] text-center">

            <button
              onClick={() => navigate('/patient')}
              className="text-[#526176] text-[12px] font-semibold hover:text-[#155ead] cursor-pointer"
            >
              Continue with Guest Booking →
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}