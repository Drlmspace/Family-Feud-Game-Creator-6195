import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiStar } = FiIcons;

function ScoreBoard() {
  const { state } = useGame();

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="flex items-center space-x-2 mb-6">
        <SafeIcon icon={FiStar} className="text-yellow-400 text-xl" />
        <h3 className="text-xl font-bold text-white">Scoreboard</h3>
      </div>

      <div className="space-y-4">
        {/* Team A */}
        <motion.div
          className={`p-4 rounded-xl border-2 transition-all ${
            state.currentTeam === 'A'
              ? 'bg-blue-500/20 border-blue-400'
              : 'bg-white/5 border-white/20'
          }`}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiUsers} className="text-blue-400 text-xl" />
              <span className="text-white font-semibold text-lg">Team A</span>
              {state.currentTeam === 'A' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold"
                >
                  ACTIVE
                </motion.div>
              )}
            </div>
            <div className="text-2xl font-bold text-white">
              {state.teamAScore}
            </div>
          </div>
        </motion.div>

        {/* Team B */}
        <motion.div
          className={`p-4 rounded-xl border-2 transition-all ${
            state.currentTeam === 'B'
              ? 'bg-red-500/20 border-red-400'
              : 'bg-white/5 border-white/20'
          }`}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiUsers} className="text-red-400 text-xl" />
              <span className="text-white font-semibold text-lg">Team B</span>
              {state.currentTeam === 'B' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold"
                >
                  ACTIVE
                </motion.div>
              )}
            </div>
            <div className="text-2xl font-bold text-white">
              {state.teamBScore}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Round Info */}
      <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="text-center">
          <div className="text-white/70 text-sm">Current Round</div>
          <div className="text-white font-bold text-lg">
            {state.currentQuestionIndex + 1} of {state.questions.length}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScoreBoard;