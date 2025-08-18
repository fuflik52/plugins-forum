import React from 'react';
import { Search, Sparkles } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search plugins..." 
}) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto group">
      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
        <Search className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input pl-16 pr-16"
        placeholder={placeholder}
      />
      
      <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
          <span className="text-sm text-gray-400 font-medium">AI Powered</span>
        </div>
      </div>
      
      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
    </div>
  );
};

