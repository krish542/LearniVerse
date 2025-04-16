import React, { useState } from 'react';
import axios from 'axios';
import Footer from './Footer';
import Navbar from './Navbar';

const ReportPage = () => {
  const [issueType, setIssueType] = useState('Bug');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('/api/report', { issueType, description, contactEmail });
      setSubmitted(true);
      setIssueType('Bug');
      setDescription('');
      setContactEmail('');
    } catch (err) {
      console.error('Error submitting report:', err);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-950 text-white p-6 flex items-center justify-center">
      <div className="max-w-lg w-full bg-gray-900 p-8 rounded shadow">
        <h2 className="text-2xl font-pixel text-yellow-400 mb-6 text-center">Report a Problem</h2>

        {submitted ? (
          <p className="text-green-400 text-center">Thank you for your report!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-gray-300">Issue Type</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full p-3 rounded bg-gray-800 text-white"
              >
                <option value="Bug">Bug</option>
                <option value="Error">Error</option>
                <option value="Abuse">Abuse</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="Describe the issue..."
              className="w-full p-3 rounded bg-gray-800 text-white resize-none"
              required
            />

            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Optional: Your email"
              className="w-full p-3 rounded bg-gray-800 text-white"
            />

            <button
              type="submit"
              className="bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-500 transition"
            >
              Submit Report
            </button>
          </form>
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default ReportPage;
