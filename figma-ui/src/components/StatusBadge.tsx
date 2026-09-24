import type { DoctorStatus, AppointmentStatus, ConsultationStatus } from '../types';

type BadgeVariant = DoctorStatus | AppointmentStatus | ConsultationStatus | string;

const variantStyles: Record<string, { bg: string; text: string; dot: string }> = {
  Available: { bg: 'bg-[#e7f6ef]', text: 'text-[#18865b]', dot: 'bg-[#18865b]' },
  Busy: { bg: 'bg-[#fef3f2]', text: 'text-[#c53a45]', dot: 'bg-[#c53a45]' },
  'On Break': { bg: 'bg-[#fff4de]', text: 'text-[#a86508]', dot: 'bg-[#a86508]' },
  Offline: { bg: 'bg-[#f4f7fb]', text: 'text-[#7b899c]', dot: 'bg-[#7b899c]' },
  Scheduled: { bg: 'bg-[#eaf3fd]', text: 'text-[#155ead]', dot: 'bg-[#155ead]' },
  'In Progress': { bg: 'bg-[#e8f7f1]', text: 'text-[#18865b]', dot: 'bg-[#18865b]' },
  'In consultation': { bg: 'bg-[#e8f7f1]', text: 'text-[#18865b]', dot: 'bg-[#18865b]' },
  Completed: { bg: 'bg-[#f4f7fb]', text: 'text-[#526176]', dot: 'bg-[#526176]' },
  Cancelled: { bg: 'bg-[#fef3f2]', text: 'text-[#c53a45]', dot: 'bg-[#c53a45]' },
  Waiting: { bg: 'bg-[#fff4de]', text: 'text-[#a86508]', dot: 'bg-[#a86508]' },
  Active: { bg: 'bg-[#e8f7f1]', text: 'text-[#18865b]', dot: 'bg-[#18865b]' },
  Priority: { bg: 'bg-[#fff4de]', text: 'text-[#a86508]', dot: 'bg-[#a86508]' },
  Urgent: { bg: 'bg-[#fef3f2]', text: 'text-[#c53a45]', dot: 'bg-[#c53a45]' },
};

interface StatusBadgeProps {
  status: BadgeVariant;
  showDot?: boolean;
  className?: string;
}

export default function StatusBadge({ status, showDot = true, className }: StatusBadgeProps) {
  const style = variantStyles[status] ?? { bg: 'bg-[#f4f7fb]', text: 'text-[#7b899c]', dot: 'bg-[#7b899c]' };
  return (
    <span
      className={`inline-flex items-center gap-[6px] px-[10px] py-[5px] rounded-[999px] text-[11px] font-bold leading-none ${style.bg} ${style.text} ${className ?? ''}`}
    >
      {showDot && <span className={`size-[7px] rounded-[4px] shrink-0 ${style.dot}`} />}
      {status}
    </span>
  );
}
