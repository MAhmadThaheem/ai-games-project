import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, Users, Trophy, Trash2, PlusCircle, Star, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:8000/api/auth/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10 bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="bg-red-500/20 p-3 rounded-full">
              <Shield className="text-red-500" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">ADMIN CONSOLE</h1>
              <p className="text-gray-400 text-sm">System Overview & User Management</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-400 text-xs uppercase font-bold mb-1">Total Users</h3>
                <p className="text-4xl font-bold text-white">{users.length}</p>
              </div>
              <Users className="text-blue-500 opacity-50" size={24} />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-400 text-xs uppercase font-bold mb-1">Active Games</h3>
                <p className="text-4xl font-bold text-green-400">5</p>
              </div>
              <Trophy className="text-green-500 opacity-50" size={24} />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-400 text-xs uppercase font-bold mb-1">System Status</h3>
                <p className="text-4xl font-bold text-cyan-400">ONLINE</p>
              </div>
              <Shield className="text-cyan-500 opacity-50" size={24} />
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-8 shadow-2xl">
          <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/80">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-blue-400"/> Registered Users
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-gray-900/50 text-xs uppercase text-gray-500 font-bold">
                <tr>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-6 py-4">Stars</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                        {user.username[0].toUpperCase()}
                      </div>
                      {user.username}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${
                        user.role === 'admin' 
                        ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-yellow-400 font-bold">{user.points}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-purple-300">
                        <Star size={14} className="fill-purple-300" /> {user.stars}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;