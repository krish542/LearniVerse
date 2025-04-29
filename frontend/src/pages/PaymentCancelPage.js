// frontend/src/pages/PaymentCancelPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PaymentCancelPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-900 text-yellow-400">
            <Navbar />
            <div className="pt-20 p-8 max-w-4xl mx-auto text-center">
                <h1 className="text-3xl font-bold mb-6">Payment Cancelled</h1>
                <p className="text-xl mb-8">Your payment was cancelled.</p>
                <p className="text-gray-400 mb-8">
                    You can try again or go back to your cart to review your order.
                </p>
                <button
                    onClick={() => navigate('/cart')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg mr-4"
                >
                    Go to Cart
                </button>
                <button
                    onClick={() => navigate('/courses')} // Or your main courses page
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
                >
                    Browse Courses
                </button>
            </div>
            <Footer />
        </div>
    );
};

export default PaymentCancelPage;