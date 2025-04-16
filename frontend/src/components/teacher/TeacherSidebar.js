import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBook, faCalendarAlt, faChartBar, faComments, faMoneyBillWave, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons'; // Import more icons

const TeacherSidebar = ({ onCloseMobileMenu }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('teacherToken');
    navigate('/teacher/login');
  };

  return (
    <>
      {/* Mobile Menu Close Button (visible only on small screens) */}
      <div className="lg:hidden absolute top-4 left-4 z-50">
        <button onClick={onCloseMobileMenu} className="bg-gray-800 text-white p-2 rounded-md">
          <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar */}
      <div className="h-full flex flex-col justify-between">
        <div className="p-4 px-16">
          <span className="text-lg font-semibold block mb-4">Learniverse</span>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <Link to="/teacher/dashboard" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                <span>Welcome</span>
              </Link>
            </li>
            <li>
              <div className="border-t border-gray-700 my-2"></div>
              <span className="block text-gray-400 p-2 text-sm">Profile</span>
              <Link to="/teacher/profile" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                <span>Profile Settings</span>
              </Link>
              <Link to="/teacher/profile/edit-password" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                <span>Edit Password</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center p-2 hover:bg-gray-700 rounded-md w-full text-left">
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                <span>Logout</span>
              </button>
            </li>
            <li>
              <div className="border-t border-gray-700 my-2"></div>
              <span className="block text-gray-400 p-2 text-sm">Courses</span>
              <Link to="/teacher/courses" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                <FontAwesomeIcon icon={faBook} className="mr-2" />
                <span>My Courses</span>
              </Link>
              <Link to="/teacher/courses/add" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                <span>Add Course</span>
              </Link>
              {/* Add links for update and delete later */}
            </li>
            <li>
              <div className="border-t border-gray-700 my-2"></div>
              <span className="block text-gray-400 p-2 text-sm">Management</span>
              <Link to="/teacher/live-sessions" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                <span>Live Sessions</span>
              </Link>
              <Link to="/teacher/quizzes" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                <span>Quiz Manager</span>
              </Link>
              <Link to="/teacher/assignments" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                <span>Assignment Manager</span>
              </Link>
            </li>
            <li>
              <div className="border-t border-gray-700 my-2"></div>
              <span className="block text-gray-400 p-2 text-sm">Interaction</span>
              <Link to="/teacher/analytics" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                <FontAwesomeIcon icon={faChartBar} className="mr-2" />
                <span>Analytics</span>
              </Link>
              <Link to="/teacher/discussion" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                <FontAwesomeIcon icon={faComments} className="mr-2" />
                <span>Discussion Board</span>
              </Link>
            </li>
            <li>
              <div className="border-t border-gray-700 my-2"></div>
              <Link to="/teacher/earnings" className="flex items-center p-2 hover:bg-gray-700 rounded-md">
                <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />
                <span>Earnings</span>
              </Link>
            </li>
          </ul>
        </nav>
        {/* Optional: Footer for the sidebar */}
        {/* <div className="p-4 border-t border-gray-700 text-center text-gray-400 text-sm">
          © 2025 Learniverse
        </div> */}
      </div>
    </>
  );
};

export default TeacherSidebar;