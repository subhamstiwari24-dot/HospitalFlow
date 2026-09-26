import { useState } from 'react';
import type { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import TopBar from './TopBar';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f4f7fb] overflow-hidden">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: fixed overlay on mobile, static in flow on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-30 transition-transform duration-200 lg:static lg:inset-y-auto lg:left-auto lg:z-auto lg:translate-x-0 lg:transition-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Mobile top bar with hamburger */}
        <div className="flex items-center lg:hidden bg-[#13243a] h-[56px] px-4 gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#afc0d3] hover:text-white p-1 -ml-1 transition-colors"
            aria-label="Open menu"
          >
            <svg
              className="size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <img
            src="/assets/logo.png"
            alt="HospitalFlow"
            className="h-8 w-auto object-contain object-top"
          />

          <span className="ml-auto font-bold text-white text-[13px] truncate max-w-[160px]">
            {title}
          </span>
        </div>

        {/* Desktop top bar */}
        <div className="hidden lg:block">
          <TopBar
            title={title}
            context="Metro Health Hospital · Admin"
            userName="Admin User"
            userRole="Administrator"
          />
        </div>

        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-[30px] lg:py-[28px]">
          {children}
        </main>
      </div>
    </div>
  );
}