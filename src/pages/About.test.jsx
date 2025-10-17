import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import About from './About';

const renderAbout = () => {
  return render(
    <HelmetProvider>
      <About />
    </HelmetProvider>
  );
};

describe('About', () => {
  it('renders page title', () => {
    renderAbout();
    expect(screen.getByText(/About Your Store/i)).toBeInTheDocument();
  });

  it('renders lead paragraph', () => {
    renderAbout();
    expect(
      screen.getByText(
        /We're passionate about bringing you the finest products with exceptional service/i
      )
    ).toBeInTheDocument();
  });

  it('renders Our Story section', () => {
    renderAbout();
    expect(screen.getByText('Our Story')).toBeInTheDocument();
  });

  it('renders Our Mission section', () => {
    renderAbout();
    expect(screen.getByText('Our Mission')).toBeInTheDocument();
  });

  it('renders Why Choose Us section', () => {
    renderAbout();
    expect(screen.getByText('Why Choose Us')).toBeInTheDocument();
  });

  it('renders all value items', () => {
    renderAbout();
    expect(screen.getByText('Quality First')).toBeInTheDocument();
    expect(screen.getByText('Customer Focused')).toBeInTheDocument();
    expect(screen.getByText('Fast Shipping')).toBeInTheDocument();
    expect(screen.getByText('Secure Shopping')).toBeInTheDocument();
  });

  it('renders Our Commitment section', () => {
    renderAbout();
    expect(screen.getByText('Our Commitment')).toBeInTheDocument();
  });

  it('mentions sustainability', () => {
    renderAbout();
    expect(screen.getByText(/sustainability/i)).toBeInTheDocument();
  });
});