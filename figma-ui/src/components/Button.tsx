import { type ReactNode, type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#155ead] border-[#155ead] text-white hover:bg-[#1250a0]',
  secondary: 'bg-white border-[#155ead] text-[#155ead] hover:bg-[#eaf3fd]',
  success: 'bg-[#18865b] border-[#18865b] text-white hover:bg-[#14724d]',
  danger: 'bg-[#c53a45] border-[#c53a45] text-white hover:bg-[#b0323c]',
  ghost: 'bg-transparent border-[#d8e1ec] text-[#526176] hover:bg-[#f4f7fb]',
};

export default function Button({ variant = 'secondary', children, className, loading, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center gap-[8px] border border-solid px-[16px] py-[10px] rounded-[10px] text-[13px] font-bold leading-none transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className ?? ''}`}
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
