import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { useAdmin } from '../../context/AdminContext';
import type { Doctor, DoctorStatus } from '../../types';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDoctorManagement } from '../../components/Skeleton';
import EmptyState, { EmptyIcons } from '../../components/EmptyState';

const statusFilters: Array<DoctorStatus | 'All'> = ['All', 'Available', 'Busy', 'On Break', 'Offline'];

function DoctorInitials({ name }: { name: string }) {
  const initials = name.replace('Dr. ', '').split(' ').map((w) => w[0]).join('').slice(0, 2);
  return (
    <div className="bg-[#eaf3fd] flex items-center justify-center rounded-[999px] shrink-0 size-[34px]">
      <p className="font-bold text-[#155ead] text-[11px]">{initials}</p>
    </div>
  );
}

function ActionMenu({ doctor, onEdit, onView, onDeactivate, onRemove }: {
  doctor: Doctor;
  onEdit: () => void;
  onView: () => void;
  onDeactivate: () => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="border border-[#d8e1ec] bg-white px-[10px] py-[6px] rounded-[8px] text-[13px] font-semibold text-[#526176] hover:bg-[#f4f7fb] cursor-pointer transition-colors"
      >
        ···
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-20 bg-white border border-[#d8e1ec] rounded-[12px] shadow-[0px_8px_24px_0px_rgba(19,36,58,0.12)] w-[160px] overflow-hidden">
          {[
            { label: 'View Doctor', action: onView, color: 'text-[#142033]' },
            { label: 'Edit Doctor', action: onEdit, color: 'text-[#142033]' },
            { label: doctor.status === 'Offline' ? 'Activate' : 'Deactivate', action: onDeactivate, color: 'text-[#a86508]' },
            { label: 'Remove', action: onRemove, color: 'text-[#c53a45]' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={(e) => { e.stopPropagation(); item.action(); setOpen(false); }}
              className={`w-full text-left px-[14px] py-[10px] text-[13px] font-medium hover:bg-[#f4f7fb] transition-colors ${item.color}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DoctorManagementPage() {
  const navigate = useNavigate();
  const { doctors, selectedDoctorId, selectDoctor, deactivateDoctor, removeDoctor } = useAdmin();
  const [filter, setFilter] = useState<DoctorStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const loading = usePageLoad(850);

  const selected = selectedDoctorId ? doctors.find((d) => d.id === selectedDoctorId) ?? null : null;

  const filtered = doctors.filter((d) => {
    const matchesStatus = filter === 'All' || d.status === filter;
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) return <AdminLayout title="Doctor Management"><SkDoctorManagement /></AdminLayout>;

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeactivate = (doc: Doctor) => {
    deactivateDoctor(doc.id);
    showSuccess(`${doc.name} has been ${doc.status === 'Offline' ? 'activated' : 'deactivated'}.`);
    if (selectedDoctorId === doc.id) selectDoctor(null);
  };

  const handleRemove = (doc: Doctor) => {
    removeDoctor(doc.id);
    showSuccess(`${doc.name} has been removed.`);
  };

  return (
    <AdminLayout title="Doctor Management">
      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-[20px] right-[20px] z-50 bg-[#18865b] text-white px-[18px] py-[12px] rounded-[10px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.2)] font-semibold text-[13px] animate-fade-in">
          {successMsg}
        </div>
      )}

      <div className="flex flex-wrap items-start gap-[12px] justify-between mb-[24px]">
        <div>
          <h1 className="font-bold text-[#142033] text-[24px] leading-tight">Doctor Management</h1>
          <p className="font-normal text-[#526176] text-[14px] mt-[4px]">
            {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} · North Campus
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/doctors/add')}>
          + Add Doctor
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-[12px] mb-[20px] flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, specialization, department…"
          className="bg-white border border-[#d8e1ec] rounded-[10px] px-[14px] py-[10px] text-[14px] text-[#142033] placeholder:text-[#afc0d3] outline-none focus:border-[#155ead] transition-colors w-[280px]"
        />
        <div className="flex gap-[6px] flex-wrap">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-[14px] py-[8px] rounded-[8px] text-[13px] font-semibold transition-colors cursor-pointer ${
                filter === s
                  ? 'bg-[#155ead] text-white'
                  : 'bg-white border border-[#d8e1ec] text-[#526176] hover:bg-[#f4f7fb]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-[14px] lg:gap-[18px]">
        {/* Table */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
            <div className="grid grid-cols-[1fr_130px_120px_80px_110px_56px] gap-[16px] px-[20px] py-[10px] bg-[#f4f7fb] border-b border-[#d8e1ec]">
              {['Name', 'Specialization', 'Department', 'Patients', 'Status', ''].map((h, i) => (
                <p key={i} className="font-semibold text-[#7b899c] text-[11px] uppercase">{h}</p>
              ))}
            </div>

            {filtered.length === 0 && (
              doctors.length === 0 ? (
                <EmptyState
                  icon={EmptyIcons.userPlus(28)}
                  title="No doctors yet"
                  description="Add your first doctor to get started."
                  action={
                    <button
                      onClick={() => navigate('/admin/doctors/add')}
                      className="bg-[#155ead] text-white font-bold text-[13px] px-[16px] py-[10px] rounded-[10px] hover:bg-[#1250a0] transition-colors cursor-pointer"
                    >
                      + Add Doctor
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  icon={EmptyIcons.search(28)}
                  title="No doctors found"
                  description="No doctors match your current search or filter."
                  action={
                    <button
                      onClick={() => { setSearch(''); setFilter('All'); }}
                      className="border border-[#d8e1ec] bg-white text-[#526176] font-bold text-[13px] px-[16px] py-[10px] rounded-[10px] hover:bg-[#f4f7fb] transition-colors cursor-pointer"
                    >
                      Clear filters
                    </button>
                  }
                />
              )
            )}

            {filtered.map((doc) => (
              <div
                key={doc.id}
                className={`grid grid-cols-[1fr_130px_120px_80px_110px_56px] gap-[16px] items-center px-[20px] py-[14px] border-b border-[#d8e1ec] last:border-0 cursor-pointer transition-colors ${
                  selected?.id === doc.id ? 'bg-[#eaf3fd]' : 'hover:bg-[#f4f7fb]'
                }`}
                onClick={() => selectDoctor(doc.id === selectedDoctorId ? null : doc.id)}
              >
                <div className="flex gap-[10px] items-center min-w-0">
                  <DoctorInitials name={doc.name} />
                  <div className="min-w-0">
                    <p className={`font-semibold text-[14px] truncate ${doc.status === 'Offline' ? 'text-[#7b899c]' : 'text-[#142033]'}`}>
                      {doc.name}
                    </p>
                    <p className="font-normal text-[#7b899c] text-[11px]">{doc.room} · {doc.shift}</p>
                  </div>
                </div>
                <p className="font-normal text-[#526176] text-[13px] truncate">{doc.specialization}</p>
                <p className="font-normal text-[#526176] text-[13px] truncate">{doc.department}</p>
                <p className="font-bold text-[#142033] text-[14px]">{doc.patients}</p>
                <StatusBadge status={doc.status} />
                <ActionMenu
                  doctor={doc}
                  onView={() => { selectDoctor(doc.id); }}
                  onEdit={() => { selectDoctor(doc.id); navigate(`/admin/doctors/${doc.id}/edit`); }}
                  onDeactivate={() => handleDeactivate(doc)}
                  onRemove={() => handleRemove(doc)}
                />
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-full lg:w-[280px] lg:shrink-0">
            <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
              <div className="flex items-start justify-between mb-[16px]">
                <div className="bg-[#eaf3fd] flex items-center justify-center rounded-[999px] size-[48px]">
                  <p className="font-bold text-[#155ead] text-[16px]">
                    {selected.name.replace('Dr. ', '').split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </p>
                </div>
                <button
                  onClick={() => selectDoctor(null)}
                  className="text-[#7b899c] hover:text-[#142033] cursor-pointer text-[20px] leading-none"
                >
                  ×
                </button>
              </div>

              <p className="font-bold text-[#142033] text-[16px]">{selected.name}</p>
              <p className="font-normal text-[#526176] text-[13px] mt-[2px]">{selected.specialization}</p>
              <StatusBadge status={selected.status} className="mt-[10px]" />

              <div className="flex flex-col gap-[10px] mt-[16px] pt-[14px] border-t border-[#d8e1ec]">
                {[
                  { label: 'Department', value: selected.department },
                  { label: 'Room', value: selected.room },
                  { label: 'Shift', value: selected.shift },
                  { label: 'Patients today', value: String(selected.patients) },
                  { label: 'Phone', value: selected.phone ?? '—' },
                  { label: 'Email', value: selected.email ?? '—' },
                ].map((row) => (
                  <div key={row.label}>
                    <p className="font-semibold text-[#7b899c] text-[10px] uppercase">{row.label}</p>
                    <p className="font-normal text-[#142033] text-[13px] mt-[1px] break-all">{row.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-[8px] mt-[16px]">
                <Button
                  variant="primary"
                  className="flex-1 justify-center"
                  onClick={() => navigate(`/admin/doctors/${selected.id}/edit`)}
                >
                  Edit Doctor
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleRemove(selected)}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
