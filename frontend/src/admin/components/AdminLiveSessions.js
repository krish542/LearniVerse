// frontend/src/admin/pages/AdminLiveSessions.js
import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import WorkshopsTab from '../components/WorkshopsTab';
import HackathonsTab from '../components/HackathonsTab';
import CompetitionsTab from '../components/CompetitionsTab';

const AdminLiveSessions = () => {
  const [activeTab, setActiveTab] = useState('workshops');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const renderTab = () => {
    switch (activeTab) {
      case 'workshops':
        return <WorkshopsTab />;
      case 'hackathons':
        return <HackathonsTab />;
      case 'competitions':
        return <CompetitionsTab />;
      default:
        return null;
    }
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
};
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1">
        <AdminNavbar toggleSidebar={toggleSidebar} />
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Event Management</h1>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              className={`px-4 py-2 rounded ${
                activeTab === 'workshops'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200'
              }`}
              onClick={() => setActiveTab('workshops')}
            >
              Workshops
            </button>
            {/*<button
              className={`px-4 py-2 rounded ${
                activeTab === 'hackathons'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200'
              }`}
              onClick={() => setActiveTab('hackathons')}
            >
              Hackathons
            </button>*/}
            <button
              className={`px-4 py-2 rounded ${
                activeTab === 'competitions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200'
              }`}
              onClick={() => setActiveTab('competitions')}
            >
              Competitions
            </button>
          </div>

          {/* Tab Content */}
          <div>{renderTab()}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveSessions;
