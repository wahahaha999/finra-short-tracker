import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';

interface SymbolSearchProps {
  onSymbolSelect: (symbol: string) => void;
  selectedSymbol: string;
}

interface SymbolData {
  symbol: string;
  date: string;
  short_volume: number;
  total_volume: number;
  short_ratio: number;
}

const SymbolSearch: React.FC<SymbolSearchProps> = ({ onSymbolSelect, selectedSymbol }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentData, setRecentData] = useState<SymbolData | null>(null);

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

  useEffect(() => {
    if (selectedSymbol) {
      fetchRecentData();
    }
  }, [selectedSymbol]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/search/symbols?q=${searchTerm}`);
      setSuggestions(response.data.symbols || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentData = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/data/symbol/${selectedSymbol}?limit=1`);
      if (response.data.data && response.data.data.length > 0) {
        setRecentData(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching recent data:', error);
    }
  };

  const handleSymbolClick = (symbol: string) => {
    onSymbolSelect(symbol);
    setSearchTerm(symbol);
    setSuggestions([]);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          placeholder="Search stock symbol..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        )}
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
            {suggestions.map((symbol) => (
              <li key={symbol}>
                <button
                  onClick={() => handleSymbolClick(symbol)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  {symbol}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedSymbol && recentData && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">{selectedSymbol}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Latest Date:</span>
              <span className="font-medium">{recentData.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bought:</span>
              <span className="font-medium">{recentData.short_volume.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sold:</span>
              <span className="font-medium">{(recentData.total_volume - recentData.short_volume).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Volume:</span>
              <span className="font-medium">{recentData.total_volume.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pct Buy:</span>
              <span className="font-medium">{recentData.short_ratio}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymbolSearch;