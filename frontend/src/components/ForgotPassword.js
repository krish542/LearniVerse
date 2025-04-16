import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await axios.post('/api/student/forgot-password', { email });
      setMessage(res.data.msg);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send reset link');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-6 flex flex-col justify-center sm:py-12">
      <Navbar />
      <div className="relative py-3 sm:max-w-md sm:mx-auto">
        <div className="bg-gray-800 shadow-lg rounded-xl p-6 border-2 border-yellow-400">
          <h2 className="text-xl font-semibold text-yellow-400 text-center font-pixel mb-4">Forgot Password</h2>
          {message && <div className="bg-green-200 text-green-800 py-2 px-4 rounded mb-4 font-pixel">{message}</div>}
          {error && <div className="bg-red-200 text-red-800 py-2 px-4 rounded mb-4 font-pixel">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-yellow-400 text-sm font-bold mb-2 font-pixel">
                Enter your email address:
              </label>
              <input
                type="email"
                id="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-yellow-400 leading-tight focus:outline-none focus:shadow-outline font-pixel bg-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline font-pixel text-sm"
            >
              Send Reset Link
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-blue-500 font-pixel hover:text-blue-800">
              Back to Login
            </Link>
            <Link to="/" className="text-yellow-400 font-pixel hover:text-yellow-300 ml-4">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;