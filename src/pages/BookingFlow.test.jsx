import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BookingFlow from './BookingFlow';
import useBookingStore from '../stores/bookingStore';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createJsonResponse = (data, options = {}) => ({
  ok: options.ok ?? true,
  status: options.status ?? 200,
  json: async () => data,
});

const servicesResponse = {
  services: [
    {
      _id: 'service-1',
      name: 'Strategy Session',
      description: 'Plan your next move.',
      category: 'Strategy',
      duration: 60,
      price: 15000,
    },
    {
      _id: 'service-2',
      name: 'Consulting Intensive',
      description: 'Deep dive consulting.',
      category: 'Consulting',
      duration: 90,
      price: 25000,
    },
  ],
};

const staffResponse = [
  {
    _id: 'staff-1',
    name: 'Alex Rivera',
    title: 'Lead Coach',
    specialty: 'Leadership',
  },
  {
    _id: 'staff-2',
    name: 'Jordan Kim',
    title: 'Consultant',
    specialty: 'Operations',
  },
];

const renderBookingFlow = (initialEntries = ['/book']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <BookingFlow />
    </MemoryRouter>
  );
};

describe('BookingFlow wizard', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    global.fetch = vi.fn();
    act(() => {
      useBookingStore.getState().resetBooking();
    });
  });

  afterEach(() => {
    global.fetch.mockReset();
  });

  it('renders the progress indicator with step 1 active', async () => {
    global.fetch.mockResolvedValueOnce(createJsonResponse(servicesResponse));

    const { container } = renderBookingFlow();

    const progress = await screen.findByTestId('booking-progress');
    const steps = progress.querySelectorAll('.progress-step');
    expect(steps[0].getAttribute('aria-current')).toBe('step');
    expect(container.querySelector('[data-testid="booking-step-1"]')).toBeInTheDocument();
  });

  it('disables the Next step button until a service is selected', async () => {
    global.fetch.mockResolvedValueOnce(createJsonResponse(servicesResponse));

    renderBookingFlow();
    await screen.findByTestId('booking-step-1');

    expect(screen.getByRole('button', { name: 'Next step' })).toBeDisabled();
  });

  it('enables Next step after selecting a service and shows staff options', async () => {
    global.fetch
      .mockResolvedValueOnce(createJsonResponse(servicesResponse))
      .mockResolvedValueOnce(createJsonResponse(staffResponse));

    renderBookingFlow();
    await screen.findByText('Strategy Session');

    const serviceButton = screen.getByRole('button', { name: /Strategy Session/ });
    await userEvent.click(serviceButton);

    const nextButton = screen.getByRole('button', { name: 'Next step' });
    await waitFor(() => expect(nextButton).toBeEnabled());
    await userEvent.click(nextButton);

    expect(await screen.findByTestId('booking-step-2')).toBeInTheDocument();
    expect(screen.getByText('Select a team member')).toBeInTheDocument();
    await screen.findByRole('button', { name: /Alex Rivera/ });
  });

  it('shows a loading state when fetching staff members', async () => {
    const pendingStaff = new Promise(() => {});
    global.fetch
      .mockResolvedValueOnce(createJsonResponse(servicesResponse))
      .mockReturnValueOnce(pendingStaff);

    renderBookingFlow();
    await screen.findByText('Strategy Session');

    await userEvent.click(screen.getByRole('button', { name: /Strategy Session/ }));
    const nextButton = screen.getByRole('button', { name: 'Next step' });
    await waitFor(() => expect(nextButton).toBeEnabled());
    await userEvent.click(nextButton);

    expect(await screen.findByTestId('booking-step-2')).toBeInTheDocument();
    expect(screen.getByText('Checking team availability…')).toBeInTheDocument();
  });

  it('shows staff error state and retries successfully', async () => {
    global.fetch
      .mockResolvedValueOnce(createJsonResponse(servicesResponse))
      .mockResolvedValueOnce(
        createJsonResponse({}, { ok: false, status: 500 })
      )
      .mockResolvedValueOnce(createJsonResponse(staffResponse));

    renderBookingFlow();
    await screen.findByText('Strategy Session');

    await userEvent.click(screen.getByRole('button', { name: /Strategy Session/ }));
    const nextButton = screen.getByRole('button', { name: 'Next step' });
    await waitFor(() => expect(nextButton).toBeEnabled());
    await userEvent.click(nextButton);

    expect(await screen.findByText('Unable to load team members at the moment.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByRole('button', { name: /Alex Rivera/ });
  });

  it('preselects a service from query params and advances to the team step', async () => {
    global.fetch
      .mockResolvedValueOnce(createJsonResponse(servicesResponse))
      .mockResolvedValueOnce(createJsonResponse(staffResponse));

    renderBookingFlow(['/book?service=service-2']);

    expect(await screen.findByTestId('booking-step-2')).toBeInTheDocument();
    expect(screen.getByText('Consulting Intensive')).toBeInTheDocument();
  });

  it('preselects staff from query params and opens the date selection step', async () => {
    global.fetch
      .mockResolvedValueOnce(createJsonResponse(servicesResponse))
      .mockResolvedValueOnce(createJsonResponse(staffResponse));

    renderBookingFlow(['/book?service=service-1&staff=staff-2']);

    expect(await screen.findByTestId('booking-step-3')).toBeInTheDocument();
    expect(screen.getByText('Choose a placeholder date')).toBeInTheDocument();
  });

  it('requires a date selection before advancing past step 3', async () => {
    global.fetch
      .mockResolvedValueOnce(createJsonResponse(servicesResponse))
      .mockResolvedValueOnce(createJsonResponse(staffResponse));

    renderBookingFlow();
    await screen.findByText('Strategy Session');

    await userEvent.click(screen.getByRole('button', { name: /Strategy Session/ }));
    const nextButton = screen.getByRole('button', { name: 'Next step' });
    await waitFor(() => expect(nextButton).toBeEnabled());
    await userEvent.click(nextButton);

    await userEvent.click(screen.getByRole('button', { name: /Alex Rivera/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Next step' }));

    expect(await screen.findByTestId('booking-step-3')).toBeInTheDocument();
    const stepNext = screen.getByRole('button', { name: 'Next step' });
    expect(stepNext).toBeDisabled();

    const dateButtons = within(screen.getByTestId('booking-step-3')).getAllByRole('button');
    await userEvent.click(dateButtons[0]);

    await waitFor(() => expect(stepNext).toBeEnabled());
  });

  it('requires a time selection before advancing past step 4', async () => {
    global.fetch
      .mockResolvedValueOnce(createJsonResponse(servicesResponse))
      .mockResolvedValueOnce(createJsonResponse(staffResponse));

    renderBookingFlow();
    await screen.findByText('Strategy Session');

    await userEvent.click(screen.getByRole('button', { name: /Strategy Session/ }));
    let nextButton = screen.getByRole('button', { name: 'Next step' });
    await waitFor(() => expect(nextButton).toBeEnabled());
    await userEvent.click(nextButton);

    await userEvent.click(screen.getByRole('button', { name: /Alex Rivera/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Next step' }));

    const dateButtons = within(screen.getByTestId('booking-step-3')).getAllByRole('button');
    await userEvent.click(dateButtons[0]);
    nextButton = screen.getByRole('button', { name: 'Next step' });
    await userEvent.click(nextButton);

    expect(await screen.findByTestId('booking-step-4')).toBeInTheDocument();
    const continueButton = screen.getByRole('button', { name: 'Next step' });
    expect(continueButton).toBeDisabled();

    const timeButtons = within(screen.getByTestId('booking-step-4')).getAllByRole('button');
    await userEvent.click(timeButtons[0]);

    await waitFor(() => expect(continueButton).toBeEnabled());
  });

  it('summarizes selections and navigates to review on continue', async () => {
    global.fetch
      .mockResolvedValueOnce(createJsonResponse(servicesResponse))
      .mockResolvedValueOnce(createJsonResponse(staffResponse));

    renderBookingFlow();
    await screen.findByText('Strategy Session');

    await userEvent.click(screen.getByRole('button', { name: /Strategy Session/ }));
    let nextButton = screen.getByRole('button', { name: 'Next step' });
    await waitFor(() => expect(nextButton).toBeEnabled());
    await userEvent.click(nextButton);

    await userEvent.click(screen.getByRole('button', { name: /Alex Rivera/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Next step' }));

    const dateButtons = within(screen.getByTestId('booking-step-3')).getAllByRole('button');
    await userEvent.click(dateButtons[0]);
    nextButton = screen.getByRole('button', { name: 'Next step' });
    await userEvent.click(nextButton);

    const timeButtons = within(screen.getByTestId('booking-step-4')).getAllByRole('button');
    await userEvent.click(timeButtons[0]);
    await userEvent.click(screen.getByRole('button', { name: 'Next step' }));

    expect(await screen.findByTestId('booking-step-5')).toBeInTheDocument();
    expect(screen.getByText('Review your details')).toBeInTheDocument();

    const reviewButton = screen.getByRole('button', { name: 'Continue to review' });
    await userEvent.click(reviewButton);

    expect(mockNavigate).toHaveBeenCalledWith('/booking/review');
  });

  it('navigates back to services from the first step header button', async () => {
    global.fetch.mockResolvedValueOnce(createJsonResponse(servicesResponse));

    renderBookingFlow();
    await screen.findByText('Strategy Session');

    await userEvent.click(screen.getByRole('button', { name: 'Back to services' }));
    expect(mockNavigate).toHaveBeenCalledWith('/services');
  });

  it('returns to the previous step when Back is pressed mid-flow', async () => {
    global.fetch
      .mockResolvedValueOnce(createJsonResponse(servicesResponse))
      .mockResolvedValueOnce(createJsonResponse(staffResponse));

    renderBookingFlow();
    await screen.findByText('Strategy Session');

    await userEvent.click(screen.getByRole('button', { name: /Strategy Session/ }));
    let nextButton = screen.getByRole('button', { name: 'Next step' });
    await waitFor(() => expect(nextButton).toBeEnabled());
    await userEvent.click(nextButton);

    await userEvent.click(screen.getByRole('button', { name: /Alex Rivera/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Next step' }));

    expect(await screen.findByTestId('booking-step-3')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByTestId('booking-step-2')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows a retry state when the services fetch fails', async () => {
    global.fetch
      .mockResolvedValueOnce(
        createJsonResponse({}, { ok: false, status: 500 })
      )
      .mockResolvedValueOnce(createJsonResponse(servicesResponse));

    renderBookingFlow();

    expect(await screen.findByText('Unable to load services at the moment.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByText('Strategy Session');
  });

  it('allows editing selections from the summary step', async () => {
    global.fetch
      .mockResolvedValueOnce(createJsonResponse(servicesResponse))
      .mockResolvedValueOnce(createJsonResponse(staffResponse));

    renderBookingFlow();
    await screen.findByText('Strategy Session');

    await userEvent.click(screen.getByRole('button', { name: /Strategy Session/ }));
    let nextButton = screen.getByRole('button', { name: 'Next step' });
    await waitFor(() => expect(nextButton).toBeEnabled());
    await userEvent.click(nextButton);

    await userEvent.click(screen.getByRole('button', { name: /Alex Rivera/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Next step' }));

    const dateButtons = within(screen.getByTestId('booking-step-3')).getAllByRole('button');
    await userEvent.click(dateButtons[0]);
    nextButton = screen.getByRole('button', { name: 'Next step' });
    await userEvent.click(nextButton);

    const timeButtons = within(screen.getByTestId('booking-step-4')).getAllByRole('button');
    await userEvent.click(timeButtons[0]);
    await userEvent.click(screen.getByRole('button', { name: 'Next step' }));

    expect(await screen.findByTestId('booking-step-5')).toBeInTheDocument();
    const changeLinks = screen.getAllByRole('button', { name: 'Change' });
    await userEvent.click(changeLinks[0]);

    expect(screen.getByTestId('booking-step-1')).toBeInTheDocument();
  });
});
