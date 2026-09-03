'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/utils/toast';
import { playSound, getSoundForCategory } from '@/lib/sounds';
import type { CartItem, Product } from '@/types';

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { user } = useAuth();
  const cartKey = user ? `pet-shop-cart-${user.id}` : 'pet-shop-cart-guest';

  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  // Load cart from cookies when cartKey changes
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    try {
      const saved = Cookies.get(cartKey);
      setItems(saved ? (JSON.parse(saved) as CartItem[]) : []);
    } catch {
      setItems([]);
    }
    setLoadedKey(cartKey);
  }, [cartKey]);
  /* eslint-enable react-hooks/exhaustive-deps */

  // Persist to cookies on every change (only if key matches the loaded key)
  useEffect(() => {
    if (loadedKey === cartKey) {
      Cookies.set(cartKey, JSON.stringify(items), { expires: 14 });
    }
  }, [items, cartKey, loadedKey]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        },
      ];
    });
    showToast('success', `${product.name} added to cart!`);
    const categorySound = getSoundForCategory(product.category || product.categorySlug || product.name);
    playSound(categorySound);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === productId);
      if (item) {
        showToast('info', `${item.name} removed from cart`);
        playSound('cart-remove');
      }
      return prev.filter((i) => i.id !== productId);
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => {
        const item = prev.find((i) => i.id === productId);
        if (item) {
          showToast('info', `${item.name} removed from cart`);
          playSound('cart-remove');
        }
        return prev.filter((i) => i.id !== productId);
      });
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    showToast('info', 'Cart cleared');
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        total,
        isOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
