'use client';

import Link from 'next/link';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Price from '@/components/atoms/Price';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
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
import type { Order } from '@/types';

export interface OrderTableProps {
  orders?: Order[];
  onStatusUpdate: (orderId: string, status: string) => void;
  updatingId?: string | null;
  onDelete?: (orderId: string) => Promise<void> | void;
}

export default function OrderTable({ orders = [], onStatusUpdate, updatingId, onDelete }: OrderTableProps) {
  const handleDeleteClick = (orderId: string) => {
    if (!onDelete) return;

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete order #${orderId}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444', // Danger Red
      cancelButtonColor: '#94A3B8',  // Slate Gray
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      background: '#FFFFFF',
      customClass: {
        popup: 'rounded-2xl border border-slate-100 shadow-xl',
        title: 'text-slate-900 font-extrabold text-sm tracking-tight',
        htmlContainer: 'text-slate-500 text-xs font-semibold',
        confirmButton: 'px-4 py-2 text-xs font-bold text-white rounded-xl transition-all focus:ring-2 focus:ring-rose-500/20',
        cancelButton: 'px-4 py-2 text-xs font-bold text-white rounded-xl transition-all focus:ring-2 focus:ring-slate-300/20'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await onDelete(orderId);
          Swal.fire({
            title: 'Deleted!',
            text: `Order #${orderId} has been successfully deleted.`,
            icon: 'success',
            confirmButtonColor: '#20B2A4',
            customClass: {
              popup: 'rounded-2xl border border-slate-100 shadow-xl',
              title: 'text-slate-900 font-extrabold text-sm tracking-tight',
              htmlContainer: 'text-slate-500 text-xs font-semibold',
              confirmButton: 'px-4 py-2 text-xs font-bold text-white rounded-xl'
            }
          });
        } catch (err: any) {
          Swal.fire({
            title: 'Error!',
            text: err.response?.data?.message || err.message || 'Failed to delete order.',
            icon: 'error',
            confirmButtonColor: '#20B2A4',
            customClass: {
              popup: 'rounded-2xl border border-slate-100 shadow-xl',
              title: 'text-slate-900 font-extrabold text-sm tracking-tight',
              htmlContainer: 'text-slate-500 text-xs font-semibold',
              confirmButton: 'px-4 py-2 text-xs font-bold text-white rounded-xl'
            }
          });
        }
      }
    });
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
                <Badge variant={order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : order.status === 'cancelled' ? 'danger' : 'info'}>
                  {statusInfo.label}
                </Badge>
              </div>

              {/* Customer details for mobile */}
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Customer</span>
                  <span className="font-bold text-slate-800">{order.customer?.fullName || `User #${order.userId}`}</span>
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
                  <span className="text-slate-500">{formatDateShort(order.createdAt)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total</span>
                  <Price amount={order.total} className="text-teal-600 font-extrabold text-sm" />
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <select
                  value={order.status}
                  disabled={updatingId === order.id}
                  onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                  className={`px-2.5 py-1.5 text-[10px] font-bold border rounded-lg focus:outline-none transition-all duration-150 flex-grow uppercase cursor-pointer ${statusInfo.bg}`}
                >
                  {VALID_STATUS_VALUES.map((status) => {
                    const info = getStatusColor(status);
                    return (
                      <option key={status} value={status} className="bg-white text-slate-800 font-bold uppercase">
                        {info.label.toUpperCase()}
                      </option>
                    );
                  })}
                </select>

                <div className="flex items-center gap-1.5">
                  <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="py-1.5 px-3 text-[10px] font-bold">
                      Details
                    </Button>
                  </Link>

                  {onDelete && (
                    <button
                      onClick={() => handleDeleteClick(order.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
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

      {/* Desktop/Tablet Table View (optimized for normal screens) */}
      <div className="hidden md:block border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm bg-white">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200/80">
              <TableHead className="px-3.5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider h-auto w-[90px]">Order ID</TableHead>
              <TableHead className="px-3.5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider h-auto w-[100px]">Date</TableHead>
              <TableHead className="px-3.5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider h-auto w-[180px]">Customer</TableHead>
              <TableHead className="px-3.5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider h-auto">Items Summary</TableHead>
              <TableHead className="px-3.5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider h-auto w-[90px]">Total</TableHead>
              <TableHead className="px-3.5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider h-auto w-[145px]">Status</TableHead>
              <TableHead className="px-3.5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider h-auto text-right w-[110px]">Actions</TableHead>
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
                  {/* Order ID */}
                  <TableCell className="px-3.5 py-3.5 font-mono font-bold text-slate-900">
                    #{order.id}
                  </TableCell>
                  
                  {/* Date */}
                  <TableCell className="px-3.5 py-3.5 text-slate-400">
                    {formatDateShort(order.createdAt)}
                  </TableCell>
                  
                  {/* Customer Details */}
                  <TableCell className="px-3.5 py-3.5">
                    {order.customer ? (
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-bold text-slate-800 leading-tight truncate max-w-[170px]" title={order.customer.fullName}>
                          {order.customer.fullName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">{order.customer.phone}</p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="text-slate-400 font-mono text-[10px] block">User #{order.userId}</span>
                      </div>
                    )}
                  </TableCell>
                  
                  {/* Items Summary (compact width) */}
                  <TableCell className="px-3.5 py-3.5 font-semibold text-slate-800 max-w-[160px] lg:max-w-[220px] truncate" title={itemsSummary}>
                    {itemsSummary}
                  </TableCell>
                  
                  {/* Total */}
                  <TableCell className="px-3.5 py-3.5">
                    <Price amount={order.total} className="text-teal-600 font-extrabold text-sm" />
                  </TableCell>
                  
                  {/* Dynamic Status Dropdown Badge */}
                  <TableCell className="px-3.5 py-3.5">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                      className={`w-full px-2.5 py-1 text-[10px] font-extrabold rounded-full border cursor-pointer focus:outline-none transition-all duration-150 text-center uppercase tracking-wider select-none ${statusInfo.bg}`}
                    >
                      {VALID_STATUS_VALUES.map((status) => {
                        const info = getStatusColor(status);
                        return (
                          <option key={status} value={status} className="bg-white text-slate-800 font-bold uppercase">
                            {info.label.toUpperCase()}
                          </option>
                        );
                      })}
                    </select>
                  </TableCell>
                  
                  {/* Actions (compact layout) */}
                  <TableCell className="px-3.5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="py-1 px-2.5 text-[10px] font-bold">
                          Details
                        </Button>
                      </Link>

                      {onDelete && (
                        <button
                          onClick={() => handleDeleteClick(order.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <i className="fa-solid fa-trash text-[11px]"></i>
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
    </div>
  );
}
