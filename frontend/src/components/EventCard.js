import React from 'react';

const EventCard = ({ event }) => {
  const { title, type, poster, id } = event;
  const baseURL = 'http://localhost:5000';

  let posterPath = poster;

  if (poster && !poster.includes('uploads/')) {
    const folder = type === 'competition' ? 'competitionPosters' : 'workshopPosters';
    posterPath = `uploads/${folder}/${poster}`;
  }

  const posterUrl = poster
    ? poster.startsWith('http')
      ? poster
      : `${baseURL}${poster}`
    : `${baseURL}/uploads/default-poster.jpg`;

  const actionLabel = type === 'competition' ? 'View Competition' : 'Join Workshop';
  const actionLink = type === 'competition'
    ? `/competitions/${id}`
    : `/workshops/${id}`;

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col hover:scale-[1.02] transition-all duration-200">
      <div className="w-full h-44 overflow-hidden">
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `${baseURL}/uploads/default-poster.jpg`;
          }}
        />
      </div>
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-white text-lg font-semibold mb-1">{title}</h3>

          {/* 🗓️ Date Range Logic */}
          {event.final?.confirmedDates?.length > 0 && (() => {
            const sortedDates = [...event.final.confirmedDates].sort((a, b) => new Date(a) - new Date(b));
            const startDate = new Date(sortedDates[0]);
            const endDate = new Date(sortedDates[sortedDates.length - 1]);

            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            const formattedStart = startDate.toLocaleDateString(undefined, options);
            const formattedEnd = endDate.toLocaleDateString(undefined, options);

            return (
              <p className="text-sm text-gray-400 mb-2">
                {formattedStart === formattedEnd ? formattedStart : `${formattedStart} – ${formattedEnd}`}
              </p>
            );
          })()}

          <span className="inline-block bg-yellow-500 text-black text-xs font-semibold px-2 py-1 rounded-full capitalize">
            {type}
          </span>
        </div>
        <a
          href={actionLink}
          className="mt-4 inline-block bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold py-2 px-4 rounded-xl text-center transition-all duration-150"
        >
          {actionLabel}
        </a>
      </div>
    </div>
  );
};

export default EventCard;
