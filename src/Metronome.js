import React, { useState, useEffect } from 'react';

const Metronome = ({ bpm, isRecording }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [click, setClick] = useState(null);

  useEffect(() => {
    if (isPlaying && isRecording) {
      const tick = (click) => {
        const oscillator = audioContext.createOscillator();
        oscillator.connect(audioContext.destination);
        oscillator.frequency.value = 880;
        oscillator.start(audioContext.currentTime);

        const gain = audioContext.createGain();
        gain.connect(audioContext.destination);
        gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

        oscillator.stop(audioContext.currentTime + 0.3);

        setClick(click === 'tick' ? 'tock' : 'tick');
      };

      const interval = (60 / bpm) * 1000;
      const timer = setInterval(() => tick(click), interval);

      return () => {
        clearInterval(timer);
      };
    } else {
      setClick(null);
    }
  }, [bpm, isPlaying, isRecording, audioContext]);

  useEffect(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(audioContext);

    return () => {
      audioContext.close();
    };
  }, []);

  return null;
};

export default Metronome;
