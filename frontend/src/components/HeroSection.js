import React from 'react';
import mapImage from '../assets/campus-map.png'; // Add a map image to your assets folder

const HeroSection = () => {
  return (
    <div className="relative h-screen flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Blurred Map Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transform scale-105"
        style={{
          backgroundImage: `url(${mapImage})`,
          filter: 'blur(8px)', // Apply blur effect
        }}
      ></div>

      {/* Overlay to darken the background */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-pixel mb-4 text-yellow-400">
          Welcome to Learniverse
        </h1>
        <p className="text-lg md:text-2xl font-pixel text-white">
          Explore, Learn and Grow in a Gamified Environment
        </p>
      </div>
    </div>
  );
};

export default HeroSection;