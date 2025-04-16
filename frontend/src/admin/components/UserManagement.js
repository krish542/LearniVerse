import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import TeacherProfileModal from './TeacherProfileModal';
import TeamApplicationModal from './TeamApplicationModal';
const UserManagement = () => {
    const [submittedApplications, setSubmittedApplications] = useState([]);
    const [approvedTeachers, setApprovedTeachers] = useState([]);
    const [rejectedTeachers, setRejectedTeachers] = useState([]);
    const [pendingTeamMembers, setPendingTeamMembers] = useState([]);
    const [approvedTeamMembers, setApprovedTeamMembers] = useState([]);
    const [rejectedTeamMembers, setRejectedTeamMembers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedTeamMember, setSelectedTeamMember] = useState(null);
//const [isModalOpen, setIsModalOpen] = useState(false);
const [showTeacherModal, setShowTeacherModal] = useState(false);
const [showTeamModal, setShowTeamModal] = useState(false);
    const navigate = useNavigate();
    const [token, setToken] = useState(localStorage.getItem('adminToken'));
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const fetchTeamMembers = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/team/all', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            const submitted = data.filter((member) => member.status === 'submitted');
            const approved = data.filter((member) => member.status === 'approved');
            const rejected = data.filter((member) => member.status === 'rejected');

            setPendingTeamMembers(submitted);
            setApprovedTeamMembers(approved);
            setRejectedTeamMembers(rejected);
        } catch (err) {
            console.error('Error fetching team members:', err);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate('/admin/login');
            return;
        }

        const fetchTeacherApplications = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/admin/teacher-applications', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch teacher applications');
                }
                const data = await response.json();
                setSubmittedApplications(data.submittedApplications);
                setApprovedTeachers(data.approvedTeachers);
                setRejectedTeachers(data.rejectedTeachers);
            } catch (error) {
                console.error(error);
                // Handle error (e.g., redirect to error page, show message)
            }
        };

        
        fetchTeacherApplications();
        fetchTeamMembers();
    }, [token, navigate]);

    // Handle teacher profile view
const handleViewTeacherProfile = (teacher) => {
    setSelectedTeacher(teacher);
    setShowTeacherModal(true);
  };
  
  // Handle team member application view
  const handleViewTeamApplication = (teamMember) => {
    setSelectedTeamMember(teamMember);
    setShowTeamModal(true);
  };
  
    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/teacher-applications/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error(`Failed to update status to ${status}`);
            }

            let updatedApplication;
            if (status === 'accepted') {
                updatedApplication = submittedApplications.find(app => app._id === id);
                if (updatedApplication) {
                    setSubmittedApplications(submittedApplications.filter(app => app._id !== id));
                    setApprovedTeachers([...approvedTeachers, updatedApplication]);
                }
            } else if (status === 'rejected') {
                updatedApplication = submittedApplications.find(app => app._id === id) || approvedTeachers.find(app => app._id === id);
                if (updatedApplication) {
                    setSubmittedApplications(submittedApplications.filter(app => app._id !== id));
                    setApprovedTeachers(approvedTeachers.filter(app => app._id !== id));
                    setRejectedTeachers([...rejectedTeachers, updatedApplication]);
                }
            } else if (status === 'submitted') {
                updatedApplication = approvedTeachers.find(app => app._id === id) || rejectedTeachers.find(app => app._id === id);
                if (updatedApplication) {
                    setApprovedTeachers(approvedTeachers.filter(app => app._id !== id));
                    setRejectedTeachers(rejectedTeachers.filter(app => app._id !== id));
                    setSubmittedApplications([...submittedApplications, updatedApplication]);
                }
            }

            const fetchTeacherApplications = async () => {
                try {
                    const response = await fetch('http://localhost:5000/api/admin/teacher-applications', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) {
                        throw new Error('Failed to fetch teacher applications');
                    }
                    const data = await response.json();
                    setSubmittedApplications(data.submittedApplications);
                    setApprovedTeachers(data.approvedTeachers);
                    setRejectedTeachers(data.rejectedTeachers);
                } catch (error) {
                    console.error(error);
                    // Handle error
                }
            };
            fetchTeacherApplications();

        } catch (error) {
            console.error(error);
            // Handle error
        }
    };
    const handleTeamStatusUpdate = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:5000/api/team/status/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error('Failed to update team member status');
            }
            const data = await response.json();
            console.log("Status update response:", data);

            // Re-fetch updated list after status update
            fetchTeamMembers();
        } catch (err) {
            console.error(err);
        }
    };
    /*const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };*/

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
    <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    
    <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar toggleSidebar={toggleSidebar} />

        {/* Main content area */}
        <main className="mt-16 p-4 overflow-x-auto overflow-y-auto bg-gray-100 flex-1">
            <h2 className="text-2xl font-bold mb-6">User Management</h2>

            {/* Teacher Applications */}
            <section className="mb-12">
                <h3 className="text-xl font-semibold mb-4">Teacher Applications</h3>
                <div className="bg-white shadow rounded-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Levels</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {submittedApplications.map(app => (
                                <tr key={app._id}>
                                    <td className="px-4 py-4 text-sm text-gray-500"> <button className='hover:underline focus:outline-none' onClick={() => handleViewTeacherProfile(app)}>{app.fullName}</button></td>
                                    <td className="px-4 py-4 text-sm text-gray-500">{app.subjectsCanTeach.join(', ')}</td>
                                    <td className="px-4 py-4 text-sm text-gray-500">{app.levelsCanTeach.join(', ')}</td>
                                    <td className="px-4 py-4 text-sm">
                                        <div className="flex flex-wrap gap-2">
                                            {/*<button onClick={()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs">View</button>*/}
                                            <button onClick={() => handleUpdateStatus(app._id, 'accepted')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-xs">Approve</button>
                                            <button onClick={() => handleUpdateStatus(app._id, 'rejected')} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-xs">Reject</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Approved Teachers */}
            <section className="mb-12">
                <h3 className="text-xl font-semibold mb-4">Approved Teachers</h3>
                <div className="bg-white shadow rounded-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Levels</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {approvedTeachers.map(teacher => (
                                <tr key={teacher._id}>
                                    <td className="px-4 py-4 text-sm text-gray-500"> <button className='hover:underline focus:outline-none' onClick={() => handleViewTeacherProfile(teacher)}>{teacher.fullName}</button></td>
                                    <td className="px-4 py-4 text-sm text-gray-500">{teacher.subjectsCanTeach.join(', ')}</td>
                                    <td className="px-4 py-4 text-sm text-gray-500">{teacher.levelsCanTeach.join(', ')}</td>
                                    <td className="px-4 py-4 text-sm">
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => handleUpdateStatus(teacher._id, 'submitted')} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded text-xs">Revoke</button>
                                            <button onClick={() => handleUpdateStatus(teacher._id, 'rejected')} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-xs">Reject</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Rejected Teachers */}
            <section className="mb-12">
                <h3 className="text-xl font-semibold mb-4">Rejected Teachers</h3>
                <div className="bg-white shadow rounded-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Levels</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rejectedTeachers.map(teacher => (
                                <tr key={teacher._id}>
                                    <td className="px-4 py-4 text-sm text-gray-500"> <button className='hover:underline focus:outline-none' onClick={() => handleViewTeacherProfile(teacher)}>{teacher.fullName}</button></td>
                                    <td className="px-4 py-4 text-sm text-gray-500">{teacher.subjectsCanTeach.join(', ')}</td>
                                    <td className="px-4 py-4 text-sm text-gray-500">{teacher.levelsCanTeach.join(', ')}</td>
                                    <td className="px-4 py-4 text-sm">
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => handleUpdateStatus(teacher._id, 'submitted')} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded text-xs">Revoke</button>
                                            <button onClick={() => handleUpdateStatus(teacher._id, 'accepted')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-xs">Approve</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Team Members - Pending */}
            <section className="mb-12">
                <h3 className="text-xl font-semibold mb-4">Team Members - Pending</h3>
                <div className="bg-white shadow rounded-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pendingTeamMembers.map((member) => (
                                <tr key={member._id}>
                                    <td className="px-4 py-4 text-sm text-gray-500"> <button className='hover:underline focus:outline-none' onClick={() => handleViewTeamApplication(member)}>{member.name}</button></td>
                                    <td className="px-4 py-4 text-sm text-gray-500">{member.username}</td>
                                    <td className="px-4 py-4 text-sm text-gray-500">{member.email}</td>
                                    <td className="px-4 py-4 text-sm">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleTeamStatusUpdate(member._id, 'approved')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-xs">Approve</button>
                                            <button onClick={() => handleTeamStatusUpdate(member._id, 'rejected')} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-xs">Reject</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Team Members - Approved */}
            <section className="mb-12">
                <h3 className="text-xl font-semibold mb-4">Team Members - Approved</h3>
                <div className="bg-white shadow rounded-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {approvedTeamMembers.map((member) => (
                                <tr key={member._id}>
                                    <td className="px-4 py-4 text-sm text-gray-500"> <button className='hover:underline focus:outline-none' onClick={() => handleViewTeamApplication(member)}>{member.name}</button></td>
                                    <td className="px-4 py-4 text-sm text-gray-500">{member.username}</td>
                                    <td className="px-4 py-4 text-sm text-gray-500">{member.email}</td>
                                    <td className="px-4 py-4 text-sm">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleTeamStatusUpdate(member._id, 'submitted')} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded text-xs">Revoke</button>
                                            <button onClick={() => handleTeamStatusUpdate(member._id, 'rejected')} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-xs">Reject</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Team Members - Rejected */}
            <section>
                <h3 className="text-xl font-semibold mb-4">Team Members - Rejected</h3>
                <div className="bg-white shadow rounded-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rejectedTeamMembers.map((member) => (
                                <tr key={member._id}>
                                    <td className="px-4 py-4 text-sm text-gray-500"> <button className='hover:underline focus:outline-none' onClick={() => handleViewTeamApplication(member)}>{member.name}</button></td>
                                    <td className="px-4 py-4 text-sm text-gray-500">{member.username}</td>
                                    <td className="px-4 py-4 text-sm text-gray-500">{member.email}</td>
                                    <td className="px-4 py-4 text-sm">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleTeamStatusUpdate(member._id, 'submitted')} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded text-xs">Revoke</button>
                                            <button onClick={() => handleTeamStatusUpdate(member._id, 'approved')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-xs">Approve</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    </div>
    {console.log("selected teacher:", selectedTeacher)}
    {showTeacherModal && selectedTeacher && (
  <TeacherProfileModal
    teacher={selectedTeacher}
    onClose={() => setShowTeacherModal(false)}
    onApprove={() => {
      handleUpdateStatus(selectedTeacher._id, 'accepted');
      setShowTeacherModal(false);
    }}
    onReject={() => {
      handleUpdateStatus(selectedTeacher._id, 'rejected');
      setShowTeacherModal(false);
    }}
    onRevoke={() => {
      handleUpdateStatus(selectedTeacher._id, 'submitted');
      setShowTeacherModal(false);
    }}
  />
)}

{showTeamModal && selectedTeamMember && (
  <TeamApplicationModal
    teamMember={selectedTeamMember}
    onClose={() => setShowTeamModal(false)}
    onApprove={() => {
      handleTeamStatusUpdate(selectedTeamMember._id, 'approved');
      setShowTeamModal(false);
    }}
    onReject={() => {
      handleTeamStatusUpdate(selectedTeamMember._id, 'rejected');
      setShowTeamModal(false);
    }}
    onRevoke={() => {
      handleTeamStatusUpdate(selectedTeamMember._id, 'submitted');
      setShowTeamModal(false);
    }}
    />
)}

  
</div>

    );
};

export default UserManagement;