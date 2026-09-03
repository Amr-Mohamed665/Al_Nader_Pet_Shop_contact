import type { StatusColor } from '@/types';

export function getStatusColor(status: string): StatusColor {
  switch (String(status).toLowerCase()) {
    case 'pending':
      return {
        bg: 'bg-amber-100 text-amber-800 border-amber-200',
        text: 'text-amber-600',
        label: 'Pending',
      };
    case 'preparing':
      return {
        bg: 'bg-info/10 text-info border-info/20',
        text: 'text-info',
        label: 'On Delivery',
      };
    case 'completed':
      return {
        bg: 'bg-success/10 text-success border-success/20',
        text: 'text-success',
        label: 'Completed',
      };
    case 'cancelled':
      return {
        bg: 'bg-danger/10 text-danger border-danger/20',
        text: 'text-danger',
        label: 'Cancelled',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-800 border-slate-200',
        text: 'text-slate-600',
        label: status,
      };
  }
}
