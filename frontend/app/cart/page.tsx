'use client';

import Link from 'next/link';
import ShopLayout from '@/components/templates/ShopLayout';
import QuantitySelector from '@/components/molecules/QuantitySelector';
import EmptyState from '@/components/molecules/EmptyState';
import Price from '@/components/atoms/Price';
import Button from '@/components/atoms/Button';
import { MediaThumbnail } from '@/components/atoms/MediaRenderer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const { items, total, count, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (items.length === 0) {
    return (
      <ShopLayout>
        <div className="py-12">
          <EmptyState
            title="Your cart is empty"
            description="Looks like you haven't added anything to your cart yet. Explore our catalog and find the perfect supplies for your pet!"
            icon="🛒"
            actionLabel="Browse Products"
            actionHref="/products"
          />
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {count} {count === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold text-xs">
            🗑️ Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              return (
                <div
                  key={item.id}
                  className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all items-center"
                >
                  {/* Thumbnail */}
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
                    <MediaThumbnail src={item.image} alt={item.name} />
                  </div>

                  {/* Content (Info & Price) */}
                  <div className="flex-grow min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    {/* Info */}
                    <div className="space-y-1 sm:space-y-2 flex-grow min-w-0">
                      <Link href={`/products/${item.id}`} className="text-sm font-bold text-slate-800 hover:text-teal-600 transition-colors line-clamp-1">
                        {item.name}
                      </Link>
                      <div className="flex items-center gap-3">
                        <QuantitySelector
                          quantity={item.quantity}
                          onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                          onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                          className="scale-90 sm:scale-100 origin-left"
                        />
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline transition-colors flex-shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-left sm:text-right flex-shrink-0 space-y-0.5 mt-1 sm:mt-0">
                      <Price amount={item.price * item.quantity} className="text-base text-teal-600 font-extrabold" />
                      <p className="text-[10px] text-slate-400">
                        {new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(item.price)} each
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm sticky top-24 space-y-5">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({count} items)</span>
                  <Price amount={total} className="font-bold text-slate-800" />
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-xs font-bold text-emerald-600">FREE</span>
                </div>
                <hr className="border-slate-100" />
                <div className="flex justify-between text-base font-extrabold">
                  <span className="text-slate-900">Total</span>
                  <Price amount={total} className="text-teal-600 text-lg" />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {isAuthenticated ? (
                  <Button variant="primary" href="/checkout" className="w-full py-3.5 font-extrabold shadow-md shadow-teal-500/10 text-xs uppercase tracking-wider">
                    Proceed to Checkout
                  </Button>
                ) : (
                  <Button variant="primary" href="/login" className="w-full py-3.5 font-extrabold shadow-md shadow-teal-500/10 text-xs uppercase tracking-wider">
                    Login to Checkout
                  </Button>
                )}
                <Button variant="outline" href="/products" className="w-full py-3 font-bold text-xs">
                  ← Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
