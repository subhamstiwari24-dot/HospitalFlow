import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ClipboardList,
  ShieldCheck,
  Sparkles,
  UserRoundCog,
} from 'lucide-react';

export default function HospitalPortalPage() {
  const navigate = useNavigate();

  return (
    <div className="hospital-portal-page min-h-screen bg-[#031326] text-white relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute top-[-180px] left-[-150px] w-[420px] h-[420px] rounded-full bg-cyan-400/10 blur-[110px]" />

        <div className="absolute top-[25%] right-[-180px] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="absolute bottom-[-220px] left-[35%] w-[500px] h-[400px] rounded-full bg-cyan-400/5 blur-[120px]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '45px 45px',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 h-[76px] border-b border-white/10 bg-[#031326]/75 backdrop-blur-xl">

        <div className="max-w-[1180px] mx-auto h-full px-5 sm:px-8 flex items-center justify-between">

          {/* Brand */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group"
          >
            <div className="w-[42px] h-[42px] rounded-[12px] bg-white/[0.07] border border-white/10 flex items-center justify-center overflow-hidden">
              <img
                src="/assets/logo.png"
                alt="HospitalFlow"
                className="w-[34px] h-auto object-contain"
              />
            </div>

            <div className="text-left">
              <div className="font-bold text-[17px] tracking-tight">
                Hospital
                <span className="text-[#16d9e3]">Flow</span>
              </div>

              <div className="text-[9px] text-slate-500 tracking-[0.12em] uppercase">
                Smart OPD Platform
              </div>
            </div>
          </button>

          {/* Back */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-[12px] sm:text-[13px] font-semibold text-slate-400 hover:text-[#16d9e3] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 min-h-[calc(100vh-76px)] flex items-center justify-center px-5 sm:px-8 py-12 sm:py-16">

        <div className="w-full max-w-[1100px]">

          {/* Hero */}
          <div className="text-center mb-10 sm:mb-12">

            {/* Icon */}
            <div className="relative inline-flex items-center justify-center mb-6">

              <div className="absolute w-[110px] h-[110px] rounded-full bg-cyan-400/10 blur-[28px]" />

              <div className="relative w-[82px] h-[82px] rounded-[24px] bg-white/[0.07] border border-white/10 flex items-center justify-center shadow-[0_0_45px_rgba(22,217,227,0.12)]">

                <Building2 className="w-10 h-10 text-[#16d9e3]" />

              </div>

            </div>

            {/* Badge */}
            <div className="flex justify-center mb-5">

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#16d9e3]/10 border border-[#16d9e3]/20 text-[#8ef8ff] text-[11px] font-medium">

                <Sparkles className="w-3.5 h-3.5" />

                Hospital Operations Center

              </div>

            </div>

            <h1 className="text-[34px] sm:text-[44px] md:text-[48px] leading-[1.08] font-bold tracking-[-0.035em]">

              Hospital{' '}

              <span className="bg-gradient-to-r from-white via-cyan-100 to-[#16d9e3] bg-clip-text text-transparent">
                Portal
              </span>

            </h1>

            <p className="text-[14px] sm:text-[16px] text-slate-400 leading-[1.7] mt-4 max-w-[590px] mx-auto">
              Manage hospital operations, staff access and digital OPD
              services from one connected platform.
            </p>

          </div>

          {/* Choose */}
          <div className="text-center mb-6">

            <p className="text-slate-300 text-[13px] font-medium">
              Choose the hospital service you want to access
            </p>

          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Hospital Staff */}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="group relative text-left rounded-[24px] p-[1px] bg-gradient-to-br from-blue-400/35 via-white/10 to-transparent hover:from-[#16d9e3]/70 hover:via-blue-400/30 transition-all duration-500"
            >

              <div className="relative h-full min-h-[310px] rounded-[23px] bg-[#071b31]/95 border border-white/[0.07] p-7 overflow-hidden backdrop-blur-xl">

                {/* Glow */}
                <div className="absolute top-[-100px] right-[-90px] w-[250px] h-[250px] rounded-full bg-blue-500/10 blur-[75px] group-hover:bg-blue-500/20 transition-all duration-500" />

                {/* Icon */}
                <div className="relative w-[62px] h-[62px] rounded-[18px] bg-blue-400/10 border border-blue-300/15 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">

                  <UserRoundCog className="w-8 h-8 text-[#55a9ff]" />

                </div>

                <div className="relative">

                  <div className="flex items-center gap-2 mb-2">

                    <h2 className="text-[21px] font-bold text-white">
                      Hospital Staff
                    </h2>

                    <span className="text-[8px] uppercase tracking-[0.12em] px-2 py-1 rounded-full bg-blue-400/10 text-blue-300 border border-blue-400/15">
                      Staff
                    </span>

                  </div>

                  <p className="text-[13px] leading-[1.7] text-slate-400">
                    Login as a doctor or staff administrator to manage
                    hospital operations and OPD activities.
                  </p>

                  <div className="mt-7 inline-flex items-center gap-2 text-[#55d8ff] font-semibold text-[13px]">

                    Continue to Staff Login

                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />

                  </div>

                </div>

              </div>

            </button>

            {/* Hospital Admin */}
            <button
              type="button"
              onClick={() => navigate('/hospital-admin/login')}
              className="group relative text-left rounded-[24px] p-[1px] bg-gradient-to-br from-[#16d9e3]/35 via-white/10 to-transparent hover:from-[#16d9e3]/80 hover:via-cyan-300/30 transition-all duration-500"
            >

              <div className="relative h-full min-h-[310px] rounded-[23px] bg-[#071b31]/95 border border-white/[0.07] p-7 overflow-hidden backdrop-blur-xl">

                {/* Glow */}
                <div className="absolute top-[-100px] right-[-90px] w-[250px] h-[250px] rounded-full bg-cyan-400/10 blur-[75px] group-hover:bg-cyan-400/20 transition-all duration-500" />

                {/* Icon */}
                <div className="relative w-[62px] h-[62px] rounded-[18px] bg-[#16d9e3]/10 border border-[#16d9e3]/15 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">

                  <ShieldCheck className="w-8 h-8 text-[#16d9e3]" />

                </div>

                <div className="relative">

                  <div className="flex items-center gap-2 mb-2">

                    <h2 className="text-[21px] font-bold text-white">
                      Hospital Admin
                    </h2>

                    <span className="text-[8px] uppercase tracking-[0.12em] px-2 py-1 rounded-full bg-[#16d9e3]/10 text-[#7ff7ff] border border-[#16d9e3]/15">
                      Admin
                    </span>

                  </div>

                  <p className="text-[13px] leading-[1.7] text-slate-400">
                    Manage your hospital's doctors, departments,
                    appointments and daily operations.
                  </p>

                  <div className="mt-7 inline-flex items-center gap-2 text-[#16d9e3] font-semibold text-[13px]">

                    Continue as Hospital Admin

                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />

                  </div>

                </div>

              </div>

            </button>

            {/* Register Hospital */}
            <button
              type="button"
              onClick={() => navigate('/hospital/register')}
              className="group relative text-left rounded-[24px] p-[1px] bg-gradient-to-br from-cyan-300/25 via-white/10 to-transparent hover:from-cyan-300/60 hover:via-cyan-200/20 transition-all duration-500"
            >

              <div className="relative h-full min-h-[310px] rounded-[23px] bg-[#071b31]/95 border border-white/[0.07] p-7 overflow-hidden backdrop-blur-xl">

                {/* Glow */}
                <div className="absolute top-[-100px] right-[-90px] w-[250px] h-[250px] rounded-full bg-cyan-300/8 blur-[75px] group-hover:bg-cyan-300/15 transition-all duration-500" />

                {/* Icon */}
                <div className="relative w-[62px] h-[62px] rounded-[18px] bg-cyan-300/10 border border-cyan-300/15 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">

                  <ClipboardList className="w-8 h-8 text-cyan-300" />

                </div>

                <div className="relative">

                  <div className="flex items-center gap-2 mb-2">

                    <h2 className="text-[21px] font-bold text-white">
                      Register Hospital
                    </h2>

                    <span className="text-[8px] uppercase tracking-[0.12em] px-2 py-1 rounded-full bg-cyan-300/10 text-cyan-200 border border-cyan-300/15">
                      New
                    </span>

                  </div>

                  <p className="text-[13px] leading-[1.7] text-slate-400">
                    Register a new hospital with HospitalFlow and start
                    managing digital OPD operations.
                  </p>

                  <div className="mt-7 inline-flex items-center gap-2 text-cyan-300 font-semibold text-[13px]">

                    Register Your Hospital

                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />

                  </div>

                </div>

              </div>

            </button>

          </div>

          {/* Bottom trust row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] text-slate-500">

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16d9e3]" />
              Secure Access
            </div>

            <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-[#16d9e3]" />
              Multi-Hospital Ready
            </div>

            <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#16d9e3]" />
              Digital OPD Management
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}