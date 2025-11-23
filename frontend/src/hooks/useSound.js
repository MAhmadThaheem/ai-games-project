import { useRef, useCallback } from 'react';

export const useSound = (soundPath, options = {}) => {
  const audioRef = useRef(null);
  const { volume = 1 } = options;

  const play = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(soundPath);
        audioRef.current.volume = volume;
      }
      
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        // Ignore autoplay errors
        console.log('Audio play failed:', error);
      });
    } catch (error) {
      console.log('Sound error:', error);
    }
  }, [soundPath, volume]);

  return [play];
};