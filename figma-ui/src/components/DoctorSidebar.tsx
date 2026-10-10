
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  Settings,
  Clock3,
  Activity,
  HeartPulse,
  X,
  Stethoscope,
} from 'lucide-react';

interface DoctorSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  {
    label: 'Dashboard',
    path: '/doctor/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Queue',
    path: '/doctor/queue',
    icon: Users,
  },
  {
    label: 'Appointments',
    path: '/doctor/appointments',
    icon: CalendarDays,
  },
  {
    label: 'Patients',
    path: '/doctor/patients',
    icon: ClipboardList,
  },
  {
    label: 'Settings',
    path: '/doctor/settings',
    icon: Settings,
  },
];

export default function DoctorSidebar({
  mobileOpen = false,
  onClose,
}: DoctorSidebarProps) {
  const closeSidebar = () => {
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-[#071b31]/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen w-[240px] shrink-0 flex-col
          overflow-y-auto border-r border-[#dce7f0]
          bg-[#f3f7fb] text-[#071b31]
          transition-transform duration-300
          lg:sticky lg:top-0 lg:z-30 lg:translate-x-0
          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }
        `}
      >
        {/* Brand */}
        <div className="flex min-h-[88px] items-center justify-between gap-3 border-b border-[#dce7f0] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#071b31] text-cyan-300 shadow-sm">
              <HeartPulse size={23} strokeWidth={2.2} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-[17px] font-extrabold tracking-tight text-[#071b31]">
                HospitalFlow
              </h1>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[1.5px] text-[#087e9b]">
                Doctor Workspace
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-[#071b31] lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-4 pb-3 pt-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.6px] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/doctor/dashboard'}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `
                    group relative flex min-h-[52px] items-center gap-3
                    overflow-hidden rounded-xl border px-3 py-3
                    transition-all duration-200
                    ${
                      isActive
                        ? 'border-cyan-100 bg-[#dff8fc] text-[#071b31] shadow-sm'
                        : 'border-transparent bg-white text-slate-600 hover:border-[#dce7f0] hover:bg-white hover:text-[#071b31] hover:shadow-sm'
                    }
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-[#22c7df]" />
                      )}

                      <span
                        className={`
                          flex h-9 w-9 shrink-0 items-center justify-center
                          rounded-lg transition-colors
                          ${
                            isActive
                              ? 'bg-[#22c7df] text-[#071b31]'
                              : 'bg-[#f0f8fb] text-[#087e9b] group-hover:bg-[#dff8fc]'
                          }
                        `}
                      >
                        <Icon size={18} strokeWidth={2} />
                      </span>

                      <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">
                        {item.label}
                      </span>

                      {isActive && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#087e9b]" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* OPD workspace information */}
        <div className="mx-4 mt-3 rounded-2xl border border-[#ccebf2] bg-white p-4 shadow-[0_3px_12px_rgba(10,35,60,0.03)]">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#071b31] text-cyan-300">
              <Activity size={17} />
            </div>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#071b31]">
                OPD Workspace
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-[#087e9b]">
                Doctor Portal
              </p>
            </div>
          </div>

          <p className="text-[11px] leading-5 text-slate-500">
            Manage your patient queue, appointments and consultation workflow.
          </p>
        </div>

        {/* Shift information */}
        <div className="mx-4 mb-4 mt-6 rounded-2xl border border-[#dce7f0] bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 size={15} className="text-[#087e9b]" />

            <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-slate-500">
              Shift Information
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Stethoscope size={15} className="shrink-0 text-[#087e9b]" />
              <span className="text-[11px] text-slate-600">
                Outpatient · Room 204
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock3 size={15} className="shrink-0 text-[#087e9b]" />
              <span className="text-[11px] text-slate-600">
                08:00 AM – 04:00 PM
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#e8f9f5] px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-semibold text-emerald-800">
              OPD Workspace
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-[#dce7f0] bg-[#edf3f8] px-5 py-4">
          <p className="text-[10px] font-semibold text-slate-500">
            HospitalFlow
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            Doctor Operations Portal
          </p>
        </div>
      </aside>
    </>
  );
}
