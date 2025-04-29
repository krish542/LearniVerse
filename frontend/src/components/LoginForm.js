// frontend/src/components/LoginForm.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const parseJwt = (token) => {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
};

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const { username, password } = formData;

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting:', formData);
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      console.log('Login attempt with: ', {username: formData.username});
      const response = await axios.post('http://localhost:5000/api/auth/login', {username: formData.username, password: formData.password}, config);
      console.log('Full Response: ', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      const token = response.data.token;
      console.log('Login Success:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('x-auth-token', token);
      // ✅ Safe check before accessing userId
      const decoded = parseJwt(token);
    if (decoded && decoded.student?.id) {
      const userId = decoded.student.id;
      localStorage.setItem('userId', userId);  // ✅ userId stored
      console.log('userId stored:', userId);
    } else {
      console.warn('userId not found in decoded token');
    }
      navigate('/profile'); // Redirect to profile after login
    } catch (error) {
      console.error('Login error details:', {
        request: error.config,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : undefined,
        message: error.message
      });
      console.error(error.response.data); // Handle errors properly
      alert(error.response.data.msg || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-6 flex flex-col justify-center sm:py-12">
      <Navbar/>
      <div className="relative py-3 sm:max-w-md sm:mx-auto">
        <div className="bg-gray-800 shadow-lg rounded-xl p-6 border-2 border-yellow-400">
          <h1 className="text-xl md:text-2xl font-semibold text-yellow-400 text-center font-pixel mb-4">Log In</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-yellow-400 text-sm font-bold mb-2 font-pixel" htmlFor="username">
                Username
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-yellow-400 leading-tight focus:outline-none focus:shadow-outline font-pixel bg-gray-700"
                id="username"
                type="text"
                placeholder="Username"
                name="username"
                value={username}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-yellow-400 text-sm font-bold mb-2 font-pixel" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-yellow-400 leading-tight focus:outline-none focus:shadow-outline font-pixel bg-gray-700"
                id="password"
                type="password"
                placeholder="Password"
                name="password"
                value={password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline font-pixel text-sm"
                type="submit"
              >
                Log In
              </button>
              <Link
                to="/signup"
                className="inline-block pl-3 align-baseline font-bold text-xs md:text-sm text-yellow-400 hover:text-yellow-300 font-pixel"
              >
                Don't have an account? Sign Up
              </Link>
            </div>
          </form>
          <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-blue-500 font-pixel hover:text-blue-800">
              Forgot Password?
            </Link><br/><br/>
            <Link to="/" className="text-yellow-400 font-pixel hover:text-yellow-300">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;