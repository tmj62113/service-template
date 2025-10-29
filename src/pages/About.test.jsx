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
  it('renders page title with Clockwork brand', () => {
    renderAbout();
    expect(screen.getByText(/About Clockwork/i)).toBeInTheDocument();
  });

  it('renders hero section heading', () => {
    renderAbout();
    expect(
      screen.getByText(/We believe running a service business shouldn't feel like juggling chaos/i)
    ).toBeInTheDocument();
  });

  it('renders hero body paragraph', () => {
    renderAbout();
    expect(
      screen.getByText(/Every service professional knows the frustration/i)
    ).toBeInTheDocument();
  });

  it('mentions Clockwork by name', () => {
    renderAbout();
    expect(screen.getByText(/That's why we built Clockwork/i)).toBeInTheDocument();
  });

  it('renders What Makes Us Different section', () => {
    renderAbout();
    expect(screen.getByText('What Makes Us Different')).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    renderAbout();
    expect(screen.getByText('Built for How You Actually Work')).toBeInTheDocument();
    expect(screen.getByText('Simple by Design')).toBeInTheDocument();
    expect(screen.getByText('Reliable as Time')).toBeInTheDocument();
    expect(screen.getByText('Made for Growth')).toBeInTheDocument();
  });

  it('renders Who We Serve section', () => {
    renderAbout();
    expect(screen.getByText('Who We Serve')).toBeInTheDocument();
  });

  it('renders service type categories', () => {
    renderAbout();
    expect(screen.getByText('Beauty & Wellness')).toBeInTheDocument();
    expect(screen.getByText('Health & Fitness')).toBeInTheDocument();
    expect(screen.getByText('Professional Services')).toBeInTheDocument();
    expect(screen.getByText('Home Services')).toBeInTheDocument();
    expect(screen.getByText('Creative Services')).toBeInTheDocument();
  });

  it('renders CTA section', () => {
    renderAbout();
    expect(screen.getByText(/Ready to reclaim your time/i)).toBeInTheDocument();
  });

  it('renders Browse Services link', () => {
    renderAbout();
    const servicesLink = screen.getByText('Browse Services');
    expect(servicesLink).toBeInTheDocument();
    expect(servicesLink.closest('a')).toHaveAttribute('href', '/services');
  });

  it('renders Contact Us link', () => {
    renderAbout();
    const contactLink = screen.getByText('Contact Us');
    expect(contactLink).toBeInTheDocument();
    expect(contactLink.closest('a')).toHaveAttribute('href', '/contact');
  });
});
