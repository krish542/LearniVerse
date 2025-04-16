import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import { useNavigate } from 'react-router-dom';

const TeamApplicationForm = () => {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    gender: '',
    currentEmployment: '',
    education: '',
    experience: '',
    qualifications: '',
    resume: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      resume: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataObj = new FormData();
    for (const key in formData) {
      formDataObj.append(key, formData[key]);
    }

    try {
      const token = localStorage.getItem('subAdminToken');
      const res = await axios.post('/api/team/application', formDataObj, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.message) {
        // Handle success (show success message or redirect)
        alert('Application submitted successfully');
        navigate('/team/dashboard');
      }
    } catch (error) {
      setError('Failed to submit application');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="max-w-xl mt-24 mx-auto p-4 bg-gray-800 text-white rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Team Member Application</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="mb-4">
          <label htmlFor="address" className="block">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            className="w-full p-2 mt-1 bg-gray-700 text-white rounded"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="phone" className="block">Phone</label>
          <input
            type="text"
            id="phone"
            name="phone"
            className="w-full p-2 mt-1 bg-gray-700 text-white rounded"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="gender" className="block">Gender</label>
          <select
            id="gender"
            name="gender"
            className="w-full p-2 mt-1 bg-gray-700 text-white rounded"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="currentEmployment" className="block">Current Employment</label>
          <input
            type="text"
            id="currentEmployment"
            name="currentEmployment"
            className="w-full p-2 mt-1 bg-gray-700 text-white rounded"
            value={formData.currentEmployment}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="education" className="block">Education</label>
          <input
            type="text"
            id="education"
            name="education"
            className="w-full p-2 mt-1 bg-gray-700 text-white rounded"
            value={formData.education}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="experience" className="block">Experience</label>
          <input
            type="text"
            id="experience"
            name="experience"
            className="w-full p-2 mt-1 bg-gray-700 text-white rounded"
            value={formData.experience}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="qualifications" className="block">Qualifications/Skills</label>
          <input
            type="text"
            id="qualifications"
            name="qualifications"
            className="w-full p-2 mt-1 bg-gray-700 text-white rounded"
            value={formData.qualifications}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="resume" className="block">Resume (PDF only)</label>
          <input
            type="file"
            id="resume"
            name="resume"
            className="w-full p-2 mt-1 bg-gray-700 text-white rounded"
            onChange={handleFileChange}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded-lg"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
    </>
  );
};

export default TeamApplicationForm;