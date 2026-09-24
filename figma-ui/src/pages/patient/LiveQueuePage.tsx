import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/PatientLayout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { usePatient } from '../../context/PatientContext';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkLiveQueue } from '../../components/Skeleton';

export default function LiveQueuePage() {
  const navigate = useNavigate();
  const { booking, queueTokens, currentServing, advanceQueue } = usePatient();
  const loading = usePageLoad(700);

  useEffect(() => {
    if (!booking) navigate('/patient/hospital');
  }, [booking, navigate]);

  if (!booking) return null;

  if (loading) return <PatientLayout step={4} showBack={false} maxWidth="max-w-[700px]"><SkLiveQueue /></PatientLayout>;

  const waiting = queueTokens.filter((t) => t.status === 'Waiting').length;
  const completed = queueTokens.filter((t) => t.status === 'Completed').length;
  const total = queueTokens.length;

  return (
    <PatientLayout step={4} showBack={false} maxWidth="max-w-[700px]">
      <div className="flex items-center justify-between gap-[10px] flex-wrap mb-[24px]">
        <div>
          <h1 className="font-bold text-[#142033] text-[24px] mb-[2px]">Live Queue</h1>
          <p className="font-normal text-[#526176] text-[14px]">
            {booking.doctorName} · {booking.departmentName}
          </p>
        </div>
        <div className="bg-[#e8f7f1] px-[14px] py-[8px] rounded-[10px] flex items-center gap-[8px]">
          <span className="size-[8px] rounded-[4px] bg-[#18865b] animate-pulse inline-block" />
          <p className="font-bold text-[#18865b] text-[13px]">Live</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[10px] mb-[20px]">
        {[
          { label: 'Total', value: total, color: 'text-[#142033]', bg: 'bg-white' },
          { label: 'Serving', value: 1, color: 'text-[#18865b]', bg: 'bg-[#e8f7f1]' },
          { label: 'Waiting', value: waiting, color: 'text-[#a86508]', bg: 'bg-[#fff4de]' },
          { label: 'Done', value: completed, color: 'text-[#526176]', bg: 'bg-[#f4f7fb]' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border border-[#d8e1ec] rounded-[14px] p-[14px] text-center`}>
            <p className={`font-bold text-[22px] ${s.color}`}>{s.value}</p>
            <p className="font-normal text-[#7b899c] text-[11px] mt-[2px]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Queue list */}
      <div className="bg-white border border-[#d8e1ec] rounded-[14px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] mb-[20px]">
        <div className="flex items-center gap-[8px] px-[20px] py-[14px] border-b border-[#f4f7fb]">
          <div className="bg-[#155ead] h-[20px] rounded-[2px] w-[4px]" />
          <p className="font-bold text-[#142033] text-[14px]">Queue List</p>
          <p className="font-normal text-[#7b899c] text-[12px] ml-auto">Currently serving: <span className="font-bold text-[#18865b]">{currentServing}</span></p>
        </div>

        <div className="divide-y divide-[#f4f7fb]">
          {queueTokens.map((t, idx) => {
            const isMe = t.token === booking.token;
            const isServing = t.status === 'In consultation';
            const isDone = t.status === 'Completed';

            return (
              <div
                key={t.token}
                className={`flex items-center gap-[14px] px-[20px] py-[14px] transition-colors ${
                  isMe ? 'bg-[#eaf3fd]' : isServing ? 'bg-[#f0faf5]' : ''
                }`}
              >
                {/* Position number */}
                <div className={`size-[36px] rounded-[10px] flex items-center justify-center shrink-0 font-bold text-[14px] ${
                  isServing ? 'bg-[#18865b] text-white' :
                  isDone ? 'bg-[#f4f7fb] text-[#afc0d3]' :
                  isMe ? 'bg-[#155ead] text-white' :
                  'bg-[#f4f7fb] text-[#526176]'
                }`}>
                  {idx + 1}
                </div>

                {/* Token */}
                <div className="flex-1">
                  <div className="flex items-center gap-[8px]">
                    <p className={`font-bold text-[15px] ${isDone ? 'text-[#afc0d3] line-through' : 'text-[#142033]'}`}>
                      {t.token}
                    </p>
                    {isMe && (
                      <span className="bg-[#155ead] text-white text-[10px] font-bold px-[8px] py-[2px] rounded-[999px]">
                        You
                      </span>
                    )}
                  </div>
                  {!isDone && !isServing && (
                    <p className="font-normal text-[#7b899c] text-[11px] mt-[1px]">
                      ~{(queueTokens.filter((q, i) => i < idx && q.status !== 'Completed').length) * 12} min wait
                    </p>
                  )}
                </div>

                {/* Status badge */}
                <StatusBadge status={t.status} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-[10px] flex-wrap">
        <Button variant="ghost" onClick={advanceQueue} className="text-[13px] py-[10px]">
          ▶ Simulate Next
        </Button>
        <Button variant="secondary" onClick={() => navigate('/patient/token')} className="text-[13px] py-[10px]">
          My Token
        </Button>
        <Button variant="primary" onClick={() => navigate('/patient/appointment')} className="flex-1 justify-center text-[13px] py-[10px]">
          Appointment Details
        </Button>
      </div>
    </PatientLayout>
  );
}
