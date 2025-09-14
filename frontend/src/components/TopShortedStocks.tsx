import React, { useState, useEffect } from 'react';
import { TrendingDown, Calendar } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

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
      const response = await axios.get(`${API_BASE_URL}/api/data/dates`);
      console.log('📅 Fetched dates from API:', response.data);
      if (response.data.success && response.data.dates.length > 0) {
        const dates = response.data.dates;
        console.log('📅 Setting available dates:', dates, 'Count:', dates.length);
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
      const response = await axios.get(`${API_BASE_URL}/api/data/top-shorted/${selectedDate}?limit=20`);
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
      <div className="card">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '8rem' 
        }}>
          <div style={{
            width: '1.5rem',
            height: '1.5rem',
            border: '2px solid var(--accent-blue)',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', color: 'var(--accent-red)' }}>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '1.5rem' 
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          margin: 0
        }}>
          <div style={{
            padding: '0.5rem',
            backgroundColor: 'var(--accent-red)',
            borderRadius: '8px',
            marginRight: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingDown className="h-5 w-5" style={{ color: 'white' }} />
          </div>
          Top Short Volume
        </h2>
        {availableDates.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                fontSize: '0.875rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              {availableDates.map(date => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {stocks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {stocks.slice(0, 10).map((stock, index) => (
            <div key={stock.symbol} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--border-primary)',
              transition: 'all 0.2s ease',
              cursor: 'default'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  backgroundColor: 'var(--accent-blue)',
                  borderRadius: '6px'
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: 'white'
                  }}>{index + 1}</span>
                </div>
                <span style={{
                  fontWeight: '700',
                  fontSize: '1.125rem',
                  color: 'var(--text-primary)'
                }}>{stock.symbol}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: 'var(--accent-green)'
                }}>
                  {stock.short_ratio.toFixed(1)}%
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  fontWeight: '500'
                }}>
                  {stock.short_volume.toLocaleString()} shares
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          color: 'var(--text-muted)', 
          padding: '2rem 0' 
        }}>
          <TrendingDown className="h-8 w-8 mx-auto" style={{ 
            marginBottom: '0.5rem', 
            opacity: 0.5 
          }} />
          <p style={{ fontSize: '0.875rem', margin: 0 }}>No data available for selected date</p>
        </div>
      )}

      {stocks.length > 10 && (
        <div className="mt-4 text-center">
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            Showing top 10 of {stocks.length} stocks
          </p>
        </div>
      )}
    </div>
  );
};

export default TopShortedStocks;