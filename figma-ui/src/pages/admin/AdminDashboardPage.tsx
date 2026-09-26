import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminLayout from '../../components/AdminLayout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import PatientInitials from '../../components/PatientInitials';
import Button from '../../components/Button';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkAdminDashboard } from '../../components/Skeleton';

const imgUsers = '/assets/b6d92.svg';
const imgUsers2 = '/assets/014f4.svg';
const imgCalendar2 = '/assets/cd244.svg';
const imgCalendar1 = '/assets/a41a3.svg';

type DashboardAppointmentStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'Skipped';

interface BackendDoctor {
  id: number;
  name: string;
  specialization: string;
  qualification?: string | null;
  experience?: string | null;
  status: string;
  consultationTime?: string | null;

  hospital?: {
    id?: number | null;
    name?: string | null;
  } | null;

  department?: {
    id?: number | null;
    name?: string | null;
  } | null;
}

interface BackendDepartment {
  id: number;
  name: string;
  head?: string | null;
  rooms?: number | null;
  status: string;

  hospital?: {
    id?: number | null;
    name?: string | null;
  } | null;
}

interface BackendAppointment {
  id: number;
  patientName: string;
  patientPhone?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  tokenNumber: string;

  doctor?: {
    id?: number | null;
    name?: string | null;
    specialization?: string | null;

    department?: {
      id?: number | null;
      name?: string | null;
    } | null;
  } | null;

  hospital?: {
    id?: number | null;
    name?: string | null;
  } | null;

  priority: string;
}

interface DashboardDoctor extends BackendDoctor {
  patients: number;
}

interface DashboardDepartment extends BackendDepartment {
  doctors: number;
}

interface DashboardAppointment extends BackendAppointment {
  status: DashboardAppointmentStatus;
  initials: string;
}

interface QueueGroup {
  doctorId: number;
  doctorName: string;
  specialization: string;
  departmentName: string;
  current: DashboardAppointment | null;
  waiting: DashboardAppointment[];
}

const statusMap: Record<string, DashboardAppointmentStatus> = {
  WAITING: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  SKIPPED: 'Skipped',
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getPriorityValue(priority: string): number {
  switch (priority.toUpperCase()) {
    case 'EMERGENCY':
      return 3;

    case 'PRIORITY':
      return 2;

    case 'NORMAL':
    default:
      return 1;
  }
}

function getPriorityLabel(priority: string): string {
  switch (priority.toUpperCase()) {
    case 'EMERGENCY':
      return 'Emergency';

    case 'PRIORITY':
      return 'Priority';

    case 'NORMAL':
    default:
      return 'Normal';
  }
}

function getPriorityClass(priority: string): string {
  switch (priority.toUpperCase()) {
    case 'EMERGENCY':
      return 'bg-[#fff1f2] text-[#c53a45]';

    case 'PRIORITY':
      return 'bg-[#fff7e6] text-[#a66b00]';

    case 'NORMAL':
    default:
      return 'bg-[#f4f7fb] text-[#526176]';
  }
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const loading = usePageLoad(900);

  const [doctors, setDoctors] = useState<DashboardDoctor[]>([]);
  const [departments, setDepartments] = useState<DashboardDepartment[]>([]);
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDashboardData() {
      try {
        setDashboardLoading(true);
        setDashboardError(null);

        const [
          doctorsResponse,
          departmentsResponse,
          appointmentsResponse,
        ] = await Promise.all([
          fetch('/api/doctors', {
            signal: controller.signal,
          }),

          fetch('/api/departments', {
            signal: controller.signal,
          }),

          fetch('/api/appointments', {
            signal: controller.signal,
          }),
        ]);

        if (!doctorsResponse.ok) {
          throw new Error(
            `Unable to load doctors (${doctorsResponse.status})`
          );
        }

        if (!departmentsResponse.ok) {
          throw new Error(
            `Unable to load departments (${departmentsResponse.status})`
          );
        }

        if (!appointmentsResponse.ok) {
          throw new Error(
            `Unable to load appointments (${appointmentsResponse.status})`
          );
        }

        const doctorsData: unknown =
          await doctorsResponse.json();

        const departmentsData: unknown =
          await departmentsResponse.json();

        const appointmentsData: unknown =
          await appointmentsResponse.json();

        if (!Array.isArray(doctorsData)) {
          throw new Error('The doctors response was invalid.');
        }

        if (!Array.isArray(departmentsData)) {
          throw new Error('The departments response was invalid.');
        }

        if (!Array.isArray(appointmentsData)) {
          throw new Error('The appointments response was invalid.');
        }

        const backendDoctors =
          doctorsData as BackendDoctor[];

        const backendDepartments =
          departmentsData as BackendDepartment[];

        const backendAppointments =
          appointmentsData as BackendAppointment[];

        const todayKey = getDateKey(new Date());

        const todayAppointments =
          backendAppointments.filter(
            (appointment) =>
              appointment.appointmentDate === todayKey
          );

        const dashboardDoctors: DashboardDoctor[] =
          backendDoctors.map((doctor) => {
            const patientsToday =
              todayAppointments.filter(
                (appointment) =>
                  appointment.doctor?.id === doctor.id
              ).length;

            return {
              ...doctor,
              patients: patientsToday,
            };
          });

        const dashboardDepartments: DashboardDepartment[] =
          backendDepartments.map((department) => {
            const doctorCount =
              backendDoctors.filter(
                (doctor) =>
                  doctor.department?.id === department.id
              ).length;

            return {
              ...department,
              doctors: doctorCount,
            };
          });

        const dashboardAppointments: DashboardAppointment[] =
          backendAppointments.map((appointment) => ({
            ...appointment,

            status:
              statusMap[
                appointment.status.toUpperCase()
              ] ?? 'Scheduled',

            initials: getInitials(
              appointment.patientName
            ),
          }));

        setDoctors(dashboardDoctors);
        setDepartments(dashboardDepartments);
        setAppointments(dashboardAppointments);

      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return;
        }

        setDashboardError(
          error instanceof Error
            ? error.message
            : 'Unable to load dashboard data.'
        );

      } finally {
        if (!controller.signal.aborted) {
          setDashboardLoading(false);
        }
      }
    }

    void fetchDashboardData();

    return () => controller.abort();
  }, []);

  const today = new Date();

  const formattedToday =
    new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(today);

  const todayKey = getDateKey(today);

  const todaysAppointments = useMemo(() => {
    return appointments
      .filter(
        (appointment) =>
          appointment.appointmentDate === todayKey
      )
      .sort(
        (first, second) =>
          first.appointmentTime.localeCompare(
            second.appointmentTime
          )
      );
  }, [appointments, todayKey]);

  /*
   * =====================================================
   * LIVE OPD QUEUE
   * =====================================================
   *
   * WAITING      -> Waiting queue
   * IN_PROGRESS  -> Currently serving
   *
   * Priority:
   * EMERGENCY > PRIORITY > NORMAL
   */

  const queueGroups = useMemo<QueueGroup[]>(() => {
    const groups = new Map<number, QueueGroup>();

    todaysAppointments.forEach((appointment) => {
      const doctorId = appointment.doctor?.id;

      if (!doctorId) {
        return;
      }

      const doctorName =
        appointment.doctor?.name ||
        'Doctor not assigned';

      const specialization =
        appointment.doctor?.specialization ||
        'General Consultation';

      const departmentName =
        appointment.doctor?.department?.name ||
        'Department not assigned';

      if (!groups.has(doctorId)) {
        groups.set(doctorId, {
          doctorId,
          doctorName,
          specialization,
          departmentName,
          current: null,
          waiting: [],
        });
      }

      const group = groups.get(doctorId);

      if (!group) {
        return;
      }

      /*
       * IMPORTANT:
       *
       * appointment.status is already converted
       * by statusMap.
       *
       * Therefore we must compare with:
       *
       * "In Progress"
       * "Scheduled"
       *
       * NOT:
       *
       * "IN_PROGRESS"
       * "WAITING"
       */

      const appointmentStatus =
        appointment.status;

      if (appointmentStatus === 'In Progress') {
        group.current = appointment;

      } else if (appointmentStatus === 'Scheduled') {
        group.waiting.push(appointment);
      }
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,

        waiting: [...group.waiting].sort((a, b) => {
          const priorityDifference =
            getPriorityValue(b.priority) -
            getPriorityValue(a.priority);

          if (priorityDifference !== 0) {
            return priorityDifference;
          }

          return (
            a.appointmentTime.localeCompare(
              b.appointmentTime
            )
          );
        }),
      }))
      .filter(
        (group) =>
          group.current !== null ||
          group.waiting.length > 0
      );
  }, [todaysAppointments]);

  const totalWaitingPatients =
    queueGroups.reduce(
      (total, group) =>
        total + group.waiting.length,
      0
    );

  const totalServingDoctors =
    queueGroups.filter(
      (group) => group.current !== null
    ).length;

  const completedToday =
    todaysAppointments.filter(
      (appointment) =>
        appointment.status === 'Completed'
    ).length;

  const availableDoctors =
    doctors.filter(
      (doctor) =>
        doctor.status.toLowerCase() === 'available'
    ).length;

  const activeDepartments =
    departments.filter(
      (department) =>
        department.status.toLowerCase() === 'active'
    ).length;

  const hospitalName =
    doctors.find(
      (doctor) => doctor.hospital?.name
    )?.hospital?.name ||
    departments.find(
      (department) => department.hospital?.name
    )?.hospital?.name ||
    'HospitalFlow';

  if (
    (loading || dashboardLoading) &&
    !dashboardError
  ) {
    return (
      <AdminLayout title="Admin Dashboard">
        <SkAdminDashboard />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Dashboard">

      {/* ==================== HEADER ==================== */}

      <div className="flex flex-wrap items-start gap-[12px] justify-between mb-[20px]">

        <div>

          <h1 className="font-bold text-[#142033] text-[24px] leading-tight mb-[6px]">
            Good morning, Admin
          </h1>

          <p className="font-normal text-[#526176] text-[14px]">
            {hospitalName} overview for today.
          </p>

        </div>

        <div className="bg-white border border-[#d8e1ec] flex gap-[8px] items-center px-[14px] py-[9px] rounded-[8px]">

          <div className="relative shrink-0 size-[15px]">

            <img
              alt=""
              className="absolute block inset-0 size-full"
              src={imgCalendar1}
            />

          </div>

          <p className="font-semibold text-[#142033] text-[12px] whitespace-nowrap">
            {formattedToday}
          </p>

        </div>

      </div>

      {/* ==================== ERROR ==================== */}

      {dashboardError && (
        <div className="mb-[20px] bg-[#fff1f2] border border-[#fecdd3] rounded-[10px] px-[16px] py-[12px]">

          <p className="font-semibold text-[#c53a45] text-[13px]">
            Unable to load dashboard data
          </p>

          <p className="font-normal text-[#c53a45] text-[12px] mt-[3px]">
            {dashboardError}
          </p>

        </div>
      )}

      {/* ==================== STATS ==================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[14px] mb-[24px]">

        <StatCard
          icon={
            <img
              alt=""
              className="size-[20px]"
              src={imgUsers2}
            />
          }
          iconBg="bg-[#2475d0]"
          label="Total Doctors"
          value={doctors.length}
          sub={`${availableDoctors} available now`}
        />

        <StatCard
          icon={
            <img
              alt=""
              className="size-[20px]"
              src={imgUsers}
            />
          }
          iconBg="bg-[#6750a4]"
          label="Departments"
          value={departments.length}
          sub={`${activeDepartments} active`}
        />

        <StatCard
          icon={
            <img
              alt=""
              className="size-[20px]"
              src={imgCalendar2}
            />
          }
          iconBg="bg-[#155ead]"
          label="Today's Appointments"
          value={todaysAppointments.length}
          sub={`${completedToday} completed`}
        />

      </div>

      {/* ==================== MAIN CONTENT ==================== */}

      <div className="flex flex-col lg:flex-row gap-[14px] lg:gap-[18px]">

        {/* ==================== DOCTOR STATUS ==================== */}

        <div className="flex-1 min-w-0">

          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">

            <div className="px-[20px] py-[16px] border-b border-[#d8e1ec] flex items-center justify-between">

              <div>

                <p className="font-bold text-[#142033] text-[16px]">
                  Doctor Status
                </p>

                <p className="font-normal text-[#7b899c] text-[11px] mt-[2px]">
                  Real-time availability
                </p>

              </div>

              <Button
                variant="secondary"
                onClick={() =>
                  navigate('/admin/doctors')
                }
              >
                Manage Doctors →
              </Button>

            </div>

            <div className="grid grid-cols-[1fr_140px_110px_80px] gap-[16px] px-[20px] py-[10px] bg-[#f4f7fb] border-b border-[#d8e1ec]">

              {[
                'Doctor',
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

            {doctors.length === 0 ? (

              <div className="px-[20px] py-[24px]">

                <p className="font-normal text-[#7b899c] text-[12px]">
                  No doctors found.
                </p>

              </div>

            ) : (

              doctors
                .slice(0, 6)
                .map((doctor) => (

                  <div
                    key={doctor.id}
                    className="grid grid-cols-[1fr_140px_110px_80px] gap-[16px] items-center px-[20px] py-[12px] border-b border-[#d8e1ec] last:border-0 hover:bg-[#f4f7fb] transition-colors cursor-pointer"
                    onClick={() =>
                      navigate('/admin/doctors')
                    }
                  >

                    <div className="flex gap-[10px] items-center min-w-0">

                      <div className="bg-[#eaf3fd] flex items-center justify-center rounded-[999px] shrink-0 size-[32px]">

                        <p className="font-bold text-[#155ead] text-[11px]">
                          {getInitials(
                            doctor.name.replace(
                              /^Dr\.\s*/i,
                              ''
                            )
                          )}
                        </p>

                      </div>

                      <div className="min-w-0">

                        <p className="font-semibold text-[#142033] text-[13px] truncate">
                          {doctor.name}
                        </p>

                        <p className="font-normal text-[#7b899c] text-[11px]">
                          {doctor.department?.name ||
                            'Department not assigned'}
                        </p>

                      </div>

                    </div>

                    <p className="font-normal text-[#526176] text-[13px] truncate">
                      {doctor.specialization}
                    </p>

                    <StatusBadge status={doctor.status} />

                    <p className="font-bold text-[#142033] text-[14px]">
                      {doctor.patients}
                    </p>

                  </div>

                ))

            )}

          </div>

        </div>

        {/* ==================== RIGHT COLUMN ==================== */}

        <div className="w-full lg:w-[300px] lg:shrink-0 flex flex-col gap-[14px]">

          {/* ==================== DEPARTMENTS ==================== */}

          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

            <div className="flex items-center justify-between mb-[14px]">

              <p className="font-bold text-[#142033] text-[15px]">
                Departments
              </p>

              <button
                onClick={() =>
                  navigate('/admin/departments')
                }
                className="text-[#155ead] text-[12px] font-semibold cursor-pointer hover:opacity-80"
              >
                View all →
              </button>

            </div>

            {departments.length === 0 ? (

              <p className="font-normal text-[#7b899c] text-[12px]">
                No departments found.
              </p>

            ) : (

              departments
                .slice(0, 4)
                .map((department) => (

                  <div
                    key={department.id}
                    className="flex items-center justify-between py-[9px] border-t border-[#d8e1ec] first:border-0 cursor-pointer hover:bg-[#f4f7fb] -mx-[18px] px-[18px] rounded-[8px] transition-colors"
                    onClick={() =>
                      navigate(
                        `/admin/departments/${department.id}`
                      )
                    }
                  >

                    <div className="flex gap-[8px] items-center min-w-0">

                      <div className="bg-[#eaf3fd] flex items-center justify-center rounded-[10px] size-[28px] shrink-0">

                        <p className="font-bold text-[#155ead] text-[10px]">
                          {getInitials(
                            department.name
                          )}
                        </p>

                      </div>

                      <p className="font-semibold text-[#142033] text-[13px] truncate">
                        {department.name}
                      </p>

                    </div>

                    <div className="flex items-center gap-[8px] shrink-0">

                      <p className="font-normal text-[#7b899c] text-[11px]">
                        {department.doctors} drs
                      </p>

                      <StatusBadge
                        status={department.status}
                        showDot={false}
                      />

                    </div>

                  </div>

                ))

            )}

          </div>

          {/* ==================== TODAY'S APPOINTMENTS ==================== */}

          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

            <p className="font-bold text-[#142033] text-[15px] mb-[14px]">
              Today's Appointments
            </p>

            {dashboardLoading ? (

              <p className="font-normal text-[#7b899c] text-[12px]">
                Loading appointments...
              </p>

            ) : todaysAppointments.length === 0 ? (

              <p className="font-normal text-[#7b899c] text-[12px]">
                No appointments today.
              </p>

            ) : (

              todaysAppointments
                .slice(0, 4)
                .map((appointment) => (

                  <div
                    key={appointment.id}
                    className="flex gap-[10px] items-center py-[10px] border-t border-[#d8e1ec] first:border-0"
                  >

                    <PatientInitials
                      initials={appointment.initials}
                      size="sm"
                    />

                    <div className="flex-1 min-w-0">

                      <p className="font-semibold text-[#142033] text-[13px] truncate">
                        {appointment.patientName}
                      </p>

                      <p className="font-normal text-[#7b899c] text-[11px]">
                        {appointment.appointmentTime} · OPD Consultation
                      </p>

                    </div>

                    <StatusBadge
                      status={appointment.status}
                      showDot={false}
                    />

                  </div>

                ))

            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          LIVE OPD QUEUE
      ===================================================== */}

      <div className="mt-[18px]">

        <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">

          {/* Queue Header */}

          <div className="px-[20px] py-[16px] border-b border-[#d8e1ec] flex flex-wrap items-center justify-between gap-[12px]">

            <div>

              <div className="flex items-center gap-[8px]">

                <p className="font-bold text-[#142033] text-[16px]">
                  Live OPD Queue
                </p>

                <span className="flex items-center gap-[5px] bg-[#e8f7f1] text-[#18865b] px-[8px] py-[3px] rounded-full text-[10px] font-semibold">

                  <span className="size-[6px] rounded-full bg-[#18865b]" />

                  LIVE

                </span>

              </div>

              <p className="font-normal text-[#7b899c] text-[11px] mt-[3px]">
                Real-time patient queue for today's OPD
              </p>

            </div>

            <div className="flex items-center gap-[8px]">

              <div className="bg-[#eaf3fd] rounded-[8px] px-[10px] py-[7px]">

                <p className="font-bold text-[#155ead] text-[13px]">
                  {totalServingDoctors}
                </p>

                <p className="font-normal text-[#7b899c] text-[9px]">
                  Serving
                </p>

              </div>

              <div className="bg-[#fff7e6] rounded-[8px] px-[10px] py-[7px]">

                <p className="font-bold text-[#a66b00] text-[13px]">
                  {totalWaitingPatients}
                </p>

                <p className="font-normal text-[#7b899c] text-[9px]">
                  Waiting
                </p>

              </div>

            </div>

          </div>

          {/* Queue Content */}

          {queueGroups.length === 0 ? (

            <div className="px-[20px] py-[34px] text-center">

              <div className="bg-[#f4f7fb] mx-auto mb-[10px] flex items-center justify-center rounded-full size-[44px]">

                <span className="text-[20px]">
                  🏥
                </span>

              </div>

              <p className="font-semibold text-[#142033] text-[14px]">
                No active OPD queue
              </p>

              <p className="font-normal text-[#7b899c] text-[12px] mt-[4px]">
                There are no waiting or in-progress patients right now.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-[#d8e1ec]">

              {queueGroups.map((group) => (

                <div
                  key={group.doctorId}
                  className="px-[20px] py-[16px]"
                >

                  {/* Doctor heading */}

                  <div className="flex flex-wrap items-center justify-between gap-[10px] mb-[14px]">

                    <div className="flex items-center gap-[10px]">

                      <div className="bg-[#eaf3fd] flex items-center justify-center rounded-full size-[36px]">

                        <p className="font-bold text-[#155ead] text-[11px]">
                          {getInitials(
                            group.doctorName.replace(
                              /^Dr\.\s*/i,
                              ''
                            )
                          )}
                        </p>

                      </div>

                      <div>

                        <p className="font-semibold text-[#142033] text-[14px]">
                          {group.doctorName}
                        </p>

                        <p className="font-normal text-[#7b899c] text-[11px]">
                          {group.departmentName} · {group.specialization}
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-[6px]">

                      <span className="bg-[#f4f7fb] text-[#526176] rounded-full px-[9px] py-[4px] text-[10px] font-semibold">
                        {group.waiting.length} waiting
                      </span>

                    </div>

                  </div>

                  {/* Queue columns */}

                  <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-[12px]">

                    {/* Currently serving */}

                    <div className="border border-[#d8e1ec] rounded-[10px] p-[12px] bg-[#f8fbff]">

                      <p className="font-semibold text-[#7b899c] text-[10px] uppercase mb-[8px]">
                        Currently Serving
                      </p>

                      {group.current ? (

                        <div className="flex items-center gap-[9px]">

                          <div className="bg-[#2475d0] text-white flex items-center justify-center rounded-[8px] w-[48px] h-[36px]">

                            <p className="font-bold text-[11px]">
                              {group.current.tokenNumber}
                            </p>

                          </div>

                          <div className="min-w-0">

                            <p className="font-semibold text-[#142033] text-[13px] truncate">
                              {group.current.patientName}
                            </p>

                            <p className="font-normal text-[#7b899c] text-[10px]">
                              In consultation
                            </p>

                          </div>

                        </div>

                      ) : (

                        <div>

                          <p className="font-semibold text-[#526176] text-[13px]">
                            No patient
                          </p>

                          <p className="font-normal text-[#7b899c] text-[10px] mt-[2px]">
                            Doctor is not serving anyone
                          </p>

                        </div>

                      )}

                    </div>

                    {/* Waiting queue */}

                    <div className="border border-[#d8e1ec] rounded-[10px] p-[12px]">

                      <div className="flex items-center justify-between mb-[8px]">

                        <p className="font-semibold text-[#7b899c] text-[10px] uppercase">
                          Waiting Queue
                        </p>

                        <p className="font-normal text-[#7b899c] text-[10px]">
                          {group.waiting.length} patients
                        </p>

                      </div>

                      {group.waiting.length === 0 ? (

                        <div className="py-[8px]">

                          <p className="font-normal text-[#7b899c] text-[11px]">
                            No patients waiting.
                          </p>

                        </div>

                      ) : (

                        <div className="flex flex-wrap gap-[8px]">

                          {group.waiting
                            .slice(0, 8)
                            .map((patient, index) => (

                              <div
                                key={patient.id}
                                className="flex items-center gap-[7px] border border-[#d8e1ec] rounded-[8px] px-[8px] py-[7px] bg-white"
                              >

                                <div className="bg-[#eaf3fd] flex items-center justify-center rounded-[6px] w-[40px] h-[28px]">

                                  <p className="font-bold text-[#155ead] text-[10px]">
                                    {patient.tokenNumber}
                                  </p>

                                </div>

                                <div className="min-w-0 max-w-[130px]">

                                  <p className="font-semibold text-[#142033] text-[11px] truncate">
                                    {patient.patientName}
                                  </p>

                                  <div className="flex items-center gap-[5px]">

                                    <p className="font-normal text-[#7b899c] text-[9px]">
                                      #{index + 1}
                                    </p>

                                    <span
                                      className={`px-[5px] py-[1px] rounded-full text-[8px] font-semibold ${getPriorityClass(
                                        patient.priority
                                      )}`}
                                    >
                                      {getPriorityLabel(
                                        patient.priority
                                      )}
                                    </span>

                                  </div>

                                </div>

                              </div>

                            ))}

                          {group.waiting.length > 8 && (

                            <div className="flex items-center justify-center border border-dashed border-[#cbd5e1] rounded-[8px] px-[10px] py-[7px]">

                              <p className="font-semibold text-[#526176] text-[10px]">
                                +{group.waiting.length - 8} more
                              </p>

                            </div>

                          )}

                        </div>

                      )}

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </AdminLayout>
  );
}