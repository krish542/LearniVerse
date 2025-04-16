import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../Navbar';
import TeamSidebar from './TeamSidebar';
import TeamPending from './TeamPending';
import TeamRejected from './TeamRejected';

const QuickStats = () => {
  const [memberData, setMemberData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('subAdminToken');
      try {
        const res = await axios.get('/api/team/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMemberData(res.data);
      } catch (error) {
        console.error('Error fetching team profile:', error);
      }
    };
    fetchProfile();
  }, []);

  if (!memberData) {
    return <div className="text-center p-10 text-white bg-black">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="md:flex mt-14 h-screen">
        <TeamSidebar status={memberData.status} />
        <div className="flex-1 bg-gray-800 overflow-y-auto">
          {memberData.status === 'approved' ? (
            <div className="p-6 text-white">
              <h2 className="text-2xl font-semibold mb-4">Quick Stats</h2>
              <p>Overview of platform metrics and performance will be shown here.</p>
            </div>
          ) : memberData.status === 'submitted' ? (
            <TeamPending memberData={memberData} />
          ) : (
            <TeamRejected memberData={memberData} />
          )}
        </div>
      </div>
    </>
  );
};

export default QuickStats;
