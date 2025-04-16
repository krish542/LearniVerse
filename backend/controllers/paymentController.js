const stripe = require('../config/stripe');
const Course = require('../models/Course'); // assuming you have this model

exports.createCheckoutSession = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;
    const course = await Course.findById(courseId);
    if (!course || !course.isMonetized) {
      return res.status(400).json({ error: 'Invalid or non-monetized course' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.title,
          },
          unit_amount: course.price * 100, // Stripe takes amount in cents
        },
        quantity: 1,
      }],
      success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment-success?courseId=${courseId}&studentId=${studentId}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment-cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
