import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface SymbolSearchProps {
  onSymbolSelect: (symbol: string) => void;
  selectedSymbol: string;
}



const SymbolSearch: React.FC<SymbolSearchProps> = ({ onSymbolSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const delayDebounceFn = setTimeout(() => {
        fetchSuggestions();
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);



  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/search/symbols?q=${searchTerm}`);
      setSuggestions(response.data.symbols || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };



  const handleSymbolClick = (symbol: string) => {
    onSymbolSelect(symbol);
    setSearchTerm(symbol);
    setSuggestions([]);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 shadow-lg space-y-4">

      
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          placeholder="Search stock symbol..."
          className="block w-full px-4 py-3 border border-gray-600 rounded-lg leading-5 bg-gray-800/50 placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
          style={{ color: 'var(--text-primary)' }}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-blue-400"></div>
          </div>
        )}
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded-lg mt-2 max-h-60 overflow-auto shadow-xl">
            {suggestions.map((symbol) => (
              <li key={symbol}>
                <button
                  onClick={() => handleSymbolClick(symbol)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-700 focus:bg-blue-700 focus:outline-none transition-colors font-medium border-b border-gray-700 last:border-b-0"
                  style={{ backgroundColor: '#2563eb', color: 'white' }}
                >
                  {symbol}
                </button>
              </li>
            ))}
          </ul>
        )}
        </div>


    </div>
  );
};

export default SymbolSearch;