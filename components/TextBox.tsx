"use client";

import React, { useState, useEffect } from 'react';
import styles from './TextBox.module.css';

const TextBox = ({ text }: { text: string[] }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const currentLine = text[lineIndex];

  useEffect(() => {
    if (isTyping && charIndex < currentLine.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + currentLine.charAt(charIndex));
        setCharIndex(charIndex + 1);
      }, 50); // Adjust typing speed here
      return () => clearTimeout(timeout);
    } else if (charIndex >= currentLine.length) {
      setShowIndicator(true); // Show the indicator only when all text is displayed
    }
  }, [charIndex, isTyping, currentLine]);

  const handleClick = () => {
    if (cooldown) return; // Ignore clicks during cooldown

    setCooldown(true); // Activate cooldown
    const audio = new Audio('/sounds/advancedtext.mp3');
    audio.volume = 0.5; // Set the volume to 50%
    audio.play(); // Play sound effect immediately on click

    setTimeout(() => {
      setCooldown(false); // Reset cooldown after 500ms
    }, 500);

    if (isTyping) {
      // Finish current chunk immediately
      setDisplayedText(currentLine);
      setIsTyping(false);
      setShowIndicator(true); // Show the indicator after finishing the text
    } else if (lineIndex < text.length - 1) {
      // Advance to the next line of text
      setDisplayedText('');
      setLineIndex(lineIndex + 1);
      setCharIndex(0);
      setIsTyping(true);
      setShowIndicator(false); // Hide the indicator while typing the next chunk
    } else {
      // All text has been displayed
      setShowIndicator(false);
    }
  };

  return (
    <div className={styles.textBox} onClick={handleClick}>
      <p>{displayedText}</p>
      {showIndicator && <div className={styles.indicator}>^</div>}
    </div>
  );
};

export default TextBox;
