import React, { useState, useEffect } from 'react';
import { Users, MapPin, Target, Sparkles, Code, GraduationCap, Github, Linkedin, ArrowLeft, Mail, Globe, Heart, Zap, Shield, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Team Images
import imgAhmad from '../assets/creators/muhammadAhmad.png';
import imgAli from '../assets/creators/aliNaqi.png';
import imgSaqib from '../assets/creators/saqibJaved.png';
import imgAamir from '../assets/creators/muhammadAamir.png';

const AboutUs = () => {
  const navigate = useNavigate();
  const [activeUsers, setActiveUsers] = useState(1240);

  // Simulate dynamic user count
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const teamMembers = [
    { 
      name: "Muhammad Aamir", 
      role: "UI/UX Designer", 
      image: imgAamir,
      icon: <Users size={16} className="text-green-400" />,
      bio: "Designing intuitive layouts and visual aesthetics.",
      color: "from-green-500 to-emerald-500",
      github: "https://github.com/Mian-Aamir",
    },
    { 
      name: "Muhammad Ahmad", 
      role: "AI & Backend Lead", 
      image: imgAhmad,
      icon: <Code size={16} className="text-blue-400" />,
      bio: "Architecting intelligent algorithms and robust backend systems.",
      color: "from-purple-500 to-pink-500",
      github: "https://github.com/MAhmadThaheem",
    },
    { 
      name: "Ali Naqi", 
      role: "Frontend Architect", 
      image: imgAli,
      icon: <Sparkles size={16} className="text-purple-400" />,
      bio: "Crafting immersive user experiences and responsive interfaces.",
      color: "from-blue-500 to-cyan-500",
      github: "https://github.com/Ali-x-Naqi",
    },
    { 
      name: "Saqib Javed", 
      role: "Game Logic Developer", 
      image: imgSaqib,
      icon: <Target size={16} className="text-red-400" />,
      bio: "Implementing complex game rules and mechanics.",
      color: "from-red-500 to-orange-500",
      github: "https://github.com/f233069-SaqibJaved",
    },
    
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden font-sans flex flex-col">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
      </div>

      {/* Navbar / Back Button */}
      <div className="container mx-auto px-6 py-8 relative z-20">
        <button 
          onClick={() => navigate('/')} 
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 px-4 py-2 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="font-medium">Back to Home</span>
        </button>
      </div>

      <div className="container mx-auto px-6 pb-20 relative z-10 flex-grow">
        
        {/* Header Section */}
        <div className="text-center mb-24 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-blue-300 tracking-wider uppercase mb-6 shadow-lg shadow-blue-500/10">
            <GraduationCap size={14} /> FAST-NU Chiniot-Faisalabad
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-2xl tracking-tight leading-tight">
            MEET THE CREATORS
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
            We are a team of passionate Software Engineers from <span className="text-white font-semibold">FAST CFD Campus</span>, dedicated to pushing the boundaries of AI in gaming.
          </p>
        </div>

        {/* Vision & Stats Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-24">
          {/* Vision Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-purple-600 group-hover:w-3 transition-all duration-300"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Target className="text-blue-400" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-white">Our Vision</h2>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                To bridge the gap between classic gaming and modern Artificial Intelligence. 
                We aim to create a platform where students and developers can not only play 
                but understand the algorithms behind the intelligence—from Minimax to A* Pathfinding.
              </p>
              <div className="flex gap-4">
                <span className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-400 border border-white/5">Open Source</span>
                <span className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-400 border border-white/5">Educational</span>
              </div>
            </div>
          </div>

          {/* Dynamic Stats */}
          <div className="space-y-6">
            <div className="bg-gray-800/30 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:bg-gray-800/50 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Users className="text-green-400" size={24} />
                </div>
                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">LIVE</span>
              </div>
              <h3 className="text-4xl font-bold text-white mb-1">{activeUsers.toLocaleString()}</h3>
              <p className="text-gray-400 text-sm">Active Players Worldwide</p>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:bg-gray-800/50 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Zap className="text-yellow-400" size={24} />
                </div>
                <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">+24%</span>
              </div>
              <h3 className="text-4xl font-bold text-white mb-1">15k+</h3>
              <p className="text-gray-400 text-sm">Games Played Today</p>
            </div>
          </div>
        </div>

        {/* Team Grid */}
        <h2 className="text-4xl font-bold text-center mb-16 flex items-center justify-center gap-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">The Squad</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          {teamMembers.map((member, index) => (
            <div 
              key={index}
              className="group relative bg-gray-800/40 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] text-center transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:shadow-purple-500/10 overflow-hidden"
            >
              {/* Hover Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Image Container */}
              <div className="relative w-40 h-40 mx-auto mb-8">
                <div className={`absolute inset-0 bg-gradient-to-br ${member.color} rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 scale-125`}></div>
                <div className="relative w-full h-full rounded-full p-1.5 bg-gradient-to-br from-gray-700 to-gray-800 group-hover:from-white/20 group-hover:to-white/5 transition-all duration-500">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover border-4 border-gray-900 shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }} 
                  />
                </div>
                {/* Floating Icon Badge */}
                <div className="absolute -bottom-2 -right-2 bg-gray-900 border-2 border-gray-700 p-2 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  {member.icon}
                </div>
              </div>

              {/* Text Content */}
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all">
                {member.name}
              </h3>
              
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-sm font-medium text-blue-200 mb-4">
                {member.role}
              </div>
              
              <p className="text-gray-400 text-sm mb-8 leading-relaxed px-2">
                {member.bio}
              </p>

              {/* Social Links */}
              <div className="flex justify-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <a href= {member.github} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all transform hover:scale-110 hover:-translate-y-1"><Github size={18} /></a>
                <a href="#" className="p-2.5 rounded-xl bg-white/5 hover:bg-blue-600/20 hover:text-blue-400 transition-all transform hover:scale-110 hover:-translate-y-1"><Linkedin size={18} /></a>
                <a href="#" className="p-2.5 rounded-xl bg-white/5 hover:bg-purple-600/20 hover:text-purple-400 transition-all transform hover:scale-110 hover:-translate-y-1"><Mail size={18} /></a>
              </div>
            </div>
          ))}
        </div>

        {/* Location Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20 bg-gray-800/30 backdrop-blur-sm rounded-[2.5rem] p-10 border border-white/5 hover:border-white/10 transition-colors duration-500 shadow-2xl">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-500/20 rounded-2xl">
                  <MapPin className="text-red-500" size={32} />
                </div>
                Location
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Our Software House is located at the prestigious <strong className="text-white">FAST-NUCES Chiniot-Faisalabad Campus</strong>. 
                This is where we brainstorm, code, and deploy our AI solutions.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 text-sm font-medium text-gray-300 bg-black/40 px-5 py-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <Globe size={18} className="text-blue-400" /> Loonaywala, Punjab
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-green-400 bg-green-900/10 px-5 py-3 rounded-xl border border-green-500/20 animate-pulse-slow">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </div>
                Active Campus
              </div>
            </div>
          </div>
          
          <div className="relative w-full h-80 rounded-3xl overflow-hidden border-4 border-gray-800 shadow-2xl group">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3403.493282928373!2d73.14646237626344!3d31.455527350342936!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3922691062077df5%3A0x6739943486333630!2sFAST%20National%20University%20Chiniot-Faisalabad%20Campus!5e0!3m2!1sen!2s!4v1709400000000!5m2!1sen!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(1.2)' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="FAST CFD Map"
              className="group-hover:scale-110 transition-transform duration-[2s] ease-in-out"
            ></iframe>
            {/* Map Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60 pointer-events-none group-hover:opacity-40 transition-opacity duration-500"></div>
          </div>
        </div>

      </div>

      {/* Enhanced Footer */}
      <footer className="bg-black/60 backdrop-blur-xl border-t border-white/5 py-16 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            
            {/* Brand Column */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-3xl font-black text-white tracking-wider mb-4 flex items-center gap-2">
                AI<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">HUB</span>
              </h3>
              <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-6">
                Empowering the next generation of gamers with AI. Building the bridge between complex algorithms and fun experiences.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300"><Github size={20} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white transition-all duration-300"><Linkedin size={20} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-pink-500 hover:text-white transition-all duration-300"><Heart size={20} /></a>
              </div>
            </div>

            {/* Links Column 1 */}
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Platform</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-blue-400 transition-colors"></span> Play Games</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-blue-400 transition-colors"></span> Leaderboards</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-blue-400 transition-colors"></span> Tournaments</a></li>
              </ul>
            </div>

            {/* Links Column 2 */}
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Support</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">API Status</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © 2025 AI Games Hub. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <Shield size={14} className="text-green-500" /> 
              <span>Secure Connection</span>
              <div className="w-1 h-1 bg-gray-600 rounded-full mx-1"></div>
              <span>v2.4.0</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default AboutUs;