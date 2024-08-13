"use client";

import React, { useState, useRef } from 'react';
import styles from './MusicControl.module.css';

const MusicControl = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = () => {
    if (!musicRef.current) {
      musicRef.current = new Audio('/sounds/intro.mp3');
      musicRef.current.volume = 0.03; // Set volume to 25%
      musicRef.current.loop = true; // Loop the music
    }

    if (isPlaying) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      musicRef.current.play().catch(error => {
        console.error('Failed to play audio:', error);
      });
      setIsPlaying(true);
    }
  };

  return (
    <button className={styles.musicButton} onClick={toggleMusic}>
      {isPlaying ? "X" : "O"}
    </button>
  );
};

export default MusicControl;
