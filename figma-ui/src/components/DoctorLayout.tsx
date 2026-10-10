import { useState } from 'react';
import type { ReactNode } from 'react';

import DoctorSidebar from './DoctorSidebar';
import TopBar from './TopBar';

interface DoctorLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DoctorLayout({
  children,
  title,
}: DoctorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell flex h-screen overflow-hidden bg-[#f3f7fc] text-[#142033]">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-[#020b18]/65 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50
          transition-transform duration-300 ease-in-out
          lg:static lg:z-auto lg:translate-x-0
          lg:transition-none
          ${
            sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >
        <DoctorSidebar
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main application area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Mobile header */}
        <header className="flex h-[62px] shrink-0 items-center gap-3 border-b border-white/10 bg-[#06182b] px-4 shadow-sm lg:hidden">

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-[#16d9e3] transition-colors hover:bg-white/[0.12]"
            aria-label="Open navigation menu"
          >
            <svg
              className="h-5 w-5"
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
            className="h-8 w-auto object-contain"
          />

          <div className="ml-auto min-w-0 text-right">
            <p className="truncate text-[9px] font-semibold uppercase tracking-[0.14em] text-[#16d9e3]">
              HospitalFlow
            </p>
            <p className="truncate text-[12px] font-bold text-white">
              {title}
            </p>
          </div>
        </header>

        {/* Desktop top bar */}
        <div className="hidden shrink-0 lg:block">
          <TopBar title={title} />
        </div>

        {/* Page content */}
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 xl:px-9">

          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>

        </main>
      </div>
    </div>
  );
}