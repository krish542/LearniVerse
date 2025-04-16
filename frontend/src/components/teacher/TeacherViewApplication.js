// frontend/src/components/teacher/ViewApplication.js
import React, { useState, useEffect } from 'react';

const ViewApplication = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/teachers/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setProfileData(data.teacher);
          setLoading(false);
        } else {
          setError(data.message || 'Failed to fetch profile');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to connect to the server');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-lg text-gray-700">Loading application details...</p></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-red-500">{error}</p></div>;
  }

  return (
    <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">View Application Details</h2>
      {profileData && (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Full Name:</label>
            <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{profileData.fullName}</p>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address:</label>
            <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{profileData.email}</p>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number:</label>
            <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{profileData.phoneNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Date of Birth:</label>
            <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{profileData.dateOfBirth ? profileData.dateOfBirth.substring(0, 10) : 'N/A'}</p>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Gender:</label>
            <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{profileData.gender || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Country of Residence:</label>
            <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{profileData.country || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">City of Residence:</label>
            <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{profileData.city || 'N/A'}</p>
          </div>
          {profileData.institutions && profileData.institutions.length > 0 && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Institutions:</label>
              {profileData.institutions.map((institution, index) => (
                <div key={index} className="mb-2">
                  <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">Institution Name: {institution.name || 'N/A'}</p>
                  <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">Year of Graduation: {institution.yearOfGraduation || 'N/A'}</p>
                </div>
              ))}
            </div>
          )}
          {profileData.certifications && profileData.certifications.length > 0 && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Certifications:</label>
              {profileData.certifications.map((certification, index) => (
                <p key={index} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{certification || 'N/A'}</p>
              ))}
            </div>
          )}
          {/* Render other fields similarly */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Teaching Experience (Years):</label>
            <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{profileData.teachingExperienceYears || 'N/A'}</p>
          </div>
          {profileData.subjectsCanTeach && profileData.subjectsCanTeach.length > 0 && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Subjects You Can Teach:</label>
              {profileData.subjectsCanTeach.map((subject, index) => (
                <p key={index} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{subject || 'N/A'}</p>
              ))}
            </div>
          )}
          {/* ... and so on for all the fields */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Background Check Consent:</label>
            <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{profileData.backgroundCheckConsent ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Terms & Conditions Agreed:</label>
            <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{profileData.termsAndConditionsAgreed ? 'Yes' : 'No'}</p>
          </div>
          {/* Add buttons for editing if needed */}
        </div>
      )}
    </div>
  );
};

export default ViewApplication;