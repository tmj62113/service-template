/**
 * TEMPORARY: shippoService.js - Stub for shipping integration
 *
 * This file exists for backwards compatibility while the application
 * transitions from e-commerce to service booking.
 * Shipping is not needed for service booking apps.
 *
 * TODO: Remove Shippo integration from server.js entirely
 */

export async function createShipment() {
  throw new Error('Shipping is not available for service booking platform');
}

export async function getTrackingStatus() {
  throw new Error('Shipping is not available for service booking platform');
}
