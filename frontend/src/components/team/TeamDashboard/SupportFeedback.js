// frontend/src/components/team/TeamDashboard/SupportFeedback.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../Navbar';
import TeamSidebar from './TeamSidebar';
import TeamPending from './TeamPending';
import TeamRejected from './TeamRejected';
import EmailResponseModal from './EmailResponseModal';

// ... imports
const SupportFeedback = () => {
    const [memberData, setMemberData] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [selectedRating, setSelectedRating] = useState(null);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
  
    const fetchFeedbacks = async () => {
      const token = localStorage.getItem('subAdminToken');
      try {
        const res = await axios.get('/api/feedback', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFeedbacks(res.data);
        setFilteredFeedbacks(res.data);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
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
      fetchFeedbacks();
    }, []);
  
    const averageRating = feedbacks.length
      ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
      : 'N/A';
  
    const handleRatingFilter = (rating) => {
      setSelectedRating(rating);
      setFilteredFeedbacks(rating === null ? feedbacks : feedbacks.filter((f) => f.rating === rating));
    };
  
    const openModal = (feedback) => {
      setSelectedFeedback(feedback);
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
                <h2 className="text-2xl font-semibold mb-4">Support & Feedback</h2>
                <p className="mb-4">Average Rating: <strong>{averageRating} ⭐</strong></p>
  
                <div className="flex gap-2 mb-4">
                  <button
                    className={`px-3 py-1 rounded ${selectedRating === null ? 'bg-yellow-500' : 'bg-gray-600'}`}
                    onClick={() => handleRatingFilter(null)}
                  >All</button>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`px-3 py-1 rounded ${selectedRating === star ? 'bg-yellow-500' : 'bg-gray-600'}`}
                      onClick={() => handleRatingFilter(star)}
                    >
                      {star} ⭐
                    </button>
                  ))}
                </div>
  
                {filteredFeedbacks.map((fb) => (
                  <div key={fb._id} className="bg-gray-700 p-4 rounded mb-4">
                    <p><strong>Rating:</strong> {fb.rating} ⭐</p>
                    <p><strong>Feedback:</strong> {fb.message}</p>
                    <p><strong>Email:</strong> {fb.contactEmail || 'N/A'}</p>
  
                    {fb.responses && fb.responses.length > 0 ? (
  <div className="mt-3 border-t border-gray-600 pt-2">
    <p className="text-green-400 font-semibold">Responses:</p>
    {fb.responses.map((res, idx) => (
      <div key={idx} className="mt-2 bg-gray-600 p-2 rounded">
        <p className="italic">"{res.message}"</p>
        <p className="text-sm text-gray-400">
          — {res.responder || 'Unknown'}, {res.sentAt ? new Date(res.sentAt).toLocaleString() : 'N/A'}
        </p>
      </div>
    ))}
  </div>
) : fb.contactEmail && (
  <button
    onClick={() => openModal(fb)}
    className="mt-3 px-3 py-1 bg-blue-600 rounded"
  >
    Respond
  </button>
)}
                  </div>
                ))}
                {modalOpen && (
                  <EmailResponseModal
                    type="feedback"
                    data={selectedFeedback}
                    onClose={() => setModalOpen(false)}
                    onSuccess={fetchFeedbacks}
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
  
  export default SupportFeedback;
  