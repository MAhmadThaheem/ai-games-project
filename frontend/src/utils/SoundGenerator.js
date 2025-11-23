const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export const playSynthSound = (type, volume = 0.5) => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;

  // Helper for noise buffer (used for shakers/slides)
  const createNoiseBuffer = () => {
    const bufferSize = audioCtx.sampleRate * 2; // 2 seconds
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  switch (type) {
    // --- GLOBAL UI SOUNDS ---
    case 'hover':
      const hoverOsc = audioCtx.createOscillator();
      const hoverGain = audioCtx.createGain();
      hoverOsc.connect(hoverGain);
      hoverGain.connect(audioCtx.destination);
      hoverOsc.type = 'sine';
      hoverOsc.frequency.setValueAtTime(300, now);
      hoverOsc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      hoverGain.gain.setValueAtTime(volume * 0.1, now); // Very quiet for hover
      hoverGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      hoverOsc.start(now);
      hoverOsc.stop(now + 0.05);
      break;

    case 'click':
      const clickOsc = audioCtx.createOscillator();
      const clickGain = audioCtx.createGain();
      clickOsc.connect(clickGain);
      clickGain.connect(audioCtx.destination);
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(600, now);
      clickGain.gain.setValueAtTime(volume * 0.2, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      clickOsc.start(now);
      clickOsc.stop(now + 0.05);
      break;

    case 'select':
      const selOsc = audioCtx.createOscillator();
      const selGain = audioCtx.createGain();
      selOsc.connect(selGain);
      selGain.connect(audioCtx.destination);
      selOsc.type = 'sine';
      selOsc.frequency.setValueAtTime(500, now);
      selOsc.frequency.linearRampToValueAtTime(800, now + 0.1);
      selGain.gain.setValueAtTime(volume * 0.2, now);
      selGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      selOsc.start(now);
      selOsc.stop(now + 0.3);
      break;

    case 'back':
      const backOsc = audioCtx.createOscillator();
      const backGain = audioCtx.createGain();
      backOsc.connect(backGain);
      backGain.connect(audioCtx.destination);
      backOsc.type = 'sine';
      backOsc.frequency.setValueAtTime(400, now);
      backOsc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
      backGain.gain.setValueAtTime(volume * 0.2, now);
      backGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      backOsc.start(now);
      backOsc.stop(now + 0.2);
      break;

    case 'game-start':
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gn = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gn);
        gn.connect(audioCtx.destination);
        const start = now + (i * 0.04);
        gn.gain.setValueAtTime(0, start);
        gn.gain.linearRampToValueAtTime(volume * 0.15, start + 0.05);
        gn.gain.exponentialRampToValueAtTime(0.001, start + 0.8);
        osc.start(start);
        osc.stop(start + 0.8);
      });
      break;

    // --- CHESS SOUNDS (Wooden, Thocky) ---
    case 'chess-move':
      const chessOsc = audioCtx.createOscillator();
      const chessGain = audioCtx.createGain();
      chessOsc.connect(chessGain);
      chessGain.connect(audioCtx.destination);
      chessOsc.type = 'square'; 
      chessOsc.frequency.setValueAtTime(80, now);
      chessOsc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      chessGain.gain.setValueAtTime(volume * 0.4, now);
      chessGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      chessOsc.start(now);
      chessOsc.stop(now + 0.1);
      break;

    case 'chess-capture':
      const snapOsc = audioCtx.createOscillator();
      const snapGain = audioCtx.createGain();
      snapOsc.connect(snapGain);
      snapGain.connect(audioCtx.destination);
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(1500, now);
      snapOsc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
      snapGain.gain.setValueAtTime(volume * 0.3, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      snapOsc.start(now);
      snapOsc.stop(now + 0.15);
      break;

    case 'chess-check':
      const checkOsc = audioCtx.createOscillator();
      const checkGain = audioCtx.createGain();
      checkOsc.connect(checkGain);
      checkGain.connect(audioCtx.destination);
      checkOsc.type = 'sawtooth';
      checkOsc.frequency.setValueAtTime(440, now);
      checkOsc.frequency.linearRampToValueAtTime(880, now + 0.3);
      checkGain.gain.setValueAtTime(volume * 0.2, now);
      checkGain.gain.linearRampToValueAtTime(0, now + 0.3);
      checkOsc.start(now);
      checkOsc.stop(now + 0.3);
      break;

    // --- CHECKERS SOUNDS (Lighter, Sliding) ---
    case 'checkers-move':
      const noise = audioCtx.createBufferSource();
      noise.buffer = createNoiseBuffer();
      const noiseGain = audioCtx.createGain();
      const noiseFilter = audioCtx.createBiquadFilter();
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(800, now);
      noiseFilter.frequency.linearRampToValueAtTime(200, now + 0.15);
      noiseGain.gain.setValueAtTime(volume * 0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      noise.start(now);
      noise.stop(now + 0.15);
      break;

    case 'checkers-king':
      const kingOsc = audioCtx.createOscillator();
      const kingGain = audioCtx.createGain();
      kingOsc.connect(kingGain);
      kingGain.connect(audioCtx.destination);
      kingOsc.type = 'sine';
      kingOsc.frequency.setValueAtTime(880, now);
      kingOsc.frequency.linearRampToValueAtTime(1760, now + 0.2);
      kingGain.gain.setValueAtTime(volume * 0.2, now);
      kingGain.gain.linearRampToValueAtTime(0, now + 0.4);
      kingOsc.start(now);
      kingOsc.stop(now + 0.4);
      break;

    // --- CONNECT 4 SOUNDS (Plastic, Dropping) ---
    case 'connect4-drop':
      const dropOsc = audioCtx.createOscillator();
      const dropGain = audioCtx.createGain();
      dropOsc.connect(dropGain);
      dropGain.connect(audioCtx.destination);
      dropOsc.type = 'triangle';
      dropOsc.frequency.setValueAtTime(600, now);
      dropOsc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
      dropGain.gain.setValueAtTime(volume * 0.3, now);
      dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      dropOsc.start(now);
      dropOsc.stop(now + 0.2);
      // Add a "thud" at the end
      setTimeout(() => {
        const thudOsc = audioCtx.createOscillator();
        const thudGain = audioCtx.createGain();
        thudOsc.connect(thudGain);
        thudGain.connect(audioCtx.destination);
        thudOsc.frequency.setValueAtTime(100, audioCtx.currentTime);
        thudGain.gain.setValueAtTime(volume * 0.4, audioCtx.currentTime);
        thudGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        thudOsc.start(audioCtx.currentTime);
        thudOsc.stop(audioCtx.currentTime + 0.1);
      }, 150);
      break;

    // --- TIC TAC TOE SOUNDS (Sketchy, Pencil) ---
    case 'ttt-mark':
      const scratch = audioCtx.createBufferSource();
      scratch.buffer = createNoiseBuffer();
      const scratchGain = audioCtx.createGain();
      const scratchFilter = audioCtx.createBiquadFilter();
      scratch.connect(scratchFilter);
      scratchFilter.connect(scratchGain);
      scratchGain.connect(audioCtx.destination);
      scratchFilter.type = 'bandpass';
      scratchFilter.frequency.setValueAtTime(2000, now);
      scratchGain.gain.setValueAtTime(volume * 0.2, now);
      scratchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      scratch.start(now);
      scratch.stop(now + 0.1);
      break;

    case 'win':
      const winNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; 
      winNotes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gn = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        osc.connect(gn);
        gn.connect(audioCtx.destination);
        const start = now + (i * 0.1);
        gn.gain.setValueAtTime(0, start);
        gn.gain.linearRampToValueAtTime(volume * 0.2, start + 0.05);
        gn.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
        osc.start(start);
        osc.stop(start + 0.5);
      });
      break;

    case 'lose':
      const loseNotes = [392.00, 369.99, 349.23, 329.63]; 
      loseNotes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gn = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        osc.connect(gn);
        gn.connect(audioCtx.destination);
        const start = now + (i * 0.2);
        gn.gain.setValueAtTime(0, start);
        gn.gain.linearRampToValueAtTime(volume * 0.15, start + 0.05);
        gn.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
        osc.start(start);
        osc.stop(start + 0.4);
      });
      break;

    default:
      break;
  }
};