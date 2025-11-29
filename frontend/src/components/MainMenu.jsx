import Navbar from './common/Navbar';
import Hero from './Hero';

const MainMenu = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0c] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900 to-black text-white relative">
      
      {/* 1. The Navigation Bar (Search, Links, Music) */}
      <Navbar />

      {/* 2. The Hero Section (Title, Play Button) */}
      <Hero />

      {/* Optional: Simple Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-gray-600 text-xs">
        © 2025 AI Games Hub. All rights reserved.
      </footer>
    </div>
  );
};

export default MainMenu;