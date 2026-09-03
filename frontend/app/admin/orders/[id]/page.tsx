'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/templates/AdminLayout';
import AdminRoute from '@/components/guards/AdminRoute';
import Price from '@/components/atoms/Price';
import Badge from '@/components/atoms/Badge';
import Spinner from '@/components/atoms/Spinner';
import Button from '@/components/atoms/Button';
import ErrorState from '@/components/molecules/ErrorState';
import { ordersService } from '@/services/orders.service';
import { formatDate } from '@/utils/formatDate';
import { getStatusColor } from '@/utils/getStatusColor';
import { VALID_STATUS_VALUES } from '@/constants/orderStatuses';

function statusBadgeVariant(status: string): string {
  switch (status) {
    case 'completed': return 'success';
    case 'pending': return 'warning';
    case 'cancelled': return 'danger';
    default: return 'info';
  }
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordersService.getById(id);
      if (response.success) {
        setOrder(response.data);
      } else {
        setError(response.message || 'Order not found.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id, fetchOrder]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const response = await ordersService.updateStatus(id, newStatus);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <AdminRoute>
        <AdminLayout>
          <div className="min-h-[50vh] flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  if (error || !order) {
    return (
      <AdminRoute>
        <AdminLayout>
          <div className="py-12">
            <ErrorState title="Order not found" description={error ?? undefined} onRetry={fetchOrder} />
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  const statusInfo = getStatusColor(order.status);

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="max-w-3xl space-y-6 animate-fade-in">
          {/* Back button */}
          <button
            onClick={() => router.push('/admin/orders')}
            className="text-xs font-bold text-slate-500 hover:text-teal-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i>
            Back to Manage Orders
          </button>

          {/* Order Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order ID</span>
                  <h1 className="text-xl font-extrabold text-slate-900 font-mono tracking-wide">
                    #{order.id}
                  </h1>
                </div>
                <Badge
                  variant={statusBadgeVariant(order.status)}
                  className="text-sm px-4 py-1.5"
                >
                  {statusInfo.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">Update:</span>
                <select
                  value={order.status}
                  disabled={updatingStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-xl border cursor-pointer focus:outline-none transition-all duration-150 uppercase tracking-wider ${statusInfo.bg}`}
                >
                  {VALID_STATUS_VALUES.map((status: string) => {
                    const info = getStatusColor(status);
                    return (
                      <option key={status} value={status} className="bg-white text-slate-800 font-bold uppercase">
                        {info.label.toUpperCase()}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-base pt-4 border-t border-slate-100">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Placed On</span>
                <p className="font-bold text-slate-800 text-sm">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Customer ID</span>
                <p className="font-bold text-slate-800 font-mono text-sm">{order.userId}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1 whitespace-nowrap">Total Amount</span>
                <Price amount={order.total} className="text-lg text-teal-600 font-extrabold block" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1 whitespace-nowrap">Payment Method</span>
                <p className="font-bold text-slate-800 text-sm">
                  💵 Cash on Delivery
                </p>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          {order.customer && order.deliveryAddress && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {/* Customer Info */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-1.5">
                  Customer Details
                </h2>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Full Name</span>
                    <p className="font-bold text-slate-800">{order.customer.fullName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Phone Number</span>
                    <p className="font-bold">
                      <a href={`tel:${order.customer.phone}`} className="text-teal-600 hover:text-teal-700 hover:underline transition-colors">
                        {order.customer.phone}
                      </a>
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</span>
                    <p className="font-bold">
                      <a href={`mailto:${order.customer.email}`} className="text-teal-600 hover:text-teal-700 hover:underline transition-colors">
                        {order.customer.email}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-1.5">
                  Delivery Address
                </h2>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Address</span>
                    <p className="font-bold text-slate-800 leading-relaxed">
                      {order.deliveryAddress.building}, {order.deliveryAddress.street}
                      {order.deliveryAddress.floor && `, ${order.deliveryAddress.floor}`}
                      {order.deliveryAddress.apartment && `, ${order.deliveryAddress.apartment}`}
                      <br />
                      {order.deliveryAddress.area}, {order.deliveryAddress.emirate}
                    </p>
                  </div>
                  {order.deliveryAddress.landmark && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Landmark</span>
                      <p className="font-bold text-slate-800">{order.deliveryAddress.landmark}</p>
                    </div>
                  )}
                  {order.deliveryAddress.instructions && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Instructions</span>
                      <p className="font-bold text-slate-800">{order.deliveryAddress.instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Notes */}
          {order.orderNotes && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-2 animate-fade-in">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-1.5">
                Order Notes
              </h2>
              <p className="text-xs font-semibold text-slate-700 italic leading-relaxed">
                &ldquo;{order.orderNotes}&rdquo;
              </p>
            </div>
          )}

          {/* Line Items */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Order Items
            </h2>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-slate-800">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Qty: {item.quantity} × {new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(item.price)}
                    </p>
                  </div>
                  <Price amount={item.lineTotal} className="text-sm text-teal-600 font-extrabold flex-shrink-0" />
                </div>
              ))}
            </div>

            <hr className="border-slate-100" />

            <div className="flex justify-between items-center text-base pt-2">
              <span className="font-extrabold text-slate-900">Grand Total</span>
              <Price amount={order.total} className="text-xl text-teal-600 font-extrabold" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push('/admin/orders')} className="font-bold text-xs">
              <i className="fa-solid fa-arrow-left mr-1.5 text-[10px]"></i>
              All Orders
            </Button>
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
