const stripe = require('../config/stripe');
const Cart = require('../models/Cart');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment'); // Import Enrollment model
const mongoose = require('mongoose'); 
exports.createCheckoutSession = async (req, res) => {
    try {
        const { cartId } = req.body; // Receive totalAmount

        // Get the cart with populated courses
        const cart = await Cart.findById(cartId)
            .populate('items.course', 'title price'); // Populate items.course

        if (!cart || cart.student.toString() !== req.student.id) {
            return res.status(403).json({ error: 'Unauthorized access to cart' });
        }
        const checkoutItems = cart.items.filter(item => !item.isWishlisted);
        
        if (checkoutItems.length === 0) {
            return res.status(400).json({ error: 'No items available for checkout' });
        }
        const cartItems = cart.items.filter(item => !item.isWishlisted);
        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Create line items for Stripe
        const line_items = checkoutItems.map(item => ({
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
            //amount_total: Math.round(totalAmount * 100), // Set the total amount
            currency: 'inr',
            metadata: {
                studentId: req.student.id,
                cartId: cart._id.toString(),
                courseIds: checkoutItems.map(item => item.course._id.toString()).join(',') // Store course IDs
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
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
      const event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log('🔔 Raw Webhook Event:', event);
      if (event.type !== 'checkout.session.completed') {
          return res.status(200).json({ received: true });
      }

      const session = event.data.object;
      console.log('🔔 Webhook metadata:', session.metadata);

      // Validate metadata exists and has correct format
      if (!session.metadata ||
          typeof session.metadata.studentId !== 'string' ||
          typeof session.metadata.courseIds !== 'string' ||
          typeof session.metadata.cartId !== 'string') {
          console.error('❌ Invalid metadata format:', session.metadata);
          return res.status(400).json({ error: 'Invalid metadata format' });
      }

      const { studentId, courseIds, cartId } = session.metadata;
      const courseIdsArray = courseIds.split(',').filter(Boolean);

      if (!courseIdsArray.length) {
          console.error('❌ No valid course IDs found');
          return res.status(400).json({ error: 'No course IDs provided' });
      }

      // Process in transaction
      const dbSession = await mongoose.startSession();
      try {
          await dbSession.withTransaction(async () => {
              // 1. Create Enrollments
              for (const courseId of courseIdsArray) {
                  console.log(`Processing enrollment for student: ${studentId}, course: ${courseId}`);
                  const exists = await Enrollment.exists({ studentId, courseId }).session(dbSession);
                  console.log(`Enrollment exists: ${exists}`);
                  if (!exists) {
                      const newEnrollment = new Enrollment({ studentId, courseId });
                      const savedEnrollment = await newEnrollment.save({ session: dbSession });
                      console.log('Enrollment saved:', savedEnrollment);
                      // Optionally update the Student model to include enrolled courses (you have this in your commented-out code)
                      const updatedStudent = await Student.findByIdAndUpdate(
                          studentId,
                          { $addToSet: { enrolledCourses: courseId } },
                          { session: dbSession, new: true }
                      );
                      console.log('Student updated with enrollment:', updatedStudent);
                  }
              }

              // 2. Clear the Cart
              if (cartId) {
                  console.log('Clearing cart with ID:', cartId);
                  const updatedCart = await Cart.findByIdAndUpdate(
                      cartId,
                      { $set: { items: [] } },
                      { session: dbSession, new: true }
                  );
                  console.log('Cart cleared:', updatedCart);
              }
          });

          console.log('✅ Successfully processed enrollment and cleared cart for student:', studentId);
          return res.status(200).json({ success: true });

      } catch (error) {
          console.error('❌ Transaction failed:', error);
          return res.status(500).json({ error: 'Processing failed' });
      } finally {
          dbSession.endSession();
      }

  } catch (err) {
      console.error('⚠️ Webhook error:', err.message);
      return res.status(400).json({ error: err.message });
  }
};


exports.verifyPayment = async (req, res) => {
    const { sessionId } = req.params;
    console.log('--- verifyPayment called ---');
    console.log('Session ID:', sessionId);

    if (!sessionId) {
        console.error('Session ID is missing in the query.');
        return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
        console.log('Attempting to retrieve Stripe session...');
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items.data.price.product']
        });
        //console.log('Stripe session retrieved:', session);

        if (session.payment_status !== 'paid') {
            console.log('Payment status:', session.payment_status);
            return res.status(400).json({ error: 'Payment not completed' });
        }
        console.log('Payment status is PAID.');

        //console.log('Session metadata studentId:', session.metadata.studentId);
        //console.log('Request student ID:', req.student.id);
        if (session.metadata.studentId !== req.student.id) {
            console.error('Unauthorized access: Student ID mismatch.');
            return res.status(403).json({ error: 'Unauthorized access' });
        }
        console.log('Student IDs match.');

        const response = {
            id: session.id,
            amountTotal: session.amount_total / 100,
            courses: session.line_items.data.map(item => ({
                title: item.price.product.name,
                price: item.price.unit_amount / 100
            }))
        };
        console.log('Payment verification successful. Response:', response);
        res.status(200).json(response);

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Error verifying payment' });
    }
};
// In paymentController.js
exports.confirmPayment = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const studentId = req.student.id;

        // 1. Verify the session
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items.data.price.product']
        });

        // 2. Verify payment status
        if (session.payment_status !== 'paid') {
            return res.status(400).json({ error: 'Payment not completed' });
        }

        // 3. Verify student matches session
        if (session.metadata.studentId !== studentId) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        // 4. Return success (actual enrollment handled by webhook)
        res.json({ 
            success: true,
            message: 'Payment confirmed and processed',
            courses: session.line_items.data.map(item => ({
                title: item.price.product.name,
                price: item.price.unit_amount / 100
            }))
        });

    } catch (error) {
        console.error('Payment confirmation error:', error);
        res.status(500).json({ error: 'Payment confirmation failed' });
    }
};