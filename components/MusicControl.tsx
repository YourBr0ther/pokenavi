"use client";

import React, { useRef } from 'react';
import styles from './MusicControl.module.css';

const MusicControl = () => {
  const musicRef = useRef<HTMLAudioElement | null>(null);

  const startMusic = () => {
    if (!musicRef.current) {
      musicRef.current = new Audio('/sounds/intro.mp3');
      musicRef.current.volume = 0.5; // Adjust volume as needed
      musicRef.current.loop = true; // Loop the music
      musicRef.current.play().catch(error => {
        console.error('Failed to play audio:', error);
      });
    }
  };

  const stopMusic = () => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
  };

  return (
    <>
      <button className={styles.startButton} onClick={startMusic}>Start Music</button>
      <button className={styles.stopButton} onClick={stopMusic}>X</button>
    </>
  );
};

export default MusicControl;
