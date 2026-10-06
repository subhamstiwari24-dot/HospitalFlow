import { useNavigate } from 'react-router-dom';
import { Building2, Stethoscope, UserRound, ArrowRight } from 'lucide-react';

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#031326] text-white relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#16d9e3]/10 rounded-full blur-[140px]" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[140px]" />

      {/* Subtle Grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(#16d9e3 1px, transparent 1px), linear-gradient(90deg, #16d9e3 1px, transparent 1px)',
          backgroundSize: '45px 45px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Header */}
        <header className="border-b border-white/10 bg-[#031326]/80 backdrop-blur-xl">
          <div className="max-w-[1180px] mx-auto px-6 h-[76px] flex items-center justify-center">
            <img
              src="/assets/logo.png"
              alt="HospitalFlow"
              className="h-[42px] w-auto object-contain"
            />
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 flex items-center justify-center px-6 py-14">

          <div className="w-full max-w-[1050px]">

            {/* Heading */}
            <div className="text-center mb-12">

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#16d9e3]/10 border border-[#16d9e3]/20 text-[#8ef8ff] text-sm font-medium mb-5">
                <span className="w-2 h-2 rounded-full bg-[#16d9e3] shadow-[0_0_10px_#16d9e3]" />
                HospitalFlow Portal
              </div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Welcome to{' '}
                <span className="text-[#16d9e3]">HospitalFlow</span>
              </h1>

              <p className="mt-4 text-slate-400 text-base md:text-lg">
                Select your portal to continue
              </p>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Hospital Staff */}
              <button
                onClick={() => navigate('/login')}
                className="group text-left bg-[#071b31]/90 border border-white/10 hover:border-[#16d9e3]/50 rounded-[24px] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_50px_rgba(22,217,227,0.12)]"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#16d9e3]/10 border border-[#16d9e3]/20 flex items-center justify-center mb-6 group-hover:bg-[#16d9e3]/15 transition">
                  <Stethoscope className="w-7 h-7 text-[#16d9e3]" />
                </div>

                <h2 className="text-xl font-semibold mb-2">
                  Hospital Staff
                </h2>

                <p className="text-sm text-slate-400 leading-6 mb-7">
                  Doctors and hospital staff can access their dashboard,
                  appointments and OPD operations.
                </p>

                <div className="flex items-center gap-2 text-[#8ef8ff] text-sm font-semibold">
                  Staff Login
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Hospital Admin */}
              <button
                onClick={() => navigate('/hospital-admin/login')}
                className="group text-left bg-[#071b31]/90 border border-white/10 hover:border-[#16d9e3]/50 rounded-[24px] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_50px_rgba(22,217,227,0.12)]"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#16d9e3]/10 border border-[#16d9e3]/20 flex items-center justify-center mb-6 group-hover:bg-[#16d9e3]/15 transition">
                  <Building2 className="w-7 h-7 text-[#16d9e3]" />
                </div>

                <h2 className="text-xl font-semibold mb-2">
                  Hospital Admin
                </h2>

                <p className="text-sm text-slate-400 leading-6 mb-7">
                  Manage hospital operations, doctors, appointments,
                  departments and OPD settings.
                </p>

                <div className="flex items-center gap-2 text-[#8ef8ff] text-sm font-semibold">
                  Admin Login
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Patient */}
              <button
                onClick={() => navigate('/patient/login')}
                className="group text-left bg-[#071b31]/90 border border-white/10 hover:border-[#16d9e3]/50 rounded-[24px] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_50px_rgba(22,217,227,0.12)]"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#16d9e3]/10 border border-[#16d9e3]/20 flex items-center justify-center mb-6 group-hover:bg-[#16d9e3]/15 transition">
                  <UserRound className="w-7 h-7 text-[#16d9e3]" />
                </div>

                <h2 className="text-xl font-semibold mb-2">
                  Patient
                </h2>

                <p className="text-sm text-slate-400 leading-6 mb-7">
                  Find hospitals and doctors, book appointments and
                  track your live OPD queue.
                </p>

                <div className="flex items-center gap-2 text-[#8ef8ff] text-sm font-semibold">
                  Patient Portal
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </div>

            {/* Bottom Info */}
            <div className="mt-10 text-center">
              <p className="text-xs text-slate-500">
                Secure healthcare management platform • HospitalFlow
              </p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}