// frontend/components/TeamPending.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const TeamPending = ({ memberData }) => {
  const navigate = useNavigate();

  const handleSubmitApplication = () => {
    navigate('/team/application'); // make sure this route exists and shows the form
  };

  return (
    <div className="p-10 text-white">
      {memberData.status === 'not-submitted' ? (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Application Not Submitted</h2>
          <p className="text-gray-300">You haven't submitted your application yet.</p>
          <button
            onClick={handleSubmitApplication}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-semibold"
          >
            Submit Application
          </button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Application Submitted</h2>
          <p className="text-gray-300">
            Thank you for your application. We’ll notify you once it's processed.
          </p>
          <p className="text-yellow-500">Current Status: {memberData.status}</p>
        </div>
      )}
    </div>
  );
};

export default TeamPending;
