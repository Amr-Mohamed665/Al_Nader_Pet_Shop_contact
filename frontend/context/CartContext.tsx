'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { showToast } from '@/utils/toast';
import { playSound, getSoundForCategory } from '@/lib/sounds';
import type { CartItem, Item } from '@/types';

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  addItem: (item: Item, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: (showNotification?: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((item: Item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity,
        },
      ];
    });
    showToast('success', `${item.name} added to cart!`);
    const categorySound = getSoundForCategory(item.category || item.categorySlug || item.name);
    playSound(categorySound);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (item) {
        showToast('info', `${item.name} removed from cart`);
        playSound('cart-remove');
      }
      return prev.filter((i) => i.id !== itemId);
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => {
        const item = prev.find((i) => i.id === itemId);
        if (item) {
          showToast('info', `${item.name} removed from cart`);
          playSound('cart-remove');
        }
        return prev.filter((i) => i.id !== itemId);
      });
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback((showNotification = true) => {
    setItems([]);
    if (showNotification) {
      showToast('info', 'Cart cleared');
    }
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
