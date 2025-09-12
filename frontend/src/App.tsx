import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Calendar, Search } from 'lucide-react';
import DataDownloader from './components/DataDownloader';
import SymbolSearch from './components/SymbolSearch';
import SymbolChart from './components/SymbolChart';
import TopShortedStocks from './components/TopShortedStocks';
import StatsDashboard from './components/StatsDashboard';
import DataManagement from './components/DataManagement';
import './App.css';

interface Stats {
  total_records: number;
  unique_symbols: number;
  unique_dates: number;
  earliest_date: string;
  latest_date: string;
}

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDownloadComplete = () => {
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dark Pool Intelligence</h1>
                <p className="text-sm text-gray-600">Real-time short sale data analysis</p>
              </div>
            </div>
            <DataDownloader onDownloadComplete={handleDownloadComplete} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsDashboard stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Symbol Analysis
              </h2>
              <SymbolSearch 
                onSymbolSelect={setSelectedSymbol} 
                selectedSymbol={selectedSymbol} 
              />
            </div>

            <div className="mt-6">
              <TopShortedStocks />
            </div>

            <div className="mt-6">
              <DataManagement onDataCleared={fetchStats} />
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedSymbol ? (
              <SymbolChart symbol={selectedSymbol} />
            ) : (
              <div className="bg-white rounded-lg shadow p-6 h-full flex items-center justify-center">
                <div className="text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Symbol</h3>
                  <p className="text-gray-600">Search for a stock symbol to view short sale data and trends.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
