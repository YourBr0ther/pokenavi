"use client";

import React from 'react';

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
    <div>
      <input type="file" accept=".pk3,.sav,.ek3" onChange={handleFileChange} />
    </div>
  );
};

export default FileUpload;
