import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import type { DoctorStatus } from '../../types';
import {
  isTenDigitPhone,
  isValidEmail,
} from '../../utils/validation';

const statusOptions: DoctorStatus[] = [
  'Available',
  'Busy',
  'On Break',
  'Offline',
];

const inputClass =
  'bg-white border border-[#d8e1ec] rounded-[10px] px-[14px] py-[11px] text-[14px] text-[#142033] placeholder:text-[#afc0d3] outline-none focus:border-[#155ead] transition-colors w-full';

interface BackendDepartment {
  id: number;
  name: string;
  head?: string | null;
  rooms?: number | null;
  status?: string;
  hospital?: {
    id?: number;
    name?: string;
  } | null;
}

interface BackendDoctor {
  id: number;
  name: string;
  specialization: string;
  qualification?: string | null;
  experience?: string | null;
  status: DoctorStatus;
  consultationTime?: string | null;
  email?: string | null;

  hospital?: {
    id?: number;
    name?: string;
  } | null;

  department?: {
    id?: number;
    name?: string;
  } | null;
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label className="font-semibold text-[#142033] text-[13px]">
        {label}

        {required && (
          <span className="text-[#c53a45] ml-[2px]">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

export default function EditDoctorPage() {
  const { doctorId } = useParams<{
    doctorId: string;
  }>();

  const navigate = useNavigate();

  const [doctor, setDoctor] =
    useState<BackendDoctor | null>(null);

  const [departments, setDepartments] =
    useState<BackendDepartment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    specialization: '',
    departmentId: '',
    status: 'Available' as DoctorStatus,
    shift: '',
    room: '',
    phone: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [saveError, setSaveError] =
    useState<string | null>(null);

  const [submitted, setSubmitted] =
    useState(false);

  /*
   * ==========================================
   * LOAD DOCTOR + DEPARTMENTS
   * ==========================================
   */

  useEffect(() => {
    const numericDoctorId =
      Number(doctorId);

    if (
      !doctorId ||
      !Number.isInteger(numericDoctorId) ||
      numericDoctorId < 1
    ) {
      setLoadError(
        'The doctor ID is invalid.'
      );

      setLoading(false);

      return;
    }

    const controller =
      new AbortController();

    async function loadData() {
      try {
        setLoading(true);
        setLoadError(null);

        const [
          doctorResponse,
          departmentResponse,
        ] = await Promise.all([
          fetch(
            `/api/doctors/${numericDoctorId}`,
            {
              signal:
                controller.signal,
            }
          ),

          fetch(
            '/api/departments',
            {
              signal:
                controller.signal,
            }
          ),
        ]);

        if (!doctorResponse.ok) {
          throw new Error(
            doctorResponse.status === 404
              ? 'Doctor not found.'
              : `Unable to load doctor (${doctorResponse.status})`
          );
        }

        if (!departmentResponse.ok) {
          throw new Error(
            `Unable to load departments (${departmentResponse.status})`
          );
        }

        const doctorData =
          (await doctorResponse.json()) as BackendDoctor;

        const departmentData =
          (await departmentResponse.json()) as BackendDepartment[];

        setDoctor(doctorData);

        setDepartments(
          Array.isArray(departmentData)
            ? departmentData
            : []
        );

        /*
         * IMPORTANT:
         *
         * Use the REAL department.id
         * from backend.
         */
        setForm({
          name:
            doctorData.name ?? '',

          specialization:
            doctorData.specialization ?? '',

          departmentId:
            doctorData.department?.id
              ? String(
                  doctorData.department.id
                )
              : '',

          status:
            doctorData.status ??
            'Available',

          shift:
            doctorData.consultationTime ??
            '',

          room: '',

          phone: '',

          email: doctorData.email ?? '',
          password: '',
        });

      } catch (fetchError) {

        if (
          fetchError instanceof DOMException &&
          fetchError.name === 'AbortError'
        ) {
          return;
        }

        setLoadError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Unable to load doctor.'
        );

      } finally {

        if (!controller.signal.aborted) {
          setLoading(false);
        }

      }
    }

    void loadData();

    return () =>
      controller.abort();

  }, [doctorId]);

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <AdminLayout title="Edit Doctor">

        <div className="flex items-center justify-center py-[80px]">

          <p className="font-normal text-[#526176] text-[14px]">
            Loading doctor...
          </p>

        </div>

      </AdminLayout>
    );
  }

  /*
   * ==========================================
   * LOAD ERROR
   * ==========================================
   */

  if (loadError || !doctor) {
    return (
      <AdminLayout title="Edit Doctor">

        <div className="flex flex-col items-center justify-center py-[80px] gap-[12px]">

          <p className="font-bold text-[#142033] text-[18px]">
            {loadError ??
              'Doctor could not be loaded.'}
          </p>

          <Button
            variant="secondary"
            onClick={() =>
              navigate('/admin/doctors')
            }
          >
            Back to Doctor Management
          </Button>

        </div>

      </AdminLayout>
    );
  }

  /*
   * ==========================================
   * FIELD HANDLER
   * ==========================================
   */

  const set =
    (field: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement |
        HTMLSelectElement
      >
    ) => {

      const value =
        e.target.value;

      setForm((current) => ({
        ...current,
        [field]: value,
      }));

      setErrors((current) => ({
        ...current,
        [field]: current[field]
          ? validateField(
              field,
              value
            )
          : '',
      }));
    };

  /*
   * ==========================================
   * VALIDATION
   * ==========================================
   */

  const validateField = (
    field: keyof typeof form,
    value: string
  ): string => {

    if (
      [
        'name',
        'specialization',
      ].includes(field) &&
      !value.trim()
    ) {
      return `${
        field === 'name'
          ? 'Full name'
          : 'Specialization'
      } is required`;
    }

    if (
      field === 'departmentId' &&
      !value
    ) {
      return 'Department is required';
    }

    if (
      field === 'phone' &&
      value.trim() &&
      !isTenDigitPhone(value)
    ) {
      return 'Phone number must be exactly 10 digits';
    }

    if (
      field === 'email' &&
      value.trim() &&
      !isValidEmail(value)
    ) {
      return 'Enter a valid email address';
    }

    return '';
  };

  const validate = (): boolean => {

    const nextErrors: Record<
      string,
      string
    > = {};

    (
      Object.keys(form) as (
        keyof typeof form
      )[]
    ).forEach((field) => {

      const message =
        validateField(
          field,
          form[field]
        );

      if (message) {
        nextErrors[field] = message;
      }

    });

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  };

  /*
   * ==========================================
   * SAVE DOCTOR
   * ==========================================
   */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {

      setSaveError(null);

      const response =
        await fetch(
          `/api/doctors/${doctor.id}`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              id: doctor.id,

              name:
                form.name.trim(),

              specialization:
                form.specialization.trim(),

              qualification:
                doctor.qualification,

              experience:
                doctor.experience,

              status:
                form.status,

              consultationTime:
                form.shift.trim(),

              hospital:
                doctor.hospital
                  ? {
                      id:
                        doctor.hospital.id,
                    }
                  : undefined,

              /*
               * REAL DEPARTMENT RELATION
               */
              department: {
                id: Number(
                  form.departmentId
                ),
              },

              email: form.email.trim(),
              ...(form.password.trim()
                ? { passwordHash: form.password }
                : {}),
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          `Unable to save doctor (${response.status})`
        );
      }

      /*
       * Show success screen
       */
      setSubmitted(true);

      setTimeout(() => {
        navigate(
          '/admin/doctors'
        );
      }, 1500);

    } catch (updateError) {

      setSaveError(
        updateError instanceof Error
          ? updateError.message
          : 'Unable to save doctor.'
      );

    }
  };

  /*
   * ==========================================
   * SUCCESS
   * ==========================================
   */

  if (submitted) {
    return (
      <AdminLayout title="Edit Doctor">

        <div className="flex flex-col items-center justify-center py-[80px] gap-[16px]">

          <div className="bg-[#e8f7f1] size-[64px] rounded-[999px] flex items-center justify-center">

            <span className="text-[#18865b] text-[28px]">
              ✓
            </span>

          </div>

          <p className="font-bold text-[#142033] text-[20px]">
            Changes Saved
          </p>

          <p className="font-normal text-[#526176] text-[14px]">
            Redirecting to Doctor Management…
          </p>

        </div>

      </AdminLayout>
    );
  }

  /*
   * ==========================================
   * PAGE
   * ==========================================
   */

  return (
    <AdminLayout title="Edit Doctor">

      {/* BACK */}

      <button
        onClick={() =>
          navigate('/admin/doctors')
        }
        className="flex items-center gap-[8px] text-[#155ead] text-[13px] font-semibold mb-[24px] cursor-pointer hover:opacity-80 transition-opacity"
      >
        ← Back to Doctor Management
      </button>

      <div className="max-w-[720px]">

        {/* DOCTOR HEADER */}

        <div className="flex items-start gap-[16px] mb-[24px]">

          <div className="bg-[#eaf3fd] flex items-center justify-center rounded-[999px] size-[52px] shrink-0">

            <p className="font-bold text-[#155ead] text-[18px]">
              {doctor.name
                .replace('Dr. ', '')
                .split(' ')
                .map(
                  (word) =>
                    word[0]
                )
                .join('')
                .slice(0, 2)}
            </p>

          </div>

          <div>

            <h1 className="font-bold text-[#142033] text-[24px] leading-tight">
              {doctor.name}
            </h1>

            <div className="flex items-center gap-[10px] mt-[6px]">

              <p className="font-normal text-[#526176] text-[14px]">
                {doctor.specialization}
              </p>

              <StatusBadge
                status={
                  doctor.status
                }
              />

            </div>

          </div>

        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit}>

          {saveError && (
            <div className="mb-[16px] bg-[#fef3f2] border border-[#f4c7cb] text-[#c53a45] px-[16px] py-[12px] rounded-[10px] text-[13px] font-semibold">
              {saveError}
            </div>
          )}

          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[28px] flex flex-col gap-[20px]">

            {/* =========================
                PERSONAL INFORMATION
            ========================== */}

            <div className="flex items-center gap-[10px] pb-[16px] border-b border-[#d8e1ec]">

              <div className="bg-[#2475d0] h-[20px] rounded-[2px] shrink-0 w-[4px]" />

              <p className="font-bold text-[#142033] text-[15px]">
                Personal Information
              </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">

              {/* NAME */}

              <Field
                label="Full Name"
                required
              >

                <input
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Dr. Full Name"
                  className={inputClass}
                />

                {errors.name && (
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.name}
                  </p>
                )}

              </Field>

              {/* SPECIALIZATION */}

              <Field
                label="Specialization"
                required
              >

                <input
                  value={
                    form.specialization
                  }
                  onChange={set(
                    'specialization'
                  )}
                  placeholder="Specialization"
                  className={inputClass}
                />

                {errors.specialization && (
                  <p className="text-[#c53a45] text-[12px]">
                    {
                      errors.specialization
                    }
                  </p>
                )}

              </Field>

              {/* PHONE */}

              <Field label="Phone">

                <input
                  id="edit-doctor-phone"
                  value={form.phone}
                  onChange={set('phone')}
                  onBlur={() =>
                    setErrors(
                      (current) => ({
                        ...current,
                        phone:
                          validateField(
                            'phone',
                            form.phone
                          ),
                      })
                    )
                  }
                  aria-invalid={Boolean(
                    errors.phone
                  )}
                  placeholder="+91 …"
                  className={inputClass}
                />

                {errors.phone && (
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.phone}
                  </p>
                )}

              </Field>

              {/* EMAIL */}

              <Field label="Email">

                <input
                  id="edit-doctor-email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  onBlur={() =>
                    setErrors(
                      (current) => ({
                        ...current,
                        email:
                          validateField(
                            'email',
                            form.email
                          ),
                      })
                    )
                  }
                  aria-invalid={Boolean(
                    errors.email
                  )}
                  placeholder="doctor@hospitalflow.in"
                  className={inputClass}
                />

                {errors.email && (
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.email}
                  </p>
                )}

              </Field>

              <Field label="New Login Password">
                <input
                  id="edit-doctor-password"
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Leave blank to keep current password"
                  className={inputClass}
                />
              </Field>

            </div>

            {/* =========================
                ASSIGNMENT
            ========================== */}

            <div className="flex items-center gap-[10px] py-[16px] border-y border-[#d8e1ec]">

              <div className="bg-[#18865b] h-[20px] rounded-[2px] shrink-0 w-[4px]" />

              <p className="font-bold text-[#142033] text-[15px]">
                Assignment
              </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">

              {/* DEPARTMENT */}

              <Field
                label="Department"
                required
              >

                <select
                  value={
                    form.departmentId
                  }
                  onChange={set(
                    'departmentId'
                  )}
                  className={inputClass}
                >

                  <option value="">
                    Select Department
                  </option>

                  {departments.map(
                    (department) => (
                      <option
                        key={
                          department.id
                        }
                        value={
                          department.id
                        }
                      >
                        {
                          department.name
                        }
                      </option>
                    )
                  )}

                </select>

                {errors.departmentId && (
                  <p className="text-[#c53a45] text-[12px]">
                    {
                      errors.departmentId
                    }
                  </p>
                )}

              </Field>

              {/* STATUS */}

              <Field label="Status">

                <select
                  value={form.status}
                  onChange={set('status')}
                  className={inputClass}
                >

                  {statusOptions.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}

                </select>

              </Field>

              {/* SHIFT */}

              <Field label="Shift Hours">

                <input
                  value={form.shift}
                  onChange={set('shift')}
                  placeholder="08:00 – 16:00"
                  className={inputClass}
                />

              </Field>

              {/* ROOM */}

              <Field label="Room">

                <input
                  value={form.room}
                  onChange={set('room')}
                  placeholder="Room 302"
                  className={inputClass}
                />

              </Field>

            </div>

          </div>

          {/* BUTTONS */}

          <div className="flex gap-[12px] mt-[20px]">

            <Button
              variant="primary"
              type="submit"
              className="px-[28px]"
            >
              Save Changes
            </Button>

            <Button
              variant="ghost"
              type="button"
              onClick={() =>
                navigate(
                  '/admin/doctors'
                )
              }
            >
              Cancel
            </Button>

          </div>

        </form>

      </div>

    </AdminLayout>
  );
}