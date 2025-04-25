import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';

const WorkshopsTab = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sampleOutline: '',
    suggestedDates: [''],
    selectedTeacher: null,
  });
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [teachers, setTeachers] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [pendingWorkshops, setPendingWorkshops] = useState([]);
  const [acceptedWorkshops, setAcceptedWorkshops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState({});
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [finalizeFormData, setFinalizeFormData] = useState({
    totalSessions: '',
    confirmedDates: [],
    meetLinks: [''],
    finalOutline: '',
    poster: null,
    posterPreview: '',
    tempDate: '',
    tempMeetLink: ''
  });
  function generateCalendarURL(title, startDate, endDate, description) {
    const format = (date) => date.toISOString().replace(/-|:|\.\d+/g, '');
    const start = format(startDate);
    const end = format(endDate);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${start}/${end}&details=${encodeURIComponent(description)}`;
  }
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/teacher/getAllTeachers');
        const teacherOptions = res.data.map(teacher => ({
          value: teacher._id,
          label: `${teacher.fullName} (${teacher.subjectsCanTeach})`,
          ...teacher
        }));
        setTeachers(teacherOptions);
      } catch (err) {
        console.error('Error fetching teachers:', err);
      }
    };
    
    
    const fetchWorkshops = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [workshopsRes, teachersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/workshops/all'),
          axios.get('http://localhost:5000/api/teacher/getAllTeachers')
        ]);
    
        // Create a map of teachers for quick lookup
        const teachersMap = {};
        teachersRes.data.forEach(teacher => {
          teachersMap[teacher._id] = teacher;
        });
    
        // Combine the data
        const workshopsWithTeachers = workshopsRes.data.workshops.map(workshop => ({
          ...workshop,
          teacher: teachersMap[workshop.teacherId] || null
        }));
    
        setWorkshops(workshopsWithTeachers);
        setPendingWorkshops(workshopsWithTeachers.filter(w => w.status === 'pending'));
        setAcceptedWorkshops(workshopsWithTeachers.filter(w => w.status === 'accepted' || w.status === 'finalized'));
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
    fetchWorkshops();
  }, []);

  const handleChange = (e, index = null) => {
    if (e?.target?.name === 'suggestedDates') {
      const updated = [...formData.suggestedDates];
      updated[index] = e.target.value;
      setFormData({ ...formData, suggestedDates: updated });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleTeacherSelect = (selectedOption) => {
    setFormData({ ...formData, selectedTeacher: selectedOption });
  };

  const addSuggestedDate = () => {
    setFormData({ ...formData, suggestedDates: [...formData.suggestedDates, ''] });
  };

  const removeSuggestedDate = (index) => {
    const updated = formData.suggestedDates.filter((_, i) => i !== index);
    setFormData({ ...formData, suggestedDates: updated });
  };

  const handleCreateWorkshop = async () => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        sampleOutline: formData.sampleOutline,
        adminId: '67e9c27a3d223fd6aa05764d',
        teacherId: formData.selectedTeacher.value,
        suggestedByAdmin: {
          sessions: formData.suggestedDates.length,
          suggestedDates: formData.suggestedDates.map(date => new Date(date)),
        },
      };

      const res = await axios.post('http://localhost:5000/api/workshops/send-proposal', payload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      // Update both pending workshops and all workshops
      setPendingWorkshops([res.data.workshop, ...pendingWorkshops]);
      setWorkshops([res.data.workshop, ...workshops]);

      setFormData({
        title: '',
        description: '',
        sampleOutline: '',
        suggestedDates: [''],
        selectedTeacher: null,
      });

      alert('Workshop request sent successfully!');
    } catch (err) {
      console.error('Error details', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      alert('Failed to create workshop. Please check console for details.');
    }
  };
  const handleFinalizeWorkshop = async (workshopId) => {
    try {
      console.log('Starting finalization');
      const formData = new FormData();
      formData.append('totalSessions', finalizeFormData.totalSessions);
      formData.append('finalOutline', finalizeFormData.finalOutline);
      console.log("Dates to send:", finalizeFormData.confirmedDates);
    console.log("Links to send:", finalizeFormData.meetLinks);
      finalizeFormData.confirmedDates.forEach(date => {
        formData.append('confirmedDates', date);
      });
      finalizeFormData.meetLinks.forEach(link => {
        formData.append('meetLinks', link);
      });
      if (finalizeFormData.poster) {
        console.log("Poster file:", finalizeFormData.poster.name, finalizeFormData.poster.size);
        formData.append('poster', finalizeFormData.poster);
      }
      else{
        console.log('No poster file selected');
      }
      console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
      const response = await axios.put(
        `http://localhost:5000/api/workshops/finalize/${workshopId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 10000
        }
      ).catch(err => {
        console.error('Request failed: ', err.response?err.response.data: err.message); throw err;
      });
      console.log("Response received:", response.data);
      alert('Workshop finalized successfully!');
      setIsFinalizeModalOpen(false);
      // Refresh workshops data
      const res = await axios.get('http://localhost:5000/api/workshops/all');
      const updatedWorkshops = res.data.workshops.map(workshop => ({
        ...workshop,
        teacher: teachers.find(t => t.value === workshop.teacherId) || null
      }));
      setWorkshops(res.data.workshops);
      setPendingWorkshops(updatedWorkshops.filter(w => w.status === 'pending'));
      setAcceptedWorkshops(updatedWorkshops.filter(w => 
        w.status === 'accepted' || w.status === 'finalized'
      ));
    } catch (err) {
      console.error('Error finalizing workshop:', err);
      if (err.response) {
      console.error('Response data:', err.response.data);
      console.error('Response status:', err.response.status);
      console.error('Response headers:', err.response.headers);
    }

      alert('Failed to finalize workshop. Please check console for details.');
    }
  };
  const handleResendEmail = async (workshopId) => {
    setResending(prev => ({ ...prev, [workshopId]: true }));
    try {
      const res = await axios.post(
        `http://localhost:5000/api/workshops/resend-email/${workshopId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      alert('Reminder email sent successfully!');
    } catch (err) {
      console.error('Error resending email:', err);
      alert('Failed to send reminder email');
    } finally {
      setResending(prev => ({ ...prev, [workshopId]: false }));
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

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Workshops Management</h2>
      
      {/* Workshop Creation Form */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">Propose New Workshop</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Workshop Title"
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Teacher</label>
            <Select
              options={teachers}
              value={formData.selectedTeacher}
              onChange={handleTeacherSelect}
              placeholder="Select a Teacher"
              isSearchable
              className="basic-single"
              classNamePrefix="select"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Workshop Purpose/Description"
              className="border p-2 rounded w-full"
              rows={3}
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Sample Outline</label>
            <textarea
              name="sampleOutline"
              value={formData.sampleOutline}
              onChange={handleChange}
              placeholder="Sample Outline"
              className="border p-2 rounded w-full"
              rows={3}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block font-medium mb-2">Suggested Date & Times</label>
          {formData.suggestedDates.map((date, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <input
                type="datetime-local"
                name="suggestedDates"
                value={date}
                onChange={(e) => handleChange(e, index)}
                className="border p-2 rounded flex-1"
              />
              {formData.suggestedDates.length > 1 && (
                <button
                  onClick={() => removeSuggestedDate(index)}
                  className="text-red-600 hover:text-red-800 p-2"
                  aria-label="Remove date"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addSuggestedDate}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add another date
          </button>
        </div>
        <button
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors duration-200 flex items-center justify-center"
          onClick={handleCreateWorkshop}
          disabled={!formData.title || !formData.selectedTeacher}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          Send Request to Teacher
        </button>
      </div>

      {/* Pending Workshops Table */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">Pending Workshop Requests</h3>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : pendingWorkshops.length === 0 ? (
          <p className="text-gray-500 italic py-4">No pending workshop requests</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 border text-left">Title</th>
                  <th className="py-3 px-4 border text-left">Teacher</th>
                  <th className="py-3 px-4 border text-left">Proposed Dates</th>
                  <th className="py-3 px-4 border text-left">Status</th>
                  <th className="py-3 px-4 border text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingWorkshops.map(workshop => (
                  <tr key={workshop._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border">{workshop.title}</td>
                    <td className="py-3 px-4 border">
                      {workshop.teacher
                        ? `${workshop.teacher.fullName}${workshop.teacher.subjectsCanTeach ? ` (${Array.isArray(workshop.teacher.subjectsCanTeach) ? workshop.teacher.subjectsCanTeach.join(', ') : workshop.teacher.subjectsCanTeach})` : ''}`
                        : 'N/A'}
                    </td>
                    <td className="py-3 px-4 border">
                      {workshop.suggestedByAdmin?.suggestedDates?.map(formatDate).join(', ') || 'Not specified'}
                    </td>
                    <td className="py-3 px-4 border">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        workshop.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        workshop.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {workshop.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 border">
                      <button
                        onClick={() => handleResendEmail(workshop._id)}
                        disabled={resending[workshop._id]}
                        className={`text-blue-600 hover:text-blue-800 flex items-center ${resending[workshop._id] ? 'opacity-50' : ''}`}
                      >
                        {resending[workshop._id] ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            Resend Email
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Accepted & Finalized Workshops Table */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Accepted Workshops</h3>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : acceptedWorkshops.length === 0 ? (
          <p className="text-gray-500 italic py-4">No accepted workshops</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 border text-left">Workshop</th>
                  <th className="py-3 px-4 border text-left">Teacher</th>
                  <th className="py-3 px-4 border text-left">Scheduled Dates</th>
                  <th className="py-3 px-4 border text-left">Meet Links</th>
                  <th className="py-3 px-4 border text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {acceptedWorkshops.map(workshop => (
                  <tr key={workshop._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border">
                      <div className="flex items-center gap-3">
                        {workshop.poster && (
                          <div className="w-10 h-10 flex-shrink-0 border rounded overflow-hidden">
                            <img 
                              src={`http://localhost:5000${workshop.poster}`} 
                              alt="Workshop poster"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = '/default-poster.jpeg';
                              }}
                            />
                          </div>
                        )}
                        <span>{workshop.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 border">
    {workshop.teacherId?.fullName || 'N/A'}
    {workshop.teacherId?.subjectsCanTeach && (
      ` (${Array.isArray(workshop.teacherId.subjectsCanTeach) 
        ? workshop.teacherId.subjectsCanTeach.join(', ') 
        : workshop.teacherId.subjectsCanTeach})`
    )}
  </td>
                    <td className="py-3 px-4 border">
                      {workshop.final?.confirmedDates?.map(formatDate).join(', ') || 
                       workshop.suggestedByAdmin?.suggestedDates?.map(formatDate).join(', ') || 
                       'Not specified'}
                    </td>
                    <td className="py-3 px-4 border">
                      {workshop.final?.meetLinks?.map((link, i) => (
                        <a 
                          key={i} 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 block mb-1 last:mb-0"
                        >
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                            </svg>
                            Session {i+1}
                          </span>
                        </a>
                      )) || 'Not scheduled'}
                    </td>
                    <td className="py-3 px-4 border">
  <div className="flex flex-col sm:flex-row gap-2">
    <span className={`px-2 py-1 rounded-full text-xs ${
      workshop.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
      workshop.status === 'finalized' ? 'bg-green-100 text-green-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      {workshop.status}
    </span>
    {workshop.status === 'finalized' && workshop.poster && (
                          <span className="text-green-500" title="Poster uploaded">
                            
                          </span>
                        )}
    {workshop.status === 'accepted' && (
      <button
        onClick={() => {
          setSelectedWorkshop(workshop);
          setIsFinalizeModalOpen(true);
          // Pre-fill form with any existing data
          setFinalizeFormData({
            totalSessions: workshop.suggestedByTeacher?.sessions || '',
            confirmedDates: workshop.final?.confirmedDates || [],
            meetLinks: workshop.final?.meetLinks || [''],
            finalOutline: workshop.finalOutline || '',
            poster: null,
            posterPreview: workshop.posterUrl || '',
            tempDate: '',
            tempMeetLink: ''
          });
        }}
        className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm"
      >
        Finalize
      </button>
    )}
  </div>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {isFinalizeModalOpen && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
    onClick={() => {
      setIsFinalizeModalOpen(false);
      setSelectedWorkshop(null);
      setFinalizeFormData({
        totalSessions: '',
        confirmedDates: [],
        meetLinks: [''],
        finalOutline: '',
        poster: null,
        posterPreview: '',
        tempDate: '',
        tempMeetLink: ''
      });
    }}
  >
    <div 
      className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">Finalize Workshop: {selectedWorkshop?.title}</h2>
        <button
          onClick={() => {
            setIsFinalizeModalOpen(false);
            setSelectedWorkshop(null);
            setFinalizeFormData({
              totalSessions: '',
              confirmedDates: [],
              meetLinks: [''],
              finalOutline: '',
              poster: null,
              posterPreview: '',
              tempDate: '',
              tempMeetLink: ''
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
        {/* Workshop Details Section */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Workshop Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Teacher:</strong> {selectedWorkshop?.teacherId?.fullName || 'N/A'}</p>
              <p><strong>Original Description:</strong> {selectedWorkshop?.description}</p>
              {selectedWorkshop?.sampleOutline && (
        <div className="mt-2">
          <p className="font-medium">Admin's Sample Outline:</p>
          <p className="text-sm bg-gray-50 p-2 rounded">{selectedWorkshop.sampleOutline}</p>
        </div>
      )}
            </div>
            <div>
              <p><strong>Teacher's Suggested Sessions:</strong> {selectedWorkshop?.suggestedByTeacher?.sessions || 'N/A'}</p>
              <p><strong>Admin's Suggested Dates:</strong> {selectedWorkshop?.suggestedByAdmin?.suggestedDates?.map(formatDate).join(', ') || 'N/A'}</p>
              {selectedWorkshop?.feedback && (
        <div className="mt-2">
          <p className="font-medium">Teacher's Feedback:</p>
          <p className="text-sm bg-gray-50 p-2 rounded">{selectedWorkshop.feedback}</p>
        </div>
      )}
            </div>
          </div>
        </div>

        {/* Finalization Form */}
        <form onSubmit={(e) => {
          e.preventDefault();
          handleFinalizeWorkshop(selectedWorkshop._id);
        }}>
          <div className="space-y-4">
            {/* Total Sessions */}
            <div>
              <label className="block mb-1 text-sm font-medium">Total Sessions</label>
              <input
                type="number"
                value={finalizeFormData.totalSessions}
                onChange={(e) => setFinalizeFormData({
                  ...finalizeFormData,
                  totalSessions: e.target.value
                })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                required
              />
            </div>

            {/* Date Selection */}
            <div>
              <label className="block mb-1 text-sm font-medium">Select Dates</label>
              
              {/* Teacher's Suggested Dates */}
              {selectedWorkshop?.suggestedByTeacher?.suggestedDates?.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium mb-2">Teacher's Suggestions:</p>
                  <div className="space-y-2">
                    {selectedWorkshop.suggestedByTeacher.suggestedDates.map((date, index) => {
                      const dateStr = new Date(date).toISOString();
                      const isChecked = finalizeFormData.confirmedDates.includes(dateStr);
                      return (
                        <div key={index} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`teacher-date-${index}`}
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setFinalizeFormData({
                                  ...finalizeFormData,
                                  confirmedDates: finalizeFormData.confirmedDates.filter(d => d !== dateStr)
                                });
                              } else {
                                setFinalizeFormData({
                                  ...finalizeFormData,
                                  confirmedDates: [...finalizeFormData.confirmedDates, dateStr]
                                });
                              }
                            }}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`teacher-date-${index}`} className="ml-2 text-sm">
                            {formatDate(date)}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Admin's Suggested Dates */}
              {selectedWorkshop?.suggestedByAdmin?.suggestedDates?.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium mb-2">Admin's Suggestions:</p>
                  <div className="space-y-2">
                    {selectedWorkshop.suggestedByAdmin.suggestedDates.map((date, index) => {
                      const dateStr = new Date(date).toISOString();
                      const isChecked = finalizeFormData.confirmedDates.includes(dateStr);
                      return (
                        <div key={index} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`admin-date-${index}`}
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setFinalizeFormData({
                                  ...finalizeFormData,
                                  confirmedDates: finalizeFormData.confirmedDates.filter(d => d !== dateStr)
                                });
                              } else {
                                setFinalizeFormData({
                                  ...finalizeFormData,
                                  confirmedDates: [...finalizeFormData.confirmedDates, dateStr]
                                });
                              }
                            }}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`admin-date-${index}`} className="ml-2 text-sm">
                            {formatDate(date)}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Manual Date Addition */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Add Custom Dates:</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="datetime-local"
                    value={finalizeFormData.tempDate}
                    onChange={(e) => setFinalizeFormData({
                      ...finalizeFormData,
                      tempDate: e.target.value
                    })}
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (finalizeFormData.tempDate) {
                        setFinalizeFormData({
                          ...finalizeFormData,
                          confirmedDates: [...finalizeFormData.confirmedDates, finalizeFormData.tempDate],
                          tempDate: ''
                        });
                      }
                    }}
                    className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Add Date
                  </button>
                </div>
              </div>

              {/* Selected Dates Display */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Confirmed Dates:</label>
                {finalizeFormData.confirmedDates.length === 0 ? (
                  <p className="text-gray-500 text-sm">No dates selected</p>
                ) : (
                  <div className="space-y-2">
                    {finalizeFormData.confirmedDates.map((date, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                        <span className="text-sm">{formatDate(date)}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newDates = [...finalizeFormData.confirmedDates];
                            newDates.splice(index, 1);
                            setFinalizeFormData({
                              ...finalizeFormData,
                              confirmedDates: newDates
                            });
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
                )}
              </div>
            </div>

            {/* Meet Links */}
            <div>
              <label className="block mb-1 text-sm font-medium">Google Meet Links</label>
              {finalizeFormData.confirmedDates.map((date, index) => (
                <div key={index} className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">Session {index + 1}: {formatDate(date)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      value={finalizeFormData.meetLinks[index] || ''}
                      onChange={(e) => {
                        const newLinks = [...finalizeFormData.meetLinks];
                        newLinks[index] = e.target.value;
                        setFinalizeFormData({
                          ...finalizeFormData,
                          meetLinks: newLinks
                        });
                      }}
                      className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={index === 0}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const start = new Date(date);
                        const end = new Date(start.getTime() + 60 * 60000); // 60 minutes duration
                        const calendarURL = generateCalendarURL(
                          selectedWorkshop.title,
                          start,
                          end,
                          selectedWorkshop.description
                        );
                        window.open(calendarURL, '_blank');
                      }}
                      className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors whitespace-nowrap"
                    >
                      Create Meet
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Final Outline */}
            <div>
  <label className="block mb-1 text-sm font-medium">Final Workshop Outline</label>
  <textarea
    value={finalizeFormData.finalOutline}
    onChange={(e) => setFinalizeFormData({
      ...finalizeFormData,
      finalOutline: e.target.value
    })}
    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    rows="8"
    placeholder="Enter outline with proper formatting. Use new lines for paragraphs.
    
Example:
Session 1: Introduction
- Topic 1
- Topic 2

Session 2: Advanced Concepts
- Topic A
- Topic B"
    required
  />
  <p className="mt-1 text-xs text-gray-500">
    Press Enter for new paragraphs.
  </p>
</div>

            {/* Poster Upload */}
            <div>
              <label className="block mb-1 text-sm font-medium">Workshop Poster</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFinalizeFormData({
                          ...finalizeFormData,
                          poster: file,
                          posterPreview: URL.createObjectURL(file)
                        });
                      }
                    }}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Upload an attractive poster for the workshop (JPEG/PNG)</p>
                </div>
                {finalizeFormData.posterPreview && (
                  <div className="w-32 h-32 border rounded overflow-hidden">
                    <img 
                      src={finalizeFormData.posterPreview} 
                      alt="Poster preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={() => {
                  setIsFinalizeModalOpen(false);
                  setSelectedWorkshop(null);
                  setFinalizeFormData({
                    totalSessions: '',
                    confirmedDates: [],
                    meetLinks: [''],
                    finalOutline: '',
                    poster: null,
                    posterPreview: '',
                    tempDate: '',
                    tempMeetLink: ''
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
                Finalize Workshop
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default WorkshopsTab;