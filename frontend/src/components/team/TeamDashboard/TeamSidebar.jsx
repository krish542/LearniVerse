import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';

const TeamSidebar = ({ status }) => {
  const [open, setOpen] = useState(false);

  const linkClass = "block py-2 px-4 rounded hover:bg-peach-600 hover:text-white transition";

  return (
    <>
      <div className="md:hidden p-4 bg-black text-white">
        <button onClick={() => setOpen(!open)}>
          <FaBars size={24} />
        </button>
      </div>
      <div className={`bg-gray-900 text-yellow-400 p-4 md:block md:w-64 min-h-screen ${open ? 'block' : 'hidden'} transition-all`}>
        <nav className="space-y-2">
          <Link to="/team/dashboard" className={linkClass}>Home</Link>
          
          {status === 'approved' && (
            <>
              <Link to="/team/dashboard/quick-stats" className={linkClass}>Quick Stats</Link>
              <Link to="/team/dashboard/manage-clubs" className={linkClass}>Club Management</Link>
              <Link to="/team/dashboard/game-arena" className={linkClass}>Game Arena</Link>
              <Link to="/team/dashboard/reports" className={linkClass}>Reports & Logs</Link>
              <Link to="/team/dashboard/support" className={linkClass}>Support & Feedback</Link>
              <Link to="/team/dashboard/profile" className={linkClass}>Profile</Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
};

export default TeamSidebar;