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
      <div className="card">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center" style={{ color: 'var(--text-primary)' }}>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card">
        <div className="text-center" style={{ color: 'var(--text-primary)' }}>
          <p>No data available for {symbol}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{symbol} - Dark Pool Analysis</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Last {data.length} days of short sale data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Volume Trends</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#d1d5db' }}
                tickFormatter={(value) => value.slice(4, 6) + '/' + value.slice(6, 8)}
                stroke="#6b7280"
              />
              <YAxis tick={{ fontSize: 12, fill: '#d1d5db' }} stroke="#6b7280" />
              <Tooltip 
                labelFormatter={(value) => `Date: ${value}`}
                formatter={(value: number) => value.toLocaleString()}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="short_volume" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Bought"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="buy_volume" 
                stroke="#ef4444" 
                strokeWidth={3}
                name="Sold"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="total_volume" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Total Volume"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Percentage Buy</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#d1d5db' }}
                tickFormatter={(value) => value.slice(4, 6) + '/' + value.slice(6, 8)}
                stroke="#6b7280"
              />
              <YAxis tick={{ fontSize: 12, fill: '#d1d5db' }} stroke="#6b7280" />
              <Tooltip 
                labelFormatter={(value) => `Date: ${value}`}
                formatter={(value: number) => `${value.toFixed(2)}%`}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb',
                  boxShadow: 'none'
                }}
                labelStyle={{
                  color: '#f9fafb',
                  backgroundColor: 'transparent'
                }}
                wrapperStyle={{
                  backgroundColor: 'transparent',
                  outline: 'none'
                }}
                cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
              />
              <Bar 
                dataKey="short_ratio" 
                fill="#8b5cf6"
                name="Short Ratio"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold flex items-center" style={{ color: '#60a5fa', paddingTop: '1rem', paddingBottom: '0.5rem' }}>
          <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
          Recent Dark Pool Data
        </h3>
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-700" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-12 py-4 text-center text-xs font-semibold uppercase tracking-wider border-r border-gray-700" style={{ color: 'var(--text-primary)', textAlign: 'center', width: '12%' }}>Date</th>
                  <th className="px-12 py-4 text-center text-xs font-semibold uppercase tracking-wider border-r border-gray-700" style={{ color: 'var(--text-primary)', textAlign: 'center', width: '10%' }}>Symbol</th>
                  <th className="px-12 py-4 text-center text-xs font-semibold uppercase tracking-wider border-r border-gray-700" style={{ color: 'var(--text-primary)', textAlign: 'center', width: '15%' }}>Bought</th>
                  <th className="px-12 py-4 text-center text-xs font-semibold uppercase tracking-wider border-r border-gray-700" style={{ color: 'var(--text-primary)', textAlign: 'center', width: '15%' }}>Sold</th>
                  <th className="px-12 py-4 text-center text-xs font-semibold uppercase tracking-wider border-r border-gray-700" style={{ color: 'var(--text-primary)', textAlign: 'center', width: '15%' }}>Total Volume</th>
                  <th className="px-12 py-4 text-center text-xs font-semibold uppercase tracking-wider border-r border-gray-700" style={{ color: 'var(--text-primary)', textAlign: 'center', width: '12%' }}>Buy Ratio</th>
                  <th className="px-12 py-4 text-center text-xs font-semibold uppercase tracking-wider border-r border-gray-700" style={{ color: 'var(--text-primary)', textAlign: 'center', width: '11%' }}>Pct Buy</th>
                  <th className="px-12 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)', textAlign: 'center', width: '10%' }}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {data.slice(-10).reverse().map((item, index) => {
                  const buyVolume = item.total_volume - item.short_volume;
                  const buyRatio = (item.short_volume / buyVolume);
                  const shortRatio = (item.short_volume / item.total_volume);
                  const isEven = index % 2 === 0;
                  // Remove unused variable
                  const formattedDate = `${item.date.slice(4, 6)}/${item.date.slice(6, 8)}/${item.date.slice(0, 4)}`;
                  const reversedData = data.slice(-10).reverse();
                  const previousItem = reversedData[index + 1];
                  const isVolumeIncreased = previousItem && item.total_volume > previousItem.total_volume;
                  const isBuyRatioHigh = buyRatio > 1;
        const isPctBuyHigh = (shortRatio * 100) > 55;
                  const isBoughtIncreased = previousItem && item.short_volume > previousItem.short_volume;
                  const allConditionsGreen = isBoughtIncreased && isVolumeIncreased && isBuyRatioHigh && isPctBuyHigh;
                  const isTrimCondition = buyRatio < 1 && (shortRatio * 100) < 50;
                  return (
                    <tr key={index} className="hover:bg-gray-600 transition-colors duration-150" style={{ backgroundColor: isEven ? '#111827' : '#374151' }}>
                       <td className="px-12 py-4 text-sm font-medium text-center border-r border-gray-700" style={{ color: 'var(--text-primary)', textAlign: 'center' }}>
                         {formattedDate}
                       </td>
                       <td className="px-12 py-4 text-sm text-center border-r border-gray-700" style={{ textAlign: 'center' }}>
                      <span className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{symbol}</span>
                       </td>
                       <td className="px-12 py-4 text-sm text-center border-r border-gray-700" style={{ color: isBoughtIncreased ? '#10b981' : 'var(--text-primary)', fontWeight: isBoughtIncreased ? 'bold' : 'normal', textAlign: 'center' }}>
                         {item.short_volume.toLocaleString()}
                       </td>
                       <td className="px-12 py-4 text-sm font-semibold text-center border-r border-gray-700" style={{ color: 'var(--text-primary)', textAlign: 'center' }}>
                         {buyVolume.toLocaleString()}
                       </td>
                       <td className="px-12 py-4 text-sm font-semibold text-center border-r border-gray-700" style={{ color: isVolumeIncreased ? '#10b981' : 'var(--text-primary)', fontWeight: isVolumeIncreased ? 'bold' : 'normal', textAlign: 'center' }}>
                         {item.total_volume.toLocaleString()}
                       </td>
                       <td className="px-12 py-4 text-sm font-medium text-center border-r border-gray-700" style={{ color: isBuyRatioHigh ? '#10b981' : 'var(--text-primary)', fontWeight: isBuyRatioHigh ? 'bold' : 'normal', textAlign: 'center' }}>
                         {buyRatio.toFixed(3)}
                       </td>
                       <td className="px-12 py-4 text-sm font-medium text-center border-r border-gray-700" style={{ color: isPctBuyHigh ? '#10b981' : 'var(--text-primary)', fontWeight: isPctBuyHigh ? 'bold' : 'normal', textAlign: 'center' }}>
                         {(shortRatio * 100).toFixed(1)}%
                       </td>
                       <td className="px-12 py-4 text-sm text-center" style={{ textAlign: 'center' }}>
                         {allConditionsGreen ? (
                           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-900/50 border border-green-700" style={{ color: '#10b981', fontWeight: 'bold', fontSize: '14px' }}>
                             BUY
                           </span>
                         ) : isTrimCondition ? (
                           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-900/50 border border-red-700" style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '14px' }}>
                             TRIM
                           </span>
                         ) : (
                           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-900/50 border border-gray-700" style={{ color: 'white' }}>
                             Neutral
                           </span>
                         )}
                       </td>
                     </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymbolChart;