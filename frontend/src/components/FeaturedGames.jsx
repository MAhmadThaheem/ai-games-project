import React from 'react';
import { Play, Cpu, Brain, Network, Sparkles, Target, Users, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeaturedGames = () => {
  const navigate = useNavigate();
  const featuredGames = [
    {
      id: 1,
      name: "Maze Solver",
      description: "Watch AI algorithms find the shortest path through complex mazes",
      icon: <Network className="text-game-green" size={32} />,
      color: "from-green-500 to-emerald-600",
      players: "1.2K",
      difficulty: "Easy"
    },
    {
      id: 2,
      name: "Tic-Tac-Toe AI",
      description: "Challenge our unbeatable Minimax algorithm",
      icon: <Cpu className="text-game-purple" size={32} />,
      color: "from-purple-500 to-indigo-600",
      players: "2.5K",
      difficulty: "Medium",
      route: "/tictactoe"
    },
    {
      id: 3,
      name: "Sudoku Solver",
      description: "AI that solves Sudoku puzzles in milliseconds",
      icon: <Brain className="text-game-orange" size={32} />,
      color: "from-orange-500 to-red-500",
      players: "1.8K",
      difficulty: "Hard"
    },
    {
      id: 4,
      name: "Chess AI",
      description: "Play against our advanced chess engine",
      icon: <Target className="text-game-blue" size={32} />,
      color: "from-blue-500 to-cyan-600",
      players: "3.1K",
      difficulty: "Expert"
    },
    {
      id: 5,
      name: "Chess AI",
      description: "Play against AI with three difficulty levels",
      icon: <Crown className="text-game-purple" size={32} />,
      color: "from-purple-500 to-indigo-600",
      players: "4.2K",
      difficulty: "Variable",
      route: "/chess"
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-indigo-900/30 to-purple-900/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-game">
            FEATURED GAMES
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Discover our collection of AI-powered games. Each game showcases different artificial intelligence algorithms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredGames.map((game) => (
            <div key={game.id} className="game-card group">
              <div className={`w-full h-32 rounded-lg bg-gradient-to-r ${game.color} mb-4 flex items-center justify-center relative overflow-hidden`}>
                {game.icon}
                <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
                  <span className="text-white text-sm font-medium">{game.difficulty}</span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
              <p className="text-white/70 mb-4 text-sm leading-relaxed">
                {game.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1 text-white/60">
                  <Users size={16} />
                  <span className="text-sm">{game.players} playing</span>
                </div>
              </div>
              
              <button className="w-full btn-secondary flex items-center justify-center space-x-2 py-2"
              onClick={() => navigate(game.route)}
    >
                <Play size={18} />
                <span>Play Now</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedGames;