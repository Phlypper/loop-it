import React from 'react';

const AudioDeviceSelect = ({ audioDevices, selectedDeviceId, setSelectedDeviceId }) => {
  return (
    <div>
      <label htmlFor="audio-device-select">Select Audio Device: </label>
      <select
        id="audio-device-select"
        value={selectedDeviceId}
        onChange={(e) => setSelectedDeviceId(e.target.value)}
      >
        {audioDevices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Device ${device.deviceId}`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AudioDeviceSelect;
