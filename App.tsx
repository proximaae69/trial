
import React, { useState, useCallback } from 'react';
import { AppView } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import ImageGenerator from './components/ImageGenerator';
import LiveSession from './components/LiveSession';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderView = useCallback(() => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onNavigate={setCurrentView} />;
      case AppView.CHAT:
        return <ChatInterface />;
      case AppView.IMAGE_GEN:
        return <ImageGenerator />;
      case AppView.LIVE:
        return <LiveSession />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  }, [currentView]);

  return (
    <div className="flex h-screen w-full bg-gray-950 text-gray-100 overflow-hidden">
      {/* Sidebar - Desktop */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Header onViewChange={setCurrentView} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
