import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PatientLayout from '../../components/PatientLayout';
import { usePatient } from '../../context/PatientContext';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDeptSelect } from '../../components/Skeleton';
import { ErrorState } from '../../components/EmptyState';

type BackendDoctor = {
  id: number;
  name: string;
  specialization: string;
  qualification?: string;
  experience?: number;
  status?: string;
  consultationTime?: number;
  hospital?: {
    id: number;
    name: string;
  };
};

/* =====================================================
   DEPARTMENT ICONS
===================================================== */

const deptIcons: Record<string, string> = {
  'General Medicine': '🩺',
  Cardiology: '❤️',
  Orthopaedics: '🦴',
  Orthopedics: '🦴',
  Paediatrics: '👶',
  Pediatrics: '👶',
  Dermatology: '🧴',
  Neurology: '🧠',
  Gynaecology: '🌸',
  Gynecology: '🌸',
  ENT: '👂',
  Ophthalmology: '👁️',
  Dental: '🦷',
  Oncology: '🔬',
  Urology: '💊',
  Nephrology: '💉',
  Gastroenterology: '🧬',
  Endocrinology: '⚗️',
  Psychiatry: '🧘',
};

/* =====================================================
   DEPARTMENT DESCRIPTIONS
===================================================== */

const deptDesc: Record<string, string> = {
  'General Medicine':
    'Fever, infections, chronic diseases & general health',

  Cardiology:
    'Heart conditions, BP management, ECG & echo',

  Orthopaedics:
    'Bone, joint, spine & sports injuries',

  Orthopedics:
    'Bone, joint, spine & sports injuries',

  Paediatrics:
    "Children's health from newborn to 18 years",

  Pediatrics:
    "Children's health from newborn to 18 years",

  Dermatology:
    'Skin, hair & nail conditions',

  Neurology:
    'Brain, spine & nervous system disorders',

  Gynaecology:
    "Women's health, pregnancy & reproductive care",

  Gynecology:
    "Women's health, pregnancy & reproductive care",

  ENT:
    'Ear, nose & throat conditions',

  Ophthalmology:
    'Eye care & vision problems',

  Dental:
    'Teeth, gums & oral health',

  Oncology:
    'Cancer diagnosis, treatment & specialist care',

  Urology:
    'Urinary tract & kidney-related conditions',

  Nephrology:
    'Kidney health, dialysis & related conditions',

  Gastroenterology:
    'Digestive system, liver & gastrointestinal care',

  Endocrinology:
    'Hormones, diabetes & metabolic conditions',

  Psychiatry:
    'Mental health, emotional & behavioural care',
};

/* =====================================================
   PAGE
===================================================== */

export default function SelectDepartmentPage() {
  const navigate = useNavigate();

  const {
    selectedHospital,
    selectedDepartment,
    setSelectedDepartment,
    setSelectedDoctor,
    setSelectedSlot,
  } = usePatient();

  const [doctors, setDoctors] = useState<BackendDoctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const pageLoading = usePageLoad(400);

  const API_URL = '/api';

  /* =====================================================
     PROTECT ROUTE
  ===================================================== */

  useEffect(() => {
    if (!selectedHospital) {
      navigate('/patient/hospital', {
        replace: true,
      });
    }
  }, [selectedHospital, navigate]);

  /* =====================================================
     LOAD DOCTORS
  ===================================================== */

  useEffect(() => {
    if (!selectedHospital) return;

    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        setError('');

        const response = await fetch(`${API_URL}/doctors`);

        if (!response.ok) {
          throw new Error('Unable to load doctors');
        }

        const data: BackendDoctor[] = await response.json();

        /*
         * Only doctors belonging to
         * selected hospital.
         */
        const hospitalDoctors = data.filter(
          (doctor) =>
            doctor.hospital?.id === selectedHospital.id
        );

        setDoctors(hospitalDoctors);
      } catch (err) {
        console.error('Doctor loading error:', err);

        setError(
          'Unable to load departments from HospitalFlow backend.'
        );

        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, [selectedHospital, retryKey]);

  /* =====================================================
     BUILD DEPARTMENTS FROM SPECIALIZATIONS
  ===================================================== */

  const departments = useMemo(() => {
    const departmentMap = new Map<
      string,
      {
        name: string;
        doctors: BackendDoctor[];
      }
    >();

    doctors.forEach((doctor) => {
      const specialization =
        doctor.specialization?.trim();

      if (!specialization) return;

      if (!departmentMap.has(specialization)) {
        departmentMap.set(specialization, {
          name: specialization,
          doctors: [],
        });
      }

      departmentMap
        .get(specialization)!
        .doctors.push(doctor);
    });

    return Array.from(departmentMap.values());
  }, [doctors]);

  /* =====================================================
     SELECT DEPARTMENT
  ===================================================== */

  const handleSelect = (department: string) => {
    setSelectedDepartment(department);

    /*
     * Changing department means previous
     * doctor and slot are no longer valid.
     */
    setSelectedDoctor(null);
    setSelectedSlot(null);
  };

  /* =====================================================
     NO HOSPITAL
  ===================================================== */

  if (!selectedHospital) {
    return null;
  }

  /* =====================================================
     PAGE LOADING
  ===================================================== */

  if (pageLoading) {
    return (
      <PatientLayout
        step={1}
        backTo="/patient/hospital"
        showBack={true}
        maxWidth="max-w-[1050px]"
      >
        <SkDeptSelect />
      </PatientLayout>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <PatientLayout
      step={1}
      backTo="/patient/hospital"
      showBack={true}
      maxWidth="max-w-[1050px]"
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="relative mb-8 sm:mb-10">
        {/* Glow */}

        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-[80px]" />

        <div className="relative">
          {/* Breadcrumb */}

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500">
              {selectedHospital.name}
            </span>

            <span className="text-slate-700">
              /
            </span>

            <span className="text-[11px] font-semibold text-[#8ef8ff]">
              Department
            </span>
          </div>

          {/* Badge */}

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16d9e3] shadow-[0_0_8px_#16d9e3]" />

            <span className="text-[11px] font-semibold tracking-wide text-[#8ef8ff]">
              STEP 2 OF 5
            </span>
          </div>

          {/* Heading */}

          <h1 className="text-[30px] sm:text-[36px] font-bold leading-tight tracking-[-0.5px] text-white">
            Choose a Department
          </h1>

          <p className="mt-2 max-w-[650px] text-[13px] sm:text-[14px] text-slate-400">
            Select the medical department you need
            consultation from at{' '}
            <span className="font-semibold text-slate-300">
              {selectedHospital.name}
            </span>
            .
          </p>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && !loadingDoctors && (
        <div className="mb-6">
          <ErrorState
            description={error}
            onRetry={() =>
              setRetryKey((key) => key + 1)
            }
          />
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loadingDoctors && (
        <div className="rounded-[22px] border border-white/[0.08] bg-[#071b31]/90 p-10 text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-[#16d9e3]" />

          <p className="text-[13px] text-slate-400">
            Loading departments from HospitalFlow...
          </p>
        </div>
      )}

      {/* =================================================
          DEPARTMENTS
      ================================================= */}

      {!loadingDoctors && !error && (
        <>
          {/* Result information */}

          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-medium tracking-wide text-slate-500">
                AVAILABLE DEPARTMENTS
              </p>

              <p className="mt-1 text-[14px] font-semibold text-white">
                {departments.length}{' '}
                {departments.length === 1
                  ? 'department'
                  : 'departments'}{' '}
                available
              </p>
            </div>

            {selectedDepartment && (
              <div className="hidden items-center gap-2 text-[11px] font-medium text-[#8ef8ff] sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16d9e3] shadow-[0_0_8px_#16d9e3]" />

                Department selected
              </div>
            )}
          </div>

          {departments.length === 0 ? (
            /* =================================================
               EMPTY STATE
            ================================================= */

            <div className="rounded-[22px] border border-white/[0.08] bg-[#071b31]/90 px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.03] text-2xl">
                🏥
              </div>

              <h3 className="text-[16px] font-bold text-white">
                No departments available
              </h3>

              <p className="mx-auto mt-2 max-w-[420px] text-[12px] leading-relaxed text-slate-500">
                No doctors or departments are currently
                listed for this hospital.
              </p>
            </div>
          ) : (
            /* =================================================
               DEPARTMENT CARDS
            ================================================= */

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {departments.map((department) => {
                const doctorCount =
                  department.doctors.length;

                const availableCount =
                  department.doctors.filter(
                    (doctor) => {
                      const status =
                        doctor.status?.toLowerCase();

                      return (
                        status === 'available' ||
                        status === 'online' ||
                        status === 'active'
                      );
                    }
                  ).length;

                const isSelected =
                  selectedDepartment ===
                  department.name;

                const icon =
                  deptIcons[department.name] ?? '🏥';

                const description =
                  deptDesc[department.name] ??
                  'Specialist consultations available';

                return (
                  <div
                    key={department.name}
                    onClick={() =>
                      handleSelect(
                        department.name
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter' ||
                        event.key === ' '
                      ) {
                        event.preventDefault();

                        handleSelect(
                          department.name
                        );
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={
                      isSelected
                        ? `
                          group
                          relative
                          overflow-hidden
                          cursor-pointer
                          rounded-[22px]
                          border
                          border-[#16d9e3]/70
                          bg-[#0a243d]
                          p-5
                          sm:p-6
                          shadow-[0_0_0_1px_rgba(22,217,227,0.12),0_15px_45px_rgba(0,0,0,0.22),0_0_35px_rgba(22,217,227,0.07)]
                          transition-all
                          duration-300
                          focus-visible:outline-none
                        `
                        : `
                          group
                          relative
                          overflow-hidden
                          cursor-pointer
                          rounded-[22px]
                          border
                          border-white/[0.08]
                          bg-[#071b31]/90
                          p-5
                          sm:p-6
                          shadow-[0_15px_40px_rgba(0,0,0,0.12)]
                          transition-all
                          duration-300
                          hover:-translate-y-[2px]
                          hover:border-[#16d9e3]/30
                          hover:bg-[#092039]
                          hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)]
                          focus-visible:outline-none
                        `
                    }
                  >
                    {/* Selected glow */}

                    {isSelected && (
                      <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-[#16d9e3]/10 blur-[55px]" />
                    )}

                    {/* Card content */}

                    <div className="relative">
                      {/* Top row */}

                      <div className="flex items-start justify-between gap-4">
                        {/* Icon */}

                        <div
                          className={
                            isSelected
                              ? 'flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[17px] border border-[#16d9e3]/30 bg-[#16d9e3]/10 text-[24px] shadow-[0_0_22px_rgba(22,217,227,0.10)]'
                              : 'flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[17px] border border-white/[0.07] bg-[#0b2742] text-[24px] transition-all group-hover:border-[#16d9e3]/20'
                          }
                        >
                          {icon}
                        </div>

                        {/* Selection */}

                        <div
                          className={
                            isSelected
                              ? 'flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-[#16d9e3] bg-[#16d9e3] shadow-[0_0_16px_rgba(22,217,227,0.35)]'
                              : 'flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.02] group-hover:border-[#16d9e3]/40'
                          }
                        >
                          {isSelected && (
                            <span className="text-[12px] font-black text-[#031326]">
                              ✓
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Department name */}

                      <div className="mt-5">
                        <h2
                          className={
                            isSelected
                              ? 'text-[17px] font-bold text-[#8ef8ff]'
                              : 'text-[17px] font-bold text-white'
                          }
                        >
                          {department.name}
                        </h2>

                        <p className="mt-2 min-h-[36px] text-[12px] leading-relaxed text-slate-500">
                          {description}
                        </p>
                      </div>

                      {/* Divider */}

                      <div className="my-5 h-px bg-white/[0.06]" />

                      {/* Stats */}

                      <div className="flex items-center justify-between gap-3">
                        {/* Doctors */}

                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-slate-600">
                            Specialists
                          </p>

                          <p className="mt-1 text-[13px] font-semibold text-slate-300">
                            {doctorCount}{' '}
                            {doctorCount === 1
                              ? 'Doctor'
                              : 'Doctors'}
                          </p>
                        </div>

                        {/* Availability */}

                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wide text-slate-600">
                            Availability
                          </p>

                          {availableCount > 0 ? (
                            <p className="mt-1 flex items-center justify-end gap-1.5 text-[12px] font-semibold text-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              {availableCount} Available
                            </p>
                          ) : (
                            <p className="mt-1 text-[12px] font-medium text-slate-500">
                              Check doctors
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Selected footer */}

                      {isSelected && (
                        <div className="mt-5 flex items-center justify-between rounded-[10px] border border-[#16d9e3]/10 bg-[#16d9e3]/[0.04] px-3 py-2.5">
                          <span className="text-[10px] font-semibold text-[#8ef8ff]">
                            ✓ Department selected
                          </span>

                          <span className="text-[10px] text-slate-500">
                            Continue below
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* =================================================
              BOTTOM CTA
          ================================================= */}

          {departments.length > 0 && (
            <div className="sticky bottom-4 z-10 rounded-[18px] border border-white/[0.08] bg-[#06182b]/95 p-3 sm:p-3.5 shadow-[0_15px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                {/* Selected department */}

                <div className="hidden min-w-0 sm:block">
                  <p className="text-[10px] text-slate-500">
                    Selected department
                  </p>

                  <p className="mt-0.5 max-w-[320px] truncate text-[12px] font-semibold text-white">
                    {selectedDepartment ??
                      'Please select a department'}
                  </p>
                </div>

                {/* Continue */}

                <button
                  type="button"
                  onClick={() =>
                    navigate('/patient/doctor')
                  }
                  disabled={!selectedDepartment}
                  className="ml-auto rounded-[12px] bg-[#16d9e3] px-6 py-3 text-[12px] font-bold text-[#031326] shadow-[0_0_20px_rgba(22,217,227,0.16)] transition-all hover:bg-[#5deaf0] hover:shadow-[0_0_28px_rgba(22,217,227,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none sm:px-7 sm:text-[13px]"
                >
                  Continue to Doctor →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </PatientLayout>
  );
}