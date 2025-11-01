import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AdminStaff from './AdminStaff';

const modalProps = { current: null };

// Mock the StaffEditModal component
vi.mock('../components/StaffEditModal', () => ({
  default: (props) => {
    modalProps.current = props;
    const { onClose, staffMember, viewMode } = props;
    return (
      <div data-testid="staff-edit-modal">
        <button onClick={onClose}>Close Modal</button>
        <div>View Mode: {viewMode ? 'Yes' : 'No'}</div>
        {staffMember && <div>Editing: {staffMember.name}</div>}
      </div>
    );
  },
}));

const mockStaff = [
  {
    _id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    title: 'Senior Coach',
    bio: 'Leadership expert',
    specialties: ['Leadership', 'Strategy'],
    serviceIds: ['service1', 'service2'],
    isActive: true,
    acceptingBookings: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    _id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    title: 'Junior Coach',
    bio: 'Communication specialist',
    specialties: ['Communication'],
    serviceIds: ['service1'],
    isActive: true,
    acceptingBookings: false,
    createdAt: '2024-02-20T10:00:00Z',
  },
  {
    _id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    title: 'Consultant',
    bio: 'Business consultant',
    specialties: ['Business', 'Finance'],
    serviceIds: ['service2'],
    isActive: false,
    acceptingBookings: false,
    createdAt: '2024-03-10T10:00:00Z',
  },
];

const mockServices = [
  { _id: 'service1', name: 'Coaching Session' },
  { _id: 'service2', name: 'Consulting Session' },
];

function renderAdminStaff() {
  return render(
    <BrowserRouter>
      <AdminStaff />
    </BrowserRouter>
  );
}

describe('AdminStaff', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    modalProps.current = null;
  });

  describe('Initial Load', () => {
    it('displays loading state initially', () => {
      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderAdminStaff();

      expect(screen.getByText('Loading staff...')).toBeInTheDocument();
    });

    it('fetches and displays staff members with service names and statuses', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ staff: mockStaff }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ services: mockServices }),
        });

      renderAdminStaff();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
        expect(screen.getByText('Coaching Session, Consulting Session')).toBeInTheDocument();
        expect(screen.getByText('Coaching Session')).toBeInTheDocument();
        const activeBadges = screen.getAllByText('Active');
        expect(activeBadges[0]).toHaveClass('status-badge', { exact: false });
        expect(screen.getByText('Inactive')).toHaveClass('status-badge', { exact: false });
        expect(screen.getByText('Yes')).toHaveClass('status-badge', { exact: false });
        expect(screen.getByText('No')).toHaveClass('status-badge', { exact: false });
      });

      const tableRows = screen.getAllByRole('row');
      // 1 header row + 3 staff rows
      expect(tableRows).toHaveLength(4);
      const aliceRow = tableRows[1];
      expect(within(aliceRow).getByText('STF-1')).toBeInTheDocument();
    });

    it('displays error when fetch fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Failed to fetch staff'));

      renderAdminStaff();

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
      });
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

      renderAdminStaff();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('filters staff by name', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Search staff/i);

      await user.type(searchInput, 'Alice');

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
      });
    });

    it('filters staff by email', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Search staff/i);

      await user.type(searchInput, 'bob@');

      await waitFor(() => {
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
      });
    });

    it('filters staff by title', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Search staff/i);

      await user.type(searchInput, 'Consultant');

      await waitFor(() => {
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
      });
    });

    it('filters staff by specialty', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Search staff/i);

      await user.type(searchInput, 'Communication');

      await waitFor(() => {
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
      });
    });

    it('shows all staff when search is cleared', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Search staff/i);

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
  });

  describe('Status Filter', () => {
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

      renderAdminStaff();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('filters to show only active staff', async () => {
      const user = userEvent.setup();
      const statusFilter = screen.getByLabelText('Filter by status');

      await user.selectOptions(statusFilter, 'active');

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
      });
    });

    it('filters to show only inactive staff', async () => {
      const user = userEvent.setup();
      const statusFilter = screen.getByLabelText('Filter by status');

      await user.selectOptions(statusFilter, 'inactive');

      await waitFor(() => {
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      });
    });

    it('shows all staff when status filter is "all"', async () => {
      const user = userEvent.setup();
      const statusFilter = screen.getByLabelText('Filter by status');

      await user.selectOptions(statusFilter, 'inactive');
      await user.selectOptions(statusFilter, 'all');

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
      });
    });
  });

  describe('Booking Availability Filter', () => {
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

      renderAdminStaff();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('filters to show only staff accepting bookings', async () => {
      const user = userEvent.setup();
      const bookingFilter = screen.getByLabelText('Filter by booking availability');

      await user.selectOptions(bookingFilter, 'accepting');

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
      });
    });

    it('filters to show only staff not accepting bookings', async () => {
      const user = userEvent.setup();
      const bookingFilter = screen.getByLabelText('Filter by booking availability');

      await user.selectOptions(bookingFilter, 'paused');

      await waitFor(() => {
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
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

      renderAdminStaff();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('filters staff by service', async () => {
      const user = userEvent.setup();
      const serviceFilter = screen.getByLabelText('Filter by service');

      await user.selectOptions(serviceFilter, 'service1');

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
      });
    });

    it('shows different staff for different services', async () => {
      const user = userEvent.setup();
      const serviceFilter = screen.getByLabelText('Filter by service');

      await user.selectOptions(serviceFilter, 'service2');

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      });
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

      renderAdminStaff();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('combines search and status filter', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Search staff/i);
      const statusFilter = screen.getByLabelText('Filter by status');

      await user.type(searchInput, 'o'); // Matches "Johnson" and "Brown"
      await user.selectOptions(statusFilter, 'active');

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument(); // Inactive
      });
    });

    it('combines all filters', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Search staff/i);
      const statusFilter = screen.getByLabelText('Filter by status');
      const bookingFilter = screen.getByLabelText('Filter by booking availability');
      const serviceFilter = screen.getByLabelText('Filter by service');

      await user.type(searchInput, 'o');
      await user.selectOptions(statusFilter, 'active');
      await user.selectOptions(bookingFilter, 'accepting');
      await user.selectOptions(serviceFilter, 'service1');

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument(); // Not accepting bookings
        expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument(); // Inactive
      });
    });

    it('shows no results message when filters match no staff', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Search staff/i);

      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(
          screen.getByText(/No staff members match your filters/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Add Staff Member', () => {
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

      renderAdminStaff();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('opens modal when Add Staff Member button is clicked', async () => {
      const user = userEvent.setup();
      const addButton = screen.getByRole('button', { name: /Add Staff Member/i });

      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('staff-edit-modal')).toBeInTheDocument();
      });
    });

    it('adds a newly created staff member to the table', async () => {
      const user = userEvent.setup();
      const addButton = screen.getByRole('button', { name: /Add Staff Member/i });

      await user.click(addButton);

      await waitFor(() => expect(modalProps.current).not.toBeNull());

      const newStaff = {
        _id: '4',
        name: 'Dana White',
        email: 'dana@example.com',
        title: 'Wellness Coach',
        specialties: ['Wellness'],
        serviceIds: ['service1'],
        isActive: true,
        acceptingBookings: true,
        createdAt: '2024-04-01T10:00:00Z',
      };

      modalProps.current.onSave(newStaff);

      await waitFor(() => {
        expect(screen.getByText('Dana White')).toBeInTheDocument();
      });
    });
  });

  describe('View Staff Member', () => {
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

      renderAdminStaff();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('opens modal in view mode when clicking staff row', async () => {
      const user = userEvent.setup();
      const aliceRow = screen.getByText('Alice Johnson').closest('tr');

      await user.click(aliceRow);

      await waitFor(() => {
        expect(screen.getByTestId('staff-edit-modal')).toBeInTheDocument();
        expect(screen.getByText('View Mode: Yes')).toBeInTheDocument();
        expect(screen.getByText('Editing: Alice Johnson')).toBeInTheDocument();
      });
    });

    it('updates an existing staff member when modal saves changes', async () => {
      const user = userEvent.setup();
      const aliceRow = screen.getByText('Alice Johnson').closest('tr');

      await user.click(aliceRow);

      await waitFor(() => expect(modalProps.current).not.toBeNull());

      const updatedStaff = {
        ...mockStaff[0],
        name: 'Alice Updated',
      };

      modalProps.current.onSave(updatedStaff);

      await waitFor(() => {
        expect(screen.getByText('Alice Updated')).toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
      });
    });
  });

  describe('Export Data', () => {
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

      renderAdminStaff();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('renders export data button', () => {
      expect(screen.getByRole('button', { name: /Export data/i })).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
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

      renderAdminStaff();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('displays sort button with current sort field', () => {
      expect(screen.getByText(/Sort by: Date/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no staff members exist', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ staff: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ services: mockServices }),
        });

      renderAdminStaff();

      await waitFor(() => {
        expect(
          screen.getByText(/No staff members found. Add your first staff member/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Deactivate Staff Member', () => {
    beforeEach(async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ staff: mockStaff }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ services: mockServices }),
        })
        .mockResolvedValue({
          ok: true,
          json: async () => ({ success: true }),
        });

      window.confirm = vi.fn().mockReturnValue(true);
      window.alert = vi.fn();

      renderAdminStaff();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('confirms and deactivates staff member', async () => {
      const user = userEvent.setup();
      const aliceRow = screen.getByText('Alice Johnson').closest('tr');

      await user.click(aliceRow);

      await waitFor(() => expect(modalProps.current).not.toBeNull());

      await modalProps.current.onDelete(mockStaff[0]._id);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(global.fetch).toHaveBeenLastCalledWith(
          expect.stringContaining(`/api/staff/${mockStaff[0]._id}`),
          expect.objectContaining({ method: 'DELETE' })
        );
        expect(screen.getByText('Inactive')).toBeInTheDocument();
        expect(screen.getByText('No')).toBeInTheDocument();
      });
    });

    it('does not deactivate when confirmation is cancelled', async () => {
      window.confirm.mockReturnValueOnce(false);

      const user = userEvent.setup();
      const aliceRow = screen.getByText('Alice Johnson').closest('tr');

      await user.click(aliceRow);

      await waitFor(() => expect(modalProps.current).not.toBeNull());

      await modalProps.current.onDelete(mockStaff[0]._id);

      expect(global.fetch).toHaveBeenCalledTimes(2); // initial staff & services
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });
});
