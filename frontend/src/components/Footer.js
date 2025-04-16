import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-pixel text-yellow-400 mb-4">About Learniverse</h3>
            <p className="text-gray-300">
              Learniverse is a gamified virtual university platform where students can explore, learn, and grow in an interactive environment.
            </p>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-xl font-pixel text-yellow-400 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/courses" className="text-gray-300 hover:text-yellow-400">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-gray-300 hover:text-yellow-400">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/explore-campus" className="text-gray-300 hover:text-yellow-400">
                  Explore Campus
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-yellow-400">
                  Signup as Student
                </Link>
              </li>
            </ul>
          </div>

          {/* Join Section */}
          <div>
            <h3 className="text-xl font-pixel text-yellow-400 mb-4">Join Us</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/teacher/register" className="text-gray-300 hover:text-yellow-400">
                  Join as Teacher
                </Link>
              </li>
              <li>
                <Link to="/teacher/login" className="text-gray-300 hover:text-yellow-400">
                  Teacher Login
                </Link>
              </li>
              <li>
                <Link to="/team/register" className="text-gray-300 hover:text-yellow-400">
                  Join Our Team
                </Link>
              </li>
              <li>
                <Link to="/team/login" className="text-gray-300 hover:text-yellow-400">
                  Team Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Accounts & Support Section */}
          <div>
            <h3 className="text-xl font-pixel text-yellow-400 mb-4">Accounts & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/report" className="text-gray-300 hover:text-yellow-400">
                  Report a Problem
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-gray-300 hover:text-yellow-400">
                  Submit Feedback
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            &copy; {new Date().getFullYear()} Learniverse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
