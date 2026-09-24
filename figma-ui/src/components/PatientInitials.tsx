interface PatientInitialsProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'size-[36px] text-[13px]',
  md: 'size-[46px] text-[16px]',
  lg: 'size-[54px] text-[18px]',
};

export default function PatientInitials({ initials, size = 'md' }: PatientInitialsProps) {
  return (
    <div className={`bg-[#eaf3fd] flex flex-col items-center justify-center rounded-[999px] shrink-0 font-bold text-[#155ead] ${sizes[size]}`}>
      {initials}
    </div>
  );
}
