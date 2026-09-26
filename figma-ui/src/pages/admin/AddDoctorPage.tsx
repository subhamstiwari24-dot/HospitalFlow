import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import type { DoctorStatus } from '../../types';
import { isTenDigitPhone, isValidEmail } from '../../utils/validation';

const statusOptions: DoctorStatus[] = [
  'Available',
  'Busy',
  'On Break',
  'Offline',
];

interface Department {
  id: number;
  name: string;
  status: 'Active' | 'Inactive';
}

interface FormState {
  name: string;
  specialization: string;
  department: string;
  status: DoctorStatus;
  shift: string;
  room: string;
  phone: string;
  email: string;
}

const emptyForm: FormState = {
  name: '',
  specialization: '',
  department: '',
  status: 'Available',
  shift: '',
  room: '',
  phone: '',
  email: '',
};

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
        {label}{' '}
        {required && (
          <span className="text-[#c53a45]">*</span>
        )}
      </label>

      {children}
    </div>
  );
}

const inputClass =
  'bg-white border border-[#d8e1ec] rounded-[10px] px-[14px] py-[11px] text-[14px] text-[#142033] placeholder:text-[#afc0d3] outline-none focus:border-[#155ead] transition-colors w-full';

export default function AddDoctorPage() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [errors, setErrors] =
    useState<Partial<FormState>>({});

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [loadingDepartments, setLoadingDepartments] =
    useState(true);

  const [departmentError, setDepartmentError] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [submitted, setSubmitted] =
    useState(false);

  /*
   * Load real departments from backend.
   */
  useEffect(() => {
    const controller = new AbortController();

    async function loadDepartments() {
      try {
        setLoadingDepartments(true);
        setDepartmentError(null);

        const response = await fetch(
          '/api/departments',
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Unable to load departments (${response.status})`
          );
        }

        const data: unknown =
          await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            'Invalid department response.'
          );
        }

        const activeDepartments =
          (data as Department[]).filter(
            (department) =>
              department.status === 'Active'
          );

        setDepartments(activeDepartments);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return;
        }

        setDepartmentError(
          error instanceof Error
            ? error.message
            : 'Unable to load departments.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingDepartments(false);
        }
      }
    }

    void loadDepartments();

    return () => controller.abort();
  }, []);

  const set =
    (field: keyof FormState) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement
      >
    ) => {
      const value = event.target.value;

      setForm((current) => ({
        ...current,
        [field]: value,
      }));

      setErrors((current) => ({
        ...current,
        [field]: current[field]
          ? validateField(field, value)
          : '',
      }));
    };

  const validateField = (
    field: keyof FormState,
    value: string
  ): string => {
    if (
      [
        'name',
        'specialization',
        'department',
        'shift',
        'room',
      ].includes(field) &&
      !value.trim()
    ) {
      return `${
        field === 'name'
          ? 'Full name'
          : field.charAt(0).toUpperCase() +
            field.slice(1)
      } is required`;
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
    const validationErrors: Partial<FormState> =
      {};

    (
      Object.keys(form) as (keyof FormState)[]
    ).forEach((field) => {
      const message = validateField(
        field,
        form[field]
      );

      if (message) {
        validationErrors[field] = message;
      }
    });

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      /*
       * Find selected department by ID.
       */
      const selectedDepartment =
        departments.find(
          (department) =>
            String(department.id) ===
            form.department
        );

      if (!selectedDepartment) {
        setErrors((current) => ({
          ...current,
          department:
            'Please select a valid department',
        }));

        return;
      }

      /*
       * Create doctor in backend.
       */
      const response = await fetch(
        '/api/doctors',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name.startsWith('Dr.')
              ? form.name
              : `Dr. ${form.name}`,

            specialization:
              form.specialization.trim(),

            qualification: '',

            experience: '',

            status: form.status,

            consultationTime:
              form.shift.trim(),

            hospital: {
              id: 1,
            },

            department: {
              id: selectedDepartment.id,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            `Unable to create doctor (${response.status})`
        );
      }

      await response.json();

      setSubmitted(true);

      setTimeout(() => {
        navigate('/admin/doctors');
      }, 1500);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Unable to add doctor.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AdminLayout title="Add Doctor">
        <div className="flex flex-col items-center justify-center py-[80px] gap-[16px]">
          <div className="bg-[#e8f7f1] size-[64px] rounded-[999px] flex items-center justify-center">
            <span className="text-[#18865b] text-[28px]">
              ✓
            </span>
          </div>

          <p className="font-bold text-[#142033] text-[20px]">
            Doctor Added Successfully
          </p>

          <p className="font-normal text-[#526176] text-[14px]">
            Redirecting to Doctor Management…
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Add Doctor">
      <button
        onClick={() =>
          navigate('/admin/doctors')
        }
        className="flex items-center gap-[8px] text-[#155ead] text-[13px] font-semibold mb-[24px] cursor-pointer hover:opacity-80 transition-opacity"
      >
        ← Back to Doctor Management
      </button>

      <div className="max-w-[720px]">
        <div className="mb-[24px]">
          <h1 className="font-bold text-[#142033] text-[24px] leading-tight">
            Add New Doctor
          </h1>

          <p className="font-normal text-[#526176] text-[14px] mt-[4px]">
            Fill in the details to register a new
            doctor at North Campus.
          </p>
        </div>

        {departmentError && (
          <div className="mb-[20px] bg-[#fef3f2] border border-[#f4c7cb] text-[#c53a45] px-[16px] py-[12px] rounded-[10px] text-[13px] font-semibold">
            {departmentError}
          </div>
        )}

        {submitError && (
          <div className="mb-[20px] bg-[#fef3f2] border border-[#f4c7cb] text-[#c53a45] px-[16px] py-[12px] rounded-[10px] text-[13px] font-semibold">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[28px] flex flex-col gap-[20px]">

            {/* Personal Information */}
            <div className="flex items-center gap-[10px] pb-[16px] border-b border-[#d8e1ec]">
              <div className="bg-[#2475d0] h-[20px] rounded-[2px] shrink-0 w-[4px]" />

              <p className="font-bold text-[#142033] text-[15px]">
                Personal Information
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">

              <Field
                label="Full Name"
                required
              >
                <input
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. Dr. Amit Verma"
                  className={inputClass}
                />

                {errors.name && (
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.name}
                  </p>
                )}
              </Field>

              <Field
                label="Specialization"
                required
              >
                <input
                  value={form.specialization}
                  onChange={set(
                    'specialization'
                  )}
                  placeholder="e.g. Cardiology"
                  className={inputClass}
                />

                {errors.specialization && (
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.specialization}
                  </p>
                )}
              </Field>

              <Field label="Phone">
                <input
                  id="add-doctor-phone"
                  value={form.phone}
                  onChange={set('phone')}
                  onBlur={() =>
                    setErrors((current) => ({
                      ...current,
                      phone: validateField(
                        'phone',
                        form.phone
                      ),
                    }))
                  }
                  aria-invalid={Boolean(
                    errors.phone
                  )}
                  placeholder="+91 98765 XXXXX"
                  className={inputClass}
                />

                {errors.phone && (
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.phone}
                  </p>
                )}
              </Field>

              <Field label="Email">
                <input
                  id="add-doctor-email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  onBlur={() =>
                    setErrors((current) => ({
                      ...current,
                      email: validateField(
                        'email',
                        form.email
                      ),
                    }))
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
            </div>

            {/* Assignment */}
            <div className="flex items-center gap-[10px] py-[16px] border-y border-[#d8e1ec]">
              <div className="bg-[#18865b] h-[20px] rounded-[2px] shrink-0 w-[4px]" />

              <p className="font-bold text-[#142033] text-[15px]">
                Assignment
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">

              {/* Department */}
              <Field
                label="Department"
                required
              >
                <select
                  value={form.department}
                  onChange={set('department')}
                  className={inputClass}
                  disabled={loadingDepartments}
                >
                  <option value="">
                    {loadingDepartments
                      ? 'Loading departments...'
                      : 'Select Department'}
                  </option>

                  {departments.map(
                    (department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>
                    )
                  )}
                </select>

                {errors.department && (
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.department}
                  </p>
                )}
              </Field>

              {/* Status */}
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

              {/* Shift */}
              <Field
                label="Shift Hours"
                required
              >
                <input
                  value={form.shift}
                  onChange={set('shift')}
                  placeholder="e.g. 08:00 – 16:00"
                  className={inputClass}
                />

                {errors.shift && (
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.shift}
                  </p>
                )}
              </Field>

              {/* Room */}
              <Field
                label="Room"
                required
              >
                <input
                  value={form.room}
                  onChange={set('room')}
                  placeholder="e.g. Room 302"
                  className={inputClass}
                />

                {errors.room && (
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.room}
                  </p>
                )}
              </Field>
            </div>
          </div>

          <div className="flex gap-[12px] mt-[20px]">
            <Button
              variant="primary"
              type="submit"
              className="px-[28px]"
              disabled={
                submitting ||
                loadingDepartments ||
                departments.length === 0
              }
            >
              {submitting
                ? 'Adding...'
                : 'Add Doctor'}
            </Button>

            <Button
              variant="ghost"
              type="button"
              onClick={() =>
                navigate('/admin/doctors')
              }
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}