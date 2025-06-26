import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
  FiZap,
  FiLogOut,
  FiSettings,
  FiVolume2,
  FiPlay,
  FiDownload
} = FiIcons;

function AdminPanel({ onLogout }) {
  const { state, dispatch } = useGame();
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('regular'); // 'regular', 'fast-money', 'settings'

  const [formData, setFormData] = useState({
    question: '',
    answers: [
      { text: '', points: 0 },
      { text: '', points: 0 },
      { text: '', points: 0 },
      { text: '', points: 0 },
      { text: '', points: 0 }
    ]
  });

  const [settingsData, setSettingsData] = useState({
    title: state.gameSettings.title,
    sounds: { ...state.gameSettings.sounds }
  });

  const resetForm = () => {
    setFormData({
      question: '',
      answers: [
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 }
      ]
    });
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  const handleSaveSettings = () => {
    dispatch({
      type: 'UPDATE_GAME_SETTINGS',
      payload: {
        title: settingsData.title,
        sounds: settingsData.sounds
      }
    });
    alert('Settings saved successfully!');
  };

  const handleTestSound = (soundType) => {
    dispatch({ type: 'PLAY_SOUND', payload: soundType });
  };

  const handleSoundChange = (soundType, url) => {
    setSettingsData({
      ...settingsData,
      sounds: {
        ...settingsData.sounds,
        [soundType]: url
      }
    });
  };

  const handleAddQuestion = () => {
    if (formData.question.trim() && formData.answers.some(a => a.text.trim())) {
      const newQuestion = {
        id: Date.now(),
        question: formData.question,
        answers: formData.answers
          .filter(a => a.text.trim())
          .map(a => ({ ...a, revealed: false }))
          .sort((a, b) => b.points - a.points)
      };

      const actionType = activeTab === 'fast-money' ? 'ADD_FAST_MONEY_QUESTION' : 'ADD_QUESTION';
      dispatch({ type: actionType, payload: newQuestion });

      resetForm();
      setShowAddForm(false);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question.id);
    setFormData({
      question: question.question,
      answers: [...question.answers.map(a => ({ text: a.text, points: a.points }))]
    });
  };

  const handleUpdateQuestion = () => {
    if (formData.question.trim() && formData.answers.some(a => a.text.trim())) {
      const updatedQuestion = {
        id: editingQuestion,
        question: formData.question,
        answers: formData.answers
          .filter(a => a.text.trim())
          .map(a => ({ ...a, revealed: false }))
          .sort((a, b) => b.points - a.points)
      };

      const actionType = activeTab === 'fast-money' ? 'UPDATE_FAST_MONEY_QUESTION' : 'UPDATE_QUESTION';
      dispatch({ type: actionType, payload: updatedQuestion });

      resetForm();
      setEditingQuestion(null);
    }
  };

  const handleDeleteQuestion = (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const actionType = activeTab === 'fast-money' ? 'DELETE_FAST_MONEY_QUESTION' : 'DELETE_QUESTION';
      dispatch({ type: actionType, payload: id });
    }
  };

  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setFormData({ ...formData, answers: newAnswers });
  };

  // CSV Export Functions
  const escapeCSVField = (field) => {
    if (field === null || field === undefined) return '';
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n') || stringField.includes('\r')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  const exportToCSV = (questionsToExport, filename) => {
    const csvContent = generateCSVContent(questionsToExport);
    downloadCSV(csvContent, filename);
  };

  const generateCSVContent = (questions) => {
    let csvContent = 'Question Number,Question,Answer 1,Points 1,Answer 2,Points 2,Answer 3,Points 3,Answer 4,Points 4,Answer 5,Points 5\n';

    questions.forEach((question, index) => {
      const row = [
        index + 1,
        escapeCSVField(question.question)
      ];

      // Add answers and points (up to 5)
      for (let i = 0; i < 5; i++) {
        if (question.answers[i]) {
          row.push(escapeCSVField(question.answers[i].text));
          row.push(question.answers[i].points);
        } else {
          row.push('');
          row.push('');
        }
      }

      csvContent += row.join(',') + '\n';
    });

    return csvContent;
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportRegularQuestions = () => {
    if (state.questions.length === 0) {
      alert('No regular questions to export!');
      return;
    }
    exportToCSV(state.questions, 'family-feud-regular-questions.csv');
  };

  const handleExportFastMoneyQuestions = () => {
    if (state.fastMoneyQuestions.length === 0) {
      alert('No Fast Money questions to export!');
      return;
    }
    exportToCSV(state.fastMoneyQuestions, 'family-feud-fast-money-questions.csv');
  };

  const handleExportAllQuestions = () => {
    if (state.questions.length === 0 && state.fastMoneyQuestions.length === 0) {
      alert('No questions to export!');
      return;
    }

    let csvContent = '';

    if (state.questions.length > 0) {
      csvContent += '===REGULAR QUESTIONS===\n';
      csvContent += 'Question Number,Question,Answer 1,Points 1,Answer 2,Points 2,Answer 3,Points 3,Answer 4,Points 4,Answer 5,Points 5\n';

      state.questions.forEach((question, index) => {
        const row = [
          index + 1,
          escapeCSVField(question.question)
        ];

        for (let i = 0; i < 5; i++) {
          if (question.answers[i]) {
            row.push(escapeCSVField(question.answers[i].text));
            row.push(question.answers[i].points);
          } else {
            row.push('');
            row.push('');
          }
        }

        csvContent += row.join(',') + '\n';
      });

      csvContent += '\n';
    }

    if (state.fastMoneyQuestions.length > 0) {
      csvContent += '===FAST MONEY QUESTIONS===\n';
      csvContent += 'Question Number,Question,Answer 1,Points 1,Answer 2,Points 2,Answer 3,Points 3,Answer 4,Points 4,Answer 5,Points 5\n';

      state.fastMoneyQuestions.forEach((question, index) => {
        const row = [
          index + 1,
          escapeCSVField(question.question)
        ];

        for (let i = 0; i < 5; i++) {
          if (question.answers[i]) {
            row.push(escapeCSVField(question.answers[i].text));
            row.push(question.answers[i].points);
          } else {
            row.push('');
            row.push('');
          }
        }

        csvContent += row.join(',') + '\n';
      });
    }

    downloadCSV(csvContent, 'family-feud-all-questions.csv');
  };

  const currentQuestions = activeTab === 'fast-money' ? state.fastMoneyQuestions : state.questions;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-3xl font-bold text-white">Admin Panel</h2>
            <div className="bg-green-500/20 border border-green-400 rounded-lg px-3 py-1">
              <span className="text-green-400 text-sm font-medium">Authenticated</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {activeTab !== 'settings' && (
              <motion.button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SafeIcon icon={FiPlus} />
                <span>Add Question</span>
              </motion.button>
            )}

            <motion.button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiLogOut} />
              <span>Logout</span>
            </motion.button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8">
          <motion.button
            onClick={() => setActiveTab('regular')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'regular'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Regular Questions ({state.questions.length})
          </motion.button>

          <motion.button
            onClick={() => setActiveTab('fast-money')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
              activeTab === 'fast-money'
                ? 'bg-yellow-500 text-black'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiZap} />
            <span>Fast Money ({state.fastMoneyQuestions.length})</span>
          </motion.button>

          <motion.button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
              activeTab === 'settings'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiSettings} />
            <span>Game Settings</span>
          </motion.button>
        </div>

        {/* CSV Export Section */}
        {activeTab !== 'settings' && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <SafeIcon icon={FiDownload} />
              <span>Export Questions</span>
            </h3>
            <p className="text-white/70 text-sm mb-4">
              Export questions to CSV format for judges and external reference. Perfect for printing answer sheets or importing into other systems.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.button
                onClick={handleExportRegularQuestions}
                disabled={state.questions.length === 0}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                whileHover={{ scale: state.questions.length === 0 ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SafeIcon icon={FiDownload} />
                <span>Regular Questions</span>
              </motion.button>

              <motion.button
                onClick={handleExportFastMoneyQuestions}
                disabled={state.fastMoneyQuestions.length === 0}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-black px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                whileHover={{ scale: state.fastMoneyQuestions.length === 0 ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SafeIcon icon={FiZap} />
                <span>Fast Money</span>
              </motion.button>

              <motion.button
                onClick={handleExportAllQuestions}
                disabled={state.questions.length === 0 && state.fastMoneyQuestions.length === 0}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                whileHover={{ scale: (state.questions.length === 0 && state.fastMoneyQuestions.length === 0) ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SafeIcon icon={FiDownload} />
                <span>All Questions</span>
              </motion.button>
            </div>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
              <p className="text-blue-400 text-sm">
                <strong>Judge Tip:</strong> Export questions before the show starts to have a printed reference sheet. This helps judges verify answers and point values during gameplay without needing to look at the screen.
              </p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Game Settings</h3>

              {/* Game Title */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-2">Game Title</label>
                <input
                  type="text"
                  value={settingsData.title}
                  onChange={(e) => setSettingsData({ ...settingsData, title: e.target.value })}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                  placeholder="Enter game title..."
                />
              </div>

              {/* Sound Settings */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <SafeIcon icon={FiVolume2} />
                  <span>Sound Settings</span>
                </h4>

                {Object.entries(settingsData.sounds).map(([soundType, url]) => (
                  <div key={soundType} className="space-y-2">
                    <label className="block text-white/90 font-medium capitalize">
                      {soundType.replace(/([A-Z])/g, ' $1').trim()} Sound
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleSoundChange(soundType, e.target.value)}
                        className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                        placeholder="Enter sound URL..."
                      />
                      <motion.button
                        onClick={() => handleTestSound(soundType)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <SafeIcon icon={FiPlay} />
                        <span>Test</span>
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Settings */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <motion.button
                  onClick={handleSaveSettings}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold flex items-center space-x-2 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SafeIcon icon={FiSave} />
                  <span>Save Settings</span>
                </motion.button>
              </div>

              {/* Sound Examples */}
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
                <h5 className="text-yellow-400 font-semibold mb-2">Sound URL Examples:</h5>
                <div className="text-white/70 text-sm space-y-1">
                  <div>• <strong>Wrong Answer:</strong> Buzzer or error sound (plays when X is clicked)</div>
                  <div>• <strong>Correct Answer:</strong> Ding or success sound (plays when answer is revealed)</div>
                  <div>• <strong>Game Start:</strong> Fanfare or theme music</div>
                  <div>• <strong>Round End:</strong> Victory or completion sound</div>
                </div>
                <p className="text-white/50 text-xs mt-2">
                  Use direct links to audio files (.mp3, .wav, .ogg). Some free sound sites: freesound.org, zapsplat.com
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Question Form */}
        <AnimatePresence>
          {(showAddForm || editingQuestion) && activeTab !== 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
                {activeTab === 'fast-money' && <span className="text-yellow-400"> (Fast Money)</span>}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2 font-medium">Question</label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                    placeholder="Enter your question..."
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-medium">
                    Answers {activeTab === 'fast-money' ? '(Fast Money - Top 5)' : '(sorted by points)'}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.answers.map((answer, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={answer.text}
                          onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                          className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                          placeholder={`Answer ${index + 1}`}
                        />
                        <input
                          type="number"
                          value={answer.points}
                          onChange={(e) => handleAnswerChange(index, 'points', parseInt(e.target.value) || 0)}
                          className="w-20 p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                          placeholder="Pts"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <motion.button
                    onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SafeIcon icon={FiSave} />
                    <span>{editingQuestion ? 'Update' : 'Save'}</span>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      resetForm();
                      setShowAddForm(false);
                      setEditingQuestion(null);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SafeIcon icon={FiX} />
                    <span>Cancel</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Questions List */}
        {activeTab !== 'settings' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">
              {activeTab === 'fast-money' ? 'Fast Money Questions' : 'Regular Questions'} ({currentQuestions.length})
            </h3>

            {currentQuestions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-2 flex items-center space-x-2">
                      {activeTab === 'fast-money' && <SafeIcon icon={FiZap} className="text-yellow-400" />}
                      <span>#{index + 1}: {question.question}</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {question.answers.map((answer, answerIndex) => (
                        <div key={answerIndex} className="flex justify-between items-center bg-white/5 rounded-lg p-2">
                          <span className="text-white">{answer.text}</span>
                          <span className="text-yellow-400 font-bold">{answer.points} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <motion.button
                      onClick={() => handleEditQuestion(question)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SafeIcon icon={FiEdit2} />
                    </motion.button>

                    <motion.button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SafeIcon icon={FiTrash2} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}

            {currentQuestions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-white/50 text-lg">
                  No {activeTab === 'fast-money' ? 'Fast Money' : 'regular'} questions added yet.
                </div>
                <div className="text-white/30 text-sm mt-2">Click "Add Question" to get started!</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;