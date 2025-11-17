import React, { useState } from 'react';
import { Trophy, Info, Home, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-game-purple to-game-pink rounded-lg flex items-center justify-center">
              <span className="text-white font-game text-sm">AI</span>
            </div>
            <span className="text-white font-bold text-xl">AIGames</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="nav-link flex items-center space-x-2">
              <Home size={18} />
              <span>Home</span>
            </a>
            <a href="/games" className="nav-link flex items-center space-x-2">
              <Trophy size={18} />
              <span>All Games</span>
            </a>
            <a href="/leaderboard" className="nav-link flex items-center space-x-2">
              <Trophy size={18} />
              <span>Leaderboard</span>
            </a>
            <a href="/about" className="nav-link flex items-center space-x-2">
              <Info size={18} />
              <span>About AI</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white/80 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              <a href="/" className="nav-link flex items-center space-x-2 py-2">
                <Home size={18} />
                <span>Home</span>
              </a>
              <a href="/games" className="nav-link flex items-center space-x-2 py-2">
                <Trophy size={18} />
                <span>All Games</span>
              </a>
              <a href="/leaderboard" className="nav-link flex items-center space-x-2 py-2">
                <Trophy size={18} />
                <span>Leaderboard</span>
              </a>
              <a href="/about" className="nav-link flex items-center space-x-2 py-2">
                <Info size={18} />
                <span>About AI</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;