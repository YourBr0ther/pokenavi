"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from './TextBox.module.css';

const TextBox = ({ text, onTextComplete }: { text: string[], onTextComplete: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const handleClick = () => {
    if (cooldown) return; // Prevent rapid-fire clicking

    // Play click sound
    const audio = new Audio('/sounds/advancedtext.mp3');
    audio.volume = 0.03; // Set the volume to 50%
    audio.play().catch(error => {
      console.error('Failed to play click sound:', error);
    });

    setCooldown(true); // Activate cooldown
    setTimeout(() => {
      setCooldown(false); // Reset cooldown after 100ms
    }, 100);

    if (isTyping) {
      // Finish current chunk immediately
      setDisplayedText(text[lineIndex]);
      setIsTyping(false);
      setShowIndicator(true);
    } else if (lineIndex < text.length - 1) {
      // Advance to the next line of text
      setDisplayedText('');
      setLineIndex(lineIndex + 1);
      setCharIndex(0);
      setIsTyping(true);
      setShowIndicator(false);
    } else {
      // All text has been displayed
      setShowIndicator(false);
      onTextComplete();
    }
  };

  useEffect(() => {
    if (isTyping && charIndex < text[lineIndex].length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[lineIndex].charAt(charIndex));
        setCharIndex(charIndex + 1);
      }, 50);
      return () => clearTimeout(timeout);
    } else if (charIndex >= text[lineIndex].length) {
      setShowIndicator(true);
    }
  }, [charIndex, isTyping, text, lineIndex]);

  return (
    <div className={styles.textBox} onClick={handleClick}>
      <p>{displayedText}</p>
      {showIndicator && <div className={styles.indicator}>^</div>}
    </div>
  );
};

export default TextBox;
