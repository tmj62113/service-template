import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Header from './Header';
import { useCartStore } from '../stores/cartStore';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the cart store
vi.mock('../stores/cartStore', () => ({
  useCartStore: vi.fn(),
}));

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Header />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Header', () => {
  beforeEach(() => {
    useCartStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({
          items: [],
          removeItem: vi.fn(),
          updateQuantity: vi.fn(),
          getTotal: () => 0,
          clearCart: vi.fn(),
        });
      }
      return { items: [] };
    });
  });

  it('renders the brand name', () => {
    renderHeader();
    // Brand name appears in both desktop header (h1) and mobile menu (h2)
    expect(screen.getAllByText(/Your Store/i).length).toBeGreaterThan(0);
  });

  it('renders navigation links', () => {
    renderHeader();
    // Links appear in both desktop nav and mobile menu
    expect(screen.getAllByText('Products').length).toBeGreaterThan(0);
    expect(screen.getAllByText('About').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Contact').length).toBeGreaterThan(0);
  });

  it('renders cart button', () => {
    renderHeader();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    // Cart button contains the Material Icon
    const cartButton = buttons.find(btn => btn.querySelector('.material-symbols-outlined'));
    expect(cartButton).toBeInTheDocument();
  });

  it('displays cart badge when items are in cart', () => {
    useCartStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({
          items: [
            { id: 1, name: 'Product 1', price: 10, quantity: 2 },
            { id: 2, name: 'Product 2', price: 20, quantity: 1 },
          ],
          removeItem: vi.fn(),
          updateQuantity: vi.fn(),
          getTotal: () => 130,
          clearCart: vi.fn(),
        });
      }
      return {
        items: [
          { id: 1, name: 'Product 1', price: 10, quantity: 2 },
          { id: 2, name: 'Product 2', price: 20, quantity: 1 },
        ],
      };
    });

    renderHeader();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not display cart badge when cart is empty', () => {
    renderHeader();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('opens cart when cart button is clicked', async () => {
    const user = userEvent.setup();
    renderHeader();

    const buttons = screen.getAllByRole('button');
    const cartButton = buttons.find(btn => btn.querySelector('.material-symbols-outlined'));
    await user.click(cartButton);

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
  });
});