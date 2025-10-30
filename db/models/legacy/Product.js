/**
 * TEMPORARY: Product.js - Legacy wrapper for Service model
 *
 * This file exists for backwards compatibility while the application
 * transitions from e-commerce (Product) to service booking (Service).
 *
 * TODO: Remove this file after fully migrating server.js to use Service directly
 */

import { Service } from './Service.js';

// Export Service as Product for backwards compatibility
export const Product = Service;
