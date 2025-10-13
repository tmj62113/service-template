import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from './Contact';

describe('Contact', () => {
  it('renders page title', () => {
    render(<Contact />);
    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
  });

  it('renders contact information', () => {
    render(<Contact />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Business Hours')).toBeInTheDocument();
  });

  it('renders contact form', () => {
    render(<Contact />);
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<Contact />);
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

    render(<Contact />);

    await user.type(screen.getByLabelText(/Name/i), 'John Doe');
    await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/Subject/i), 'Test Subject');
    await user.type(screen.getByLabelText(/Message/i), 'Test message content');

    await user.click(screen.getByText('Send Message'));

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/messages',
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

    render(<Contact />);

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
    render(<Contact />);
    expect(screen.getByText(/support@yourstore.com/i)).toBeInTheDocument();
  });

  it('displays phone number', () => {
    render(<Contact />);
    expect(screen.getByText(/\+1 \(555\) 123-4567/)).toBeInTheDocument();
  });

  it('displays business address', () => {
    render(<Contact />);
    expect(screen.getByText(/123 Commerce Street/)).toBeInTheDocument();
    expect(screen.getByText(/San Francisco, CA 94102/)).toBeInTheDocument();
  });
});