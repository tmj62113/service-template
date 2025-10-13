import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useToastStore } from './toastStore';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find((item) => item.id === product.id);
        const productStock = product.stock || 0;

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;

          // Check if new quantity exceeds stock
          if (newQuantity > productStock) {
            useToastStore.getState().addToast(
              `Only ${productStock} ${product.name} available in stock`,
              'warning'
            );
            // Set to max stock instead
            if (existingItem.quantity < productStock) {
              set({
                items: items.map((item) =>
                  item.id === product.id
                    ? { ...item, quantity: productStock }
                    : item
                ),
              });
              useToastStore.getState().addToast(
                `${product.name} quantity set to maximum (${productStock})`,
                'info'
              );
            }
            return;
          }

          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: newQuantity }
                : item
            ),
          });
          useToastStore.getState().addToast(
            `Updated ${product.name} quantity in cart`,
            'success'
          );
        } else {
          // Check if initial quantity exceeds stock
          if (quantity > productStock) {
            useToastStore.getState().addToast(
              `Only ${productStock} ${product.name} available in stock`,
              'warning'
            );
            return;
          }

          set({ items: [...items, { ...product, quantity }] });
          useToastStore.getState().addToast(
            `${product.name} added to cart`,
            'success'
          );
        }
      },

      removeItem: (productId) => {
        const item = get().items.find((item) => item.id === productId);
        set({ items: get().items.filter((item) => item.id !== productId) });

        if (item) {
          useToastStore.getState().addToast(
            `${item.name} removed from cart`,
            'info'
          );
        }
      },

      updateQuantity: (productId, quantity) => {
        const item = get().items.find((item) => item.id === productId);

        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        if (item) {
          const productStock = item.stock || 0;

          // Check if requested quantity exceeds stock
          if (quantity > productStock) {
            useToastStore.getState().addToast(
              `Only ${productStock} ${item.name} available in stock`,
              'warning'
            );
            // Set to max stock instead
            set({
              items: get().items.map((cartItem) =>
                cartItem.id === productId
                  ? { ...cartItem, quantity: productStock }
                  : cartItem
              ),
            });
            useToastStore.getState().addToast(
              `${item.name} quantity set to maximum (${productStock})`,
              'info'
            );
            return;
          }

          const isIncrease = quantity > item.quantity;

          set({
            items: get().items.map((cartItem) =>
              cartItem.id === productId ? { ...cartItem, quantity } : cartItem
            ),
          });

          if (isIncrease) {
            useToastStore.getState().addToast(
              `${item.name}: ${quantity} in cart`,
              'success'
            );
          } else {
            useToastStore.getState().addToast(
              `${item.name}: ${quantity} in cart`,
              'info'
            );
          }
        }
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);