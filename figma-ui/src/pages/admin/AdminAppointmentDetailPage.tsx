import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';

type AppointmentStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Skipped';

interface BackendAppointment {
  id: number;
  patientName: string;
  patientPhone?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: string;
  status: string;
  priority: string;
  doctor?: { name?: string | null } | null;
  hospital?: { name?: string | null } | null;
}

const statusMap: Record<string, AppointmentStatus> = {
  WAITING: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  SKIPPED: 'Skipped',
};

function getStatus(status: string): AppointmentStatus {
  return statusMap[status.toUpperCase()] ?? 'Scheduled';
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-[4px]">
      <p className="font-semibold text-[#7b899c] text-[10px] uppercase">{label}</p>
      <p className="font-normal text-[#142033] text-[14px] break-words">{value}</p>
    </div>
  );
}

export default function AdminAppointmentDetailPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<BackendAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAppointment() {
      if (!appointmentId) {
        setError('Appointment not found.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/appointments/${appointmentId}`, { signal: controller.signal });
        if (response.status === 404) {
          setError('Appointment not found.');
          return;
        }
        if (!response.ok) throw new Error(`Unable to load appointment (${response.status})`);

        const data: unknown = await response.json();
        if (!data || typeof data !== 'object') throw new Error('The appointment response was invalid.');
        setAppointment(data as BackendAppointment);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load appointment.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void fetchAppointment();
    return () => controller.abort();
  }, [appointmentId]);

  if (loading) {
    return (
      <AdminLayout title="Appointment Details">
        <div className="py-[80px] text-center text-[#7b899c] text-[14px]">Loading appointment details...</div>
      </AdminLayout>
    );
  }

  if (error || !appointment) {
    return (
      <AdminLayout title="Appointment Details">
        <div className="flex flex-col items-center justify-center py-[80px] gap-[14px]">
          <p className="font-bold text-[#142033] text-[18px]">{error ?? 'Appointment not found.'}</p>
          <Button variant="secondary" onClick={() => navigate('/admin/appointments')}>Back to Appointments</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Appointment Details">
      <button
        onClick={() => navigate('/admin/appointments')}
        className="flex items-center gap-[8px] text-[#155ead] text-[13px] font-semibold mb-[24px] cursor-pointer hover:opacity-80 transition-opacity"
      >
        ← Back to Appointments
      </button>

      <div className="max-w-[760px]">
        <div className="mb-[24px]">
          <h1 className="font-bold text-[#142033] text-[24px] leading-tight">Appointment Details</h1>
          <p className="font-normal text-[#526176] text-[14px] mt-[4px]">{appointment.patientName}</p>
        </div>

        <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[24px]">
          <div className="flex items-start justify-between gap-[16px] pb-[20px] border-b border-[#d8e1ec]">
            <div>
              <p className="font-semibold text-[#7b899c] text-[10px] uppercase">Patient</p>
              <p className="font-bold text-[#142033] text-[18px] mt-[4px]">{appointment.patientName}</p>
            </div>
            <StatusBadge status={getStatus(appointment.status)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px] pt-[20px]">
            <DetailRow label="Token number" value={appointment.tokenNumber} />
            <DetailRow label="Patient phone" value={appointment.patientPhone ?? 'Not provided'} />
            <DetailRow label="Doctor" value={appointment.doctor?.name ?? 'Doctor not assigned'} />
            <DetailRow label="Hospital" value={appointment.hospital?.name ?? 'Hospital not assigned'} />
            <DetailRow label="Appointment date" value={appointment.appointmentDate} />
            <DetailRow label="Appointment time" value={appointment.appointmentTime} />
            <DetailRow label="Status" value={getStatus(appointment.status)} />
            <DetailRow label="Priority" value={appointment.priority} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}