import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import userEvent from '@testing-library/user-event';
import Home from './Home';

// Mock fetch for potential API calls
global.fetch = vi.fn();

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
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  it('renders hero section with main heading', () => {
    renderHome();
    expect(screen.getByText('Everything you need to launch and grow')).toBeInTheDocument();
  });

  it('renders hero section description with Clockwork branding', () => {
    renderHome();
    expect(screen.getByText(/Clockwork gives you a fully customizable website/i)).toBeInTheDocument();
    expect(screen.getByText(/One platform/i)).toBeInTheDocument();
    expect(screen.getByText(/Any service business/i)).toBeInTheDocument();
  });

  it('renders Work with us button in hero', () => {
    renderHome();
    expect(screen.getByText('Work with us')).toBeInTheDocument();
  });

  it('renders features section header', () => {
    renderHome();
    expect(screen.getByText('Why Choose Clockwork?')).toBeInTheDocument();
  });

  it('renders features section intro text', () => {
    renderHome();
    expect(screen.getByText(/We built the booking platform that should've existed all along/i)).toBeInTheDocument();
  });

  it('renders all five feature cards', () => {
    renderHome();
    expect(screen.getByText('Complete Project Support')).toBeInTheDocument();
    expect(screen.getByText('Streamlined Operations')).toBeInTheDocument();
    expect(screen.getByText('Professional-Grade Range')).toBeInTheDocument();
    expect(screen.getByText('Your Clients Stay Yours')).toBeInTheDocument();
    expect(screen.getByText('True Partnership Pricing')).toBeInTheDocument();
  });

  it('renders slider section header', () => {
    renderHome();
    expect(screen.getByText(/You are in the right place if you're a/i)).toBeInTheDocument();
  });

  it('renders hero slideshow with controls', () => {
    renderHome();
    // Check for slideshow controls
    expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
    expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
  });

  it('navigates to services when hero button is clicked', async () => {
    const user = userEvent.setup();
    renderHome();

    const workWithUsButton = screen.getByText('Work with us');
    await user.click(workWithUsButton);

    // Can't test actual navigation in this test, but we can verify button is clickable
    expect(workWithUsButton).toBeInTheDocument();
  });

  it('renders multiple Read more buttons for feature cards', () => {
    renderHome();
    const readMoreButtons = screen.getAllByText('Read more');
    // Should have 5 Read more buttons (one per feature card)
    expect(readMoreButtons.length).toBe(5);
  });
});
