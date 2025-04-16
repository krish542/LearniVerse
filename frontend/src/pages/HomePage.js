import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './HomePage.css';
import HeroSection from '../components/HeroSection';
import FeaturedCourses from '../components/FeaturedCourses';
import UpcomingEvents from '../components/UpcomingEvents';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection/>
      <FeaturedCourses/>
      <UpcomingEvents/>
      <Footer/>
    </div>
  );
};

export default HomePage;