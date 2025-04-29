// frontend/src/pages/PaymentErrorPage.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PaymentErrorPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const error = location.state?.error || 'An unexpected error occurred during payment.';

    return (
        <div className="min-h-screen bg-gray-900 text-red-400">
            <Navbar />
            <div className="pt-20 p-8 max-w-4xl mx-auto text-center">
                <h1 className="text-3xl font-bold mb-6">Payment Error</h1>
                <p className="text-xl mb-8 text-red-500">{error}</p>
                <p className="text-gray-400 mb-8">
                    There was an issue processing your payment. Please try again or contact support.
                </p>
                <button
                    onClick={() => navigate('/cart')}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg mr-4"
                >
                    Go to Cart
                </button>
                <button
                    onClick={() => navigate('/contact')} // Replace with your contact page URL
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
                >
                    Contact Support
                </button>
            </div>
            <Footer />
        </div>
    );
};

export default PaymentErrorPage;