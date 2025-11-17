import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Hero from './components/Hero';
import FeaturedGames from './components/FeaturedGames';
import TicTacToe from './components/games/TicTacToe';
import Chess from './components/games/Chess';
import './index.css';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <Hero />
      <FeaturedGames />
      
      {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-md border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/60">
            © 2025 AI Games. Built with React, FastAPI, and cutting-edge AI algorithms.
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tictactoe" element={<TicTacToe />} />
        {/* We'll add more routes later */}
        <Route path="/chess" element={<Chess />} />
      </Routes>
    </Router>
  );
}

export default App;