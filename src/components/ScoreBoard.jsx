import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiStar, FiTrophy, FiTarget } = FiIcons;

function ScoreBoard() {
  const { state } = useGame();

  const getTeamStatus = (team) => {
    if (state.gamePhase === 'fast-money' || state.gamePhase === 'fast-money-player2') {
      return state.winningTeam === team ? 'FAST MONEY' : 'ELIMINATED';
    }
    return state.currentTeam === team ? 'ACTIVE' : 'WAITING';
  };

  const isWinning = (team) => {
    if (team === 'A') return state.teamAScore > state.teamBScore;
    return state.teamBScore > state.teamAScore;
  };

  const isGameComplete = state.currentQuestionIndex >= state.questions.length;

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
              <div>
                <div className="text-white font-semibold text-lg">Team A</div>
                <div className="text-xs text-white/60">{getTeamStatus('A')}</div>
              </div>
              {isWinning('A') && isGameComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold flex items-center space-x-1"
                >
                  <SafeIcon icon={FiTrophy} className="text-xs" />
                  <span>WINNER</span>
                </motion.div>
              )}
              {state.currentTeam === 'A' && !isGameComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold"
                >
                  ACTIVE
                </motion.div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {state.teamAScore}
              </div>
              {state.currentTeam === 'A' && state.roundScore > 0 && (
                <div className="text-sm text-yellow-400">
                  +{state.roundScore}
                </div>
              )}
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
              <div>
                <div className="text-white font-semibold text-lg">Team B</div>
                <div className="text-xs text-white/60">{getTeamStatus('B')}</div>
              </div>
              {isWinning('B') && isGameComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold flex items-center space-x-1"
                >
                  <SafeIcon icon={FiTrophy} className="text-xs" />
                  <span>WINNER</span>
                </motion.div>
              )}
              {state.currentTeam === 'B' && !isGameComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold"
                >
                  ACTIVE
                </motion.div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {state.teamBScore}
              </div>
              {state.currentTeam === 'B' && state.roundScore > 0 && (
                <div className="text-sm text-yellow-400">
                  +{state.roundScore}
                </div>
              )}
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
          {state.roundScore > 0 && (
            <div className="text-yellow-400 font-bold mt-1">
              {state.roundScore} points available
            </div>
          )}
        </div>
      </div>

      {/* Game Summary */}
      {isGameComplete && (
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-400/30">
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-sm mb-2">MAIN GAME COMPLETE</div>
            <div className="text-white text-sm">
              {state.teamAScore === state.teamBScore ? 
                "It's a tie!" : 
                `Team ${isWinning('A') ? 'A' : 'B'} leads by ${Math.abs(state.teamAScore - state.teamBScore)} points`
              }
            </div>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <SafeIcon icon={FiTarget} className="text-yellow-400" />
              <span className="text-yellow-400 text-xs">Ready for Fast Money</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScoreBoard;