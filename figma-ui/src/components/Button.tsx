import { type ReactNode, type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#25D9E6] border-[#25D9E6] text-[#071B3A] shadow-[0_6px_18px_rgba(37,217,230,0.18)] hover:bg-[#4AE2EC] hover:shadow-[0_8px_22px_rgba(37,217,230,0.24)]',
  secondary: 'bg-transparent border-[#145EA8] text-[#145EA8] hover:bg-[#E8F3FA] hover:border-[#25D9E6]',
  success: 'bg-[#2E9E5B] border-[#2E9E5B] text-white hover:bg-[#267F49]',
  danger: 'bg-[#D64545] border-[#D64545] text-white hover:bg-[#B63838]',
  ghost: 'bg-transparent border-transparent text-[#6B7C8F] hover:bg-[#E8F3FA] hover:text-[#071B3A]',
};

export default function Button({ variant = 'secondary', children, className, loading, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center gap-[8px] border border-solid px-[16px] py-[10px] rounded-[8px] text-[13px] font-bold leading-none transition-[background-color,border-color,color,box-shadow,transform] cursor-pointer whitespace-nowrap active:translate-y-px focus-visible:outline-2 focus-visible:outline-[#25D9E6] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className ?? ''}`}
      {...props}
    >
      {loading && (
        <svg className="size-[13px] animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
