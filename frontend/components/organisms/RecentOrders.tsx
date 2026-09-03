'use client';

import Link from 'next/link';
import Price from '@/components/atoms/Price';
import Badge from '@/components/atoms/Badge';
import { formatDateShort } from '@/utils/formatDate';
import { getStatusColor } from '@/utils/getStatusColor';
import type { Order, BadgeVariant } from '@/types';

function statusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'completed': return 'success';
    case 'pending': return 'warning';
    case 'cancelled': return 'danger';
    default: return 'info';
  }
}

export interface RecentOrdersProps {
  orders?: Order[];
}

export default function RecentOrders({ orders = [] }: RecentOrdersProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-clock-rotate-left text-amber-500 text-[14px]"></i>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Recent Orders</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Latest orders placed by customers</p>
          </div>
        </div>
        <Link
          href="/admin/orders"
          className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
        >
          View All
          <i className="fa-solid fa-arrow-right text-[10px]"></i>
        </Link>
      </div>

      {/* Content */}
      {orders.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <i className="fa-solid fa-inbox text-3xl mb-2 text-slate-200"></i>
          <p className="text-xs font-semibold">No orders yet</p>
          <p className="text-[10px] text-slate-300 mt-1">Orders will appear here as they come in</p>
        </div>
      ) : (
        <>
          {/* Mobile view - List of Cards (hidden on sm+) */}
          <div className="block sm:hidden divide-y divide-slate-100">
            {orders.map((order) => {
              const statusInfo = getStatusColor(order.status);
              const itemCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

              return (
                <div key={order.id} className="p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono font-bold text-slate-800 hover:text-teal-600 transition-colors"
                    >
                      #{order.id?.slice(-6)}
                    </Link>
                    <Badge variant={statusBadgeVariant(order.status)}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>{formatDateShort(order.createdAt || '')}</span>
                    <span className="font-semibold text-slate-600">
                      {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-50">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
                    <Price amount={order.total ?? 0} className="text-teal-600 font-extrabold" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop/Tablet view - Table (hidden on mobile) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order) => {
                  const statusInfo = getStatusColor(order.status);
                  const itemCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-xs text-slate-800 hover:text-teal-600 transition-colors"
                        >
                          #{order.id?.slice(-6)}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400">
                        {formatDateShort(order.createdAt || '')}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold text-slate-600">
                          {itemCount} item{itemCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Price amount={order.total ?? 0} className="text-xs text-teal-600 font-extrabold" />
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={statusBadgeVariant(order.status)}>
                          {statusInfo.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
