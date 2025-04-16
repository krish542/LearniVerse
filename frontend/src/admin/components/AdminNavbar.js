import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const AdminNavbar = ({ toggleSidebar }) => {
    return (
        <nav className="bg-[#F38380] p-4 shadow-md fixed w-full z-30 top-0 left-0">
            <div className="container mx-auto flex justify-between items-center px-4">
                {/* Hamburger for mobile */}
                <button
                    onClick={toggleSidebar}
                    className="text-white md:hidden focus:outline-none"
                >
                    <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <button
                    onClick={() => {
                        localStorage.removeItem('adminToken');
                        localStorage.setItem('logout', 'admin');
                        localStorage.removeItem('logout');
                        window.location.href = '/admin/login';
                    }}
                    className="text-white hover:text-gray-200"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default AdminNavbar;
