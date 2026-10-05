import { cn } from '@/utils/cn';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
  className?: string;
}

export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  disabled = false,
  className,
}: QuantitySelectorProps) {
  return (
    <div className={cn('flex-shrink-0 flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm', className)}>
      <button
        type="button"
        disabled={disabled || quantity <= 1}
        onClick={onDecrease}
        className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors font-bold text-sm"
      >
        −
      </button>
      <span className="px-3 py-1 text-slate-800 text-sm font-bold min-w-[2.5rem] text-center select-none">
        {quantity}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={onIncrease}
        className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 transition-colors font-bold text-sm"
      >
        +
      </button>
    </div>
  );
}
