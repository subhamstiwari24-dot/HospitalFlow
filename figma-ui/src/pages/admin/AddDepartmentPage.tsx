import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import { useAdmin } from '../../context/AdminContext';

const inputClass =
  'bg-white border border-[#d8e1ec] rounded-[10px] px-[14px] py-[11px] text-[14px] text-[#142033] placeholder:text-[#afc0d3] outline-none focus:border-[#155ead] transition-colors w-full';

interface FormState {
  name: string;
  head: string;
  rooms: string;
  status: 'Active' | 'Inactive';
}

const emptyForm: FormState = { name: '', head: '', rooms: '', status: 'Active' };

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label className="font-semibold text-[#142033] text-[13px]">
        {label}{required && <span className="text-[#c53a45] ml-[2px]">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function AddDepartmentPage() {
  const navigate = useNavigate();
  const { addDepartment } = useAdmin();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((err) => ({ ...err, [field]: err[field] ? validateField(field, value) : '' }));
  };

  const validateField = (field: keyof FormState, value: string): string => {
    if (field === 'name' && !value.trim()) return 'Department name is required';
    if (field === 'head' && !value.trim()) return 'Department head is required';
    if (field === 'rooms' && (!value.trim() || isNaN(Number(value)) || Number(value) < 0)) {
      return 'Enter a valid number of rooms';
    }
    return '';
  };

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    (['name', 'head', 'rooms'] as const).forEach((field) => {
      const message = validateField(field, form[field]);
      if (message) e[field] = message;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    addDepartment({
      name: form.name,
      head: form.head,
      rooms: Number(form.rooms),
      doctors: 0,
      patients: 0,
      status: form.status,
    });
    setSubmitted(true);
    setTimeout(() => navigate('/admin/departments'), 1500);
  };

  if (submitted) {
    return (
      <AdminLayout title="Add Department">
        <div className="flex flex-col items-center justify-center py-[80px] gap-[16px]">
          <div className="bg-[#e8f7f1] size-[64px] rounded-[999px] flex items-center justify-center">
            <span className="text-[#18865b] text-[28px]">✓</span>
          </div>
          <p className="font-bold text-[#142033] text-[20px]">Department Added Successfully</p>
          <p className="font-normal text-[#526176] text-[14px]">Redirecting to Department Management…</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Add Department">
      <button
        onClick={() => navigate('/admin/departments')}
        className="flex items-center gap-[8px] text-[#155ead] text-[13px] font-semibold mb-[24px] cursor-pointer hover:opacity-80 transition-opacity"
      >
        ← Back to Department Management
      </button>

      <div className="max-w-[600px]">
        <div className="mb-[24px]">
          <h1 className="font-bold text-[#142033] text-[24px] leading-tight">Add New Department</h1>
          <p className="font-normal text-[#526176] text-[14px] mt-[4px]">
            Register a new department at North Campus.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[28px] flex flex-col gap-[20px]">

            <div className="flex items-center gap-[10px] pb-[16px] border-b border-[#d8e1ec]">
              <div className="bg-[#2475d0] h-[20px] rounded-[2px] shrink-0 w-[4px]" />
              <p className="font-bold text-[#142033] text-[15px]">Department Information</p>
            </div>

            <Field label="Department Name" required>
              <input
                id="add-department-name"
                value={form.name}
                onChange={set('name')}
                onBlur={() => setErrors((err) => ({ ...err, name: validateField('name', form.name) }))}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'add-department-name-error' : undefined}
                placeholder="e.g. Neurology"
                className={inputClass}
              />
              {errors.name && <p id="add-department-name-error" className="text-[#c53a45] text-[12px]">{errors.name}</p>}
            </Field>

            <Field label="Department Head" required>
              <input
                id="add-department-head"
                value={form.head}
                onChange={set('head')}
                onBlur={() => setErrors((err) => ({ ...err, head: validateField('head', form.head) }))}
                aria-invalid={Boolean(errors.head)}
                aria-describedby={errors.head ? 'add-department-head-error' : undefined}
                placeholder="e.g. Dr. Priya Iyer"
                className={inputClass}
              />
              {errors.head && <p id="add-department-head-error" className="text-[#c53a45] text-[12px]">{errors.head}</p>}
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
              <Field label="Number of Rooms" required>
                <input
                  id="add-department-rooms"
                  type="number"
                  min={0}
                  value={form.rooms}
                  onChange={set('rooms')}
                  onBlur={() => setErrors((err) => ({ ...err, rooms: validateField('rooms', form.rooms) }))}
                  aria-invalid={Boolean(errors.rooms)}
                  aria-describedby={errors.rooms ? 'add-department-rooms-error' : undefined}
                  placeholder="e.g. 8"
                  className={inputClass}
                />
                {errors.rooms && <p id="add-department-rooms-error" className="text-[#c53a45] text-[12px]">{errors.rooms}</p>}
              </Field>

              <Field label="Status">
                <select value={form.status} onChange={set('status')} className={inputClass}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="flex gap-[12px] mt-[20px]">
            <Button variant="primary" type="submit" className="px-[28px]">
              Add Department
            </Button>
            <Button variant="ghost" type="button" onClick={() => navigate('/admin/departments')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
