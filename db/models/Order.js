/**
 * TEMPORARY: Order.js - Legacy wrapper for Booking model
 *
 * This file exists for backwards compatibility while the application
 * transitions from e-commerce (Order) to service booking (Booking).
 *
 * TODO: Remove this file after fully migrating server.js to use Booking directly
 */

import { Booking } from './Booking.js';

// Export Booking as Order for backwards compatibility
export const Order = Booking;
