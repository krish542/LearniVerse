// frontend/src/admin/pages/AdminLiveSessions.js
import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

const AdminLiveSessions = () => {
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <AdminSidebar />
      <div className="flex-1">
        <AdminNavbar />
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Manage Live Sessions</h1>
          {/* Placeholder for managing scheduled sessions or sending invites */}
          <p>No upcoming live sessions. Admins can add or manage workshops here.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveSessions;
