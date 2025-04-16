// frontend/src/components/ViewProfile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; // Import the Navbar component
//import './index.css'; // Ensure Tailwind CSS is imported

const ViewProfile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');


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
          setStudent(res.data);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleEditProfile = () => {
    navigate('/edit-profile'); // Navigate to the Edit Profile page
  };

  const handleSaveChanges = () => {
    // You might implement inline editing and then save here,
    // or this button might be redundant if all edits are done on EditProfile page.
    // For now, let's assume it's for potential inline edits.
    console.log('Save Changes clicked (implementation pending)');
    // You would likely make a PUT request to update profile data here.
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
    setDeletePassword('');
    setDeleteError('');
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteAccountConfirm = async () => {
    setDeleteError('');
    const token = localStorage.getItem('token');
    if (token && deletePassword) {
      try {
        const config = {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          },
        };
        const body = JSON.stringify({ password: deletePassword });
        await axios.delete('/api/student/profile', config, body);
        localStorage.removeItem('token');
        navigate('/login');
      } catch (err) {
        console.error(err.response ? err.response.data : err);
        setDeleteError(err.response?.data?.msg || 'Failed to delete account. Please try again.');
      }
    } else {
      setDeleteError('Please enter your password to confirm.');
    }
  };

  if (loading) {
    return <div className="font-pixel text-yellow-400">Loading profile...</div>;
  }

  if (error) {
    return <div className="font-pixel text-red-500">Error: {error}</div>;
  }

  if (!student) {
    return <div className="font-pixel text-gray-400">No profile data available.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar /> {/* Add the Navbar component */}
      <div className="py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-3xl sm:mx-auto">
          <div className="bg-gray-800 shadow-lg rounded-xl p-8 border-2 border-yellow-400">
            <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-yellow-400">
              <h2 className="text-xl font-semibold text-yellow-400 font-pixel">Your Profile</h2>
              <button
                onClick={handleLogout}
                className="bg-gray-700 hover:bg-gray-600 text-yellow-400 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline font-pixel text-sm"
              >
                Logout
              </button>
            </div>

            {/* Welcome Section */}
            <div className="mb-6 p-4 border rounded-md border-yellow-400">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2 font-pixel">Welcome</h3>
              <div className="relative w-32 h-40 mx-auto mb-2">
                <img
                  src={`/assets/avatar/head/${student.avatar.head}`}
                  alt="Avatar Head"
                  className="absolute top-0 left-3 w-auto h-auto"
                  style={{ maxHeight: '26%', top: 10, zIndex: 3 }}
                  onError={(e) => { e.target.onerror = null; e.target.src="/images/default-placeholder.png" }}
                />
                <img
                  src={`/assets/avatar/body/${student.avatar.body}`}
                  alt="Avatar Body"
                  className="absolute left-0 w-auto h-auto"
                  style={{ maxHeight: '40%', top: '30%', zIndex: 2 }}
                  onError={(e) => { e.target.onerror = null; e.target.src="/images/default-placeholder.png" }}
                />
                <img
                  src={`/assets/avatar/legs/${student.avatar.legs}`}
                  alt="Avatar Legs"
                  className="absolute bottom-0 left-0 w-auto h-auto"
                  style={{ maxHeight: '40%', bottom: 0, zIndex: 1 }}
                  onError={(e) => { e.target.onerror = null; e.target.src="/images/default-placeholder.png" }}
                />
              </div>
              <Link
                to="/edit-avatar"
                className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-1 px-2 rounded text-sm focus:outline-none focus:shadow-outline font-pixel mb-2"
              >
                Edit Avatar
              </Link>
              <p className="text-yellow-400 font-pixel">Username: {student.username}</p>
              <p className="text-gray-400 font-pixel">First Name: {student.firstName} </p>
              <p className="text-gray-400 font-pixel">Last Name: {student.lastName}</p>
              <p className="text-gray-400 font-pixel" style={{wordBreak: 'break-word'}}>Email: {student.email}</p>
              {student.mobile && <p className="text-gray-400 font-pixel">Mobile: {student.mobile}</p>}

              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  onClick={handleEditProfile}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline font-pixel text-sm"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline font-pixel text-sm"
                ><Link to="/" >Back to Home</Link>
                  
                </button>
                <button
                  onClick={openDeleteModal}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline font-pixel text-sm"
                >
                  Delete Account
                </button>
              </div>
              <Link
                to="/change-password" // Assuming you have a change password route
                className="mt-2 block text-blue-400 hover:text-blue-300 focus:outline-none font-pixel text-sm"
              >
                Change Password
              </Link>

              {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center font-pixel">
          <div className="bg-gray-800 p-6 rounded-md border-2 border-red-500">
            <h2 className="text-lg font-semibold text-red-500 mb-4">Confirm Delete Account</h2>
            {deleteError && <p className="text-red-500 mb-2">{deleteError}</p>}
            <label htmlFor="deletePassword" className="block text-yellow-400 text-sm font-bold mb-2">
              Enter Password:
            </label>
            <input
              type="password"
              id="deletePassword"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-yellow-400 leading-tight focus:outline-none focus:shadow-outline bg-gray-700"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={closeDeleteModal} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm">Cancel</button>
              <button onClick={handleDeleteAccountConfirm} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
            </div>

            {/* Enrolled Courses */}
            <div className="mb-6 p-4 border rounded-md border-yellow-400">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2 font-pixel">Enrolled Courses</h3>
              {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
                <ul className="list-disc ml-5 text-gray-400 font-pixel">
                  {student.enrolledCourses.map((course) => (
                    <li key={course} className="mb-1">
                      {/* Replace with actual course details and progress bar */}
                      Course ID: {course} - Completion: [Progress Bar Here]
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 font-pixel">Not enrolled in any courses yet.</p>
              )}
            </div>

            {/* Upcoming Sessions */}
            <div className="mb-6 p-4 border rounded-md border-yellow-400">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2 font-pixel">Upcoming Sessions</h3>
              <p className="text-gray-400 font-pixel">No upcoming sessions scheduled.</p>
            </div>

            {/* Leaderboard */}
            <div className="mb-6 p-4 border rounded-md border-yellow-400">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2 font-pixel">Leaderboard</h3>
              <p className="text-gray-400 font-pixel">Leaderboard data will be displayed here.</p>
            </div>

            {/* Badges and Rewards */}
            <div className="mb-6 p-4 border rounded-md border-yellow-400">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2 font-pixel">Badges and Rewards</h3>
              <p className="text-gray-400 font-pixel">Your badges and rewards will be shown here.</p>
            </div>

            {/* Study Groups */}
            <div className="mb-6 p-4 border rounded-md border-yellow-400">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2 font-pixel">Study Groups</h3>
              {student.studyGroups && student.studyGroups.length > 0 ? (
                <ul className="list-disc ml-5 text-gray-400 font-pixel">
                  {student.studyGroups.map((group) => (
                    <li key={group} className="mb-1">
                      Group ID: {group}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 font-pixel">Not currently in any study groups.</p>
              )}
            </div>

            {/* Resume Builder */}
            <div className="p-4 border rounded-md border-yellow-400">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2 font-pixel">Resume Builder</h3>
              <p className="text-gray-400 font-pixel">Coming Soon!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;