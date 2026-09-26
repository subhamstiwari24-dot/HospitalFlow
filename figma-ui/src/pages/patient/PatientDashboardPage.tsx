import { useNavigate } from 'react-router-dom';

interface PatientSession {
  patientId: number;
  fullName: string;
  phone: string;
  email: string;
}

export default function PatientDashboardPage() {
  const navigate = useNavigate();

  const storedPatient = sessionStorage.getItem('hospitalflow_patient');

  const patient: PatientSession | null = storedPatient
    ? JSON.parse(storedPatient)
    : null;

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
              className="bg-white border border-[#d8e1ec] rounded-[14px] p-[22px] text-left shadow-[0px_3px_14px_0px_rgba(19,36,58,0.04)] hover:border-[#155ead] transition-colors cursor-pointer"
            >
              <div className="w-[42px] h-[42px] rounded-[10px] bg-[#edf8f3] flex items-center justify-center text-[#18865b] font-bold text-[17px]">
                A
              </div>

              <h2 className="font-bold text-[#142033] text-[16px] mt-[16px]">
                My Appointments
              </h2>

              <p className="text-[#7b899c] text-[13px] mt-[5px]">
                View your upcoming and previous appointments.
              </p>
            </button>

            {/* OPD History */}
            <button
              onClick={() => navigate('/patient/history')}
              className="bg-white border border-[#d8e1ec] rounded-[14px] p-[22px] text-left shadow-[0px_3px_14px_0px_rgba(19,36,58,0.04)] hover:border-[#155ead] transition-colors cursor-pointer"
            >
              <div className="w-[42px] h-[42px] rounded-[10px] bg-[#fff5e8] flex items-center justify-center text-[#b66a00] font-bold text-[16px]">
                H
              </div>

              <h2 className="font-bold text-[#142033] text-[16px] mt-[16px]">
                OPD History
              </h2>

              <p className="text-[#7b899c] text-[13px] mt-[5px]">
                View your previous OPD visits and records.
              </p>
            </button>

          </div>

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