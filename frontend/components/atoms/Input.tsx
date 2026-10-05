import { cn } from '@/utils/cn';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export default function Input({
  label,
  error,
  id,
  type = 'text',
  className,
  wrapperClassName,
  ...props
}: InputProps) {
  return (
    <div className={cn('flex flex-col gap-1 w-full', wrapperClassName)}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-700 tracking-wide">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={cn(
          'w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-150',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500 font-medium mt-0.5">{error}</span>}
    </div>
  );
}
