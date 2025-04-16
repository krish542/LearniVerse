// frontend/src/components/teacher/TeacherLogin.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';

const TeacherLogin = () => {
  const [formData, setFormData] = useState({
    username: '', // Or email, depending on your backend
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/teacher/login', { // Ensure this backend route exists
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Teacher login successful:', data);
        localStorage.setItem('teacherToken', data.token); // Store the authentication token
        try{
          const profileResponse = await fetch('/api/teacher/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${data.token}`, // Include the token in the header
            },
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            const applicationStatus = profileData.teacher.applicationStatus;

            if (applicationStatus === 'accepted') {
              navigate('/teacher/dashboard');
            } else if (applicationStatus === 'submitted') {
              navigate('/teacher/profile'); // Assuming '/teacher/profile' is your view-application page
            } else {
              // Handle other statuses if needed, maybe redirect to an info page
              navigate('/teacher/profile'); // Default to profile for other statuses
            }
          } else {
            console.error('Failed to fetch teacher profile after login:', await profileResponse.json());
            setError('Failed to fetch profile after login.');
            navigate('/teacher/profile'); // Fallback to profile in case of error
          }
        } catch (profileError) {
          console.error('Error fetching teacher profile:', profileError);
          setError('Error fetching profile.');
          navigate('/teacher/profile'); // Fallback to profile in case of error
        }

      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during teacher login:', error);
      setError('Failed to connect to the server');
    }
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-[#F38380] text-center">Teacher Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username or Email:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <Link to="/forgot-password" className="inline-block align-baseline font-semibold text-sm text-[#F38380] hover:text-[#d96a67]">
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            className="bg-[#F38380] hover:bg-[#d96a67] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Login
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link to="/teacher/register" className="text-[#F38380] hover:text-[#d96a67]">
            Register here
          </Link>
        </p>
        <p className="text-center mt-2 text-gray-600 text-sm">
          Are you a student?{' '}
          <Link to="/login" className="text-[#F38380] hover:text-[#d96a67]">
            Student Login
          </Link>
        </p>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default TeacherLogin;