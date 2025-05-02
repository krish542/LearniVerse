import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const PaymentSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const sessionId = query.get('session_id');

        if (!sessionId) {
            setError('Invalid session ID');
            setLoading(false);
            return;
        }

        const verifyAndProcessPayment = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // 1. First verify the payment
                const verificationResponse = await axios.get(
                    `${API_BASE_URL}/api/payment/verify/${sessionId}`,
                    { headers: { 'x-auth-token': token } }
                );

                // 2. Confirm payment and process enrollments
                await axios.post(
                    `${API_BASE_URL}/api/payment/confirm`,
                    { sessionId },
                    { headers: { 'x-auth-token': token } }
                );

                // 3. Optionally refresh user data
                /*const userResponse = await axios.get(
                    `${API_BASE_URL}/api/student/me`,
                    { headers: { 'x-auth-token': token } }
                );*/

                // 4. Update state with verified session
                setSession(verificationResponse.data);
                setLoading(false);

            } catch (err) {
                console.error('Payment processing error:', err);
                setError(err.response?.data?.error || 'Payment processing failed');
                setLoading(false);
            }
        };

        verifyAndProcessPayment();
    }, [location, navigate]);

    if (loading) return <div className="min-h-screen bg-gray-900 text-yellow-400 flex items-center justify-center">Processing payment...</div>;
    if (error) return <div className="min-h-screen bg-gray-900 text-yellow-400 flex items-center justify-center">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-yellow-400">
            <Navbar />
            <div className="pt-20 p-8 max-w-6xl mx-auto text-center">
                <h1 className="text-3xl font-bold mb-6">Payment Successful!</h1>
                <p className="text-xl mb-8">You're now enrolled in the following courses:</p>

                {session && (
                    <div className="bg-gray-800 p-6 rounded-lg max-w-md mx-auto">
                        <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                        <ul className="mb-4">
                            {session.courses.map((course, index) => (
                                <li key={index} className="mb-2">
                                    <span className="font-semibold">{course.title}</span> - ₹{course.price}
                                </li>
                            ))}
                        </ul>
                        <div className="border-t border-gray-700 pt-4">
                            <p className="text-lg font-bold">Total: ₹{session.amountTotal}</p>
                        </div>
                    </div>
                )}

                <div className="mt-8 space-x-4">
                    <button
                        onClick={() => navigate('/my-courses')}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg"
                    >
                        View My Courses
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PaymentSuccessPage;