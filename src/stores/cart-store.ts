import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

/**
 * Store global do carrinho de compras
 * Persiste no localStorage
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      get total() {
        return get().items.reduce((total, item) => total + item.displayPrice, 0);
      },

      addItem: (item) =>
        set((state) => {
          // Verifica se o item já existe no carrinho
          const exists = state.items.find((i) => i.productId === item.productId);
          if (exists) {
            return state; // Não adiciona duplicados
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.displayPrice, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.length;
      },
    }),
    {
      name: 'lume-cart-storage',
    }
  )
);
