import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const AdminSidebar = ({ isSidebarOpen, toggleSidebar }) => {
    return (
        <aside
            className={`bg-[#FFC5C3] text-white fixed top-0 left-0 h-full z-20 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ width: '240px' }}
        >
            {/* Close button for mobile */}
            <div className="flex justify-end p-4 md:hidden">
                <button onClick={toggleSidebar} className="text-gray-700 focus:outline-none">
                    <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                </button>
            </div>

            <div className="p-4">
                <h1 className="text-xl font-bold mb-4 text-black">Admin Panel</h1>
                <ul className="space-y-2 text-black">
                    <li>
                        <Link to="/admin/dashboard" className="block p-2 hover:bg-[#F38380] rounded-lg">
                            Quick Stats
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/user-management" className="block p-2 hover:bg-[#F38380] rounded-lg">
                            User Management
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/event-management" className="block p-2 hover:bg-[#F38380] rounded-lg">
                            Events/Hackathons
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/mentor-management" className="block p-2 hover:bg-[#F38380] rounded-lg">
                            Mentor Handling
                        </Link>
                    </li>
                    {/* Add more links here */}
                </ul>
            </div>
        </aside>
    );
};

export default AdminSidebar;
