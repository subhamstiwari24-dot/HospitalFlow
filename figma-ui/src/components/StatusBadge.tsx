import type { DoctorStatus, AppointmentStatus, ConsultationStatus } from '../types';

type BadgeVariant = DoctorStatus | AppointmentStatus | ConsultationStatus | string;

const variantStyles: Record<string, { bg: string; text: string; dot: string }> = {
  Available: { bg: 'bg-[#E8F3FA]', text: 'text-[#145EA8]', dot: 'bg-[#25D9E6]' },
  Busy: { bg: 'bg-[#FCEDED]', text: 'text-[#B63838]', dot: 'bg-[#D64545]' },
  'On Break': { bg: 'bg-[#E8F3FA]', text: 'text-[#145EA8]', dot: 'bg-[#25D9E6]' },
  Offline: { bg: 'bg-[#EDF2F6]', text: 'text-[#6B7C8F]', dot: 'bg-[#7B899C]' },
  Scheduled: { bg: 'bg-[#E8F3FA]', text: 'text-[#145EA8]', dot: 'bg-[#145EA8]' },
  'In Progress': { bg: 'bg-[#E5F7F3]', text: 'text-[#218A78]', dot: 'bg-[#38B8A8]' },
  'In consultation': { bg: 'bg-[#E5F7F3]', text: 'text-[#218A78]', dot: 'bg-[#38B8A8]' },
  Completed: { bg: 'bg-[#EDF2F6]', text: 'text-[#526A7C]', dot: 'bg-[#526A7C]' },
  Cancelled: { bg: 'bg-[#FCEDED]', text: 'text-[#B63838]', dot: 'bg-[#D64545]' },
  Waiting: { bg: 'bg-[#E8F3FA]', text: 'text-[#145EA8]', dot: 'bg-[#25D9E6]' },
  Active: { bg: 'bg-[#E5F7F3]', text: 'text-[#218A78]', dot: 'bg-[#38B8A8]' },
  Priority: { bg: 'bg-[#E8F3FA]', text: 'text-[#145EA8]', dot: 'bg-[#25D9E6]' },
  Urgent: { bg: 'bg-[#FCEDED]', text: 'text-[#B63838]', dot: 'bg-[#D64545]' },
};

interface StatusBadgeProps {
  status: BadgeVariant;
  showDot?: boolean;
  className?: string;
}

export default function StatusBadge({ status, showDot = true, className }: StatusBadgeProps) {
  const style = variantStyles[status] ?? { bg: 'bg-[#EDF2F6]', text: 'text-[#6B7C8F]', dot: 'bg-[#7B899C]' };
  return (
    <span
      className={`inline-flex items-center gap-[6px] px-[10px] py-[5px] rounded-[999px] text-[11px] font-bold leading-none ${style.bg} ${style.text} ${className ?? ''}`}
    >
      {showDot && <span className={`size-[7px] rounded-[4px] shrink-0 ${style.dot}`} />}
      {status}
    </span>
  );
}
