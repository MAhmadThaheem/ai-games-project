import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMenu from './components/MainMenu';
import FeaturedGames from './components/FeaturedGames';
import Checkers from './components/games/Checkers';
import Chess from './components/games/Chess';
import Connect4 from './components/games/Connect4';
import TicTacToe from './components/games/TicTacToe';
import { AudioProvider } from './context/AudioContext'; // Import the provider
import './App.css';
import Battleship from './components/games/Battleship';
import MazeRunner from './components/games/MazeRunner';

function App() {
  // REMOVED: All local audio state and useEffects from here

  return (
    <AudioProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/featured-games" element={<FeaturedGames />} />
            <Route path="/checkers" element={<Checkers />} />
            <Route path="/chess" element={<Chess />} />
            <Route path="/connect4" element={<Connect4 />} />
            <Route path="/tictactoe" element={<TicTacToe />} />
            <Route path="/maze" element={<MazeRunner />} />
            <Route path="/battleship" element={<Battleship />} />      
          </Routes>
        </div>
      </Router>
    </AudioProvider>
  );
}

export default App;