import React from 'react';
import { Play, Star, Users, Zap } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative py-20 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-indigo-900/50">
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-game">
          AI GAMES
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
          Experience the future of gaming with Artificial Intelligence. 
          Challenge smart algorithms and test your skills!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2">
            <Play size={20} />
            <span>Play Now</span>
          </button>
          <button className="btn-secondary text-lg px-8 py-4">
            Explore Games
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Zap className="text-game-yellow" size={32} />
            </div>
            <div className="text-2xl font-bold text-white">7+</div>
            <div className="text-white/70">AI Games</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Star className="text-game-orange" size={32} />
            </div>
            <div className="text-2xl font-bold text-white">5</div>
            <div className="text-white/70">Algorithms</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Users className="text-game-green" size={32} />
            </div>
            <div className="text-2xl font-bold text-white">100%</div>
            <div className="text-white/70">Free to Play</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Play className="text-game-blue" size={32} />
            </div>
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-white/70">Available</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;