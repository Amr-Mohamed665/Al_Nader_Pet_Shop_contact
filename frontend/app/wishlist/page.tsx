'use client';

import ShopLayout from '@/components/templates/ShopLayout';
import ProtectedRoute from '@/components/guards/ProtectedRoute';

import ProductGrid from '@/components/organisms/ProductGrid';
import Spinner from '@/components/atoms/Spinner';
import EmptyState from '@/components/molecules/EmptyState';
import { useWishlistQuery } from '@/hooks/useWishlist';

export default function WishlistPage() {
  const { data: wishlistItems = [], isLoading } = useWishlistQuery();

  return (
    <ProtectedRoute>
      <ShopLayout>
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">


          {/* Header */}
          <div className="text-center py-6">
            <span className="inline-block text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">
              Your Favorites
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Wishlist
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Keep track of products and accessories you love.
            </p>
          </div>

          <hr className="border-slate-200/80 !my-6" />

          {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Spinner size="md" />
              <span className="text-xs text-slate-400 font-bold tracking-wide">Loading Wishlist...</span>
            </div>
          ) : (wishlistItems as any[]).length === 0 ? (
            <div className="py-8">
              <EmptyState
                title="Your Wishlist is Empty"
                description="Add your favorite pets and accessories to your wishlist to keep track of them."
                icon="❤️"
                actionLabel="Start Shopping"
                actionHref="/products"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">
                  Saved Items ({(wishlistItems as any[]).length})
                </h2>
              </div>
              <ProductGrid products={wishlistItems as any[]} />
            </div>
          )}
        </div>
      </ShopLayout>
    </ProtectedRoute>
  );
}
