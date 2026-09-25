import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Compact variant for use inside small cards (medical history, allergies). */
  compact?: boolean;
}

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
}

export default function EmptyState({ icon, title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-[20px] px-[16px]' : 'py-[48px] px-[24px]'}`}>
      <div className={`text-[#afc0d3] ${compact ? 'mb-[10px]' : 'mb-[14px]'}`}>
        {icon}
      </div>
      <p className={`font-bold text-[#526176] ${compact ? 'text-[13px]' : 'text-[15px]'}`}>{title}</p>
      {description && (
        <p className={`font-normal text-[#7b899c] ${compact ? 'text-[12px] mt-[3px]' : 'text-[13px] mt-[4px]'} max-w-[240px] leading-snug`}>
          {description}
        </p>
      )}
      {action && <div className={compact ? 'mt-[12px]' : 'mt-[18px]'}>{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  retryLabel = 'Try again',
  compact = false,
}: ErrorStateProps) {
  return (
    <div className="bg-[#fff8f8] border border-[#f1c5c5] rounded-[14px]">
      <EmptyState
        compact={compact}
        icon={EmptyIcons.alert(compact ? 24 : 28)}
        title={title}
        description={description}
        action={
          onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="border border-[#c53a45] bg-white text-[#c53a45] font-bold text-[13px] px-[16px] py-[10px] rounded-[10px] hover:bg-[#fff3f3] transition-colors cursor-pointer"
            >
              {retryLabel}
            </button>
          ) : undefined
        }
      />
    </div>
  );
}

// ─── Icon presets ──────────────────────────────────────────────────────────────
// Feather-style, stroke only, designed at 24px (normal) or 20px (compact).

const icon = (d: string | string[], size = 24, extra?: ReactNode) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {(Array.isArray(d) ? d : [d]).map((path, i) => (
      <path key={i} d={path} />
    ))}
    {extra}
  </svg>
);

export const EmptyIcons = {
  alert: (size = 28) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.4L2.2 17.5A2 2 0 003.9 20h16.2a2 2 0 001.7-2.5L13.7 3.4a2 2 0 00-3.4 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),

  // Two people — waiting queue
  queue: (size = 28) => icon(
    [
      'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2',
      'M23 21v-2a4 4 0 00-3-3.87',
      'M16 3.13a4 4 0 010 7.75',
    ],
    size,
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth={1.6} fill="none" />
  ),

  // Calendar — appointments
  calendar: (size = 28) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),

  // File — history / visits
  file: (size = 24) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),

  // Search — no results
  search: (size = 28) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),

  // User + — add / no doctors
  userPlus: (size = 28) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),

  // Building — departments
  building: (size = 28) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  ),

  // Map pin — hospitals
  mapPin: (size = 28) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),

  // Grid — departments (patient)
  grid: (size = 28) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),

  // Stethoscope — no doctors (patient)
  stethoscope: (size = 28) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a6 6 0 006 6 6 6 0 006-6V4a2 2 0 00-2-2h-1a.2.2 0 10.3.3" />
      <path d="M8 15v1a6 6 0 006 6 6 6 0 006-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  ),
};
