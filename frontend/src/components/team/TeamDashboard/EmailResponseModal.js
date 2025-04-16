// frontend/src/components/team/TeamDashboard/EmailResponseModal.js
import React, { useState } from 'react';
import axios from 'axios';

const EmailResponseModal = ({ type, data, onClose, onSuccess }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const token = localStorage.getItem('subAdminToken');
    setLoading(true);

    try {
      await axios.post(`/api/${type}/respond/${data._id}`, {
        message,
        email: data.contactEmail,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error sending email response:', err);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-lg text-white">
        <h2 className="text-xl font-semibold mb-4">Respond to {data.contactEmail}</h2>
        <textarea
          rows={5}
          className="w-full p-3 rounded bg-gray-800 border border-gray-600 text-white"
          placeholder="Write your response..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">Cancel</button>
          <button onClick={handleSend} className="px-4 py-2 bg-blue-600 rounded" disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailResponseModal;