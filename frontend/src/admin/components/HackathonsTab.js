import React, { useState } from 'react';
import Select from 'react-select';

const mockMentors = [
  { value: 'mentor1@example.com', label: 'Jane Doe (Frontend)' },
  { value: 'mentor2@example.com', label: 'John Smith (Backend)' },
  { value: 'mentor3@example.com', label: 'Ava Patel (AI/ML)' },
];

// Mock Hackathons List
const mockHackathons = [
  {
    id: '1',
    title: 'CodeStorm 2025',
    description: 'A 24-hour coding sprint for beginners and pros.',
    registrationDeadline: '2025-05-10T18:00',
    eventDate: '2025-05-15T09:00',
    status: 'Upcoming',
    theme: 'AI for Good',
    mentors: ['Jane Doe (Frontend)', 'Ava Patel (AI/ML)'],
    rules: 'rules-codestorm.pdf',
    prizeDetails: 'prizes-codestorm.png',
  },
  {
    id: '2',
    title: 'Hack the Future',
    description: 'Solve real-world tech problems with your team.',
    registrationDeadline: '2025-06-01T23:59',
    eventDate: '2025-06-10T10:00',
    status: 'Upcoming',
    theme: 'ClimateTech',
    mentors: ['John Smith (Backend)'],
    rules: 'rules-future.pdf',
    prizeDetails: 'prizes-future.pdf',
  },
];

const HackathonsTab = () => {
  const [hackathonData, setHackathonData] = useState({
    title: '',
    description: '',
    registrationDeadline: '',
    eventDate: '',
    rulesFile: null,
    prizesFile: null,
    selectedMentors: [],
  });

  const handleInputChange = (e) => {
    setHackathonData({ ...hackathonData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setHackathonData({ ...hackathonData, [e.target.name]: e.target.files[0] });
  };

  const handleMentorChange = (selectedOptions) => {
    setHackathonData({ ...hackathonData, selectedMentors: selectedOptions });
  };

  const handleCreateHackathon = () => {
    console.log('Submitted:', hackathonData);
    // TODO: Send this data to your backend
  };

  return (
    <div className="space-y-10">
      {/* Hackathon Creation Form */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Manage Hackathons</h2>
        <p className="text-sm text-gray-600 mb-4">
          Plan coding challenges, assign mentors, set dates, upload resources, and track participant progress.
        </p>

        <div className="bg-white p-4 rounded shadow space-y-4">
          <div>
            <label className="block font-medium mb-1">Hackathon Title</label>
            <input
              type="text"
              name="title"
              value={hackathonData.title}
              onChange={handleInputChange}
              className="border rounded w-full p-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={hackathonData.description}
              onChange={handleInputChange}
              className="border rounded w-full p-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Registration Deadline</label>
            <input
              type="datetime-local"
              name="registrationDeadline"
              value={hackathonData.registrationDeadline}
              onChange={handleInputChange}
              className="border rounded w-full p-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Event Date & Time</label>
            <input
              type="datetime-local"
              name="eventDate"
              value={hackathonData.eventDate}
              onChange={handleInputChange}
              className="border rounded w-full p-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Upload Rules (PDF or Image)</label>
            <input
              type="file"
              accept=".pdf, image/*"
              name="rulesFile"
              onChange={handleFileChange}
              className="border rounded w-full p-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Upload Prizes Details (PDF or Image)</label>
            <input
              type="file"
              accept=".pdf, image/*"
              name="prizesFile"
              onChange={handleFileChange}
              className="border rounded w-full p-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Select Mentors</label>
            <Select
              isMulti
              name="mentors"
              options={mockMentors}
              value={hackathonData.selectedMentors}
              onChange={handleMentorChange}
              placeholder="Search and select mentors..."
            />
          </div>

          <button
            onClick={handleCreateHackathon}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Hackathon
          </button>
        </div>
      </div>

      {/* Hackathon List */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Upcoming Hackathons</h3>
        {mockHackathons.length === 0 ? (
          <p className="italic text-gray-500">No hackathons created yet.</p>
        ) : (
          <div className="space-y-4">
            {mockHackathons.map((hackathon) => (
              <div key={hackathon.id} className="bg-white border rounded p-4 shadow">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-bold">{hackathon.title}</h4>
                  <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    {hackathon.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Theme:</strong> {hackathon.theme}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Registration Deadline:</strong> {hackathon.registrationDeadline}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Event Date:</strong> {hackathon.eventDate}
                </p>
                <p className="mt-2 text-sm">{hackathon.description}</p>
                <p className="mt-2 text-sm text-gray-700">
                  <strong>Mentors:</strong> {hackathon.mentors.join(', ')}
                </p>
                <p className="mt-2 text-sm text-blue-700">
                  <strong>Rules:</strong> {hackathon.rules}
                </p>
                {hackathon.prizeDetails && (
                  <p className="mt-2 text-sm text-green-700">
                    <strong>Prizes:</strong> {hackathon.prizeDetails}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HackathonsTab;
