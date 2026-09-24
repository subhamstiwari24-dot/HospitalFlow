import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/PatientLayout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { usePatient } from '../../context/PatientContext';

export default function TokenDetailsPage() {
  const navigate = useNavigate();
  const { booking, queueTokens, currentServing, advanceQueue } = usePatient();

  useEffect(() => {
    if (!booking) navigate('/patient/hospital');
  }, [booking, navigate]);

  if (!booking) return null;

  const myToken = booking.token;
  const myIdx = queueTokens.findIndex((t) => t.token === myToken);
  const myStatus = myIdx >= 0 ? queueTokens[myIdx].status : 'Waiting';

  const patientsAhead = queueTokens.filter(
    (t, i) => i < myIdx && (t.status === 'Waiting' || t.status === 'In consultation')
  ).length;

  const estWait = patientsAhead * 12;

  return (
    <PatientLayout step={4} showBack={false} maxWidth="max-w-[640px]">
      <div className="text-center mb-[28px]">
        <h1 className="font-bold text-[#142033] text-[24px] mb-[4px]">Token Tracker</h1>
        <p className="font-normal text-[#526176] text-[14px]">
          {booking.doctorName} · {booking.departmentName}
        </p>
      </div>

      {/* My token card */}
      <div className="bg-[#13243a] rounded-[14px] p-[20px] sm:p-[32px] text-center mb-[20px]">
        <p className="font-semibold text-[#afc0d3] text-[12px] uppercase tracking-widest mb-[12px]">Your Token</p>
        <p className="font-bold text-white text-[64px] leading-none mb-[16px]">{myToken}</p>
        <div className="flex justify-center">
          <StatusBadge status={myStatus} />
        </div>
      </div>

      {/* Queue stats */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-[12px] mb-[20px]">
        {[
          { label: 'Currently Serving', value: currentServing, accent: true },
          { label: 'Patients Ahead', value: myStatus === 'In consultation' ? '0' : String(patientsAhead), accent: false },
          { label: 'Est. Wait', value: myStatus === 'In consultation' ? 'Your turn!' : `~${estWait} min`, accent: false },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-[14px] p-[16px] text-center border ${
              stat.accent
                ? 'bg-[#eaf3fd] border-[#c3d9f7]'
                : 'bg-white border-[#d8e1ec] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]'
            }`}
          >
            <p className={`font-bold text-[20px] mb-[4px] ${stat.accent ? 'text-[#155ead]' : 'text-[#142033]'}`}>
              {stat.value}
            </p>
            <p className="font-normal text-[#7b899c] text-[11px]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar visual */}
      <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] mb-[20px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]">
        <p className="font-bold text-[#142033] text-[13px] mb-[14px]">Queue Progress</p>
        <div className="flex items-center gap-[6px] flex-wrap">
          {queueTokens.map((t) => {
            const isMe = t.token === myToken;
            const bg =
              t.status === 'Completed' ? 'bg-[#d8e1ec]' :
              t.status === 'In consultation' ? 'bg-[#18865b]' :
              isMe ? 'bg-[#155ead]' :
              'bg-[#eaf3fd]';
            return (
              <div
                key={t.token}
                title={t.token}
                className={`h-[8px] flex-1 rounded-[4px] min-w-[20px] ${bg} transition-all`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-[8px]">
          <p className="font-normal text-[#7b899c] text-[11px]">Start</p>
          <p className="font-normal text-[#7b899c] text-[11px]">End</p>
        </div>
        <div className="flex items-center gap-[16px] mt-[10px] flex-wrap">
          {[
            { color: 'bg-[#18865b]', label: 'In consultation' },
            { color: 'bg-[#155ead]', label: 'Your token' },
            { color: 'bg-[#eaf3fd] border border-[#c3d9f7]', label: 'Waiting' },
            { color: 'bg-[#d8e1ec]', label: 'Completed' },
          ].map((leg) => (
            <div key={leg.label} className="flex items-center gap-[5px]">
              <div className={`h-[8px] w-[16px] rounded-[3px] ${leg.color}`} />
              <p className="font-normal text-[#7b899c] text-[11px]">{leg.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Booking mini details */}
      <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] mb-[20px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
          {[
            { label: 'Hospital', value: booking.hospitalName },
            { label: 'Slot', value: booking.slot },
            { label: 'Date', value: booking.date },
            { label: 'Room', value: booking.doctorRoom },
          ].map((row) => (
            <div key={row.label}>
              <p className="font-semibold text-[#7b899c] text-[10px] uppercase mb-[2px]">{row.label}</p>
              <p className="font-semibold text-[#142033] text-[12px]">{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-[10px] flex-wrap">
        <Button variant="ghost" onClick={advanceQueue} className="text-[13px] py-[10px]">
          Simulate Next →
        </Button>
        <Button variant="secondary" onClick={() => navigate('/patient/queue')} className="text-[13px] py-[10px]">
          Live Queue
        </Button>
        <Button variant="primary" onClick={() => navigate('/patient/appointment')} className="flex-1 justify-center text-[13px] py-[10px]">
          Appointment Details
        </Button>
      </div>
    </PatientLayout>
  );
}
