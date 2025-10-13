import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import About from './About';

describe('About', () => {
  it('renders page title', () => {
    render(<About />);
    expect(screen.getByText(/About Your Store/i)).toBeInTheDocument();
  });

  it('renders lead paragraph', () => {
    render(<About />);
    expect(
      screen.getByText(
        /We're passionate about bringing you the finest products with exceptional service/i
      )
    ).toBeInTheDocument();
  });

  it('renders Our Story section', () => {
    render(<About />);
    expect(screen.getByText('Our Story')).toBeInTheDocument();
  });

  it('renders Our Mission section', () => {
    render(<About />);
    expect(screen.getByText('Our Mission')).toBeInTheDocument();
  });

  it('renders Why Choose Us section', () => {
    render(<About />);
    expect(screen.getByText('Why Choose Us')).toBeInTheDocument();
  });

  it('renders all value items', () => {
    render(<About />);
    expect(screen.getByText('Quality First')).toBeInTheDocument();
    expect(screen.getByText('Customer Focused')).toBeInTheDocument();
    expect(screen.getByText('Fast Shipping')).toBeInTheDocument();
    expect(screen.getByText('Secure Shopping')).toBeInTheDocument();
  });

  it('renders Our Commitment section', () => {
    render(<About />);
    expect(screen.getByText('Our Commitment')).toBeInTheDocument();
  });

  it('mentions sustainability', () => {
    render(<About />);
    expect(screen.getByText(/sustainability/i)).toBeInTheDocument();
  });
});