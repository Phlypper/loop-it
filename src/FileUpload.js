import React from 'react';

const FileUpload = ({ handleFileUpload }) => {
  return (
    <div>
      <label htmlFor="file-upload">Upload .mp3 File: </label>
      <input
        id="file-upload"
        type="file"
        accept=".mp3,audio/mpeg"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default FileUpload;
