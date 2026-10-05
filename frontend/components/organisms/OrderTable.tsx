'use client';

import { useState } from 'react';
import Link from 'next/link';
import Price from '@/components/atoms/Price';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import ConfirmModal from '@/components/molecules/ConfirmModal';
import { showToast } from '@/utils/toast';
import { formatDateShort } from '@/utils/formatDate';
import { getStatusColor } from '@/utils/getStatusColor';
import { VALID_STATUS_VALUES } from '@/constants/orderStatuses';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import type { Order, OrderStatus } from '@/types';

export interface OrderTableProps {
  orders?: Order[];
  onStatusUpdate: (orderId: string, status: OrderStatus) => void | Promise<unknown>;
  updatingId?: string | null;
  onDelete?: (orderId: string) => void | Promise<unknown>;
}

export default function OrderTable({ orders = [], onStatusUpdate, updatingId, onDelete }: OrderTableProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (orderId: string) => {
    if (!onDelete) return;
    setDeleteTargetId(orderId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId || !onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(deleteTargetId);
      showToast('success', `Order #${deleteTargetId} deleted successfully!`);
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to delete order.');
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 text-sm">
        No orders found matching the filters.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile Card List (hidden on md+) */}
      <div className="block md:hidden space-y-4">
        {orders.map((order) => {
          const statusInfo = getStatusColor(order.status);
          const itemsSummary = order.items
            ?.map((i) => `${i.name} (x${i.quantity})`)
            .join(', ');

          return (
            <div key={order.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Order ID</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">#{order.id}</span>
                </div>
                <Badge variant={order.status?.toLowerCase() === 'completed' ? 'success' : order.status?.toLowerCase() === 'pending' ? 'warning' : order.status?.toLowerCase() === 'cancelled' ? 'danger' : 'info'}>
                  {statusInfo.label}
                </Badge>
              </div>

              {/* Customer details for mobile */}
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Customer</span>
                  <span className="font-bold text-slate-800">{(order.customer as any)?.fullName || (order.customer as any)?.name || `User #${(order as any).userId || order.user}`}</span>
                </div>
                {order.customer?.phone && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Phone</span>
                    <span className="text-slate-500 font-semibold">{order.customer.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Items Summary</span>
                <p className="text-xs font-semibold text-slate-800 line-clamp-2" title={itemsSummary}>
                  {itemsSummary}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Date</span>
                  <span className="text-slate-500">{formatDateShort(order.createdAt || '')}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total</span>
                  <Price amount={order.total ?? 0} className="text-teal-600 font-extrabold text-sm" />
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="relative flex-grow">
                  <select
                    value={order.status?.toLowerCase() || 'pending'}
                    disabled={updatingId === order.id}
                    onChange={(e) => onStatusUpdate(order.id, e.target.value as OrderStatus)}
                    className={`w-full appearance-none pl-3 pr-8 py-2 text-xs font-extrabold border rounded-xl focus:outline-none transition-all duration-150 uppercase tracking-wider cursor-pointer shadow-2xs ${statusInfo.bg}`}
                  >
                    {VALID_STATUS_VALUES.map((status) => {
                      const info = getStatusColor(status);
                      return (
                        <option key={status} value={status} className="bg-white text-slate-800 font-bold uppercase">
                          {info.label.toUpperCase()}
                        </option>
                      );
                    })}
                    {order.status && !VALID_STATUS_VALUES.includes(order.status.toLowerCase() as OrderStatus) && (
                      <option value={order.status} className="bg-white text-slate-800 font-bold uppercase">
                        {order.status.toUpperCase()}
                      </option>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-current opacity-70">
                    <i className="fa-solid fa-chevron-down text-[10px]"></i>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="py-1.5 px-3 text-[10px] font-bold">
                      Details
                    </Button>
                  </Link>

                  {onDelete && (
                    <button
                      onClick={() => handleDeleteClick(order.id)}
                      className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                      title="Delete Order"
                    >
                      <i className="fa-solid fa-trash text-[11px]"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop/Tablet Table View (optimized for normal & medium screens) */}
      <div className="hidden md:block border border-slate-200/80 rounded-2xl overflow-x-auto shadow-sm bg-white">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200/80">
              <TableHead className="px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap w-[110px]">Order & Date</TableHead>
              <TableHead className="px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap max-w-[140px]">Customer</TableHead>
              <TableHead className="px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Items</TableHead>
              <TableHead className="px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap w-[80px]">Total</TableHead>
              <TableHead className="px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap w-[135px]">Status</TableHead>
              <TableHead className="px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right whitespace-nowrap w-[85px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-xs text-slate-700">
            {orders.map((order) => {
              const statusInfo = getStatusColor(order.status);
              const itemsSummary = order.items
                ?.map((i) => `${i.name} (x${i.quantity})`)
                .join(', ');

              return (
                <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                  {/* Order ID & Date (Stacked to save horizontal space on medium screens) */}
                  <TableCell className="px-3 py-3">
                    <span className="font-mono font-bold text-slate-900 block leading-tight">
                      #{order.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                      {formatDateShort(order.createdAt || '')}
                    </span>
                  </TableCell>
                  
                  {/* Customer Details */}
                  <TableCell className="px-3 py-3">
                    {order.customer ? (
                      <div className="space-y-0.5 min-w-0 max-w-[130px] lg:max-w-[170px]">
                        <p className="font-bold text-slate-800 leading-tight truncate" title={(order.customer as any).fullName || (order.customer as any).name}>
                          {(order.customer as any).fullName || (order.customer as any).name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold truncate">{order.customer.phone}</p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="text-slate-400 font-mono text-[10px] block">User #{(order as any).userId || order.user}</span>
                      </div>
                    )}
                  </TableCell>
                  
                  {/* Items Summary (compact width) */}
                  <TableCell className="px-3 py-3 font-semibold text-slate-800 max-w-[120px] lg:max-w-[200px] truncate" title={itemsSummary}>
                    {itemsSummary}
                  </TableCell>
                  
                  {/* Total */}
                  <TableCell className="px-3 py-3 whitespace-nowrap">
                    <Price amount={order.total ?? 0} className="text-teal-600 font-extrabold text-xs sm:text-sm" />
                  </TableCell>
                  
                  {/* Dynamic Status Dropdown Badge */}
                  <TableCell className="px-3 py-3 w-[135px]">
                    <div className="relative inline-block w-full">
                      <select
                        value={order.status?.toLowerCase() || 'pending'}
                        disabled={updatingId === order.id}
                        onChange={(e) => onStatusUpdate(order.id, e.target.value as OrderStatus)}
                        className={`w-full appearance-none pl-2.5 pr-6 py-1.5 text-[10px] font-extrabold rounded-xl border cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-left uppercase tracking-wider shadow-2xs ${statusInfo.bg}`}
                      >
                        {VALID_STATUS_VALUES.map((status) => {
                          const info = getStatusColor(status);
                          return (
                            <option key={status} value={status} className="bg-white text-slate-800 font-bold uppercase py-1">
                              {info.label.toUpperCase()}
                            </option>
                          );
                        })}
                        {order.status && !VALID_STATUS_VALUES.includes(order.status.toLowerCase() as OrderStatus) && (
                          <option value={order.status} className="bg-white text-slate-800 font-bold uppercase py-1">
                            {order.status.toUpperCase()}
                          </option>
                        )}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
                        <i className="fa-solid fa-chevron-down text-[8px]"></i>
                      </div>
                    </div>
                  </TableCell>
                  
                  {/* Actions (compact layout) */}
                  <TableCell className="px-3 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="py-1 px-2 text-[10px] font-bold">
                          Details
                        </Button>
                      </Link>

                      {onDelete && (
                        <button
                          onClick={() => handleDeleteClick(order.id)}
                          className="p-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <i className="fa-solid fa-trash text-[10px]"></i>
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Order?"
        description={`Are you sure you want to delete order #${deleteTargetId}? This action cannot be undone.`}
        confirmLabel="Delete"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
}
