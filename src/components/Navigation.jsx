import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSettings, FiPlay, FiHome } = FiIcons;

function Navigation() {
  const location = useLocation();
  const { state } = useGame();
  
  const navItems = [
    { path: '/game', label: 'Game Show', icon: FiPlay },
    { path: '/admin', label: 'Admin Panel', icon: FiSettings }
  ];

  return (
    <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiHome} className="text-yellow-400 text-2xl" />
            <h1 className="text-2xl font-bold text-white">{state.gameSettings.title}</h1>
          </div>
          
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className="relative">
                <motion.div
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    location.pathname === item.path
                      ? 'bg-yellow-500 text-black'
                      : 'text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SafeIcon icon={item.icon} className="text-lg" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;