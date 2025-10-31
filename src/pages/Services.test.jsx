import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Services from './Services';

const categoriesResponse = ['Strategy', 'Operations'];

const baseServices = [
  {
    _id: 'service-1',
    name: 'Strategy Session',
    description: 'A 60 minute strategic planning session.',
    category: 'Strategy',
    duration: 60,
    price: 15000,
    image: 'https://example.com/strategy.jpg',
  },
  {
    _id: 'service-2',
    name: 'Operations Audit',
    description: 'Review your operating model in depth.',
    category: 'Operations',
    duration: 90,
    price: 25000,
    image: 'https://example.com/operations.jpg',
  },
  {
    _id: 'service-3',
    name: 'Quick Consult',
    description: 'A short conversation to unblock your team.',
    category: 'Strategy',
    duration: 30,
    price: 7500,
    image: 'https://example.com/quick.jpg',
  },
];

const renderServicesPage = () => {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/services' }]}>
      <Services />
    </MemoryRouter>
  );
};

describe('Services page', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch.mockReset();
  });

  it('renders service listings after fetching data', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => categoriesResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ services: baseServices, pagination: {} }),
      });

    renderServicesPage();

    expect(await screen.findByText('Strategy Session')).toBeInTheDocument();
    expect(screen.getByText('Operations Audit')).toBeInTheDocument();
    expect(screen.getAllByTestId('service-card')).toHaveLength(3);
  });

  it('filters services by category using the services endpoint', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => categoriesResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ services: baseServices, pagination: {} }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          services: baseServices.filter((service) => service.category === 'Strategy'),
          pagination: {},
        }),
      });

    renderServicesPage();
    await screen.findByText('Strategy Session');

    const strategyButton = screen.getByRole('button', { name: 'Strategy' });
    await userEvent.click(strategyButton);

    await screen.findByText('Quick Consult');
    const lastCallUrl = global.fetch.mock.calls[2][0];
    expect(lastCallUrl).toContain('/api/services?');
    expect(lastCallUrl).toContain('category=Strategy');
  });

  it('filters services by price range on the client', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => categoriesResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ services: baseServices, pagination: {} }),
      });

    renderServicesPage();
    await screen.findByText('Strategy Session');

    await userEvent.selectOptions(screen.getByLabelText('Filter by price'), 'under-100');

    await waitFor(() => {
      expect(screen.queryAllByTestId('service-card')).toHaveLength(1);
    });
    expect(screen.getByText('Quick Consult')).toBeInTheDocument();
  });

  it('sorts services by price from high to low', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => categoriesResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ services: baseServices, pagination: {} }),
      });

    renderServicesPage();
    await screen.findByText('Strategy Session');

    await userEvent.selectOptions(screen.getByLabelText('Sort services'), 'price-desc');

    await waitFor(() => {
      const cards = screen.getAllByTestId('service-card');
      const firstCardHeading = within(cards[0]).getByRole('heading', { level: 3 });
      expect(firstCardHeading).toHaveTextContent('Operations Audit');
    });
  });

  it('submits search queries to the search endpoint', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => categoriesResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ services: baseServices, pagination: {} }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([baseServices[1]]),
      });

    renderServicesPage();
    await screen.findByText('Strategy Session');

    await userEvent.type(screen.getByPlaceholderText('Search services...'), 'Operations');
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));

    await screen.findByText('Operations Audit');
    expect(screen.queryAllByTestId('service-card')).toHaveLength(1);
    const searchCallUrl = global.fetch.mock.calls[2][0];
    expect(searchCallUrl).toContain('/api/services/search/Operations');
  });

  it('shows an error message when the services request fails', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => categoriesResponse,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

    renderServicesPage();

    expect(
      await screen.findByText('Failed to load services. Please try again later.')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('service-card')).not.toBeInTheDocument();
  });
});
