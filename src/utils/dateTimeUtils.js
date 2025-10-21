import { format, parse, addMinutes, isSameDay, isToday, isTomorrow, isPast, startOfDay } from 'date-fns';
import { formatInTimeZone, toDate } from 'date-fns-tz';

/**
 * Format a date for display
 * @param {Date} date - The date to format
 * @param {string} formatString - The format string (default: 'PPP')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatString = 'PPP') => {
  return format(date, formatString);
};

/**
 * Format a time for display
 * @param {Date} date - The date to format
 * @param {string} formatString - The format string (default: 'p')
 * @returns {string} Formatted time string
 */
export const formatTime = (date, formatString = 'p') => {
  return format(date, formatString);
};

/**
 * Format date and time together
 * @param {Date} date - The date to format
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (date) => {
  return format(date, 'PPP p');
};

/**
 * Get user-friendly date label
 * @param {Date} date - The date
 * @returns {string} Label like "Today", "Tomorrow", or formatted date
 */
export const getDateLabel = (date) => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEEE, MMMM d');
};

/**
 * Format time slot for display (e.g., "9:00 AM")
 * @param {string} timeString - Time string in HH:mm format
 * @returns {string} Formatted time
 */
export const formatTimeSlot = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return format(date, 'h:mm a');
};

/**
 * Parse time string to Date object
 * @param {string} timeString - Time string in HH:mm format
 * @param {Date} baseDate - Base date to apply time to
 * @returns {Date} Date object with time applied
 */
export const parseTimeString = (timeString, baseDate = new Date()) => {
  const [hours, minutes] = timeString.split(':');
  const result = new Date(baseDate);
  result.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return result;
};

/**
 * Convert date to specific timezone
 * @param {Date} date - The date to convert
 * @param {string} timezone - Target timezone
 * @returns {Date} Converted date
 */
export const convertToTimezone = (date, timezone) => {
  return toDate(date, { timeZone: timezone });
};

/**
 * Format date in specific timezone
 * @param {Date} date - The date to format
 * @param {string} timezone - Target timezone
 * @param {string} formatString - Format string
 * @returns {string} Formatted date in timezone
 */
export const formatInTimezone = (date, timezone, formatString = 'PPP p') => {
  return formatInTimeZone(date, timezone, formatString);
};

/**
 * Get user's current timezone
 * @returns {string} User's timezone
 */
export const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Group time slots by period (Morning, Afternoon, Evening)
 * @param {Array} slots - Array of time slot objects {startTime, endTime}
 * @returns {Object} Grouped slots by period
 */
export const groupSlotsByPeriod = (slots) => {
  const grouped = {
    morning: [],    // Before 12:00
    afternoon: [],  // 12:00 - 17:00
    evening: []     // After 17:00
  };

  slots.forEach(slot => {
    const [hours] = slot.startTime.split(':');
    const hour = parseInt(hours);

    if (hour < 12) {
      grouped.morning.push(slot);
    } else if (hour < 17) {
      grouped.afternoon.push(slot);
    } else {
      grouped.evening.push(slot);
    }
  });

  return grouped;
};

/**
 * Check if a date is in the past
 * @param {Date} date - The date to check
 * @returns {boolean} True if date is in the past
 */
export const isDatePast = (date) => {
  return isPast(startOfDay(date)) && !isToday(date);
};

/**
 * Calculate end time from start time and duration
 * @param {string} startTime - Start time in HH:mm format
 * @param {number} durationMinutes - Duration in minutes
 * @returns {string} End time in HH:mm format
 */
export const calculateEndTime = (startTime, durationMinutes) => {
  const startDate = parseTimeString(startTime);
  const endDate = addMinutes(startDate, durationMinutes);
  return format(endDate, 'HH:mm');
};

/**
 * Format duration in human-readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "1h 30min")
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

/**
 * Format price in USD currency
 * @param {number} priceInCents - Price in cents
 * @returns {string} Formatted price
 */
export const formatPrice = (priceInCents) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(priceInCents / 100);
};

/**
 * Get minimum bookable date (today or later based on business rules)
 * @returns {Date} Minimum date that can be selected
 */
export const getMinBookableDate = () => {
  return new Date(); // Today
};

/**
 * Get maximum bookable date (based on service's maxAdvanceBooking)
 * @param {number} daysAhead - Number of days ahead (default 60)
 * @returns {Date} Maximum date that can be selected
 */
export const getMaxBookableDate = (daysAhead = 60) => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + daysAhead);
  return maxDate;
};

/**
 * Check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if same day
 */
export const isSameDate = (date1, date2) => {
  return isSameDay(date1, date2);
};

/**
 * Create an iCal file content for a booking
 * @param {Object} booking - Booking object
 * @param {string} booking.serviceName - Name of service
 * @param {Date} booking.startDateTime - Start date/time
 * @param {Date} booking.endDateTime - End date/time
 * @param {string} booking.location - Location or "Online"
 * @param {string} booking.description - Description
 * @returns {string} iCal file content
 */
export const generateICalContent = (booking) => {
  const formatICalDate = (date) => {
    return format(date, "yyyyMMdd'T'HHmmss");
  };

  const now = new Date();

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Service Booking App//EN
BEGIN:VEVENT
UID:${booking.id || Date.now()}@servicebooking.com
DTSTAMP:${formatICalDate(now)}
DTSTART:${formatICalDate(new Date(booking.startDateTime))}
DTEND:${formatICalDate(new Date(booking.endDateTime))}
SUMMARY:${booking.serviceName}
DESCRIPTION:${booking.description || ''}
LOCATION:${booking.location || 'Online'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
};

/**
 * Download iCal file
 * @param {string} content - iCal content
 * @param {string} filename - Filename (default: booking.ics)
 */
export const downloadICalFile = (content, filename = 'booking.ics') => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
