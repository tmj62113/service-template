import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import ProductCard from './ProductCard';
import { useCartStore } from '../../stores/cartStore';

// Mock the cart store
vi.mock('../../stores/cartStore', () => ({
  useCartStore: vi.fn(() => vi.fn()),
}));

// Mock theme config
vi.mock('../../config/theme', () => ({
  theme: {
    commerce: {
      currencySymbol: '$',
    },
    features: {
      showStock: true,
      showRatings: true,
      showReviews: true,
    },
  },
}));

// Helper function to render with router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 99.99,
  image: 'https://example.com/image.jpg',
  category: 'Electronics',
  description: 'This is a test product',
  stock: 10,
  rating: 4.5,
  reviews: 100,
};

describe('ProductCard', () => {
  it('renders product information', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('This is a test product')).toBeInTheDocument();
  });

  it('displays product image', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('shows rating and reviews', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/4.5/)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('shows low stock badge when stock is below 10', () => {
    const lowStockProduct = { ...mockProduct, stock: 5 };
    renderWithRouter(<ProductCard product={lowStockProduct} />);
    expect(screen.getByText('Only 5 left')).toBeInTheDocument();
  });

  it('does not show stock badge when stock is 10 or more', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    expect(screen.queryByText(/Only.*left/)).not.toBeInTheDocument();
  });

  it('calls addItem when Add to Cart button is clicked', async () => {
    const user = userEvent.setup();
    const mockAddItem = vi.fn();
    useCartStore.mockReturnValue(mockAddItem);

    renderWithRouter(<ProductCard product={mockProduct} />);

    const addButton = screen.getByText('Add to Cart');
    await user.click(addButton);

    expect(mockAddItem).toHaveBeenCalledWith(mockProduct);
  });

  it('disables button and shows "Out of Stock" when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    renderWithRouter(<ProductCard product={outOfStockProduct} />);

    const button = screen.getByText('Out of Stock');
    expect(button).toBeDisabled();
  });
});