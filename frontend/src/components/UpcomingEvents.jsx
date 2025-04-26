import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EventCard from './EventCard';

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/upcoming-events')
      .then((response) => setEvents(response.data))
      .catch((error) => console.error('Error fetching events:', error));
  }, []);

  return (
    <div className="bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-pixel text-yellow-400 text-center mb-8">
          Upcoming Events
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        <div className="text-center mt-6">
          <a href="/events" className="text-yellow-300 hover:underline text-lg">View All Events</a>
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvents;
