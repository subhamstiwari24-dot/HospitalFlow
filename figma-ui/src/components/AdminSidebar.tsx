import { useNavigate, useLocation } from 'react-router-dom';

const imgLayoutDashboard = '/assets/13e03.svg';
const imgUsers2 = '/assets/014f4.svg';
const imgCalendar = '/assets/4daf2.svg';
const imgCircle = '/assets/94cb5.svg';
const imgSettings = '/assets/b99e6.svg';

const navItems = [
  { label: 'Dashboard', icon: imgLayoutDashboard, path: '/admin/dashboard' },
  { label: 'Doctors', icon: imgUsers2, path: '/admin/doctors' },
  { label: 'Departments', icon: imgCircle, path: '/admin/departments' },
  { label: 'Appointments', icon: imgCalendar, path: '/admin/appointments' },
  { label: 'Settings', icon: imgSettings, path: '/admin/settings' },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="bg-[#13243a] flex flex-col gap-[18px] h-full items-start pb-[20px] pt-[16px] px-[16px] shrink-0 w-[248px]">
      {/* Brand */}
      <div className="flex items-center justify-between w-full px-[10px] py-[6px]">
        <img
          src="/assets/logo.png"
          alt="HospitalFlow"
          className="h-[36px] w-auto object-contain object-top"
        />
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-[#afc0d3] hover:text-white p-1 transition-colors"
            aria-label="Close menu"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav items */}
      <div className="flex flex-col gap-[6px] items-start w-full">
        {navItems.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); onClose?.(); }}
              aria-current={active ? 'page' : undefined}
              className={`flex gap-[10px] items-center px-[12px] py-[11px] rounded-[8px] w-full text-left transition-[background-color,transform] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#6aa9e8] focus-visible:outline-offset-2 active:translate-y-px ${
                active ? 'bg-[#155ead]' : 'bg-transparent hover:bg-[#1b3049]'
              }`}
            >
              <div className="relative shrink-0 size-[16px]">
                <img alt="" className="absolute block inset-0 size-full" src={item.icon} />
              </div>
              <p className={`font-${active ? 'bold' : 'medium'} text-[13px] leading-none whitespace-nowrap ${active ? 'text-white' : 'text-[#d0dce8]'}`}>
                {item.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Role summary */}
      <div className="mt-auto bg-[#1b3049] flex flex-col gap-[8px] items-start p-[14px] rounded-[12px] w-full">
        <p className="font-bold text-[#afc0d3] text-[10px] uppercase leading-none">Role</p>
        <p className="font-normal text-[15px] text-white leading-none">Administrator</p>
        <p className="font-normal text-[#afc0d3] text-[11px] leading-none">North Campus</p>
      </div>
    </div>
  );
}
