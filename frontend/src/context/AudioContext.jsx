import React, { createContext, useState, useEffect, useContext, useRef } from 'react';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize audio only once
    audioRef.current = new Audio('/sounds/background-music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isMusicEnabled) {
      // Attempt to play (browser may block auto-play until interaction)
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Auto-play was prevented. This is normal until user interacts.
          console.log('Audio play blocked until user interaction');
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isMusicEnabled]);

  const toggleMusic = () => {
    setIsMusicEnabled(prev => !prev);
  };

  return (
    <AudioContext.Provider value={{ isMusicEnabled, toggleMusic }}>
      {children}
    </AudioContext.Provider>
  );
};