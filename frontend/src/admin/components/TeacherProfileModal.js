import React from 'react';
import API_BASE_URL from '../../utils/apiConfig';
const TeacherProfileModal = ({ teacher, onClose, onApprove, onReject, onRevoke }) => {
  if (!teacher) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-6 overflow-y-auto">
      <div className="bg-gray-900 text-white rounded-2xl shadow-lg max-w-3xl w-full relative max-h-[90vh] overflow-y-auto p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-red-500 text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 mt-2">Teacher Profile</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><strong>Full Name:</strong> {teacher.fullName}</p>
          <p><strong>Email:</strong> {teacher.email}</p>
          <p><strong>Status:</strong> {teacher.applicationStatus}</p>
          <p><strong>Phone:</strong> {teacher.phoneNumber || 'N/A'}</p>
          <p><strong>Date of Birth:</strong> {teacher.dateOfBirth?.substring(0, 10) || 'N/A'}</p>
          <p><strong>Gender:</strong> {teacher.gender}</p>
          <p><strong>City:</strong> {teacher.city}</p>
          <p><strong>Country:</strong> {teacher.country}</p>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Subjects:</h3>
          <p>{teacher.subjectsCanTeach?.join(', ') || 'N/A'}</p>
        </div>
        <div className="mt-2">
          <h3 className="font-semibold">Levels Can Teach:</h3>
          <p>{teacher.levelsCanTeach?.join(', ') || 'N/A'}</p>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold">Languages:</h3>
          <p>{teacher.languagesCanTeachIn?.join(', ') || 'N/A'}</p>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold">Previous Platforms:</h3>
          <p>{teacher.previousPlatforms?.join(', ') || 'N/A'}</p>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Institutions:</h3>
          <ul className="list-disc list-inside">
            {teacher.institutions?.length > 0 ? (
              teacher.institutions.map((inst, idx) => (
                <li key={idx}>{inst.name} ({inst.yearOfGraduation})</li>
              ))
            ) : (
              <li>N/A</li>
            )}
          </ul>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold">Certifications:</h3>
          <p>{teacher.certifications?.join(', ') || 'N/A'}</p>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold">Degree Certificates:</h3>
          <ul className="list-disc list-inside">
            {teacher.degreeCertificates?.length > 0 ? (
              teacher.degreeCertificates.map((file, idx) => (
                <li key={idx}>
                  <a href={`${API_BASE_URL}/uploads/teacherUploads/degreeCertificates/${file}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                    View Certificate {idx + 1}
                  </a>
                </li>
              ))
            ) : (
              <li>N/A</li>
            )}
          </ul>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold">ID Proof:</h3>
          {teacher.idProof ? (
            <img src={`${API_BASE_URL}/uploads/teacherUploads/idProofs/${teacher.idProof}`} alt="ID Proof" className="max-w-full max-h- rounded mt-2"/>
          ) : (
            <p>N/A</p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={onApprove} className="bg-green-500 text-white px-4 py-2 rounded">Approve</button>
          <button onClick={onReject} className="bg-red-500 text-white px-4 py-2 rounded">Reject</button>
          <button onClick={onRevoke} className="bg-yellow-500 text-white px-4 py-2 rounded">Revoke</button>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileModal;