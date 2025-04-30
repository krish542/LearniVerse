const stripe = require('../config/stripe');
const Cart = require('../models/Cart');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment'); // Import Enrollment model

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

// Webhook handler for Stripe events
exports.handleStripeWebhook = async (req, res) => {
    console.log('🔔 Webhook received! Raw headers:', req.headers);
  console.log('Raw body:', req.body.toString()); // Add this line

    const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('❌ Webhook signature or secret missing');
    return res.status(401).send('Unauthorized');
  }

  let event;
  
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log('🔔 Webhook received! Type:', event.type);
    } catch (err) {
      console.error('❌ Webhook error:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    if (event.type === 'checkout.session.completed') {
      console.log('💰 Payment succeeded! Session:', event.data.object);
      const session = event.data.object;
  
      // Start MongoDB session for transaction
      const dbSession = await mongoose.startSession();
      dbSession.startTransaction();
  
      try {
        // 1. Verify metadata exists
        if (!session.metadata?.studentId || !session.metadata?.courseIds) {
          throw new Error('Missing required metadata in session');
        }
  
        const { studentId, courseIds } = session.metadata;
        const courseIdsArray = courseIds.split(',');
        
        console.log('Processing enrollment for:', {
          studentId,
          courses: courseIdsArray
        });
  
        // 2. Verify student exists
        const student = await Student.findById(studentId).session(dbSession);
        if (!student) throw new Error(`Student not found: ${studentId}`);
  
        // 3. Process enrollments
        const enrollmentResults = [];
        for (const courseId of courseIdsArray) {
          const exists = await Enrollment.exists({
            studentId,
            courseId
          }).session(dbSession);
  
          if (!exists) {
            await new Enrollment({
              studentId,
              courseId,
              progress: {
                lecturesCompleted: [],
                quizzesCompleted: [],
                assignmentsSubmitted: []
              }
            }).save({ session: dbSession });
  
            if (!student.enrolledCourses.includes(courseId)) {
              student.enrolledCourses.push(courseId);
            }
            
            enrollmentResults.push({ courseId, status: 'enrolled' });
            console.log(`✅ Enrolled student ${studentId} in course ${courseId}`);
          }
        }
  
        // 4. Clear cart
        const cart = await Cart.findOneAndUpdate(
          { student: studentId },
          { $set: { items: [] } },
          { new: true, session: dbSession }
        );
        console.log('🛒 Cart cleared:', !!cart);
  
        // 5. Save student and commit transaction
        await student.save({ session: dbSession });
        await dbSession.commitTransaction();
        
        console.log('🎉 Successfully processed payment', {
          studentId,
          enrollments: enrollmentResults
        });
  
      } catch (err) {
        await dbSession.abortTransaction();
        console.error('❌ Transaction failed:', err);
      } finally {
        dbSession.endSession();
      }
    }
  
    res.json({ received: true });
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
        console.log('Stripe session retrieved:', session);

        if (session.payment_status !== 'paid') {
            console.log('Payment status:', session.payment_status);
            return res.status(400).json({ error: 'Payment not completed' });
        }
        console.log('Payment status is PAID.');

        console.log('Session metadata studentId:', session.metadata.studentId);
        console.log('Request student ID:', req.student.id);
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