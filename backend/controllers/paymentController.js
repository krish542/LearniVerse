const stripe = require('../config/stripe');
const Cart = require('../models/Cart');
const Student = require('../models/Student');
const Course = require('../models/Course');

exports.createCheckoutSession = async (req, res) => {
  try {
    const { cartId } = req.body;
    
    // Get the cart with populated courses
    const cart = await Cart.findById(cartId)
                          .populate('courses.course', 'title price');
    
    if (!cart || cart.student.toString() !== req.student.id) {
      return res.status(403).json({ error: 'Unauthorized access to cart' });
    }

    if (cart.courses.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Create line items for Stripe
    const line_items = cart.courses.map(item => ({
      price_data: {
        currency: 'inr',
        product_data: { 
          name: item.course.title 
        },
        unit_amount: Math.round(item.course.price * 100), // Convert to paise
      },
      quantity: 1,
    }));

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment-cancel`,
      customer_email: req.student.email,
      metadata: {
        studentId: req.student.id,
        cartId: cart._id.toString()
      }
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ 
      error: error.message || 'Something went wrong during checkout' 
    });
  }
};

// Webhook handler for Stripe events
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      // Get the cart and student
      const cart = await Cart.findById(session.metadata.cartId)
                            .populate('courses.course');
      
      if (!cart) {
        console.error('Cart not found:', session.metadata.cartId);
        return res.status(404).json({ error: 'Cart not found' });
      }

      const student = await Student.findById(session.metadata.studentId);
      if (!student) {
        console.error('Student not found:', session.metadata.studentId);
        return res.status(404).json({ error: 'Student not found' });
      }

      // Add courses to student's enrolledCourses
      const courseIds = cart.courses.map(item => item.course._id);
      student.enrolledCourses = [...new Set([...student.enrolledCourses, ...courseIds])];
      
      // Clear the cart
      cart.courses = [];
      
      // Save both
      await Promise.all([student.save(), cart.save()]);
      
      console.log(`Successfully processed payment for student ${student._id}`);
    } catch (err) {
      console.error('Error processing payment:', err);
      return res.status(500).json({ error: 'Error processing payment' });
    }
  }

  res.json({ received: true });
};
exports.verifyPayment = async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items.data.price.product']
    });

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    if (session.metadata.studentId !== req.student.id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Format response
    const response = {
      id: session.id,
      amountTotal: session.amount_total,
      courses: session.line_items.data.map(item => ({
        title: item.price.product.name,
        price: item.price.unit_amount / 100
      }))
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Error verifying payment' });
  }
};