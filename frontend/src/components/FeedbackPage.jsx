import React, { useState } from 'react';
import axios from 'axios';
import Footer from './Footer';
import Navbar from './Navbar';

const FeedbackPage = () => {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [contactEmail, setContactEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('/api/feedback', { message, rating, contactEmail });
      setSubmitted(true);
      setMessage('');
      setRating(0);
      setContactEmail('');
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-950 text-white p-6 flex items-center justify-center">
      <div className="max-w-lg w-full bg-gray-900 p-8 rounded shadow">
        <h2 className="text-2xl font-pixel text-yellow-400 mb-6 text-center">Submit Feedback</h2>

        {submitted ? (
          <p className="text-green-400 text-center">Thank you for your feedback!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              placeholder="Write your feedback..."
              className="w-full p-3 rounded bg-gray-800 text-white resize-none"
              required
            />

            <div>
              <label className="block mb-1 text-gray-300">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl cursor-pointer ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-500'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

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
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default FeedbackPage;