import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import TeacherSidebar from './TeacherSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

// Helper: Google Calendar Link Generator
function generateCalendarURL(title, startDate, endDate, description) {
  const format = (date) => date.toISOString().replace(/-|:|\.\d+/g, '');
  const start = format(startDate);
  const end = format(endDate);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${start}/${end}&details=${encodeURIComponent(description)}`;
}

const TeacherLiveSessions = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    durationMinutes: 60,
    courseId: '',
    meetLink: ''
  });
  const [editingSession, setEditingSession] = useState(null);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCalendar = () => {
    const start = new Date(formData.scheduledAt);
    const end = new Date(start.getTime() + formData.durationMinutes * 60000);
    const calendarURL = generateCalendarURL(formData.title, start, end, formData.description);
    window.open(calendarURL, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('teacherToken');
      if (editingSession) {
        await axios.put(`/api/live-sessions/${editingSession._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert('Live session updated!');
      } else {
        await axios.post('/api/live-sessions', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert('Live session created!');
      }

      setFormData({
        title: '',
        description: '',
        scheduledAt: '',
        durationMinutes: 60,
        courseId: '',
        meetLink: '',
      });

      setEditingSession(null);
      fetchSessions();
    } catch (err) {
      console.error(err);
      alert('Failed to save session');
    }
  };

  const fetchSessions = async () => {
    const token = localStorage.getItem('teacherToken');
    if (!token) {
      navigate('/teacher/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/live-sessions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch sessions');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('teacherToken');
      const response = await axios.get('http://localhost:5000/api/teacher/courses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCourses(response.data || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description,
      scheduledAt: session.scheduledAt,
      durationMinutes: session.durationMinutes,
      courseId: session.courseId._id || session.courseId,
      meetLink: session.meetLink,
    });
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      const token = localStorage.getItem('teacherToken');
      await axios.delete(`/api/live-sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Session deleted');
      fetchSessions();
    } catch (err) {
      alert('Failed to delete session');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchSessions();
  }, []);

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
          <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-[#F38380]">Live Sessions</h1>

          {/* Session Creation/Editing Form */}
          <div className="bg-white rounded shadow p-6 mb-10">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editingSession ? 'Edit Live Session' : 'Schedule a New Live Session'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="title"
                type="text"
                placeholder="Session Title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                name="description"
                placeholder="Session Description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                name="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                name="durationMinutes"
                type="number"
                placeholder="Duration (in minutes)"
                value={formData.durationMinutes}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select a Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <input
                  name="meetLink"
                  type="url"
                  placeholder="Paste Google Meet Link"
                  value={formData.meetLink}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <button
                  type="button"
                  onClick={openCalendar}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Create Meet
                </button>
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                {editingSession ? 'Update Session' : 'Save Session'}
              </button>
            </form>
          </div>

          {/* Existing Sessions */}
          {loading ? (
            <p>Loading sessions...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : sessions.length === 0 ? (
            <p className="text-gray-500">No live sessions scheduled.</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session._id} className="bg-white shadow rounded p-4">
                  <h2 className="text-lg font-semibold">{session.title}</h2>
                  <p><strong>Date:</strong> {new Date(session.scheduledAt).toLocaleString()}</p>
                  <p>
                    <strong>Course:</strong>{' '}
                    {session.courseId?.title || 'Unknown Course'}
                  </p>
                  <a
                    href={session.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline mt-2 inline-block"
                  >
                    Join Meet
                  </a>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEditSession(session)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherLiveSessions;
