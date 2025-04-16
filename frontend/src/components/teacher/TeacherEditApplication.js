// frontend/src/components/teacher/EditApplication.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EditApplication = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    country: '',
    city: '',
    highestQualification: '',
    institutions: [{ name: '', yearOfGraduation: '' }],
    certifications: [''],
    subjectsCanTeach: [''],
    levelsCanTeach: [''],
    languagesCanTeachIn: [''],
    teachingExperienceYears: '',
    previousPlatforms: [''],
    backgroundCheckConsent: false,
    termsAndConditionsAgreed: false,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch existing profile data to pre-fill the form
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/teachers/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok && data.teacher) {
          // Pre-fill the form with existing data (adjust as needed)
          setFormData({
            phoneNumber: data.teacher.phoneNumber || '',
            dateOfBirth: data.teacher.dateOfBirth ? data.teacher.dateOfBirth.substring(0, 10) : '',
            gender: data.teacher.gender || '',
            country: data.teacher.country || '',
            city: data.teacher.city || '',
            highestQualification: data.teacher.highestQualification || '',
            institutions: data.teacher.institutions || [{ name: '', yearOfGraduation: '' }],
            certifications: data.teacher.certifications || [''],
            subjectsCanTeach: data.teacher.subjectsCanTeach || [''],
            levelsCanTeach: data.teacher.levelsCanTeach || [''],
            languagesCanTeachIn: data.teacher.languagesCanTeachIn || [''],
            teachingExperienceYears: data.teacher.teachingExperienceYears || '',
            previousPlatforms: data.teacher.previousPlatforms || [''],
            backgroundCheckConsent: data.teacher.backgroundCheckConsent || false,
            termsAndConditionsAgreed: data.teacher.termsAndConditionsAgreed || false,
          });
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to fetch profile data');
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => {
      if (name.includes('institutions') || name.includes('certifications') || name.includes('subjectsCanTeach') || name.includes('levelsCanTeach') || name.includes('languagesCanTeachIn') || name.includes('previousPlatforms')) {
        const parts = name.split('[');
        const field = parts[0];
        const index = parseInt(parts[1].split(']')[0]);
        const subField = parts[1].split(']')[1]?.substring(1);
        const newValue = [...prevData[field]];
        if (subField) {
          newValue[index] = { ...newValue[index], [subField]: value };
        } else {
          newValue[index] = value;
        }
        return { ...prevData, [field]: newValue };
      } else if (type === 'checkbox') {
        return { ...prevData, [name]: checked };
      } else {
        return { ...prevData, [name]: value };
      }
    });
  };

  const handleAddItem = (field, newItem = '') => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: [...prevData[field], newItem],
    }));
  };

  const handleAddInstitution = () => handleAddItem('institutions', { name: '', yearOfGraduation: '' });
  const handleAddCertification = () => handleAddItem('certifications');
  const handleAddSubject = () => handleAddItem('subjectsCanTeach');
  const handleAddLevel = () => handleAddItem('levelsCanTeach');
  const handleAddLanguage = () => handleAddItem('languagesCanTeachIn');
  const handleAddPlatform = () => handleAddItem('previousPlatforms');

  const handleRemoveItem = (field, index) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: prevData[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/teachers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Profile updated successfully:', data);
        navigate('/teacher/profile/manage'); // Redirect back to profile management
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to connect to the server');
    }
  };

  return (
    <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Edit Application Details</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Personal Information (excluding name, email, username) */}
        <div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Basic Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">Phone Number:</label>
              <input type="text" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-gray-700 text-sm font-bold mb-2">Date of Birth:</label>
              <input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
              <label htmlFor="gender" className="block text-gray-700 text-sm font-bold mb-2">Gender (optional):</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="country" className="block text-gray-700 text-sm font-bold mb-2">Country of Residence:</label>
              <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
              <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">City of Residence:</label>
              <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            {/* Profile Photo Upload (will be handled later) */}
            <div>
              <label htmlFor="profilePhoto" className="block text-gray-700 text-sm font-bold mb-2">Profile Photo Upload:</label>
              <input type="file" id="profilePhoto" name="profilePhoto" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" disabled />
            </div>
          </div>
        </div>

        {/* Education & Qualifications */}
        <div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Education & Qualifications</h3>
          <div>
            <label htmlFor="highestQualification" className="block text-gray-700 text-sm font-bold mb-2">Highest Qualification:</label>
            <input type="text" id="highestQualification" name="highestQualification" value={formData.highestQualification} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Name of Institution(s):</label>
            {formData.institutions.map((institution, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input type="text" name={`institutions[${index}].name`} value={institution.name} onChange={handleChange} placeholder="Institution Name" className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                <input type="text" name={`institutions[${index}].yearOfGraduation`} value={institution.yearOfGraduation} onChange={handleChange} placeholder="Year of Graduation" className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                {formData.institutions.length > 1 && (
                  <button type="button" onClick={() => handleRemoveItem('institutions', index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddInstitution} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add Institution</button>
          </div>
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Certifications (if any):</label>
            {formData.certifications.map((certification, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input type="text" name={`certifications[${index}]`} value={certification} onChange={handleChange} placeholder="Certification Name" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                {formData.certifications.length > 1 && (
                  <button type="button" onClick={() => handleRemoveItem('certifications', index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddCertification} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add Certification</button>
          </div>
          {/* Upload Degrees/Certificates (will be handled later) */}
          <div>
            <label htmlFor="degreeCertificates" className="block text-gray-700 text-sm font-bold mb-2">Upload Degrees/Certificates:</label>
            <input type="file" id="degreeCertificates" name="degreeCertificates" multiple className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" disabled />
          </div>
        </div>

        {/* Teaching Experience */}
        <div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Teaching Experience</h3>
          <div>
            <label htmlFor="teachingExperienceYears" className="block text-gray-700 text-sm font-bold mb-2">Total Years of Teaching Experience:</label>
            <input type="number" id="teachingExperienceYears" name="teachingExperienceYears" value={formData.teachingExperienceYears} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Subjects You Can Teach:</label>
            {formData.subjectsCanTeach.map((subject, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input type="text" name={`subjectsCanTeach[${index}]`} value={subject} onChange={handleChange} placeholder="Subject" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                {formData.subjectsCanTeach.length > 1 && (
                  <button type="button" onClick={() => handleRemoveItem('subjectsCanTeach', index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddSubject} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add Subject</button>
          </div>
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Levels You Can Teach (e.g., school, college, competitive, professional):</label>
            {formData.levelsCanTeach.map((level, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input type="text" name={`levelsCanTeach[${index}]`} value={level} onChange={handleChange} placeholder="Level" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                {formData.levelsCanTeach.length > 1 && (
                  <button type="button" onClick={() => handleRemoveItem('levelsCanTeach', index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddLevel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add Level</button>
          </div>
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Languages You Can Teach In:</label>
            {formData.languagesCanTeachIn.map((language, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input type="text" name={`languagesCanTeachIn[${index}]`} value={language} onChange={handleChange} placeholder="Language" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></input>{formData.languagesCanTeachIn.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem('languagesCanTeachIn', index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline">Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddLanguage} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add Language</button>
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">Previous Platforms/Institutes Worked With:</label>
              {formData.previousPlatforms.map((platform, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input type="text" name={`previousPlatforms[${index}]`} value={platform} onChange={handleChange} placeholder="Platform/Institute Name" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                  {formData.previousPlatforms.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem('previousPlatforms', index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline">Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddPlatform} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add Platform</button>
            </div>
          </div>

          {/* Verification & Compliance */}
          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Verification & Compliance</h3>
            <div>
              <label htmlFor="idProof" className="block text-gray-700 text-sm font-bold mb-2">ID Proof Upload (Aadhaar, Passport, etc.):</label>
              <input type="file" id="idProof" name="idProof" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="flex items-center mb-2">
              <input type="checkbox" id="backgroundCheckConsent" name="backgroundCheckConsent" checked={formData.backgroundCheckConsent} onChange={handleChange} className="mr-2 leading-tight" />
              <label htmlFor="backgroundCheckConsent" className="text-gray-700 text-sm">I consent to a background check.</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="termsAndConditionsAgreed" name="termsAndConditionsAgreed" checked={formData.termsAndConditionsAgreed} onChange={handleChange} required className="mr-2 leading-tight" />
              <label htmlFor="termsAndConditionsAgreed" className="text-gray-700 text-sm">I agree to the <a href="/terms" className="text-[#F38380]">Terms & Conditions</a>.</label>
            </div>
          </div>

          <button type="submit" className="bg-[#F38380] hover:bg-[#d96a67] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Update Application</button>
        </form>
      </div>
    
  );
};

export default EditApplication;