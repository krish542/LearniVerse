// frontend/src/components/EditProfile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar'; // Import the Navbar component
//import './index.css'; // Ensure Tailwind CSS is imported

const EditProfile = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('/api/student/profile', {
            headers: {
              'x-auth-token': token,
            },
          });
          setFirstName(res.data.firstName);
          setLastName(res.data.lastName);
          setEmail(res.data.email);
          setMobile(res.data.mobile || ''); // Handle optional mobile number
          setLoading(false);
        } catch (err) {
          console.error(err.response.data);
          setError(err.response.data.msg || 'Failed to load profile');
          setLoading(false);
        }
      } else {
        setError('Not authenticated');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const config = {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          },
        };
        const body = JSON.stringify({ firstName, lastName, email, mobile });
        const res = await axios.put('/api/student/profile', body, config);
        console.log('Profile updated:', res.data);
        setSuccessMessage('Profile updated successfully!');
        setLoading(false);
        // Navigate back to the profile page after successful update
        navigate('/profile');
      } catch (err) {
        console.error(err.response.data);
        setError(err.response.data.msg || 'Failed to update profile');
        setLoading(false);
      }
    } else {
      setError('Not authenticated');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="font-pixel text-yellow-400">Loading profile...</div>;
  }

  if (error) {
    return <div className="font-pixel text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar /> {/* Add the Navbar component */}
      <div className="py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-md sm:mx-auto">
          <div className="bg-gray-800 shadow-lg rounded-xl p-6 border-2 border-yellow-400">
            <h2 className="text-xl font-semibold text-yellow-400 text-center font-pixel mb-4">Edit Profile</h2>
            {successMessage && (
              <div className="bg-green-200 text-green-800 py-2 px-4 rounded mb-4 font-pixel">{successMessage}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-yellow-400 text-sm font-bold mb-2 font-pixel">
                  First Name:
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-yellow-400 leading-tight focus:outline-none focus:shadow-outline font-pixel bg-gray-700"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-yellow-400 text-sm font-bold mb-2 font-pixel">
                  Last Name:
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-yellow-400 leading-tight focus:outline-none focus:shadow-outline font-pixel bg-gray-700"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-yellow-400 text-sm font-bold mb-2 font-pixel">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-yellow-400 leading-tight focus:outline-none focus:shadow-outline font-pixel bg-gray-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="mobile" className="block text-yellow-400 text-sm font-bold mb-2 font-pixel">
                  Mobile (Optional):
                </label>
                <input
                  type="text"
                  id="mobile"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-yellow-400 leading-tight focus:outline-none focus:shadow-outline font-pixel bg-gray-700"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline font-pixel text-sm"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <Link to="/profile" className="text-yellow-400 font-pixel hover:text-yellow-300">
                Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;