
import React from 'react';
import { AppView } from '../types';

interface HeaderProps {
  onViewChange: (view: AppView) => void;
}

const Header: React.FC<HeaderProps> = ({ onViewChange }) => {
  return (
    <header className="h-16 border-b border-gray-800 bg-gray-950/50 backdrop-blur-md flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange(AppView.DASHBOARD)}>
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
          Lumina AI
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-400">Gemini 3 Pro Active</span>
        </div>
        
        <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
