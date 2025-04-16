// frontend/src/components/teacher/TeacherProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { Link } from 'react-router-dom';

const TeacherProfile = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [applicationFormData, setApplicationFormData] = useState({
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    country: '',
    city: '',
    profilePhoto: '', // Consider using a library for file uploads
    highestQualification: '',
    institutions: [{ name: '', yearOfGraduation: '' }],
    certifications: [],
    degreeCertificates: [], // Consider using a library for file uploads
    teachingExperienceYears: 0,
    subjectsCanTeach: [],
    levelsCanTeach: [],
    languagesCanTeachIn: [],
    previousPlatforms: [],
    idProof: '', // Consider using a library for file uploads
    backgroundCheckConsent: false,
    termsAndConditionsAgreed: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applicationStatus, setApplicationStatus] = useState('not_submitted');
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('teacherToken');
        const response = await fetch('/api/teacher/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setTeacherData(data.teacher);
          setApplicationStatus(data.teacher.applicationStatus || 'not_submitted');
          // Populate form data if application was already started/submitted
          if (data.teacher.phoneNumber) {
            setApplicationFormData({
              phoneNumber: data.teacher.phoneNumber || '',
              dateOfBirth: formatDate(data.teacher.dateOfBirth) || '',
              gender: data.teacher.gender || '',
              country: data.teacher.country || '',
              city: data.teacher.city || '',
              profilePhoto: data.teacher.profilePhoto || '',
              highestQualification: data.teacher.highestQualification || '',
              institutions: data.teacher.institutions || [{ name: '', yearOfGraduation: '' }],
              certifications: data.teacher.certifications || [],
              degreeCertificates: data.teacher.degreeCertificates || [],
              teachingExperienceYears: data.teacher.teachingExperienceYears || 0,
              subjectsCanTeach: data.teacher.subjectsCanTeach || [],
              levelsCanTeach: data.teacher.levelsCanTeach || [],
              languagesCanTeachIn: data.teacher.languagesCanTeachIn || [],
              previousPlatforms: data.teacher.previousPlatforms || [],
              idProof: data.teacher.idProof || '',
              backgroundCheckConsent: data.teacher.backgroundCheckConsent || false,
              termsAndConditionsAgreed: data.teacher.termsAndConditionsAgreed || false,
            });
          }
          setLoading(false);
        } else {
          setError(data.message || 'Failed to fetch profile');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to connect to the server');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const handleEditApplication = () => {
    setIsEditing(true);
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('institutions')) {
      const [baseName, indexAndField] = name.split('[');
      const actualIndex = parseInt(indexAndField.split(']')[0]);
      const field = indexAndField.split('.').pop();
      const updatedInstitutions = [...applicationFormData.institutions];

      // Ensure the institution object exists at the correct index
      if (!updatedInstitutions[actualIndex]) {
        updatedInstitutions[actualIndex] = { name: '', yearOfGraduation: '' };
      }

      // Update the specific field of the institution object
      updatedInstitutions[actualIndex] = {
        ...updatedInstitutions[actualIndex],
        [field]: value,
      };

      setApplicationFormData({ ...applicationFormData, institutions: updatedInstitutions });
    } else if (name === 'certifications' || name === 'subjectsCanTeach' || name === 'levelsCanTeach' || name === 'languagesCanTeachIn' || name === 'previousPlatforms') {
      const valueArray = value.split(',').map(item => item.trim());
      setApplicationFormData({ ...applicationFormData, [name]: valueArray });
    } else if (type === 'checkbox') {
      setApplicationFormData({ ...applicationFormData, [name]: checked });
    } else if (type === 'file') {
      // Handle file uploads appropriately (e.g., using FormData)
      setApplicationFormData({ ...applicationFormData, [name]: e.target.files[0] });
    }
    else {
      setApplicationFormData({ ...applicationFormData, [name]: value });
    }
  };

  const handleAddInstitution = () => {
    setApplicationFormData({
      ...applicationFormData,
      institutions: [...applicationFormData.institutions, { name: '', yearOfGraduation: '' }],
    });
  };

  const handleRemoveInstitution = (index) => {
    const updatedInstitutions = [...applicationFormData.institutions];
    updatedInstitutions.splice(index, 1);
    setApplicationFormData({ ...applicationFormData, institutions: updatedInstitutions });
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('Submitting application with data:', applicationFormData);
    try {
      const token = localStorage.getItem('teacherToken');
      const formDataToSend = new FormData();
      for (const key in applicationFormData) {
        if (key === 'institutions') {
          formDataToSend.append(key, JSON.stringify(applicationFormData[key]));
        } else if (Array.isArray(applicationFormData[key])) {
          applicationFormData[key].forEach(item => formDataToSend.append(key, item));
        } else {
          formDataToSend.append(key, applicationFormData[key]);
        }
      }
      console.log('Form data to send:', formDataToSend);
      const response = await fetch('/api/teacher/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      console.log('Backend Response:', response);
      const responseData = await response.json();
      console.log('Backend Response Data:', responseData);
      if (response.ok) {
        setApplicationStatus('submitted');
        setIsEditing(false); 
        // Optionally update teacherData to reflect the new status
        //const updatedTeacherData = { ...teacherData, applicationStatus: 'submitted', ...applicationFormData };
        //const responseData = await response.json();
        setTeacherData(responseData.teacher);
        console.log('Application submitted successfully on frontend');
      } else {
        //const errorData = await response.json(); // Get error details from backend
        setError(responseData.message || 'Failed to submit application');
        console.error('Application submission failed:', responseData);
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const renderApplicationForm = () => (
    <form onSubmit={handleSubmitApplication} className="space-y-4">
      {/* Basic Personal Information */}
      <div>
        <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">Phone Number:</label>
        <input type="text" id="phoneNumber" name="phoneNumber" value={applicationFormData.phoneNumber} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
      </div>
      <div>
        <label htmlFor="dateOfBirth" className="block text-gray-700 text-sm font-bold mb-2">Date of Birth:</label>
        <input type="date" id="dateOfBirth" name="dateOfBirth" value={applicationFormData.dateOfBirth} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
      </div>
      <div>
        <label htmlFor="gender" className="block text-gray-700 text-sm font-bold mb-2">Gender:</label>
        <select id="gender" name="gender" value={applicationFormData.gender} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="country" className="block text-gray-700 text-sm font-bold mb-2">Country:</label>
        <input type="text" id="country" name="country" value={applicationFormData.country} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
      </div>
      <div>
        <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">City:</label>
        <input type="text" id="city" name="city" value={applicationFormData.city} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
      </div>
      <div>
        <label htmlFor="profilePhoto" className="block text-gray-700 text-sm font-bold mb-2">Profile Photo:</label>
        <input type="file" id="profilePhoto" name="profilePhoto" onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        {applicationFormData.profilePhoto && typeof applicationFormData.profilePhoto === 'string' && <img src={`/uploads/teacherUploads/profilePhotos/${applicationFormData.profilePhoto}`} alt="Profile" className="mt-2 h-16 w-16 rounded-full object-cover" />}
      </div>

      {/* Education & Qualifications */}
      <div>
        <label htmlFor="highestQualification" className="block text-gray-700 text-sm font-bold mb-2">Highest Qualification:</label>
        <input type="text" id="highestQualification" name="highestQualification" value={applicationFormData.highestQualification} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">Institutions:</label>
        {applicationFormData.institutions.map((institution, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <input
              type="text"
              name={`institutions[${index}].name`}
              placeholder="Institution Name"
              value={institution.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <input
              type="text"
              name={`institutions[${index}].yearOfGraduation`}
              placeholder="Year of Graduation"
              value={institution.yearOfGraduation}
              onChange={handleChange}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-1/2"
            />
            {applicationFormData.institutions.length > 1 && (
              <button type="button" onClick={() => handleRemoveInstitution(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline">Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddInstitution} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add Institution</button>
      </div>
      <div>
        <label htmlFor="certifications" className="block text-gray-700 text-sm font-bold mb-2">Certifications (comma-separated):</label>
        <input type="text" id="certifications" name="certifications" value={applicationFormData.certifications.join(', ')} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
      </div>
      <div>
        <label htmlFor="degreeCertificates" className="block text-gray-700 text-sm font-bold mb-2">Degree Certificates (upload):</label>
        <input type="file" id="degreeCertificates" name="degreeCertificates" multiple onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        {applicationFormData.degreeCertificates && typeof applicationFormData.degreeCertificates === 'string' && <p>Previously uploaded: {applicationFormData.degreeCertificates}</p>}
      </div>

      {/* Teaching Experience */}
      <div>
        <label htmlFor="teachingExperienceYears" className="block text-gray-700 text-sm font-bold mb-2">Teaching Experience (Years):</label>
        <input type="number" id="teachingExperienceYears" name="teachingExperienceYears" value={applicationFormData.teachingExperienceYears} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
      </div>
      <div>
        <label htmlFor="subjectsCanTeach" className="block text-gray-700 text-sm font-bold mb-2">Subjects Can Teach (comma-separated):</label>
        <input type="text" id="subjectsCanTeach" name="subjectsCanTeach" value={applicationFormData.subjectsCanTeach.join(', ')} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
      </div>
      <div>
        <label htmlFor="levelsCanTeach" className="block text-gray-700 text-sm font-bold mb-2">Levels Can Teach (comma-separated):</label>
        <input type="text" id="levelsCanTeach" name="levelsCanTeach" value={applicationFormData.levelsCanTeach.join(', ')} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
      </div>
      <div>
        <label htmlFor="languagesCanTeachIn" className="block text-gray-700 text-sm font-bold mb-2">Languages Can Teach In (comma-separated):</label>
        <input type="text" id="languagesCanTeachIn" name="languagesCanTeachIn" value={applicationFormData.languagesCanTeachIn.join(', ')} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
      </div>
      <div>
        <label htmlFor="previousPlatforms" className="block text-gray-700 text-sm font-bold mb-2">Previous Platforms (comma-separated):</label>
        <input type="text" id="previousPlatforms" name="previousPlatforms" value={applicationFormData.previousPlatforms.join(', ')} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
      </div>

      {/* Verification & Compliance */}
      <div>
        <label htmlFor="idProof" className="block text-gray-700 text-sm font-bold mb-2">ID Proof (upload):</label>
        <input type="file" id="idProof" name="idProof" onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        {applicationFormData.idProof && typeof applicationFormData.idProof === 'string' && <p>Previously uploaded: {applicationFormData.idProof}</p>}
      </div>
      <div className="flex items-center mb-2">
        <input type="checkbox" id="backgroundCheckConsent" name="backgroundCheckConsent" checked={applicationFormData.backgroundCheckConsent} onChange={handleChange} className="mr-2 leading-tight" />
        <label htmlFor="backgroundCheckConsent" className="text-gray-700 text-sm font-bold">Consent for Background Check</label>
      </div>
      <div className="flex items-center mb-2">
        <input type="checkbox" id="termsAndConditionsAgreed" name="termsAndConditionsAgreed" checked={applicationFormData.termsAndConditionsAgreed} onChange={handleChange} className="mr-2 leading-tight" />
        <label htmlFor="termsAndConditionsAgreed" className="text-gray-700 text-sm font-bold">Agree to Terms and Conditions</label>
      </div>

      <button type="submit" disabled={loading} className={`bg-[#F38380] hover:bg-[#d96a67] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {loading ? 'Submitting...' : 'Submit Application'}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );

  const renderSubmittedApplication = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Submitted Application</h2>
      <p><strong>Application Status:</strong> {teacherData?.applicationStatus}</p>
      <p><strong>Phone Number:</strong> {teacherData?.phoneNumber}</p>
      <p><strong>Date of Birth:</strong> {formatDate(teacherData?.dateOfBirth)}</p>
      <p><strong>Gender:</strong> {teacherData?.gender}</p>
      <p><strong>Country:</strong> {teacherData?.country}</p>
      <p><strong>City:</strong> {teacherData?.city}</p>
      {teacherData?.profilePhoto && (
      <div>
        <strong>Profile Photo:</strong>
        <img src={`/uploads/teacherUploads/profilePhotos/${teacherData.profilePhoto}`} alt="Profile" className="mt-2 h-16 w-16 rounded-full object-cover" />
      </div>
    )}
      <p><strong>Highest Qualification:</strong> {teacherData?.highestQualification}</p>
      <div>
        <strong>Institutions:</strong>
        {teacherData?.institutions?.map((inst, index) => (
          <div key={index}>
            <p>{index + 1}. {inst.name} ({inst.yearOfGraduation})</p>
          </div>
        ))}
      </div>
      {teacherData?.certifications?.length > 0 && (
        <p><strong>Certifications:</strong> {teacherData.certifications.join(', ')}</p>
      )}
      {teacherData?.degreeCertificates && Array.isArray(teacherData.degreeCertificates) && teacherData.degreeCertificates.length > 0 && (
      <div>
        <strong>Degree Certificates:</strong>
        <ul>
          {teacherData.degreeCertificates.map((cert, index) => (
            <li key={index}><a href={`http://localhost:5000/uploads/teacherUploads/degreeCertificates/${cert}`} target="_blank" rel="noopener noreferrer">{cert}</a></li>
          ))}
        </ul>
      </div>
    )}
      {typeof teacherData?.degreeCertificates === 'string' && teacherData.degreeCertificates && (
      <div>
        <strong>Degree Certificates:</strong>
        <p><a href={`http://localhost:5000/uploads/teacherUploads/degreeCertificates/${teacherData.degreeCertificates}`} target="_blank" rel="noopener noreferrer">{teacherData.degreeCertificates}</a></p>
      </div>
    )}
      <p><strong>Teaching Experience (Years):</strong> {teacherData?.teachingExperienceYears}</p>
      {teacherData?.subjectsCanTeach?.length > 0 && (
        <p><strong>Subjects Can Teach:</strong> {teacherData.subjectsCanTeach.join(', ')}</p>
      )}
      {teacherData?.levelsCanTeach?.length > 0 && (
        <p><strong>Levels Can Teach:</strong> {teacherData.levelsCanTeach.join(', ')}</p>
      )}
      {teacherData?.languagesCanTeachIn?.length > 0 && (
        <p><strong>Languages Can Teach In:</strong> {teacherData.languagesCanTeachIn.join(', ')}</p>
      )}
      {teacherData?.previousPlatforms?.length > 0 && (
        <p><strong>Previous Platforms:</strong> {teacherData.previousPlatforms.join(', ')}</p>
      )}
      {teacherData?.idProof && (
      <div>
        <strong>ID Proof:</strong>
        <img src={`/uploads/teacherUploads/idProofs/${teacherData.idProof}`} alt="ID Proof" className="mt-2 max-w-md object-contain border"/>
      </div>
    )}
      <p><strong>Consent for Background Check:</strong> {teacherData?.backgroundCheckConsent ? 'Yes' : 'No'}</p>
      <p><strong>Agreed to Terms and Conditions:</strong> {teacherData?.termsAndConditionsAgreed ? 'Yes' : 'No'}</p>

      <button onClick={handleEditApplication} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Edit Application
      </button>
    </div>
  );

  const renderApplicationPending = () => (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Application Submitted!</strong>
      <span className="block sm:inline"> Your application is currently under review. You will be notified once it has been processed.</span>
    </div>
  );

  const renderApplicationAccepted = () => (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-800">Welcome to your Teacher Dashboard!</h2>
      <nav className="space-y-2">
        <Link to="/teacher/profile/manage" className="block py-2 px-4 text-gray-700 hover:bg-gray-200 hover:text-[#F38380] rounded">Profile Management</Link>
        <Link to="/teacher/courses" className="block py-2 px-4 text-gray-700 hover:bg-gray-200 hover:text-[#F38380] rounded">My Courses</Link>
        {/* Add other modules here as you build them */}
      </nav>
    </div>
  );

  const renderApplicationRejected = () => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Application Rejected</strong>
      <span className="block sm:inline"> Your teacher application has been rejected. Please contact the administrator for more information.</span>
      {/* Optionally provide a way to edit and resubmit if allowed */}
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem('teacherToken');
    navigate('/teacher/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Teacher Profile</h1>

          {applicationStatus === 'not_submitted' && renderApplicationForm()}
          {applicationStatus === 'submitted' && !isEditing && renderSubmittedApplication()}
          {applicationStatus === 'submitted' && isEditing && renderApplicationForm()} {/* Show form for editing */}
          {applicationStatus === 'pending' && renderApplicationPending()}
          {applicationStatus === 'accepted' && renderApplicationAccepted()}
          {applicationStatus === 'rejected' && renderApplicationRejected()}

          {applicationStatus !== 'accepted' && (
            <button onClick={handleLogout} className="mt-6 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Logout
            </button>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TeacherProfile;