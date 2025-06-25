import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiEye, FiShield } = FiIcons;

function GameBoard() {
  const { state, dispatch } = useGame();
  const currentQuestion = state.questions[state.currentQuestionIndex];

  const handleRevealAnswer = (index) => {
    if (!currentQuestion.answers[index].revealed) {
      dispatch({ type: 'REVEAL_ANSWER', payload: index });
    }
  };

  const renderStrikes = () => {
    return Array.from({ length: 3 }, (_, index) => (
      <motion.div
        key={index}
        className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
          index < state.strikes
            ? 'bg-red-500 border-red-400'
            : 'bg-white/10 border-white/30'
        }`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.1 }}
      >
        {index < state.strikes && (
          <SafeIcon icon={FiX} className="text-white text-2xl font-bold" />
        )}
      </motion.div>
    ));
  };

  if (!currentQuestion) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
        <h2 className="text-2xl font-bold text-white">Game Complete!</h2>
        <p className="text-white/70 mt-2">All questions have been played.</p>
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-400/30">
          <div className="text-yellow-400 font-bold text-lg mb-2">Final Scores</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-blue-400 font-semibold">Team A</div>
              <div className="text-2xl font-bold text-white">{state.teamAScore}</div>
            </div>
            <div className="text-center">
              <div className="text-red-400 font-semibold">Team B</div>
              <div className="text-2xl font-bold text-white">{state.teamBScore}</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-yellow-400 font-bold">
              {state.teamAScore > state.teamBScore ? 'Team A Wins!' :
               state.teamBScore > state.teamAScore ? 'Team B Wins!' :
               'It\'s a Tie!'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
      {/* Question Header */}
      <div className="text-center mb-8">
        <div className="bg-yellow-500 text-black px-6 py-3 rounded-lg inline-block mb-4">
          <span className="font-bold text-lg">
            Question {state.currentQuestionIndex + 1} of {state.questions.length}
          </span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-6">
          {currentQuestion.question}
        </h2>
      </div>

      {/* Answers Board */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {currentQuestion.answers.map((answer, index) => (
          <motion.div
            key={index}
            className={`relative overflow-hidden rounded-xl border-2 ${
              answer.revealed
                ? 'bg-blue-500 border-blue-400'
                : 'bg-white/5 border-white/20 cursor-pointer hover:bg-white/10'
            } transition-all`}
            onClick={() => handleRevealAnswer(index)}
            whileHover={{ scale: answer.revealed ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <AnimatePresence mode="wait">
                  {answer.revealed ? (
                    <motion.span
                      key="revealed"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-white font-semibold text-xl"
                    >
                      {answer.text}
                    </motion.span>
                  ) : (
                    <motion.div
                      key="hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center space-x-2 text-white/50"
                    >
                      <SafeIcon icon={FiEye} />
                      <span>Click to reveal</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {answer.revealed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-xl"
                  >
                    {answer.points}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Strikes */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <span className="text-white font-bold text-xl mr-4">STRIKES:</span>
        {renderStrikes()}
      </div>

      {/* Round Score */}
      {state.roundScore > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg inline-block">
            <span className="font-bold text-xl">Round Score: {state.roundScore}</span>
          </div>
        </motion.div>
      )}

      {/* Game Phase Indicator */}
      {state.gamePhase === 'steal' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-red-500 text-white px-8 py-4 rounded-lg inline-block">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiShield} className="text-2xl" />
              <span className="font-bold text-2xl">STEAL OPPORTUNITY!</span>
            </div>
            <div className="text-sm mt-1">
              {state.roundScore} points available to steal
            </div>
          </div>
        </motion.div>
      )}

      {/* Round End Phase */}
      {state.gamePhase === 'round-end' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-green-500 text-white px-8 py-4 rounded-lg inline-block">
            <span className="font-bold text-2xl">ROUND COMPLETE!</span>
            <div className="text-sm mt-1">
              Points have been awarded
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default GameBoard;