import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <div className="border p-4 rounded-lg shadow-md">
      <img
        src={`http://localhost:5000${course.thumbnail}`}
        alt={course.title}
        className="w-full h-40 object-cover rounded-lg mb-4"
      />
      <h3 className="font-bold text-lg">{course.title}</h3>
      <p className="text-sm text-gray-600">{course.description}</p>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-lg font-semibold">${course.price}</span>
        <Link to={`/courses/${course._id}`} className="text-blue-500 hover:underline">
          View Course
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
