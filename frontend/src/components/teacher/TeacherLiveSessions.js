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
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState({
    sessions: true,
    courses: true,
    workshops: true
  });
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
      setLoading(prev => ({ ...prev, sessions: false }));
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
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  };

  const fetchWorkshops = async () => {
    setLoading(prev => ({ ...prev, workshops: true }));
    setError(null);
    
    try {
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        navigate('/teacher/login');
        return;
      }
      console.log('Fetching workshops');
      const response = await axios.get('http://localhost:5000/api/workshops/my-workshops', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Workshop response: ', response.data);
      if (response.data && Array.isArray(response.data.workshops)) {
        setWorkshops(response.data.workshops);
      } else {
        console.error('Unexpected response format:', response.data);
        setWorkshops([]);
      }
    } catch (err) {
      console.error('Workshop fetch error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      if (err.response?.status === 401) {
        // Unauthorized - token invalid or expired
        localStorage.removeItem('teacherToken');
        navigate('/teacher/login');
      } else {
        setError('Failed to load workshops. Please try again later.');
      }
    } finally {
      setLoading(prev => ({ ...prev, workshops: false }));
    }
  };

  const handleRespondToWorkshop = async (workshopId, response) => {
    try {
      const token = localStorage.getItem('teacherToken');
      await axios.put(
        `http://localhost:5000/api/workshops/respond/${workshopId}`,
        { response },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(`Workshop ${response} successfully`);
      fetchWorkshops();
    } catch (err) {
      console.error('Error responding to workshop:', err);
      alert(`Failed to ${response} workshop`);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchCourses();
    fetchSessions();
    fetchWorkshops();
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
          <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-[#F38380]">Live Sessions & Workshops</h1>

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
          <div className="bg-white rounded shadow p-6 mb-10">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Your Live Sessions</h2>
            {loading.sessions ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
              </div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : sessions.length === 0 ? (
              <p className="text-gray-500">No live sessions scheduled.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 border text-left">Title</th>
                      <th className="py-2 px-4 border text-left">Date</th>
                      <th className="py-2 px-4 border text-left">Course</th>
                      <th className="py-2 px-4 border text-left">Link</th>
                      <th className="py-2 px-4 border text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session._id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border">{session.title}</td>
                        <td className="py-2 px-4 border">{formatDate(session.scheduledAt)}</td>
                        <td className="py-2 px-4 border">
                          {session.courseId?.title || 'Unknown Course'}
                        </td>
                        <td className="py-2 px-4 border">
                          <a
                            href={session.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Join
                          </a>
                        </td>
                        <td className="py-2 px-4 border">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSession(session)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSession(session._id)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Workshop Proposals */}
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Workshop Proposals</h2>
            {loading.workshops ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
              </div>
            ) : workshops.length === 0 ? (
              <p className="text-gray-500">No workshop proposals received.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 border text-left">Title</th>
                      <th className="py-2 px-4 border text-left">Description</th>
                      <th className="py-2 px-4 border text-left">Proposed Dates</th>
                      <th className="py-2 px-4 border text-left">Status</th>
                      <th className="py-2 px-4 border text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workshops.map((workshop) => (
                      <tr key={workshop._id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border">{workshop.title}</td>
                        <td className="py-2 px-4 border">
                          <p className="line-clamp-2">{workshop.description}</p>
                        </td>
                        <td className="py-2 px-4 border">
                          {workshop.suggestedByAdmin?.suggestedDates?.map(formatDate).join(', ') || 'Not specified'}
                        </td>
                        <td className="py-2 px-4 border">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            workshop.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            workshop.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {workshop.status}
                          </span>
                        </td>
                        <td className="py-2 px-4 border">
                          {workshop.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRespondToWorkshop(workshop._id, 'accepted')}
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRespondToWorkshop(workshop._id, 'rejected')}
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {workshop.status === 'accepted' && workshop.final?.meetLinks?.length > 0 && (
                            <a
                              href={workshop.final.meetLinks[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Join Workshop
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherLiveSessions;