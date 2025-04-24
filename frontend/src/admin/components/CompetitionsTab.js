import React, { useState } from 'react';

const predefinedCategories = [
    // 🧠 Tech & Academic
    'Coding Challenge',
    'Hackathon',
    'App Development',
    'Web Development',
    'UI/UX Design',
    'Data Science Contest',
    'AI/Machine Learning',
    'Cybersecurity CTF',
    'Blockchain Use Case',
    'Robotics Simulation',
    'Math/Logic Puzzle',
  
    // 🎭 Arts & Performance
    'Solo Singing',
    'Group Dance',
    'Open Mic (Comedy/Poetry)',
    'Drama / Skit',
    'Instrumental Battle',
    'Face Painting',
    'Photography Contest',
    'Digital Poster Design',
    'Short Film Making',
  
    // 🎨 Creative & Hobbyist
    'DIY Crafts',
    'Memes & Reels',
    'Sketching / Drawing',
    'Poetry Slam / Storytelling',
    'Tattoo / Henna Design',
    'Nail Art',
  
    // 🧩 Fun & Engaging
    'Treasure Hunt',
    'Scavenger Quiz',
    'Minute to Win It',
    'Escape Room',
    'Cooking Without Fire',
    'Lip Sync Battle',
    'Fashion Show / Cosplay',
    'Pet Show',
  
    // 🏆 Leadership & Soft Skills
    'Debate / Group Discussion',
    'Model United Nations (MUN)',
    'Business Pitch',
    'Resume & Interview Sim',
    'Leadership Olympics',
    'Crisis Management',
  
    // ⚽ Sports & Outdoor
    'E-Sports Tournament',
    'Chess Blitz',
    'Table Tennis',
    'Fitness Challenge',
    'Tug of War',
    'Mini Olympics',
  
    // 💡 Bonus
    'Techies vs Non-Techies',
    'Meme War',
    'Theme Days (Retro, Anime, etc.)'
  ];
  

const CompetitionsTab = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    instructions: '',
    poster: null,
  });

  const [competitions, setCompetitions] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleAddCompetition = () => {
    if (
      formData.title &&
      formData.description &&
      formData.category &&
      formData.startDate &&
      formData.endDate
    ) {
      const newCompetition = { ...formData, id: Date.now() };
      setCompetitions([newCompetition, ...competitions]);
      setFormData({
        title: '',
        description: '',
        category: '',
        startDate: '',
        endDate: '',
        instructions: '',
        poster: null,
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Manage Competitions</h2>
      <p className="text-sm text-gray-600 mb-4">
        Create and publish engaging competitions for students.
      </p>

      {/* Form */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h3 className="text-lg font-bold mb-4">Create New Competition</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="block font-medium mb-1">Competition Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Competition Title"
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-medium mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Category</option>
              {predefinedCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block font-medium mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block font-medium mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Description */}
          <div className="col-span-1 md:col-span-2">
            <label className="block font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Competition Description"
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Instructions */}
          <div className="col-span-1 md:col-span-2">
            <label className="block font-medium mb-1">Submission Guidelines / Instructions</label>
            <input
              type="file"
              name="instructions"
              accept=".pdf, image/*"
              onChange={handleFileChange}
              className="border p-2 rounded w-full"
            />
            <p className="text-sm text-gray-500 mt-2">Upload PDF, Image, or Document for submission instructions.</p>
          </div>

          {/* Poster */}
          <div>
            <label className="block font-medium mb-1">Upload Poster (Optional)</label>
            <input
              type="file"
              name="poster"
              accept="image/*"
              onChange={handleFileChange}
              className="border p-2 rounded w-full"
            />
            <p className="text-sm text-gray-500 mt-2">Optional: Upload a poster to attract participants (Image only).</p>
          </div>
        </div>

        {/* Add Competition Button */}
        <button
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleAddCompetition}
        >
          Add Competition
        </button>
      </div>

      {/* List of Competitions */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Published Competitions</h3>
        {competitions.length === 0 ? (
          <p className="text-gray-500 italic">No competitions added yet.</p>
        ) : (
          <div className="space-y-4">
            {competitions.map((comp) => (
              <div key={comp.id} className="bg-white p-4 rounded shadow border">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-bold">{comp.title}</h4>
                  <span className="text-sm text-gray-600">{comp.category}</span>
                </div>
                <p className="text-sm text-gray-700 mb-1">{comp.description}</p>
                <p className="text-xs text-gray-500">
                  {comp.startDate} to {comp.endDate}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Instructions:</strong> {comp.instructions}
                </p>
                {comp.poster && (
                  <div className="mt-2">
                    <strong>Poster:</strong>
                    <img
                      src={URL.createObjectURL(comp.poster)}
                      alt="Poster"
                      className="mt-2 max-w-xs rounded shadow"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionsTab;
