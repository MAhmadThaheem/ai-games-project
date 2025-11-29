import { Play, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Placeholder images - Replace these imports with your actual assets
import chessImg from '../assets/images/chess.png';
import ticTacToeImg from '../assets/images/tictactoe.png';
import checkersImg from '../assets/images/checkers.png';

const Hero = () => {
  const navigate = useNavigate();

  const spotlightGames = [
    {
      id: 1,
      name: "Chess AI",
      category: "Strategy",
      description: "Challenge Stockfish-level intelligence.",
      color: "from-purple-600 to-indigo-600",
      image: chessImg, // Uncomment when you have images
      fallbackIcon: "♔",
      route: "/chess"
    },
    {
      id: 2,
      name: "Checkers",
      category: "Classic",
      description: "Strategic gameplay with Minimax AI.",
      color: "from-red-500 to-rose-600",
      image: checkersImg,
      fallbackIcon: "◎",
      route: "/checkers"
    },
    {
      id: 3,
      name: "TicTacToe",
      category: "Arcade",
      description: "Survive against A* pathfinding ghosts.",
      color: "from-yellow-500 to-orange-500",
      image: ticTacToeImg,
      fallbackIcon: "x",
      route: "/tictactoe"
    },
    
  ];

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        
        {/* Main Title Area */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up">
            <Sparkles size={16} className="text-yellow-400" />
            <span className="text-sm font-medium text-blue-200">The Ultimate AI Gaming Collection</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight leading-tight drop-shadow-2xl">
            CHALLENGE THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              INTELLIGENCE
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Compete against advanced algorithms. Can you outsmart the machine?
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <button 
              onClick={() => navigate('/featured-games')}
              className="group relative px-8 py-4 bg-white text-black font-black text-lg rounded-full hover:scale-105 transition-transform duration-200 shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-3"
            >
              <Play size={24} className="fill-black" />
              BROWSE ALL GAMES
            </button>
            
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white/5 text-white font-bold text-lg rounded-full hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all flex items-center gap-3"
            >
              <Trophy size={24} className="text-yellow-400" />
              Leaderboards
            </button>
          </div>
        </div>

        {/* Spotlight Games Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {spotlightGames.map((game) => (
            <div 
              key={game.id}
              onClick={() => navigate(game.route)} // Takes user to full list
              className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-white/30 transition-all duration-500"
            >
              {/* Background Gradient / Image */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
              
              {/* If you have images, uncomment below and use game.image */}
              <img src={game.image} alt={game.name} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" />
              
              {/* Fallback Visual (Big Icon/Text) if no image */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <span className="text-9xl font-black text-white">{game.fallbackIcon}</span>
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">{game.category}</div>
                  <h3 className="text-3xl font-bold text-white mb-2">{game.name}</h3>
                  <p className="text-gray-300 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    {game.description}
                  </p>
                  <div className="flex items-center gap-2 text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                    Play Now <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Hero;