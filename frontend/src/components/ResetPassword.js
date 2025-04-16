import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Invalid reset link.');
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!token) {
      setError('Invalid reset link.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    console.log("Token being sent:", token);
    try {
      const res = await axios.put(`/api/student/reset-password/${token}`, { newPassword });
      setMessage(res.data.msg);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-6 flex flex-col justify-center sm:py-12">
      <Navbar />
      <div className="relative py-3 sm:max-w-md sm:mx-auto">
        <div className="bg-gray-800 shadow-lg rounded-xl p-6 border-2 border-yellow-400">
          <h2 className="text-xl font-semibold text-yellow-400 text-center font-pixel mb-4">Reset Password</h2>
          {message && <div className="bg-green-200 text-green-800 py-2 px-4 rounded mb-4 font-pixel">{message}</div>}
          {error && <div className="bg-red-200 text-red-800 py-2 px-4 rounded mb-4 font-pixel">{error}</div>}
          {token ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-yellow-400 text-sm font-bold mb-2 font-pixel">
                  New Password:
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-yellow-400 leading-tight focus:outline-none focus:shadow-outline font-pixel bg-gray-700"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-yellow-400 text-sm font-bold mb-2 font-pixel">
                  Confirm New Password:
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-yellow-400 leading-tight focus:outline-none focus:shadow-outline font-pixel bg-gray-700"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline font-pixel text-sm"
              >
                Reset Password
              </button>
            </form>
          ) : (
            <p className="text-red-500 font-pixel">Invalid or expired reset link.</p>
          )}
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

export default ResetPassword;