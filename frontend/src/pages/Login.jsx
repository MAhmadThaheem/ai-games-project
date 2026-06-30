import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, UserCheck } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/'); // Redirect to home
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Welcome Back</h2>
        
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-gray-400 text-sm font-bold block mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-500" size={20} />
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-cyan-500"
                placeholder="Enter username"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="text-gray-400 text-sm font-bold block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-cyan-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-900/20">
            Login
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-800 px-3 text-gray-500">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { loginAsGuest(); navigate('/featured-games'); }}
          className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-all border border-gray-600"
        >
          <UserCheck size={20} />
          Play as Guest
        </button>

        <p className="text-gray-400 text-center mt-6 text-sm">
          Don't have an account? <Link to="/register" className="text-cyan-400 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;