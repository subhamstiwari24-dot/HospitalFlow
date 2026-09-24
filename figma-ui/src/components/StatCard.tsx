import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  sub?: string;
}

export default function StatCard({ icon, iconBg, label, value, sub }: StatCardProps) {
  return (
    <div className="bg-white border border-[#d8e1ec] border-solid flex flex-1 gap-[16px] items-center p-[20px] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] min-w-0">
      <div className={`${iconBg} flex flex-col items-center justify-center rounded-[12px] shrink-0 size-[46px]`}>
        {icon}
      </div>
      <div className="flex flex-col gap-[4px] items-start min-w-0">
        <p className="font-semibold text-[#526176] text-[12px] leading-none">{label}</p>
        <p className="font-bold text-[#142033] text-[32px] leading-none">{value}</p>
        {sub && <p className="font-normal text-[#7b899c] text-[11px] leading-none">{sub}</p>}
      </div>
    </div>
  );
}
