import cron from 'node-cron';
import { Resend } from 'resend';
import { Booking } from '../../db/models/Booking.js';
import { Service } from '../../db/models/Service.js';
import { Staff } from '../../db/models/Staff.js';
import {
  generateBookingReminder24h,
  generateBookingReminder1h,
} from '../../utils/emailTemplates.js';
import logger from '../../utils/logger.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.REMINDER_FROM_EMAIL || 'bookings@example.com';

/**
 * Send reminder email for a booking
 * @param {Object} booking - Booking document
 * @param {string} reminderType - Type of reminder ('24h' or '1h')
 * @returns {Promise<boolean>} Success status
 */
async function sendReminderEmail(booking, reminderType) {
  try {
    // Fetch related service and staff data
    const [service, staff] = await Promise.all([
      Service.findById(booking.serviceId.toString()),
      Staff.findById(booking.staffId.toString()),
    ]);

    if (!service) {
      logger.error(`Service not found for booking ${booking._id}`);
      return false;
    }

    if (!staff) {
      logger.error(`Staff not found for booking ${booking._id}`);
      return false;
    }

    // Generate email content based on reminder type
    const emailHtml =
      reminderType === '24h'
        ? generateBookingReminder24h(booking, service, staff)
        : generateBookingReminder1h(booking, service, staff);

    const subject =
      reminderType === '24h'
        ? `Reminder: Your appointment tomorrow at ${new Date(booking.startDateTime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: booking.timeZone || 'America/New_York',
          })}`
        : `Your appointment is in 1 hour`;

    // Send email via Resend
    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.clientInfo.email,
      subject,
      html: emailHtml,
    });

    logger.info(`Sent ${reminderType} reminder for booking ${booking._id} to ${booking.clientInfo.email}`);

    // Mark reminder as sent
    await Booking.addReminderSent(booking._id.toString(), reminderType);

    return true;
  } catch (error) {
    logger.error(`Failed to send ${reminderType} reminder for booking ${booking._id}:`, error);
    return false;
  }
}

/**
 * Process bookings needing 24-hour reminders
 * Runs every hour
 */
async function process24hReminders() {
  try {
    logger.info('Processing 24-hour booking reminders...');

    const bookings = await Booking.findNeedingReminders('24h');

    if (bookings.length === 0) {
      logger.info('No bookings need 24-hour reminders at this time');
      return;
    }

    logger.info(`Found ${bookings.length} bookings needing 24-hour reminders`);

    // Send reminders (with rate limiting consideration)
    let successCount = 0;
    let failureCount = 0;

    for (const booking of bookings) {
      const success = await sendReminderEmail(booking, '24h');
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }

      // Small delay to avoid rate limiting (Resend: 100 emails/hour on free tier)
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    logger.info(
      `24-hour reminders complete: ${successCount} sent, ${failureCount} failed`
    );
  } catch (error) {
    logger.error('Error processing 24-hour reminders:', error);
  }
}

/**
 * Process bookings needing 1-hour reminders
 * Runs every 15 minutes
 */
async function process1hReminders() {
  try {
    logger.info('Processing 1-hour booking reminders...');

    const bookings = await Booking.findNeedingReminders('1h');

    if (bookings.length === 0) {
      logger.info('No bookings need 1-hour reminders at this time');
      return;
    }

    logger.info(`Found ${bookings.length} bookings needing 1-hour reminders`);

    // Send reminders
    let successCount = 0;
    let failureCount = 0;

    for (const booking of bookings) {
      const success = await sendReminderEmail(booking, '1h');
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    logger.info(
      `1-hour reminders complete: ${successCount} sent, ${failureCount} failed`
    );
  } catch (error) {
    logger.error('Error processing 1-hour reminders:', error);
  }
}

/**
 * Start all booking reminder cron jobs
 * Should only run in production/development, not in tests
 */
export function startBookingReminderJobs() {
  // Don't run cron jobs in test environment
  if (process.env.NODE_ENV === 'test') {
    logger.info('Skipping booking reminder cron jobs in test environment');
    return;
  }

  logger.info('Starting booking reminder cron jobs...');

  // 24-hour reminder job - runs every hour at minute 0
  // Cron: "0 * * * *" = At minute 0 of every hour
  const job24h = cron.schedule('0 * * * *', async () => {
    await process24hReminders();
  });

  // 1-hour reminder job - runs every 15 minutes
  // Cron: "*/15 * * * *" = Every 15 minutes
  const job1h = cron.schedule('*/15 * * * *', async () => {
    await process1hReminders();
  });

  logger.info('Booking reminder cron jobs started:');
  logger.info('  - 24-hour reminders: Every hour at :00');
  logger.info('  - 1-hour reminders: Every 15 minutes');

  return { job24h, job1h };
}

/**
 * Manual trigger functions for testing
 */
export { process24hReminders, process1hReminders, sendReminderEmail };
