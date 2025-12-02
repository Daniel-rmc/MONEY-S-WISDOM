import React from 'react';
import { Quote } from '../types';

interface QuoteCardProps {
  quote: Quote;
  index: number;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote, index }) => {
  return (
    <div 
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-amber-100 flex flex-col h-full transform hover:-translate-y-1"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
          {quote.category}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.01697 21L5.01697 18C5.01697 16.8954 5.9124 16 7.01697 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.01697C5.46468 8 5.01697 8.44772 5.01697 9V11C5.01697 11.5523 4.56925 12 4.01697 12H3.01697V5H13.017V15C13.017 18.3137 10.3307 21 7.01697 21H5.01697Z" />
        </svg>
      </div>
      
      <blockquote className="flex-grow font-serif text-gray-800 text-lg leading-relaxed mb-4">
        "{quote.text}"
      </blockquote>
      
      <div className="mt-auto pt-4 border-t border-amber-50">
        <p className="text-sm text-gray-500 italic">
          💡 {quote.interpretation}
        </p>
      </div>
    </div>
  );
};
