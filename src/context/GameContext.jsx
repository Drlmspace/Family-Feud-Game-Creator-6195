import React, { createContext, useContext, useReducer, useEffect } from 'react';

const GameContext = createContext();

const initialState = {
  gameSettings: {
    title: 'Family Feud',
    sounds: {
      wrongAnswer: 'https://app1.sharemyimage.com/2025/06/26/sestrike.mp4',
      gameStart: 'https://app1.sharemyimage.com/2025/06/26/Selong.mp4',
      correctAnswer: 'https://app1.sharemyimage.com/2025/06/26/SECorrect.mp4',
      roundEnd: 'https://app1.sharemyimage.com/2025/06/26/SEopeningshort.mp4'
    }
  },
  questions: [
    {
      id: 1,
      question: "Name something you might find in a kitchen",
      answers: [
        { text: "Refrigerator", points: 35, revealed: false },
        { text: "Stove", points: 25, revealed: false },
        { text: "Microwave", points: 20, revealed: false },
        { text: "Sink", points: 15, revealed: false },
        { text: "Dishes", points: 5, revealed: false }
      ]
    },
    {
      id: 2,
      question: "Name a popular pet",
      answers: [
        { text: "Dog", points: 45, revealed: false },
        { text: "Cat", points: 30, revealed: false },
        { text: "Fish", points: 15, revealed: false },
        { text: "Bird", points: 8, revealed: false },
        { text: "Hamster", points: 2, revealed: false }
      ]
    }
  ],
  fastMoneyQuestions: [
    {
      id: 1,
      question: "Name something you find in a bathroom",
      answers: [
        { text: "Toilet", points: 30 },
        { text: "Shower", points: 25 },
        { text: "Mirror", points: 20 },
        { text: "Sink", points: 15 },
        { text: "Toothbrush", points: 10 }
      ]
    },
    {
      id: 2,
      question: "Name a reason you might be late for work",
      answers: [
        { text: "Traffic", points: 35 },
        { text: "Overslept", points: 30 },
        { text: "Car problems", points: 20 },
        { text: "Weather", points: 10 },
        { text: "Sick", points: 5 }
      ]
    },
    {
      id: 3,
      question: "Name something people do at the beach",
      answers: [
        { text: "Swim", points: 40 },
        { text: "Sunbathe", points: 25 },
        { text: "Build sandcastles", points: 15 },
        { text: "Play volleyball", points: 12 },
        { text: "Read", points: 8 }
      ]
    },
    {
      id: 4,
      question: "Name a food that's better the next day",
      answers: [
        { text: "Pizza", points: 35 },
        { text: "Chili", points: 25 },
        { text: "Soup", points: 20 },
        { text: "Pasta", points: 15 },
        { text: "Chinese food", points: 5 }
      ]
    },
    {
      id: 5,
      question: "Name something you might lose",
      answers: [
        { text: "Keys", points: 40 },
        { text: "Phone", points: 30 },
        { text: "Wallet", points: 20 },
        { text: "Socks", points: 8 },
        { text: "Mind", points: 2 }
      ]
    }
  ],
  currentQuestionIndex: 0,
  teamAScore: 0,
  teamBScore: 0,
  strikes: 0,
  gamePhase: 'playing', // 'playing', 'steal', 'round-end', 'fast-money', 'fast-money-player2', 'game-complete'
  currentTeam: 'A',
  roundScore: 0,
  stealingTeam: null, // Track which team is attempting the steal
  originalTeam: null, // Track the original team that had control before steal
  fastMoneyAnswers: { player1: [], player2: [] },
  fastMoneyScore: 0,
  winningTeam: null,
  roundHistory: [], // Track round winners and scores
  activeSounds: {
    gameStart: 'stopped',
    roundEnd: 'stopped'
  }
};

// Global sound management
const activeSoundElements = {
  gameStart: null,
  roundEnd: null,
  correctAnswer: null,
  wrongAnswer: null
};

// Sound utility functions
const playSound = (url, soundType) => {
  if (url && url.trim()) {
    try {
      // Stop any existing sound of this type
      if (activeSoundElements[soundType]) {
        activeSoundElements[soundType].pause();
        activeSoundElements[soundType].currentTime = 0;
        activeSoundElements[soundType] = null;
      }

      // Check if it's a video file (mp4, webm, etc.)
      const isVideo = /\.(mp4|webm|ogg|avi|mov)$/i.test(url);
      let element;

      if (isVideo) {
        // Create a video element for video files
        element = document.createElement('video');
      } else {
        // Use audio element for audio files
        element = new Audio();
      }

      element.src = url;
      element.volume = 0.8; // Slightly higher volume for better audibility

      // Store reference for control
      activeSoundElements[soundType] = element;

      element.play().catch(error => {
        console.warn('Could not play sound:', error);
      });

      // Clean up reference when sound ends
      element.addEventListener('ended', () => {
        if (activeSoundElements[soundType] === element) {
          activeSoundElements[soundType] = null;
        }
      });

    } catch (error) {
      console.warn('Invalid sound URL:', error);
    }
  }
};

const pauseSound = (soundType) => {
  if (activeSoundElements[soundType]) {
    activeSoundElements[soundType].pause();
  }
};

const stopSound = (soundType) => {
  if (activeSoundElements[soundType]) {
    activeSoundElements[soundType].pause();
    activeSoundElements[soundType].currentTime = 0;
    activeSoundElements[soundType] = null;
  }
};

const resumeSound = (soundType) => {
  if (activeSoundElements[soundType]) {
    activeSoundElements[soundType].play().catch(error => {
      console.warn('Could not resume sound:', error);
    });
  }
};

const getSoundStatus = (soundType) => {
  if (!activeSoundElements[soundType]) return 'stopped';
  return activeSoundElements[soundType].paused ? 'paused' : 'playing';
};

// Helper function to reset all answers in all questions
const resetAllAnswers = (questions) => {
  return questions.map(question => ({
    ...question,
    answers: question.answers.map(answer => ({ ...answer, revealed: false }))
  }));
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_GAME_SETTINGS':
      return {
        ...state,
        gameSettings: { ...state.gameSettings, ...action.payload }
      };

    case 'UPDATE_SOUND_SETTINGS':
      return {
        ...state,
        gameSettings: {
          ...state.gameSettings,
          sounds: { ...state.gameSettings.sounds, ...action.payload }
        }
      };

    case 'PLAY_SOUND':
      const soundType = action.payload;
      const soundUrl = state.gameSettings.sounds[soundType];
      playSound(soundUrl, soundType);
      return {
        ...state,
        activeSounds: { ...state.activeSounds, [soundType]: 'playing' }
      };

    case 'PAUSE_SOUND':
      pauseSound(action.payload);
      return {
        ...state,
        activeSounds: { ...state.activeSounds, [action.payload]: 'paused' }
      };

    case 'STOP_SOUND':
      stopSound(action.payload);
      return {
        ...state,
        activeSounds: { ...state.activeSounds, [action.payload]: 'stopped' }
      };

    case 'RESUME_SOUND':
      resumeSound(action.payload);
      return {
        ...state,
        activeSounds: { ...state.activeSounds, [action.payload]: 'playing' }
      };

    case 'UPDATE_SOUND_STATUS':
      return {
        ...state,
        activeSounds: {
          ...state.activeSounds,
          [action.payload.soundType]: action.payload.status
        }
      };

    case 'ADD_QUESTION':
      return {
        ...state,
        questions: [...state.questions, action.payload]
      };

    case 'UPDATE_QUESTION':
      return {
        ...state,
        questions: state.questions.map(q => 
          q.id === action.payload.id ? action.payload : q
        )
      };

    case 'DELETE_QUESTION':
      return {
        ...state,
        questions: state.questions.filter(q => q.id !== action.payload)
      };

    case 'ADD_FAST_MONEY_QUESTION':
      return {
        ...state,
        fastMoneyQuestions: [...state.fastMoneyQuestions, action.payload]
      };

    case 'UPDATE_FAST_MONEY_QUESTION':
      return {
        ...state,
        fastMoneyQuestions: state.fastMoneyQuestions.map(q => 
          q.id === action.payload.id ? action.payload : q
        )
      };

    case 'DELETE_FAST_MONEY_QUESTION':
      return {
        ...state,
        fastMoneyQuestions: state.fastMoneyQuestions.filter(q => q.id !== action.payload)
      };

    case 'REVEAL_ANSWER':
      const updatedQuestions = [...state.questions];
      const currentQuestion = updatedQuestions[state.currentQuestionIndex];
      const answerIndex = action.payload;

      if (currentQuestion && currentQuestion.answers[answerIndex]) {
        currentQuestion.answers[answerIndex].revealed = true;
        
        // ALWAYS play correct answer sound when revealing an answer
        playSound(state.gameSettings.sounds.correctAnswer, 'correctAnswer');

        // Only add points if we're NOT in steal phase
        if (state.gamePhase !== 'steal') {
          return {
            ...state,
            questions: updatedQuestions,
            roundScore: state.roundScore + currentQuestion.answers[answerIndex].points
          };
        } else {
          // In steal phase, just reveal the answer without adding points
          return {
            ...state,
            questions: updatedQuestions
          };
        }
      }
      return state;

    case 'ADD_STRIKE':
      const newStrikes = state.strikes + 1;
      
      // ALWAYS play wrong answer sound when adding a strike (X clicked)
      playSound(state.gameSettings.sounds.wrongAnswer, 'wrongAnswer');

      // Different behavior based on game phase
      if (state.gamePhase === 'steal') {
        // During steal phase: one strike = points go to ORIGINAL team (not current team)
        const originalTeam = state.originalTeam; // The team that had control before steal
        const originalTeamKey = originalTeam === 'A' ? 'teamAScore' : 'teamBScore';
        const originalTeamScore = state[originalTeamKey] + state.roundScore;
        
        // Play round end sound
        playSound(state.gameSettings.sounds.roundEnd, 'roundEnd');

        // Add to round history - original team gets points due to failed steal
        const failedStealRound = {
          round: state.currentQuestionIndex + 1,
          team: originalTeam,
          points: state.roundScore,
          question: state.questions[state.currentQuestionIndex]?.question,
          type: 'failed-steal'
        };

        return {
          ...state,
          [originalTeamKey]: originalTeamScore,
          roundScore: 0,
          strikes: 0,
          gamePhase: 'round-end',
          stealingTeam: null,
          originalTeam: null,
          currentTeam: 'A', // Reset to Team A for next round
          roundHistory: [...state.roundHistory, failedStealRound]
        };
      } else {
        // Normal play: 3 strikes = steal opportunity
        if (newStrikes >= 3) {
          return {
            ...state,
            strikes: newStrikes,
            gamePhase: 'steal',
            originalTeam: state.currentTeam, // Store the original team
            stealingTeam: state.currentTeam === 'A' ? 'B' : 'A', // Other team gets to steal
            currentTeam: state.currentTeam === 'A' ? 'B' : 'A' // Switch to stealing team
          };
        }
        return {
          ...state,
          strikes: newStrikes
        };
      }

    case 'AWARD_POINTS':
      const teamKey = action.payload.team === 'A' ? 'teamAScore' : 'teamBScore';
      const newTeamScore = state[teamKey] + action.payload.points;
      
      // Play round end sound
      playSound(state.gameSettings.sounds.roundEnd, 'roundEnd');

      // Add to round history
      const roundWinner = {
        round: state.currentQuestionIndex + 1,
        team: action.payload.team,
        points: action.payload.points,
        question: state.questions[state.currentQuestionIndex]?.question
      };

      return {
        ...state,
        [teamKey]: newTeamScore,
        roundScore: 0,
        strikes: 0,
        gamePhase: 'round-end',
        stealingTeam: null,
        originalTeam: null,
        currentTeam: 'A', // Reset to Team A for next round
        roundHistory: [...state.roundHistory, roundWinner]
      };

    case 'NEXT_QUESTION':
      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex < state.questions.length) {
        return {
          ...state,
          currentQuestionIndex: nextIndex,
          strikes: 0,
          gamePhase: 'playing',
          roundScore: 0,
          currentTeam: 'A',
          stealingTeam: null,
          originalTeam: null
        };
      }
      return state;

    case 'SWITCH_TEAM':
      // Can't switch teams during steal phase
      if (state.gamePhase === 'steal') {
        return state;
      }
      return {
        ...state,
        currentTeam: state.currentTeam === 'A' ? 'B' : 'A'
      };

    case 'START_FAST_MONEY':
      // Determine winning team based on accumulated scores
      const winningTeam = state.teamAScore > state.teamBScore ? 'A' : 
                         state.teamBScore > state.teamAScore ? 'B' : 'A'; // Default to A if tied

      return {
        ...state,
        gamePhase: 'fast-money',
        winningTeam,
        fastMoneyAnswers: { player1: [], player2: [] },
        fastMoneyScore: 0,
        stealingTeam: null,
        originalTeam: null
      };

    case 'SUBMIT_FAST_MONEY_PLAYER1':
      return {
        ...state,
        fastMoneyAnswers: {
          ...state.fastMoneyAnswers,
          player1: action.payload.answers
        },
        fastMoneyScore: action.payload.score,
        gamePhase: 'fast-money-player2'
      };

    case 'SUBMIT_FAST_MONEY_PLAYER2':
      const totalScore = state.fastMoneyScore + action.payload.score;
      return {
        ...state,
        fastMoneyAnswers: {
          ...state.fastMoneyAnswers,
          player2: action.payload.answers
        },
        fastMoneyScore: totalScore,
        gamePhase: 'game-complete'
      };

    case 'RESET_GAME':
      // Stop all sounds
      Object.keys(activeSoundElements).forEach(soundType => {
        stopSound(soundType);
      });

      // Reset all answers to be covered up
      const resetQuestions = resetAllAnswers(state.questions);

      return {
        ...initialState,
        gameSettings: state.gameSettings, // Preserve settings
        questions: resetQuestions, // Reset with all answers covered
        fastMoneyQuestions: state.fastMoneyQuestions
      };

    case 'RESET_ROUND':
      const resetRoundQuestions = [...state.questions];
      if (resetRoundQuestions[state.currentQuestionIndex]) {
        // Reset all answers in the current question to be covered up
        resetRoundQuestions[state.currentQuestionIndex].answers.forEach(answer => {
          answer.revealed = false;
        });
      }

      return {
        ...state,
        questions: resetRoundQuestions,
        strikes: 0,
        gamePhase: 'playing',
        roundScore: 0,
        currentTeam: 'A',
        stealingTeam: null,
        originalTeam: null
      };

    case 'STEAL_POINTS':
      const stealTeamKey = action.payload.team === 'A' ? 'teamAScore' : 'teamBScore';
      const stealTeamScore = state[stealTeamKey] + state.roundScore;
      
      // Play round end sound
      playSound(state.gameSettings.sounds.roundEnd, 'roundEnd');

      // Add steal to round history
      const stealRound = {
        round: state.currentQuestionIndex + 1,
        team: action.payload.team,
        points: state.roundScore,
        question: state.questions[state.currentQuestionIndex]?.question,
        type: 'steal'
      };

      return {
        ...state,
        [stealTeamKey]: stealTeamScore,
        roundScore: 0,
        strikes: 0,
        gamePhase: 'round-end',
        stealingTeam: null,
        originalTeam: null,
        currentTeam: 'A', // Reset to Team A for next round
        roundHistory: [...state.roundHistory, stealRound]
      };

    case 'NO_STEAL':
      // No points awarded, just end the round
      playSound(state.gameSettings.sounds.roundEnd, 'roundEnd');
      return {
        ...state,
        roundScore: 0,
        strikes: 0,
        gamePhase: 'round-end',
        stealingTeam: null,
        originalTeam: null,
        currentTeam: 'A' // Reset to Team A for next round
      };

    case 'LOAD_DATA':
      // When loading data, ensure all answers start covered
      const loadedQuestions = action.payload.questions ? 
        resetAllAnswers(action.payload.questions) : state.questions;

      return {
        ...state,
        ...action.payload,
        questions: loadedQuestions
      };

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('familyFeudData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.questions || parsedData.fastMoneyQuestions || parsedData.gameSettings) {
          dispatch({ type: 'LOAD_DATA', payload: parsedData });
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('familyFeudData', JSON.stringify({
      questions: state.questions,
      fastMoneyQuestions: state.fastMoneyQuestions,
      gameSettings: state.gameSettings
    }));
  }, [state.questions, state.fastMoneyQuestions, state.gameSettings]);

  // Sound status checking utility
  const getSoundStatusUtil = (soundType) => {
    return getSoundStatus(soundType);
  };

  return (
    <GameContext.Provider value={{ state, dispatch, getSoundStatus: getSoundStatusUtil }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}