import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

const PaymentSuccess = () => {
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

    const verifyPayment = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/student-login');
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/payment/verify?session_id=${sessionId}`,
          { headers: { 'x-auth-token': token } }
        );
        
        setSession(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to verify payment');
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location, navigate]);

  if (loading) return <div className="min-h-screen bg-gray-900 text-yellow-400 flex items-center justify-center">Verifying payment...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-yellow-400 flex items-center justify-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-yellow-400">
      <Navbar />
      <div className="pt-20 p-8 max-w-6xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6">Payment Successful!</h1>
        <p className="text-xl mb-8">Thank you for your purchase.</p>
        
        {session && (
          <div className="bg-gray-800 p-6 rounded-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <ul className="mb-4">
              {session.courses.map((course, index) => (
                <li key={index} className="mb-2">{course.title} - ₹{course.price}</li>
              ))}
            </ul>
            <p className="text-lg font-bold">Total: ₹{session.amountTotal / 100}</p>
          </div>
        )}
        
        <button 
          onClick={() => navigate('/student-dashboard')}
          className="mt-8 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg"
        >
          Go to Dashboard
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;