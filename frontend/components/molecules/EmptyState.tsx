import React from 'react';
import Link from 'next/link';
import Button from '@/components/atoms/Button';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode | string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  title = 'No items found',
  description = "We couldn't find what you were looking for.",
  icon,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) {
      return <i className="fa-solid fa-magnifying-glass text-slate-300 text-4xl" />;
    }

    if (typeof icon !== 'string') {
      return icon;
    }

    // Map common string emojis to Font Awesome colored icons
    switch (icon) {
      case '❤️':
        return <i className="fa-solid fa-heart text-rose-400 text-4xl" />;
      case '📦':
        return <i className="fa-solid fa-box-open text-amber-400 text-4xl" />;
      case '🛒':
        return <i className="fa-solid fa-cart-shopping text-purple-400 text-4xl" />;
      case '🔍':
        return <i className="fa-solid fa-magnifying-glass text-slate-300 text-4xl" />;
      case '🐾':
        return <i className="fa-solid fa-paw text-purple-300 text-4xl" />;
      default:
        if (icon.startsWith('fa-') || icon.includes('fa-')) {
          return <i className={cn(icon, 'text-4xl')} />;
        }
        return <span className="text-4xl select-none">{icon}</span>;
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 rounded-2xl bg-white max-w-md mx-auto shadow-sm animate-fade-in', className)}>
      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 text-balance">{description}</p>
      
      {actionHref && actionLabel && (
        <Link href={actionHref}>
          <Button variant="primary">{actionLabel}</Button>
        </Link>
      )}

      {!actionHref && actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
