import Button from '@/components/atoms/Button';
import { cn } from '@/utils/cn';

interface ErrorStateProps {
  title?: string;
  description?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  title = 'Something went wrong',
  description,
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  const displayDescription = message || description || 'An error occurred while fetching the data. Please try again.';

  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-8 border border-red-100 rounded-2xl bg-rose-50/30 max-w-md mx-auto shadow-sm animate-fade-in', className)}>
      <span className="text-5xl mb-4 select-none">⚠️</span>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 text-balance">{displayDescription}</p>
      
      {onRetry && (
        <Button variant="danger" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
