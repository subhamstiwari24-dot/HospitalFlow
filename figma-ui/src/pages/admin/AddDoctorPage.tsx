import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import { useAdmin } from '../../context/AdminContext';
import type { DoctorStatus } from '../../types';

const statusOptions: DoctorStatus[] = ['Available', 'Busy', 'On Break', 'Offline'];

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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label className="font-semibold text-[#142033] text-[13px]">
        {label} {required && <span className="text-[#c53a45]">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'bg-white border border-[#d8e1ec] rounded-[10px] px-[14px] py-[11px] text-[14px] text-[#142033] placeholder:text-[#afc0d3] outline-none focus:border-[#155ead] transition-colors w-full';

export default function AddDoctorPage() {
  const navigate = useNavigate();
  const { addDoctor } = useAdmin();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.specialization.trim()) e.specialization = 'Specialization is required';
    if (!form.department.trim()) e.department = 'Department is required';
    if (!form.shift.trim()) e.shift = 'Shift hours are required';
    if (!form.room.trim()) e.room = 'Room is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    addDoctor({
      name: form.name.startsWith('Dr.') ? form.name : `Dr. ${form.name}`,
      specialization: form.specialization,
      department: form.department,
      status: form.status,
      shift: form.shift,
      room: form.room,
      phone: form.phone,
      email: form.email,
      patients: 0,
    });
    setSubmitted(true);
    setTimeout(() => navigate('/admin/doctors'), 1500);
  };

  if (submitted) {
    return (
      <AdminLayout title="Add Doctor">
        <div className="flex flex-col items-center justify-center py-[80px] gap-[16px]">
          <div className="bg-[#e8f7f1] size-[64px] rounded-[999px] flex items-center justify-center">
            <span className="text-[#18865b] text-[28px]">✓</span>
          </div>
          <p className="font-bold text-[#142033] text-[20px]">Doctor Added Successfully</p>
          <p className="font-normal text-[#526176] text-[14px]">Redirecting to Doctor Management…</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Add Doctor">
      <button
        onClick={() => navigate('/admin/doctors')}
        className="flex items-center gap-[8px] text-[#155ead] text-[13px] font-semibold mb-[24px] cursor-pointer hover:opacity-80 transition-opacity"
      >
        ← Back to Doctor Management
      </button>

      <div className="max-w-[720px]">
        <div className="mb-[24px]">
          <h1 className="font-bold text-[#142033] text-[24px] leading-tight">Add New Doctor</h1>
          <p className="font-normal text-[#526176] text-[14px] mt-[4px]">
            Fill in the details to register a new doctor at North Campus.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[28px] flex flex-col gap-[20px]">

            <div className="flex items-center gap-[10px] pb-[16px] border-b border-[#d8e1ec]">
              <div className="bg-[#2475d0] h-[20px] rounded-[2px] shrink-0 w-[4px]" />
              <p className="font-bold text-[#142033] text-[15px]">Personal Information</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
              <Field label="Full Name" required>
                <input
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. Dr. Amit Verma"
                  className={inputClass}
                />
                {errors.name && <p className="text-[#c53a45] text-[12px]">{errors.name}</p>}
              </Field>
              <Field label="Specialization" required>
                <input
                  value={form.specialization}
                  onChange={set('specialization')}
                  placeholder="e.g. Cardiology"
                  className={inputClass}
                />
                {errors.specialization && <p className="text-[#c53a45] text-[12px]">{errors.specialization}</p>}
              </Field>
              <Field label="Phone">
                <input
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+91 98765 XXXXX"
                  className={inputClass}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="doctor@hospitalflow.in"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="flex items-center gap-[10px] py-[16px] border-y border-[#d8e1ec]">
              <div className="bg-[#18865b] h-[20px] rounded-[2px] shrink-0 w-[4px]" />
              <p className="font-bold text-[#142033] text-[15px]">Assignment</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
              <Field label="Department" required>
                <input
                  value={form.department}
                  onChange={set('department')}
                  placeholder="e.g. Cardiology"
                  className={inputClass}
                />
                {errors.department && <p className="text-[#c53a45] text-[12px]">{errors.department}</p>}
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={set('status')} className={inputClass}>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Shift Hours" required>
                <input
                  value={form.shift}
                  onChange={set('shift')}
                  placeholder="e.g. 08:00 – 16:00"
                  className={inputClass}
                />
                {errors.shift && <p className="text-[#c53a45] text-[12px]">{errors.shift}</p>}
              </Field>
              <Field label="Room" required>
                <input
                  value={form.room}
                  onChange={set('room')}
                  placeholder="e.g. Room 302"
                  className={inputClass}
                />
                {errors.room && <p className="text-[#c53a45] text-[12px]">{errors.room}</p>}
              </Field>
            </div>
          </div>

          <div className="flex gap-[12px] mt-[20px]">
            <Button variant="primary" type="submit" className="px-[28px]">
              Add Doctor
            </Button>
            <Button variant="ghost" type="button" onClick={() => navigate('/admin/doctors')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
