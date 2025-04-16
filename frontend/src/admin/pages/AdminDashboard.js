import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line,
  ResponsiveContainer
} from 'recharts';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [reportStats, setReportStats] = useState([]);
  const [approvalStats, setApprovalStats] = useState(null);
  const [growthStats, setGrowthStats] = useState([]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');

    const fetchStats = async () => {
      try {
        const [userRes, reportRes, approvalRes, growthRes] = await Promise.all([
          axios.get('/api/admin/user-stats', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/admin/report-stats', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/admin/approval-stats', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/admin/user-growth', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setUserStats(userRes.data);
        setReportStats(reportRes.data);
        setApprovalStats(approvalRes.data);
        setGrowthStats(growthRes.data);
      } catch (err) {
        console.error('Stats fetch failed', err);
      }
    };

    fetchStats();
  }, []);

  const userData = userStats ? [
    { name: 'Students', value: userStats.students },
    { name: 'Teachers', value: userStats.teachers },
    { name: 'Team Members', value: userStats.teams },
  ] : [];

  const approvalData = approvalStats ? [
    {
      name: 'Teachers',
      submitted: approvalStats.teachers?.submitted || 0,
      approved: approvalStats.teachers?.accepted || 0,
      rejected: approvalStats.teachers?.rejected || 0,
    },
    {
      name: 'Team Members',
      submitted: approvalStats.teamMembers?.submitted || 0,
      approved: approvalStats.teamMembers?.approved || 0,
      rejected: approvalStats.teamMembers?.rejected || 0,
    }
  ] : [];

  const handleExport = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AdminNavbar toggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 p-6 bg-gray-900 overflow-y-auto text-white">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard - Quick Stats</h1>

          <div className="flex justify-end mb-4 gap-2">
            <button onClick={() => handleExport(userData, 'user_distribution')} className="bg-blue-600 px-4 py-2 rounded text-sm hover:bg-blue-500">Export Users</button>
            <button onClick={() => handleExport(reportStats, 'report_feedback')} className="bg-green-600 px-4 py-2 rounded text-sm hover:bg-green-500">Export Reports</button>
            <button onClick={() => handleExport(approvalData, 'approval_status')} className="bg-yellow-600 px-4 py-2 rounded text-sm hover:bg-yellow-500">Export Approvals</button>
            <button onClick={() => handleExport(growthStats, 'growth_metrics')} className="bg-purple-600 px-4 py-2 rounded text-sm hover:bg-purple-500">Export Growth</button>
          </div>

          <div className="grid lg:grid-cols-3 sm:grid-cols-1 gap-8">
            {/* Pie Chart - User Distribution */}
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-lg mb-2">User Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {userData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart - Weekly Reports/Feedback */}
            <div className="bg-gray-800 p-4 rounded col-span-1 lg:col-span-2">
              <h3 className="text-lg mb-2">Weekly Reports & Feedbacks</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="reports" fill="#8884d8" />
                  <Bar dataKey="feedbacks" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Approval Chart */}
            <div className="bg-gray-800 p-4 rounded col-span-1 lg:col-span-3">
              <h3 className="text-lg mb-2">Approval Status Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={approvalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="submitted" fill="#FFBB28" />
                  <Bar dataKey="approved" fill="#00C49F" />
                  <Bar dataKey="rejected" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart - Growth */}
            <div className="bg-gray-800 p-4 rounded col-span-1 lg:col-span-3">
              <h3 className="text-lg mb-2">User Growth Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="students" stroke="#8884d8" />
                  <Line type="monotone" dataKey="teachers" stroke="#00C49F" />
                  <Line type="monotone" dataKey="teams" stroke="#FFBB28" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;