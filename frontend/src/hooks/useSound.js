import { useCallback } from 'react';
import { playSynthSound } from '../utils/SoundGenerator';

export const useSound = (soundPath, options = {}) => {
  const { volume = 1 } = options;

  // Helper to map fake file paths/names to synthesizer types
  const getSoundType = (path) => {
    // Global
    if (path.includes('hover')) return 'hover';
    if (path.includes('click')) return 'click';
    if (path.includes('select')) return 'select';
    if (path.includes('game-start')) return 'game-start';
    if (path.includes('back')) return 'back';
    if (path.includes('win')) return 'win';
    if (path.includes('lose')) return 'lose';

    // Chess
    if (path.includes('chess-move')) return 'chess-move';
    if (path.includes('chess-capture')) return 'chess-capture';
    if (path.includes('chess-check')) return 'chess-check';

    // Checkers
    if (path.includes('checkers-move')) return 'checkers-move';
    if (path.includes('checkers-king')) return 'checkers-king';

    // Connect 4
    if (path.includes('connect4-drop')) return 'connect4-drop';

    // Tic Tac Toe
    if (path.includes('ttt-mark')) return 'ttt-mark';

    return 'hover'; // Default fallback
  };

  const soundType = getSoundType(soundPath);

  const play = useCallback(() => {
    try {
      playSynthSound(soundType, volume);
    } catch (error) {
      console.error("Error generating sound:", error);
    }
  }, [soundType, volume]);

  return [play];
};