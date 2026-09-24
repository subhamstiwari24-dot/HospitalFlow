import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/PatientLayout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { usePatient } from '../../context/PatientContext';
import { usePageLoad } from '../../hooks/usePageLoad';

export default function BookingConfirmationPage() {
  const navigate = useNavigate();
  const { booking, patientName } = usePatient();
  const loading = usePageLoad(800);

  useEffect(() => {
    if (!booking) navigate('/patient/hospital');
  }, [booking, navigate]);

  if (!booking) return null;

  if (loading) return (
    <PatientLayout step={4} showBack={false} maxWidth="max-w-[720px]">
      <div className="flex flex-col items-center justify-center py-[64px] gap-[16px]">
        <div className="size-[48px] rounded-full border-[3px] border-[#d8e1ec] border-t-[#155ead] animate-spin" />
        <p className="font-semibold text-[#526176] text-[14px]">Preparing your booking…</p>
      </div>
    </PatientLayout>
  );

  return (
    <PatientLayout step={4} showBack={false} maxWidth="max-w-[720px]">
      {/* Success hero */}
      <div className="text-center mb-[32px]">
        <div className="bg-[#e8f7f1] size-[80px] rounded-[999px] flex items-center justify-center mx-auto mb-[20px]">
          <span className="text-[#18865b] text-[36px]">✓</span>
        </div>
        <h1 className="font-bold text-[#142033] text-[26px] mb-[6px]">Booking Confirmed!</h1>
        <p className="font-normal text-[#526176] text-[15px]">
          Your OPD appointment has been successfully booked, {patientName}.
        </p>
      </div>

      {/* Token highlight */}
      <div className="bg-[#13243a] rounded-[14px] p-[28px] text-center mb-[20px]">
        <p className="font-semibold text-[#afc0d3] text-[13px] uppercase tracking-[0.08em] mb-[8px]">
          Your Token Number
        </p>
        <p className="font-bold text-white text-[56px] leading-none tracking-wide mb-[8px]">
          {booking.token}
        </p>
        <p className="font-normal text-[#afc0d3] text-[13px]">
          Booking ID: {booking.bookingId}
        </p>
      </div>

      {/* Booking details card */}
      <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[24px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] mb-[20px]">
        <div className="flex items-center gap-[8px] mb-[18px]">
          <div className="bg-[#18865b] h-[20px] rounded-[2px] w-[4px]" />
          <p className="font-bold text-[#142033] text-[15px]">Appointment Details</p>
          <StatusBadge status="Confirmed" className="ml-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
          {[
            { label: 'Hospital', value: booking.hospitalName },
            { label: 'Department', value: booking.departmentName },
            { label: 'Doctor', value: booking.doctorName },
            { label: 'Specialization', value: booking.doctorSpecialization },
            { label: 'Date', value: booking.date },
            { label: 'Time Slot', value: booking.slot },
            { label: 'Room', value: booking.doctorRoom },
            { label: 'Booked At', value: booking.bookedAt },
          ].map((row) => (
            <div key={row.label}>
              <p className="font-semibold text-[#7b899c] text-[10px] uppercase mb-[3px]">{row.label}</p>
              <p className="font-semibold text-[#142033] text-[13px]">{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Queue info preview */}
      <div className="bg-[#eaf3fd] border border-[#c3d9f7] rounded-[14px] p-[18px] mb-[24px]">
        <p className="font-bold text-[#155ead] text-[14px] mb-[10px]">📋 Queue Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
          {[
            { label: 'Currently serving', value: booking.currentServing },
            { label: 'Patients ahead', value: booking.patientsAhead },
            { label: 'Est. wait time', value: `~${booking.avgWaitMinutes} min` },
          ].map((row) => (
            <div key={row.label} className="text-center">
              <p className="font-bold text-[#142033] text-[20px]">{row.value}</p>
              <p className="font-normal text-[#526176] text-[11px] mt-[2px]">{row.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-[12px] flex-wrap">
        <Button variant="primary" onClick={() => navigate('/patient/token')} className="flex-1 justify-center py-[12px] text-[14px]">
          Track My Token →
        </Button>
        <Button variant="secondary" onClick={() => navigate('/patient/appointment')} className="py-[12px] text-[14px]">
          Appointment Details
        </Button>
      </div>

      <p className="text-center font-normal text-[#7b899c] text-[12px] mt-[16px]">
        Show this token at the reception or track it online.
      </p>
    </PatientLayout>
  );
}
