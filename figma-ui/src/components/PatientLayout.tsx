import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

const STEPS = [
  { label: 'Hospital', path: '/patient/hospital' },
  { label: 'Department', path: '/patient/department' },
  { label: 'Doctor', path: '/patient/doctor' },
  { label: 'Book OPD', path: '/patient/book' },
  { label: 'Confirm', path: '/patient/confirmation' },
];

interface PatientLayoutProps {
  children: ReactNode;
  step?: number;
  title?: string;
  showBack?: boolean;
  backTo?: string;
  maxWidth?: string;
}

export default function PatientLayout({
  children,
  step,
  title,
  showBack = true,
  backTo,
  maxWidth = 'max-w-[860px]',
}: PatientLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="patient-shell min-h-screen bg-[#031326] text-white flex flex-col relative overflow-hidden">

      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <div className="pointer-events-none fixed -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#16d9e3]/10 blur-[140px]" />

      <div className="pointer-events-none fixed -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-400/10 blur-[140px]" />

      {/* Subtle grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(#16d9e3 1px, transparent 1px), linear-gradient(90deg, #16d9e3 1px, transparent 1px)',
          backgroundSize: '45px 45px',
        }}
      />

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="relative z-20 bg-[#031326]/85 backdrop-blur-xl border-b border-white/10 sticky top-0">

        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-[60px] sm:h-[68px] flex items-center justify-between">

          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate('/patient')}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/logo.png"
              alt="HospitalFlow"
              className="h-7 sm:h-9 w-auto object-contain"
            />
          </button>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-5">

            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16d9e3] shadow-[0_0_10px_#16d9e3]" />

              <p className="text-[#8ea4bd] text-[12px] font-medium">
                Patient Portal
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-[#8ef8ff] text-[12px] font-semibold hover:text-white transition-colors"
            >
              Staff Login →
            </button>

          </div>
        </div>

        {/* =====================================================
            STEPPER
        ===================================================== */}

        {step !== undefined && (
          <div className="border-t border-white/5 bg-[#04172a]/80 overflow-x-auto">

            <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-3 flex items-center min-w-[520px]">

              {STEPS.map((s, i) => {

                const done = i < step;
                const active = i === step;

                return (
                  <div
                    key={s.label}
                    className="flex items-center flex-1 last:flex-none"
                  >

                    {/* Step */}
                    <div className="flex items-center gap-2 shrink-0">

                      <div
                        className={`
                          w-[22px] h-[22px]
                          sm:w-[24px] sm:h-[24px]
                          rounded-full
                          flex items-center justify-center
                          text-[10px] sm:text-[11px]
                          font-bold
                          border
                          transition-all duration-300
                          ${
                            done
                              ? 'bg-[#16d9e3] border-[#16d9e3] text-[#031326] shadow-[0_0_12px_rgba(22,217,227,0.35)]'
                              : active
                              ? 'bg-[#16d9e3]/15 border-[#16d9e3] text-[#8ef8ff] shadow-[0_0_14px_rgba(22,217,227,0.25)]'
                              : 'bg-[#071b31] border-white/10 text-slate-500'
                          }
                        `}
                      >
                        {done ? '✓' : i + 1}
                      </div>

                      <p
                        className={`
                          text-[10px] sm:text-[12px]
                          whitespace-nowrap
                          transition-colors
                          ${
                            active
                              ? 'text-white font-bold'
                              : done
                              ? 'text-[#16d9e3] font-semibold'
                              : 'text-slate-500 font-medium'
                          }
                        `}
                      >
                        {s.label}
                      </p>

                    </div>

                    {/* Connector */}
                    {i < STEPS.length - 1 && (
                      <div
                        className={`
                          flex-1 h-[2px]
                          mx-[7px] sm:mx-[12px]
                          rounded-full
                          transition-all duration-500
                          ${
                            done
                              ? 'bg-[#16d9e3] shadow-[0_0_7px_rgba(22,217,227,0.25)]'
                              : 'bg-white/10'
                          }
                        `}
                      />
                    )}

                  </div>
                );
              })}

            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className={`
          relative z-10
          ${maxWidth}
          mx-auto
          w-full
          px-4 sm:px-6
          py-6 sm:py-8
          flex-1
        `}
      >

        {/* Back + Title */}
        {(showBack || title) && (
          <div className="flex items-center gap-3 mb-5 sm:mb-6">

            {showBack && (
              <button
                type="button"
                onClick={() =>
                  backTo ? navigate(backTo) : navigate(-1)
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-3
                  py-2
                  rounded-xl
                  border
                  border-white/10
                  bg-[#071b31]/80
                  text-[#8ef8ff]
                  text-[13px]
                  font-semibold
                  hover:border-[#16d9e3]/40
                  hover:bg-[#0a223c]
                  transition-all
                "
              >
                ← Back
              </button>
            )}

            {title && (
              <h2 className="font-bold text-white text-[20px]">
                {title}
              </h2>
            )}

          </div>
        )}

        {/* Page Content */}
        {children}

      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="relative z-10 border-t border-white/5 bg-[#020f20]/70">

        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">

          <p className="text-[11px] text-slate-600">
            HospitalFlow • Smart OPD Coordination
          </p>

          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16d9e3]" />
            Secure Patient Portal
          </div>

        </div>

      </footer>

    </div>
  );
}