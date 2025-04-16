import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import GameScene from './GameScene';

const Game = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: '100%',
      height: '100%',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: [GameScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    // Initialize the game
    gameRef.current = new Phaser.Game(config);

    return () => {
      // Clean up the game when component unmounts
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      id="game-container" 
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden'
      }}
    />
  );
};

export default Game;