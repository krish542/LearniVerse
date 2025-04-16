// frontend/src/components/EditAvatar.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
//import './index.css'; // Ensure Tailwind CSS is imported

const EditAvatar = () => {
  const [head, setHead] = useState('');
  const [body, setBody] = useState('');
  const [legs, setLegs] = useState('');
  const [gender, setGender] = useState('male');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const headOptions = ['1', '2', '3', '4'];
  const bodyOptions = ['1', '2', '3', '4'];
  const legsOptions = ['1', '2', '3', '4'];

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await axios.get('/api/student/profile', {
          headers: {
            'x-auth-token': token,
          },
        });
        setHead(res.data.avatar.head);
        setBody(res.data.avatar.body);
        setLegs(res.data.avatar.legs);
        const currentGender = res.data.avatar.head.startsWith('female') ? 'female' : 'male';
        setGender(currentGender);
        setLoading(false);
      } catch (err) {
        console.error(err.response.data);
        setError(err.response.data.msg || 'Failed to load profile');
        setLoading(false);
      }
    } else {
      setError('Not authenticated');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleGenderChange = (e) => {
    setGender(e.target.value);
    setHead('');
    setBody('');
    setLegs('');
  };

  const handleHeadChange = useCallback((part) => {
    setHead(`${gender}-head${part}.png`);
  }, [gender]);

  const handleBodyChange = useCallback((part) => {
    setBody(`${gender}-body${part}.png`);
  }, [gender]);

  const handleLegsChange = useCallback((part) => {
    setLegs(`${gender}-legs${part}.png`);
  }, [gender]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const config = {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          },
        };
        const bodyData = JSON.stringify({ head, body, legs });
        const res = await axios.put('/api/student/avatar', bodyData, config);
        console.log('Avatar updated:', res.data);
        setSuccessMessage('Avatar updated successfully!');
        setError('');
      } catch (err) {
        console.error(err.response.data);
        setError(err.response.data.msg || 'Failed to update avatar');
        setSuccessMessage('');
      }
    } else {
      setError('Not authenticated');
      setSuccessMessage('');
    }
  };

  if (loading) {
    return <div className="font-pixel text-yellow-400">Loading profile...</div>;
  }

  if (error) {
    return <div className="font-pixel text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-md sm:mx-auto">
        <div className="bg-gray-800 shadow-lg rounded-xl p-6 border-2 border-yellow-400">
          <h2 className="text-xl font-semibold text-yellow-400 text-center font-pixel mb-4">Edit Avatar</h2>
          {successMessage && (
            <div className="bg-green-200 text-green-800 py-2 px-4 rounded mb-4 font-pixel">{successMessage}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="gender" className="block text-yellow-400 text-sm font-bold mb-2 font-pixel">
                Gender:
              </label>
              <select
                id="gender"
                value={gender}
                onChange={handleGenderChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-yellow-400 leading-tight focus:outline-none focus:shadow-outline font-pixel bg-gray-700"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Avatar Preview */}
            <div className="flex justify-center mb-4">
              <div className="relative w-24 h-32">
                {/* Head (Always on top) */}
                {head && (
                  <img
                    key={head}
                    src={`/assets/avatar/head/${head}`}
                    alt="Avatar Head"
                    className="absolute top-0 left-2.5 w-auto h-auto"
                    style={{ maxHeight: '26%', top: 10, zIndex: 3 }} 
                    onError={(e) => { e.target.onerror = null; e.target.src="/images/default-placeholder.png" }}
                  />
                )}
                {/* Body (Below Head) */}
                {body && (
                  <img
                    key={body}
                    src={`/assets/avatar/body/${body}`}
                    alt="Avatar Body"
                    className="absolute left-0 w-auto h-auto"
                    style={{ maxHeight: '40%', top: '30%', zIndex: 2 }} 
                    onError={(e) => { e.target.onerror = null; e.target.src="/images/default-placeholder.png" }}
                  />
                )}
                {/* Legs (At the bottom) */}
                {legs && (
                  <img
                    key={legs}
                    src={`/assets/avatar/legs/${legs}`}
                    alt="Avatar Legs"
                    className="absolute bottom-0 left-0 w-auto h-auto"
                    style={{ maxHeight: '40%', bottom: 0, zIndex: 1 }} 
                    onError={(e) => { e.target.onerror = null; e.target.src="/images/default-placeholder.png" }}
                  />
                )}
                {!head && !body && !legs && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 font-pixel text-sm">
                    Preview
                  </div>
                )}
              </div>
            </div>

            {/* Head Selection */}
            <div>
              <label className="block text-yellow-400 text-sm font-bold mb-2 font-pixel">
                Head:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {headOptions.map((option) => (
                  <button
                    key={`head-${option}`}
                    type="button"
                    onClick={() => handleHeadChange(option)}
                    className={`rounded-md border-2 border-transparent focus:border-yellow-400 focus:outline-none ${head === `${gender}-head${option}.png` ? 'border-yellow-400' : 'border-gray-700'} bg-gray-700 p-1`}
                  >
                    <img
                      key={`head-thumb-${option}`}
                      src={`/assets/avatar/head/${gender}-head${option}.png`}
                      alt={`Head ${option}`}
                      className="w-full h-auto"
                      onError={(e) => console.error("Failed to load head thumbnail:", e.target.src)}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Body Selection */}
            <div>
              <label className="block text-yellow-400 text-sm font-bold mb-2 font-pixel">
                Body:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {bodyOptions.map((option) => (
                  <button
                    key={`body-${option}`}
                    type="button"
                    onClick={() => handleBodyChange(option)}
                    className={`rounded-md border-2 border-transparent focus:border-yellow-400 focus:outline-none ${body === `${gender}-body${option}.png` ? 'border-yellow-400' : 'border-gray-700'} bg-gray-700 p-1`}
                  >
                    <img
                      key={`body-thumb-${option}`}
                      src={`/assets/avatar/body/${gender}-body${option}.png`}
                      alt={`Body ${option}`}
                      className="w-full h-auto"
                      onError={(e) => console.error("Failed to load body thumbnail:", e.target.src)}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Legs Selection */}
            <div>
              <label className="block text-yellow-400 text-sm font-bold mb-2 font-pixel">
                Legs:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {legsOptions.map((option) => (
                  <button
                    key={`legs-${option}`}
                    type="button"
                    onClick={() => handleLegsChange(option)}
                    className={`rounded-md border-2 border-transparent focus:border-yellow-400 focus:outline-none ${legs === `${gender}-legs${option}.png` ? 'border-yellow-400' : 'border-gray-700'} bg-gray-700 p-1`}
                  >
                    <img
                      key={`legs-thumb-${option}`}
                      src={`/assets/avatar/legs/${gender}-legs${option}.png`}
                      alt={`Legs ${option}`}
                      className="w-full h-auto"
                      onError={(e) => console.error("Failed to load legs thumbnail:", e.target.src)}
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline font-pixel text-sm"
            >
              Save Avatar
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/profile" className="text-yellow-400 font-pixel hover:text-yellow-300">
              Back to Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAvatar;