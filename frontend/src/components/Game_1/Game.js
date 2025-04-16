import React, { useRef, useEffect, useState } from 'react';
import Phaser from 'phaser';
import MainScene from './MainScene';
import Modal from './Modal';

const Game = () => {
    const gameRef = useRef(null);
    let gameInstance = null;
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    const [modalData, setModalData] = useState({
        isOpen: false,
        title: '',
        type: '',
        id: ''
    });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
            
            if (gameInstance) {
                gameInstance.scale.resize(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener('resize', handleResize);

        const config = {
            type: Phaser.AUTO,
            width: dimensions.width,
            height: dimensions.height,
            parent: gameRef.current,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false,
                },
            },
            scene: [MainScene],
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        };

        if (!gameInstance) {
            gameInstance = new Phaser.Game(config);
            
            // Listen for modal events from Phaser
            gameInstance.events.on('showModal', (data) => {
                setModalData({
                    isOpen: true,
                    title: data.label,
                    type: data.type,
                    id: data.id
                });
            });
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (gameInstance) {
                gameInstance.events.off('showModal');
                if (gameInstance.scene.getScene('MainScene')) {
                    gameInstance.scene.getScene('MainScene').shutdown();
                }
                gameInstance.destroy(true);
                gameInstance = null;
            }
        };
    }, []);

    const closeModal = () => {
        setModalData(prev => ({ ...prev, isOpen: false }));
    };

    const getModalContent = () => {
        switch(modalData.type) {
            case 'room':
                return <p>This is the {modalData.title}. What would you like to do here?</p>;
            case 'chair':
                return <p>Sit down at this chair in {modalData.title}.</p>;
            case 'stage':
                return <p>Perform on the stage in {modalData.title}.</p>;
            case 'banner':
                return <p>View information about {modalData.title}.</p>;
            case 'board':
                return <p>View updates and information on the board in {modalData.title}.</p>;
            case 'screen':
                return <p>View the presentation on the screen in {modalData.title}.</p>;
            case 'books':
                return <p>Browse study materials in {modalData.title}.</p>;
            case 'waiting_area':
                return <p>Wait for your turn in {modalData.title}.</p>;
            default:
                return <p>Interact with {modalData.title}.</p>;
        }
    };

    return (
        <>
            <div ref={gameRef} style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                overflow: 'hidden'
            }} />
            
            <Modal 
                isOpen={modalData.isOpen} 
                onClose={closeModal}
                title={modalData.title}
            >
                {getModalContent()}
            </Modal>
        </>
    );
};

export default Game;