import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Cart from './Cart';
import { useCartStore } from '../../stores/cartStore';
import { useToastStore } from '../../stores/toastStore';

// Mock the cart store
vi.mock('../../stores/cartStore', () => ({
  useCartStore: vi.fn(),
}));

// Mock the toast store
vi.mock('../../stores/toastStore', () => ({
  useToastStore: vi.fn(() => ({
    addToast: vi.fn(),
  })),
}));

// Mock theme config
vi.mock('../../config/theme', () => ({
  theme: {
    commerce: {
      currencySymbol: '$',
    },
  },
}));

// Mock fetch
global.fetch = vi.fn();

const mockCartFunctions = {
  items: [],
  removeItem: vi.fn(),
  updateQuantity: vi.fn(),
  getTotal: vi.fn(() => 0),
  clearCart: vi.fn(),
};

// Helper to wrap component in Router
const renderCart = (props) => {
  return render(
    <BrowserRouter>
      <Cart {...props} />
    </BrowserRouter>
  );
};

describe('Cart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.mockReturnValue(mockCartFunctions);
    global.fetch.mockClear();
  });

  it('does not render when isOpen is false', () => {
    renderCart({ isOpen: false, onClose: vi.fn() });
    expect(screen.queryByText('Shopping Cart')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    renderCart({ isOpen: true, onClose: vi.fn() });
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
  });

  it('shows empty cart message when no items', () => {
    renderCart({ isOpen: true, onClose: vi.fn() });
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('displays cart items', () => {
    useCartStore.mockReturnValue({
      ...mockCartFunctions,
      items: [
        {
          id: 1,
          name: 'Product 1',
          price: 50,
          quantity: 2,
          image: 'https://example.com/image1.jpg',
        },
        {
          id: 2,
          name: 'Product 2',
          price: 100,
          quantity: 1,
          image: 'https://example.com/image2.jpg',
        },
      ],
      getTotal: vi.fn(() => 200),
    });

    renderCart({ isOpen: true, onClose: vi.fn() });

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    renderCart({ isOpen: true, onClose: mockOnClose });

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    renderCart({ isOpen: true, onClose: mockOnClose });

    const overlay = document.querySelector('.cart-overlay');
    await user.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls removeItem when remove button is clicked', async () => {
    const user = userEvent.setup();
    const mockRemoveItem = vi.fn();

    useCartStore.mockReturnValue({
      ...mockCartFunctions,
      items: [
        {
          id: 1,
          name: 'Product 1',
          price: 50,
          quantity: 1,
          image: 'https://example.com/image1.jpg',
        },
      ],
      removeItem: mockRemoveItem,
      getTotal: vi.fn(() => 50),
    });

    renderCart({ isOpen: true, onClose: vi.fn() });

    const removeButton = screen.getByText('Remove');
    await user.click(removeButton);

    expect(mockRemoveItem).toHaveBeenCalledWith(1);
  });

  it('calls updateQuantity when quantity buttons are clicked', async () => {
    const user = userEvent.setup();
    const mockUpdateQuantity = vi.fn();

    useCartStore.mockReturnValue({
      ...mockCartFunctions,
      items: [
        {
          id: 1,
          name: 'Product 1',
          price: 50,
          quantity: 2,
          image: 'https://example.com/image1.jpg',
        },
      ],
      updateQuantity: mockUpdateQuantity,
      getTotal: vi.fn(() => 100),
    });

    renderCart({ isOpen: true, onClose: vi.fn() });

    const buttons = screen.getAllByRole('button');
    const addButton = buttons.find(btn => btn.querySelector('.material-symbols-outlined') && btn.textContent.includes('add'));
    await user.click(addButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 3);

    const removeButton = buttons.find(btn => btn.querySelector('.material-symbols-outlined') && btn.textContent.includes('remove') && !btn.textContent.includes('Remove'));
    await user.click(removeButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 1);
  });

  it('calls clearCart when clear cart button is clicked', async () => {
    const user = userEvent.setup();
    const mockClearCart = vi.fn();

    useCartStore.mockReturnValue({
      ...mockCartFunctions,
      items: [
        {
          id: 1,
          name: 'Product 1',
          price: 50,
          quantity: 1,
          image: 'https://example.com/image1.jpg',
        },
      ],
      clearCart: mockClearCart,
      getTotal: vi.fn(() => 50),
    });

    renderCart({ isOpen: true, onClose: vi.fn() });

    const clearButton = screen.getByText('Clear Cart');
    await user.click(clearButton);

    expect(mockClearCart).toHaveBeenCalled();
  });
});