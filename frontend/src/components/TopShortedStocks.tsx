import React, { useState, useEffect } from 'react';
import { TrendingDown, Calendar } from 'lucide-react';
import axios from 'axios';

interface StockData {
  symbol: string;
  short_volume: number;
  total_volume: number;
  short_ratio: number;
}

const TopShortedStocks: React.FC = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    fetchAvailableDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchTopStocks();
    }
  }, [selectedDate]);

  const fetchAvailableDates = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/data/dates');
      if (response.data.success && response.data.dates.length > 0) {
        const dates = response.data.dates;
        setAvailableDates(dates);
        setSelectedDate(dates[0]); // Default to latest date
      }
    } catch (error) {
      console.error('Error fetching dates:', error);
    }
  };

  const fetchTopStocks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`http://localhost:3001/api/data/top-shorted/${selectedDate}?limit=20`);
      if (response.data.success) {
        setStocks(response.data.data);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch top shorted stocks');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return `${month}/${day}/${year}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <TrendingDown className="h-5 w-5 mr-2" />
          Top Short volume in Dark Pool (Bought)
        </h2>
        {availableDates.length > 0 && (
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            {availableDates.map(date => (
              <option key={date} value={date}>
                {formatDate(date)}
              </option>
            ))}
          </select>
        )}
      </div>

      {stocks.length > 0 ? (
        <div className="space-y-2">
          {stocks.slice(0, 10).map((stock, index) => (
            <div key={stock.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                <span className="font-medium text-gray-900">{stock.symbol}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {stock.short_ratio.toFixed(2)}%
                </div>
                <div className="text-xs text-gray-500">
                  {stock.short_volume.toLocaleString()} shares
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <TrendingDown className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No data available for selected date</p>
        </div>
      )}

      {stocks.length > 10 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Showing top 10 of {stocks.length} stocks
          </p>
        </div>
      )}
    </div>
  );
};

export default TopShortedStocks;