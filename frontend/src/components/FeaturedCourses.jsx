import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CourseCard from './CourseCard';
import API_BASE_URL from '../utils/apiConfig';
const FeaturedCourses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/featured-courses`)
      .then((response) => setCourses(response.data))
      .catch((error) => console.error('Error fetching featured courses:', error));
  }, []);

  return (
    <div className="bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-pixel text-yellow-400 text-center mb-8">
          Featured Courses
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
        <div className="text-center mt-6">
          <a href="/courses" className="text-yellow-300 hover:underline text-lg">View All Courses</a>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCourses;
