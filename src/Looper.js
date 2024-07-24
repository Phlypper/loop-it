import React, { useState, useRef, useEffect } from 'react';
import { useButton } from '@react-aria/button';
import { useVisuallyHidden } from '@react-aria/visually-hidden';

import AudioDeviceSelect from './AudioDeviceSelect';
import RecordButton from './RecordButton';
import FileUpload from './FileUpload';
import LoopList from './LoopList';
import Metronome from './Metronome';

const Looper = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [loops, setLoops] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [bpm, setBpm] = useState(120);
  const [isPlayingMetronome, setIsPlayingMetronome] = useState(false);
  const audioContextRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    const getAudioDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
        setAudioDevices(audioInputDevices);
        if (audioInputDevices.length > 0) {
          setSelectedDeviceId(audioInputDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error enumerating devices:', error);
      }
    };

    getAudioDevices();
  }, []);

  const handleAudioProcess = (e) => {
    const inputBuffer = e.inputBuffer;
    const outputBuffer = e.outputBuffer;

    const numberOfChannels = inputBuffer.numberOfChannels;

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const inputData = inputBuffer.getChannelData(channel);
      const outputData = outputBuffer.getChannelData(channel);

      for (let sample = 0; sample < inputBuffer.length; sample++) {
        outputData[sample] = inputData[sample];
      }
    }
  };

  const startRecording = async () => {
    setIsRecording(true);

    const constraints = {
      audio: {
        deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = handleAudioProcess;
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/ogg; codecs=opus' });
        const audioURL = window.URL.createObjectURL(blob);
        setLoops([...loops, audioURL]);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start();
    } catch (error) {
      console.error('Error accessing microphone or USB interface:', error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current.stop();

    mediaStreamRef.current.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'audio/mpeg') {
      const audioURL = URL.createObjectURL(file);
      setLoops([...loops, audioURL]);
    } else {
      alert('Please upload a valid .mp3 file.');
    }
  };

  return (
    <div>
      <h1>Loop It!</h1>
      <AudioDeviceSelect
        audioDevices={audioDevices}
        selectedDeviceId={selectedDeviceId}
        setSelectedDeviceId={setSelectedDeviceId}
      />
      <RecordButton
        isRecording={isRecording}
        setIsRecording={() => {
          if (isRecording) {
            stopRecording();
          } else {
            startRecording();
          }
        }}
      />
      <FileUpload handleFileUpload={handleFileUpload} />
      <LoopList loops={loops} />
      <div>
        <label htmlFor="bpm-input">BPM: </label>
        <input
          id="bpm-input"
          type="number"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          min={1}
        />
        <button onClick={() => setIsPlayingMetronome(!isPlayingMetronome)}>
          {isPlayingMetronome ? 'Stop Metronome' : 'Start Metronome'}
        </button>
      </div>
      {isRecording && isPlayingMetronome && <Metronome bpm={bpm} isRecording={isRecording} />}
    </div>
  );
};

export default Looper;
