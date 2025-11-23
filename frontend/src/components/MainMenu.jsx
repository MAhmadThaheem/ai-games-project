import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Settings, Info, Volume2, VolumeX, Sparkles, Cpu, Brain, Crown } from 'lucide-react';

const MainMenu = () => {
  const navigate = useNavigate();
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const backgroundMusicRef = useRef(null);

  // Initialize background music
  useEffect(() => {
    backgroundMusicRef.current = new Audio('/sounds/background-music.mp3');
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = 0.3;

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
    };
  }, []);

  // Handle music state changes
  useEffect(() => {
    if (!backgroundMusicRef.current) return;

    if (isMusicEnabled) {
      // Wait for user interaction before playing
      const handleFirstInteraction = () => {
        backgroundMusicRef.current.play().catch(error => {
          console.log('Background music play failed:', error);
        });
        
        // Remove event listeners after first interaction
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      };

      document.addEventListener('click', handleFirstInteraction, { once: true });
      document.addEventListener('keydown', handleFirstInteraction, { once: true });
    } else {
      backgroundMusicRef.current.pause();
    }
  }, [isMusicEnabled]);

  const handleMusicToggle = () => {
    setIsMusicEnabled(!isMusicEnabled);
  };

  const handlePlayClick = () => {
    navigate('/featured-games');
  };

  const handleAboutClick = () => {
    // Show credits modal or navigate to about page
    alert('AI Games Hub\n\nCreated by:\n• Ali Naqi\n• Muhammad Ahmad\n• Saqib Javed\n\nPowered by Advanced AI Algorithms');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
            <h1 className="text-6xl md:text-8xl font-bold text-white font-game bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-glow">
              AI GAMES HUB
            </h1>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-ping delay-300"></div>
          </div>
          
          <p className="text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-8">
            Your Gateway to Intelligent Gaming Experiences
          </p>

          <div className="flex justify-center space-x-4 mb-8">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Cpu size={20} className="text-cyan-400" />
              <span className="text-white text-sm">Smart AI</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Brain size={20} className="text-purple-400" />
              <span className="text-white text-sm">Machine Learning</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Crown size={20} className="text-yellow-400" />
              <span className="text-white text-sm">Multiple Games</span>
            </div>
          </div>

          {/* Credits */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-cyan-400 mb-3">Created by Team:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-white/80">
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="font-semibold text-cyan-300">Ali Naqi</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="font-semibold text-purple-300">Muhammad Ahmad</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="font-semibold text-green-300">Saqib Javed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Menu Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full mb-16">
          {/* Play Button */}
          <button
            onClick={handlePlayClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white p-8 rounded-3xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 border-2 border-cyan-400/30"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <Play size={40} className="text-white group-hover:animate-pulse" />
              </div>
              <h3 className="text-3xl font-bold">PLAY</h3>
              <p className="text-white/80 text-center">Browse our collection of AI-powered games</p>
            </div>

            <Sparkles 
              size={24} 
              className="absolute top-4 right-4 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
            />
          </button>

          {/* Sound Button */}
          <button
            onClick={handleMusicToggle}
            className="group relative bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white p-8 rounded-3xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 border-2 border-purple-400/30"
          >
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                {isMusicEnabled ? (
                  <Volume2 size={40} className="text-white" />
                ) : (
                  <VolumeX size={40} className="text-white" />
                )}
              </div>
              <h3 className="text-3xl font-bold">
                {isMusicEnabled ? 'SOUND ON' : 'SOUND OFF'}
              </h3>
              <p className="text-white/80 text-center">
                {isMusicEnabled ? 'Background music enabled' : 'Background music disabled'}
              </p>
            </div>

            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
              isMusicEnabled ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`}></div>
          </button>

          {/* About Button */}
          <button 
            onClick={handleAboutClick}
            className="group relative bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-8 rounded-3xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 border-2 border-green-400/30"
          >
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <Info size={40} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold">CREDITS</h3>
              <p className="text-white/80 text-center">Meet the development team</p>
            </div>

            <Sparkles 
              size={24} 
              className="absolute top-4 right-4 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
            />
          </button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-300"></div>
            </div>
            <span className="text-white/80 text-sm">
              Powered by Advanced Artificial Intelligence
            </span>
            <Sparkles size={16} className="text-cyan-400 animate-pulse" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px rgba(34, 211, 238, 0.5); }
          50% { text-shadow: 0 0 30px rgba(34, 211, 238, 0.8), 0 0 40px rgba(34, 211, 238, 0.6); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MainMenu;