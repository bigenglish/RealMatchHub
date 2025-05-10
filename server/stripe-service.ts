import Stripe from 'stripe';

// Initialize Stripe
const stripeApiKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeApiKey ? new Stripe(stripeApiKey, { apiVersion: '2025-03-31.basil', typescript: true }) : null;

// Function to create a payment intent
export async function createPaymentIntent(amount: number, metadata?: object) {
  if (!stripe) {
    throw new Error('Stripe API key is not configured');
  }

  if (!amount || amount <= 0) {
    throw new Error('Valid amount is required');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: metadata || {}
    });

    return {
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

// Function to retrieve a payment intent
export async function retrievePaymentIntent(paymentIntentId: string) {
  if (!stripe) {
    throw new Error('Stripe API key is not configured');
  }

  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
}

// Function to update a payment intent
export async function updatePaymentIntent(paymentIntentId: string, updateData: Stripe.PaymentIntentUpdateParams) {
  if (!stripe) {
    throw new Error('Stripe API key is not configured');
  }

  try {
    return await stripe.paymentIntents.update(paymentIntentId, updateData);
  } catch (error) {
    console.error('Error updating payment intent:', error);
    throw error;
  }
}

// Function to handle Stripe webhook events
export async function handleWebhookEvent(rawBody: string, signature: string) {
  if (!stripe) {
    throw new Error('Stripe API key is not configured');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Stripe webhook secret is not configured');
  }

  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        break;
      case 'payment_intent.payment_failed':
        // Handle failed payment
        break;
      // Add more event types as needed
    }

    return { received: true, event };
  } catch (error) {
    console.error('Error handling webhook event:', error);
    throw error;
  }
}

export default {
  createPaymentIntent,
  retrievePaymentIntent,
  updatePaymentIntent,
  handleWebhookEvent
};