import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import userEvent from '@testing-library/user-event';
import Contact from './Contact';
import { getApiUrl } from '../config/api';

const renderContact = () => {
  return render(
    <HelmetProvider>
      <Contact />
    </HelmetProvider>
  );
};

describe('Contact', () => {
  it('renders page title', () => {
    renderContact();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('renders contact information', () => {
    renderContact();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Business Hours')).toBeInTheDocument();
  });

  it('renders contact form', () => {
    renderContact();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderContact();
    expect(screen.getByText('Send Message')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Message sent successfully' }),
      })
    );

    renderContact();

    await user.type(screen.getByLabelText(/Name/i), 'John Doe');
    await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/Subject/i), 'Test Subject');
    await user.type(screen.getByLabelText(/Message/i), 'Test message content');

    await user.click(screen.getByText('Send Message'));

    expect(fetch).toHaveBeenCalledWith(
      getApiUrl('/api/messages'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test Subject',
          message: 'Test message content',
          mailingList: false,
          website: '',
          phone: '',
        }),
      })
    );

    global.fetch.mockRestore();
  });

  it('shows success message after submission', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Message sent successfully' }),
      })
    );

    renderContact();

    await user.type(screen.getByLabelText(/Name/i), 'John Doe');
    await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/Subject/i), 'Test');
    await user.type(screen.getByLabelText(/Message/i), 'Test message');

    await user.click(screen.getByText('Send Message'));

    await waitFor(() => {
      expect(screen.getByText('Thank you for your message!')).toBeInTheDocument();
    });

    global.fetch.mockRestore();
  });

  it('displays email address', () => {
    renderContact();
    // Email may be split across elements, so check for partial match
    const emailElements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('support@') && element?.textContent?.includes('.com');
    });
    expect(emailElements.length).toBeGreaterThan(0);
  });

  it('displays phone number', () => {
    renderContact();
    expect(screen.getByText(/\+1 \(555\) 123-4567/)).toBeInTheDocument();
  });

  it('displays business address', () => {
    renderContact();
    // Address may be split across elements with line breaks
    const addressElements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('123 Commerce Street');
    });
    expect(addressElements.length).toBeGreaterThan(0);

    const cityElements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('San Francisco, CA 94102');
    });
    expect(cityElements.length).toBeGreaterThan(0);
  });
});