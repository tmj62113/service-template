import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Header from './Header';
import { AuthProvider } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';

// Mock the AuthContext
vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Mock theme config
vi.mock('../config/theme', () => ({
  theme: {
    brandName: 'Clockwork',
    social: {
      facebook: 'https://facebook.com/clockwork',
      instagram: 'https://instagram.com/clockwork',
      youtube: 'https://youtube.com/clockwork',
    },
  },
}));

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
};

describe('Header', () => {
  beforeEach(() => {
    // Default: non-authenticated user
    useAuth.mockReturnValue({
      isAuthenticated: false,
      logout: vi.fn(),
      user: null,
    });
  });

  it('renders the logo image', () => {
    renderHeader();
    const logo = screen.getByAltText('Clockwork');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/clockwork_logo_inverse.png');
  });

  it('renders navigation links', () => {
    renderHeader();
    // Links in desktop nav
    const mainNav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(mainNav).toBeInTheDocument();
    // Query within the specific navigation to avoid finding duplicates in mobile menu
    expect(screen.getAllByText('Services').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Team').length).toBeGreaterThan(0);
    expect(screen.getAllByText('About').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Contact').length).toBeGreaterThan(0);
  });

  it('renders social media links', () => {
    renderHeader();
    const facebookLink = screen.getByLabelText('Facebook');
    const instagramLink = screen.getByLabelText('Instagram');
    const youtubeLink = screen.getByLabelText('YouTube');

    expect(facebookLink).toBeInTheDocument();
    expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/clockwork');
    expect(instagramLink).toBeInTheDocument();
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/clockwork');
    expect(youtubeLink).toBeInTheDocument();
    expect(youtubeLink).toHaveAttribute('href', 'https://youtube.com/clockwork');
  });

  it('does not render user menu when not authenticated', () => {
    renderHeader();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('renders user menu when authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      logout: vi.fn(),
      user: { name: 'John Doe', email: 'john@example.com', role: 'user' },
    });

    renderHeader();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', async () => {
    const mockLogout = vi.fn();
    useAuth.mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
      user: { name: 'John Doe', email: 'john@example.com', role: 'user' },
    });

    const user = userEvent.setup();
    renderHeader();

    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('renders admin link for admin users', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      logout: vi.fn(),
      user: { name: 'Admin User', email: 'admin@example.com', role: 'admin' },
    });

    renderHeader();
    const adminLink = screen.getByText('Admin');
    expect(adminLink).toBeInTheDocument();
    expect(adminLink.closest('a')).toHaveAttribute('href', '/admin');
  });

  it('does not render admin link for regular users', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      logout: vi.fn(),
      user: { name: 'John Doe', email: 'john@example.com', role: 'user' },
    });

    renderHeader();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('renders mobile menu button', () => {
    renderHeader();
    const mobileMenuButton = screen.getByLabelText('Open navigation menu');
    expect(mobileMenuButton).toBeInTheDocument();
  });
});
