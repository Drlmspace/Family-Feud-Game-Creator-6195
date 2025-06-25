import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import GameControls from './GameControls';
import FastMoneyRound from './FastMoneyRound';
import GameComplete from './GameComplete';

function GameShow() {
  const { state } = useGame();

  if (state.questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">No Questions Available</h2>
          <p className="text-white/70 text-lg mb-6">
            Please add some questions in the Admin Panel to start playing!
          </p>
          <motion.a
            href="#/admin"
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-bold text-lg inline-block transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go to Admin Panel
          </motion.a>
        </div>
      </div>
    );
  }

  // Show Fast Money Round
  if (state.gamePhase === 'fast-money' || state.gamePhase === 'fast-money-player2') {
    return <FastMoneyRound />;
  }

  // Show Game Complete
  if (state.gamePhase === 'game-complete') {
    return <GameComplete />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-3">
          <GameBoard />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <ScoreBoard />
          <GameControls />
        </div>
      </div>
    </div>
  );
}

export default GameShow;