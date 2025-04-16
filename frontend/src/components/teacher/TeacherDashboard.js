import React, { useState } from 'react';
import Navbar from '../Navbar';
import TeacherSidebar from './TeacherSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const TeacherDashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-md z-30 w-full">
        <Navbar /> {/* Removed props for toggle from Navbar */}
      </header>

      {/* Sidebar Toggle Button (visible on smaller screens, below Navbar) */}
      <button
        onClick={toggleMobileMenu}
        className="fixed top-16 left-4 bg-gray-800 text-white p-2 rounded-md z-20 lg:hidden shadow-md"
        style={{ top: '4rem' }} // Adjust top position based on your Navbar height
      >
        <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
      </button>

      <div className="flex flex-row flex-1 overflow-x-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 shadow-md z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <TeacherSidebar onCloseMobileMenu={toggleMobileMenu} />
        </aside>

        {/* Main Content */}
        <main className={`flex-1 py-28 px-4 lg:p-8 ${isMobileMenuOpen ? 'ml-0' : 'lg:ml-64'}`}>
          <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-[#F38380]">Welcome to your Teacher Dashboard!</h1>
          <div className="bg-white shadow-md rounded-md p-4 md:p-6">
            <p className="text-gray-700">Here you can manage your courses, schedule live sessions, track student performance, and more.</p>
            {/* Add more welcome content or widgets here */}
          </div>
          {/* You can add more sections for other functionalities */}
        </main>
      </div>
      {/* You might want to add a Footer here as well */}
    </div>
  );
};

export default TeacherDashboard;