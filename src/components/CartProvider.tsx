'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useToast } from './ToastProvider';

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  name: string;
  price: number;
  imageUrl: string;
  packSize: number;
  eggType: string;
  stock: number;
}

interface CartSummary {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

interface CartContextType {
  items: CartItem[];
  summary: CartSummary;
  loading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<boolean>;
  updateQuantity: (productId: number, quantity: number) => Promise<boolean>;
  removeItem: (productId: number) => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary>({ subtotal: 0, deliveryFee: 0, discount: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    if (!user) {
      setItems([]);
      setSummary({ subtotal: 0, deliveryFee: 0, discount: 0, total: 0 });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/cart');
      const json = await res.json();
      if (json.success) {
        setItems(json.data.items);
        setSummary(json.data.summary);
      }
    } catch (e) {
      console.error('Error fetching cart', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (productId: number, quantity: number): Promise<boolean> => {
    if (!user) {
      showToast('Please log in to add products to cart.', 'warning');
      return false;
    }
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || 'Added to cart!', 'success');
        await refreshCart();
        return true;
      } else {
        showToast(json.message || 'Failed to add item.', 'error');
        return false;
      }
    } catch (e) {
      showToast('Server error. Try again.', 'error');
      return false;
    }
  };

  const updateQuantity = async (productId: number, quantity: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/cart/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      const json = await res.json();
      if (json.success) {
        await refreshCart();
        return true;
      } else {
        showToast(json.message || 'Failed to update quantity.', 'error');
        return false;
      }
    } catch (e) {
      showToast('Server error.', 'error');
      return false;
    }
  };

  const removeItem = async (productId: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/cart/${productId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || 'Item removed.', 'info');
        await refreshCart();
        return true;
      } else {
        showToast(json.message || 'Failed to remove item.', 'error');
        return false;
      }
    } catch (e) {
      showToast('Server error.', 'error');
      return false;
    }
  };

  return (
    <CartContext.Provider value={{ items, summary, loading, addToCart, updateQuantity, removeItem, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
