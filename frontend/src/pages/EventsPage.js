// frontend/src/pages/EventsPage.js
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';
const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filters, setFilters] = useState({ type: '', date: '', sortBy: '', page: 1 });
  const [loading, setLoading] = useState(false);

  // Fetch merged events (workshops + competitions)
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { sortBy, page } = filters;

      const response = await axios.get(`${API_BASE_URL}/api/events`, {
        params: { sortBy, page, limit: 10 },
      });

      const fetchedEvents = response.data;

      // Add client-side filtering if `type` or `date` is selected
      let filtered = [...fetchedEvents];

      if (filters.type) {
        filtered = filtered.filter((event) => event.type === filters.type);
      }

      if (filters.date) {
        const selectedDate = new Date(filters.date).toDateString();
        filtered = filtered.filter(
          (event) => new Date(event.date).toDateString() === selectedDate
        );
      }

      setEvents(fetchedEvents);
      setFilteredEvents(filtered);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="p-4 pt-20">
        <h1 className="text-2xl font-bold mb-4 text-yellow-400">All Events</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          <select
            className="border rounded p-2"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="workshop">Workshop</option>
            <option value="competition">Competition</option>
          </select>

          <input
            type="date"
            className="border rounded p-2"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          />

          <select
            className="border rounded p-2"
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          >
            <option value="">Sort By</option>
            <option value="date">Date</option>
            <option value="trending">Trending</option>
          </select>
        </div>

        {/* Event Cards */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => (
                <EventCard key={event._id || `${event.title}-${index}`} event={event} />
              ))
            ) : (
              <p>No events found.</p>
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            disabled={filters.page <= 1}
          >
            Previous
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            Next
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventsPage;
