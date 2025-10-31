import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ServiceDetail from './ServiceDetail';

const mockNavigate = vi.fn();
const mockParams = { id: 'service-1' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockParams,
    useNavigate: () => mockNavigate,
  };
});

const renderDetail = () => {
  return render(
    <MemoryRouter initialEntries={[`/services/${mockParams.id}`]}>
      <ServiceDetail />
    </MemoryRouter>
  );
};

describe('ServiceDetail page', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch.mockReset();
  });

  it('renders service information, staff, and related services', async () => {
    mockParams.id = 'service-1';

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          _id: 'service-1',
          name: 'Strategy Session',
          description: 'Comprehensive planning for your next move.',
          category: 'Strategy',
          duration: 60,
          price: 15000,
          image: 'https://example.com/service.jpg',
          bufferTime: 15,
          cancellationPolicy: {
            hoursBeforeStart: 24,
            refundPercentage: 100,
          },
          staffIds: ['staff-1'],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          staff: [
            {
              _id: 'staff-1',
              name: 'Alex Johnson',
              title: 'Lead Coach',
              specialties: ['Leadership'],
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          services: [
            {
              _id: 'service-2',
              name: 'Strategy Intensive',
              description: 'Extended strategic support.',
              category: 'Strategy',
              duration: 90,
              price: 25000,
            },
          ],
        }),
      });

    renderDetail();

    expect(await screen.findByRole('heading', { name: 'Strategy Session' })).toBeInTheDocument();
    const staffMember = await screen.findByRole('button', { name: /Alex Johnson/ });
    expect(staffMember).toBeInTheDocument();
    const relatedService = await screen.findByText('Strategy Intensive');
    expect(relatedService.closest('a')).toHaveAttribute('href', '/services/service-2');
  });

  it('navigates to booking with selected staff member', async () => {
    mockParams.id = 'service-2';

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          _id: 'service-2',
          name: 'Operations Roadmap',
          description: 'Align operations with strategy.',
          category: 'Operations',
          duration: 75,
          price: 18000,
          bufferTime: 10,
          staffIds: ['staff-99'],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          staff: [
            {
              _id: 'staff-99',
              name: 'Jordan Smith',
              title: 'Operations Specialist',
              specialties: ['Efficiency'],
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ services: [] }),
      });

    renderDetail();
    await screen.findByRole('heading', { name: 'Operations Roadmap' });

    const staffButton = await screen.findByRole('button', { name: /Jordan Smith/ });
    await userEvent.click(staffButton);
    await userEvent.click(screen.getByRole('button', { name: 'Book This Service' }));

    expect(mockNavigate).toHaveBeenCalledWith('/book?service=service-2&staff=staff-99');
  });

  it('shows an error state when the service is not found', async () => {
    mockParams.id = 'missing-service';

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Service not found' }),
    });

    renderDetail();

    expect(await screen.findByText('Service not found')).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('renders related services even when no staff are available', async () => {
    mockParams.id = 'service-3';

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          _id: 'service-3',
          name: 'Wellness Recharge',
          description: 'Holistic reset for your team.',
          category: 'Wellness',
          duration: 45,
          price: 12000,
          staffIds: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          services: [
            {
              _id: 'service-4',
              name: 'Wellness Retreat Planning',
              description: 'Design a custom retreat experience.',
              category: 'Wellness',
              duration: 120,
              price: 40000,
            },
          ],
        }),
      });

    renderDetail();

    expect(await screen.findByRole('heading', { name: 'Wellness Recharge' })).toBeInTheDocument();
    expect(screen.queryByText('Choose Your Coach/Consultant (Optional)')).not.toBeInTheDocument();
    const relatedWellness = await screen.findByText('Wellness Retreat Planning');
    expect(relatedWellness.closest('a')).toHaveAttribute('href', '/services/service-4');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
