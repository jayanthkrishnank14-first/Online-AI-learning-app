import React, { useState, useRef, useEffect } from 'react';
import { MessageCircleIcon, SendIcon } from './Icons';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AssistantChatProps {
  context: string;
}

const AssistantChat: React.FC<AssistantChatProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hi! I'm your AI tutor. I've analyzed this lesson. Is there anything specific you found confusing, or shall I ask you a question to test your knowledge?", timestamp: Date.now() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Format history for Gemini
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await getChatResponse(history, userMsg.text, context);
    
    const aiMsg: ChatMessage = { role: 'model', text: responseText || "I didn't catch that.", timestamp: Date.now() };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-80 sm:w-96 mb-6 overflow-hidden flex flex-col h-[550px] animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex justify-between items-center shadow-md z-10">
            <h3 className="font-bold flex items-center gap-2 text-sm tracking-wide">
              <MessageCircleIcon className="w-5 h-5" /> AI TUTOR ASSISTANT
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <span className="text-2xl leading-none">&times;</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 rounded-full px-4 py-2 text-xs font-medium text-slate-500 animate-pulse shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex gap-2 relative">
                <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..."
                className="flex-1 px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm transition-all"
                />
                <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 active:scale-95"
                >
                <SendIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="text-[10px] text-center text-slate-400 mt-2 font-medium">
                AI can make mistakes. Please check important info.
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
            isOpen ? 'bg-slate-800 rotate-90' : 'bg-indigo-600 hover:bg-indigo-700'
        } text-white`}
      >
        {isOpen ? (
            <span className="text-xl font-bold leading-none block h-8 w-8 flex items-center justify-center">&times;</span>
        ) : (
            <MessageCircleIcon className="w-8 h-8" />
        )}
      </button>
    </div>
  );
};

export default AssistantChat;