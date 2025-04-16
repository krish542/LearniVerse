import React from 'react';
import { Link } from 'react-router-dom';

const TeamRejected = ({ memberData }) => {
  return (
    <div className="p-10 text-center text-white bg-red-900 min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold mb-4 text-red-400">Application Rejected</h2>
      <p className="mb-6 text-lg max-w-xl">
        Hi <span className="font-semibold">{memberData?.name}</span>, your team member application has been <span className="text-red-500 font-bold">rejected</span> by the admin.
        <br />
        If you believe this is a mistake or want to apply again, please contact the support team.
      </p>
      <Link
        to="/contact"
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded"
      >
        Contact Support
      </Link>
    </div>
  );
};

export default TeamRejected;
