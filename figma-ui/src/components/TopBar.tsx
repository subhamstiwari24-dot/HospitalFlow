const imgBell = '/assets/cddd6.svg';
const imgAvatar = '/assets/b3c9e.svg';
const imgSettings = '/assets/94e94.svg';

interface TopBarProps {
  context?: string;
  title: string;
  userName?: string;
  userRole?: string;
}

export default function TopBar({ context = 'North Campus', title, userName = 'Dr. Sharma', userRole = 'General Medicine' }: TopBarProps) {
  return (
    <div className="bg-white border-[#d8e1ec] border-b border-solid flex h-[72px] items-center justify-between px-[24px] shrink-0 w-full">
      <div className="flex flex-col gap-[3px] items-start">
        <p className="font-normal text-[#7b899c] text-[11px] leading-none">{context}</p>
        <p className="font-bold text-[#142033] text-[15px] leading-none">{title}</p>
      </div>

      <div className="flex gap-[14px] items-center">
        <div className="relative shrink-0 size-[20px]">
          <img alt="" className="absolute block inset-0 size-full" src={imgBell} />
        </div>
        <div className="flex gap-[10px] items-center">
          <div className="relative shrink-0 size-[34px]">
            <img alt="" className="absolute block inset-0 size-full" src={imgAvatar} />
          </div>
          <div className="flex flex-col gap-[2px] items-start">
            <p className="font-bold text-[#142033] text-[13px] leading-none whitespace-nowrap">{userName}</p>
            <p className="font-normal text-[#7b899c] text-[10px] leading-none whitespace-nowrap">{userRole}</p>
          </div>
        </div>
        <div className="relative shrink-0 size-[19px]">
          <img alt="" className="absolute block inset-0 size-full" src={imgSettings} />
        </div>
      </div>
    </div>
  );
}
