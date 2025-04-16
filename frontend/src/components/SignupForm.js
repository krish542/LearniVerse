// frontend/src/components/SignupForm.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    password2: '',
  });

  const { username, firstName, lastName, email, password, password2 } = formData;

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      alert('Passwords do not match');
    } else {
      const newUser = {
        username,
        firstName,
        lastName,
        email,
        password,
      };

      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
          },
        };
        const res = await axios.post('/api/auth/signup', newUser, config);
        console.log('Signup Success:', res.data);
        localStorage.setItem('token', res.data.token);
        navigate('/profile'); // Redirect to profile after signup
      } catch (err) {
        console.error(err.response.data); // Handle errors properly
        alert(err.response.data.msg || 'Signup failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-6 flex flex-col justify-center sm:py-12">
      <Navbar/>
      <div className="relative py-5 sm:max-w-md sm:mx-auto">
        <div className="bg-gray-800 shadow-lg rounded-xl p-6 border-2 border-yellow-400">
          <h1 className="text-xl md:text-2xl font-semibold text-yellow-400 text-center font-pixel mb-4">Sign Up</h1>
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
              <label className="block text-yellow-400 text-sm font-bold mb-2 font-pixel" htmlFor="firstName">
                First Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-yellow-400 leading-tight focus:outline-none focus:shadow-outline font-pixel bg-gray-700"
                id="firstName"
                type="text"
                placeholder="First Name"
                name="firstName"
                value={firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-yellow-400 text-sm font-bold mb-2 font-pixel" htmlFor="lastName">
                Last Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-yellow-400 leading-tight focus:outline-none focus:shadow-outline font-pixel bg-gray-700"
                id="lastName"
                type="text"
                placeholder="Last Name"
                name="lastName"
                value={lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-yellow-400 text-sm font-bold mb-2 font-pixel" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-yellow-400 leading-tight focus:outline-none focus:shadow-outline font-pixel bg-gray-700"
                id="email"
                type="email"
                placeholder="Email"
                name="email"
                value={email}
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
                minLength="6"
              />
            </div>
            <div>
              <label className="block text-yellow-400 text-sm font-bold mb-2 font-pixel" htmlFor="password2">
                Confirm Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-yellow-400 leading-tight focus:outline-none focus:shadow-outline font-pixel bg-gray-700"
                id="password2"
                type="password"
                placeholder="Confirm Password"
                name="password2"
                value={password2}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline font-pixel text-sm"
                type="submit"
              >
                Sign Up
              </button>
              <Link
                to="/login"
                className="inline-block pl-3 align-baseline font-bold text-xs md:text-sm text-yellow-400 hover:text-yellow-300 font-pixel"
              >
                Already have an account? Log In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;