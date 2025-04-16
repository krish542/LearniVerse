import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CourseCard from './CourseCard';

const FeaturedCourses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Fetch featured courses from the backend
    axios.get('http://localhost:5000/api/featured-courses')
      .then((response) => {
        setCourses(response.data);
      })
      .catch((error) => {
        console.error('Error fetching featured courses:', error);
      });
  }, []);

  return (
    <div className="bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-pixel text-yellow-400 text-center mb-8">
          Featured Courses
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedCourses;