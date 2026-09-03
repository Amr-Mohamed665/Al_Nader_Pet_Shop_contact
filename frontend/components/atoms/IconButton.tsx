import { cn } from '@/utils/cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonVariant = 'ghost' | 'primary' | 'secondary' | 'outline' | 'danger';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: IconButtonVariant;
  className?: string;
}

export default function IconButton({
  children,
  type = 'button',
  variant = 'ghost',
  className,
  ...props
}: IconButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants: Record<IconButtonVariant, string> = {
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    primary: 'bg-teal-500 text-white hover:bg-teal-600 shadow-sm',
    secondary: 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm',
    outline: 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50',
    danger: 'text-rose-600 hover:bg-rose-50',
  };

  return (
    <button
      type={type}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
