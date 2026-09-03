'use client';

import { useState } from 'react';
import AdminLayout from '@/components/templates/AdminLayout';
import AdminRoute from '@/components/guards/AdminRoute';
import OrderTable from '@/components/organisms/OrderTable';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import useOrders from '@/hooks/useOrders';
import { ORDER_STATUSES } from '@/constants/orderStatuses';

const ALL_FILTER = { value: 'all', label: 'All Orders' };
const FILTER_TABS = [ALL_FILTER, ...ORDER_STATUSES];

export default function AdminOrdersPage() {
  const { orders, loading, error, refetch, deleteOrder, updateStatus, updatingOrderId } = useOrders(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredOrders = activeFilter === 'all'
    ? orders
    : orders.filter((o: any) => o.status === activeFilter);

  // Sort newest first
  const sortedOrders = [...filteredOrders].sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateStatus({ orderId, status: newStatus });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  // Status counts for filter badges
  const statusCounts = orders.reduce((acc: Record<string, number>, o: any) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Manage Orders
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                View, filter, and update order statuses across all customers.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 font-bold text-slate-500">
                <i className="fa-solid fa-box text-slate-400 text-[12px]"></i>
                <span>{orders.length} total order{orders.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          {!loading && !error && orders.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {FILTER_TABS.map((tab) => {
                const count = tab.value === 'all'
                  ? orders.length
                  : (statusCounts[tab.value] || 0);
                const isActive = activeFilter === tab.value;

                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveFilter(tab.value)}
                    className={`px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all duration-150 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-teal-500 text-white shadow-md shadow-teal-500/15'
                        : 'bg-white text-slate-500 border border-slate-200/80 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50/40'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Spinner size="md" />
              <span className="text-xs text-slate-400 font-bold tracking-wide">Loading orders...</span>
            </div>
          ) : error ? (
            <ErrorState onRetry={refetch} description={error} />
          ) : orders.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
              <p className="text-2xl mb-2">📦</p>
              <p className="text-sm font-bold text-slate-500">No orders found.</p>
              <p className="text-xs text-slate-400 mt-1">
                Orders will appear here when customers place them.
              </p>
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm font-bold text-slate-500">
                No orders with status &quot;{FILTER_TABS.find((t) => t.value === activeFilter)?.label}&quot;
              </p>
              <button
                onClick={() => setActiveFilter('all')}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 mt-2 transition-colors"
              >
                Clear filter →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <OrderTable
                orders={sortedOrders}
                onStatusUpdate={handleStatusUpdate}
                updatingId={updatingOrderId}
                onDelete={deleteOrder}
              />
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
