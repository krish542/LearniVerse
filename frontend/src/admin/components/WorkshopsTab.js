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

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/teacher/getAllTeachers');
        const teacherOptions = res.data.map(teacher => ({
          value: teacher._id,
          label: `${teacher.fullName} (${teacher.subjectsCanTeach})`,
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
        setAcceptedWorkshops(workshopsWithTeachers.filter(w => w.status === 'accepted'));
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
      
      {/* Workshop Creation Form (unchanged) */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">Propose New Workshop</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Workshop Title"
            className="border p-2 rounded"
          />
          <div>
            <Select
              options={teachers}
              value={formData.selectedTeacher}
              onChange={handleTeacherSelect}
              placeholder="Select a Teacher"
              isSearchable
            />
          </div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Workshop Purpose/Description"
            className="border p-2 rounded col-span-1 md:col-span-2"
            rows={3}
          />
          <textarea
            name="sampleOutline"
            value={formData.sampleOutline}
            onChange={handleChange}
            placeholder="Sample Outline"
            className="border p-2 rounded col-span-1 md:col-span-2"
            rows={3}
          />
        </div>
        <div className="mt-4">
          <label className="block font-medium mb-2">Suggested Date & Times</label>
          {formData.suggestedDates.map((date, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="datetime-local"
                name="suggestedDates"
                value={date}
                onChange={(e) => handleChange(e, index)}
                className="border p-2 rounded w-full"
              />
              {formData.suggestedDates.length > 1 && (
                <button
                  onClick={() => removeSuggestedDate(index)}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addSuggestedDate}
            className="text-blue-600 hover:underline text-sm"
          >
            + Add another date
          </button>
        </div>
        <button
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          onClick={handleCreateWorkshop}
          disabled={!formData.title || !formData.selectedTeacher}
        >
          Send Request to Teacher
        </button>
      </div>

      {/* Pending Workshops Table */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">Pending Workshop Requests</h3>
        {loading ? (
          <p>Loading...</p>
        ) : pendingWorkshops.length === 0 ? (
          <p className="text-gray-500 italic">No pending workshop requests</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border text-left">Title</th>
                  <th className="py-2 px-4 border text-left">Teacher</th>
                  <th className="py-2 px-4 border text-left">Proposed Dates</th>
                  <th className="py-2 px-4 border text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingWorkshops.map(workshop => (
                  <tr key={workshop._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border">{workshop.title}</td>
                    <td className="py-2 px-4 border">
  {workshop.teacherId
    ? `${workshop.teacherId.fullName}${workshop.teacherId.subjectsCanTeach ? ` (${workshop.teacherId.subjectsCanTeach})` : ''}`
    : 'N/A'}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Accepted Workshops Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Accepted Workshops</h3>
        {loading ? (
          <p>Loading...</p>
        ) : acceptedWorkshops.length === 0 ? (
          <p className="text-gray-500 italic">No accepted workshops</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border text-left">Title</th>
                  <th className="py-2 px-4 border text-left">Teacher</th>
                  <th className="py-2 px-4 border text-left">Scheduled Dates</th>
                  <th className="py-2 px-4 border text-left">Meet Links</th>
                  <th className="py-2 px-4 border text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {acceptedWorkshops.map(workshop => (
                  <tr key={workshop._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border">{workshop.title}</td>
                    <td className="py-2 px-4 border">
                      {teachers.find(t => t.value === workshop.teacherId)?.label || 'N/A'}
                    </td>
                    <td className="py-2 px-4 border">
                      {workshop.final?.confirmedDates?.map(formatDate).join(', ') || 
                       workshop.suggestedByAdmin?.suggestedDates?.map(formatDate).join(', ') || 
                       'Not specified'}
                    </td>
                    <td className="py-2 px-4 border">
                      {workshop.final?.meetLinks?.map((link, i) => (
                        <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                          Session {i+1}
                        </a>
                      )) || 'Not scheduled'}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopsTab;