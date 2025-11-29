import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail, ArrowLeft } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, password, email);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 relative">
      <button onClick={() => navigate('/')} className="absolute top-6 left-6 text-white/50 hover:text-white flex items-center gap-2">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-700/50">
        <h2 className="text-4xl font-black text-white text-center mb-2">Create Account</h2>
        <p className="text-gray-400 text-center mb-8">Join the AI Games leaderboards</p>
        
        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-gray-300 text-xs font-bold uppercase tracking-wider block mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-500" size={20} />
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-900/80 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-purple-500 transition-all"
                placeholder="Choose a username"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-xs font-bold uppercase tracking-wider block mb-2">Email (Optional)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900/80 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-purple-500 transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="text-gray-300 text-xs font-bold uppercase tracking-wider block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900/80 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-purple-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-900/20">
            Create Account
          </button>
        </form>

        <p className="text-gray-400 text-center mt-8 text-sm">
          Already have an account? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-bold ml-1">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;