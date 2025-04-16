import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const AddCourse = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [isMonetized, setIsMonetized] = useState(false);
  const [price, setPrice] = useState(0);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMonetizationChange = (event) => {
    setIsMonetized(event.target.checked);
    if (!event.target.checked) {
      setPrice(0);
    }
  };

  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];
    setThumbnail(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const teacherToken = localStorage.getItem('teacherToken');

    if (!teacherToken) {
      navigate('/teacher/login');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }
    formData.append('isMonetized', isMonetized);
    formData.append('price', isMonetized ? parseFloat(price) : 0);

    try {
      const response = await fetch('/api/teacher/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${teacherToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        console.log('Course added successfully!');
        navigate('/teacher/courses');
      } else {
        const errorData = await response.json();
        console.error('Failed to add course:', errorData.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-md z-30 w-full">
        <Navbar />
      </header>

      <button
        onClick={toggleMobileMenu}
        className="fixed top-16 left-4 bg-gray-800 text-white p-2 rounded-md z-20 lg:hidden shadow-md"
        style={{ top: '4rem' }}
      >
        <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
      </button>

      <div className="flex flex-row flex-1 overflow-x-hidden">
        <aside
          className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 shadow-md z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <TeacherSidebar onCloseMobileMenu={toggleMobileMenu} />
        </aside>

        <main className={`flex-1 py-28 px-4 lg:p-8 ${isMobileMenuOpen ? 'ml-0' : 'lg:ml-64'}`}>
          <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-[#F38380]">Add New Course</h1>
          <div className="bg-white shadow-md rounded-md p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                  Title:
                </label>
                <input
                  type="text"
                  id="title"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                  Description:
                </label>
                <textarea
                  id="description"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
                  Category:
                </label>
                <input
                  type="text"
                  id="category"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="thumbnail" className="block text-gray-700 text-sm font-bold mb-2">
                  Thumbnail:
                </label>
                <input
                  type="file"
                  id="thumbnail"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  onChange={handleThumbnailChange}
                  accept="image/*"
                />
                {thumbnailPreview && (
                  <div className="mt-2">
                    <img src={thumbnailPreview} alt="Thumbnail Preview" className="max-h-40" />
                  </div>
                )}
              </div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="isMonetized"
                  className="mr-2 leading-tight"
                  checked={isMonetized}
                  onChange={handleMonetizationChange}
                />
                <label htmlFor="isMonetized" className="text-gray-700 text-sm font-bold">
                  Monetize this course?
                </label>
              </div>
              {isMonetized && (
                <div>
                  <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">
                    Price:
                  </label>
                  <input
                    type="number"
                    id="price"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                  />
                </div>
              )}
              <button
                type="submit"
                className="bg-[#F38380] hover:bg-[#e66a67] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Add Course
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddCourse;