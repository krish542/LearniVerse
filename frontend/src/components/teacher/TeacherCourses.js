import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import TeacherSidebar from './TeacherSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const TeacherCourses = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Add a loading state
  const [error, setError] = useState(null); // Add an error state

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const fetchTeacherCourses = async () => {
      const teacherToken = localStorage.getItem('teacherToken');
      if (!teacherToken) {
        navigate('/teacher/login');
        return;
      }
      setLoading(true); // Set loading to true before fetching
      setError(null); // Clear any previous errors

      try {
        const response = await fetch('/api/teacher/courses', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${teacherToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("API Response Data:", data);
          if (data && Array.isArray(data.courses)) {
            setCourses(data.courses);
          } else if (Array.isArray(data)) {
            setCourses(data); // Handle the case where the API returns an array directly
          } else {
            console.error('Invalid course data received:', data);
            setError('Failed to load courses due to invalid data format.');
            setCourses([]);
          }
        } else {
          const errorData = await response.json();
          console.error('Failed to fetch courses:', errorData.message || 'Something went wrong');
          setError(`Failed to load courses: ${errorData.message || 'Something went wrong'}`);
          setCourses([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses due to a network error.');
        setCourses([]);
      } finally {
        setLoading(false); // Set loading to false after fetching (success or error)
      }
    };

    fetchTeacherCourses();
  }, [navigate]);

  if (loading) {
    return <div className="flex justify-center items-center py-28 px-4 lg:p-8">Loading courses...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center py-28 px-4 lg:p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-md z-30 w-full">
        <Navbar />
      </header>

      <button
        onClick={toggleMobileMenu}
        className="fixed top-16 left-4 bg-gray-800 text-white p-2 rounded-md z-20 lg:hidden shadow-md"
        style={{ top: '4rem' }}
      >
        <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
      </button>

      <div className="flex flex-row flex-1 overflow-x-hidden">
        <aside
          className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 shadow-md z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <TeacherSidebar onCloseMobileMenu={toggleMobileMenu} />
        </aside>

        <main className={`flex-1 py-28 px-4 lg:p-8 ${isMobileMenuOpen ? 'ml-0' : 'lg:ml-64'}`}>
          <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-[#F38380]">My Courses</h1>
          <div className="bg-white shadow-md rounded-md overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thumbnail
                  </th>
                  <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider md:table-cell hidden">
                    Category
                  </th>
                  <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider md:table-cell hidden">
                    Price
                  </th>
                  <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    {console.log("Link Rendering - Course ID:", course._id)}
                    <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                      {course.thumbnail && (
                        <img
                          src={`${course.thumbnail}`}
                          alt={course.title}
                          className="h-10 w-16 object-cover rounded"
                        />
                      )}
                      {!course.thumbnail && (
                        <div className="h-10 w-16 bg-gray-300 rounded"></div>
                      )}
                    </td>
                    <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{course.title}</p>
                    </td>
                    <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm md:table-cell hidden">
                      <p className="text-gray-900 whitespace-no-wrap">{course.category}</p>
                    </td>
                    <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm md:table-cell hidden">
                      <p className="text-gray-900 whitespace-no-wrap">
                        {course.isMonetized ? `₹${course.price}` : 'Free'}
                      </p>
                    </td>
                    <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                      <div className="flex items-center">
                        <Link to={`/teacher/courses/edit/${course._id}`} className="text-indigo-600 hover:text-indigo-900 mr-2">
                          <FontAwesomeIcon icon={faEdit} className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => console.log(`Delete course ${course._id}`)} // Implement delete logic later
                          className="text-red-600 hover:text-red-900"
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && !loading && !error && (
                  <tr>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center" colSpan="5">
                      <p className="text-gray-500">No courses added yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherCourses;