
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen, onToggle }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    )},
    { id: AppView.CHAT, label: 'Grounded Chat', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
    )},
    { id: AppView.IMAGE_GEN, label: 'Image Forge', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    )},
    { id: AppView.LIVE, label: 'Live Pulse', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
    )},
  ];

  return (
    <aside className={`transition-all duration-300 ease-in-out border-r border-gray-800 bg-gray-950 flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex-1 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 transition-colors relative group
              ${currentView === item.id ? 'text-indigo-400 bg-indigo-600/10' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            <div className="shrink-0">{item.icon}</div>
            <span className={`font-medium transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {item.label}
            </span>
            {currentView === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
            )}
            {!isOpen && (
              <div className="absolute left-20 bg-gray-900 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap border border-gray-700">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 transition-colors"
        >
          <svg 
            className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
