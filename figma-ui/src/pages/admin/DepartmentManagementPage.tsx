import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDeptManagement } from '../../components/Skeleton';
import EmptyState, { EmptyIcons } from '../../components/EmptyState';

type DepartmentStatus = 'Active' | 'Inactive';

interface BackendDepartment {
  id: number;
  name: string;
  head?: string | null;
  rooms?: number | null;
  status: DepartmentStatus;
  hospital?: {
    id?: number | null;
    name?: string | null;
  } | null;
}

interface Department {
  id: number;
  name: string;
  head: string;
  doctors: number;
  patients: number;
  rooms: number;
  status: DepartmentStatus;
}

const HOSPITAL_ADMIN_TOKEN_KEY =
  'hospitalflow_hospital_admin_token';

async function getHospitalAdminDepartments(
  signal?: AbortSignal,
): Promise<BackendDepartment[]> {
  const token = sessionStorage.getItem(
    HOSPITAL_ADMIN_TOKEN_KEY,
  );

  const response = await fetch(
    '/api/hospital-admin/departments',
    {
      method: 'GET',
      signal,
      credentials: 'include',
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    },
  );

  if (!response.ok) {
    let message =
      `Unable to load departments (${response.status})`;

    try {
      const body = (await response.json()) as {
        message?: string;
      };

      if (body.message) {
        message = body.message;
      }
    } catch {
      // Keep status-based error message.
    }

    throw new Error(message);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(
      'The departments response was invalid.',
    );
  }

  return data as BackendDepartment[];
}

export default function DepartmentManagementPage() {
  const navigate = useNavigate();

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [loadingDepartments, setLoadingDepartments] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loading = usePageLoad(850);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDepartments() {
      try {
        setLoadingDepartments(true);
        setError(null);

        const backendDepartments =
          await getHospitalAdminDepartments(
            controller.signal,
          );

        const departmentList: Department[] =
          backendDepartments.map(
            (department) => ({
              id: department.id,
              name: department.name,
              head:
                department.head ||
                'Not assigned',
              doctors: 0,
              patients: 0,
              rooms:
                department.rooms ?? 0,
              status: department.status,
            }),
          );

        setDepartments(departmentList);
      } catch (fetchError) {
        if (
          fetchError instanceof DOMException &&
          fetchError.name === 'AbortError'
        ) {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Unable to load departments.',
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingDepartments(false);
        }
      }
    }

    void fetchDepartments();

    return () => controller.abort();
  }, []);

  const totalDoctors =
    departments.reduce(
      (sum, department) =>
        sum + department.doctors,
      0,
    );

  const totalPatients =
    departments.reduce(
      (sum, department) =>
        sum + department.patients,
      0,
    );

  const totalRooms =
    departments.reduce(
      (sum, department) =>
        sum + department.rooms,
      0,
    );

  const handleRowClick = (id: number) => {
    navigate(`/admin/departments/${id}`);
  };

  const handleEdit = (
    event: React.MouseEvent,
    id: number,
  ) => {
    event.stopPropagation();
    navigate(`/admin/departments/${id}`);
  };

  if (loading && !error) {
    return (
      <AdminLayout title="Department Management">
        <SkDeptManagement />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Department Management">
      <div className="flex flex-wrap items-start gap-[12px] justify-between mb-[24px]">
        <div>
          <h1 className="font-bold text-[#142033] text-[24px] leading-tight">
            Department Management
          </h1>

          <p className="font-normal text-[#526176] text-[14px] mt-[4px]">
            {departments.length} departments
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() =>
            navigate('/admin/departments/add')
          }
        >
          + Add Department
        </Button>
      </div>

      {error && (
        <div className="mb-[20px] bg-[#fef3f2] border border-[#f4c7cb] text-[#c53a45] px-[16px] py-[12px] rounded-[10px] text-[13px] font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px] mb-[24px]">
        {[
          {
            label: 'Total Departments',
            value: departments.length,
            bg: 'bg-[#eaf3fd]',
            text: 'text-[#155ead]',
          },
          {
            label: 'Total Doctors',
            value: totalDoctors,
            bg: 'bg-[#e8f7f1]',
            text: 'text-[#18865b]',
          },
          {
            label: 'Total Patients',
            value: totalPatients,
            bg: 'bg-[#fff4de]',
            text: 'text-[#a86508]',
          },
          {
            label: 'Total Rooms',
            value: totalRooms,
            bg: 'bg-[#f4f7fb]',
            text: 'text-[#526176]',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} flex flex-col items-center py-[18px] rounded-[14px]`}
          >
            <p
              className={`font-bold text-[28px] ${stat.text}`}
            >
              {stat.value}
            </p>

            <p className="font-normal text-[#526176] text-[12px] mt-[4px]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[1fr_150px_80px_80px_60px_100px_100px] gap-[12px] px-[20px] py-[10px] bg-[#f4f7fb] border-b border-[#d8e1ec]">
            {[
              'Department',
              'Head',
              'Doctors',
              'Patients',
              'Rooms',
              'Status',
              'Actions',
            ].map((heading) => (
              <p
                key={heading}
                className="font-semibold text-[#7b899c] text-[11px] uppercase"
              >
                {heading}
              </p>
            ))}
          </div>

          {loadingDepartments && (
            <div className="px-[20px] py-[24px] text-[#7b899c] text-[13px]">
              Loading departments...
            </div>
          )}

          {!loadingDepartments &&
            departments.length === 0 && (
              <EmptyState
                icon={EmptyIcons.building(28)}
                title="No departments yet"
                description="Add your first department to get started."
                action={
                  <button
                    onClick={() =>
                      navigate(
                        '/admin/departments/add',
                      )
                    }
                    className="bg-[#155ead] text-white font-bold text-[13px] px-[16px] py-[10px] rounded-[10px] hover:bg-[#1250a0] transition-colors cursor-pointer"
                  >
                    + Add Department
                  </button>
                }
              />
            )}

          {!loadingDepartments &&
            departments.map((department) => (
              <div
                key={department.id}
                className="grid grid-cols-[1fr_150px_80px_80px_60px_100px_100px] gap-[12px] items-center px-[20px] py-[14px] border-b border-[#d8e1ec] last:border-0 cursor-pointer hover:bg-[#f4f7fb] transition-colors"
                onClick={() =>
                  handleRowClick(department.id)
                }
              >
                <div className="flex gap-[10px] items-center min-w-0">
                  <div className="bg-[#eaf3fd] flex items-center justify-center rounded-[10px] size-[34px] shrink-0">
                    <p className="font-bold text-[#155ead] text-[11px]">
                      {department.name
                        .split(' ')
                        .map(
                          (word) => word[0],
                        )
                        .join('')
                        .slice(0, 2)}
                    </p>
                  </div>

                  <p className="font-semibold text-[#142033] text-[14px] truncate">
                    {department.name}
                  </p>
                </div>

                <p className="font-normal text-[#526176] text-[13px] truncate">
                  {department.head}
                </p>

                <p className="font-bold text-[#142033] text-[14px] text-center">
                  {department.doctors}
                </p>

                <p className="font-bold text-[#142033] text-[14px] text-center">
                  {department.patients}
                </p>

                <p className="font-bold text-[#142033] text-[14px] text-center">
                  {department.rooms}
                </p>

                <StatusBadge
                  status={department.status}
                />

                <div
                  className="flex gap-[6px]"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  <Button
                    variant="secondary"
                    onClick={(event) =>
                      handleEdit(
                        event,
                        department.id,
                      )
                    }
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