import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDeptManagement } from '../../components/Skeleton';
import EmptyState, { EmptyIcons } from '../../components/EmptyState';

type DepartmentStatus = 'Active' | 'Inactive';

interface BackendDoctor {
  id: number;
  name: string;
  specialization: string;
  status: 'Available' | 'Busy' | 'On Break' | 'Offline';
}

interface BackendAppointment {
  appointmentDate: string;
  doctor?: { id?: number | null } | null;
}

interface DerivedDepartment {
  id: string;
  name: string;
  head: string;
  doctors: number;
  patients: number;
  rooms: string;
  status: DepartmentStatus;
}

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getTodayKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export default function DepartmentManagementPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<DerivedDepartment[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loading = usePageLoad(850);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDepartmentData() {
      try {
        setLoadingDepartments(true);
        setError(null);
        const [doctorResponse, appointmentResponse] = await Promise.all([
          fetch('/api/doctors', { signal: controller.signal }),
          fetch('/api/appointments', { signal: controller.signal }),
        ]);
        if (!doctorResponse.ok) throw new Error(`Unable to load doctors (${doctorResponse.status})`);
        if (!appointmentResponse.ok) throw new Error(`Unable to load appointments (${appointmentResponse.status})`);

        const doctorData: unknown = await doctorResponse.json();
        const appointmentData: unknown = await appointmentResponse.json();
        if (!Array.isArray(doctorData) || !Array.isArray(appointmentData)) {
          throw new Error('The department data response was invalid.');
        }

        const doctors = doctorData as BackendDoctor[];
        const appointments = appointmentData as BackendAppointment[];
        const todayKey = getTodayKey();
        const doctorSpecializations = new Map(doctors.map((doctor) => [doctor.id, doctor.specialization.trim()]));
        const patientCounts = new Map<string, number>();

        appointments.forEach((appointment) => {
          const specialization = appointment.doctor?.id
            ? doctorSpecializations.get(appointment.doctor.id)
            : undefined;
          if (specialization && appointment.appointmentDate === todayKey) {
            patientCounts.set(specialization, (patientCounts.get(specialization) ?? 0) + 1);
          }
        });

        const departmentMap = new Map<string, BackendDoctor[]>();
        doctors.forEach((doctor) => {
          const specialization = doctor.specialization.trim();
          if (!specialization) return;
          const departmentDoctors = departmentMap.get(specialization) ?? [];
          departmentDoctors.push(doctor);
          departmentMap.set(specialization, departmentDoctors);
        });

        setDepartments(Array.from(departmentMap.entries()).map(([name, departmentDoctors]) => ({
          id: slugify(name),
          name,
          head: departmentDoctors[0].name,
          doctors: departmentDoctors.length,
          patients: patientCounts.get(name) ?? 0,
          rooms: 'Not tracked',
          status: departmentDoctors.some((doctor) => doctor.status !== 'Offline') ? 'Active' : 'Inactive',
        })));
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load departments.');
      } finally {
        if (!controller.signal.aborted) setLoadingDepartments(false);
      }
    }

    void fetchDepartmentData();
    return () => controller.abort();
  }, []);

  const totalDoctors = departments.reduce((s, d) => s + d.doctors, 0);
  const totalPatients = departments.reduce((s, d) => s + d.patients, 0);

  const handleRowClick = (id: string) => {
    navigate(`/admin/departments/${id}`);
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/admin/departments/${id}`);
  };

  if (loading && !error) return <AdminLayout title="Department Management"><SkDeptManagement /></AdminLayout>;

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
          { label: 'Total Rooms', value: 'Not tracked', bg: 'bg-[#f4f7fb]', text: 'text-[#526176]' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} flex flex-col items-center py-[18px] rounded-[14px]`}>
            <p className={`font-bold text-[28px] ${s.text}`}>{s.value}</p>
            <p className="font-normal text-[#526176] text-[12px] mt-[4px]">{s.label}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-[20px] bg-[#fef3f2] border border-[#f4c7cb] text-[#c53a45] px-[16px] py-[12px] rounded-[10px] text-[13px] font-semibold">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
        <div className="grid grid-cols-[1fr_150px_80px_80px_60px_100px_100px] gap-[12px] px-[20px] py-[10px] bg-[#f4f7fb] border-b border-[#d8e1ec]">
          {['Department', 'Head', 'Doctors', 'Patients', 'Rooms', 'Status', 'Actions'].map((h) => (
            <p key={h} className="font-semibold text-[#7b899c] text-[11px] uppercase">{h}</p>
          ))}
        </div>

          {loadingDepartments && <div className="px-[20px] py-[24px] text-[#7b899c] text-[13px]">Loading departments...</div>}

          {!loadingDepartments && departments.length === 0 && (
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

            {!loadingDepartments && departments.map((dept) => (
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
