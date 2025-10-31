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
    { _id: '1', name: 'Service 1' },
    { _id: '2', name: 'Service 2' },
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

      expect(screen.getByText('Add Staff Member')).toBeInTheDocument();
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

      expect(screen.getByText('Staff Details')).toBeInTheDocument();
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
});
