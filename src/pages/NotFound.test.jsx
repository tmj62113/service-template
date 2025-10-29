import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
import NotFound from './NotFound';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to render NotFound with Router and Helmet
const renderNotFound = () => {
  return render(
    <HelmetProvider>
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    </HelmetProvider>
  );
};

describe('NotFound', () => {
  it('renders 404 page title', () => {
    renderNotFound();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('renders 404 number display', () => {
    renderNotFound();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('displays helpful description message', () => {
    renderNotFound();
    expect(screen.getByText(/We couldn't find the page you're looking for/i)).toBeInTheDocument();
  });

  it('renders search input for services', () => {
    renderNotFound();
    const searchInput = screen.getByPlaceholderText(/search by service name or category/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('renders search button', () => {
    renderNotFound();
    const searchButton = screen.getByRole('button', { name: /^search$/i });
    expect(searchButton).toBeInTheDocument();
  });

  it('search button is disabled when input is empty', () => {
    renderNotFound();
    const searchButton = screen.getByRole('button', { name: /^search$/i });
    expect(searchButton).toBeDisabled();
  });

  it('search button is enabled when input has text', async () => {
    const user = userEvent.setup();
    renderNotFound();

    const searchInput = screen.getByPlaceholderText(/search by service name or category/i);
    const searchButton = screen.getByRole('button', { name: /^search$/i });

    await user.type(searchInput, 'coaching');

    expect(searchButton).not.toBeDisabled();
  });

  it('navigates to services page with search query on form submit', async () => {
    const user = userEvent.setup();
    renderNotFound();

    const searchInput = screen.getByPlaceholderText(/search by service name or category/i);
    const searchButton = screen.getByRole('button', { name: /^search$/i });

    await user.type(searchInput, 'life coaching');
    await user.click(searchButton);

    expect(mockNavigate).toHaveBeenCalledWith('/services?search=life%20coaching');
  });

  it('trims whitespace from search query', async () => {
    const user = userEvent.setup();
    renderNotFound();

    const searchInput = screen.getByPlaceholderText(/search by service name or category/i);
    const searchButton = screen.getByRole('button', { name: /^search$/i });

    await user.type(searchInput, '  tutoring  ');
    await user.click(searchButton);

    expect(mockNavigate).toHaveBeenCalledWith('/services?search=tutoring');
  });

  it('renders all suggestion cards', () => {
    renderNotFound();

    expect(screen.getByText('Homepage')).toBeInTheDocument();
    expect(screen.getByText('Browse Services')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('suggestion cards have correct links', () => {
    renderNotFound();

    const homepageLink = screen.getByRole('link', { name: /navigate to homepage/i });
    const browseLink = screen.getByRole('link', { name: /navigate to browse services/i });
    const aboutLink = screen.getByRole('link', { name: /navigate to about us/i });
    const contactLink = screen.getByRole('link', { name: /navigate to contact us/i });

    expect(homepageLink).toHaveAttribute('href', '/');
    expect(browseLink).toHaveAttribute('href', '/services');
    expect(aboutLink).toHaveAttribute('href', '/about');
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('renders suggestion descriptions', () => {
    renderNotFound();

    expect(screen.getByText('Start from the beginning')).toBeInTheDocument();
    expect(screen.getByText('Explore our service offerings')).toBeInTheDocument();
    expect(screen.getByText('Learn more about Clockwork')).toBeInTheDocument();
    expect(screen.getByText('Get in touch with questions')).toBeInTheDocument();
  });

  it('renders Go Back button', () => {
    renderNotFound();
    const backButton = screen.getByRole('button', { name: /go back to previous page/i });
    expect(backButton).toBeInTheDocument();
  });

  it('navigates back when Go Back button is clicked', async () => {
    const user = userEvent.setup();
    renderNotFound();

    const backButton = screen.getByRole('button', { name: /go back to previous page/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('has proper heading structure', () => {
    renderNotFound();

    const mainHeading = screen.getByRole('heading', { level: 1, name: /page not found/i });
    const searchHeading = screen.getByRole('heading', { level: 2, name: /search for services/i });
    const suggestionsHeading = screen.getByRole('heading', { level: 2, name: /where would you like to go/i });

    expect(mainHeading).toBeInTheDocument();
    expect(searchHeading).toBeInTheDocument();
    expect(suggestionsHeading).toBeInTheDocument();
  });

  it('has proper ARIA labels for accessibility', () => {
    renderNotFound();

    expect(screen.getByLabelText(/search for services/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back to previous page/i })).toBeInTheDocument();
  });

  it('renders search icon', () => {
    renderNotFound();
    const searchIcons = screen.getAllByText('search');
    expect(searchIcons.length).toBeGreaterThan(0);
  });

  it('renders suggestion icons', () => {
    renderNotFound();

    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.getByText('schedule')).toBeInTheDocument();
    expect(screen.getByText('info')).toBeInTheDocument();
    expect(screen.getByText('mail')).toBeInTheDocument();
  });

  it('updates search input value on change', async () => {
    const user = userEvent.setup();
    renderNotFound();

    const searchInput = screen.getByPlaceholderText(/search by service name or category/i);
    await user.type(searchInput, 'personal training');

    expect(searchInput).toHaveValue('personal training');
  });

  it('maintains proper component structure', () => {
    const { container } = renderNotFound();

    expect(container.querySelector('.not-found')).toBeInTheDocument();
    expect(container.querySelector('.not-found__container')).toBeInTheDocument();
    expect(container.querySelector('.not-found__illustration')).toBeInTheDocument();
    expect(container.querySelector('.not-found__search')).toBeInTheDocument();
    expect(container.querySelector('.not-found__suggestions')).toBeInTheDocument();
  });

  it('renders all suggestion card elements', () => {
    const { container } = renderNotFound();

    const cards = container.querySelectorAll('.not-found__suggestion-card');
    expect(cards).toHaveLength(4);

    cards.forEach((card) => {
      expect(card.querySelector('.not-found__suggestion-icon')).toBeInTheDocument();
      expect(card.querySelector('.not-found__suggestion-content')).toBeInTheDocument();
      expect(card.querySelector('.not-found__suggestion-arrow')).toBeInTheDocument();
    });
  });
});
