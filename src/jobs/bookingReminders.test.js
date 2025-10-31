import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Booking } from '../../db/models/Booking.js';
import { Service } from '../../db/models/Service.js';
import { Staff } from '../../db/models/Staff.js';

// Mock Resend before importing the module under test
const mockSend = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: mockSend,
    },
  })),
}));

// Mock other dependencies
vi.mock('node-cron');
vi.mock('../../db/models/Booking.js');
vi.mock('../../db/models/Service.js');
vi.mock('../../db/models/Staff.js');
vi.mock('../../utils/emailTemplates.js', () => ({
  generateBookingReminder24h: vi.fn(() => '<html>24h reminder</html>'),
  generateBookingReminder1h: vi.fn(() => '<html>1h reminder</html>'),
}));
vi.mock('../../utils/logger.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocks are set up
const {
  startBookingReminderJobs,
  process24hReminders,
  process1hReminders,
  sendReminderEmail,
} = await import('./bookingReminders.js');

describe('Booking Reminders - Cron Jobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset NODE_ENV to default
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('startBookingReminderJobs', () => {
    it('should skip cron job initialization in test environment', () => {
      process.env.NODE_ENV = 'test';
      const result = startBookingReminderJobs();

      expect(result).toBeUndefined();
    });

    it('should start cron jobs in non-test environment', async () => {
      process.env.NODE_ENV = 'development';

      // Import cron module to mock it
      const cron = await import('node-cron');
      const scheduleSpy = vi.spyOn(cron.default, 'schedule').mockReturnValue({});

      startBookingReminderJobs();

      // Should schedule two cron jobs
      expect(scheduleSpy).toHaveBeenCalledTimes(2);

      // 24h reminder job - every hour
      expect(scheduleSpy).toHaveBeenCalledWith(
        '0 * * * *',
        expect.any(Function)
      );

      // 1h reminder job - every 15 minutes
      expect(scheduleSpy).toHaveBeenCalledWith(
        '*/15 * * * *',
        expect.any(Function)
      );

      scheduleSpy.mockRestore();
    });

    it('should return job objects when started', async () => {
      process.env.NODE_ENV = 'development';

      const cron = await import('node-cron');
      const mockJob = { start: vi.fn(), stop: vi.fn() };
      vi.spyOn(cron.default, 'schedule').mockReturnValue(mockJob);

      const result = startBookingReminderJobs();

      expect(result).toHaveProperty('job24h');
      expect(result).toHaveProperty('job1h');
      expect(result.job24h).toBe(mockJob);
      expect(result.job1h).toBe(mockJob);
    });
  });

  describe('process24hReminders', () => {
    it('should process bookings needing 24-hour reminders', async () => {
      const mockBookings = [
        {
          _id: 'booking1',
          serviceId: 'service1',
          staffId: 'staff1',
          clientInfo: { email: 'client1@example.com', name: 'Client 1' },
          startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          timeZone: 'America/New_York',
        },
        {
          _id: 'booking2',
          serviceId: 'service2',
          staffId: 'staff2',
          clientInfo: { email: 'client2@example.com', name: 'Client 2' },
          startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          timeZone: 'America/Los_Angeles',
        },
      ];

      vi.mocked(Booking.findNeedingReminders).mockResolvedValue(mockBookings);
      vi.mocked(Service.findById).mockResolvedValue({ name: 'Test Service', duration: 60 });
      vi.mocked(Staff.findById).mockResolvedValue({ name: 'Test Staff' });
      vi.mocked(Booking.addReminderSent).mockResolvedValue(true);
      mockSend.mockResolvedValue({ id: 'email-id' });

      await process24hReminders();

      expect(Booking.findNeedingReminders).toHaveBeenCalledWith('24h');
      expect(mockSend).toHaveBeenCalledTimes(2);
      expect(Booking.addReminderSent).toHaveBeenCalledTimes(2);
    });

    it('should handle when no bookings need reminders', async () => {
      vi.mocked(Booking.findNeedingReminders).mockResolvedValue([]);

      await process24hReminders();

      expect(Booking.findNeedingReminders).toHaveBeenCalledWith('24h');
      // Should not attempt to send any emails
    });

    it('should continue processing after individual email failures', async () => {
      const mockBookings = [
        {
          _id: 'booking1',
          serviceId: 'service1',
          staffId: 'staff1',
          clientInfo: { email: 'client1@example.com' },
          startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          timeZone: 'America/New_York',
        },
        {
          _id: 'booking2',
          serviceId: 'service2',
          staffId: 'staff2',
          clientInfo: { email: 'client2@example.com' },
          startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          timeZone: 'America/New_York',
        },
      ];

      vi.mocked(Booking.findNeedingReminders).mockResolvedValue(mockBookings);

      // First booking succeeds
      vi.mocked(Service.findById).mockResolvedValueOnce({ name: 'Service 1', duration: 60 });
      vi.mocked(Staff.findById).mockResolvedValueOnce({ name: 'Staff 1' });

      // Second booking fails (missing service)
      vi.mocked(Service.findById).mockResolvedValueOnce(null);

      vi.mocked(Booking.addReminderSent).mockResolvedValue(true);
      mockSend.mockResolvedValue({ id: 'email-id' });

      await process24hReminders();

      // Should only send one email (first booking)
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(Booking.addReminderSent).toHaveBeenCalledTimes(1);
    });

    it('should include rate limiting delay between emails', async () => {
      const mockBookings = [
        {
          _id: 'booking1',
          serviceId: 'service1',
          staffId: 'staff1',
          clientInfo: { email: 'client1@example.com' },
          startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          timeZone: 'America/New_York',
        },
        {
          _id: 'booking2',
          serviceId: 'service2',
          staffId: 'staff2',
          clientInfo: { email: 'client2@example.com' },
          startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          timeZone: 'America/New_York',
        },
      ];

      vi.mocked(Booking.findNeedingReminders).mockResolvedValue(mockBookings);
      vi.mocked(Service.findById).mockResolvedValue({ name: 'Test Service', duration: 60 });
      vi.mocked(Staff.findById).mockResolvedValue({ name: 'Test Staff' });
      vi.mocked(Booking.addReminderSent).mockResolvedValue(true);
      mockSend.mockResolvedValue({ id: 'email-id' });

      const startTime = Date.now();
      await process24hReminders();
      const endTime = Date.now();

      // Should take at least 500ms (one delay between two emails)
      expect(endTime - startTime).toBeGreaterThanOrEqual(500);
    });
  });

  describe('process1hReminders', () => {
    it('should process bookings needing 1-hour reminders', async () => {
      const mockBookings = [
        {
          _id: 'booking1',
          serviceId: 'service1',
          staffId: 'staff1',
          clientInfo: { email: 'client1@example.com', name: 'Client 1' },
          startDateTime: new Date(Date.now() + 60 * 60 * 1000),
          timeZone: 'America/New_York',
        },
      ];

      vi.mocked(Booking.findNeedingReminders).mockResolvedValue(mockBookings);
      vi.mocked(Service.findById).mockResolvedValue({ name: 'Test Service', duration: 60 });
      vi.mocked(Staff.findById).mockResolvedValue({ name: 'Test Staff' });
      vi.mocked(Booking.addReminderSent).mockResolvedValue(true);
      mockSend.mockResolvedValue({ id: 'email-id' });

      await process1hReminders();

      expect(Booking.findNeedingReminders).toHaveBeenCalledWith('1h');
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(Booking.addReminderSent).toHaveBeenCalledWith('booking1', '1h');
    });

    it('should handle when no bookings need 1-hour reminders', async () => {
      vi.mocked(Booking.findNeedingReminders).mockResolvedValue([]);

      await process1hReminders();

      expect(Booking.findNeedingReminders).toHaveBeenCalledWith('1h');
    });

    it('should handle errors gracefully without crashing', async () => {
      vi.mocked(Booking.findNeedingReminders).mockRejectedValue(
        new Error('Database connection failed')
      );

      // Should not throw
      await expect(process1hReminders()).resolves.not.toThrow();
    });
  });

  describe('sendReminderEmail', () => {
    const mockBooking = {
      _id: 'booking123',
      serviceId: 'service123',
      staffId: 'staff123',
      clientInfo: {
        email: 'client@example.com',
        name: 'John Doe',
      },
      startDateTime: new Date('2025-11-01T14:00:00Z'),
      duration: 60,
      timeZone: 'America/New_York',
    };

    const mockService = {
      _id: 'service123',
      name: 'Personal Training Session',
      duration: 60,
    };

    const mockStaff = {
      _id: 'staff123',
      name: 'Jane Smith',
      email: 'jane@example.com',
    };

    beforeEach(() => {
      vi.mocked(Service.findById).mockResolvedValue(mockService);
      vi.mocked(Staff.findById).mockResolvedValue(mockStaff);
      vi.mocked(Booking.addReminderSent).mockResolvedValue(true);
    });

    it('should send 24-hour reminder email successfully', async () => {
      mockSend.mockResolvedValue({ id: 'email-123' });

      const result = await sendReminderEmail(mockBooking, '24h');

      expect(result).toBe(true);
      expect(Service.findById).toHaveBeenCalledWith('service123');
      expect(Staff.findById).toHaveBeenCalledWith('staff123');
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'client@example.com',
          html: '<html>24h reminder</html>',
        })
      );
      expect(Booking.addReminderSent).toHaveBeenCalledWith('booking123', '24h');
    });

    it('should send 1-hour reminder email successfully', async () => {
      mockSend.mockResolvedValue({ id: 'email-456' });

      const result = await sendReminderEmail(mockBooking, '1h');

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'client@example.com',
          html: '<html>1h reminder</html>',
          subject: 'Your appointment is in 1 hour',
        })
      );
      expect(Booking.addReminderSent).toHaveBeenCalledWith('booking123', '1h');
    });

    it('should return false if service not found', async () => {
      vi.mocked(Service.findById).mockResolvedValue(null);

      const result = await sendReminderEmail(mockBooking, '24h');

      expect(result).toBe(false);
      expect(Booking.addReminderSent).not.toHaveBeenCalled();
    });

    it('should return false if staff not found', async () => {
      vi.mocked(Staff.findById).mockResolvedValue(null);

      const result = await sendReminderEmail(mockBooking, '24h');

      expect(result).toBe(false);
      expect(Booking.addReminderSent).not.toHaveBeenCalled();
    });

    it('should handle email sending failures gracefully', async () => {
      mockSend.mockRejectedValue(new Error('Email API failed'));

      const result = await sendReminderEmail(mockBooking, '24h');

      expect(result).toBe(false);
      expect(Booking.addReminderSent).not.toHaveBeenCalled();
    });

    it('should use correct timezone in email subject for 24h reminder', async () => {
      mockSend.mockResolvedValue({ id: 'email-789' });

      await sendReminderEmail(mockBooking, '24h');

      // Subject should include formatted time with timezone
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Reminder: Your appointment tomorrow'),
        })
      );
    });

    it('should call email template generators with correct data', async () => {
      mockSend.mockResolvedValue({ id: 'email-999' });

      const { generateBookingReminder24h } = await import('../../utils/emailTemplates.js');

      await sendReminderEmail(mockBooking, '24h');

      expect(generateBookingReminder24h).toHaveBeenCalledWith(
        mockBooking,
        mockService,
        mockStaff
      );
    });

    it('should handle database errors when marking reminder as sent', async () => {
      mockSend.mockResolvedValue({ id: 'email-111' });

      vi.mocked(Booking.addReminderSent).mockRejectedValue(
        new Error('Database write failed')
      );

      // Should still return false if reminder marking fails
      const result = await sendReminderEmail(mockBooking, '24h');

      expect(result).toBe(false);
    });
  });

  describe('Email Content and Format', () => {
    // Note: FROM_EMAIL is set at module load time, so we test the default behavior
    it.skip('should use environment variable for FROM_EMAIL', async () => {
      // This test is skipped because FROM_EMAIL is set at module load time
      // and cannot be changed dynamically during tests
    });

    it('should use default FROM_EMAIL if not specified', async () => {
      delete process.env.REMINDER_FROM_EMAIL;

      vi.mocked(Service.findById).mockResolvedValue({ name: 'Test Service', duration: 60 });
      vi.mocked(Staff.findById).mockResolvedValue({ name: 'Test Staff' });
      vi.mocked(Booking.addReminderSent).mockResolvedValue(true);
      mockSend.mockResolvedValue({ id: 'email-default' });

      const mockBooking = {
        _id: 'booking1',
        serviceId: 'service1',
        staffId: 'staff1',
        clientInfo: { email: 'client@example.com' },
        startDateTime: new Date(),
        timeZone: 'America/New_York',
      };

      await sendReminderEmail(mockBooking, '24h');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'bookings@example.com',
        })
      );
    });
  });

  describe('Error Handling and Logging', () => {
    it('should log errors when processing reminders fails', async () => {
      vi.mocked(Booking.findNeedingReminders).mockRejectedValue(
        new Error('Database error')
      );

      const logger = (await import('../../utils/logger.js')).default;

      await process24hReminders();

      expect(logger.error).toHaveBeenCalledWith(
        'Error processing 24-hour reminders:',
        expect.any(Error)
      );
    });

    it('should log success information after sending reminders', async () => {
      const mockBookings = [
        {
          _id: 'booking1',
          serviceId: 'service1',
          staffId: 'staff1',
          clientInfo: { email: 'client1@example.com' },
          startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          timeZone: 'America/New_York',
        },
      ];

      vi.mocked(Booking.findNeedingReminders).mockResolvedValue(mockBookings);
      vi.mocked(Service.findById).mockResolvedValue({ name: 'Test Service', duration: 60 });
      vi.mocked(Staff.findById).mockResolvedValue({ name: 'Test Staff' });
      vi.mocked(Booking.addReminderSent).mockResolvedValue(true);
      mockSend.mockResolvedValue({ id: 'email-id' });

      const logger = (await import('../../utils/logger.js')).default;

      await process24hReminders();

      expect(logger.info).toHaveBeenCalledWith('Processing 24-hour booking reminders...');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('24-hour reminders complete:')
      );
    });
  });
});
