import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/PatientLayout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { usePatient } from '../../context/PatientContext';

export default function AppointmentDetailsPage() {
  const navigate = useNavigate();
  const { booking, cancelBooking, queueTokens, patientName } = usePatient();

  useEffect(() => {
    if (!booking) navigate('/patient/hospital');
  }, [booking, navigate]);

  if (!booking) return null;

  const myToken = queueTokens.find((t) => t.token === booking.token);
  const liveStatus = myToken?.status ?? booking.status;

  const displayStatus =
    booking.status === 'Cancelled' ? 'Cancelled' :
    liveStatus === 'Completed' ? 'Completed' :
    liveStatus === 'In consultation' ? 'In consultation' :
    'Confirmed';

  const handleCancel = () => {
    cancelBooking();
    navigate('/patient/hospital');
  };

  const rows = [
    { section: 'Patient', items: [
      { label: 'Patient Name', value: patientName || 'Patient' },
      { label: 'Booking ID', value: booking.bookingId },
      { label: 'Booked At', value: booking.bookedAt },
    ]},
    { section: 'Appointment', items: [
      { label: 'Hospital', value: booking.hospitalName },
      { label: 'Department', value: booking.departmentName },
      { label: 'Doctor', value: booking.doctorName },
      { label: 'Specialization', value: booking.doctorSpecialization },
      { label: 'Room / Location', value: booking.doctorRoom },
    ]},
    { section: 'Schedule', items: [
      { label: 'Date', value: booking.date },
      { label: 'Time Slot', value: booking.slot },
      { label: 'Token Number', value: booking.token },
    ]},
  ];

  return (
    <PatientLayout step={4} showBack={false} maxWidth="max-w-[680px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-[16px] flex-wrap mb-[24px]">
        <div>
          <h1 className="font-bold text-[#142033] text-[24px] mb-[4px]">Appointment Details</h1>
          <p className="font-normal text-[#526176] text-[14px]">Full details of your OPD booking</p>
        </div>
        <StatusBadge status={displayStatus} />
      </div>

      {/* Token highlight */}
      <div className="bg-[#13243a] rounded-[14px] p-[20px] sm:p-[24px] flex items-center justify-between flex-wrap gap-[12px] mb-[20px]">
        <div>
          <p className="font-semibold text-[#afc0d3] text-[12px] uppercase tracking-widest mb-[4px]">Token Number</p>
          <p className="font-bold text-white text-[44px] leading-none">{booking.token}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-[#afc0d3] text-[11px] uppercase mb-[4px]">Queue ahead</p>
          <p className="font-bold text-white text-[32px] leading-none">
            {queueTokens.filter((t) =>
              t.status === 'Waiting' || t.status === 'In consultation'
            ).findIndex((t) => t.token === booking.token) === -1
              ? '0'
              : String(queueTokens.filter((t) =>
                  t.status === 'Waiting' || t.status === 'In consultation'
                ).findIndex((t) => t.token === booking.token))
            }
          </p>
          <p className="font-normal text-[#afc0d3] text-[11px] mt-[2px]">patients ahead</p>
        </div>
      </div>

      {/* Detail sections */}
      {rows.map((section) => (
        <div
          key={section.section}
          className="bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)] mb-[14px]"
        >
          <div className="flex items-center gap-[8px] mb-[14px]">
            <div className="bg-[#155ead] h-[18px] rounded-[2px] w-[4px]" />
            <p className="font-bold text-[#142033] text-[13px]">{section.section}</p>
          </div>
          <div className="flex flex-col gap-[10px]">
            {section.items.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-[16px]">
                <p className="font-normal text-[#7b899c] text-[13px]">{row.label}</p>
                <p className="font-semibold text-[#142033] text-[13px] text-right">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Queue snapshot */}
      <div className="bg-[#eaf3fd] border border-[#c3d9f7] rounded-[14px] p-[18px] mb-[24px]">
        <p className="font-bold text-[#155ead] text-[13px] mb-[10px]">Live Queue Snapshot</p>
        <div className="flex items-center gap-[6px] flex-wrap">
          {queueTokens.map((t) => {
            const isMe = t.token === booking.token;
            const bg =
              t.status === 'Completed' ? 'bg-[#d8e1ec]' :
              t.status === 'In consultation' ? 'bg-[#18865b]' :
              isMe ? 'bg-[#155ead]' :
              'bg-white border border-[#afc0d3]';
            return (
              <div
                key={t.token}
                className={`h-[8px] rounded-[4px] flex-1 min-w-[16px] ${bg}`}
                title={t.token}
              />
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-[10px] flex-wrap">
        <Button variant="primary" onClick={() => navigate('/patient/token')} className="flex-1 justify-center text-[13px] py-[11px]">
          Track Token
        </Button>
        <Button variant="secondary" onClick={() => navigate('/patient/queue')} className="text-[13px] py-[11px]">
          Live Queue
        </Button>
        {booking.status !== 'Cancelled' && displayStatus !== 'Completed' && (
          <Button variant="danger" onClick={handleCancel} className="text-[13px] py-[11px]">
            Cancel
          </Button>
        )}
      </div>
    </PatientLayout>
  );
}
