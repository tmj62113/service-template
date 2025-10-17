import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './Home';

const renderHome = () => {
  return render(
    <HelmetProvider>
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    </HelmetProvider>
  );
};

describe('Home', () => {
  it('renders hero section with title', () => {
    renderHome();
    expect(screen.getByText(/Welcome to Your Store/i)).toBeInTheDocument();
  });

  it('renders hero subtitle', () => {
    renderHome();
    expect(
      screen.getByText(/Discover our curated collection of premium products/i)
    ).toBeInTheDocument();
  });

  it('renders Shop Now CTA button', () => {
    renderHome();
    const shopNowButtons = screen.getAllByText('Shop Now');
    expect(shopNowButtons.length).toBeGreaterThan(0);
  });

  it('renders all feature cards', () => {
    renderHome();
    expect(screen.getByText('Free Shipping')).toBeInTheDocument();
    expect(screen.getByText('Secure Payment')).toBeInTheDocument();
    expect(screen.getByText('Easy Returns')).toBeInTheDocument();
    expect(screen.getByText('24/7 Support')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    renderHome();
    expect(screen.getByText('On orders over $100')).toBeInTheDocument();
    expect(screen.getByText('100% secure transactions')).toBeInTheDocument();
    expect(screen.getByText('30-day return policy')).toBeInTheDocument();
    expect(screen.getByText('Dedicated customer service')).toBeInTheDocument();
  });

  it('renders CTA section', () => {
    renderHome();
    expect(screen.getByText(/Ready to get started/i)).toBeInTheDocument();
    expect(screen.getByText('View All Products')).toBeInTheDocument();
  });

  it('has correct link to products page', () => {
    renderHome();
    const productLinks = screen.getAllByRole('link', { name: /shop now|view all products/i });
    productLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/products');
    });
  });
});