import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { useAdmin } from '../../context/AdminContext';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDeptManagement } from '../../components/Skeleton';
import EmptyState, { EmptyIcons } from '../../components/EmptyState';

export default function DepartmentManagementPage() {
  const navigate = useNavigate();
  const { departments, selectDepartment } = useAdmin();
  const loading = usePageLoad(850);

  const totalDoctors = departments.reduce((s, d) => s + d.doctors, 0);
  const totalPatients = departments.reduce((s, d) => s + d.patients, 0);
  const totalRooms = departments.reduce((s, d) => s + d.rooms, 0);

  const handleRowClick = (id: string) => {
    selectDepartment(id);
    navigate(`/admin/departments/${id}`);
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    selectDepartment(id);
    navigate(`/admin/departments/${id}`);
  };

  if (loading) return <AdminLayout title="Department Management"><SkDeptManagement /></AdminLayout>;

  return (
    <AdminLayout title="Department Management">
      <div className="flex flex-wrap items-start gap-[12px] justify-between mb-[24px]">
        <div>
          <h1 className="font-bold text-[#142033] text-[24px] leading-tight">Department Management</h1>
          <p className="font-normal text-[#526176] text-[14px] mt-[4px]">
            {departments.length} departments · North Campus
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/departments/add')}>
          + Add Department
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px] mb-[24px]">
        {[
          { label: 'Total Departments', value: departments.length, bg: 'bg-[#eaf3fd]', text: 'text-[#155ead]' },
          { label: 'Total Doctors', value: totalDoctors, bg: 'bg-[#e8f7f1]', text: 'text-[#18865b]' },
          { label: 'Total Patients', value: totalPatients, bg: 'bg-[#fff4de]', text: 'text-[#a86508]' },
          { label: 'Total Rooms', value: totalRooms, bg: 'bg-[#f4f7fb]', text: 'text-[#526176]' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} flex flex-col items-center py-[18px] rounded-[14px]`}>
            <p className={`font-bold text-[28px] ${s.text}`}>{s.value}</p>
            <p className="font-normal text-[#526176] text-[12px] mt-[4px]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
        <div className="grid grid-cols-[1fr_150px_80px_80px_60px_100px_100px] gap-[12px] px-[20px] py-[10px] bg-[#f4f7fb] border-b border-[#d8e1ec]">
          {['Department', 'Head', 'Doctors', 'Patients', 'Rooms', 'Status', 'Actions'].map((h) => (
            <p key={h} className="font-semibold text-[#7b899c] text-[11px] uppercase">{h}</p>
          ))}
        </div>

        {departments.length === 0 && (
          <EmptyState
            icon={EmptyIcons.building(28)}
            title="No departments yet"
            description="Add your first department to get started."
            action={
              <button
                onClick={() => navigate('/admin/departments/add')}
                className="bg-[#155ead] text-white font-bold text-[13px] px-[16px] py-[10px] rounded-[10px] hover:bg-[#1250a0] transition-colors cursor-pointer"
              >
                + Add Department
              </button>
            }
          />
        )}

        {departments.map((dept) => (
          <div
            key={dept.id}
            className="grid grid-cols-[1fr_150px_80px_80px_60px_100px_100px] gap-[12px] items-center px-[20px] py-[14px] border-b border-[#d8e1ec] last:border-0 cursor-pointer hover:bg-[#f4f7fb] transition-colors"
            onClick={() => handleRowClick(dept.id)}
          >
            <div className="flex gap-[10px] items-center min-w-0">
              <div className="bg-[#eaf3fd] flex items-center justify-center rounded-[10px] size-[34px] shrink-0">
                <p className="font-bold text-[#155ead] text-[11px]">
                  {dept.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </p>
              </div>
              <p className="font-semibold text-[#142033] text-[14px] truncate">{dept.name}</p>
            </div>
            <p className="font-normal text-[#526176] text-[13px] truncate">{dept.head}</p>
            <p className="font-bold text-[#142033] text-[14px] text-center">{dept.doctors}</p>
            <p className="font-bold text-[#142033] text-[14px] text-center">{dept.patients}</p>
            <p className="font-bold text-[#142033] text-[14px] text-center">{dept.rooms}</p>
            <StatusBadge status={dept.status} />
            <div className="flex gap-[6px]" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="secondary"
                onClick={(e) => handleEdit(e, dept.id)}
              >
                Details
              </Button>
            </div>
          </div>
        ))}
        </div>
      </div>
    </AdminLayout>
  );
}
