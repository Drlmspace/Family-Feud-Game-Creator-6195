import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiSkipForward, FiRotateCcw, FiRefreshCw, FiShuffle, FiAward, FiZap, FiShield, FiVolume2, FiPlay } = FiIcons;

function GameControls() {
  const { state, dispatch } = useGame();

  const handleAddStrike = () => {
    dispatch({ type: 'ADD_STRIKE' });
  };

  const handleAwardPoints = (team) => {
    dispatch({ type: 'AWARD_POINTS', payload: { team, points: state.roundScore } });
  };

  const handleStealPoints = (team) => {
    dispatch({ type: 'STEAL_POINTS', payload: { team } });
  };

  const handleNoSteal = () => {
    dispatch({ type: 'NO_STEAL' });
  };

  const handleNextQuestion = () => {
    dispatch({ type: 'NEXT_QUESTION' });
  };

  const handleSwitchTeam = () => {
    dispatch({ type: 'SWITCH_TEAM' });
  };

  const handleResetRound = () => {
    if (window.confirm('Reset current round? This will clear all revealed answers and strikes.')) {
      dispatch({ type: 'RESET_ROUND' });
    }
  };

  const handleResetGame = () => {
    if (window.confirm('Reset entire game? This will clear all scores and return to the first question.')) {
      dispatch({ type: 'RESET_GAME' });
    }
  };

  const handleStartFastMoney = () => {
    if (state.fastMoneyQuestions.length < 5) {
      alert('You need at least 5 Fast Money questions to play the final round. Please add more in the Admin Panel.');
      return;
    }

    const winner = state.teamAScore > state.teamBScore ? 'Team A' :
                  state.teamBScore > state.teamAScore ? 'Team B' :
                  'It\'s a tie';

    if (window.confirm(`Current Scores:\nTeam A: ${state.teamAScore}\nTeam B: ${state.teamBScore}\n\nWinner: ${winner}\n\nStart Fast Money round?`)) {
      dispatch({ type: 'START_FAST_MONEY' });
    }
  };

  const handlePlaySound = (soundType) => {
    dispatch({ type: 'PLAY_SOUND', payload: soundType });
  };

  const isGameComplete = state.currentQuestionIndex >= state.questions.length;
  const canStartFastMoney = isGameComplete;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-6">Game Controls</h3>
      
      <div className="space-y-3">
        {/* Sound Controls */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <SafeIcon icon={FiVolume2} className="text-yellow-400" />
            <h4 className="text-white font-semibold">Sound Effects</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              onClick={() => handlePlaySound('gameStart')}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiPlay} />
              <span>Game Start</span>
            </motion.button>
            <motion.button
              onClick={() => handlePlaySound('roundEnd')}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiPlay} />
              <span>Round End</span>
            </motion.button>
          </div>
        </div>

        {!isGameComplete && (
          <>
            {/* Add Strike */}
            <motion.button
              onClick={handleAddStrike}
              disabled={state.strikes >= 3}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              whileHover={{ scale: state.strikes >= 3 ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiX} />
              <span>Add Strike ({state.strikes}/3)</span>
            </motion.button>

            {/* Award Points or Steal Phase */}
            {state.gamePhase === 'steal' ? (
              <div className="space-y-2">
                <div className="bg-red-500/20 border border-red-400 rounded-lg p-3 text-center">
                  <div className="text-red-400 font-bold mb-2">STEAL OPPORTUNITY!</div>
                  <div className="text-white text-sm">
                    {state.roundScore} points available to steal
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    onClick={() => handleStealPoints('A')}
                    disabled={state.roundScore === 0}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                    whileHover={{ scale: state.roundScore === 0 ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SafeIcon icon={FiShield} />
                    <span>Team A Steals</span>
                  </motion.button>
                  <motion.button
                    onClick={() => handleStealPoints('B')}
                    disabled={state.roundScore === 0}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                    whileHover={{ scale: state.roundScore === 0 ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SafeIcon icon={FiShield} />
                    <span>Team B Steals</span>
                  </motion.button>
                </div>
                <motion.button
                  onClick={handleNoSteal}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SafeIcon icon={FiX} />
                  <span>No Steal - End Round</span>
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  onClick={() => handleAwardPoints('A')}
                  disabled={state.roundScore === 0}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  whileHover={{ scale: state.roundScore === 0 ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SafeIcon icon={FiAward} />
                  <span>Team A ({state.roundScore})</span>
                </motion.button>
                <motion.button
                  onClick={() => handleAwardPoints('B')}
                  disabled={state.roundScore === 0}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  whileHover={{ scale: state.roundScore === 0 ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SafeIcon icon={FiAward} />
                  <span>Team B ({state.roundScore})</span>
                </motion.button>
              </div>
            )}

            {/* Switch Team */}
            <motion.button
              onClick={handleSwitchTeam}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiShuffle} />
              <span>Switch to Team {state.currentTeam === 'A' ? 'B' : 'A'}</span>
            </motion.button>

            {/* Next Question */}
            <motion.button
              onClick={handleNextQuestion}
              disabled={state.currentQuestionIndex >= state.questions.length - 1}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              whileHover={{ scale: state.currentQuestionIndex >= state.questions.length - 1 ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiSkipForward} />
              <span>Next Question</span>
            </motion.button>

            <hr className="border-white/20 my-4" />
          </>
        )}

        {/* Fast Money Round */}
        {canStartFastMoney && (
          <motion.button
            onClick={handleStartFastMoney}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors font-bold text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiZap} />
            <span>Start Fast Money!</span>
          </motion.button>
        )}

        {/* Reset Controls */}
        <motion.button
          onClick={handleResetRound}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SafeIcon icon={FiRotateCcw} />
          <span>Reset Round</span>
        </motion.button>

        <motion.button
          onClick={handleResetGame}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SafeIcon icon={FiRefreshCw} />
          <span>Reset Game</span>
        </motion.button>
      </div>

      {/* Game Status */}
      <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="text-center">
          <div className="text-white/70 text-sm">Game Status</div>
          <div className="text-white font-bold">
            {state.gamePhase === 'steal' ? 'STEAL OPPORTUNITY' :
             state.gamePhase === 'round-end' ? 'ROUND COMPLETE' :
             isGameComplete ? 'READY FOR FAST MONEY' : 'PLAYING'}
          </div>
          {state.roundScore > 0 && (
            <div className="text-yellow-400 font-bold mt-1">
              {state.roundScore} points in play
            </div>
          )}
        </div>
      </div>

      {/* Round History */}
      {state.roundHistory.length > 0 && (
        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="text-white/70 text-sm mb-2">Round Winners</div>
          <div className="space-y-1">
            {state.roundHistory.slice(-3).map((round, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="text-white/60">Round {round.round}</span>
                <span className={`font-bold ${round.team === 'A' ? 'text-blue-400' : 'text-red-400'}`}>
                  Team {round.team} +{round.points}
                  {round.type === 'steal' && ' (STEAL)'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GameControls;