import { cn } from '@/utils/cn';
import type { BadgeVariant } from '@/types';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = 'slate', className }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    slate: 'bg-slate-100 text-slate-800 border-slate-200',
    primary: 'bg-teal-50 text-teal-800 border-teal-100',
    secondary: 'bg-amber-50 text-amber-800 border-amber-100',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-100',
    info: 'bg-blue-50 text-blue-800 border-blue-100',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
