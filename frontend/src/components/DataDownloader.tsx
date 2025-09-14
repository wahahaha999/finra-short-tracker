import React, { useState } from 'react';
import { Download, Loader2, Calendar } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface DataDownloaderProps {
  onDownloadComplete: () => void;
}

const DataDownloader: React.FC<DataDownloaderProps> = ({ onDownloadComplete }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [useCustomDate, setUseCustomDate] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const payload = useCustomDate && selectedDate ? { date: selectedDate } : {};
      const response = await axios.post(`${API_BASE_URL}/api/download`, payload, {
        timeout: 180000 // 3 minutes timeout
      });
      
      if (response.data.success) {
        setMessage(`✅ ${response.data.message}`);
        onDownloadComplete();
      } else {
        setMessage(`❌ ${response.data.message || 'Failed to download data'}`);
      }
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        setMessage(`❌ Download timed out. Large datasets may take several minutes to process.`);
      } else {
        const errorMsg = error.response?.data?.message || 'Error downloading data';
        if (errorMsg.includes('No data available')) {
          setMessage(`❌ ${errorMsg}. Try a recent weekday (FINRA data is not available on weekends).`);
        } else {
          setMessage(`❌ ${errorMsg}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getMaxDate = () => {
    const today = new Date();
    // FINRA data is available up to current date
    return today.toISOString().split('T')[0];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          fontWeight: '500'
        }}>
          <input
            type="checkbox"
            checked={useCustomDate}
            onChange={(e) => setUseCustomDate(e.target.checked)}
            style={{
              width: '1rem',
              height: '1rem',
              accentColor: 'var(--accent-blue)'
            }}
          />
          <span>Custom date</span>
        </label>
        
        {useCustomDate && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '6px',
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--border-primary)'
          }}>
            <Calendar className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={getMaxDate()}
              style={{
                padding: '0.25rem 0.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={handleDownload}
          disabled={loading || (useCustomDate && !selectedDate)}
          className="btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            borderRadius: '8px'
          }}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2" style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Downloading...' : (useCustomDate ? 'Download Date' : 'Download Latest')}
        </button>
        {message && (
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            backgroundColor: message.includes('✅') ? 'rgba(56, 161, 105, 0.1)' : 'rgba(229, 62, 62, 0.1)',
            color: message.includes('✅') ? 'var(--accent-green)' : 'var(--accent-red)',
            border: `1px solid ${message.includes('✅') ? 'var(--accent-green)' : 'var(--accent-red)'}`,
            opacity: 0.8
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataDownloader;