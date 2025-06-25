import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiZap, FiUser, FiUsers, FiCheck } = FiIcons;

function FastMoneyRound() {
  const { state, dispatch } = useGame();
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [answers, setAnswers] = useState(['', '', '', '', '']);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);

  const isPlayer2 = state.gamePhase === 'fast-money-player2';
  const player1Answers = state.fastMoneyAnswers.player1;

  useEffect(() => {
    if (isPlayer2) {
      setCurrentPlayer(2);
      setTimeLeft(25); // Player 2 gets 25 seconds
      setAnswers(['', '', '', '', '']);
      setCurrentQuestionIndex(0);
      setShowResults(false);
      setPlayerScore(0);
    }
  }, [isPlayer2]);

  useEffect(() => {
    let interval = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const startTimer = () => {
    setIsTimerActive(true);
  };

  const handleTimeUp = () => {
    setIsTimerActive(false);
    calculateScore();
  };

  const handleAnswerSubmit = (questionIndex, answer) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
    
    if (questionIndex < 4) {
      setCurrentQuestionIndex(questionIndex + 1);
    } else {
      // All questions answered
      setIsTimerActive(false);
      calculateScore();
    }
  };

  const calculateScore = () => {
    let score = 0;
    const playerAnswers = answers.map((answer, index) => {
      const question = state.fastMoneyQuestions[index];
      const matchingAnswer = question.answers.find(a => 
        a.text.toLowerCase().includes(answer.toLowerCase().trim()) || 
        answer.toLowerCase().trim().includes(a.text.toLowerCase())
      );
      
      const points = matchingAnswer ? matchingAnswer.points : 0;
      score += points;
      
      return {
        question: question.question,
        answer: answer || 'No Answer',
        points: points,
        correctAnswer: matchingAnswer ? matchingAnswer.text : 'Not Found'
      };
    });

    setPlayerScore(score);
    setShowResults(true);

    // Submit to game state
    if (currentPlayer === 1) {
      dispatch({
        type: 'SUBMIT_FAST_MONEY_PLAYER1',
        payload: { answers: playerAnswers, score }
      });
    } else {
      dispatch({
        type: 'SUBMIT_FAST_MONEY_PLAYER2',
        payload: { answers: playerAnswers, score }
      });
    }
  };

  const resetForPlayer2 = () => {
    setCurrentPlayer(2);
    setTimeLeft(25);
    setAnswers(['', '', '', '', '']);
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setPlayerScore(0);
    setIsTimerActive(false);
  };

  if (showResults && currentPlayer === 1 && !isPlayer2) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Player 1 Results</h2>
            <div className="text-6xl font-bold text-yellow-400 mb-4">{playerScore}</div>
            <p className="text-white/70 text-lg">
              {playerScore >= 200 ? 'Congratulations! You won!' : 'Player 2 needs to score ' + (200 - playerScore) + ' points to win!'}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {state.fastMoneyAnswers.player1.map((answer, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">{answer.question}</div>
                    <div className="text-white/70">{answer.answer}</div>
                  </div>
                  <div className="text-yellow-400 font-bold text-xl">{answer.points}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <motion.button
              onClick={resetForPlayer2}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Player 2
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <SafeIcon icon={FiZap} className="text-yellow-400 text-4xl" />
            <h2 className="text-4xl font-bold text-white">Fast Money</h2>
          </div>
          
          <div className="flex items-center justify-center space-x-8 mb-6">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={currentPlayer === 1 ? FiUser : FiUsers} className="text-white text-xl" />
              <span className="text-white font-bold text-xl">
                Player {currentPlayer} - Team {state.winningTeam}
              </span>
            </div>
            
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
            }`}>
              <SafeIcon icon={FiClock} className="text-white" />
              <span className="text-white font-bold text-xl">{timeLeft}s</span>
            </div>
          </div>

          {!isTimerActive && !showResults && (
            <motion.button
              onClick={startTimer}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Timer
            </motion.button>
          )}
        </div>

        {/* Questions */}
        {isTimerActive && !showResults && (
          <div className="space-y-6">
            {state.fastMoneyQuestions.slice(0, 5).map((question, index) => (
              <motion.div
                key={index}
                className={`p-6 rounded-xl border-2 transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-blue-500/20 border-blue-400'
                    : index < currentQuestionIndex
                    ? 'bg-green-500/20 border-green-400'
                    : 'bg-white/5 border-white/20'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {index + 1}. {question.question}
                    </h3>
                    
                    {index === currentQuestionIndex ? (
                      <FastMoneyInput
                        onSubmit={(answer) => handleAnswerSubmit(index, answer)}
                        placeholder="Your answer..."
                        duplicateAnswer={
                          currentPlayer === 2 
                            ? player1Answers.find(a => a.question === question.question)?.answer
                            : null
                        }
                      />
                    ) : index < currentQuestionIndex ? (
                      <div className="text-green-400 font-medium">
                        ✓ {answers[index] || 'No Answer'}
                      </div>
                    ) : null}
                  </div>
                  
                  {index < currentQuestionIndex && (
                    <SafeIcon icon={FiCheck} className="text-green-400 text-2xl" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-yellow-400 mb-2">{playerScore}</div>
              <div className="text-white text-xl">
                Player {currentPlayer} Score
              </div>
              {currentPlayer === 2 && (
                <div className="text-white text-lg mt-2">
                  Total: {state.fastMoneyScore} / 200
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {answers.map((answer, index) => {
                const question = state.fastMoneyQuestions[index];
                const matchingAnswer = question.answers.find(a => 
                  a.text.toLowerCase().includes(answer.toLowerCase().trim()) || 
                  answer.toLowerCase().trim().includes(a.text.toLowerCase())
                );
                const points = matchingAnswer ? matchingAnswer.points : 0;

                return (
                  <motion.div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="text-white font-medium mb-1">{question.question}</div>
                        <div className="text-white/70">{answer || 'No Answer'}</div>
                        {matchingAnswer && (
                          <div className="text-green-400 text-sm">✓ {matchingAnswer.text}</div>
                        )}
                      </div>
                      <div className={`font-bold text-2xl ${points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {points}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FastMoneyInput({ onSubmit, placeholder, duplicateAnswer }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-lg"
        autoFocus
      />
      {duplicateAnswer && (
        <div className="text-yellow-400 text-sm">
          Player 1 answered: "{duplicateAnswer}" - Try a different answer!
        </div>
      )}
      <button type="submit" className="sr-only">Submit</button>
    </form>
  );
}

export default FastMoneyRound;