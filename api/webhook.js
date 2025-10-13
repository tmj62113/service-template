// Stripe Webhook handler for processing payment events
// This endpoint receives events from Stripe and processes them
// IMPORTANT: Must be deployed to your backend server

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful:', session.id);

      // TODO: Fulfill the order
      // - Save order to database
      // - Send confirmation email
      // - Update inventory
      // - etc.

      break;

    case 'checkout.session.expired':
      console.log('Checkout session expired:', event.data.object.id);
      break;

    case 'payment_intent.succeeded':
      console.log('Payment intent succeeded:', event.data.object.id);
      break;

    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
}

// For Express.js, disable body parsing for webhook route
export const config = {
  api: {
    bodyParser: false,
  },
};
