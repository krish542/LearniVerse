// frontend/src/components/teacher/ProfileManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ProfileManagement = () => {
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data to check if application is submitted
    const fetchProfileStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/teachers/profile', { // Adjust endpoint
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok && data.teacher && data.teacher.highestQualification) {
          setApplicationSubmitted(true);
        }
      } catch (error) {
        console.error('Error fetching profile status:', error);
      }
    };

    fetchProfileStatus();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Profile Management</h2>
      {applicationSubmitted ? (
        <Link to="/teacher/profile/view-application" className="bg-[#007bff] hover:bg-[#0056b3] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">View Application</Link>
      ) : (
        <Link to="/teacher/profile/edit-application" className="bg-[#F38380] hover:bg-[#d96a67] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Submit Application Details</Link>
      )}
    </div>
  );
};

export default ProfileManagement;