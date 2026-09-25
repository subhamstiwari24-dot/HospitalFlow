import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/PatientLayout';
import Button from '../../components/Button';
import { usePatient } from '../../context/PatientContext';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDeptSelect } from '../../components/Skeleton';
import EmptyState, { EmptyIcons, ErrorState } from '../../components/EmptyState';

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
  Gastroenterology: '🔬',
  Endocrinology: '⚗️',
  Psychiatry: '🧘',
};

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
};

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

  /*
   * If patient reaches this page without
   * selecting a hospital, send them back.
   */
  useEffect(() => {
    if (!selectedHospital) {
      navigate('/patient/hospital', { replace: true });
    }
  }, [selectedHospital, navigate]);

  /*
   * Load doctors from Spring Boot.
   *
   * Departments are derived from doctor.specialization
   * because the current backend does not have a separate
   * Department entity.
   */
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
         * Keep only doctors belonging to
         * the currently selected hospital.
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

  /*
   * Build departments from doctor specializations.
   */
  const departments = useMemo(() => {
    const departmentMap = new Map<
      string,
      {
        name: string;
        doctors: BackendDoctor[];
      }
    >();

    doctors.forEach((doctor) => {
      const specialization = doctor.specialization?.trim();

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

  /*
   * Select department
   */
  const handleSelect = (department: string) => {
    setSelectedDepartment(department);

    /*
     * Reset doctor and slot whenever
     * department changes.
     */
    setSelectedDoctor(null);
    setSelectedSlot(null);
  };

  if (!selectedHospital) {
    return null;
  }

  if (pageLoading) {
    return (
      <PatientLayout
        step={1}
        backTo="/patient/hospital"
        title=""
        maxWidth="max-w-[860px]"
      >
        <SkDeptSelect />
      </PatientLayout>
    );
  }

  return (
    <PatientLayout
      step={1}
      backTo="/patient/hospital"
      title=""
      maxWidth="max-w-[860px]"
    >
      {/* HEADER */}
      <div className="mb-[24px]">
        <div className="flex items-center gap-[8px] mb-[6px]">
          <p className="font-normal text-[#7b899c] text-[13px]">
            {selectedHospital.name}
          </p>

          <span className="text-[#d8e1ec]">›</span>

          <p className="font-semibold text-[#142033] text-[13px]">
            Select Department
          </p>
        </div>

        <h1 className="font-bold text-[#142033] text-[24px]">
          Choose a Department
        </h1>

        <p className="font-normal text-[#526176] text-[14px] mt-[4px]">
          {departments.length} department
          {departments.length !== 1 ? 's' : ''} available at{' '}
          {selectedHospital.name}
        </p>
      </div>

      {error && !loadingDoctors && (
        <ErrorState
          description={error}
          onRetry={() => setRetryKey((key) => key + 1)}
        />
      )}

      {/* LOADING */}
      {loadingDoctors && (
        <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[24px] text-center mb-[28px]">
          <p className="text-[#526176] text-[14px]">
            Loading departments...
          </p>
        </div>
      )}

      {/* DEPARTMENTS */}
      {!loadingDoctors && !error && (
        <>
          {departments.length === 0 ? (
            <EmptyState
              icon={EmptyIcons.grid(28)}
              title="No departments available"
              description="No doctors or departments are currently listed for this hospital."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] mb-[28px]">
              {departments.map((department) => {
                const doctorCount = department.doctors.length;

                const available = department.doctors.filter(
                  (doctor) =>
                    doctor.status?.toLowerCase() === 'available'
                ).length;

                const isSelected =
                  selectedDepartment === department.name;

                return (
                  <div
                    key={department.name}
                    onClick={() =>
                      handleSelect(department.name)
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleSelect(department.name);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`bg-white border rounded-[14px] p-[18px] cursor-pointer transition-[border-color,box-shadow,transform] focus-visible:outline-2 focus-visible:outline-[#2475d0] focus-visible:outline-offset-2 active:translate-y-px ${
                      isSelected
                        ? 'border-[#155ead] shadow-[0px_0px_0px_3px_rgba(21,94,173,0.12)]'
                        : 'border-[#d8e1ec] hover:border-[#afc0d3] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]'
                    }`}
                  >
                    <div className="flex items-start gap-[14px]">
                      {/* ICON */}
                      <div
                        className={`size-[44px] rounded-[12px] flex items-center justify-center shrink-0 text-[20px] ${
                          isSelected
                            ? 'bg-[#eaf3fd]'
                            : 'bg-[#f4f7fb]'
                        }`}
                      >
                        {deptIcons[department.name] ?? '🏥'}
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-[8px] mb-[4px]">
                          <p
                            className={`font-bold text-[14px] ${
                              isSelected
                                ? 'text-[#155ead]'
                                : 'text-[#142033]'
                            }`}
                          >
                            {department.name}
                          </p>

                          {isSelected && (
                            <div className="size-[18px] rounded-[999px] bg-[#155ead] flex items-center justify-center shrink-0">
                              <span className="text-white text-[10px] font-bold">
                                ✓
                              </span>
                            </div>
                          )}
                        </div>

                        <p className="font-normal text-[#7b899c] text-[11px] leading-tight mb-[10px]">
                          {deptDesc[department.name] ??
                            'Specialist consultations available'}
                        </p>

                        <div className="flex items-center gap-[10px]">
                          <span
                            className={`text-[11px] font-semibold px-[8px] py-[3px] rounded-[999px] ${
                              available > 0
                                ? 'bg-[#e8f7f1] text-[#18865b]'
                                : 'bg-[#f4f7fb] text-[#7b899c]'
                            }`}
                          >
                            {available > 0
                              ? `${available} available`
                              : 'No doctor available'}
                          </span>

                          <p className="font-normal text-[#7b899c] text-[11px]">
                            {doctorCount} doctor
                            {doctorCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* CTA */}
      <Button
        variant="primary"
        onClick={() => navigate('/patient/doctor')}
        disabled={!selectedDepartment}
        className="px-[28px] py-[12px] text-[14px]"
      >
        Select Doctor →
      </Button>
    </PatientLayout>
  );
}