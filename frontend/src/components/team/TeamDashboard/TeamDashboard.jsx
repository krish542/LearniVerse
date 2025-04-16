import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TeamSidebar from './TeamSidebar';
import TeamPending from './TeamPending';
import TeamMainDash from './TeamMainDash';
import TeamRejected from './TeamRejected'; // You’ll create this for rejected state
import Navbar from '../../Navbar';

const TeamDashboard = () => {
  const [memberData, setMemberData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('subAdminToken');
      try {
        const res = await axios.get('/api/team/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMemberData(res.data);
      } catch (error) {
        console.error('Error fetching team profile:', error);
      }
    };
    fetchProfile();
  }, []);

  if (!memberData) return <div className="text-center p-10 text-white bg-black">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="md:flex mt-14 h-screen">
        <TeamSidebar status={memberData.status} />
        <div className="flex-1 bg-gray-800 overflow-y-auto">
          {memberData.status === 'approved' && <TeamMainDash />}
          {memberData.status === 'submitted' && <TeamPending memberData={memberData} />}
          {memberData.status === 'rejected' && <TeamRejected memberData={memberData} />}
        </div>
      </div>
    </>
  );
};

export default TeamDashboard;