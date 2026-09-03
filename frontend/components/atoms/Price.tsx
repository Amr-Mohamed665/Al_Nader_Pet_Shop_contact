import { formatPrice } from '@/utils/formatPrice';
import { cn } from '@/utils/cn';

interface PriceProps {
  amount: number | undefined;
  className?: string;
}

export default function Price({ amount, className }: PriceProps) {
  return (
    <span className={cn('font-bold text-slate-900', className)}>
      {formatPrice(amount ?? 0)}
    </span>
  );
}
