import React from "react";
import {
  Play,
  Cpu,
  Brain,
  Network,
  Sparkles,
  Target,
  Crown,
  Circle,
  CheckSquare,
  Volume2,
  VolumeX,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSound } from '../hooks/useSound.js';
import { useAudio } from '../context/AudioContext.jsx';

const FeaturedGames = () => {
  const navigate = useNavigate();
  
  // Use global audio context
  const { isMusicEnabled, toggleMusic } = useAudio();

  // Use custom sound hook for effects
  const [playClick] = useSound('/sounds/click.mp3', { volume: 1 });
  const [playHover] = useSound('/sounds/hover.mp3', { volume: 0.6 });
  const [playSelect] = useSound('/sounds/select.mp3', { volume: 1 });
  const [playGameStart] = useSound('/sounds/game-start.mp3', { volume: 1 });

  const featuredGames = [
    {
      id: 1,
      name: "Maze Solver",
      description: "Watch AI algorithms find the shortest path through complex mazes",
      icon: <Network className="text-game-green" size={32} />,
      color: "from-green-500 to-emerald-600",
      difficulty: "Easy",
      features: ["Pathfinding AI", "Visualization", "Multiple Algorithms"],
      status: "soon"
    },
    {
      id: 2,
      name: "Tic-Tac-Toe AI",
      description: "Challenge our unbeatable Minimax algorithm with perfect gameplay",
      icon: <Cpu className="text-game-purple" size={32} />,
      color: "from-purple-500 to-indigo-600",
      difficulty: "Medium",
      features: ["Minimax Algorithm", "Perfect AI", "Quick Games"],
      route: "/tictactoe",
      status: "live"
    },
    {
      id: 3,
      name: "Sudoku Solver",
      description: "AI that solves Sudoku puzzles instantly with backtracking",
      icon: <Brain className="text-game-orange" size={32} />,
      color: "from-orange-500 to-red-500",
      difficulty: "Hard",
      features: ["Backtracking AI", "Step-by-step", "Puzzle Generator"],
      status: "soon"
    },
    {
      id: 4,
      name: "Chess AI",
      description: "Play against AI with adaptive difficulty levels",
      icon: <Crown className="text-game-purple" size={32} />,
      color: "from-purple-500 to-indigo-600",
      difficulty: "Variable",
      features: ["Stockfish AI", "3 Difficulties", "Move Analysis"],
      route: "/chess",
      status: "live"
    },
    {
      id: 5,
      name: "Connect 4 AI",
      description: "Classic Connect 4 with intelligent AI opponents",
      icon: <Circle className="text-game-blue" size={32} />,
      color: "from-blue-500 to-cyan-600",
      difficulty: "Variable",
      features: ["Alpha-Beta Pruning", "Sound Effects", "Win Animations"],
      route: "/connect4",
      status: "live"
    },
    {
      id: 6,
      name: "Checkers AI",
      description: "Classic checkers with intelligent AI and smooth animations",
      icon: <CheckSquare className="text-game-red" size={32} />,
      color: "from-red-500 to-pink-600",
      difficulty: "Variable",
      features: ["Minimax AI", "Piece Animations", "King Promotion"],
      route: "/checkers",
      status: "live"
    },
  ];

  const handleHover = () => {
    if (isMusicEnabled) playHover();
  };

  const handleGameClick = (game) => {
    if (isMusicEnabled) {
      // playSelect(); // Remove this, it clashes
      playGameStart(); // Keep this, but with better sound
    }
    
    if (game.route) {
      setTimeout(() => {
        navigate(game.route);
      }, 300);
    }
  };

  const handleSoundToggle = () => {
    if (isMusicEnabled) {
      playClick();
    }
    toggleMusic();
  };

  const handleBackClick = () => {
    if (isMusicEnabled) {
      playClick();
    }
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const styles = {
      live: "bg-green-500/20 text-green-300 border-green-500/30",
      soon: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      beta: "bg-blue-500/20 text-blue-300 border-blue-500/30"
    };
    
    const labels = {
      live: "LIVE",
      soon: "COMING SOON",
      beta: "BETA"
    };

    return (
      <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${styles[status]}`}>
        {labels[status]}
      </div>
    );
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      "Easy": "from-green-400 to-green-600",
      "Medium": "from-yellow-400 to-yellow-600",
      "Hard": "from-red-400 to-red-600",
      "Variable": "from-purple-400 to-purple-600"
    };
    return colors[difficulty] || "from-gray-400 to-gray-600";
  };

  return (
    <section className="min-h-screen w-full py-16 bg-gradient-to-b from-indigo-900/30 to-purple-900/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-12">
          <button 
            onClick={handleBackClick}
            onMouseEnter={handleHover}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 group text-white"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Menu</span>
          </button>

          <button
            onClick={handleSoundToggle}
            onMouseEnter={handleHover}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer"
          >
            {isMusicEnabled ? (
              <Volume2 size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            ) : (
              <VolumeX size={20} className="text-gray-400 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-white text-sm">
              {isMusicEnabled ? "Sound On" : "Sound Off"}
            </span>
          </button>
        </div>

        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-4 mb-6">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 font-game bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AI GAMES COLLECTION
            </h2>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping delay-300"></div>
          </div>
          
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Experience the future of gaming with our AI-powered collection. 
            Each game showcases advanced artificial intelligence algorithms with stunning visuals and immersive sound.
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredGames.map((game) => (
            <div 
              key={game.id}
              className="group relative cursor-pointer"
              onMouseEnter={handleHover}
            >
              <div className="game-card-enhanced bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:border-cyan-400/30 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 relative overflow-hidden h-full flex flex-col">
                
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
                
                {/* Status Badge */}
                {getStatusBadge(game.status)}
                
                {/* Difficulty Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getDifficultyColor(game.difficulty)} text-white shadow-lg`}>
                  {game.difficulty}
                </div>

                {/* Game Icon */}
                <div className="relative mb-6 mt-4">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${game.color} flex items-center justify-center mx-auto transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl`}>
                    <div className="text-white transform group-hover:scale-110 transition-transform duration-500">
                      {game.icon}
                    </div>
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-1000 group-hover:animate-pulse"></div>
                </div>

                {/* Game Info */}
                <div className="text-center mb-4 flex-grow">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300">
                    {game.name}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-4 group-hover:text-white/90 transition-colors duration-300">
                    {game.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {game.features.map((feature, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs border border-white/20 group-hover:border-cyan-400/30 group-hover:text-cyan-300 transition-all duration-300"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Play Button */}
                <button
                  onClick={() => handleGameClick(game)}
                  onMouseEnter={handleHover}
                  disabled={!game.route}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform group-hover:scale-105 flex items-center justify-center space-x-3 ${
                    game.route 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-cyan-500/25 cursor-pointer' 
                      : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {game.route ? (
                    <>
                      <Play size={20} className="group-hover:animate-pulse" />
                      <span>PLAY NOW</span>
                      <Sparkles size={16} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} className="animate-pulse" />
                      <span>COMING SOON</span>
                    </>
                  )}
                </button>

                {/* Hover Effects */}
                <div className="absolute inset-0 rounded-3xl border-2 border-cyan-400/0 group-hover:border-cyan-400/20 transition-all duration-500 pointer-events-none"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/0 via-purple-500/0 to-cyan-500/0 rounded-3xl opacity-0 group-hover:opacity-100 blur-md transition-all duration-1000 group-hover:animate-pulse pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <div className="text-center mt-16">
          <div 
            className="inline-flex items-center space-x-4 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/10 transition-colors cursor-default"
            onMouseEnter={handleHover}
          >
            <Target size={20} className="text-cyan-400 animate-bounce" />
            <span className="text-white/80 text-sm">
              More AI-powered games in development...
            </span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedGames;