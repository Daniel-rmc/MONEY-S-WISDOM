import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithMoneyTheDog } from '../services/geminiService';
import { Loader2, Send, PawPrint, X } from 'lucide-react';

interface ChatInterfaceProps {
  onClose: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '汪！你好，我是钱钱。你想了解关于如何实现财务自由的秘密吗？或者是想知道如何建立自信？告诉我你的困惑吧！',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Format history for Gemini API
    const history = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    try {
      const responseText = await chatWithMoneyTheDog(history, userMessage.text);
      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "汪...我好像没听懂。",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col h-[80vh] overflow-hidden border-4 border-amber-200">
        {/* Header */}
        <div className="bg-amber-400 p-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-full">
              <PawPrint className="text-amber-500 w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Money (钱钱)</h2>
              <p className="text-amber-100 text-xs">你的理财顾问</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-amber-500 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-amber-50/50 no-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-amber-500 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-amber-100 rounded-bl-none'
                }`}
              >
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-amber-100 rounded-2xl p-4 rounded-bl-none shadow-sm flex items-center space-x-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-amber-100">
          <div className="flex items-center space-x-2 bg-gray-50 rounded-full border border-amber-200 px-4 py-2 focus-within:ring-2 focus-within:ring-amber-400 transition-shadow">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Money about wealth..."
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`p-2 rounded-full ${
                !input.trim() || isTyping 
                  ? 'text-gray-300' 
                  : 'text-amber-500 hover:bg-amber-100'
              } transition-colors`}
            >
              {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
