import Link from 'next/link';
import Price from '@/components/atoms/Price';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import { formatDateShort } from '@/utils/formatDate';
import { getStatusColor } from '@/utils/getStatusColor';
import type { Order } from '@/types';

export interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const { id, items = [], total, status, createdAt } = order;
  const statusInfo = getStatusColor(status);

  // Summarize items for display
  const itemsSummary = items
    .map((item) => `${item.name} (x${item.quantity})`)
    .join(', ');

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Order ID:</span>
          <span className="text-sm font-extrabold text-slate-800 tracking-wide font-mono">
            #{id}
          </span>
          <Badge variant={status === 'completed' ? 'success' : status === 'pending' ? 'warning' : status === 'cancelled' ? 'danger' : 'info'}>
            {statusInfo.label}
          </Badge>
        </div>
        
        <p className="text-xs text-slate-400">
          Placed on {formatDateShort(createdAt || '')}
        </p>

        <p className="text-xs font-semibold text-slate-600 truncate max-w-lg leading-relaxed">
          {itemsSummary}
        </p>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-0 border-slate-100">
        <div className="flex flex-col md:items-end">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
            Total Amount
          </span>
          <Price amount={total ?? 0} className="text-lg text-teal-600 font-extrabold" />
        </div>

        <Link href={`/orders/${id}`}>
          <Button variant="outline" size="sm" className="font-bold whitespace-nowrap">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
