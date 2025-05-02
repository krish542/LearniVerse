import React from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../utils/apiConfig';
const CourseCard = ({ course }) => {
  return (
    <div className="border p-4 rounded-lg shadow-md">
      <img
        src={`${API_BASE_URL}${course.thumbnail}`}
        alt={course.title}
        className="w-full h-40 object-cover rounded-lg mb-4"
      />
      <h3 className="font-bold text-lg text-yellow-400">{course.title}</h3>
      <p className="text-sm text-yellow-100">{course.description}</p>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-lg font-semibold text-yellow-400">${course.price}</span>
        <Link to={`/courses/${course._id}`} className="text-yellow-500 hover:underline">
          View Course
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
