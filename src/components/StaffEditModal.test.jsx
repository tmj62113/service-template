import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StaffEditModal from './StaffEditModal';

// Mock uploadImage utility
vi.mock('../utils/uploadImage', () => ({
  uploadImage: vi.fn(),
}));

import { uploadImage } from '../utils/uploadImage';

describe('StaffEditModal', () => {
  const mockServices = [
    { _id: '1', name: 'Service 1', duration: 60 },
    { _id: '2', name: 'Service 2', duration: 45 },
  ];

  const mockStaffMember = {
    _id: 'staff123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-1234',
    title: 'Senior Coach',
    bio: 'Experienced coach',
    specialties: ['Leadership', 'Strategy'],
    serviceIds: ['1'],
    photo: 'https://example.com/photo.jpg',
    isActive: true,
    acceptingBookings: true,
    timeZone: 'America/New_York',
    defaultBookingBuffer: 15,
  };

  const defaultProps = {
    staffMember: null,
    services: mockServices,
    onClose: vi.fn(),
    onSave: vi.fn(),
    onDelete: vi.fn(),
    viewMode: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Form Fields', () => {
    it('renders all core form fields for staff details', () => {
      render(<StaffEditModal {...defaultProps} />);

      expect(screen.getByLabelText('Profile Photo')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email *')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone')).toBeInTheDocument();
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    });

    it('renders specialty input, service checkboxes, and status toggles', () => {
      render(<StaffEditModal {...defaultProps} />);

      expect(screen.getByPlaceholderText('e.g., Leadership Coaching')).toBeInTheDocument();
      expect(screen.getByText('Service 1 (60 min)')).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Active \(staff member is active\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Accepting Bookings \(available for new bookings\)/i)
      ).toBeInTheDocument();
    });
  });

  describe('Photo Upload', () => {
    it('displays existing photo in view mode', () => {
      render(
        <StaffEditModal
          {...defaultProps}
          staffMember={mockStaffMember}
          viewMode={true}
        />
      );

      const photoImg = screen.getByAltText(`Portrait of ${mockStaffMember.name}`);
      expect(photoImg).toBeInTheDocument();
      expect(photoImg).toHaveAttribute('src', mockStaffMember.photo);
    });

    it('displays "No photo uploaded" message when no photo in view mode', () => {
      render(
        <StaffEditModal
          {...defaultProps}
          staffMember={{ ...mockStaffMember, photo: '' }}
          viewMode={true}
        />
      );

      expect(screen.getByText('No photo uploaded')).toBeInTheDocument();
    });

    it('displays photo upload input in edit mode', () => {
      render(<StaffEditModal {...defaultProps} />);

      const fileInput = screen.getByLabelText('Profile Photo');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', 'image/*');
    });

    it('displays photo preview when staff has photo in edit mode', () => {
      render(
        <StaffEditModal
          {...defaultProps}
          staffMember={mockStaffMember}
          viewMode={false}
        />
      );

      const photoImg = screen.getByAltText(`Portrait of ${mockStaffMember.name}`);
      expect(photoImg).toBeInTheDocument();
      expect(photoImg).toHaveAttribute('src', mockStaffMember.photo);
    });

    it('displays person icon placeholder when no photo in edit mode', () => {
      render(<StaffEditModal {...defaultProps} />);

      const placeholder = screen.getByText('person');
      expect(placeholder).toBeInTheDocument();
    });

    it('uploads photo successfully', async () => {
      const user = userEvent.setup();
      const uploadedUrl = 'https://cloudinary.com/uploaded.jpg';
      uploadImage.mockResolvedValueOnce(uploadedUrl);

      render(<StaffEditModal {...defaultProps} />);

      const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Profile Photo');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(uploadImage).toHaveBeenCalledWith(file);
      });

      // Check that the photo preview is updated
      await waitFor(() => {
        const photoImg = screen.queryByAltText('Uploaded staff portrait');
        expect(photoImg).toBeInTheDocument();
        expect(photoImg).toHaveAttribute('src', uploadedUrl);
      });
    });

    it('displays uploading status during photo upload', async () => {
      const user = userEvent.setup();
      uploadImage.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<StaffEditModal {...defaultProps} />);

      const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Profile Photo');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Uploading photo...')).toBeInTheDocument();
      });
    });

    it('displays error when upload fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Upload failed';
      uploadImage.mockRejectedValueOnce(new Error(errorMessage));

      render(<StaffEditModal {...defaultProps} />);

      const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Profile Photo');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('validates file type - rejects non-image files', async () => {
      const user = userEvent.setup();

      render(<StaffEditModal {...defaultProps} />);

      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText('Profile Photo');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Please upload a valid image file')).toBeInTheDocument();
      });

      expect(uploadImage).not.toHaveBeenCalled();
    });

    it('validates file size - rejects files over 5MB', async () => {
      const user = userEvent.setup();

      render(<StaffEditModal {...defaultProps} />);

      // Create a file larger than 5MB
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });
      const fileInput = screen.getByLabelText('Profile Photo');

      await user.upload(fileInput, largeFile);

      await waitFor(() => {
        expect(screen.getByText('Please upload an image smaller than 5MB')).toBeInTheDocument();
      });

      expect(uploadImage).not.toHaveBeenCalled();
    });

    it('removes photo when remove button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <StaffEditModal
          {...defaultProps}
          staffMember={mockStaffMember}
          viewMode={false}
        />
      );

      // Verify photo is displayed
      expect(screen.getByAltText(`Portrait of ${mockStaffMember.name}`)).toBeInTheDocument();

      // Click remove button
      const removeButton = screen.getByRole('button', { name: /remove photo/i });
      await user.click(removeButton);

      // Verify photo is removed
      await waitFor(() => {
        expect(screen.queryByAltText(`Portrait of ${mockStaffMember.name}`)).not.toBeInTheDocument();
        expect(screen.getByText('person')).toBeInTheDocument(); // Placeholder is shown
      });
    });

    it('displays help text for photo upload', () => {
      render(<StaffEditModal {...defaultProps} />);

      expect(
        screen.getByText(/Upload a square image \(max 5MB\)/)
      ).toBeInTheDocument();
    });

    it('shows remove button only when photo exists', () => {
      const { rerender } = render(
        <StaffEditModal
          {...defaultProps}
          staffMember={mockStaffMember}
          viewMode={false}
        />
      );

      // With photo - button should exist
      expect(screen.getByRole('button', { name: /remove photo/i })).toBeInTheDocument();

      // Without photo - button should not exist
      rerender(
        <StaffEditModal
          {...defaultProps}
          staffMember={{ ...mockStaffMember, photo: '' }}
          viewMode={false}
        />
      );

      expect(screen.queryByRole('button', { name: /remove photo/i })).not.toBeInTheDocument();
    });
  });

  describe('Modal Functionality', () => {
    it('renders modal with title for new staff', () => {
      render(<StaffEditModal {...defaultProps} />);

      expect(screen.getByText('New Staff Member')).toBeInTheDocument();
    });

    it('renders modal with title for editing staff', () => {
      render(
        <StaffEditModal
          {...defaultProps}
          staffMember={mockStaffMember}
          viewMode={false}
        />
      );

      expect(screen.getByText('Edit Staff Member')).toBeInTheDocument();
    });

    it('renders modal in view mode', () => {
      render(
        <StaffEditModal
          {...defaultProps}
          staffMember={mockStaffMember}
          viewMode={true}
        />
      );

      expect(screen.getByText('Staff Member Details')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<StaffEditModal {...defaultProps} />);

      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('includes photo URL when saving staff with photo', async () => {
      const user = userEvent.setup();
      const uploadedUrl = 'https://cloudinary.com/uploaded.jpg';
      uploadImage.mockResolvedValueOnce(uploadedUrl);

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockStaffMember,
          photo: uploadedUrl,
        }),
      });

      render(<StaffEditModal {...defaultProps} />);

      // Fill in required fields
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);

      await user.clear(nameInput);
      await user.type(nameInput, 'Jane Doe');
      await user.clear(emailInput);
      await user.type(emailInput, 'jane@example.com');

      // Upload photo
      const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Profile Photo');
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(uploadImage).toHaveBeenCalled();
      });

      // Save
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining(uploadedUrl),
          })
        );
      });
    });
  });

  describe('Service Assignment', () => {
    it('displays available services as checkboxes', () => {
      render(<StaffEditModal {...defaultProps} />);

      const serviceCheckboxes = screen.getAllByRole('checkbox', { name: /Service/ });
      expect(serviceCheckboxes).toHaveLength(2);
    });

    it('allows selecting multiple services and saves them', async () => {
      const user = userEvent.setup();
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockStaffMember,
          serviceIds: ['1', '2'],
        }),
      });

      render(<StaffEditModal {...defaultProps} />);

      const nameInput = screen.getByLabelText('Full Name *');
      const emailInput = screen.getByLabelText('Email *');
      await user.clear(nameInput);
      await user.type(nameInput, 'Dana Coach');
      await user.clear(emailInput);
      await user.type(emailInput, 'dana@example.com');

      const serviceCheckboxes = screen.getAllByRole('checkbox', { name: /Service/ });
      await user.click(serviceCheckboxes[0]);
      await user.click(serviceCheckboxes[1]);

      const saveButton = screen.getByRole('button', { name: /Create Staff Member/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/staff'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"serviceIds":["1","2"]'),
          })
        );
        expect(defaultProps.onSave).toHaveBeenCalledWith(
          expect.objectContaining({ serviceIds: ['1', '2'] })
        );
      });
    });
  });

  describe('Specialty Tags', () => {
    it('displays existing specialties as removable chips', () => {
      render(
        <StaffEditModal
          {...defaultProps}
          staffMember={mockStaffMember}
          viewMode={false}
        />
      );

      expect(screen.getByText('Leadership')).toBeInTheDocument();
      expect(screen.getByLabelText('Remove Leadership')).toBeInTheDocument();
    });

    it('allows adding a new specialty tag', async () => {
      const user = userEvent.setup();
      render(<StaffEditModal {...defaultProps} />);

      const specialtyInput = screen.getByPlaceholderText('e.g., Leadership Coaching');
      await user.type(specialtyInput, 'Mindfulness');

      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(screen.getByText('Mindfulness')).toBeInTheDocument();
    });

    it('allows removing specialty tags', async () => {
      const user = userEvent.setup();
      render(
        <StaffEditModal
          {...defaultProps}
          staffMember={mockStaffMember}
          viewMode={false}
        />
      );

      await user.click(screen.getByLabelText('Remove Leadership'));

      expect(screen.queryByText('Leadership')).not.toBeInTheDocument();
    });

    it('saves specialties on submit', async () => {
      const user = userEvent.setup();
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockStaffMember,
          specialties: ['Leadership', 'Strategy', 'Mindfulness'],
        }),
      });

      render(<StaffEditModal {...defaultProps} />);

      const nameInput = screen.getByLabelText('Full Name *');
      const emailInput = screen.getByLabelText('Email *');
      await user.clear(nameInput);
      await user.type(nameInput, 'Dana Coach');
      await user.clear(emailInput);
      await user.type(emailInput, 'dana@example.com');

      const specialtyInput = screen.getByPlaceholderText('e.g., Leadership Coaching');
      await user.type(specialtyInput, 'Mindfulness');
      await user.click(screen.getByRole('button', { name: 'Add' }));

      const saveButton = screen.getByRole('button', { name: /Create Staff Member/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/staff'),
          expect.objectContaining({
            body: expect.stringContaining('"specialties":["Mindfulness"]'),
          })
        );
        expect(defaultProps.onSave).toHaveBeenCalledWith(
          expect.objectContaining({ specialties: ['Leadership', 'Strategy', 'Mindfulness'] })
        );
      });
    });
  });
});
