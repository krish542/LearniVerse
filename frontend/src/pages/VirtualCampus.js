import React from 'react';
import Navbar from '../components/Navbar';
import Game from '../components/Game';

const VirtualCampus = () => {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
        <Navbar />
        <div className="flex-grow overflow-hidden">
            <Game />
        </div>
    </div>
    );
};

export default VirtualCampus;