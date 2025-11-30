import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Contexts
import { AudioProvider } from './context/AudioContext';
import { AuthProvider } from './context/AuthContext';

// Core Components
import MainMenu from './components/MainMenu';
import FeaturedGames from './components/FeaturedGames';
import ProtectedRoute from './components/ProtectedRoute'; // The Security Guard

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

// Games
import Checkers from './components/games/Checkers';
import Chess from './components/games/Chess';
import Connect4 from './components/games/Connect4';
import TicTacToe from './components/games/TicTacToe';
import Battleship from './components/games/Battleship';
import MazeRunner from './components/games/MazeRunner';
import Pacman from './components/games/Pacman';
import AboutUs from './pages/AboutUs';

import './App.css';
import Chatbot from './components/common/Chatbot';

function App() {
  return (
    <AudioProvider>
      <AuthProvider>
        <Router>
          <div className="App bg-gray-900 min-h-screen text-white">
            <Routes>
              {/* --- PUBLIC ROUTES (Anyone can see these) --- */}
              <Route path="/" element={<MainMenu />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<AboutUs />} />

              {/* --- PROTECTED ROUTES (Must be logged in) --- */}
              
              {/* Dashboard */}
              <Route 
                path="/featured-games" 
                element={
                  <ProtectedRoute>
                    <FeaturedGames />
                  </ProtectedRoute>
                } 
              />

              {/* Games - All Protected */}
              <Route path="/checkers" element={<ProtectedRoute><Checkers /></ProtectedRoute>} />
              <Route path="/chess" element={<ProtectedRoute><Chess /></ProtectedRoute>} />
              <Route path="/connect4" element={<ProtectedRoute><Connect4 /></ProtectedRoute>} />
              <Route path="/tictactoe" element={<ProtectedRoute><TicTacToe /></ProtectedRoute>} />
              <Route path="/maze" element={<ProtectedRoute><MazeRunner /></ProtectedRoute>} />
              <Route path="/battleship" element={<ProtectedRoute><Battleship /></ProtectedRoute>} />
              <Route path="/pacman" element={<ProtectedRoute><Pacman /></ProtectedRoute>} />

              {/* --- ADMIN ROUTE (Must be Admin) --- */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

            </Routes>
            {/* --- CHATBOT --- */}
            <Chatbot />
          </div>
        </Router>
      </AuthProvider>
    </AudioProvider>
  );
}

export default App;