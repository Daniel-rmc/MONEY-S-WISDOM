import React, { useEffect, useState } from 'react';
import { Quote, ViewState } from './types';
import { fetchBookQuotes } from './services/geminiService';
import { QuoteCard } from './components/QuoteCard';
import { ChatInterface } from './components/ChatInterface';
import { LedgerInterface } from './components/LedgerInterface';
import { SuccessJournal } from './components/SuccessJournal';
import { BookOpen, MessageCircle, Sparkles, Loader2, RefreshCw, Wallet, NotebookPen } from 'lucide-react';

const App: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState<ViewState>(ViewState.WALL);
  const [error, setError] = useState<string | null>(null);

  const loadQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBookQuotes();
      setQuotes(data);
    } catch (e) {
      setError("Unable to load quotes. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  return (
    <div className="min-h-screen font-sans text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setViewState(ViewState.WALL)}>
            <div className="bg-amber-500 p-2 rounded-lg text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-900 leading-none">
                小狗钱钱
              </h1>
              <p className="text-xs text-amber-600 font-medium tracking-wide">MONEY'S WISDOM</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setViewState(ViewState.LEDGER)}
              className="flex items-center space-x-2 bg-white border border-amber-200 hover:bg-amber-50 text-amber-900 px-4 py-2 rounded-full transition-all duration-300 font-medium shadow-sm text-sm md:text-base"
            >
              <Wallet className="w-4 h-4 text-amber-600" />
              <span>我的账本</span>
            </button>

            <button 
              onClick={() => setViewState(ViewState.JOURNAL)}
              className="flex items-center space-x-2 bg-white border border-amber-200 hover:bg-amber-50 text-amber-900 px-4 py-2 rounded-full transition-all duration-300 font-medium shadow-sm text-sm md:text-base"
            >
              <NotebookPen className="w-4 h-4 text-amber-600" />
              <span>成功日记</span>
            </button>

            <button 
              onClick={() => setViewState(ViewState.CHAT)}
              className="flex items-center space-x-2 bg-amber-100 hover:bg-amber-200 text-amber-900 px-4 py-2 rounded-full transition-all duration-300 font-medium text-sm md:text-base"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Money</span>
              <span className="sm:hidden">Chat</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pt-8">
        
        {/* Intro Section - Only show on Wall */}
        {viewState === ViewState.WALL && (
          <section className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-800">
              财富的智慧 <br/> 
              <span className="text-amber-500">源于思维的改变</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              "你可以把你的钱生出更多的钱，但这需要时间，也需要你去做一些事情。"
            </p>
            <button 
              onClick={loadQuotes}
              disabled={loading}
              className="inline-flex items-center space-x-2 text-amber-600 hover:text-amber-700 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <RefreshCw className="w-4 h-4"/>}
              <span className="text-sm font-semibold">Refresh Wisdom</span>
            </button>
          </section>
        )}

        {/* Loading State */}
        {loading && quotes.length === 0 && viewState === ViewState.WALL && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
            <p className="text-gray-500 animate-pulse">Consulting the wise dog...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && viewState === ViewState.WALL && (
          <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100">
            <p className="text-red-600 mb-2">{error}</p>
            <button 
              onClick={loadQuotes}
              className="text-red-700 font-bold hover:underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Quote Grid */}
        {!loading && !error && viewState === ViewState.WALL && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quotes.map((quote, index) => (
              <QuoteCard key={quote.id} quote={quote} index={index} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Chat Button (Mobile) */}
      <button 
        onClick={() => setViewState(ViewState.CHAT)}
        className="fixed bottom-6 right-6 md:hidden bg-amber-500 text-white p-4 rounded-full shadow-2xl hover:bg-amber-600 transition-transform hover:scale-110 z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Footer */}
      <footer className="mt-20 py-8 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Money's Wisdom. Inspired by Bodo Schäfer.</p>
        <p className="mt-1 font-medium text-amber-600/60">Created by Daniel_rmc</p>
        <div className="flex justify-center items-center mt-2 space-x-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Powered by Gemini 2.5 Flash</span>
        </div>
      </footer>

      {/* Chat Modal */}
      {viewState === ViewState.CHAT && (
        <ChatInterface onClose={() => setViewState(ViewState.WALL)} />
      )}

      {/* Ledger Modal */}
      {viewState === ViewState.LEDGER && (
        <LedgerInterface onClose={() => setViewState(ViewState.WALL)} />
      )}

      {/* Success Journal Modal */}
      {viewState === ViewState.JOURNAL && (
        <SuccessJournal onClose={() => setViewState(ViewState.WALL)} />
      )}
    </div>
  );
};

export default App;