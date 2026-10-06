import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#031326] text-white relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-180px] left-[-120px] w-[420px] h-[420px] bg-cyan-400/10 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] right-[-180px] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-220px] left-[35%] w-[500px] h-[500px] bg-cyan-400/5 rounded-full blur-[120px]" />

        {/* subtle grid */}
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
      <header className="relative z-10 border-b border-white/10 bg-[#031326]/75 backdrop-blur-xl">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 h-[76px] flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] rounded-[12px] bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
              <img
                src="/assets/logo.png"
                alt="HospitalFlow"
                className="w-[34px] h-auto object-contain"
              />
            </div>

            <div>
              <div className="font-bold text-[17px] tracking-tight">
                Hospital<span className="text-[#16d9e3]">Flow</span>
              </div>

              <div className="text-[10px] text-slate-400 tracking-[0.12em] uppercase">
                Smart OPD Platform
              </div>
            </div>
          </div>

          {/* Security badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-[12px]">
            <ShieldCheck className="w-4 h-4 text-[#16d9e3]" />
            Secure Healthcare Platform
          </div>

        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 min-h-[calc(100vh-76px)] flex items-center justify-center px-5 sm:px-8 py-12 sm:py-16">

        <div className="w-full max-w-[1050px]">

          {/* Hero */}
          <div className="text-center mb-10 sm:mb-12">

            {/* Logo */}
            <div className="relative inline-flex items-center justify-center mb-7">

              <div className="absolute w-[105px] h-[105px] rounded-full bg-cyan-400/10 blur-[25px]" />

              <div className="relative w-[88px] h-[88px] rounded-[26px] bg-white/[0.07] border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-[0_0_45px_rgba(22,217,227,0.12)]">
                <img
                  src="/assets/logo.png"
                  alt="HospitalFlow"
                  className="w-[68px] h-auto object-contain"
                />
              </div>

            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#16d9e3]/10 border border-[#16d9e3]/20 text-[#8ef8ff] text-[12px] font-medium mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              Smarter Healthcare. Better Flow.
            </div>

            <h1 className="text-[34px] sm:text-[46px] md:text-[52px] leading-[1.08] font-bold tracking-[-0.035em]">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-white via-cyan-100 to-[#16d9e3] bg-clip-text text-transparent">
                HospitalFlow
              </span>
            </h1>

            <p className="max-w-[590px] mx-auto mt-5 text-[14px] sm:text-[16px] leading-[1.7] text-slate-400">
              A smarter way to manage hospital operations, appointments,
              digital tokens and real-time OPD queues.
            </p>

          </div>

          {/* Choose text */}
          <div className="text-center mb-6">
            <p className="text-slate-300 text-[13px] font-medium">
              Choose how you want to continue
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Hospital */}
            <button
              type="button"
              onClick={() => navigate('/hospital-portal')}
              className="group relative text-left rounded-[24px] p-[1px] bg-gradient-to-br from-blue-400/30 via-white/10 to-transparent hover:from-[#16d9e3]/70 hover:via-blue-400/30 transition-all duration-500"
            >
              <div className="relative h-full min-h-[280px] rounded-[23px] bg-[#071b31]/95 border border-white/[0.07] p-7 sm:p-8 overflow-hidden backdrop-blur-xl">

                {/* Card glow */}
                <div className="absolute top-[-100px] right-[-80px] w-[240px] h-[240px] bg-blue-500/10 rounded-full blur-[70px] group-hover:bg-blue-500/20 transition-all duration-500" />

                {/* Icon */}
                <div className="relative w-[62px] h-[62px] rounded-[18px] bg-blue-400/10 border border-blue-300/15 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-blue-400/15 transition-all duration-300">
                  <Building2 className="w-8 h-8 text-[#55a9ff]" />
                </div>

                <div className="relative">

                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-[22px] font-bold text-white">
                      Hospital
                    </h2>

                    <span className="text-[9px] uppercase tracking-[0.12em] px-2 py-1 rounded-full bg-blue-400/10 text-blue-300 border border-blue-400/15">
                      Staff
                    </span>
                  </div>

                  <p className="text-[14px] leading-[1.7] text-slate-400 max-w-[390px]">
                    Access hospital staff, hospital admin and hospital
                    registration services from one central platform.
                  </p>

                  <div className="mt-7 inline-flex items-center gap-2 text-[#55d8ff] font-semibold text-[14px]">
                    Continue as Hospital
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>

                </div>

              </div>
            </button>

            {/* Patient */}
            <button
              type="button"
              onClick={() => navigate('/patient/login')}
              className="group relative text-left rounded-[24px] p-[1px] bg-gradient-to-br from-[#16d9e3]/35 via-white/10 to-transparent hover:from-[#16d9e3]/80 hover:via-cyan-300/30 transition-all duration-500"
            >
              <div className="relative h-full min-h-[280px] rounded-[23px] bg-[#071b31]/95 border border-white/[0.07] p-7 sm:p-8 overflow-hidden backdrop-blur-xl">

                {/* Card glow */}
                <div className="absolute top-[-100px] right-[-80px] w-[240px] h-[240px] bg-cyan-400/10 rounded-full blur-[70px] group-hover:bg-cyan-400/20 transition-all duration-500" />

                {/* Icon */}
                <div className="relative w-[62px] h-[62px] rounded-[18px] bg-[#16d9e3]/10 border border-[#16d9e3]/15 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-[#16d9e3]/15 transition-all duration-300">
                  <UserRound className="w-8 h-8 text-[#16d9e3]" />
                </div>

                <div className="relative">

                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-[22px] font-bold text-white">
                      Patient
                    </h2>

                    <span className="text-[9px] uppercase tracking-[0.12em] px-2 py-1 rounded-full bg-[#16d9e3]/10 text-[#7ff7ff] border border-[#16d9e3]/15">
                      Personal
                    </span>
                  </div>

                  <p className="text-[14px] leading-[1.7] text-slate-400 max-w-[390px]">
                    Book appointments, get digital tokens and track your
                    real-time OPD queue from anywhere.
                  </p>

                  <div className="mt-7 inline-flex items-center gap-2 text-[#16d9e3] font-semibold text-[14px]">
                    Continue as Patient
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>

                </div>

              </div>
            </button>

          </div>

          {/* Bottom features */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] text-slate-500">

            <div className="flex items-center gap-2">
              <HeartPulse className="w-3.5 h-3.5 text-[#16d9e3]" />
              Real-time OPD
            </div>

            <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16d9e3]" />
              Secure & Private
            </div>

            <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#16d9e3]" />
              Smart Queue Management
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}