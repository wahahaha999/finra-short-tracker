import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from 'axios';

interface SymbolChartProps {
  symbol: string;
}

interface ChartData {
  date: string;
  short_volume: number;
  buy_volume: number;
  total_volume: number;
  short_ratio: number;
}

const SymbolChart: React.FC<SymbolChartProps> = ({ symbol }) => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`http://localhost:3001/api/data/symbol/${symbol}?limit=90`);
      if (response.data.success) {
        const sortedData = response.data.data
          .map((item: any) => ({
            date: item.date,
            short_volume: item.short_volume,
            buy_volume: item.total_volume - item.short_volume,
            total_volume: item.total_volume,
            short_ratio: item.short_ratio
          }))
          .sort((a: ChartData, b: ChartData) => a.date.localeCompare(b.date));
        
        setData(sortedData);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <p>No data available for {symbol}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{symbol} - Dark Pool Analysis</h2>
        <p className="text-sm text-gray-600">Last {data.length} days of short sale data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Volume Trends</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.slice(4, 6) + '/' + value.slice(6, 8)}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => `Date: ${value}`}
                formatter={(value: number) => value.toLocaleString()}
              />
              <Line 
                type="monotone" 
                dataKey="short_volume" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Bought"
              />
              <Line 
                type="monotone" 
                dataKey="buy_volume" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Sold"
              />
              <Line 
                type="monotone" 
                dataKey="total_volume" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Total Volume"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Percentage Buy</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.slice(4, 6) + '/' + value.slice(6, 8)}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => `Date: ${value}`}
                formatter={(value: number) => `${value.toFixed(2)}%`}
              />
              <Bar 
                dataKey="short_ratio" 
                fill="#8b5cf6"
                name="Short Ratio"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Dark Pool Data</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bought</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sold</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Volume</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pct Buy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.slice(-10).reverse().map((item, index) => {
                const buyVolume = item.total_volume - item.short_volume;
                return (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {item.date.slice(4, 6)}/{item.date.slice(6, 8)}/{item.date.slice(0, 4)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.short_volume.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{buyVolume.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.total_volume.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.short_ratio.toFixed(2)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SymbolChart;