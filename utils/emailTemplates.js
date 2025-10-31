/**
 * Email template for booking confirmation
 * @param {Object} bookingData - Booking information including service, client, staff, and appointment details
 * @returns {string} HTML email content
 */
export function generateBookingConfirmationEmail(bookingData) {
  const {
    _id,
    serviceId,
    staffId,
    startDateTime,
    endDateTime,
    duration,
    clientInfo,
    amount,
    currency,
    status,
    createdAt,
  } = bookingData;

  const bookingNumber = _id ? _id.toString().slice(-8).toUpperCase() : 'N/A';
  const bookingDate = new Date(createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const appointmentDate = new Date(startDateTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const appointmentTime = new Date(startDateTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const appointmentEndTime = new Date(endDateTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount / 100); // Amount is stored in cents
  };

  const serviceName = serviceId?.name || 'Service';
  const staffName = staffId?.name || 'Service Provider';
  const clientName = clientInfo?.name || 'Valued Client';
  const clientEmail = clientInfo?.email || '';
  const clientPhone = clientInfo?.phone || '';
  const clientNotes = clientInfo?.notes || '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background-color: #E9E9E9; border-radius: 8px 8px 0 0;">
              <h1 style="color: #1a1a1a; margin: 0; font-size: 28px;">Booking Confirmed!</h1>
              <p style="color: #6b7280; margin: 10px 0 0; font-size: 16px;">Your appointment has been scheduled</p>
            </td>
          </tr>

          <!-- Booking Info -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="color: #111827; font-size: 16px; margin: 0 0 10px;">Hi ${clientName},</p>
              <p style="color: #6b7280; font-size: 16px; margin: 0 0 20px; line-height: 1.6;">
                Your appointment has been confirmed. We're looking forward to seeing you!
              </p>

              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Booking Number</p>
                <p style="margin: 5px 0 0; color: #111827; font-size: 20px; font-weight: 700;">#${bookingNumber}</p>
                <p style="margin: 10px 0 0; color: #6b7280; font-size: 14px;">Booked on ${bookingDate}</p>
              </div>

              <!-- Appointment Details -->
              <h2 style="color: #111827; font-size: 20px; margin: 0 0 20px;">Appointment Details</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                    <strong style="color: #111827;">Service</strong>
                  </td>
                  <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827;">
                    ${serviceName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                    <strong style="color: #111827;">Service Provider</strong>
                  </td>
                  <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827;">
                    ${staffName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                    <strong style="color: #111827;">Date</strong>
                  </td>
                  <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827;">
                    ${appointmentDate}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                    <strong style="color: #111827;">Time</strong>
                  </td>
                  <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827;">
                    ${appointmentTime} - ${appointmentEndTime}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                    <strong style="color: #111827;">Duration</strong>
                  </td>
                  <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827;">
                    ${duration} minutes
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f9fafb; text-align: right; font-size: 18px; font-weight: 700; color: #111827;">
                    Total Paid:
                  </td>
                  <td style="padding: 15px; background-color: #f9fafb; text-align: right; font-size: 18px; font-weight: 700; color: #1a1a1a;">
                    ${formatCurrency(amount)}
                  </td>
                </tr>
              </table>

              ${clientNotes ? `
              <!-- Client Notes -->
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">Your Notes:</p>
                <p style="margin: 5px 0 0; color: #92400e; font-size: 14px; line-height: 1.6;">${clientNotes}</p>
              </div>
              ` : ''}

              <!-- What to Expect -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: 600;">What to Expect</p>
                <p style="margin: 10px 0 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  Please arrive 5-10 minutes before your scheduled appointment time. If you need to reschedule or cancel,
                  please contact us at least 24 hours in advance.
                </p>
              </div>

              <!-- Support -->
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px; line-height: 1.6;">
                  Questions about your appointment? Contact us at
                  <a href="mailto:support@markjpetersonart.com" style="color: #1a1a1a; text-decoration: none;">support@markjpetersonart.com</a>
                </p>
                <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.6;">
                  Need to reschedule? Log in to your account or reply to this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                &copy; ${new Date().getFullYear()} Your Service. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Email template for 24-hour booking reminder
 * @param {Object} booking - Booking information
 * @param {Object} service - Service details
 * @param {Object} staff - Staff member details
 * @returns {string} HTML email content
 */
export function generateBookingReminder24h(booking, service, staff) {
  const appointmentDate = new Date(booking.startDateTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: booking.timeZone || 'America/New_York'
  });

  const appointmentTime = new Date(booking.startDateTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: booking.timeZone || 'America/New_York'
  });

  const clientName = booking.clientInfo?.name || 'Valued Client';
  const serviceName = service?.name || 'Your Appointment';
  const staffName = staff?.name || 'Our Team';
  const duration = booking.duration || service?.duration || 60;
  const bookingId = booking._id?.toString() || '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reminder: Your appointment tomorrow</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background-color: #dbeafe; border-radius: 8px 8px 0 0;">
              <h1 style="color: #1e40af; margin: 0; font-size: 28px;">📅 Appointment Reminder</h1>
              <p style="color: #1e3a8a; margin: 10px 0 0; font-size: 16px;">Tomorrow at ${appointmentTime}</p>
            </td>
          </tr>

          <!-- Reminder Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="color: #111827; font-size: 16px; margin: 0 0 10px;">Hi ${clientName},</p>
              <p style="color: #6b7280; font-size: 16px; margin: 0 0 30px; line-height: 1.6;">
                This is a friendly reminder about your upcoming appointment tomorrow.
              </p>

              <!-- Appointment Details -->
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h2 style="color: #111827; font-size: 18px; margin: 0 0 15px;">Appointment Details</h2>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
                      ${serviceName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date & Time:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
                      ${appointmentDate}<br>${appointmentTime}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Duration:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
                      ${duration} minutes
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">With:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
                      ${staffName}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Reminder Note -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  <strong>Please note:</strong> We ask that you arrive 5-10 minutes early for your appointment.
                  If you need to reschedule or cancel, please let us know as soon as possible.
                </p>
              </div>

              <!-- Action Buttons -->
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px;">Need to make changes?</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/bookings/${bookingId}"
                   style="display: inline-block; padding: 12px 24px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                  Manage Booking
                </a>
              </div>

              <!-- Support -->
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Questions? Contact us at
                  <a href="mailto:support@example.com" style="color: #1a1a1a; text-decoration: none;">support@example.com</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                We look forward to seeing you soon!
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Email template for 1-hour booking reminder
 * @param {Object} booking - Booking information
 * @param {Object} service - Service details
 * @param {Object} staff - Staff member details
 * @returns {string} HTML email content
 */
export function generateBookingReminder1h(booking, service, staff) {
  const appointmentTime = new Date(booking.startDateTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: booking.timeZone || 'America/New_York'
  });

  const clientName = booking.clientInfo?.name || 'Valued Client';
  const serviceName = service?.name || 'Your Appointment';
  const staffName = staff?.name || 'Our Team';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your appointment is in 1 hour</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background-color: #fef3c7; border-radius: 8px 8px 0 0;">
              <h1 style="color: #92400e; margin: 0; font-size: 28px;">⏰ Starting Soon!</h1>
              <p style="color: #b45309; margin: 10px 0 0; font-size: 16px;">Your appointment is in about 1 hour</p>
            </td>
          </tr>

          <!-- Reminder Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="color: #111827; font-size: 16px; margin: 0 0 10px;">Hi ${clientName},</p>
              <p style="color: #6b7280; font-size: 16px; margin: 0 0 30px; line-height: 1.6;">
                Your appointment is coming up soon!
              </p>

              <!-- Quick Details -->
              <div style="background-color: #fef3c7; padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
                <p style="color: #92400e; font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">
                  <strong>Starting at</strong>
                </p>
                <p style="color: #78350f; font-size: 32px; font-weight: 700; margin: 0 0 15px;">
                  ${appointmentTime}
                </p>
                <p style="color: #92400e; font-size: 16px; margin: 0;">
                  <strong>${serviceName}</strong>
                </p>
                <p style="color: #b45309; font-size: 14px; margin: 5px 0 0;">
                  with ${staffName}
                </p>
              </div>

              <!-- Reminder -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  Please arrive a few minutes early. We look forward to seeing you!
                </p>
              </div>

              <!-- Support -->
              <div style="text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Questions? Call us at <strong style="color: #111827;">(555) 123-4567</strong>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                See you soon!
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * [LEGACY E-COMMERCE - DEPRECATED]
 * Email template for order confirmation
 * @deprecated Use generateBookingConfirmationEmail instead
 * @param {Object} orderData - Order information
 * @returns {string} HTML email content
 */
export function generateOrderConfirmationEmail(orderData) {
  const {
    _id,
    customerName,
    customerEmail,
    items,
    subtotal,
    total,
    currency,
    shippingAddress,
    billingAddress,
    createdAt,
  } = orderData;

  const orderNumber = _id ? _id.toString().slice(-8).toUpperCase() : 'N/A';
  const orderDate = new Date(createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
          <strong style="color: #111827;">${item.name}</strong><br>
          <span style="color: #6b7280; font-size: 14px;">Quantity: ${item.quantity}</span>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827; font-weight: 600;">
          ${formatCurrency(item.price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join('');

  const shippingAddressHtml = shippingAddress
    ? `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #111827; font-size: 16px; margin-bottom: 8px;">Shipping Address</h3>
      <p style="color: #6b7280; margin: 0; line-height: 1.6;">
        ${shippingAddress.line1}<br>
        ${shippingAddress.line2 ? `${shippingAddress.line2}<br>` : ''}
        ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}<br>
        ${shippingAddress.country}
      </p>
    </div>
  `
    : '';

  const billingAddressHtml = billingAddress
    ? `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #111827; font-size: 16px; margin-bottom: 8px;">Billing Address</h3>
      <p style="color: #6b7280; margin: 0; line-height: 1.6;">
        ${billingAddress.line1}<br>
        ${billingAddress.line2 ? `${billingAddress.line2}<br>` : ''}
        ${billingAddress.city}, ${billingAddress.state} ${billingAddress.postal_code}<br>
        ${billingAddress.country}
      </p>
    </div>
  `
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background-color: #E9E9E9; border-radius: 8px 8px 0 0;">
              <h1 style="color: #1a1a1a; margin: 0; font-size: 28px;">Order Confirmed!</h1>
              <p style="color: #6b7280; margin: 10px 0 0; font-size: 16px;">Thank you for your purchase</p>
            </td>
          </tr>

          <!-- Order Info -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="color: #111827; font-size: 16px; margin: 0 0 10px;">Hi ${customerName},</p>
              <p style="color: #6b7280; font-size: 16px; margin: 0 0 20px; line-height: 1.6;">
                Your order has been confirmed and will be shipped soon. We'll send you another email when your order ships.
              </p>

              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Order Number</p>
                <p style="margin: 5px 0 0; color: #111827; font-size: 20px; font-weight: 700;">#${orderNumber}</p>
                <p style="margin: 10px 0 0; color: #6b7280; font-size: 14px;">${orderDate}</p>
              </div>

              <!-- Order Items -->
              <h2 style="color: #111827; font-size: 20px; margin: 0 0 20px;">Order Details</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                ${itemsHtml}
                <tr>
                  <td style="padding: 15px; background-color: #f9fafb; text-align: right; font-weight: 600; color: #111827;">
                    Subtotal:
                  </td>
                  <td style="padding: 15px; background-color: #f9fafb; text-align: right; font-weight: 600; color: #111827;">
                    ${formatCurrency(subtotal)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f9fafb; text-align: right; font-size: 18px; font-weight: 700; color: #111827;">
                    Total:
                  </td>
                  <td style="padding: 15px; background-color: #f9fafb; text-align: right; font-size: 18px; font-weight: 700; color: #1a1a1a;">
                    ${formatCurrency(total)}
                  </td>
                </tr>
              </table>

              <!-- Addresses -->
              <div style="margin-top: 30px;">
                ${shippingAddressHtml}
                ${billingAddressHtml}
              </div>

              <!-- Support -->
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.6;">
                  Questions about your order? Contact us at
                  <a href="mailto:support@markjpetersonart.com" style="color: #1a1a1a; text-decoration: none;">support@markjpetersonart.com</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                &copy; ${new Date().getFullYear()} Your Store. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
