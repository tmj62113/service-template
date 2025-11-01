import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StaffProfile from './StaffProfile';

const mockStaffMember = {
  _id: 'staff123',
  name: 'Jane Doe',
  title: 'Lead Strategist',
  bio: 'Jane has over 15 years of experience guiding organizations through transformation.',
  photo: 'https://example.com/jane.jpg',
  specialties: ['Leadership', 'Strategy', 'Operations'],
  serviceIds: ['service1', 'service2'],
  acceptingBookings: true,
  defaultBookingBuffer: 30,
  timeZone: 'America/New_York',
  email: 'jane@example.com',
  phone: '555-123-4567',
};

const mockServices = [
  {
    _id: 'service1',
    name: 'Leadership Coaching',
    description: 'One-on-one leadership development sessions.',
    duration: 60,
    price: 200,
  },
  {
    _id: 'service2',
    name: 'Strategy Intensive',
    description: 'Focused strategic planning workshop.',
    duration: 90,
    price: 350,
  },
  {
    _id: 'service3',
    name: 'Team Workshop',
    description: 'Group workshop for teams.',
    duration: 120,
    price: 500,
  },
];

function renderStaffProfile() {
  return render(
    <MemoryRouter initialEntries={[`/staff/${mockStaffMember._id}`]}>
      <Routes>
        <Route path="/staff/:id" element={<StaffProfile />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('StaffProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaffMember,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ services: mockServices }),
      });
  });

  it('fetches and displays the staff member profile details', async () => {
    renderStaffProfile();

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: mockStaffMember.name })).toBeInTheDocument();
    });

    expect(screen.getByText(mockStaffMember.title)).toBeInTheDocument();
    const photo = screen.getByAltText(`Portrait of ${mockStaffMember.name}`);
    expect(photo).toHaveAttribute('src', mockStaffMember.photo);
  });

  it('displays the staff member bio', async () => {
    renderStaffProfile();

    await waitFor(() => {
      expect(screen.getByText(mockStaffMember.bio)).toBeInTheDocument();
    });
  });

  it('shows specialties as chips', async () => {
    renderStaffProfile();

    await waitFor(() => {
      mockStaffMember.specialties.forEach((specialty) => {
        expect(screen.getByText(specialty)).toBeInTheDocument();
      });
    });
  });

  it('lists services offered by the staff member', async () => {
    renderStaffProfile();

    await waitFor(() => {
      expect(screen.getByText('Leadership Coaching')).toBeInTheDocument();
      expect(screen.getByText('Strategy Intensive')).toBeInTheDocument();
    });

    expect(screen.getByText('60 minutes')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  it('provides a booking call-to-action that links to the booking flow', async () => {
    renderStaffProfile();

    const bookingLink = await screen.findByRole('link', { name: /Book a session/i });
    expect(bookingLink).toHaveAttribute('href', `/book?staff=${mockStaffMember._id}`);
  });

  it('includes contact information without exposing admin controls', async () => {
    renderStaffProfile();

    const emailLink = await screen.findByRole('link', { name: `Email ${mockStaffMember.name.split(' ')[0]}` });
    expect(emailLink).toHaveAttribute('href', `mailto:${mockStaffMember.email}`);
    expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
  });

  it('navigates users back to the team when staff member is missing', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({ ok: true, json: async () => ({ services: mockServices }) });

    render(
      <MemoryRouter initialEntries={[`/staff/missing`]}>
        <Routes>
          <Route path="/staff/:id" element={<StaffProfile />} />
        </Routes>
      </MemoryRouter>
    );

    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent('Staff member not found');
    expect(screen.getByRole('link', { name: /Back to team/i })).toHaveAttribute('href', '/staff');
  });
});
