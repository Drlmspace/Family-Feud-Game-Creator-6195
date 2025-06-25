import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanelContainer from './components/AdminPanelContainer';
import GameShow from './components/GameShow';
import Navigation from './components/Navigation';
import { GameProvider } from './context/GameContext';
import './App.css';

function App() {
  return (
    <GameProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-red-900">
          <Navigation />
          <Routes>
            <Route path="/" element={<Navigate to="/game" replace />} />
            <Route path="/admin" element={<AdminPanelContainer />} />
            <Route path="/game" element={<GameShow />} />
          </Routes>
        </div>
      </Router>
    </GameProvider>
  );
}

export default App;