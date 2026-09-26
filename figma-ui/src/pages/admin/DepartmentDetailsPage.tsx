import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';

const inputClass =
  'bg-white border border-[#d8e1ec] rounded-[10px] px-[14px] py-[11px] text-[14px] text-[#142033] placeholder:text-[#afc0d3] outline-none focus:border-[#155ead] transition-colors w-full';

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

interface BackendDoctor {
  id: number;
  name: string;
  specialization: string;
  status: 'Available' | 'Busy' | 'On Break' | 'Offline';
  consultationTime?: string | null;
  department?: {
    id?: number | null;
  } | null;
}

interface BackendAppointment {
  appointmentDate: string;
  doctor?: {
    id?: number | null;
  } | null;
}

interface DepartmentDoctor extends BackendDoctor {
  patients: number;
  room: string;
  shift: string;
}

function getTodayKey(): string {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export default function DepartmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const departmentId = Number(id);

  const [department, setDepartment] =
    useState<BackendDepartment | null>(null);

  const [departmentDoctors, setDepartmentDoctors] =
    useState<DepartmentDoctor[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [form, setForm] = useState({
    name: '',
    head: '',
    rooms: 0,
    status: 'Active' as DepartmentStatus,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDepartmentDetails() {
      try {
        setLoading(true);
        setError(null);

        if (!id || Number.isNaN(departmentId)) {
          throw new Error('Invalid department ID.');
        }

        const [
          departmentResponse,
          doctorResponse,
          appointmentResponse,
        ] = await Promise.all([
          fetch(`/api/departments/${departmentId}`, {
            signal: controller.signal,
          }),

          fetch('/api/doctors', {
            signal: controller.signal,
          }),

          fetch('/api/appointments', {
            signal: controller.signal,
          }),
        ]);

        if (!departmentResponse.ok) {
          throw new Error(
            `Unable to load department (${departmentResponse.status})`
          );
        }

        if (!doctorResponse.ok) {
          throw new Error(
            `Unable to load doctors (${doctorResponse.status})`
          );
        }

        if (!appointmentResponse.ok) {
          throw new Error(
            `Unable to load appointments (${appointmentResponse.status})`
          );
        }

        const departmentData: unknown =
          await departmentResponse.json();

        const doctorData: unknown =
          await doctorResponse.json();

        const appointmentData: unknown =
          await appointmentResponse.json();

        if (
          !departmentData ||
          typeof departmentData !== 'object' ||
          !Array.isArray(doctorData) ||
          !Array.isArray(appointmentData)
        ) {
          throw new Error(
            'The department details response was invalid.'
          );
        }

        const backendDepartment =
          departmentData as BackendDepartment;

        const doctors =
          doctorData as BackendDoctor[];

        const appointments =
          appointmentData as BackendAppointment[];

        setDepartment(backendDepartment);

        setForm({
          name: backendDepartment.name,
          head: backendDepartment.head ?? '',
          rooms: backendDepartment.rooms ?? 0,
          status: backendDepartment.status,
        });

        const todayKey = getTodayKey();

        const patientCountsByDoctor =
          new Map<number, number>();

        appointments.forEach((appointment) => {
          const doctorId = appointment.doctor?.id;

          if (
            doctorId &&
            appointment.appointmentDate === todayKey
          ) {
            patientCountsByDoctor.set(
              doctorId,
              (patientCountsByDoctor.get(doctorId) ?? 0) + 1
            );
          }
        });

        /*
         * Doctors are now selected using the real
         * department.id relationship.
         */
        const selectedDoctors =
          doctors.filter(
            (doctor) =>
              doctor.department?.id === departmentId
          );

        setDepartmentDoctors(
          selectedDoctors.map((doctor) => ({
            ...doctor,

            patients:
              patientCountsByDoctor.get(doctor.id) ?? 0,

            room: 'Room not assigned',

            shift: doctor.consultationTime
              ? `${doctor.consultationTime} consultation`
              : 'Consultation time not assigned',
          }))
        );
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
            : 'Unable to load department details.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchDepartmentDetails();

    return () => controller.abort();
  }, [id, departmentId]);

  const startEdit = () => {
    if (!department) {
      return;
    }

    setForm({
      name: department.name,
      head: department.head ?? '',
      rooms: department.rooms ?? 0,
      status: department.status,
    });

    setEditing(true);
  };

  const handleSave = async () => {
    if (!department) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(
        `/api/departments/${department.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name.trim(),
            head: form.head.trim(),
            rooms: Number(form.rooms),
            status: form.status,
            hospital: {
              id: department.hospital?.id ?? 1,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Unable to update department (${response.status})`
        );
      }

      const updatedDepartment =
        (await response.json()) as BackendDepartment;

      setDepartment(updatedDepartment);

      setForm({
        name: updatedDepartment.name,
        head: updatedDepartment.head ?? '',
        rooms: updatedDepartment.rooms ?? 0,
        status: updatedDepartment.status,
      });

      setEditing(false);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save department.'
      );
    } finally {
      setSaving(false);
    }
  };

  const set =
    (
      field: keyof typeof form
    ) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement
      >
    ) => {
      setForm((current) => ({
        ...current,
        [field]:
          field === 'rooms'
            ? Number(event.target.value)
            : event.target.value,
      }));
    };

  if (loading) {
    return (
      <AdminLayout title="Department Details">
        <div className="py-[80px] text-center text-[#7b899c] text-[14px]">
          Loading department details...
        </div>
      </AdminLayout>
    );
  }

  if (error || !department) {
    return (
      <AdminLayout title="Department Details">
        <div className="flex flex-col items-center justify-center py-[80px] gap-[12px]">
          <p className="font-bold text-[#142033] text-[18px]">
            {error ?? 'Department not found'}
          </p>

          <Button
            variant="secondary"
            onClick={() =>
              navigate('/admin/departments')
            }
          >
            Back to Departments
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const totalPatients =
    departmentDoctors.reduce(
      (total, doctor) =>
        total + doctor.patients,
      0
    );

  const activeDoctors =
    departmentDoctors.filter(
      (doctor) => doctor.status !== 'Offline'
    ).length;

  return (
    <AdminLayout title="Department Details">
      {/* Success toast */}
      {saved && (
        <div className="fixed top-[20px] right-[20px] z-50 bg-[#18865b] text-white px-[18px] py-[12px] rounded-[10px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.2)] font-semibold text-[13px]">
          Department updated successfully.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-[20px] bg-[#fef3f2] border border-[#f4c7cb] text-[#c53a45] px-[16px] py-[12px] rounded-[10px] text-[13px] font-semibold">
          {error}
        </div>
      )}

      {/* Back */}
      <button
        onClick={() =>
          navigate('/admin/departments')
        }
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

                  <p className="font-bold text-[#142033] text-[15px]">
                    Edit Department
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">

                  <div className="flex flex-col gap-[6px]">
                    <label className="font-semibold text-[#142033] text-[13px]">
                      Department Name
                    </label>

                    <input
                      value={form.name}
                      onChange={set('name')}
                      className={inputClass}
                    />
                  </div>

                  <div className="flex flex-col gap-[6px]">
                    <label className="font-semibold text-[#142033] text-[13px]">
                      Department Head
                    </label>

                    <input
                      value={form.head}
                      onChange={set('head')}
                      className={inputClass}
                    />
                  </div>

                  <div className="flex flex-col gap-[6px]">
                    <label className="font-semibold text-[#142033] text-[13px]">
                      Rooms
                    </label>

                    <input
                      type="number"
                      min={0}
                      value={form.rooms}
                      onChange={set('rooms')}
                      className={inputClass}
                    />
                  </div>

                  <div className="flex flex-col gap-[6px]">
                    <label className="font-semibold text-[#142033] text-[13px]">
                      Status
                    </label>

                    <select
                      value={form.status}
                      onChange={set('status')}
                      className={inputClass}
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-[10px] pt-[4px]">
                  <Button
                    variant="primary"
                    onClick={handleSave}
                  >
                    {saving
                      ? 'Saving...'
                      : 'Save Changes'}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() =>
                      setEditing(false)
                    }
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>

                <div className="flex items-start gap-[18px]">

                  <div className="bg-[#eaf3fd] flex items-center justify-center rounded-[14px] size-[56px] shrink-0">
                    <p className="font-bold text-[#155ead] text-[18px]">
                      {department.name
                        .split(' ')
                        .map((word) => word[0])
                        .join('')
                        .slice(0, 2)}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">

                    <div className="flex items-center gap-[12px] flex-wrap mb-[4px]">
                      <h1 className="font-bold text-[#142033] text-[22px]">
                        {department.name}
                      </h1>

                      <StatusBadge
                        status={department.status}
                      />
                    </div>

                    <p className="font-normal text-[#526176] text-[13px]">
                      Head:{' '}
                      {department.head ||
                        'Not assigned'}
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    onClick={startEdit}
                  >
                    Edit Department
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-[14px] mt-[20px] pt-[18px] border-t border-[#d8e1ec]">

                  {[
                    {
                      label: 'Doctors',
                      value: departmentDoctors.length,
                      bg: 'bg-[#eaf3fd]',
                      text: 'text-[#155ead]',
                    },
                    {
                      label: 'Active Patients',
                      value: totalPatients,
                      bg: 'bg-[#e8f7f1]',
                      text: 'text-[#18865b]',
                    },
                    {
                      label: 'Rooms',
                      value: department.rooms ?? 0,
                      bg: 'bg-[#f4f7fb]',
                      text: 'text-[#526176]',
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className={`${metric.bg} rounded-[14px] p-[18px] flex flex-col items-center`}
                    >
                      <p
                        className={`font-bold text-[32px] ${metric.text}`}
                      >
                        {metric.value}
                      </p>

                      <p className="font-normal text-[#526176] text-[12px] mt-[4px]">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Doctors */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">

            <div className="overflow-x-auto">

              <div className="px-[20px] py-[16px] border-b border-[#d8e1ec]">
                <p className="font-bold text-[#142033] text-[16px]">
                  Doctors in {department.name}
                </p>

                <p className="font-normal text-[#7b899c] text-[11px] mt-[2px]">
                  {departmentDoctors.length}{' '}
                  doctor
                  {departmentDoctors.length !== 1
                    ? 's'
                    : ''}{' '}
                  assigned
                </p>
              </div>

              {departmentDoctors.length === 0 ? (
                <div className="px-[20px] py-[32px] text-center">
                  <p className="font-normal text-[#7b899c] text-[14px]">
                    No doctors currently assigned
                    to this department.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-[1fr_130px_100px_80px] gap-[16px] px-[20px] py-[10px] bg-[#f4f7fb] border-b border-[#d8e1ec]">
                    {[
                      'Name',
                      'Specialization',
                      'Status',
                      'Patients',
                    ].map((heading) => (
                      <p
                        key={heading}
                        className="font-semibold text-[#7b899c] text-[11px] uppercase"
                      >
                        {heading}
                      </p>
                    ))}
                  </div>

                  {departmentDoctors.map(
                    (doctor) => (
                      <div
                        key={doctor.id}
                        className="grid grid-cols-[1fr_130px_100px_80px] gap-[16px] items-center px-[20px] py-[13px] border-b border-[#d8e1ec] last:border-0 hover:bg-[#f4f7fb] transition-colors"
                      >
                        <div className="flex gap-[10px] items-center min-w-0">

                          <div className="bg-[#eaf3fd] flex items-center justify-center rounded-[999px] size-[32px] shrink-0">
                            <p className="font-bold text-[#155ead] text-[11px]">
                              {doctor.name
                                .replace(
                                  'Dr. ',
                                  ''
                                )
                                .split(' ')
                                .map(
                                  (word) =>
                                    word[0]
                                )
                                .join('')
                                .slice(0, 2)}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-[#142033] text-[13px] truncate">
                              {doctor.name}
                            </p>

                            <p className="font-normal text-[#7b899c] text-[11px]">
                              {doctor.room} ·{' '}
                              {doctor.shift}
                            </p>
                          </div>
                        </div>

                        <p className="font-normal text-[#526176] text-[13px] truncate">
                          {doctor.specialization}
                        </p>

                        <StatusBadge
                          status={doctor.status}
                        />

                        <p className="font-bold text-[#142033] text-[14px]">
                          {doctor.patients}
                        </p>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-[260px] lg:shrink-0 flex flex-col gap-[14px]">

          {/* Quick Info */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

            <p className="font-bold text-[#142033] text-[15px] mb-[14px]">
              Quick Info
            </p>

            <div className="flex flex-col gap-[12px]">

              {[
                {
                  label: 'Department Head',
                  value:
                    department.head ||
                    'Not assigned',
                },
                {
                  label: 'Status',
                  value: department.status,
                },
                {
                  label: 'Total Rooms',
                  value: String(
                    department.rooms ?? 0
                  ),
                },
                {
                  label: 'Active Doctors',
                  value: String(
                    activeDoctors
                  ),
                },
              ].map((row) => (
                <div key={row.label}>

                  <p className="font-semibold text-[#7b899c] text-[10px] uppercase mb-[2px]">
                    {row.label}
                  </p>

                  {row.label === 'Status' ? (
                    <StatusBadge
                      status={row.value}
                    />
                  ) : (
                    <p className="font-normal text-[#142033] text-[13px]">
                      {row.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Status */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

            <p className="font-bold text-[#142033] text-[15px] mb-[14px]">
              Doctor Status Breakdown
            </p>

            {(
              [
                'Available',
                'Busy',
                'On Break',
                'Offline',
              ] as const
            ).map((status) => {

              const count =
                departmentDoctors.filter(
                  (doctor) =>
                    doctor.status === status
                ).length;

              return (
                <div
                  key={status}
                  className="flex items-center justify-between py-[6px] border-b border-[#f4f7fb] last:border-0"
                >
                  <StatusBadge status={status} />

                  <p className="font-bold text-[#142033] text-[14px]">
                    {count}
                  </p>
                </div>
              );
            })}
          </div>

          <Button
            variant="ghost"
            className="w-full justify-center"
            onClick={() =>
              navigate('/admin/departments')
            }
          >
            Back to Departments
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}