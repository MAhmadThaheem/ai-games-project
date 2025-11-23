import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMenu from './components/MainMenu';
import FeaturedGames from './components/FeaturedGames';
import Checkers from './components/games/Checkers';
import Chess from './components/games/Chess';
import Connect4 from './components/games/Connect4';
import TicTacToe from './components/games/TicTacToe';
import './App.css';

function App() {
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [backgroundMusic] = useState(typeof Audio !== 'undefined' ? new Audio('/sounds/background-music.mp3') : null);

  useEffect(() => {
    if (!backgroundMusic) return;

    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;

    const handleUserInteraction = () => {
      if (isMusicEnabled) {
        backgroundMusic.play().catch(error => {
          console.log('Background music play failed:', error);
        });
      }
    };

    // Add event listeners for user interaction
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
      backgroundMusic.pause();
    };
  }, [backgroundMusic, isMusicEnabled]);

  const toggleMusic = () => {
    setIsMusicEnabled(!isMusicEnabled);
    if (!isMusicEnabled) {
      backgroundMusic?.play().catch(console.error);
    } else {
      backgroundMusic?.pause();
    }
  };

  return (
    <Router>
      <div className="App">
        {/* Global Music Toggle - You can add this to a settings component */}
        <button 
          onClick={toggleMusic}
          className="fixed top-4 right-4 z-50 p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
          style={{ display: 'none' }} // Hide for now, you can style it later
        >
          {isMusicEnabled ? '🔊' : '🔇'}
        </button>

        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/featured-games" element={<FeaturedGames />} />
          <Route path="/checkers" element={<Checkers />} />
          <Route path="/chess" element={<Chess />} />
          <Route path="/connect4" element={<Connect4 />} />
          <Route path="/tictactoe" element={<TicTacToe />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;