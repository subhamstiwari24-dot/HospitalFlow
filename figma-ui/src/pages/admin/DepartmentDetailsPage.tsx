import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { useAdmin } from '../../context/AdminContext';

const inputClass =
  'bg-white border border-[#d8e1ec] rounded-[10px] px-[14px] py-[11px] text-[14px] text-[#142033] placeholder:text-[#afc0d3] outline-none focus:border-[#155ead] transition-colors w-full';

export default function DepartmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { departments, doctors, updateDepartment } = useAdmin();

  const dept = departments.find((d) => d.id === id);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: '', head: '', rooms: 0, status: 'Active' as 'Active' | 'Inactive' });

  if (!dept) {
    return (
      <AdminLayout title="Department Details">
        <div className="flex flex-col items-center justify-center py-[80px] gap-[12px]">
          <p className="font-bold text-[#142033] text-[18px]">Department not found</p>
          <Button variant="secondary" onClick={() => navigate('/admin/departments')}>
            Back to Departments
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const departmentDoctors = doctors.filter(
    (d) => d.department.toLowerCase() === dept.name.toLowerCase()
  );

  const startEdit = () => {
    setForm({ name: dept.name, head: dept.head, rooms: dept.rooms, status: dept.status });
    setEditing(true);
  };

  const handleSave = () => {
    updateDepartment(dept.id, form);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [field]: field === 'rooms' ? Number(e.target.value) : e.target.value }));
  };

  return (
    <AdminLayout title="Department Details">
      {/* Success toast */}
      {saved && (
        <div className="fixed top-[20px] right-[20px] z-50 bg-[#18865b] text-white px-[18px] py-[12px] rounded-[10px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.2)] font-semibold text-[13px]">
          Department updated successfully.
        </div>
      )}

      <button
        onClick={() => navigate('/admin/departments')}
        className="flex items-center gap-[8px] text-[#155ead] text-[13px] font-semibold mb-[24px] cursor-pointer hover:opacity-80 transition-opacity"
      >
        ← Back to Department Management
      </button>

      <div className="flex flex-col lg:flex-row gap-[14px] lg:gap-[18px]">
        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-[18px]">

          {/* Header card */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[24px]">
            {editing ? (
              <div className="flex flex-col gap-[16px]">
                <div className="flex items-center gap-[10px] pb-[14px] border-b border-[#d8e1ec]">
                  <div className="bg-[#2475d0] h-[20px] rounded-[2px] shrink-0 w-[4px]" />
                  <p className="font-bold text-[#142033] text-[15px]">Edit Department</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                  <div className="flex flex-col gap-[6px]">
                    <label className="font-semibold text-[#142033] text-[13px]">Department Name</label>
                    <input value={form.name} onChange={set('name')} className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <label className="font-semibold text-[#142033] text-[13px]">Department Head</label>
                    <input value={form.head} onChange={set('head')} className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <label className="font-semibold text-[#142033] text-[13px]">Rooms</label>
                    <input type="number" min={0} value={form.rooms} onChange={set('rooms')} className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <label className="font-semibold text-[#142033] text-[13px]">Status</label>
                    <select value={form.status} onChange={set('status')} className={inputClass}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-[10px] pt-[4px]">
                  <Button variant="primary" onClick={handleSave}>Save Changes</Button>
                  <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-[18px]">
                  <div className="bg-[#eaf3fd] flex items-center justify-center rounded-[14px] size-[56px] shrink-0">
                    <p className="font-bold text-[#155ead] text-[18px]">
                      {dept.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[12px] flex-wrap mb-[4px]">
                      <h1 className="font-bold text-[#142033] text-[22px]">{dept.name}</h1>
                      <StatusBadge status={dept.status} />
                    </div>
                    <p className="font-normal text-[#526176] text-[13px]">Head: {dept.head}</p>
                  </div>
                  <Button variant="secondary" onClick={startEdit}>Edit Department</Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-[14px] mt-[20px] pt-[18px] border-t border-[#d8e1ec]">
                  {[
                    { label: 'Doctors', value: dept.doctors, bg: 'bg-[#eaf3fd]', text: 'text-[#155ead]' },
                    { label: 'Active Patients', value: dept.patients, bg: 'bg-[#e8f7f1]', text: 'text-[#18865b]' },
                    { label: 'Rooms', value: dept.rooms, bg: 'bg-[#f4f7fb]', text: 'text-[#526176]' },
                  ].map((m) => (
                    <div key={m.label} className={`${m.bg} rounded-[14px] p-[18px] flex flex-col items-center`}>
                      <p className={`font-bold text-[32px] ${m.text}`}>{m.value}</p>
                      <p className="font-normal text-[#526176] text-[12px] mt-[4px]">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Doctors in this department */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
            <div className="px-[20px] py-[16px] border-b border-[#d8e1ec]">
              <p className="font-bold text-[#142033] text-[16px]">Doctors in {dept.name}</p>
              <p className="font-normal text-[#7b899c] text-[11px] mt-[2px]">
                {departmentDoctors.length} doctor{departmentDoctors.length !== 1 ? 's' : ''} assigned
              </p>
            </div>

            {departmentDoctors.length === 0 ? (
              <div className="px-[20px] py-[32px] text-center">
                <p className="font-normal text-[#7b899c] text-[14px]">
                  No doctors currently assigned to this department.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-[1fr_130px_100px_80px] gap-[16px] px-[20px] py-[10px] bg-[#f4f7fb] border-b border-[#d8e1ec]">
                {['Name', 'Specialization', 'Status', 'Patients'].map((h) => (
                  <p key={h} className="font-semibold text-[#7b899c] text-[11px] uppercase">{h}</p>
                ))}
              </div>
            )}
            {departmentDoctors.map((doc) => (
              <div key={doc.id} className="grid grid-cols-[1fr_130px_100px_80px] gap-[16px] items-center px-[20px] py-[13px] border-b border-[#d8e1ec] last:border-0 hover:bg-[#f4f7fb] transition-colors">
                <div className="flex gap-[10px] items-center min-w-0">
                  <div className="bg-[#eaf3fd] flex items-center justify-center rounded-[999px] size-[32px] shrink-0">
                    <p className="font-bold text-[#155ead] text-[11px]">
                      {doc.name.replace('Dr. ', '').split(' ').map((w) => w[0]).join('').slice(0, 2)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#142033] text-[13px] truncate">{doc.name}</p>
                    <p className="font-normal text-[#7b899c] text-[11px]">{doc.room} · {doc.shift}</p>
                  </div>
                </div>
                <p className="font-normal text-[#526176] text-[13px] truncate">{doc.specialization}</p>
                <StatusBadge status={doc.status} />
                <p className="font-bold text-[#142033] text-[14px]">{doc.patients}</p>
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Right: Info panel */}
        <div className="w-full lg:w-[260px] lg:shrink-0 flex flex-col gap-[14px]">
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
            <p className="font-bold text-[#142033] text-[15px] mb-[14px]">Quick Info</p>
            <div className="flex flex-col gap-[12px]">
              {[
                { label: 'Department Head', value: dept.head },
                { label: 'Status', value: dept.status },
                { label: 'Total Rooms', value: String(dept.rooms) },
                { label: 'Active Doctors', value: String(departmentDoctors.filter(d => d.status !== 'Offline').length) },
              ].map((row) => (
                <div key={row.label}>
                  <p className="font-semibold text-[#7b899c] text-[10px] uppercase mb-[2px]">{row.label}</p>
                  {row.label === 'Status' ? (
                    <StatusBadge status={row.value} />
                  ) : (
                    <p className="font-normal text-[#142033] text-[13px]">{row.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
            <p className="font-bold text-[#142033] text-[15px] mb-[14px]">Doctor Status Breakdown</p>
            {(['Available', 'Busy', 'On Break', 'Offline'] as const).map((s) => {
              const count = departmentDoctors.filter((d) => d.status === s).length;
              return (
                <div key={s} className="flex items-center justify-between py-[6px] border-b border-[#f4f7fb] last:border-0">
                  <StatusBadge status={s} />
                  <p className="font-bold text-[#142033] text-[14px]">{count}</p>
                </div>
              );
            })}
          </div>

          <Button variant="ghost" className="w-full justify-center" onClick={() => navigate('/admin/departments')}>
            Back to Departments
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
