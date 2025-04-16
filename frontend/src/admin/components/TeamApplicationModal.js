import React from 'react';

const TeamApplicationModal = ({ onClose, teamMember, onApprove, onReject, onRevoke }) => {
    if (!teamMember) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-900 text-white rounded-2xl shadow-lg p-6 max-w-3xl w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-red-500"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold mb-4">Team Member Application</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><strong>Name:</strong> {teamMember.name}</p>
                    <p><strong>Username:</strong> {teamMember.username}</p>
                    <p><strong>Email:</strong> {teamMember.email}</p>
                    <p><strong>Status:</strong> {teamMember.status}</p>
                    <p><strong>Phone:</strong> {teamMember.phone || 'N/A'}</p>
                    <p><strong>Date of Birth:</strong> {teamMember.dob?.substring(0, 10) || 'N/A'}</p>
                    <p><strong>Gender:</strong> {teamMember.gender}</p>
                    <p><strong>Address:</strong> {teamMember.address}</p>
                </div>

                <div className="mt-4">
                    <h3 className="font-semibold">Education:</h3>
                    <p>{teamMember.education || 'N/A'}</p>
                    <h3 className="font-semibold mt-2">Experience:</h3>
                    <p>{teamMember.experience || 'N/A'}</p>
                </div>
                <div className="mt-2">
                    <h3 className="font-semibold">Resume:</h3>
                    {teamMember.resume ? (
                        <a href={`http://localhost:5000/uploads/teamUploads/${teamMember.resume}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                            View Resume
                        </a>
                    ) : (
                        <p>N/A</p>
                    )}
                </div>
                <div className="mt-4 flex gap-2">
                    <button onClick={onApprove} className="bg-green-500 text-white px-4 py-2 rounded">Approve</button>
                    <button onClick={onReject} className="bg-red-500 text-white px-4 py-2 rounded">Reject</button>
                    <button onClick={onRevoke} className="bg-yellow-500 text-white px-4 py-2 rounded">Revoke</button>
                </div>
            </div>
        </div>
    );
};

export default TeamApplicationModal;