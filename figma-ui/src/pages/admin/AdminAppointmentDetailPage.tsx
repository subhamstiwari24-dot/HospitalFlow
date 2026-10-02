import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { AdminApiError, cancelAdminAppointment, getAdminAppointment, getAdminPayment, updateAdminAppointmentStatus } from '../../services/adminApi';
import type { AdminAppointment, AdminPayment } from '../../types/admin';

const statusLabels: Record<string, string> = { WAITING: 'Waiting', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };
const displayStatus = (status: string) => statusLabels[status.toUpperCase()] ?? status;

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-col gap-[4px]"><p className="font-semibold text-[#7b899c] text-[10px] uppercase">{label}</p><p className="text-[#142033] text-[14px] break-words">{value}</p></div>;
}

export default function AdminAppointmentDetailPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AdminAppointment | null>(null);
  const [payment, setPayment] = useState<AdminPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = useCallback(async (signal?: AbortSignal) => {
    if (!appointmentId) throw new Error('Appointment not found.');
    const id = Number(appointmentId);
    setAppointment(await getAdminAppointment(id, signal));
    try { setPayment(await getAdminPayment(id, signal)); } catch (paymentError) {
      if (paymentError instanceof AdminApiError && paymentError.status === 404) setPayment(null);
      else throw paymentError;
    }
  }, [appointmentId]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
    void loadDetails(controller.signal).catch((loadError) => {
      if (loadError instanceof DOMException && loadError.name === 'AbortError') return;
      if (loadError instanceof AdminApiError && loadError.status === 401) setError('Session expired. Please login again.');
      else if (loadError instanceof AdminApiError && loadError.status === 403) setError('You are not authorized to view this appointment.');
      else if (loadError instanceof AdminApiError && loadError.status === 404) setError('Appointment not found.');
      else setError('Unable to load appointment details.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [loadDetails]);

  const changeStatus = async (status: 'IN_PROGRESS' | 'COMPLETED') => {
    if (!appointment) return;
    setActionLoading(true); setError(null);
    try { setAppointment(await updateAdminAppointmentStatus(appointment.id, status)); } catch { setError('Unable to update appointment status.'); } finally { setActionLoading(false); }
  };

  const cancel = async () => {
    if (!appointment || !window.confirm('Are you sure you want to cancel this appointment?')) return;
    setActionLoading(true); setError(null);
    try { await cancelAdminAppointment(appointment.id); await loadDetails(); } catch { setError('Unable to cancel appointment.'); } finally { setActionLoading(false); }
  };

  if (loading) return <AdminLayout title="Appointment Details"><div className="py-[80px] text-center text-[#7b899c] text-[14px]">Loading appointment details...</div></AdminLayout>;
  if (error || !appointment) return <AdminLayout title="Appointment Details"><div className="flex flex-col items-center justify-center py-[80px] gap-[14px]"><p className="font-bold text-[#142033] text-[18px]">{error ?? 'Appointment not found.'}</p><Button variant="secondary" onClick={() => navigate('/admin/appointments')}>Back to Appointments</Button></div></AdminLayout>;

  const status = appointment.status.toUpperCase();
  return <AdminLayout title="Appointment Details">
    <button onClick={() => navigate('/admin/appointments')} className="flex items-center gap-[8px] text-[#155ead] text-[13px] font-semibold mb-[24px] cursor-pointer">← Back to Appointments</button>
    <div className="flex flex-wrap items-start justify-between gap-4 mb-[24px]"><div><h1 className="font-bold text-[#142033] text-[24px] leading-tight">Appointment Details</h1><p className="text-[#526176] text-[14px] mt-[4px]">{appointment.patientName}</p></div><StatusBadge status={displayStatus(appointment.status)} /></div>
    {error && <div className="mb-4 rounded-[10px] border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-[13px] text-[#c53a45]">{error}</div>}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
      <section className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[24px]"><h2 className="font-bold text-[#142033] text-[16px] mb-5">Patient & appointment</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-5"><DetailRow label="Patient" value={appointment.patientName} /><DetailRow label="Age" value={appointment.patientAge == null ? 'Not provided' : String(appointment.patientAge)} /><DetailRow label="Phone" value={appointment.patientPhone ?? 'Not provided'} /><DetailRow label="Token" value={appointment.tokenNumber} /><DetailRow label="Date" value={appointment.appointmentDate} /><DetailRow label="Time" value={appointment.appointmentTime} /><DetailRow label="Priority" value={appointment.priority} /><DetailRow label="Reason" value={appointment.reasonForVisit ?? 'Not provided'} /></div></section>
      <section className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[24px]"><h2 className="font-bold text-[#142033] text-[16px] mb-5">Doctor, hospital & payment</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-5"><DetailRow label="Doctor" value={appointment.doctor?.name ?? 'Not assigned'} /><DetailRow label="Specialization" value={appointment.doctor?.specialization ?? 'Not provided'} /><DetailRow label="Hospital" value={appointment.hospital?.name ?? 'Not assigned'} /><DetailRow label="Amount" value={payment ? `${payment.currency} ${payment.amount}` : 'Not recorded'} /><DetailRow label="Payment method" value={payment?.paymentMethod ?? 'Not recorded'} /><DetailRow label="Payment status" value={payment?.paymentStatus ?? 'Not recorded'} /><DetailRow label="Refund status" value={payment?.refundStatus ?? 'Not applicable'} /><DetailRow label="Razorpay payment ID" value={payment?.razorpayPaymentId ?? 'Not available'} /><DetailRow label="Razorpay refund ID" value={payment?.razorpayRefundId ?? 'Not available'} /></div></section>
    </div>
    <div className="flex flex-wrap gap-2 mt-5">{status === 'WAITING' && <Button variant="primary" disabled={actionLoading} onClick={() => void changeStatus('IN_PROGRESS')}>Mark in progress</Button>}{status === 'IN_PROGRESS' && <Button variant="success" disabled={actionLoading} onClick={() => void changeStatus('COMPLETED')}>Mark completed</Button>}{status !== 'CANCELLED' && status !== 'COMPLETED' && <Button variant="danger" disabled={actionLoading} onClick={() => void cancel()}>Cancel appointment</Button>}</div>
  </AdminLayout>;
}