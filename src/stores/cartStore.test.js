import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCartStore } from './cartStore';

// Mock the toast store
vi.mock('./toastStore', () => ({
  useToastStore: {
    getState: () => ({
      addToast: vi.fn(),
    }),
  },
}));

describe('cartStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    useCartStore.getState().clearCart();
  });

  it('initializes with an empty cart', () => {
    const { items } = useCartStore.getState();
    expect(items).toEqual([]);
  });

  it('adds an item to the cart', () => {
    const product = {
      id: 1,
      name: 'Test Product',
      price: 50,
      image: 'test.jpg',
      stock: 10,
    };

    useCartStore.getState().addItem(product);
    const { items } = useCartStore.getState();

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ ...product, quantity: 1 });
  });

  it('increases quantity when adding the same item', () => {
    const product = {
      id: 1,
      name: 'Test Product',
      price: 50,
      image: 'test.jpg',
      stock: 10,
    };

    useCartStore.getState().addItem(product);
    useCartStore.getState().addItem(product);

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('adds multiple different items', () => {
    const product1 = { id: 1, name: 'Product 1', price: 50, image: 'test1.jpg', stock: 10 };
    const product2 = { id: 2, name: 'Product 2', price: 100, image: 'test2.jpg', stock: 10 };

    useCartStore.getState().addItem(product1);
    useCartStore.getState().addItem(product2);

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(2);
  });

  it('removes an item from the cart', () => {
    const product = { id: 1, name: 'Test Product', price: 50, image: 'test.jpg' };

    useCartStore.getState().addItem(product);
    useCartStore.getState().removeItem(1);

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(0);
  });

  it('updates item quantity', () => {
    const product = { id: 1, name: 'Test Product', price: 50, image: 'test.jpg', stock: 10 };

    useCartStore.getState().addItem(product);
    useCartStore.getState().updateQuantity(1, 5);

    const { items } = useCartStore.getState();
    expect(items[0].quantity).toBe(5);
  });

  it('removes item when quantity is updated to 0 or less', () => {
    const product = { id: 1, name: 'Test Product', price: 50, image: 'test.jpg' };

    useCartStore.getState().addItem(product);
    useCartStore.getState().updateQuantity(1, 0);

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(0);
  });

  it('clears all items from cart', () => {
    const product1 = { id: 1, name: 'Product 1', price: 50, image: 'test1.jpg' };
    const product2 = { id: 2, name: 'Product 2', price: 100, image: 'test2.jpg' };

    useCartStore.getState().addItem(product1);
    useCartStore.getState().addItem(product2);
    useCartStore.getState().clearCart();

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(0);
  });

  it('calculates total correctly', () => {
    const product1 = { id: 1, name: 'Product 1', price: 50, image: 'test1.jpg', stock: 10 };
    const product2 = { id: 2, name: 'Product 2', price: 100, image: 'test2.jpg', stock: 10 };

    useCartStore.getState().addItem(product1, 2); // 50 * 2 = 100
    useCartStore.getState().addItem(product2, 1); // 100 * 1 = 100

    const total = useCartStore.getState().getTotal();
    expect(total).toBe(200);
  });

  it('calculates item count correctly', () => {
    const product1 = { id: 1, name: 'Product 1', price: 50, image: 'test1.jpg', stock: 10 };
    const product2 = { id: 2, name: 'Product 2', price: 100, image: 'test2.jpg', stock: 10 };

    useCartStore.getState().addItem(product1, 2);
    useCartStore.getState().addItem(product2, 3);

    const count = useCartStore.getState().getItemCount();
    expect(count).toBe(5);
  });

  it('returns 0 for empty cart total', () => {
    const total = useCartStore.getState().getTotal();
    expect(total).toBe(0);
  });

  it('returns 0 for empty cart item count', () => {
    const count = useCartStore.getState().getItemCount();
    expect(count).toBe(0);
  });
});