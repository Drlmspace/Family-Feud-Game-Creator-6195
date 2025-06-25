import React, { createContext, useContext, useReducer, useEffect } from 'react';

const GameContext = createContext();

const initialState = {
  gameSettings: {
    title: 'Family Feud',
    sounds: {
      wrongAnswer: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      gameStart: 'https://www.soundjay.com/misc/sounds/tada-fanfare-a.wav',
      correctAnswer: 'https://www.soundjay.com/misc/sounds/beep-07a.wav',
      roundEnd: 'https://www.soundjay.com/misc/sounds/beep-10.wav'
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
  fastMoneyAnswers: {
    player1: [],
    player2: []
  },
  fastMoneyScore: 0,
  winningTeam: null
};

// Sound utility functions
const playSound = (url) => {
  if (url && url.trim()) {
    try {
      const audio = new Audio(url);
      audio.volume = 0.5; // Set volume to 50%
      audio.play().catch(error => {
        console.warn('Could not play sound:', error);
      });
    } catch (error) {
      console.warn('Invalid sound URL:', error);
    }
  }
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_GAME_SETTINGS':
      return {
        ...state,
        gameSettings: {
          ...state.gameSettings,
          ...action.payload
        }
      };

    case 'UPDATE_SOUND_SETTINGS':
      return {
        ...state,
        gameSettings: {
          ...state.gameSettings,
          sounds: {
            ...state.gameSettings.sounds,
            ...action.payload
          }
        }
      };

    case 'PLAY_SOUND':
      playSound(state.gameSettings.sounds[action.payload]);
      return state;

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
        // Play correct answer sound
        playSound(state.gameSettings.sounds.correctAnswer);
        return {
          ...state,
          questions: updatedQuestions,
          roundScore: state.roundScore + currentQuestion.answers[answerIndex].points
        };
      }
      return state;

    case 'ADD_STRIKE':
      const newStrikes = state.strikes + 1;
      // Play wrong answer sound
      playSound(state.gameSettings.sounds.wrongAnswer);
      
      if (newStrikes >= 3) {
        return {
          ...state,
          strikes: newStrikes,
          gamePhase: 'steal'
        };
      }
      return {
        ...state,
        strikes: newStrikes
      };

    case 'AWARD_POINTS':
      const teamKey = action.payload.team === 'A' ? 'teamAScore' : 'teamBScore';
      // Play round end sound
      playSound(state.gameSettings.sounds.roundEnd);
      return {
        ...state,
        [teamKey]: state[teamKey] + action.payload.points,
        roundScore: 0,
        strikes: 0,
        gamePhase: 'round-end'
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
          currentTeam: 'A'
        };
      }
      return state;

    case 'SWITCH_TEAM':
      return {
        ...state,
        currentTeam: state.currentTeam === 'A' ? 'B' : 'A'
      };

    case 'START_FAST_MONEY':
      // Determine winning team
      const winningTeam = state.teamAScore > state.teamBScore ? 'A' : 'B';
      // Play game start sound
      playSound(state.gameSettings.sounds.gameStart);
      return {
        ...state,
        gamePhase: 'fast-money',
        winningTeam,
        fastMoneyAnswers: {
          player1: [],
          player2: []
        },
        fastMoneyScore: 0
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
      // Play game start sound
      playSound(state.gameSettings.sounds.gameStart);
      return {
        ...initialState,
        gameSettings: state.gameSettings, // Preserve settings
        questions: state.questions,
        fastMoneyQuestions: state.fastMoneyQuestions
      };

    case 'RESET_ROUND':
      const resetQuestions = [...state.questions];
      if (resetQuestions[state.currentQuestionIndex]) {
        resetQuestions[state.currentQuestionIndex].answers.forEach(answer => {
          answer.revealed = false;
        });
      }
      return {
        ...state,
        questions: resetQuestions,
        strikes: 0,
        gamePhase: 'playing',
        roundScore: 0,
        currentTeam: 'A'
      };

    case 'LOAD_DATA':
      return {
        ...state,
        ...action.payload
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

  return (
    <GameContext.Provider value={{ state, dispatch }}>
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