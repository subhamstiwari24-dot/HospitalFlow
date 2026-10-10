
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
    <div className="patient-shell relative flex min-h-screen flex-col overflow-hidden bg-[#F3F6FB] text-[#17243A]">

      {/* TOP NAVIGATION */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0B1F3A]">
        <div className="mx-auto flex h-[60px] max-w-[1100px] items-center justify-between px-4 sm:h-[68px] sm:px-6">

          <button
            type="button"
            onClick={() => navigate('/patient')}
            className="transition-opacity hover:opacity-80"
            aria-label="Go to patient home"
          >
            <img
              src="/assets/logo.png"
              alt="HospitalFlow"
              className="h-7 w-auto object-contain sm:h-9"
            />
          </button>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#69C3C5]" />
              <p className="text-[12px] font-medium text-slate-200">
                Patient Portal
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-[12px] font-semibold text-[#A8DCDD] transition-colors hover:text-white"
            >
              Staff Login →
            </button>
          </div>
        </div>

        {/* BOOKING STEPPER */}
        {step !== undefined && (
          <div className="overflow-x-auto border-t border-white/10 bg-[#102744]">
            <div className="mx-auto flex min-w-[520px] max-w-[1100px] items-center px-4 py-3 sm:px-6">
              {STEPS.map((item, index) => {
                const done = index < step;
                const active = index === step;

                return (
                  <div
                    key={item.label}
                    className="flex flex-1 items-center last:flex-none"
                  >
                    <div className="flex shrink-0 items-center gap-2">
                      <div
                        className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border text-[10px] font-bold transition-colors sm:h-6 sm:w-6 sm:text-[11px] ${
                          done
                            ? 'border-[#0F7375] bg-[#0F7375] text-white'
                            : active
                              ? 'border-[#70BFC1] bg-[#DCEFF0] text-[#0B4F53]'
                              : 'border-slate-500/40 bg-[#18324F] text-slate-300'
                        }`}
                      >
                        {done ? '✓' : index + 1}
                      </div>

                      <p
                        className={`whitespace-nowrap text-[10px] transition-colors sm:text-[12px] ${
                          active
                            ? 'font-bold text-white'
                            : done
                              ? 'font-semibold text-[#A8DCDD]'
                              : 'font-medium text-slate-300'
                        }`}
                      >
                        {item.label}
                      </p>
                    </div>

                    {index < STEPS.length - 1 && (
                      <div
                        className={`mx-[7px] h-[2px] flex-1 rounded-full sm:mx-3 ${
                          done ? 'bg-[#70BFC1]' : 'bg-slate-500/30'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* PAGE CONTENT */}
      <main className={`relative z-10 mx-auto w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 ${maxWidth}`}>
        {(showBack || title) && (
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            {showBack && (
              <button
                type="button"
                onClick={() => backTo ? navigate(backTo) : navigate(-1)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#D8E2EE] bg-white px-3 py-2 text-[13px] font-semibold text-[#31516D] transition-colors hover:border-[#9ABBCB] hover:bg-[#F8FAFD]"
              >
                ← Back
              </button>
            )}

            {title && (
              <h2 className="text-[20px] font-bold text-[#17243A]">
                {title}
              </h2>
            )}
          </div>
        )}

        {children}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[#E0E7F0] bg-white">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6">
          <p className="text-[11px] text-slate-500">
            HospitalFlow • Smart OPD Coordination
          </p>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0F7375]" />
            Secure Patient Portal
          </div>
        </div>
      </footer>
    </div>
  );
}
