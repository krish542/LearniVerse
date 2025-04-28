import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';
import axios from 'axios';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    price: '',
    sortBy: '',
    page: 1,
    limit: 10
  });
  const [loading, setLoading] = useState(false);
  const [totalCourses, setTotalCourses] = useState(0);

  // Fetch courses based on filters
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/courses', {
        params: {
          category: filters.category,
          price: filters.price,
          sortBy: filters.sortBy,
          page: filters.page,
          limit: filters.limit,
        }
      });
      setCourses(response.data);
      setCategories(response.data.categories || []);
      setTotalCourses(response.headers['x-total-count']);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
    setLoading(false);
  };

  // Fetch categories from the backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback: Extract categories from existing courses if API fails
      if (courses.length > 0) {
        const uniqueCategories = [...new Set(courses.map(course => course.category))];
        setCategories(uniqueCategories);
      }
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  useEffect(() => {
    if (courses.length > 0) {
      fetchCategories();
    }
  }, [courses]);

  const handlePagination = (page) => {
    setFilters({ ...filters, page });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="p-4 pt-16">
        <h1 className="text-2xl font-bold mb-4 text-yellow-400">All Courses</h1>

        {/* Filters Section */}
        <div className="flex mb-4 space-x-4">
          <select
            className="border p-2"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            className="border p-2"
            value={filters.price}
            onChange={(e) => setFilters({ ...filters, price: e.target.value })}
          >
            <option value="">All Prices</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>

          <select
            className="border p-2"
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          >
            <option value="">Sort By</option>
            <option value="priceLowToHigh">Price Low to High</option>
            <option value="priceHighToLow">Price High to Low</option>
            <option value="trending">Trending</option>
          </select>
        </div>

        {/* Display Loading Spinner if fetching data */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-yellow-400">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex justify-center space-x-4 text-yellow-400">
          <button
            onClick={() => handlePagination(filters.page - 1)}
            disabled={filters.page <= 1}
            className="border px-4 py-2"
          >
            Previous
          </button>
          <button
            onClick={() => handlePagination(filters.page + 1)}
            disabled={courses.length < filters.limit}
            className="border px-4 py-2"
          >
            Next
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CoursesPage;
