/**
 * Email template for order confirmation
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
