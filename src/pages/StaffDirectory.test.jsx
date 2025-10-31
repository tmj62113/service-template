import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import StaffDirectory from './StaffDirectory';

const mockStaff = [
  {
    _id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    title: 'Senior Coach',
    bio: 'Experienced leadership coach with over 10 years helping executives reach their full potential.',
    specialties: ['Leadership', 'Strategy', 'Executive Coaching'],
    serviceIds: ['service1', 'service2'],
    photo: 'https://example.com/alice.jpg',
    isActive: true,
    acceptingBookings: true,
  },
  {
    _id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    title: 'Communication Coach',
    bio: 'Specialist in helping professionals improve their communication skills.',
    specialties: ['Communication', 'Public Speaking'],
    serviceIds: ['service1'],
    photo: 'https://example.com/bob.jpg',
    isActive: true,
    acceptingBookings: false,
  },
  {
    _id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    title: 'Business Consultant',
    bio: 'Expert business consultant focused on strategic planning and growth.',
    specialties: ['Business', 'Finance', 'Strategy'],
    serviceIds: ['service2'],
    photo: '',
    isActive: true,
    acceptingBookings: true,
  },
];

const mockServices = [
  { _id: 'service1', name: 'Coaching Session' },
  { _id: 'service2', name: 'Consulting Session' },
];

function renderStaffDirectory() {
  return render(
    <BrowserRouter>
      <StaffDirectory />
    </BrowserRouter>
  );
}

describe('StaffDirectory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Initial Load', () => {
    it('displays loading state initially', () => {
      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderStaffDirectory();

      expect(screen.getByText('Loading team members...')).toBeInTheDocument();
    });

    it('fetches and displays staff members', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ staff: mockStaff }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ services: mockServices }),
        });

      renderStaffDirectory();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
      });
    });

    it('displays error when fetch fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Failed to load staff'));

      renderStaffDirectory();

      await waitFor(() => {
        expect(screen.getByText(/Failed to load staff/)).toBeInTheDocument();
      });
    });

    it('displays page title and description', () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ staff: mockStaff }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ services: mockServices }),
        });

      renderStaffDirectory();

      expect(screen.getByText('Experts dedicated to your success')).toBeInTheDocument();
    });
  });

  describe('Staff Cards Display', () => {
    beforeEach(async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ staff: mockStaff }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ services: mockServices }),
        });

      renderStaffDirectory();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('displays staff member names', () => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    });

    it('displays staff member titles', () => {
      expect(screen.getByText('Senior Coach')).toBeInTheDocument();
      expect(screen.getByText('Communication Coach')).toBeInTheDocument();
      expect(screen.getByText('Business Consultant')).toBeInTheDocument();
    });

    it('displays staff member photos', () => {
      const aliceImg = screen.getByAltText('Portrait of Alice Johnson');
      expect(aliceImg).toBeInTheDocument();
      expect(aliceImg).toHaveAttribute('src', 'https://example.com/alice.jpg');
    });

    it('displays placeholder for staff without photos', () => {
      const placeholder = screen.getByText('CB'); // Charlie Brown initials
      expect(placeholder).toBeInTheDocument();
    });

    it('displays specialties (limited to 3)', () => {
      expect(screen.getByText('Leadership')).toBeInTheDocument();
      expect(screen.getByText('Strategy')).toBeInTheDocument();
      expect(screen.getByText('Public Speaking')).toBeInTheDocument();
    });

    it('displays truncated bio', () => {
      expect(
        screen.getByText(/Experienced leadership coach with over 10 years/)
      ).toBeInTheDocument();
    });

    it('displays View profile links', () => {
      const profileLinks = screen.getAllByRole('link', { name: /View profile/i });
      expect(profileLinks).toHaveLength(3);
    });

    it('displays Book session links', () => {
      const bookLinks = screen.getAllByRole('link', { name: /Book session/i });
      expect(bookLinks).toHaveLength(3);
    });
  });

  describe('Search Functionality', () => {
    beforeEach(async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ staff: mockStaff }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ services: mockServices }),
        });

      renderStaffDirectory();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('filters staff by name', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Search by name, role, or specialty/i);

      await user.type(searchInput, 'Alice');

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
      });
    });

    it('filters staff by title', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Search by name, role, or specialty/i);

      await user.type(searchInput, 'Consultant');

      await waitFor(() => {
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      });
    });

    it('filters staff by specialty', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Search by name, role, or specialty/i);

      await user.type(searchInput, 'Communication');

      await waitFor(() => {
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
      });
    });

    it('filters staff by bio keywords', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Search by name, role, or specialty/i);

      await user.type(searchInput, 'executives');

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      });
    });

    it('shows all staff when search is cleared', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Search by name, role, or specialty/i);

      await user.type(searchInput, 'Alice');
      await waitFor(() => {
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      });

      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
      });
    });

    it('shows no results message when no matches', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Search by name, role, or specialty/i);

      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(
          screen.getByText(/No team members match your filters/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Availability Filter', () => {
    beforeEach(async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ staff: mockStaff }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ services: mockServices }),
        });

      renderStaffDirectory();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('filters to show only staff accepting bookings', async () => {
      const user = userEvent.setup();
      const availabilitySelect = screen.getByLabelText('Availability');

      await user.selectOptions(availabilitySelect, 'accepting');

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      });
    });

    it('filters to show only staff not accepting bookings', async () => {
      const user = userEvent.setup();
      const availabilitySelect = screen.getByLabelText('Availability');

      await user.selectOptions(availabilitySelect, 'paused');

      await waitFor(() => {
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
      });
    });

    it('shows all staff when availability filter is "all"', async () => {
      const user = userEvent.setup();
      const availabilitySelect = screen.getByLabelText('Availability');

      await user.selectOptions(availabilitySelect, 'accepting');
      await user.selectOptions(availabilitySelect, 'all');

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
      });
    });
  });

  describe('Service Filter', () => {
    beforeEach(async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ staff: mockStaff }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ services: mockServices }),
        });

      renderStaffDirectory();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('filters staff by service', async () => {
      const user = userEvent.setup();
      const serviceSelect = screen.getByLabelText('Service');

      await user.selectOptions(serviceSelect, 'service1');

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
      });
    });

    it('shows different staff for different services', async () => {
      const user = userEvent.setup();
      const serviceSelect = screen.getByLabelText('Service');

      await user.selectOptions(serviceSelect, 'service2');

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      });
    });

    it('displays service options in dropdown', async () => {
      const serviceSelect = screen.getByLabelText('Service');

      expect(screen.getByRole('option', { name: 'All services' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Coaching Session' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Consulting Session' })).toBeInTheDocument();
    });
  });

  describe('Combined Filters', () => {
    beforeEach(async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ staff: mockStaff }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ services: mockServices }),
        });

      renderStaffDirectory();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('combines search and availability filter', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Search by name, role, or specialty/i);
      const availabilitySelect = screen.getByLabelText('Availability');

      await user.type(searchInput, 'coach');
      await user.selectOptions(availabilitySelect, 'accepting');

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument(); // Not accepting bookings
      });
    });

    it('combines search and service filter', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Search by name, role, or specialty/i);
      const serviceSelect = screen.getByLabelText('Service');

      await user.type(searchInput, 'o'); // Matches multiple names
      await user.selectOptions(serviceSelect, 'service2');

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      });
    });

    it('combines all filters', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Search by name, role, or specialty/i);
      const availabilitySelect = screen.getByLabelText('Availability');
      const serviceSelect = screen.getByLabelText('Service');

      await user.type(searchInput, 'o');
      await user.selectOptions(availabilitySelect, 'accepting');
      await user.selectOptions(serviceSelect, 'service1');

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
      });
    });
  });

  describe('Links', () => {
    beforeEach(async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ staff: mockStaff }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ services: mockServices }),
        });

      renderStaffDirectory();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('has correct profile links', () => {
      const aliceProfileLink = screen.getAllByRole('link', { name: /View profile/i })[0];
      expect(aliceProfileLink).toHaveAttribute('href', '/staff/1');
    });

    it('has correct booking links', () => {
      const aliceBookLink = screen.getAllByRole('link', { name: /Book session with Alice Johnson/i })[0];
      expect(aliceBookLink).toHaveAttribute('href', '/book?staff=1');
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ staff: mockStaff }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ services: mockServices }),
        });

      renderStaffDirectory();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('has accessible search input', () => {
      const searchInput = screen.getByLabelText('Search staff directory');
      expect(searchInput).toBeInTheDocument();
    });

    it('has accessible filter selects', () => {
      expect(screen.getByLabelText('Availability')).toBeInTheDocument();
      expect(screen.getByLabelText('Service')).toBeInTheDocument();
    });

    it('has aria-live region for results', () => {
      const resultsSection = screen.getByRole('region', { hidden: true });
      expect(resultsSection).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no staff exist', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ staff: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ services: mockServices }),
        });

      renderStaffDirectory();

      await waitFor(() => {
        expect(screen.getByText(/No team members match your filters/)).toBeInTheDocument();
      });
    });
  });

  describe('Bio Truncation', () => {
    it('truncates long bios to 180 characters', async () => {
      const longBio = 'A'.repeat(200);
      const staffWithLongBio = [
        {
          ...mockStaff[0],
          bio: longBio,
        },
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ staff: staffWithLongBio }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ services: mockServices }),
        });

      renderStaffDirectory();

      await waitFor(() => {
        const bioText = screen.getByText(/A{177}\.\.\./);
        expect(bioText).toBeInTheDocument();
      });
    });

    it('does not truncate short bios', async () => {
      const shortBio = 'Short bio text';
      const staffWithShortBio = [
        {
          ...mockStaff[0],
          bio: shortBio,
        },
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ staff: staffWithShortBio }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ services: mockServices }),
        });

      renderStaffDirectory();

      await waitFor(() => {
        expect(screen.getByText('Short bio text')).toBeInTheDocument();
      });
    });
  });
});
