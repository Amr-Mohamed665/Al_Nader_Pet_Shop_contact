'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import CartItemRow from '@/components/molecules/CartItemRow';
import Price from '@/components/atoms/Price';
import Button from '@/components/atoms/Button';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    total,
    count,
  } = useCart();
  
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on ESC keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Drawer Body */}
      <div
        ref={drawerRef}
        className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-slide-in-right z-10 border-l border-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h2 className="text-lg font-bold text-slate-900">Your Shopping Cart</h2>
            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full border border-teal-100">
              {count} {count === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-grow overflow-y-auto px-6 py-2 divide-y divide-slate-100">
          {items.length > 0 ? (
            items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full py-12">
              <span className="text-5xl mb-3 select-none">🐾</span>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Your cart is empty</h3>
              <p className="text-xs text-slate-400 max-w-[200px] mb-6">
                Add items to your cart to get started with your purchase.
              </p>
              <Button variant="outline" size="sm" onClick={closeCart} className="font-bold">
                Continue Shopping
              </Button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-6 bg-slate-50/50 space-y-4">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-500 font-semibold">Total Amount:</span>
              <Price amount={total} className="text-xl text-teal-600 font-extrabold" />
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Calculations are finalized based on real backend pricing at order execution.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="outline" className="w-full py-3 text-xs font-bold" href="/cart" onClick={closeCart}>
                View Cart
              </Button>
              <Button variant="primary" className="w-full py-3 text-xs font-bold shadow-md shadow-teal-500/10" href="/checkout" onClick={closeCart}>
                Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
