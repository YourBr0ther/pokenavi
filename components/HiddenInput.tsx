"use client";

import React, { useRef, useEffect } from 'react';

const HiddenInput = ({ onInputComplete }: { onInputComplete: (data: string) => void }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // Automatically focus on the input to trigger the keyboard
    }
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (inputValue.trim()) {
      onInputComplete(inputValue);
      inputRef.current!.value = ""; // Clear the input after capturing the data
    }
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus(); // Refocus the input if needed
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      onChange={handleInput}
      onBlur={focusInput} // Refocus if input loses focus
      style={{
        position: 'absolute',
        opacity: 0,
        height: 0,
        width: 0,
        border: 'none',
        outline: 'none',
        background: 'transparent',
      }}
    />
  );
};

export default HiddenInput;
