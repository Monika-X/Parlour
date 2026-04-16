const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/db');

// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = async (req, res, next) => {
  try {
    const { service_id } = req.body;

    if (!service_id) {
      return res.status(400).json({ success: false, message: 'service_id is required' });
    }

    // Fetch the correct price from database to prevent client tampering
    const [services] = await pool.query('SELECT price, name FROM services WHERE id = ?', [service_id]);
    
    if (services.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const { price, name } = services[0];
    
    // Stripe expects amount in the smallest currency unit (e.g., paise for INR or cents for USD)
    // Assuming INR as per 'en-IN' locale used earlier
    const amountInPaise = Math.round(Number(price) * 100);

    // If Stripe keys are placeholders, return a mocked successful response
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      console.warn("⚠️ Using Mock Stripe Payment Intent (No real keys configured)");
      return res.status(200).json({
        success: true,
        clientSecret: 'mock_client_secret_for_ui_testing',
        mock: true,
        amount: amountInPaise,
        currency: 'inr'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: 'inr',
      description: `Parlour Appointment: ${name}`,
      metadata: {
        customer_id: req.user.id,
        service_id: service_id
      }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (err) {
    console.error('Payment Intent Error:', err);
    res.status(500).json({ success: false, message: 'Unable to initialize payment' });
  }
};

module.exports = {
  createPaymentIntent
};
