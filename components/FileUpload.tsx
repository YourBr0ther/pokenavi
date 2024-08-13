"use client";

import React from 'react';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className={styles.fileUploadContainer}>
      <label className={styles.uploadLabel} htmlFor="file-upload">
        Choose a File
      </label>
      <input
        id="file-upload"
        className={styles.uploadInput}
        type="file"
        accept=".pk3,.sav,.ek3"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default FileUpload;
