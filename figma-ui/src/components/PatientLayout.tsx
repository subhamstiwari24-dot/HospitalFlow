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
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-[#d8e1ec] sticky top-0 z-10">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-[56px] sm:h-[60px] flex items-center justify-between">
          <button
            onClick={() => navigate('/patient')}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img src="/assets/logo.png" alt="HospitalFlow" className="h-7 sm:h-8 w-auto object-contain" />
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            <p className="hidden sm:block font-normal text-[#7b899c] text-[12px]">Patient Portal</p>
            <button
              onClick={() => navigate('/login')}
              className="font-semibold text-[#155ead] text-[12px] cursor-pointer hover:opacity-80"
            >
              Staff Login →
            </button>
          </div>
        </div>

        {/* Stepper */}
        {step !== undefined && (
          <div className="border-t border-[#f4f7fb] bg-white overflow-x-auto">
            <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-[10px] flex items-center gap-0 min-w-[380px]">
              {STEPS.map((s, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <div key={s.label} className="flex items-center flex-1 last:flex-none">
                    <div className="flex items-center gap-[5px] sm:gap-[8px]">
                      <div
                        className={`size-[20px] sm:size-[22px] rounded-[999px] flex items-center justify-center text-[10px] sm:text-[11px] font-bold shrink-0 ${
                          done
                            ? 'bg-[#18865b] text-white'
                            : active
                            ? 'bg-[#155ead] text-white'
                            : 'bg-[#d8e1ec] text-[#7b899c]'
                        }`}
                      >
                        {done ? '✓' : i + 1}
                      </div>
                      <p
                        className={`text-[10px] sm:text-[12px] font-${active ? 'bold' : 'medium'} whitespace-nowrap ${
                          active ? 'text-[#142033]' : done ? 'text-[#18865b]' : 'text-[#7b899c]'
                        }`}
                      >
                        {s.label}
                      </p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-[2px] mx-[6px] sm:mx-[10px] rounded-full ${done ? 'bg-[#18865b]' : 'bg-[#d8e1ec]'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`${maxWidth} mx-auto w-full px-4 sm:px-6 py-5 sm:py-[32px] flex-1`}>
        {(showBack || title) && (
          <div className="flex items-center gap-[12px] mb-[20px] sm:mb-[24px]">
            {showBack && (
              <button
                onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
                className="text-[#155ead] text-[13px] font-semibold cursor-pointer hover:opacity-80 transition-opacity shrink-0"
              >
                ← Back
              </button>
            )}
            {title && <h2 className="font-bold text-[#142033] text-[20px]">{title}</h2>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
