import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VirtualCampus from './pages/VirtualCampus';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import LoginForm from './components/LoginForm';
import ViewProfile from './components/ViewProfile';
import EditAvatar from './components/EditAvatar';
import EditProfile from './components/EditProfile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ChangePassword from './components/ChangePassword';
import TeacherRegister from './components/teacher/TeacherRegister';
import TeacherProfile from './components/teacher/TeacherProfile';
import TeacherProfileManagement from './components/teacher/TeacherProfileManagement';
import TeacherLogin from './components/teacher/TeacherLogin';
import TeacherEditApplication from './components/teacher/TeacherEditApplication';
import TeacherViewApplication from './components/teacher/TeacherViewApplication';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import UserManagement from './admin/components/UserManagement';
import AddCourse from './components/teacher/AddCourse';
import TeacherCourses from './components/teacher/TeacherCourses';
import EditCourse from './components/teacher/EditCourse';
import TeamAccountCreation from './components/team/TeamAccountCreation';
import TeamLogin from './components/team/TeamLogin';
import TeamDashboard from './components/team/TeamDashboard/TeamDashboard';
import TeamApplicationForm from './components/team/TeamApplicationForm';
import QuickStats from './components/team/TeamDashboard/QuickStats';
import ManageClubs from './components/team/TeamDashboard/ManageClubs';
import GameArena from './components/team/TeamDashboard/GameArena';
import Reports from './components/team/TeamDashboard/Reports';
import SupportFeedback from './components/team/TeamDashboard/SupportFeedback';
import TeamProfile from './components/team/TeamDashboard/TeamProfile';
import FeedbackPage from './components/FeedbackPage';
import ReportPage from './components/ReportPage';
import TeacherLiveSessions from './components/teacher/TeacherLiveSessions';
import AdminLiveSessions from './admin/components/AdminLiveSessions';
//import TeacherList from './admin/components/TeacherList'; 
//import Game from './components/Game/Game';
const App = () => {

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(!!localStorage.getItem('adminToken'));
  const [isSubAdminLoggedIn, setIsSubAdminLoggedIn] = useState(!!localStorage.getItem('subAdminToken'));
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(!!localStorage.getItem('teacherToken'));
  console.log('isAdminLoggedIn: ', isAdminLoggedIn);
  console.log('isSubAdminLoggedIn: ', isSubAdminLoggedIn);
  console.log('isStudentLoggedIn: ', isStudentLoggedIn);
  console.log('isTeacherLoggedIn: ', isTeacherLoggedIn);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAdminLoggedIn(!!localStorage.getItem('adminToken'));
      setIsSubAdminLoggedIn(!!localStorage.getItem('subAdminToken'));
      setIsStudentLoggedIn(!!localStorage.getItem('token'));
      setIsTeacherLoggedIn(!!localStorage.getItem('teacherToken'));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore-campus" element={<VirtualCampus />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={isAdminLoggedIn ? <AdminDashboard /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/user-management" element={isAdminLoggedIn ? <UserManagement /> : <Navigate to="/admin/login" />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/profile" element={<ViewProfile />} />
        <Route path="/edit-avatar" element={<EditAvatar />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={isStudentLoggedIn ? <ChangePassword /> : <Navigate to="/login" />} />
        <Route path="/teacher/register" element={<TeacherRegister />} />
        <Route path="/teacher/profile/*" element={isTeacherLoggedIn ? <TeacherProfile /> : <Navigate to="/teacher/login" />} />
        <Route path="/teacher/manage" element={<TeacherProfileManagement />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/courses/add" element={<AddCourse />} />
        <Route path="/teacher/courses" element={<TeacherCourses />} />
        <Route path="/teacher/courses/edit/:courseId" element={<EditCourse />} />
        <Route path="/team/register" element={<TeamAccountCreation />} />
        <Route path="/team/login" element={<TeamLogin />} />
        <Route path="/team/dashboard/*" element={isSubAdminLoggedIn ? <TeamDashboard /> : <Navigate to="/team/login" />} />
        <Route path="/team/application/*" element={isSubAdminLoggedIn ? <TeamApplicationForm /> : <Navigate to="/team/login" />} />
        <Route path="/team/dashboard/quick-stats" element={<QuickStats />} />
        <Route path="/team/dashboard/manage-clubs" element={<ManageClubs />} />
        <Route path="/team/dashboard/game-arena" element={<GameArena />} />
        <Route path="/team/dashboard/reports" element={<Reports />} />
        <Route path="/team/dashboard/support" element={<SupportFeedback />} />
        <Route path="/team/dashboard/profile" element={<TeamProfile />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/teacher/live-sessions" element={<TeacherLiveSessions />} />
<Route path="/admin/event-management" element={isAdminLoggedIn ? <AdminLiveSessions /> : <Navigate to="/admin/login" />}  />
      </Routes>
    </Router>
  );
};

export default App;
//<Route path="edit-application" element={<TeacherEditApplication />} />
//<Route path="/teacher/view-application" element={<TeacherEditApplication />} />