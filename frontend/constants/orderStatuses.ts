import type { OrderStatusOption, OrderStatus } from '@/types';

export const ORDER_STATUSES: OrderStatusOption[] = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'preparing', label: 'On Delivery', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' }
];

export const VALID_STATUS_VALUES: OrderStatus[] = ['pending', 'preparing', 'completed', 'cancelled'];
