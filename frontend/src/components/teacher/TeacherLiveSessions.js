import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import TeacherSidebar from './TeacherSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import API_BASE_URL from '../../utils/apiConfig';
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
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [workshopFormData, setWorkshopFormData] = useState({
  suggestedSessions: '',
  suggestedDates: [],
  feedback: '',
  tempDate: '' // Temporary field for date input
});
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
      const response = await fetch(`${API_BASE_URL}/api/live-sessions`, {
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
  const handleAcceptWorkshop = async (workshopId) => {
    try {
      const token = localStorage.getItem('teacherToken');
      const response = await axios.put(
        `${API_BASE_URL}/api/workshops/accept/${workshopId}`,
        {
          suggestedSessions: workshopFormData.suggestedSessions,
          suggestedDates: workshopFormData.suggestedDates,
          feedback: workshopFormData.feedback
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      alert('Workshop accepted successfully! Admin will finalize the details.');
      setIsModalOpen(false);
      setSelectedWorkshop(null);
      setWorkshopFormData({
        suggestedSessions: '',
        suggestedDates: [],
        feedback: '',
        tempDate: ''
      });
      fetchWorkshops();
    } catch (err) {
      console.error('Error accepting workshop:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });
      alert('Failed to accept workshop');
    }
  };
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('teacherToken');
      const response = await axios.get(`${API_BASE_URL}/api/teacher/courses`, {
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
      const response = await axios.get(`${API_BASE_URL}/api/workshops/my-workshops`, {
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
        `${API_BASE_URL}/api/workshops/respond/${workshopId}`,
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
                {workshop.status === 'finalized' && workshop.final?.confirmedDates?.length > 0
                  ? workshop.final.confirmedDates.map(formatDate).join(', ')
                  : workshop.suggestedByAdmin?.suggestedDates?.map(formatDate).join(', ') || 'Not specified'}
              </td>
              <td className="py-2 px-4 border">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  workshop.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' :
                  workshop.status === 'accepted' 
                    ? 'bg-blue-100 text-blue-800' :
                  workshop.status === 'finalized' 
                    ? 'bg-green-100 text-green-800' :
                  workshop.status === 'rejected' 
                    ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                  {workshop.status}
                </span>
              </td>
              <td className="py-2 px-4 border">
                {workshop.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedWorkshop(workshop);
                        setIsModalOpen(true);
                        // Pre-fill form with any existing teacher suggestions
                        setWorkshopFormData({
                          suggestedSessions: workshop.suggestedByTeacher?.sessions || '',
                          suggestedDates: workshop.suggestedByTeacher?.suggestedDates?.map(d => new Date(d).toISOString().slice(0, 16)) || [],
                          feedback: workshop.feedback || '',
                          tempDate: ''
                        });
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                    >
                      View & Respond
                    </button>
                  </div>
                )}
                
                {workshop.status === 'accepted' && (
                  <span className="text-gray-500 text-sm">
                    Waiting for admin to finalize
                  </span>
                )}
                
                {workshop.status === 'finalized' && workshop.final?.meetLinks?.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <a
                      href={workshop.final.meetLinks[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Join Workshop
                    </a>
                    <span className="text-xs text-gray-500">
                      {workshop.final.totalSessions} session(s)
                    </span>
                  </div>
                )}
                
                {workshop.status === 'rejected' && (
                  <span className="text-gray-500 text-sm">
                    Proposal declined
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
{isModalOpen && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
    onClick={() => {
      setIsModalOpen(false);
      setSelectedWorkshop(null);
      setWorkshopFormData({
        suggestedSessions: '',
        suggestedDates: [],
        feedback: '',
        tempDate: ''
      });
    }}
  >
    <div 
      className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to overlay
    >
      {/* Modal Header */}
      <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">Workshop Details: {selectedWorkshop?.title}</h2>
        <button
          onClick={() => {
            setIsModalOpen(false);
            setSelectedWorkshop(null);
            setWorkshopFormData({
              suggestedSessions: '',
              suggestedDates: [],
              feedback: '',
              tempDate: ''
            });
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Modal Content */}
      <div className="p-4">
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Admin's Proposal:</h3>
          <div className="space-y-2">
            <p><strong>Description:</strong> {selectedWorkshop?.description}</p>
            <p><strong>Sample Outline:</strong> {selectedWorkshop?.sampleOutline}</p>
            <p><strong>Proposed Sessions:</strong> {selectedWorkshop?.suggestedByAdmin?.sessions}</p>
            <p><strong>Proposed Dates:</strong> {selectedWorkshop?.suggestedByAdmin?.suggestedDates?.map(formatDate).join(', ')}</p>
          </div>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          handleAcceptWorkshop(selectedWorkshop._id);
        }}>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Your Suggested Number of Sessions</label>
              <input
                type="number"
                value={workshopFormData.suggestedSessions}
                onChange={(e) => setWorkshopFormData({...workshopFormData, suggestedSessions: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Add Suggested Dates</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="datetime-local"
                  value={workshopFormData.tempDate}
                  onChange={(e) => setWorkshopFormData({...workshopFormData, tempDate: e.target.value})}
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (workshopFormData.tempDate) {
                      setWorkshopFormData({
                        ...workshopFormData,
                        suggestedDates: [...workshopFormData.suggestedDates, workshopFormData.tempDate],
                        tempDate: ''
                      });
                    }
                  }}
                  className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Add Date
                </button>
              </div>
              <div className="mt-2 space-y-1">
                {workshopFormData.suggestedDates.map((date, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                    <span className="text-sm">{formatDate(date)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newDates = [...workshopFormData.suggestedDates];
                        newDates.splice(index, 1);
                        setWorkshopFormData({...workshopFormData, suggestedDates: newDates});
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Feedback/Notes</label>
              <textarea
                value={workshopFormData.feedback}
                onChange={(e) => setWorkshopFormData({...workshopFormData, feedback: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedWorkshop(null);
                  setWorkshopFormData({
                    suggestedSessions: '',
                    suggestedDates: [],
                    feedback: '',
                    tempDate: ''
                  });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Submit Acceptance
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
        </main>
      </div>
    </div>
  );
};

export default TeacherLiveSessions;