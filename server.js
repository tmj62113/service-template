import dotenv from 'dotenv';
dotenv.config();

// Validate environment variables before starting server
import { validateRequiredEnv, validateOptionalEnv } from './utils/validateEnv.js';
if (process.env.NODE_ENV === 'production') {
  validateRequiredEnv();
}
validateOptionalEnv();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import Stripe from 'stripe';
import { Resend } from 'resend';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Order } from './db/models/Order.js';
import { User } from './db/models/User.js';
import { Product } from './db/models/Product.js';
import { Subscriber } from './db/models/Subscriber.js';
import { Newsletter } from './db/models/Newsletter.js';
import { AuditLog } from './db/models/AuditLog.js';
import { BlockedIP } from './db/models/BlockedIP.js';
// Service booking models
import { Service } from './db/models/Service.js';
import { Staff } from './db/models/Staff.js';
import { Booking } from './db/models/Booking.js';
import { Availability } from './db/models/Availability.js';
import { RecurringBooking } from './db/models/RecurringBooking.js';
import { generateOrderConfirmationEmail } from './utils/emailTemplates.js';
import { authenticateToken, generateToken } from './middleware/auth.js';
import { createShipment, getTrackingStatus } from './services/shippoService.js';
import { getCollection, getDatabase } from './db/connection.js';
import { ObjectId } from 'mongodb';
import { validateContactForm, validateNewsletterSubscription, validateProductData, validateNewsletterContent, isHoneypotFilled } from './utils/security.js';
import { doubleCsrf } from 'csrf-csrf';
import logger, { requestLogger } from './utils/logger.js';

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// HTTPS ENFORCEMENT & TRUST PROXY
// ============================================

// Trust proxy - required for correct IP address detection behind reverse proxy
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// HTTPS enforcement middleware (redirect HTTP to HTTPS in production)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for memory storage (files stored in memory, not disk)
const upload = multer({ storage: multer.memoryStorage() });

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet for security headers with HSTS
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://js.stripe.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://api.stripe.com'],
      frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
  // HSTS - HTTP Strict Transport Security (forces HTTPS for 1 year)
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  // Additional security headers
  frameguard: { action: 'deny' }, // Prevent clickjacking
  noSniff: true, // Prevent MIME type sniffing
  xssFilter: true, // Enable XSS filter
}));

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiting
const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests, please try again later'
);

// Strict rate limiting for authentication endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // 10 attempts per window
  'Too many authentication attempts, please try again later'
);

// Contact form rate limiting
const contactLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // 3 submissions per hour
  'Too many contact form submissions, please try again later'
);

// Newsletter subscription rate limiting
const newsletterLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // 5 subscriptions per hour
  'Too many subscription attempts, please try again later'
);

// CORS configuration - hardened for production
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [process.env.CLIENT_URL].filter(Boolean) // Only allow configured client URL in production
      : [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean); // Allow localhost in development

    // Allow requests with no origin (health checks, webhooks, server-to-server, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Explicitly allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allowed headers
  maxAge: 86400, // Cache preflight requests for 24 hours
};

app.use(cors(corsOptions));

// Request logging middleware (structured logging with Winston)
app.use(requestLogger);

// Cookie parser middleware
app.use(cookieParser());

// ============================================
// CSRF PROTECTION
// ============================================

// Configure CSRF protection
const {
  generateToken: csrfGenerateToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.JWT_SECRET, // Use existing JWT secret for CSRF
  cookieName: '__Host-mjp.csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'], // Don't require CSRF for these methods
});

// Apply CSRF to routes that modify data (POST, PUT, DELETE, PATCH)
// Excluded routes: Stripe webhook (needs raw body), public endpoints
const csrfProtection = (req, res, next) => {
  // Skip CSRF for Stripe webhooks and specific public endpoints
  const publicEndpoints = [
    '/api/webhook',
    '/api/shippo-webhook',
    '/api/webhooks/email-reply',
    '/api/products', // GET only (read operations are safe)
    '/api/health',
    '/api/sitemap.xml',
  ];

  const isPublicEndpoint = publicEndpoints.some(endpoint => req.path.startsWith(endpoint));
  const isReadOperation = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);

  if (isPublicEndpoint || isReadOperation) {
    return next();
  }

  return doubleCsrfProtection(req, res, next);
};

// CSRF token endpoint (GET /api/csrf-token)
app.get('/api/csrf-token', (req, res) => {
  const csrfToken = csrfGenerateToken(req, res);
  res.json({ csrfToken });
});

// Apply general rate limiting to all API routes
app.use('/api/', generalLimiter);

// IP Blocking middleware
app.use(async (req, res, next) => {
  try {
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                      req.connection?.remoteAddress ||
                      req.socket?.remoteAddress ||
                      'unknown';

    if (ipAddress !== 'unknown') {
      const isBlocked = await BlockedIP.isBlocked(ipAddress);
      if (isBlocked) {
        console.warn(`🚫 Blocked IP attempted access: ${ipAddress}`);
        return res.status(403).json({
          error: 'Access denied',
          message: 'Your IP address has been blocked due to suspicious activity'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error checking IP block status:', error);
    // Don't block on error - allow request to proceed
    next();
  }
});

// ============================================
// SCHEDULED TASKS
// ============================================

// Clean up old audit logs daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  try {
    console.log('🧹 Running audit log cleanup...');
    const deletedCount = await AuditLog.cleanupOldLogs(90); // Keep last 90 days
    console.log(`✅ Cleaned up ${deletedCount} old audit logs`);
  } catch (error) {
    console.error('❌ Error cleaning up audit logs:', error);
  }
});

console.log('⏰ Scheduled task: Daily audit log cleanup at 2 AM');

// Clean up expired IP blocks daily at 3 AM
cron.schedule('0 3 * * *', async () => {
  try {
    console.log('🧹 Running IP block cleanup...');
    const deletedCount = await BlockedIP.cleanupExpired();
    console.log(`✅ Cleaned up ${deletedCount} expired IP blocks`);
  } catch (error) {
    console.error('❌ Error cleaning up IP blocks:', error);
  }
});

console.log('⏰ Scheduled task: Daily IP block cleanup at 3 AM');

/**
 * Send order confirmation email
 * @param {Object} orderData - Order information
 */
async function sendOrderConfirmationEmail(orderData) {
  try {
    const emailHtml = generateOrderConfirmationEmail(orderData);

    const { data, error } = await resend.emails.send({
      from: 'Mark J Peterson Art <onboarding@resend.dev>',
      to: orderData.customerEmail,
      subject: `Order Confirmation - #${orderData._id.toString().slice(-8).toUpperCase()}`,
      html: emailHtml,
    });

    if (error) {
      console.error('❌ Failed to send confirmation email:', error);
      throw error;
    }

    console.log('📧 Confirmation email sent:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Don't throw - we don't want email failures to break order processing
    return null;
  }
}

// Webhook needs raw body
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Payment successful:', session.id);

      // Retrieve full session details with line items
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items', 'line_items.data.price.product', 'customer', 'payment_intent'],
      });

      // Check if this is a booking or product order
      const isBooking = fullSession.metadata?.booking_type === 'appointment';

      if (isBooking) {
        // Handle booking payment
        console.log('📅 Processing booking payment');

        // Check if booking already exists (idempotency)
        const existingBooking = await Booking.findByPaymentIntent(
          typeof fullSession.payment_intent === 'string'
            ? fullSession.payment_intent
            : fullSession.payment_intent?.id
        );

        if (existingBooking) {
          console.log('⚠️  Booking already exists:', existingBooking._id);
          break;
        }

        // Create booking from metadata
        const bookingData = {
          serviceId: fullSession.metadata.service_id,
          staffId: fullSession.metadata.staff_id || null,
          startDateTime: new Date(fullSession.metadata.start_datetime),
          endDateTime: new Date(fullSession.metadata.end_datetime),
          timeZone: fullSession.metadata.timezone,
          duration: parseInt(fullSession.metadata.duration),
          status: 'confirmed', // Payment successful, booking confirmed
          paymentStatus: 'paid',
          paymentIntentId: typeof fullSession.payment_intent === 'string'
            ? fullSession.payment_intent
            : fullSession.payment_intent?.id,
          sessionId: fullSession.id, // Save Stripe session ID for retrieval
          amount: fullSession.amount_total, // Already in cents
          currency: fullSession.currency,
          clientInfo: {
            name: fullSession.metadata.client_name,
            email: fullSession.metadata.client_email,
            phone: fullSession.metadata.client_phone,
            notes: fullSession.metadata.client_notes || ''
          }
        };

        console.log('📅 Booking Data:', JSON.stringify(bookingData, null, 2));

        // Find or create client user
        let client = await User.findByEmail(bookingData.clientInfo.email);
        if (!client) {
          console.log('👤 Creating new client user');
          client = await User.createClient({
            name: bookingData.clientInfo.name,
            email: bookingData.clientInfo.email,
            phone: bookingData.clientInfo.phone
          });
        }

        bookingData.clientId = client._id;

        // Create booking
        const savedBooking = await Booking.create(bookingData);
        console.log('✅ Booking saved to database:', savedBooking._id);

        // Update client booking count
        await User.incrementBookingCount(client._id, 'total');

        // TODO: Send booking confirmation email
        // await sendBookingConfirmationEmail(savedBooking);

        // TODO: Send calendar invite
        // await sendCalendarInvite(savedBooking);

      } else {
        // Handle product order payment
        console.log('📦 Processing product order');

        // Extract order information
        const orderData = {
          sessionId: fullSession.id,
          paymentIntentId: typeof fullSession.payment_intent === 'string'
            ? fullSession.payment_intent
            : fullSession.payment_intent?.id,
          customerId: fullSession.customer,
          customerEmail: fullSession.customer_details?.email,
          customerName: fullSession.customer_details?.name,

          // Shipping information (use shipping address if provided, otherwise use billing address)
          shippingAddress: fullSession.shipping_details?.address || fullSession.customer_details?.address,
          shippingName: fullSession.shipping_details?.name || fullSession.customer_details?.name,

          // Billing information
          billingAddress: fullSession.customer_details?.address,

          // Order details
          items: fullSession.line_items?.data.map(item => ({
            name: item.description,
            quantity: item.quantity,
            price: (item.amount_total / item.quantity) / 100, // Unit price: divide total by quantity, then convert from cents
          })),

          // Totals
          subtotal: fullSession.amount_subtotal / 100,
          total: fullSession.amount_total / 100,
          currency: fullSession.currency,

          // Status
          paymentStatus: fullSession.payment_status,
          status: fullSession.status,

          // Timestamps
          createdAt: new Date(fullSession.created * 1000),
        };

        console.log('📦 Order Data:', JSON.stringify(orderData, null, 2));

        // Check if order already exists (idempotency)
        const existingOrder = await Order.findBySessionId(orderData.sessionId);
        if (existingOrder) {
          console.log('⚠️  Order already exists:', existingOrder._id);
          break;
        }

        // Save order to database
        const savedOrder = await Order.create(orderData);
        console.log('✅ Order saved to database:', savedOrder._id);

        // Update product inventory
        try {
          const lineItems = fullSession.line_items?.data || [];
          console.log(`📦 Processing ${lineItems.length} line items for inventory update`);

          for (let i = 0; i < lineItems.length; i++) {
            const lineItem = lineItems[i];
            const quantity = lineItem.quantity;

            // Try to get product ID from metadata
            let productId = lineItem.price?.product?.metadata?.product_id;
            console.log(`📦 Line item ${i}: ${lineItem.description}, quantity: ${quantity}, productId: ${productId || 'not found'}`);

            // If we have product ID, update directly
            if (productId) {
              const result = await Product.updateStock(productId, -quantity);
              if (result) {
                console.log(`✅ Updated stock for product ${productId}: -${quantity}`);
              } else {
                console.warn(`⚠️  Failed to update stock for product ${productId}`);
              }
            } else {
              // Fallback: search by product name
              const productName = lineItem.description;
              console.log(`🔍 Searching for product by name: "${productName}"`);
              const products = await Product.search(productName);
              const product = products.find(p => p.name === productName);

              if (product) {
                const result = await Product.updateStock(product._id, -quantity);
                if (result) {
                  console.log(`✅ Updated stock for ${product.name}: -${quantity}`);
                } else {
                  console.warn(`⚠️  Failed to update stock for ${product.name}`);
                }
              } else {
                console.warn(`⚠️  Product not found for inventory update: ${productName}`);
              }
            }
          }
          console.log('✅ Inventory update completed');
        } catch (inventoryError) {
          console.error('❌ Error updating inventory:', inventoryError);
          console.error('Stack trace:', inventoryError.stack);
          // Don't fail the order if inventory update fails
        }

        // Send confirmation email
        await sendOrderConfirmationEmail(savedOrder);

        // TODO: Notify admin/warehouse
        // await notifyWarehouse(orderData);
      }

      break;

    case 'checkout.session.expired':
      console.log('⏰ Checkout session expired:', event.data.object.id);
      // Optional: Clean up any temporary cart data
      break;

    case 'payment_intent.succeeded':
      console.log('💳 Payment intent succeeded:', event.data.object.id);
      // Additional confirmation logging if needed
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('❌ Payment failed:', failedPayment.id);
      console.log('Failure reason:', failedPayment.last_payment_error?.message);
      // TODO: Alert customer about failed payment
      break;

    case 'charge.refunded':
      const refund = event.data.object;
      console.log('💰 Refund processed:', refund.id);
      // TODO: Update order status and restore inventory
      break;

    default:
      console.log(`ℹ️  Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

// JSON body parser for other routes (with 1MB size limit to prevent DoS attacks)
app.use(express.json({ limit: '1mb' }));

// Create Checkout Session endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    // Create line items for Stripe Checkout
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          metadata: {
            product_id: item._id || item.id || '', // Store product ID for inventory tracking
          },
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Get the client URL from request origin or env
    const clientUrl = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/cancel`,
      // Collect shipping address
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'SE', 'NO', 'DK', 'FI', 'IE', 'AT', 'CH', 'PT', 'PL', 'CZ', 'GR', 'RO', 'HU'],
      },
      // Require billing address
      billing_address_collection: 'required',
      // Collect customer email
      customer_email: undefined, // User will enter on Stripe checkout page
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      details: error.message
    });
  }
});

// Create Booking Checkout Session endpoint
app.post('/api/create-booking-checkout', async (req, res) => {
  try {
    const {
      serviceId,
      staffId,
      startDateTime,
      endDateTime,
      timeZone,
      duration,
      amount,
      currency,
      clientInfo
    } = req.body;

    // Validate required fields
    if (!serviceId || !startDateTime || !endDateTime || !amount || !clientInfo) {
      return res.status(400).json({ error: 'Missing required booking information' });
    }

    if (!clientInfo.name || !clientInfo.email || !clientInfo.phone) {
      return res.status(400).json({ error: 'Client information is incomplete' });
    }

    // Fetch service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check if the slot is still available
    const slotAvailable = await Booking.isSlotAvailable(
      staffId,
      new Date(startDateTime),
      new Date(endDateTime)
    );

    if (!slotAvailable) {
      return res.status(409).json({
        error: 'Time slot no longer available',
        message: 'This time slot has been booked by another client. Please select a different time.'
      });
    }

    // Get the client URL from request origin or env
    const clientUrl = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency || 'usd',
          product_data: {
            name: service.name,
            description: `${duration} minute appointment`,
            metadata: {
              service_id: serviceId,
              booking_type: 'appointment'
            }
          },
          unit_amount: amount // Amount already in cents
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${clientUrl}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/booking/review`,
      customer_email: clientInfo.email,
      // Store booking data in metadata for webhook processing
      metadata: {
        booking_type: 'appointment',
        service_id: serviceId,
        staff_id: staffId || '',
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        timezone: timeZone || 'America/New_York',
        duration: duration.toString(),
        client_name: clientInfo.name,
        client_email: clientInfo.email,
        client_phone: clientInfo.phone,
        client_notes: clientInfo.notes || ''
      }
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Booking checkout error:', error);
    return res.status(500).json({
      error: 'Failed to create booking checkout session',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Sitemap endpoint - dynamically generate sitemap.xml
app.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Get all active products
    const { products } = await Product.findAll({
      isActive: true,
      limit: 1000,
    });

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Shop page -->
  <url>
    <loc>${baseUrl}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- About page -->
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Legal pages -->
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Product pages -->
`;

    // Add each product
    for (const product of products) {
      const lastmod = product.updatedAt || product.createdAt;
      sitemap += `  <url>
    <loc>${baseUrl}/products/${product._id}</loc>
    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    sitemap += `</urlset>`;

    // Set headers and send
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// ========================================
// Authentication Endpoints
// ========================================

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get request metadata for audit log
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                      req.connection?.remoteAddress ||
                      req.socket?.remoteAddress ||
                      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if account is locked
    const lockStatus = await User.isAccountLocked(email);
    if (lockStatus.isLocked) {
      const minutesRemaining = Math.ceil((lockStatus.lockoutUntil - new Date()) / 1000 / 60);

      // Log account locked attempt
      await AuditLog.create({
        eventType: 'account_locked',
        userId: null,
        ipAddress,
        userAgent,
        success: false,
        metadata: {
          email,
          reason: 'Account temporarily locked due to too many failed login attempts',
          lockoutUntil: lockStatus.lockoutUntil,
          minutesRemaining
        }
      });

      return res.status(403).json({
        error: 'Account temporarily locked',
        message: `Too many failed login attempts. Account is locked for ${minutesRemaining} minutes.`,
        lockoutUntil: lockStatus.lockoutUntil
      });
    }

    // Verify user credentials
    const user = await User.verifyPassword(email, password);

    if (!user) {
      // Increment failed attempts
      const { shouldLock, attempts, lockoutUntil } = await User.incrementFailedAttempts(email);

      // Log failed login attempt
      await AuditLog.create({
        eventType: 'login_failed',
        userId: null,
        ipAddress,
        userAgent,
        success: false,
        metadata: {
          email,
          reason: 'Invalid credentials',
          failedAttempts: attempts,
          remainingAttempts: Math.max(0, 5 - attempts)
        }
      });

      if (shouldLock) {
        // Log account lockout
        await AuditLog.create({
          eventType: 'account_locked',
          userId: null,
          ipAddress,
          userAgent,
          success: false,
          metadata: {
            email,
            reason: 'Account locked due to 5 failed login attempts',
            lockoutUntil,
            failedAttempts: attempts
          }
        });

        return res.status(403).json({
          error: 'Account locked',
          message: 'Too many failed login attempts. Your account has been locked for 15 minutes.',
          lockoutUntil
        });
      }

      const remainingAttempts = 5 - attempts;
      return res.status(401).json({
        error: 'Invalid email or password',
        remainingAttempts,
        message: remainingAttempts > 0 ? `${remainingAttempts} attempts remaining before lockout.` : ''
      });
    }

    // Update last login (this also resets failed attempts to 0)
    await User.updateLastLogin(user._id.toString());

    // Log successful login
    await AuditLog.create({
      eventType: 'login_success',
      userId: user._id.toString(),
      ipAddress,
      userAgent,
      success: true,
      metadata: {
        email: user.email,
        role: user.role
      }
    });

    // Generate JWT token
    const token = generateToken(user._id.toString());

    // Set httpOnly cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({ message: 'Logged out successfully' });
});

// Check authentication status
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
    },
  });
});

// ========================================
// Admin Order Management Endpoints
// ========================================

// Get all orders with pagination and filtering
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const result = await Order.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order by ID
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    let orderId = req.params.id;

    // If the ID starts with ORD- or is 8 chars (short format), convert to MongoDB query
    if (orderId.startsWith('ORD-')) {
      orderId = orderId.substring(4).toLowerCase(); // Remove ORD- prefix and lowercase
    }

    // If it's 8 characters, it's a short ID - find by matching last 8 chars
    let order;
    if (orderId.length === 8) {
      const { orders } = await Order.findAll({ limit: 1000 }); // Get all orders
      order = orders.find(o => o._id.toString().slice(-8).toLowerCase() === orderId.toLowerCase());
    } else {
      // Full MongoDB ID
      order = await Order.findById(orderId);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Transform database fields to frontend-friendly names
    const transformedOrder = {
      ...order,
      sessionId: order.stripeSessionId,
      paymentIntentId: order.stripePaymentIntentId,
      customerId: order.stripeCustomerId,
    };

    res.json(transformedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get order by Stripe session ID (for success page)
app.get('/api/orders/session/:sessionId', async (req, res) => {
  try {
    const order = await Order.findBySessionId(req.params.sessionId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Error fetching order by session ID:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get orders by customer email
app.get('/api/orders/customer/:email', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findByCustomerEmail(req.params.email);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: 'Failed to fetch customer orders' });
  }
});

// Update order status
app.put('/api/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const { orderStatus, fulfillmentStatus } = req.body;

    const updates = {};
    if (orderStatus) updates.orderStatus = orderStatus;
    if (fulfillmentStatus) updates.fulfillmentStatus = fulfillmentStatus;

    const order = await Order.update(req.params.id, updates);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Update order fulfillment and tracking
app.put('/api/orders/:id/fulfillment', authenticateToken, async (req, res) => {
  try {
    const { status, trackingNumber, carrier } = req.body;

    const order = await Order.updateFulfillment(req.params.id, {
      status,
      trackingNumber,
      carrier,
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating fulfillment:', error);
    res.status(500).json({ error: 'Failed to update fulfillment' });
  }
});

// Get order statistics
app.get('/api/orders/stats/summary', authenticateToken, async (req, res) => {
  try {
    const stats = await Order.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Create shipment for an order
app.post('/api/orders/:id/create-shipment', authenticateToken, async (req, res) => {
  try {
    let orderId = req.params.id;

    // Handle short ID format
    if (orderId.startsWith('ORD-')) {
      orderId = orderId.substring(4).toLowerCase();
    }

    // Get order details
    let order;
    if (orderId.length === 8) {
      const { orders } = await Order.findAll({ limit: 1000 });
      order = orders.find(o => o._id.toString().slice(-8).toLowerCase() === orderId.toLowerCase());
    } else {
      order = await Order.findById(orderId);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Use the actual MongoDB ID for updates
    const actualOrderId = order._id.toString();

    // Check if shipment already exists
    if (order.trackingNumber) {
      return res.status(400).json({
        error: 'Shipment already created for this order',
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
      });
    }

    // Create shipment via Shippo
    const shipmentData = await createShipment({
      shippingAddress: order.shippingAddress,
      shippingName: order.shippingName,
      items: order.items,
      orderId: actualOrderId,
    });

    // Update order with tracking information
    const updatedOrder = await Order.update(actualOrderId, {
      trackingNumber: shipmentData.trackingNumber,
      trackingUrlProvider: shipmentData.trackingUrlProvider,
      carrier: shipmentData.carrier,
      shippingLabelUrl: shipmentData.shippingLabelUrl,
      shippoTransactionId: shipmentData.shippoTransactionId,
      fulfillmentStatus: 'fulfilled',
      orderStatus: 'shipped',
      shippedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Shipment created successfully',
      order: updatedOrder,
      shipment: shipmentData,
    });
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({
      error: 'Failed to create shipment',
      message: error.message
    });
  }
});

// Get tracking status for an order
app.get('/api/orders/:id/tracking', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.trackingNumber || !order.carrier) {
      return res.status(400).json({ error: 'No tracking information available' });
    }

    const trackingInfo = await getTrackingStatus(order.trackingNumber, order.carrier);

    res.json({
      order: {
        id: order._id,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        shippedAt: order.shippedAt,
      },
      tracking: trackingInfo,
    });
  } catch (error) {
    console.error('Error fetching tracking:', error);
    res.status(500).json({
      error: 'Failed to fetch tracking status',
      message: error.message
    });
  }
});

// ========================================
// Product Management Endpoints
// ========================================

// Upload product image (admin only)
app.post('/api/products/upload-image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to Cloudinary using upload_stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'products',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ error: 'Failed to upload image' });
        }

        res.json({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    // Pipe the buffer to Cloudinary
    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Get all products (public - for store, with optional admin filtering)
app.get('/api/products', async (req, res) => {
  try {
    const { page = 1, limit = 100, category, status } = req.query;

    // Non-authenticated users only see active products
    const isActive = req.user ? undefined : true;

    const result = await Product.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      status,
      isActive,
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product by ID (public)
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create new product (admin only)
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Validate and sanitize product data
    const validation = validateProductData(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validation.errors });
    }

    const product = await Product.create(validation.sanitized);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (admin only)
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Validate and sanitize product data
    const validation = validateProductData(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validation.errors });
    }

    // If stock is being updated to 0 or less, automatically set status to "Sold Out"
    if (validation.sanitized.stock !== undefined && validation.sanitized.stock <= 0) {
      validation.sanitized.status = 'Sold Out';
    }

    const product = await Product.update(req.params.id, validation.sanitized);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin only - soft delete)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { hard } = req.query;

    let success;
    if (hard === 'true') {
      success = await Product.delete(req.params.id);
    } else {
      success = await Product.softDelete(req.params.id);
    }

    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get product categories (public)
app.get('/api/products/meta/categories', async (req, res) => {
  try {
    const categories = await Product.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Search products (public)
app.get('/api/products/search/:term', async (req, res) => {
  try {
    const products = await Product.search(req.params.term);
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Get product statistics (admin only)
app.get('/api/products/stats/summary', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const stats = await Product.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ============================================
// SERVICE ENDPOINTS (Service Booking System)
// ============================================

// Get all services (public)
app.get('/api/services', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, isActive, staffId } = req.query;

    const result = await Service.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      isActive: isActive !== undefined ? isActive === 'true' : null,
      staffId
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get single service by ID (public)
app.get('/api/services/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// Create new service (admin only)
app.post('/api/services', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Update service (admin only)
app.put('/api/services/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const service = await Service.update(req.params.id, req.body);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete service (admin only)
app.delete('/api/services/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const success = await Service.softDelete(req.params.id);

    if (!success) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Get service categories (public)
app.get('/api/services/meta/categories', async (req, res) => {
  try {
    const categories = await Service.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching service categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Search services (public)
app.get('/api/services/search/:term', async (req, res) => {
  try {
    const services = await Service.search(req.params.term);
    res.json(services);
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({ error: 'Failed to search services' });
  }
});

// Get service statistics (admin only)
app.get('/api/services/stats/summary', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const stats = await Service.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching service stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ============================================
// STAFF ENDPOINTS
// ============================================

// Get all staff (public for active, admin for all)
app.get('/api/staff', async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive, acceptingBookings, serviceId } = req.query;

    const result = await Staff.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      isActive: isActive !== undefined ? isActive === 'true' : null,
      acceptingBookings: acceptingBookings !== undefined ? acceptingBookings === 'true' : null,
      serviceId
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// Get single staff member by ID (public)
app.get('/api/staff/:id', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ error: 'Failed to fetch staff member' });
  }
});

// Create new staff member (admin only)
app.post('/api/staff', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const staff = await Staff.create(req.body);
    res.status(201).json(staff);
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({ error: 'Failed to create staff member' });
  }
});

// Update staff member (admin only)
app.put('/api/staff/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const staff = await Staff.update(req.params.id, req.body);

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json(staff);
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

// Deactivate staff member (admin only)
app.delete('/api/staff/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const staff = await Staff.deactivate(req.params.id);

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({ message: 'Staff member deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating staff member:', error);
    res.status(500).json({ error: 'Failed to deactivate staff member' });
  }
});

// Get staff statistics (admin only)
app.get('/api/staff/stats/summary', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const stats = await Staff.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching staff stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ============================================
// AVAILABILITY ENDPOINTS
// ============================================

// Get availability for a staff member
app.get('/api/availability/staff/:staffId', async (req, res) => {
  try {
    const availability = await Availability.findByStaff(req.params.staffId);

    if (!availability) {
      return res.status(404).json({ error: 'Availability not found for this staff member' });
    }

    res.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Get available time slots for a staff member on a specific date
app.get('/api/availability/slots', async (req, res) => {
  try {
    const { staffId, date, duration, bufferTime = 0 } = req.query;

    if (!staffId || !date || !duration) {
      return res.status(400).json({ error: 'staffId, date, and duration are required' });
    }

    const slots = await Availability.getAvailableSlots(
      staffId,
      new Date(date),
      parseInt(duration),
      parseInt(bufferTime)
    );

    res.json({ slots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

// Create or update availability schedule (admin/staff only)
app.post('/api/availability/staff/:staffId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Check if availability exists
    const existing = await Availability.findByStaff(req.params.staffId);

    let availability;
    if (existing) {
      availability = await Availability.update(existing._id, req.body);
    } else {
      availability = await Availability.create({
        staffId: req.params.staffId,
        ...req.body
      });
    }

    res.json(availability);
  } catch (error) {
    console.error('Error setting availability:', error);
    res.status(500).json({ error: 'Failed to set availability' });
  }
});

// Add exception (time off or special hours)
app.post('/api/availability/:id/exceptions', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const availability = await Availability.addException(req.params.id, req.body);

    if (!availability) {
      return res.status(404).json({ error: 'Availability not found' });
    }

    res.json(availability);
  } catch (error) {
    console.error('Error adding exception:', error);
    res.status(500).json({ error: 'Failed to add exception' });
  }
});

// ============================================
// BOOKING ENDPOINTS
// ============================================

// Get all bookings (filtered by user role)
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, startDate, endDate, staffId, serviceId } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      staffId,
      serviceId
    };

    // If client, only show their bookings
    if (req.user.role === 'client') {
      options.clientId = req.user._id;
    }

    const result = await Booking.findAll(options);
    res.json(result);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get single booking by ID
app.get('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Clients can only view their own bookings
    if (req.user.role === 'client' && booking.clientId.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Forbidden: You can only view your own bookings' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Get booking by Stripe session ID (no auth required - for confirmation page)
app.get('/api/bookings/session/:sessionId', async (req, res) => {
  try {
    const booking = await Booking.findBySessionId(req.params.sessionId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking by session:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Create new booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    // Check if time slot is available
    const isAvailable = await Booking.isSlotAvailable(
      req.body.staffId,
      req.body.startDateTime,
      req.body.endDateTime
    );

    if (!isAvailable) {
      return res.status(400).json({ error: 'This time slot is not available' });
    }

    // Set clientId from authenticated user
    const bookingData = {
      ...req.body,
      clientId: req.user._id,
      clientInfo: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '',
        notes: req.body.clientInfo?.notes || ''
      }
    };

    const booking = await Booking.create(bookingData);

    // Increment user's booking count
    await User.incrementBookingCount(req.user._id, 'total');

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update booking (reschedule)
app.put('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Only admin or the client who made the booking can update it
    if (req.user.role !== 'admin' && booking.clientId.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own bookings' });
    }

    // If rescheduling, check availability
    if (req.body.startDateTime || req.body.endDateTime) {
      const isAvailable = await Booking.isSlotAvailable(
        req.body.staffId || booking.staffId,
        req.body.startDateTime || booking.startDateTime,
        req.body.endDateTime || booking.endDateTime,
        req.params.id // Exclude this booking from conflict check
      );

      if (!isAvailable) {
        return res.status(400).json({ error: 'This time slot is not available' });
      }
    }

    const updatedBooking = await Booking.update(req.params.id, req.body);
    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Cancel booking
app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Only admin or the client who made the booking can cancel it
    if (req.user.role !== 'admin' && booking.clientId.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Forbidden: You can only cancel your own bookings' });
    }

    const cancelledBooking = await Booking.cancel(
      req.params.id,
      req.user._id,
      req.body.reason
    );

    // Increment cancelled count
    await User.incrementBookingCount(booking.clientId.toString(), 'cancelled');

    res.json({ message: 'Booking cancelled successfully', booking: cancelledBooking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Mark booking as completed (staff/admin only)
app.post('/api/bookings/:id/complete', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const completedBooking = await Booking.markAsCompleted(req.params.id);

    // Increment completed count
    await User.incrementBookingCount(booking.clientId.toString(), 'completed');

    res.json({ message: 'Booking marked as completed', booking: completedBooking });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({ error: 'Failed to complete booking' });
  }
});

// Mark booking as no-show (staff/admin only)
app.post('/api/bookings/:id/no-show', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const noShowBooking = await Booking.markAsNoShow(req.params.id);

    // Increment no-show count
    await User.incrementBookingCount(booking.clientId.toString(), 'noShow');

    res.json({ message: 'Booking marked as no-show', booking: noShowBooking });
  } catch (error) {
    console.error('Error marking booking as no-show:', error);
    res.status(500).json({ error: 'Failed to mark booking as no-show' });
  }
});

// Get booking statistics (admin only)
app.get('/api/bookings/stats/summary', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const stats = await Booking.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Shippo webhook endpoint for tracking updates
app.post('/api/shippo-webhook', express.json(), async (req, res) => {
  try {
    console.log('📦 Shippo webhook received:', req.body);

    const event = req.body;

    // Check if this is a tracking status update
    if (event.event === 'track_updated') {
      const trackingNumber = event.data?.tracking_number;
      const trackingStatus = event.data?.tracking_status?.status;

      console.log(`📦 Tracking update: ${trackingNumber} - Status: ${trackingStatus}`);

      if (!trackingNumber) {
        return res.status(400).json({ error: 'No tracking number provided' });
      }

      // Find order by tracking number
      const { orders } = await Order.findAll({ limit: 1000 });
      const order = orders.find(o => o.trackingNumber === trackingNumber);

      if (!order) {
        console.log(`⚠️ No order found with tracking number: ${trackingNumber}`);
        return res.status(404).json({ error: 'Order not found' });
      }

      // Update order status based on tracking status
      if (trackingStatus === 'DELIVERED') {
        const updatedOrder = await Order.findByIdAndUpdate(
          order._id,
          {
            orderStatus: 'delivered',
            deliveredAt: new Date(),
          }
        );

        console.log(`✅ Order ${order._id} marked as delivered`);

        // TODO: Send delivery confirmation email
      } else if (trackingStatus === 'TRANSIT' || trackingStatus === 'IN_TRANSIT') {
        await Order.findByIdAndUpdate(
          order._id,
          { orderStatus: 'in_transit' }
        );
        console.log(`🚚 Order ${order._id} in transit`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Shippo webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get customers list (aggregated from orders)
app.get('/api/customers', authenticateToken, async (req, res) => {
  try {
    const collection = await getCollection('orders');

    // Use MongoDB aggregation to efficiently group all orders by customer
    // Group by both email AND name to handle cases where different people use the same email
    const customers = await collection.aggregate([
      {
        $group: {
          _id: { email: '$customerEmail', name: '$customerName' },
          email: { $first: '$customerEmail' },
          name: { $first: '$customerName' },
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          lastOrderDate: { $max: '$createdAt' },
          firstOrderDate: { $min: '$createdAt' },
        }
      },
      {
        $sort: { lastOrderDate: -1 }
      }
    ]).toArray();

    res.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer details by email and name
app.get('/api/customers/:email/:name', authenticateToken, async (req, res) => {
  try {
    const { email, name } = req.params;
    const collection = await getCollection('orders');

    // Get all orders for this customer
    const orders = await collection.find({
      customerEmail: email,
      customerName: name
    }).sort({ createdAt: -1 }).toArray();

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Calculate customer stats
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const lastOrderDate = orders[0].createdAt;
    const firstOrderDate = orders[orders.length - 1].createdAt;

    // Get most recent shipping address
    const mostRecentOrder = orders[0];
    const mostRecentShippingAddress = mostRecentOrder.shippingAddress;
    const mostRecentShippingName = mostRecentOrder.shippingName;

    res.json({
      name,
      email,
      totalOrders,
      totalSpent,
      lastOrderDate,
      firstOrderDate,
      mostRecentShippingAddress,
      mostRecentShippingName,
      orders
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({ error: 'Failed to fetch customer details' });
  }
});

// Update customer details (email, name, and/or shipping address)
app.put('/api/customers/:email/:name', authenticateToken, async (req, res) => {
  try {
    const { email, name } = req.params;
    const { newName, newEmail, newShippingName, newShippingAddress } = req.body;

    if (!newName || !newEmail) {
      return res.status(400).json({ error: 'New name and email are required' });
    }

    const collection = await getCollection('orders');

    // Build update object
    const updateFields = {
      customerEmail: newEmail,
      customerName: newName
    };

    // Add shipping fields if provided
    if (newShippingName !== undefined) {
      updateFields.shippingName = newShippingName;
    }
    if (newShippingAddress !== undefined) {
      updateFields.shippingAddress = newShippingAddress;
    }

    // Update all orders for this customer
    const result = await collection.updateMany(
      {
        customerEmail: email,
        customerName: name
      },
      {
        $set: updateFields
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({
      message: 'Customer details updated successfully',
      ordersUpdated: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating customer details:', error);
    res.status(500).json({ error: 'Failed to update customer details' });
  }
});

// ============================================
// MESSAGES ENDPOINTS
// ============================================

// POST /api/messages - Submit a contact form message (public)
app.post('/api/messages', contactLimiter, async (req, res) => {
  try {
    // Check for honeypot (bot detection)
    if (isHoneypotFilled(req.body)) {
      console.warn('🤖 Bot detected via honeypot');
      return res.status(400).json({ error: 'Invalid submission' });
    }

    // Validate and sanitize input
    const validation = validateContactForm(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validation.errors });
    }

    const { name, email, subject, message, mailingList } = validation.sanitized;
    const { orderId } = req.body; // orderId is not user-provided, safe to use directly

    const messagesCollection = await getCollection('messages');

    const newMessage = {
      type: orderId ? 'order' : 'contact',
      from: email,
      name,
      subject,
      message,
      status: 'unread',
      orderId: orderId || null,
      mailingList: mailingList || false,
      createdAt: new Date(),
    };

    const result = await messagesCollection.insertOne(newMessage);

    // Send notification email to site owner
    try {
      const { data, error } = await resend.emails.send({
        from: 'Contact Form <onboarding@resend.dev>',
        to: 'tiffany.marie.jensen@gmail.com',
        replyTo: email,
        subject: `New Contact Form: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1f2937; margin-top: 0; border-bottom: 2px solid #c0a679; padding-bottom: 16px;">New Contact Form Submission</h2>

              <div style="margin: 24px 0;">
                <p style="margin: 8px 0;"><strong style="color: #4b5563;">From:</strong> <span style="color: #1f2937;">${name}</span></p>
                <p style="margin: 8px 0;"><strong style="color: #4b5563;">Email:</strong> <a href="mailto:${email}" style="color: #c0a679; text-decoration: none;">${email}</a></p>
                <p style="margin: 8px 0;"><strong style="color: #4b5563;">Subject:</strong> <span style="color: #1f2937;">${subject}</span></p>
              </div>

              <div style="background-color: #f9fafb; border-left: 4px solid #c0a679; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px 0;"><strong style="color: #4b5563;">Message:</strong></p>
                <p style="margin: 0; white-space: pre-wrap; color: #1f2937; line-height: 1.6;">${message}</p>
              </div>

              ${mailingList ? '<div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 12px; margin: 24px 0; border-radius: 4px;"><p style="margin: 0; color: #065f46;"><strong>✓ Customer signed up for mailing list</strong></p></div>' : ''}

              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  You can reply directly to this email to respond to ${name}.
                </p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 24px; color: #6b7280; font-size: 12px;">
              <p style="margin: 0;">Mark J Peterson Art - Contact Form Notification</p>
            </div>
          </div>
        `
      });

      if (error) {
        console.error('❌ Failed to send notification email:', error);
        // Don't fail the request if email fails
      } else {
        console.log('📧 Contact form notification email sent:', data.id);
      }
    } catch (emailError) {
      console.error('❌ Error sending notification email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Message sent successfully',
      id: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/messages - Get all messages (admin only)
app.get('/api/messages', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const messagesCollection = await getCollection('messages');

    const messages = await messagesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// PATCH /api/messages/:id - Update message status (admin only)
app.patch('/api/messages/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['read', 'unread', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const messagesCollection = await getCollection('messages');

    const result = await messagesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message status updated successfully' });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Delete message (admin only)
app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { id } = req.params;
    const messagesCollection = await getCollection('messages');

    const result = await messagesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// GET /api/messages/:id/thread - Get message thread (admin only)
app.get('/api/messages/:id/thread', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const messagesCollection = await getCollection('messages');
    const messageId = new ObjectId(req.params.id);

    // Get the original message
    const originalMessage = await messagesCollection.findOne({ _id: messageId });

    if (!originalMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Get all replies to this message
    const replies = await messagesCollection
      .find({ threadId: messageId })
      .sort({ createdAt: 1 })
      .toArray();

    res.json({ original: originalMessage, replies });
  } catch (error) {
    console.error('Error fetching message thread:', error);
    res.status(500).json({ error: 'Failed to fetch message thread' });
  }
});

// Send email reply (admin only)
app.post('/api/messages/send-email', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { to, subject, message, replyTo, originalMessageId } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, message' });
    }

    const messagesCollection = await getCollection('messages');
    let emailHtml = '';

    // If replying to an existing message, fetch the thread and include it
    if (originalMessageId) {
      const messageId = new ObjectId(originalMessageId);

      // Get the original message
      const originalMessage = await messagesCollection.findOne({ _id: messageId });

      // Get all previous replies
      const previousReplies = await messagesCollection
        .find({ threadId: messageId })
        .sort({ createdAt: 1 })
        .toArray();

      // Build email with thread history
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Current Reply -->
          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
            <p style="margin: 0; white-space: pre-wrap; color: #374151;">${message.replace(/\n/g, '<br>')}</p>
          </div>

          <!-- Reply Instructions -->
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin-bottom: 20px; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #856404;">
              <strong>Please Note:</strong> Do not reply to this email. To continue this conversation, please send your response to <a href="mailto:support@markjpetersonart.com" style="color: #856404; text-decoration: underline;">support@markjpetersonart.com</a>
            </p>
          </div>

          <!-- Thread History -->
          <div style="border-top: 2px solid #e5e5e5; padding-top: 20px;">
            <p style="color: #6b7280; font-size: 12px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Conversation History</p>

            ${previousReplies.map(reply => `
              <div style="background: #f9fafb; border-left: 4px solid #9ca3af; padding: 12px; margin-bottom: 12px; border-radius: 4px;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
                  <strong>Admin</strong> • ${new Date(reply.createdAt).toLocaleString()}
                </p>
                <p style="margin: 0; white-space: pre-wrap; color: #374151; font-size: 14px;">${reply.message.replace(/\n/g, '<br>')}</p>
              </div>
            `).join('')}

            ${originalMessage ? `
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; border-radius: 4px;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
                  <strong>You</strong> • ${new Date(originalMessage.createdAt).toLocaleString()}
                </p>
                <p style="margin: 0; white-space: pre-wrap; color: #374151; font-size: 14px;">${originalMessage.message.replace(/\n/g, '<br>')}</p>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    } else {
      // New message without thread
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p style="white-space: pre-wrap; color: #374151;">${message.replace(/\n/g, '<br>')}</p>

          <!-- Reply Instructions -->
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin-top: 20px; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #856404;">
              <strong>Please Note:</strong> Do not reply to this email. To continue this conversation, please send your response to <a href="mailto:support@markjpetersonart.com" style="color: #856404; text-decoration: underline;">support@markjpetersonart.com</a>
            </p>
          </div>
        </div>
      `;
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [to],
      subject: subject,
      html: emailHtml,
      ...(replyTo && { reply_to: replyTo })
    });

    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    // Save the sent email as a reply in the messages collection
    const replyDoc = {
      type: 'reply',
      from: 'admin',
      to: to,
      subject: subject,
      message: message,
      threadId: originalMessageId ? new ObjectId(originalMessageId) : null,
      status: 'sent',
      createdAt: new Date(),
      emailId: data.id
    };

    await messagesCollection.insertOne(replyDoc);

    res.json({ success: true, emailId: data.id, replyId: replyDoc._id });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Webhook endpoint to receive incoming emails from Resend
app.post('/api/webhooks/email-reply', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = JSON.parse(req.body.toString());

    console.log('Received email webhook:', event.type);

    // Handle incoming email event
    if (event.type === 'email.received') {
      const emailData = event.data;

      // Extract relevant information
      const from = emailData.from;
      const to = emailData.to;
      const subject = emailData.subject || 'No subject';
      const text = emailData.text || emailData.html_body || '';

      // Try to find the original thread by looking for threadId in the email
      // This is a simplified approach - in production you'd want to use email headers
      const messagesCollection = await getCollection('messages');

      // Look for the most recent message to/from this email address
      const recentMessage = await messagesCollection
        .findOne(
          {
            $or: [
              { from: from, to: to },
              { from: to, to: from }
            ]
          },
          { sort: { createdAt: -1 } }
        );

      let threadId = null;
      let originalMessageId = null;

      if (recentMessage) {
        // If this was a reply, use its threadId, otherwise use its _id
        if (recentMessage.threadId) {
          threadId = recentMessage.threadId;
          originalMessageId = recentMessage.threadId;
        } else {
          threadId = recentMessage._id;
          originalMessageId = recentMessage._id;
        }
      }

      // Save the customer's reply as a new message
      const customerReply = {
        type: recentMessage?.type || 'contact',
        from: from,
        email: from,
        subject: subject,
        message: text,
        threadId: threadId,
        status: 'unread',
        createdAt: new Date(),
        source: 'email_reply'
      };

      const result = await messagesCollection.insertOne(customerReply);

      console.log('Saved customer email reply:', result.insertedId);

      res.status(200).json({ received: true, messageId: result.insertedId });
    } else {
      res.status(200).json({ received: true });
    }
  } catch (error) {
    console.error('Error processing email webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// ============================================
// NEWSLETTER ENDPOINTS
// ============================================

// POST /api/newsletter/subscribe - Subscribe to newsletter (public)
app.post('/api/newsletter/subscribe', newsletterLimiter, async (req, res) => {
  try {
    // Check for honeypot (bot detection)
    if (isHoneypotFilled(req.body)) {
      console.warn('🤖 Bot detected via honeypot in newsletter subscription');
      return res.status(400).json({ error: 'Invalid submission' });
    }

    // Validate and sanitize input
    const validation = validateNewsletterSubscription(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validation.errors });
    }

    const { email, source, metadata } = validation.sanitized;

    const subscriber = await Subscriber.create({
      email,
      source: source || 'unknown',
      metadata: metadata || {},
    });

    // Send welcome email
    try {
      const { data, error } = await resend.emails.send({
        from: 'Mark J Peterson Art <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome to Mark J Peterson Art Newsletter',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1f2937; margin-top: 0; border-bottom: 2px solid #c0a679; padding-bottom: 16px;">Welcome to Our Newsletter!</h2>

              <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
                Thank you for subscribing to Mark J Peterson Art newsletter. You'll receive updates about new artwork, exhibitions, and exclusive offers.
              </p>

              <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
                We're excited to share our passion for steampunk art with you!
              </p>

              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  You can <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/unsubscribe?token=${subscriber.unsubscribeToken}" style="color: #c0a679; text-decoration: none;">unsubscribe</a> at any time.
                </p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 24px; color: #6b7280; font-size: 12px;">
              <p style="margin: 0;">Mark J Peterson Art</p>
            </div>
          </div>
        `
      });

      if (error) {
        console.error('❌ Failed to send welcome email:', error);
      } else {
        console.log('📧 Welcome email sent:', data.id);
      }
    } catch (emailError) {
      console.error('❌ Error sending welcome email:', emailError);
    }

    res.status(201).json({
      message: 'Successfully subscribed to newsletter',
      subscriber: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt,
      },
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// GET /api/newsletter/subscribers - Get all subscribers (admin only)
app.get('/api/newsletter/subscribers', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { page = 1, limit = 100, status, source } = req.query;

    const result = await Subscriber.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      source,
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

// GET /api/newsletter/stats - Get subscriber statistics (admin only)
app.get('/api/newsletter/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const stats = await Subscriber.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching subscriber stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// POST /api/newsletter/unsubscribe/:token - Unsubscribe using token (public)
app.post('/api/newsletter/unsubscribe/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const subscriber = await Subscriber.unsubscribe(token, true);

    if (!subscriber) {
      return res.status(404).json({ error: 'Invalid unsubscribe link' });
    }

    res.json({
      message: 'Successfully unsubscribed from newsletter',
      email: subscriber.email,
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// DELETE /api/newsletter/subscribers/:id - Delete subscriber (admin only)
app.delete('/api/newsletter/subscribers/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const success = await Subscriber.delete(req.params.id);

    if (!success) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    res.json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ error: 'Failed to delete subscriber' });
  }
});

// GET /api/newsletter/export - Export active subscriber emails (admin only)
app.get('/api/newsletter/export', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const emails = await Subscriber.getActiveEmails();

    res.json({
      count: emails.length,
      emails: emails,
    });
  } catch (error) {
    console.error('Error exporting emails:', error);
    res.status(500).json({ error: 'Failed to export emails' });
  }
});

// POST /api/newsletter/send - Send newsletter to all active subscribers (admin only)
app.post('/api/newsletter/send', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Validate and sanitize newsletter content
    const validation = validateNewsletterContent(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validation.errors });
    }

    const { subject, message } = validation.sanitized;

    // Get all active subscriber emails
    const emails = await Subscriber.getActiveEmails();

    if (emails.length === 0) {
      return res.status(400).json({ error: 'No active subscribers to send to' });
    }

    console.log(`📧 Sending newsletter to ${emails.length} subscribers...`);

    // Send emails (in production, you'd want to batch these)
    let sent = 0;
    let failed = 0;

    for (const email of emails) {
      try {
        // Get subscriber for unsubscribe token
        const subscriber = await Subscriber.findByEmail(email);

        const { data, error } = await resend.emails.send({
          from: 'Mark J Peterson Art <onboarding@resend.dev>',
          to: email,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
              <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #1f2937; margin-top: 0; border-bottom: 2px solid #c0a679; padding-bottom: 16px;">${subject}</h2>

                <div style="color: #4b5563; line-height: 1.6; margin: 20px 0; white-space: pre-wrap;">
                  ${message.replace(/\n/g, '<br>')}
                </div>

                <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0;">
                    You received this email because you subscribed to Mark J Peterson Art newsletter.
                  </p>
                  <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0 0;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/unsubscribe?token=${subscriber?.unsubscribeToken}" style="color: #c0a679; text-decoration: none;">Unsubscribe</a>
                  </p>
                </div>
              </div>

              <div style="text-align: center; margin-top: 24px; color: #6b7280; font-size: 12px;">
                <p style="margin: 0;">Mark J Peterson Art</p>
              </div>
            </div>
          `
        });

        if (error) {
          console.error(`❌ Failed to send to ${email}:`, error);
          failed++;
        } else {
          console.log(`✓ Sent to ${email}`);
          sent++;
        }
      } catch (emailError) {
        console.error(`❌ Error sending to ${email}:`, emailError);
        failed++;
      }
    }

    console.log(`📧 Newsletter sending complete: ${sent} sent, ${failed} failed`);

    res.json({
      message: 'Newsletter sent',
      sent: sent,
      failed: failed,
      total: emails.length,
    });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    res.status(500).json({ error: 'Failed to send newsletter' });
  }
});

// POST /api/newsletter/drafts - Create a new newsletter draft (admin only)
app.post('/api/newsletter/drafts', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Validate and sanitize newsletter content
    const validation = validateNewsletterContent(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validation.errors });
    }

    const { subject, message } = validation.sanitized;

    const draft = await Newsletter.create({
      subject,
      message,
      status: 'draft',
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: 'Draft saved successfully',
      draft,
    });
  } catch (error) {
    console.error('Error creating draft:', error);
    res.status(500).json({ error: 'Failed to create draft' });
  }
});

// GET /api/newsletter/drafts - Get all newsletter drafts (admin only)
app.get('/api/newsletter/drafts', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { page = 1, limit = 20 } = req.query;

    const result = await Newsletter.findDrafts({
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// GET /api/newsletter/drafts/:id - Get single draft by ID (admin only)
app.get('/api/newsletter/drafts/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const draft = await Newsletter.findById(req.params.id);

    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    if (draft.status !== 'draft') {
      return res.status(400).json({ error: 'This newsletter has already been sent' });
    }

    res.json(draft);
  } catch (error) {
    console.error('Error fetching draft:', error);
    res.status(500).json({ error: 'Failed to fetch draft' });
  }
});

// PUT /api/newsletter/drafts/:id - Update a newsletter draft (admin only)
app.put('/api/newsletter/drafts/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Validate and sanitize newsletter content
    const validation = validateNewsletterContent(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validation.errors });
    }

    const { subject, message } = validation.sanitized;

    const draft = await Newsletter.update(req.params.id, {
      subject,
      message,
    });

    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    res.json({
      message: 'Draft updated successfully',
      draft,
    });
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({ error: 'Failed to update draft' });
  }
});

// DELETE /api/newsletter/drafts/:id - Delete a newsletter draft (admin only)
app.delete('/api/newsletter/drafts/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const success = await Newsletter.delete(req.params.id);

    if (!success) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    res.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ error: 'Failed to delete draft' });
  }
});

// POST /api/newsletter/drafts/:id/send - Send a draft newsletter (admin only)
app.post('/api/newsletter/drafts/:id/send', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Get the draft
    const draft = await Newsletter.findById(req.params.id);

    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    if (draft.status !== 'draft') {
      return res.status(400).json({ error: 'This newsletter has already been sent' });
    }

    // Get all active subscriber emails
    const emails = await Subscriber.getActiveEmails();

    if (emails.length === 0) {
      return res.status(400).json({ error: 'No active subscribers to send to' });
    }

    console.log(`📧 Sending newsletter to ${emails.length} subscribers...`);

    // Send emails
    let sent = 0;
    let failed = 0;

    for (const email of emails) {
      try {
        const subscriber = await Subscriber.findByEmail(email);

        const { data, error } = await resend.emails.send({
          from: 'Mark J Peterson Art <onboarding@resend.dev>',
          to: email,
          subject: draft.subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
              <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #1f2937; margin-top: 0; border-bottom: 2px solid #c0a679; padding-bottom: 16px;">${draft.subject}</h2>

                <div style="color: #4b5563; line-height: 1.6; margin: 20px 0; white-space: pre-wrap;">
                  ${draft.message.replace(/\n/g, '<br>')}
                </div>

                <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0;">
                    You received this email because you subscribed to Mark J Peterson Art newsletter.
                  </p>
                  <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0 0;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/unsubscribe?token=${subscriber?.unsubscribeToken}" style="color: #c0a679; text-decoration: none;">Unsubscribe</a>
                  </p>
                </div>
              </div>

              <div style="text-align: center; margin-top: 24px; color: #6b7280; font-size: 12px;">
                <p style="margin: 0;">Mark J Peterson Art</p>
              </div>
            </div>
          `
        });

        if (error) {
          console.error(`❌ Failed to send to ${email}:`, error);
          failed++;
        } else {
          console.log(`✓ Sent to ${email}`);
          sent++;
        }
      } catch (emailError) {
        console.error(`❌ Error sending to ${email}:`, emailError);
        failed++;
      }
    }

    console.log(`📧 Newsletter sending complete: ${sent} sent, ${failed} failed`);

    // Mark draft as sent
    await Newsletter.markAsSent(req.params.id, sent);

    res.json({
      message: 'Newsletter sent successfully',
      sent: sent,
      failed: failed,
      total: emails.length,
    });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    res.status(500).json({ error: 'Failed to send newsletter' });
  }
});

// GET /api/newsletter/sent - Get all sent newsletters (admin only)
app.get('/api/newsletter/sent', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { page = 1, limit = 20 } = req.query;

    const result = await Newsletter.findSent({
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching sent newsletters:', error);
    res.status(500).json({ error: 'Failed to fetch sent newsletters' });
  }
});

// GET /api/newsletter/sent/:id - Get single sent newsletter by ID (admin only)
app.get('/api/newsletter/sent/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const newsletter = await Newsletter.findById(req.params.id);

    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    if (newsletter.status !== 'sent') {
      return res.status(400).json({ error: 'This newsletter has not been sent yet' });
    }

    res.json(newsletter);
  } catch (error) {
    console.error('Error fetching sent newsletter:', error);
    res.status(500).json({ error: 'Failed to fetch sent newsletter' });
  }
});

// GET /api/newsletter/stats/summary - Get newsletter statistics (admin only)
app.get('/api/newsletter/stats/summary', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const stats = await Newsletter.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ============================================
// AUDIT LOG / SECURITY ENDPOINTS
// ============================================

// GET /api/audit-logs/stats - Get audit log statistics (admin only)
app.get('/api/audit-logs/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { startDate, endDate } = req.query;

    const options = {};
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);

    const stats = await AuditLog.getStats(options);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching audit log stats:', error);
    res.status(500).json({ error: 'Failed to fetch audit log statistics' });
  }
});

// GET /api/audit-logs - Get audit logs with filtering (admin only)
app.get('/api/audit-logs', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { eventType, ipAddress, userId, limit = 100, startDate, endDate } = req.query;

    const options = {
      limit: parseInt(limit)
    };
    if (eventType) options.eventType = eventType;
    if (ipAddress) options.ipAddress = ipAddress;
    if (userId) options.userId = userId;
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);

    const logs = await AuditLog.find(options);
    res.json({ logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// GET /api/audit-logs/security-events - Get recent security events (admin only)
app.get('/api/audit-logs/security-events', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { limit = 15, startDate, endDate } = req.query;

    const options = {
      limit: parseInt(limit)
    };
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);

    const events = await AuditLog.getRecentSecurityEvents(options);
    res.json({ events });
  } catch (error) {
    console.error('Error fetching security events:', error);
    res.status(500).json({ error: 'Failed to fetch security events' });
  }
});

// ============================================
// IP BLOCKING ENDPOINTS
// ============================================

// GET /api/blocked-ips - Get all blocked IPs (admin only)
app.get('/api/blocked-ips', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { limit = 100, includeExpired = false } = req.query;

    const blocks = await BlockedIP.getAll({
      limit: parseInt(limit),
      includeExpired: includeExpired === 'true'
    });

    res.json({ blocks });
  } catch (error) {
    console.error('Error fetching blocked IPs:', error);
    res.status(500).json({ error: 'Failed to fetch blocked IPs' });
  }
});

// POST /api/blocked-ips - Block an IP address (admin only)
app.post('/api/blocked-ips', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { ipAddress, reason, expiresAt } = req.body;

    if (!ipAddress) {
      return res.status(400).json({ error: 'IP address is required' });
    }

    const block = await BlockedIP.create({
      ipAddress,
      reason: reason || 'Blocked by admin',
      blockedBy: req.user._id,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    res.status(201).json({
      message: 'IP address blocked successfully',
      block
    });
  } catch (error) {
    if (error.message === 'IP address is already blocked') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error blocking IP:', error);
    res.status(500).json({ error: 'Failed to block IP address' });
  }
});

// DELETE /api/blocked-ips/:id - Unblock an IP address (admin only)
app.delete('/api/blocked-ips/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const success = await BlockedIP.unblock(req.params.id);

    if (!success) {
      return res.status(404).json({ error: 'Blocked IP not found' });
    }

    res.json({ message: 'IP address unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking IP:', error);
    res.status(500).json({ error: 'Failed to unblock IP address' });
  }
});

// GET /api/blocked-ips/stats - Get blocking statistics (admin only)
app.get('/api/blocked-ips/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const stats = await BlockedIP.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching IP blocking stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ============================================
// ERROR SANITIZATION MIDDLEWARE
// ============================================

// Global error handler - sanitizes errors in production
app.use((err, req, res, next) => {
  // Log full error details server-side for debugging
  console.error('❌ Server Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Determine if this is a development or production environment
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // In production, sanitize error messages to prevent information leakage
  if (!isDevelopment) {
    // Generic error response for production
    const sanitizedError = {
      error: 'An error occurred while processing your request',
      message: 'Please try again later or contact support if the problem persists',
      timestamp: new Date().toISOString(),
    };

    // For known error types, provide more specific (but still safe) messages
    if (err.name === 'ValidationError') {
      sanitizedError.error = 'Validation failed';
      sanitizedError.message = 'Please check your input and try again';
    } else if (err.name === 'UnauthorizedError' || err.status === 401) {
      sanitizedError.error = 'Authentication failed';
      sanitizedError.message = 'Please log in and try again';
    } else if (err.name === 'ForbiddenError' || err.status === 403) {
      sanitizedError.error = 'Access denied';
      sanitizedError.message = 'You do not have permission to perform this action';
    } else if (err.status === 404) {
      sanitizedError.error = 'Not found';
      sanitizedError.message = 'The requested resource was not found';
    } else if (err.name === 'CsrfError') {
      sanitizedError.error = 'Invalid request';
      sanitizedError.message = 'Security validation failed. Please refresh the page and try again';
    }

    return res.status(err.status || 500).json(sanitizedError);
  }

  // In development, return detailed error information
  res.status(err.status || 500).json({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// ============================================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`💳 Stripe integration active`);
  console.log(`🌐 Accepting requests from: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('🔒 Production security features enabled: HTTPS, HSTS, CSRF, CORS');
  } else {
    console.log('🔓 Development mode: Enhanced error messages enabled');
  }
});
