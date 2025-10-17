import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import userEvent from '@testing-library/user-event';
import Home from './Home';

// Mock fetch for contact form submissions
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

  it('renders hero slideshow', () => {
    renderHome();
    // Check for slideshow controls
    expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
    expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
  });

  it('renders collections section header', () => {
    renderHome();
    expect(screen.getByText('MJ Peterson Art Collections')).toBeInTheDocument();
  });

  it('renders all three collection buttons', () => {
    renderHome();
    expect(screen.getByText('Steampunk Art')).toBeInTheDocument();
    expect(screen.getByText('Brass & Copper')).toBeInTheDocument();
    expect(screen.getByText('Victorian Dreams')).toBeInTheDocument();
  });

  it('renders artwork section header', () => {
    renderHome();
    expect(screen.getByText('Artwork by MJ Peterson')).toBeInTheDocument();
  });

  it('renders about section', () => {
    renderHome();
    expect(screen.getByText('About MJ Peterson')).toBeInTheDocument();
    expect(screen.getByText(/Victorian elegance and industrial innovation/i)).toBeInTheDocument();
  });

  it('renders contact section', () => {
    renderHome();
    expect(screen.getByText('CONTACT')).toBeInTheDocument();
    expect(screen.getByText(/mark@mjpetersonart.com/i)).toBeInTheDocument();
  });

  it('renders contact form fields', () => {
    renderHome();
    expect(screen.getByLabelText('FIRST NAME')).toBeInTheDocument();
    expect(screen.getByLabelText('LAST NAME')).toBeInTheDocument();
    expect(screen.getByLabelText('EMAIL *')).toBeInTheDocument();
    expect(screen.getByLabelText('MESSAGE')).toBeInTheDocument();
    expect(screen.getByLabelText('SIGN UP FOR MY MAILING LIST')).toBeInTheDocument();
  });

  it('submits contact form successfully', async () => {
    const user = userEvent.setup();
    renderHome();

    // Fill out form
    await user.type(screen.getByLabelText('FIRST NAME'), 'John');
    await user.type(screen.getByLabelText('LAST NAME'), 'Doe');
    await user.type(screen.getByLabelText('EMAIL *'), 'john@example.com');
    await user.type(screen.getByLabelText('MESSAGE'), 'Test message');

    // Submit form
    await user.click(screen.getByText('Send'));

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Thank you for your message!')).toBeInTheDocument();
    });
  });
});
