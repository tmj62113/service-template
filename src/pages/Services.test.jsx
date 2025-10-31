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

const createJsonResponse = (data, options = {}) => ({
  ok: options.ok ?? true,
  status: options.status ?? 200,
  json: async () => data,
});

describe('Services page', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch.mockReset();
  });

  describe('Initial load & rendering', () => {
    it('shows a loading indicator while fetching services', () => {
      global.fetch.mockResolvedValue(createJsonResponse(categoriesResponse));

      renderServicesPage();

      expect(screen.getByText('Loading services...')).toBeInTheDocument();
    });

    it('renders service listings after fetching data', async () => {
      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }));

      renderServicesPage();

      expect(await screen.findByText('Strategy Session')).toBeInTheDocument();
      expect(screen.getByText('Operations Audit')).toBeInTheDocument();
      expect(screen.getAllByTestId('service-card')).toHaveLength(3);
    });

    it('renders card details with formatted price and duration', async () => {
      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }));

      renderServicesPage();

      expect(await screen.findByText('$150.00')).toBeInTheDocument();
      expect(screen.getByText('$250.00')).toBeInTheDocument();
      expect(screen.getByText('1h')).toBeInTheDocument();
      expect(screen.getByText('1h 30min')).toBeInTheDocument();
    });

    it('shows an empty state when no services are available', async () => {
      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: [], pagination: {} }));

      renderServicesPage();

      expect(await screen.findByText('No services match your filters.')).toBeInTheDocument();
      expect(screen.queryByTestId('service-card')).not.toBeInTheDocument();
    });

    it('shows an error message when the services request fails', async () => {
      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(
          createJsonResponse(
            { error: 'Server error' },
            { ok: false, status: 500 }
          )
        );

      renderServicesPage();

      expect(
        await screen.findByText('Failed to load services. Please try again later.')
      ).toBeInTheDocument();
      expect(screen.queryByTestId('service-card')).not.toBeInTheDocument();
    });
  });

  describe('Category filtering', () => {
    it('renders category filter buttons', async () => {
      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }));

      renderServicesPage();
      await screen.findByText('Strategy Session');

      expect(screen.getByRole('button', { name: 'All Services' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Strategy' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Operations' })).toBeInTheDocument();
    });

    it('filters services by category using the services endpoint', async () => {
      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }))
        .mockResolvedValueOnce(
          createJsonResponse({
            services: baseServices.filter((service) => service.category === 'Strategy'),
            pagination: {},
          })
        );

      renderServicesPage();
      await screen.findByText('Strategy Session');

      const strategyButton = screen.getByRole('button', { name: 'Strategy' });
      await userEvent.click(strategyButton);

      await screen.findByText('Quick Consult');
      const lastCallUrl = global.fetch.mock.calls[2][0];
      expect(lastCallUrl).toContain('/api/services?');
      expect(lastCallUrl).toContain('category=Strategy');
    });

    it('restores all services when selecting the All Services filter', async () => {
      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }))
        .mockResolvedValueOnce(
          createJsonResponse({
            services: baseServices.filter((service) => service.category === 'Strategy'),
            pagination: {},
          })
        )
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }));

      renderServicesPage();
      await screen.findByText('Strategy Session');

      await userEvent.click(screen.getByRole('button', { name: 'Strategy' }));
      await screen.findByText('Quick Consult');

      await userEvent.click(screen.getByRole('button', { name: 'All Services' }));

      await waitFor(() => {
        expect(screen.getAllByTestId('service-card')).toHaveLength(3);
      });
    });

    it('displays an empty state when a category has no services', async () => {
      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }))
        .mockResolvedValueOnce(createJsonResponse({ services: [], pagination: {} }));

      renderServicesPage();
      await screen.findByText('Strategy Session');

      await userEvent.click(screen.getByRole('button', { name: 'Strategy' }));

      expect(await screen.findByText('No services match your filters.')).toBeInTheDocument();
    });
  });

  describe('Search functionality', () => {
    it('renders a search input with placeholder text', async () => {
      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }));

      renderServicesPage();
      await screen.findByText('Strategy Session');

      expect(screen.getByPlaceholderText('Search services...')).toBeInTheDocument();
    });

    it('submits search queries to the search endpoint', async () => {
      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }))
        .mockResolvedValueOnce(createJsonResponse([baseServices[1]]));

      renderServicesPage();
      await screen.findByText('Strategy Session');

      await userEvent.type(screen.getByPlaceholderText('Search services...'), 'Operations');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      await screen.findByText('Operations Audit');
      expect(screen.queryAllByTestId('service-card')).toHaveLength(1);
      const searchCallUrl = global.fetch.mock.calls[2][0];
      expect(searchCallUrl).toContain('/api/services/search/Operations');
    });

    it('matches services by description case-insensitively', async () => {
      const searchResult = {
        ...baseServices[0],
        description: 'Personalized stress management coaching for leaders.',
      };

      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }))
        .mockResolvedValueOnce(createJsonResponse([searchResult]));

      renderServicesPage();
      await screen.findByText('Strategy Session');

      await userEvent.clear(screen.getByPlaceholderText('Search services...'));
      await userEvent.type(screen.getByPlaceholderText('Search services...'), 'STRESS');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      expect(await screen.findByText('Strategy Session')).toBeInTheDocument();
      expect(screen.getByText(/stress management/i)).toBeInTheDocument();
    });

    it('clears search results and reloads services when cleared', async () => {
      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }))
        .mockResolvedValueOnce(createJsonResponse([baseServices[1]]))
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }));

      renderServicesPage();
      await screen.findByText('Strategy Session');

      await userEvent.type(screen.getByPlaceholderText('Search services...'), 'Operations');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));
      await screen.findByText('Operations Audit');

      await userEvent.click(screen.getByRole('button', { name: 'Clear' }));

      await waitFor(() => {
        expect(screen.getAllByTestId('service-card')).toHaveLength(3);
      });
    });

    it('shows an empty search state when no services match', async () => {
      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }))
        .mockResolvedValueOnce(createJsonResponse([]));

      renderServicesPage();
      await screen.findByText('Strategy Session');

      await userEvent.type(screen.getByPlaceholderText('Search services...'), 'nonexistent');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      expect(await screen.findByText('No services match your filters.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'View All Services' })).toBeInTheDocument();
    });

    it('shows an error message when the search request fails', async () => {
      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }))
        .mockResolvedValueOnce(
          createJsonResponse(
            { error: 'Search failed' },
            { ok: false, status: 500 }
          )
        );

      renderServicesPage();
      await screen.findByText('Strategy Session');

      await userEvent.type(screen.getByPlaceholderText('Search services...'), 'Operations');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      expect(await screen.findByText('Search failed. Please try again.')).toBeInTheDocument();
    });
  });

  describe('Service cards & interactions', () => {
    it('displays service images when provided', async () => {
      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }));

      renderServicesPage();

      const image = await screen.findByRole('img', { name: 'Strategy Session' });
      expect(image).toHaveAttribute('src', 'https://example.com/strategy.jpg');
    });

    it('omits the image element when a service has no image', async () => {
      const servicesWithoutImage = [
        { ...baseServices[0], _id: 'service-without-image', image: null },
      ];

      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: servicesWithoutImage, pagination: {} }));

      renderServicesPage();

      const card = await screen.findByTestId('service-card');
      expect(within(card).queryByRole('img')).toBeNull();
    });

    it('renders a Book Now link for each service with the correct URL', async () => {
      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }));

      renderServicesPage();

      const links = await screen.findAllByRole('link', { name: 'Book Now' });
      expect(links).toHaveLength(3);
      expect(links[0]).toHaveAttribute('href', '/services/service-1');
    });

    it('truncates long descriptions to a preview length', async () => {
      const longDescription = 'A'.repeat(300);
      const services = [
        {
          ...baseServices[0],
          description: longDescription,
        },
      ];

      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services, pagination: {} }));

      renderServicesPage();

      const preview = await screen.findByText(/AAA/);
      expect(preview.textContent).toHaveLength(123);
      expect(preview.textContent?.endsWith('...')).toBe(true);
    });

    it('filters services by price range on the client', async () => {
      global.fetch
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }));

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
        .mockResolvedValueOnce(createJsonResponse(categoriesResponse))
        .mockResolvedValueOnce(createJsonResponse({ services: baseServices, pagination: {} }));

      renderServicesPage();
      await screen.findByText('Strategy Session');

      await userEvent.selectOptions(screen.getByLabelText('Sort services'), 'price-desc');

      await waitFor(() => {
        const cards = screen.getAllByTestId('service-card');
        const firstCardHeading = within(cards[0]).getByRole('heading', { level: 3 });
        expect(firstCardHeading).toHaveTextContent('Operations Audit');
      });
    });
  });
});
