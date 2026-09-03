'use client';

import ShopLayout from '@/components/templates/ShopLayout';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import OrderCard from '@/components/organisms/OrderCard';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import useOrders from '@/hooks/useOrders';

export default function MyOrdersPage() {
  const { orders, loading, error, refetch } = useOrders(false);

  return (
    <ProtectedRoute>
      <ShopLayout>
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="border-b border-slate-100 pb-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Orders
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              View and track all your placed orders below.
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Spinner size="md" />
              <span className="text-xs text-slate-400 font-bold tracking-wide">Loading your orders...</span>
            </div>
          ) : error ? (
            <ErrorState onRetry={refetch} description={error} />
          ) : orders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="You haven't placed any orders yet. Browse our products and make your first purchase!"
              icon="📦"
              actionLabel="Shop Now"
              actionHref="/products"
            />
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </ShopLayout>
    </ProtectedRoute>
  );
}
