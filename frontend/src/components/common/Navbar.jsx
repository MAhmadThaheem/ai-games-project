import { useState } from 'react';
import { Search, Volume2, VolumeX, Info, Gamepad2, User, Grid, X, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../../context/AudioContext';
import { useAuth } from '../../context/AuthContext'; // Import Auth Context

const GAMES_DATABASE = [
  { id: 1, name: "Chess AI", route: "/chess", category: "Strategy" },
  { id: 2, name: "Checkers Pro", route: "/checkers", category: "Board" },
  { id: 3, name: "Connect 4", route: "/connect4", category: "Casual" },
  { id: 4, name: "Tic-Tac-Toe", route: "/tictactoe", category: "Classic" },
  { id: 5, name: "Maze Runner", route: "/maze", category: "Puzzle" },
  { id: 6, name: "Battleship", route: "/battleship", category: "Strategy" },
  { id: 7, name: "Pacman AI", route: "/pacman", category: "Arcade" },
];

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  
  // Get Contexts
  const { isMusicEnabled, toggleMusic } = useAudio();
  const { user, logout } = useAuth(); // <--- Get User State

  // Filter games based on search
  const filteredGames = GAMES_DATABASE.filter(game => 
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setShowResults(e.target.value.length > 0);
  };

  const handleGameSelect = (route) => {
    navigate(route);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/'); // Go back to home after logout
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-white/10 shadow-lg transition-all duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-6">
        
        {/* Logo Section */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300 transform group-hover:scale-105">
            <Gamepad2 className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-white tracking-wider hidden sm:block font-game">
            AI<span className="text-cyan-400">HUB</span>
          </span>
        </div>

        {/* Search Bar Section */}
        <div className="flex-1 max-w-xl relative hidden md:block">
          <div className="relative group">
            <input 
              type="text"
              placeholder="Search games (e.g. 'Chess')..."
              value={searchTerm}
              onChange={handleSearch}
              onFocus={() => searchTerm && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)} 
              className="w-full bg-gray-800/50 text-white pl-12 pr-10 py-3 rounded-full border border-gray-700/50 focus:border-cyan-500/50 focus:bg-gray-800 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all text-sm placeholder-gray-500"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-cyan-400 transition-colors duration-300" size={18} />
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); setShowResults(false); }} className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {filteredGames.length > 0 ? (
                <ul className="max-h-64 overflow-y-auto">
                  {filteredGames.map(game => (
                    <li 
                      key={game.id}
                      onClick={() => handleGameSelect(game.route)}
                      className="px-5 py-3 hover:bg-white/5 cursor-pointer flex items-center justify-between group transition-colors border-b border-gray-700/50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-cyan-400">
                          <Gamepad2 size={16} />
                        </div>
                        <span className="text-gray-200 font-medium group-hover:text-white transition-colors">{game.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider border border-gray-600 px-2 py-0.5 rounded-md">
                        {game.category}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-gray-400 flex flex-col items-center gap-2">
                  <span className="text-sm">No games found</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          <button onClick={() => navigate('/featured-games')} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm font-bold px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10">
            <Grid size={18} />
            <span className="hidden sm:inline">Games</span>
          </button>

          <button onClick={() => navigate('/about')} className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full" title="About Us">
            <Info size={20} />
          </button>

          <button onClick={toggleMusic} className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full" title="Music">
            {isMusicEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          {/* --- AUTHENTICATION LOGIC --- */}
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              {/* Show Admin Button if User is Admin */}
              {user.role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="hidden md:flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-bold border border-red-500/20 transition-all"
                >
                  <Shield size={14} /> Admin
                </button>
              )}

              {/* User Profile / Logout */}
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <span className="text-sm font-bold text-cyan-400 hidden lg:block">
                  {user.username}
                </span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-red-600/80 text-white font-bold rounded-lg text-sm transition-all shadow-lg hover:shadow-red-500/20 group"
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          ) : (
            /* Show Login if NO User */
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 ml-2 transform hover:-translate-y-0.5"
            >
              <User size={18} />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;