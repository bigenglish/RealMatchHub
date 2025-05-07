import express from 'express';
import { createPaymentIntent } from '../stripe-service';

const router = express.Router();

// Create a payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, planId, userId, email } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Create metadata for the payment intent
    const metadata = {
      planId: planId || '',
      userId: userId || '',
      email: email || ''
    };

    const paymentIntent = await createPaymentIntent(amount, metadata);
    
    res.json({
      clientSecret: paymentIntent.clientSecret,
      planId: planId
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: error.message || 'An error occurred while processing payment' 
    });
  }
});

export default router;