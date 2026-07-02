import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CartItem } from '../types';

const CART_KEY = 'sommCart';

interface CartContextValue {
  items: CartItem[];
  count: number;
  addToCart: (wineId: string, quantity?: number) => void;
  updateQuantity: (wineId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  lastAddedAt: number; // timestamp of last add — drives the "In your case" toast
}

const CartContext = createContext<CartContextValue | null>(null);

const readCart = (): CartItem[] => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(readCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedAt, setLastAddedAt] = useState(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((wineId: string, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.wineId === wineId);
      if (existing) {
        return prev.map(i => (i.wineId === wineId ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { wineId, quantity }];
    });
    setLastAddedAt(Date.now());
  }, []);

  const updateQuantity = useCallback((wineId: string, quantity: number) => {
    setItems(prev =>
      quantity <= 0
        ? prev.filter(i => i.wineId !== wineId)
        : prev.map(i => (i.wineId === wineId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        addToCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        lastAddedAt,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
