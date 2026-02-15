
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../types';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const urls = groundingChunks
        .map(chunk => chunk.web)
        .filter((web): web is { title: string; uri: string } => !!web);

      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "I'm sorry, I couldn't process that.",
        timestamp: new Date(),
        groundingUrls: urls
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Error: Failed to connect to the model. Please check your API configuration.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-6 pb-8 px-2" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-gray-800">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
               </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300">Ready for grounded exploration?</h3>
            <p className="max-w-xs mt-2">Ask me anything about current events, coding, or complex research.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-gray-900 text-gray-100 border border-gray-800 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sources:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingUrls.map((source, i) => (
                      <a 
                        key={i} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 text-indigo-400 rounded transition-colors border border-gray-700 flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {source.title.length > 20 ? source.title.substring(0, 20) + '...' : source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-900 rounded-2xl px-6 py-4 border border-gray-800 rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-gray-800 pt-6 bg-gray-950 sticky bottom-0">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search with Gemini..."
            className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 pr-14 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-widest font-bold">
          Powered by Gemini 3 Flash Preview & Google Search Grounding
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
