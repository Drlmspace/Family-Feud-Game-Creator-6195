import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTrophy, FiZap, FiRefreshCw, FiStar } = FiIcons;

function GameComplete() {
  const { state, dispatch } = useGame();
  
  const totalScore = state.fastMoneyScore;
  const won = totalScore >= 200;
  
  const handleResetGame = () => {
    if (window.confirm('Start a new game? This will reset everything.')) {
      dispatch({ type: 'RESET_GAME' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20 text-center">
        {/* Victory Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <SafeIcon 
            icon={won ? FiTrophy : FiStar} 
            className={`text-8xl mx-auto ${won ? 'text-yellow-400' : 'text-gray-400'}`} 
          />
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className={`text-6xl font-bold mb-4 ${won ? 'text-yellow-400' : 'text-white'}`}>
            {won ? 'CONGRATULATIONS!' : 'GOOD EFFORT!'}
          </h1>
          
          <div className="text-3xl text-white mb-2">Team {state.winningTeam}</div>
          
          <div className="flex items-center justify-center space-x-4 mb-8">
            <SafeIcon icon={FiZap} className="text-yellow-400 text-2xl" />
            <span className="text-5xl font-bold text-white">{totalScore}</span>
            <span className="text-2xl text-white/70">/ 200</span>
          </div>

          {won ? (
            <div className="space-y-4 mb-8">
              <p className="text-2xl text-green-400 font-bold">🎉 YOU WON THE GRAND PRIZE! 🎉</p>
              <p className="text-white/70 text-lg">
                Amazing teamwork in the Fast Money round!
              </p>
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              <p className="text-xl text-white/70">
                You needed {200 - totalScore} more points to win the grand prize.
              </p>
              <p className="text-white/50">
                Great job playing Family Feud!
              </p>
            </div>
          )}
        </motion.div>

        {/* Detailed Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 rounded-xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">Fast Money Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Player 1 */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-blue-400">Player 1</h4>
              {state.fastMoneyAnswers.player1.map((answer, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-white/90 text-sm font-medium">{answer.question}</div>
                      <div className="text-white/70 text-sm">{answer.answer}</div>
                    </div>
                    <div className="text-yellow-400 font-bold">{answer.points}</div>
                  </div>
                </div>
              ))}
              <div className="text-center pt-2">
                <span className="text-blue-400 font-bold text-lg">
                  Player 1 Total: {state.fastMoneyAnswers.player1.reduce((sum, a) => sum + a.points, 0)}
                </span>
              </div>
            </div>

            {/* Player 2 */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-red-400">Player 2</h4>
              {state.fastMoneyAnswers.player2.map((answer, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-white/90 text-sm font-medium">{answer.question}</div>
                      <div className="text-white/70 text-sm">{answer.answer}</div>
                    </div>
                    <div className="text-yellow-400 font-bold">{answer.points}</div>
                  </div>
                </div>
              ))}
              <div className="text-center pt-2">
                <span className="text-red-400 font-bold text-lg">
                  Player 2 Total: {state.fastMoneyAnswers.player2.reduce((sum, a) => sum + a.points, 0)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final Scores from Main Game */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white/5 rounded-xl p-6 mb-8"
        >
          <h3 className="text-lg font-bold text-white mb-4">Main Game Final Scores</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${state.winningTeam === 'A' ? 'bg-blue-500/20 border border-blue-400' : 'bg-white/5'}`}>
              <div className="text-blue-400 font-semibold">Team A</div>
              <div className="text-2xl font-bold text-white">{state.teamAScore}</div>
            </div>
            <div className={`p-4 rounded-lg ${state.winningTeam === 'B' ? 'bg-red-500/20 border border-red-400' : 'bg-white/5'}`}>
              <div className="text-red-400 font-semibold">Team B</div>
              <div className="text-2xl font-bold text-white">{state.teamBScore}</div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.button
            onClick={handleResetGame}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-xl flex items-center space-x-3 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Play Again</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default GameComplete;