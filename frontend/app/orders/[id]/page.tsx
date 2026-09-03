'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ShopLayout from '@/components/templates/ShopLayout';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import Price from '@/components/atoms/Price';
import Badge from '@/components/atoms/Badge';
import Spinner from '@/components/atoms/Spinner';
import Button from '@/components/atoms/Button';
import ErrorState from '@/components/molecules/ErrorState';
import { ordersService } from '@/services/orders.service';
import { formatDate } from '@/utils/formatDate';
import { getStatusColor } from '@/utils/getStatusColor';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <ShopLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </ShopLayout>
    );
  }

  if (error || !order) {
    return (
      <ShopLayout>
        <div className="py-12">
          <ErrorState title="Order not found" description={error ?? undefined} onRetry={fetchOrder} />
        </div>
      </ShopLayout>
    );
  }

  const statusInfo = getStatusColor(order.status);

  return (
    <ProtectedRoute>
      <ShopLayout>
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="text-xs font-bold text-slate-500 hover:text-teal-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            ← Back to Orders
          </button>

          {/* Order Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order ID</span>
                <h1 className="text-xl font-extrabold text-slate-900 font-mono tracking-wide">
                  #{order.id}
                </h1>
              </div>
              <Badge variant={order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : order.status === 'cancelled' ? 'danger' : 'info'} className="text-sm px-4 py-1.5">
                {statusInfo.label}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Placed On</span>
                <p className="font-bold text-slate-800">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block whitespace-nowrap">Total Amount</span>
                <div className="font-bold text-slate-800"><Price amount={order.total} /></div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Payment Method</span>
                <p className="font-bold text-slate-800">
                  💵 Cash on Delivery
                </p>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          {order.customer && order.deliveryAddress && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <p className="font-bold text-slate-800">{order.customer.phone}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</span>
                    <p className="font-bold text-slate-800">{order.customer.email}</p>
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
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-2">
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

          {/* CTA */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push('/orders')} className="font-bold text-xs">
              ← All Orders
            </Button>
            <Button variant="primary" onClick={() => router.push('/products')} className="font-bold text-xs">
              Continue Shopping 🛒
            </Button>
          </div>
        </div>
      </ShopLayout>
    </ProtectedRoute>
  );
}
