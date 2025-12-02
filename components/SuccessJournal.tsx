import React, { useState, useEffect } from 'react';
import { X, BookHeart, CheckCircle2, Calendar, Trophy, Sparkles, Trash2, Save } from 'lucide-react';
import { JournalEntry } from '../types';

interface SuccessJournalProps {
  onClose: () => void;
}

const STORAGE_KEY = 'moneys-wisdom-journal-v1';

export const SuccessJournal: React.FC<SuccessJournalProps> = ({ onClose }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [inputs, setInputs] = useState<string[]>(['', '', '', '', '']);
  const [isSavedToday, setIsSavedToday] = useState(false);

  // Load from storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEntries(parsed);
        
        // Check if we already have an entry for today
        const today = new Date().toDateString();
        const hasToday = parsed.some((e: JournalEntry) => new Date(e.timestamp).toDateString() === today);
        setIsSavedToday(hasToday);
      } catch (e) {
        console.error("Failed to parse journal data", e);
      }
    }
  }, []);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleSave = () => {
    // Filter out empty lines, but we encourage filling all 5
    const validItems = inputs.filter(i => i.trim().length > 0);
    
    if (validItems.length === 0) {
      alert("请至少记录一件让你感到骄傲的事情。");
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      items: inputs // We save all inputs to preserve blank lines if they want to fill them later, or we could filter. Let's save what they typed.
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    
    setInputs(['', '', '', '', '']);
    setIsSavedToday(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这篇日记吗？")) {
      const updatedEntries = entries.filter(e => e.id !== id);
      setEntries(updatedEntries);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
      
      // Re-check today status
      const today = new Date().toDateString();
      const hasToday = updatedEntries.some((e: JournalEntry) => new Date(e.timestamp).toDateString() === today);
      setIsSavedToday(hasToday);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    });
  };

  const filledCount = inputs.filter(i => i.trim().length > 0).length;

  return (
    <div className="fixed inset-0 bg-amber-50 z-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-8 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-100 p-3 rounded-xl">
              <BookHeart className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900">成功日记</h2>
              <p className="text-amber-600">每天记录5件成功小事，建立强大的自信心</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white hover:bg-amber-100 rounded-full shadow-sm transition-colors border border-amber-200">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Today's Input */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden relative">
              <div className="bg-amber-500 p-4 text-white flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-bold text-lg">今天写点什么？</span>
                </div>
                <span className="text-amber-100 text-sm">{new Date().toLocaleDateString()}</span>
              </div>
              
              <div className="p-6 md:p-8">
                {isSavedToday ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="inline-block bg-green-100 p-4 rounded-full mb-2">
                      <Trophy className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">太棒了！</h3>
                    <p className="text-gray-600">你已经完成了今天的成功日记。<br/>自信心 +1 ✨</p>
                    <button 
                      onClick={() => setIsSavedToday(false)}
                      className="text-amber-600 hover:text-amber-700 font-bold underline mt-4"
                    >
                      我想再记一条
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-500 italic mb-6 text-sm">
                      "无论大小，只要是你觉得做到了、做好了的事情，都值得被记录。" —— 钱钱
                    </p>
                    
                    <div className="space-y-4">
                      {[0, 1, 2, 3, 4].map((index) => (
                        <div key={index} className="flex items-center space-x-3 group">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                            inputs[index].trim() ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {index + 1}
                          </div>
                          <input
                            type="text"
                            value={inputs[index]}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            placeholder={index === 0 ? "例如：今天我坚持跑了3公里..." : "还有什么值得骄傲的？"}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all"
                          />
                          {inputs[index].trim() && <CheckCircle2 className="w-5 h-5 text-green-500 animate-in zoom-in" />}
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-xs text-gray-400 font-medium">
                        已填写 {filledCount}/5 项
                      </div>
                      <button
                        onClick={handleSave}
                        className={`flex items-center space-x-2 px-8 py-3 rounded-full font-bold text-white transition-all transform active:scale-95 ${
                          filledCount > 0 
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-md hover:shadow-lg' 
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                        disabled={filledCount === 0}
                      >
                        <Save className="w-5 h-5" />
                        <span>保存日记</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quote of the day for confidence */}
            <div className="bg-amber-100 rounded-xl p-6 border border-amber-200">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-amber-800 mb-1">为什么要写成功日记？</h4>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    你的自信程度决定了你是否相信自己的能力，是否相信自己。如果你不相信自己，你根本不会开始去行动。成功日记能帮助你建立一个装满自信的储蓄罐。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: History */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <HistoryIcon className="w-5 h-5 text-gray-500" />
              <span>过往记录</span>
            </h3>

            <div className="space-y-4">
              {entries.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookHeart className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-400">还没有日记记录<br/>今天开始第一篇吧！</p>
                </div>
              ) : (
                entries.map((entry) => (
                  <div key={entry.id} className="bg-white rounded-xl p-5 shadow-sm border border-amber-50 hover:shadow-md transition-shadow relative group">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
                      <span className="font-bold text-amber-600 text-lg">
                        {formatDate(entry.timestamp)}
                      </span>
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {entry.items.map((item, idx) => (
                        item.trim() && (
                          <li key={idx} className="flex items-start space-x-3 text-gray-700">
                            <span className="flex-shrink-0 w-5 h-5 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        )
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const HistoryIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 3v5h5"/>
    <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
    <path d="M12 7v5l4 2"/>
  </svg>
);
