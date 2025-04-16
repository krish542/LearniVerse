// frontend/src/components/team/TeamDashboard/Reports.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../Navbar';
import TeamSidebar from './TeamSidebar';
import TeamPending from './TeamPending';
import TeamRejected from './TeamRejected';
import EmailResponseModal from './EmailResponseModal';

const Reports = () => {
  const [memberData, setMemberData] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchReports = async () => {
    const token = localStorage.getItem('subAdminToken');
    try {
      const res = await axios.get('/api/report', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('subAdminToken');
      try {
        const res = await axios.get('/api/team/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMemberData(res.data);
      } catch (error) {
        console.error('Error fetching team profile:', error);
      }
    };

    fetchProfile();
    fetchReports();
  }, []);

  const openModal = (report) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  if (!memberData) return <div className="text-center p-10 text-white bg-black">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="md:flex mt-14 h-screen">
        <TeamSidebar status={memberData.status} />
        <div className="flex-1 bg-gray-800 overflow-y-auto p-6 text-white">
          {memberData.status === 'approved' ? (
            <>
              <h2 className="text-2xl font-semibold mb-4">Reports & Logs</h2>
              {reports.map((report) => (
                <div key={report._id} className="bg-gray-700 p-4 rounded mb-4">
                  <p><strong>Type:</strong> {report.issueType}</p>
                  <p><strong>Description:</strong> {report.description}</p>
                  <p><strong>Email:</strong> {report.contactEmail || 'N/A'}</p>

                  {report.responses && report.responses.length > 0 ? (
                    <div className="mt-3 border-t border-gray-600 pt-2">
                      <p className="text-green-400 font-semibold mb-1">Responses:</p>
                      {report.responses.map((res, idx) => (
                        <div key={idx} className="mb-2">
                          <p className="italic">"{res.message}"</p>
                          <p className="text-sm text-gray-400">
                            — {res?.sentAt ? new Date(res.sentAt).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : report.contactEmail && (
                    <button
                      onClick={() => openModal(report)}
                      className="mt-3 px-3 py-1 bg-blue-600 rounded"
                    >
                      Respond
                    </button>
                  )}
                </div>
              ))}
              {modalOpen && (
                <EmailResponseModal
                  type="report"
                  data={selectedReport}
                  onClose={() => setModalOpen(false)}
                  onSuccess={fetchReports}
                />
              )}
            </>
          ) : memberData.status === 'submitted' ? (
            <TeamPending memberData={memberData} />
          ) : (
            <TeamRejected memberData={memberData} />
          )}
        </div>
      </div>
    </>
  );
};

export default Reports;
