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
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = 'Department name is required';
    if (!form.head.trim()) e.head = 'Department head is required';
    if (!form.rooms.trim() || isNaN(Number(form.rooms)) || Number(form.rooms) < 0) {
      e.rooms = 'Enter a valid number of rooms';
    }
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
                value={form.name}
                onChange={set('name')}
                placeholder="e.g. Neurology"
                className={inputClass}
              />
              {errors.name && <p className="text-[#c53a45] text-[12px]">{errors.name}</p>}
            </Field>

            <Field label="Department Head" required>
              <input
                value={form.head}
                onChange={set('head')}
                placeholder="e.g. Dr. Priya Iyer"
                className={inputClass}
              />
              {errors.head && <p className="text-[#c53a45] text-[12px]">{errors.head}</p>}
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
              <Field label="Number of Rooms" required>
                <input
                  type="number"
                  min={0}
                  value={form.rooms}
                  onChange={set('rooms')}
                  placeholder="e.g. 8"
                  className={inputClass}
                />
                {errors.rooms && <p className="text-[#c53a45] text-[12px]">{errors.rooms}</p>}
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
