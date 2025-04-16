import React from 'react';

const EventCard = ({ event }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <img
        src={event.thumbnail}
        alt={event.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-pixel text-yellow-400 mb-2">{event.title}</h3>
        <p className="text-gray-300 text-sm mb-4">{event.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">{event.date}</span>
          <button className="bg-yellow-400 text-gray-900 font-pixel px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors duration-300">
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;