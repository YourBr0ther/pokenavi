"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './Overlay.module.css';

const Overlay = ({ onComplete }: { onComplete: (data: { name: string; gender: string }) => void }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // Automatically focus to bring up the keyboard
    }
  }, [step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (step === 1) {
      setName(e.target.value);
    } else if (step === 2) {
      setGender(e.target.value);
    }
  };

  const handleInputSubmit = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2 && gender.trim()) {
      const userData = { name, gender };
      localStorage.setItem('userData', JSON.stringify(userData)); // Save data to localStorage
      onComplete(userData);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p>{step === 1 ? "What is your name?" : "What is your gender?"}</p>
        <input
          ref={inputRef}
          type="text"
          value={step === 1 ? name : gender}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
          className={styles.input}
        />
      </div>
    </div>
  );
};

export default Overlay;
