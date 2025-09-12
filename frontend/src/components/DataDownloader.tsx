import React, { useState } from 'react';
import { Download, Loader2, Calendar } from 'lucide-react';
import axios from 'axios';

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
      const response = await axios.post('http://localhost:3001/api/download', payload, {
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
    <div className="flex flex-col items-end space-y-2">
      <div className="flex items-center space-x-2">
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={useCustomDate}
            onChange={(e) => setUseCustomDate(e.target.checked)}
            className="rounded"
          />
          <span>Use custom date</span>
        </label>
        
        {useCustomDate && (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={getMaxDate()}
              className="px-2 py-1 border rounded text-sm"
            />
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={handleDownload}
          disabled={loading || (useCustomDate && !selectedDate)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Downloading... (may take 2-3 minutes)' : (useCustomDate ? 'Download Selected Date' : 'Download Latest Data')}
        </button>
        {message && (
          <span className={`text-sm ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
};

export default DataDownloader;