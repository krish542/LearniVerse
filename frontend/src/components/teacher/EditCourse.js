//frontend/src/components/teacher/EditCourse.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import API_BASE_URL from '../../utils/apiConfig';
const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(0);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [lectures, setLectures] = useState([]);
  const [newLectureTitle, setNewLectureTitle] = useState('');
  const [newLectureDescription, setNewLectureDescription] = useState('');
  const [newLectureVideo, setNewLectureVideo] = useState(null);
  const [newLectureNotes, setNewLectureNotes] = useState(null);
  const [newLectureDuration, setNewLectureDuration] = useState('');
  const [uploadingLecture, setUploadingLecture] = useState(false);
  const [uploadLectureError, setUploadLectureError] = useState(null);
  const [editingLectureId, setEditingLectureId] = useState(null);
  const [editedLecture, setEditedLecture] = useState({
    title: '',
    description: '',
    duration: '',
    video: null,
    notes: null
  });

  useEffect(() => {
    const fetchCourseDetails = async () => {
      const teacherToken = localStorage.getItem('teacherToken');
      if (!teacherToken) {
        navigate('/teacher/login');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/teacher/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${teacherToken}` },
        });
        setCourse(response.data);
        setTitle(response.data.title || '');
        setDescription(response.data.description || '');
        setCategory(response.data.category || '');
        setPrice(response.data.price || 0);
        setThumbnailPreview(response.data.thumbnail ? `/uploads/courseThumbs/${response.data.thumbnail.split('/').pop()}` : '');
        setLectures(response.data.lectures || []);
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError(err.response?.data?.message || 'Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, navigate]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setThumbnail(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview(course?.thumbnail ? `/uploads/courseThumbs/${course.thumbnail.split('/').pop()}` : '');
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    const teacherToken = localStorage.getItem('teacherToken');
    if (!teacherToken) {
      navigate('/teacher/login');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('price', price);
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }

    try {
      await axios.put(`/api/teacher/courses/${courseId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${teacherToken}`,
        },
      });
      alert('Course updated successfully!');
    } catch (err) {
      console.error('Error updating course:', err);
      setError(err.response?.data?.message || 'Failed to update course.');
    }
  };

  const handleEditLecture = (lecture) => {
    setEditingLectureId(lecture._id);
    setEditedLecture({
      title: lecture.title,
      description: lecture.description,
      duration: lecture.duration,
      video: null,
      notes: null
    });
  };

  const handleCancelEdit = () => {
    setEditingLectureId(null);
    setEditedLecture({
      title: '',
      description: '',
      duration: '',
      video: null,
      notes: null
    });
  };

  const handleLectureInputChange = (e) => {
    const { name, value } = e.target;
    setEditedLecture(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLectureFileChange = (e) => {
    const { name, files } = e.target;
    setEditedLecture(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleSaveLecture = async (lectureId) => {
    const teacherToken = localStorage.getItem('teacherToken');
    if (!teacherToken) {
      navigate('/teacher/login');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', editedLecture.title);
      formData.append('description', editedLecture.description);
      formData.append('duration', editedLecture.duration);
      if (editedLecture.video) {
        formData.append('video', editedLecture.video);
      }
      if (editedLecture.notes) {
        formData.append('notes', editedLecture.notes);
      }
      if (!courseId || !lectureId) {
        throw new Error('Missing courseId or lectureId',`/api/teacher/courses/${courseId}/lectures/${lectureId}`);
      }
      console.log('making request to:', )
  
      await axios.put(`${API_BASE_URL}/api/teacher/courses/${courseId}/lectures/${lectureId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${teacherToken}`,
        },
      });

      // Refresh lectures after update
      const response = await axios.get(`${API_BASE_URL}/api/teacher/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${teacherToken}` },
      });
      setLectures(response.data.lectures || []);
      setEditingLectureId(null);
      alert('Lecture updated successfully!');
    } catch (err) {
      console.error('Error updating lecture:', err);
      setError(err.response?.data?.message || 'Failed to update lecture.');
    }
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!newLectureTitle || !newLectureVideo) {
      setUploadLectureError('Please provide a title and video for the lecture.');
      return;
    }
    setUploadingLecture(true);
    setUploadLectureError(null);
    const teacherToken = localStorage.getItem('teacherToken');
    if (!teacherToken) {
      navigate('/teacher/login');
      return;
    }

    const formData = new FormData();
    formData.append('title', newLectureTitle);
    formData.append('description', newLectureDescription);
    formData.append('video', newLectureVideo);
    if (newLectureNotes) {
      formData.append('notes', newLectureNotes);
    }
    formData.append('duration', newLectureDuration || '');

    try {
      const response = await axios.post(`/api/teacher/courses/${courseId}/lectures`, formData, {
        headers: {
          Authorization: `Bearer ${teacherToken}`,
          timeout: 60000
        },
      });
      setLectures((prevLectures) => [...prevLectures, response.data.lecture]);
      setNewLectureTitle('');
      setNewLectureDescription('');
      setNewLectureVideo(null);
      setNewLectureNotes(null);
      setNewLectureDuration('');
      setUploadingLecture(false);
      alert('Lecture added successfully!');
    } catch (err) {
      console.error('Error adding lecture:', err);
      setUploadLectureError(err.response?.data?.message || 'Failed to add lecture.');
      setUploadingLecture(false);
    }
  };

  const handleRemoveLecture = async (lectureId) => {
    const teacherToken = localStorage.getItem('teacherToken');
    if (!teacherToken) {
      navigate('/teacher/login');
      return;
    }

    if (window.confirm('Are you sure you want to remove this lecture?')) {
      try {
        await axios.delete(`/api/teacher/courses/${courseId}/lectures/${lectureId}`, {
          headers: { Authorization: `Bearer ${teacherToken}` },
        });
        setLectures(lectures.filter((lecture) => lecture._id !== lectureId));
        alert('Lecture removed successfully!');
      } catch (err) {
        console.error('Error removing lecture:', err);
        setError(err.response?.data?.message || 'Failed to remove lecture.');
      }
    }
  };

  if (loading) {
    return <div>Loading course details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!course) {
    return <div>Course not found.</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-4">Edit Course</h2>

      {/* Update Course Form */}
      <form onSubmit={handleUpdateCourse} className="mb-6">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
          <input
            type="text"
            id="title"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
          <textarea
            id="description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">Category:</label>
          <input
            type="text"
            id="category"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">Price:</label>
          <input
            type="number"
            id="price"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            min="0"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="thumbnail" className="block text-gray-700 text-sm font-bold mb-2">Thumbnail:</label>
          <input
            type="file"
            id="thumbnail"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            onChange={handleThumbnailChange}
          />
          {thumbnailPreview && (
            <img src={thumbnailPreview} alt="Course Thumbnail" className="mt-2 max-h-40" />
          )}
        </div>
        <button
          type="submit"
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Update Course Details
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>

      {/* Add New Lecture Form */}
      <h3 className="text-xl font-semibold mb-4">Add New Lecture</h3>
      <form onSubmit={handleAddLecture} className="mb-6">
        <div className="mb-4">
          <label htmlFor="newLectureTitle" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
          <input
            type="text"
            id="newLectureTitle"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={newLectureTitle}
            onChange={(e) => setNewLectureTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="newLectureDescription" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
          <textarea
            id="newLectureDescription"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={newLectureDescription}
            onChange={(e) => setNewLectureDescription(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="newLectureVideo" className="block text-gray-700 text-sm font-bold mb-2">Video:</label>
          <input
            type="file"
            id="newLectureVideo"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            onChange={(e) => setNewLectureVideo(e.target.files[0])}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="newLectureNotes" className="block text-gray-700 text-sm font-bold mb-2">Notes (Optional):</label>
          <input
            type="file"
            id="newLectureNotes"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            onChange={(e) => setNewLectureNotes(e.target.files[0])}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="newLectureDuration" className="block text-gray-700 text-sm font-bold mb-2">Duration (Optional):</label>
          <input
            type="text"
            id="newLectureDuration"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={newLectureDuration}
            onChange={(e) => setNewLectureDuration(e.target.value)}
            placeholder="e.g., 15 minutes"
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={uploadingLecture}
        >
          {uploadingLecture ? 'Adding Lecture...' : 'Add Lecture'}
        </button>
        {uploadLectureError && <p className="text-red-500 mt-2">{uploadLectureError}</p>}
      </form>

      {/* Lectures List */}
      <h3 className="text-xl font-semibold mb-4">Lectures</h3>
      {lectures.length === 0 ? (
        <p>No lectures added yet.</p>
      ) : (
        <div className="space-y-4">
          {lectures.map((lecture) => (
            <div key={lecture._id} className="bg-white p-4 rounded-lg shadow">
              {editingLectureId === lecture._id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">Title:</label>
                    <input
                      type="text"
                      name="title"
                      value={editedLecture.title}
                      onChange={handleLectureInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">Description:</label>
                    <textarea
                      name="description"
                      value={editedLecture.description}
                      onChange={handleLectureInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">Duration:</label>
                    <input
                      type="text"
                      name="duration"
                      value={editedLecture.duration}
                      onChange={handleLectureInputChange}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., 15 minutes"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">Video (leave empty to keep current):</label>
                    <input
                      type="file"
                      name="video"
                      onChange={handleLectureFileChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">Notes (leave empty to keep current):</label>
                    <input
                      type="file"
                      name="notes"
                      onChange={handleLectureFileChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleSaveLecture(lecture._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 text-white px-3 py-1 rounded"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{lecture.title}</h4>
                    {lecture.description && <p className="text-gray-600 text-sm">{lecture.description}</p>}
                    {lecture.duration && <p className="text-gray-500 text-sm">Duration: {lecture.duration}</p>}
                    <div className="mt-2">
                      <video width="200" controls className="mb-2">
                        <source src={`${API_BASE_URL}${lecture.video}`} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      {lecture.notes && (
                        <a
                          href={`${API_BASE_URL}${lecture.notes}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 text-sm underline"
                        >
                          View Notes
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-2 md:mt-0">
                    <button
                      onClick={() => handleEditLecture(lecture)}
                      className="text-yellow-500 hover:text-yellow-700 p-2"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      onClick={() => handleRemoveLecture(lecture._id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EditCourse;