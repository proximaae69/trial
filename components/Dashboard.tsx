
import React from 'react';
import { AppView } from '../types';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const cards = [
    {
      id: AppView.CHAT,
      title: 'Grounded Chat',
      description: 'Experience search-grounded reasoning. Perfect for research, coding, and real-time facts.',
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      color: 'blue'
    },
    {
      id: AppView.IMAGE_GEN,
      title: 'Image Forge',
      description: 'State-of-the-art visual creation powered by Gemini 2.5 Flash Image.',
      icon: (
        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'purple'
    },
    {
      id: AppView.LIVE,
      title: 'Live Pulse',
      description: 'Real-time low-latency voice and visual conversation with Gemini.',
      icon: (
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: 'green'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <div className="mb-12">
        <h2 className="text-4xl font-bold mb-4 tracking-tight">Welcome to the future of AI.</h2>
        <p className="text-xl text-gray-400">Select a module to start exploring the capabilities of Gemini 3 & 2.5.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className="group p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 hover:bg-gray-800/50 transition-all text-left flex flex-col items-start gap-4 shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            <div className={`p-4 rounded-xl bg-${card.color}-500/10 border border-${card.color}-500/20 group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{card.title}</h3>
              <p className="text-gray-400 leading-relaxed">{card.description}</p>
            </div>
            <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-semibold text-indigo-400">
              Launch Module 
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-purple-900/10 border border-indigo-500/20">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-4">Multi-Modal Awareness</h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              Lumina AI leverages the latest Gemini models to understand text, images, and audio in a single cohesive environment. 
              Built with performance and user experience at its core.
            </p>
            <div className="flex gap-4">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">GEMINI 3 PRO</span>
              <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20">GEMINI 2.5 FLASH</span>
            </div>
          </div>
          <div className="w-full md:w-64 aspect-square bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden relative group">
             <img src="https://picsum.photos/seed/lumina/400/400" alt="AI Abstract" className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" />
             <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
