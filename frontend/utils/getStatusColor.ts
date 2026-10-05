import type { StatusColor } from '@/types';

export function getStatusColor(status: string): StatusColor {
  const normalized = String(status || '').toLowerCase().trim();
  switch (normalized) {
    case 'pending':
      return {
        bg: 'bg-amber-100 text-amber-900 border-amber-300',
        text: 'text-amber-800',
        label: 'Pending',
      };
    case 'preparing':
      return {
        bg: 'bg-blue-100 text-blue-900 border-blue-300',
        text: 'text-blue-800',
        label: 'On Delivery',
      };
    case 'completed':
      return {
        bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        text: 'text-emerald-800',
        label: 'Completed',
      };
    case 'cancelled':
      return {
        bg: 'bg-rose-100 text-rose-900 border-rose-300',
        text: 'text-rose-800',
        label: 'Cancelled',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-900 border-slate-300',
        text: 'text-slate-800',
        label: status || 'Pending',
      };
  }
}
