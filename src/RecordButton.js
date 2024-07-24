import React from 'react';

const RecordButton = ({ isRecording, setIsRecording, buttonProps }) => {
  return (
    <button {...buttonProps} style={{ padding: '1em', fontSize: '1.5em' }}>
      {isRecording ? 'Stop' : 'Record'}
    </button>
  );
};

export default RecordButton;
