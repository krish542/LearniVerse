import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = ()=>{
    localStorage.removeItem('token');
    navigate('/login');
  }
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 fixed top-0 left-0 right-0 z-50 border-b-2 border-yellow-400 shadow-lg">
      {/* Left Side: Logo or Site Name */}
      <div className="text-xl md:text-2xl font-pixel text-yellow-400">
        <Link to="/">Learniverse</Link>
      </div>

      {/* Hamburger Menu for Mobile */}
      <button
        className="text-yellow-400 md:hidden focus:outline-none"
        onClick={toggleMenu}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16m-7 6h7"
          ></path>
        </svg>
      </button>

      {/* Right Side: Navigation Links */}
      <div
        className={`md:flex md:space-x-6 ${
          isMenuOpen ? 'block' : 'hidden'
        } absolute md:static top-16 left-0 right-0 bg-gray-900 md:bg-transparent p-4 md:p-0`}
      >
        <Link
          to="/leaderboard"
          className={`block md:inline text-yellow-400 hover:text-white font-pixel transition duration-300 ${
            location.pathname === '/leaderboard' ? 'underline' : ''
          }`}
        >
          Leaderboard
        </Link>
        <Link
          to="/courses"
          className={`block md:inline text-yellow-400 hover:text-white font-pixel transition duration-300 ${
            location.pathname === '/courses' ? 'underline' : ''
          }`}
        >
          Courses
        </Link>
        <Link
          to="/explore-campus"
          className={`block md:inline text-yellow-400 hover:text-white font-pixel transition duration-300 ${
            location.pathname === '/explore-campus' ? 'underline' : ''
          }`}
        >
          Explore Campus
        </Link>
        {token ? (
          <>
            <Link to="/profile" className="block md:inline text-yellow-400 hover:text-white font-pixel transition duration-300">View Profile</Link>
            <Link to="/cart" className="block md:inline text-yellow-400 hover:text-white font-pixel transition duration-300">
              <FaShoppingCart size={20} className="inline" />
            </Link>
            <button onClick={handleLogout} className="block md:inline text-yellow-400 hover:text-white font-pixel transition duration-300">Logout</button>
          </>
        ) : (
          <Link to="/login" className="block md:inline text-yellow-400 hover:text-white font-pixel transition duration-300">Login/Signup</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;