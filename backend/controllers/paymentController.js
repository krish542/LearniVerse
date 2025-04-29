const stripe = require('../config/stripe');
const Cart = require('../models/Cart');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment'); // Import Enrollment model

exports.createCheckoutSession = async (req, res) => {
    try {
        const { cartId, totalAmount } = req.body; // Receive totalAmount

        // Get the cart with populated courses
        const cart = await Cart.findById(cartId)
            .populate('items.course', 'title price'); // Populate items.course

        if (!cart || cart.student.toString() !== req.student.id) {
            return res.status(403).json({ error: 'Unauthorized access to cart' });
        }

        if (cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Create line items for Stripe
        const line_items = cart.items.map(item => ({
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
                courseIds: cart.items.map(item => item.course._id.toString()).join(',') // Store course IDs
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
        console.log('Webhook event received:', event.type);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        try {
            if (!session.metadata || !session.metadata.studentId || !session.metadata.courseIds) {
                throw new Error('Missing required metadata in session');
              }
        
            const studentId = session.metadata.studentId;
            const courseIdsString = session.metadata.courseIds;
            const courseIds = courseIdsString ? courseIdsString.split(',') : []; // Declare courseIds outside the if block
            const courseIdsArray = courseIds.split(',');
            console.log('Student ID from metadata:', studentId);
            console.log('Course IDs from metadata:', courseIds);

            const student = await Student.findById(studentId);
            if (!student) {
                console.error('Student not found:', studentId);
                return res.status(404).json({ error: 'Student not found' });
            }
            console.log('Found student:', student.id);

            // Enroll student in purchased courses
            for (const courseId of courseIds) {
                const existingEnrollment = await Enrollment.findOne({ studentId: student._id, courseId });
                if (!existingEnrollment) {
                    const newEnrollment = new Enrollment({
                        studentId,
                        courseId,
                        progress: {
                            lecturesCompleted: [],
                            quizzesCompleted: [],
                            assignmentsSubmitted: []
                        }
                    });
                    await newEnrollment.save();
                    if(!student.enrolledCourses.includes(courseId)){
                        student.enrolledCourses.push(courseId);
                    }
                    enrollmentResults.push({
                        courseId, 
                        status: 'enrolled'
                    });
                    console.log(`Enrolled student ${student._id} in course ${courseId}`);
                } else {
                    enrollmentResults.push({
                        courseId,
                        status: 'already_enrolled'
                      });
                    console.log(`Student ${student._id} already enrolled in course ${courseId}`);
                }
            }

            // Optionally clear the cart after successful checkout
            const cart = await Cart.findOneAndUpdate({ student: studentId }, {$set: {items: []}}, {new: true});
            /*if (cart) {
                cart.items = [];
                await cart.save();
                console.log(`Cart cleared for student ${student._id}`);
            }*/
           await student.save();
           console.log('Post-payment processing completed:', {
            studentId,
            enrollments: enrollmentResults,
            cartCleared: !!cart
          });

            console.log(`Successfully processed payment for student ${student._id}`);
        } catch (err) {
            console.error('Error processing payment and enrolling:', err);
            return res.status(500).json({ error: 'Error processing payment and enrollment' });
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