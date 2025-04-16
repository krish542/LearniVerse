import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';

const ChangePassword = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const otpSentRef = useRef(false); // Use useRef to persist otpSent across re-renders
  const [sendingOtp, setSendingOtp] = useState(false);
  const isSendingOtpRef = useRef(false);

  const sendOtpEmail = useCallback(async () => {
    if (isSendingOtpRef.current || otpSentRef.current) {
      return; // Prevent multiple OTP requests
    }
    isSendingOtpRef.current = true;
    setSendingOtp(true);
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      const res = await axios.post('/api/student/send-change-password-otp', {}, config);
      setMessage(res.data.msg);
      otpSentRef.current = true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send OTP email');
    } finally {
      setSendingOtp(false);
    }
  }, []);

  useEffect(() => {
    if (!otpSentRef.current && !isSendingOtpRef.current) {
      sendOtpEmail();
    }
  }, [sendOtpEmail]);

  const handleVerifyOtpAndChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!otpSentRef.current) {
      setError('Please wait for the OTP to be sent to your email.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      const body = { otp, newPassword };
      const res = await axios.post('/api/student/verify-change-password-otp', body, config);
      setMessage(res.data.msg);
      setOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to verify OTP or change password');
    }
  };

  const handleResendOtp = () => {
    otpSentRef.current = false;
    sendOtpEmail();
  };

  return (
    <div className="min-h-screen bg-gray-900 py-6 flex flex-col justify-center sm:py-12">
      <Navbar />
      <div className="relative py-3 sm:max-w-md sm:mx-auto">
        <div className="bg-gray-800 shadow-lg rounded-xl p-6 border-2 border-yellow-400">
          <h2 className="text-xl font-semibold text-yellow-400 text-center font-pixel mb-4">Change Password</h2>
          {message && <div className="bg-green-200 text-green-800 py-2 px-4 rounded mb-4 font-pixel">{message}</div>}
          {error && <div className="bg-red-200 text-red-800 py-2 px-4 rounded mb-4 font-pixel">{error}</div>}
          {!otpSentRef.current ? (
            <div>
              {sendingOtp ? (
                <p className="text-gray-400 font-pixel">Sending OTP to your email...</p>
              ) : (
                <p className="text-gray-400 font-pixel">An OTP will be sent to your email address to verify your identity before you can change your password.</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleVerifyOtpAndChangePassword} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-yellow-400 text-sm font-bold mb-2 font-pixel">
                  OTP (Sent to your email):
                </label>
                <input
                  type="text"
                  id="otp"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-yellow-400 leading-tight focus:outline-none focus:shadow-outline font-pixel bg-gray-700"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
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
                <label htmlFor="confirmNewPassword" className="block text-yellow-400 text-sm font-bold mb-2 font-pixel">
                  Confirm New Password:
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-yellow-400 leading-tight focus:outline-none focus:shadow-outline font-pixel bg-gray-700"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline font-pixel text-sm"
                disabled={sendingOtp}
              >
                Change Password
              </button>
            </form>
          )}
          {otpSentRef.current && (
            <div className="mt-4 text-center">
              <button
                onClick={handleResendOtp}
                className="text-blue-500 font-pixel hover:text-blue-800 focus:outline-none"
                disabled={sendingOtp}
              >
                Resend OTP
              </button>
            </div>
          )}
          <div className="mt-4 text-center">
            <Link to="/profile" className="text-blue-500 font-pixel hover:text-blue-800">
              Back to Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;