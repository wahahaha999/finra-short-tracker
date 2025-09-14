import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface DataManagementProps {
  onDataCleared?: () => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ onDataCleared }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [daysToKeep, setDaysToKeep] = useState(8);
  const [message, setMessage] = useState('');

  const handleClearOldData = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await axios.delete('http://localhost:3001/api/data/clear-old', {
        data: { daysToKeep }
      });
      
      if (response.data.success) {
        setMessage(`✅ ${response.data.message}`);
        setShowConfirmDialog(false);
        if (onDataCleared) {
          onDataCleared();
        }
      }
    } catch (error: any) {
      console.error('Error clearing old data:', error);
      setMessage(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllData = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await axios.delete('http://localhost:3001/api/data/clear');
      
      if (response.data.success) {
        setMessage(`✅ ${response.data.message}`);
        setShowClearAllDialog(false);
        if (onDataCleared) {
          onDataCleared();
        }
      }
    } catch (error: any) {
      console.error('Error clearing all data:', error);
      setMessage(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)', paddingLeft: '1rem' }}>Data Management</h2>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="bg-gray-800/50 rounded-lg border border-gray-600/50" style={{ padding: '1rem' }}>
          <label className="block text-sm font-semibold" style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Days of data to keep:
          </label>
          <div className="flex items-center space-x-4" style={{ marginBottom: '1rem' }}>
            <input
              type="number"
              min="1"
              max="365"
              value={daysToKeep}
              onChange={(e) => setDaysToKeep(parseInt(e.target.value) || 30)}
              className="w-24 px-3 py-2 border border-gray-600 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              style={{ color: 'var(--text-primary)' }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)', marginLeft: '0.75rem' }}>days</span>
          </div>
        </div>
        
        <div className="flex gap-4" style={{ marginTop: '-2rem', paddingBottom: '1rem', paddingLeft: '1rem' }}>
          <button
            onClick={() => setShowConfirmDialog(true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            style={{ background: 'linear-gradient(to right, #dc2626, #b91c1c)', color: 'white !important' }}
          >
            <Trash2 className="w-4 h-4" />
            {isLoading ? 'Clearing...' : 'Clear Old Data'}
          </button>
          
          <button
            onClick={() => setShowClearAllDialog(true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            style={{ background: 'linear-gradient(to right, #991b1b, #7f1d1d)', color: 'white !important', marginLeft: '1rem' }}
          >
            <Trash2 className="w-4 h-4" />
            {isLoading ? 'Clearing...' : 'Clear All Data'}
          </button>
        </div>
        
        {message && (
          <div className={`p-4 rounded-lg text-sm mt-6 ${
            message.startsWith('✅') 
              ? 'bg-green-900/30 border border-green-800' 
              : 'bg-red-900/30 border border-red-800'
          }`} style={{ color: 'var(--text-primary)' }}>
            {message}
          </div>
        )}
      </div>

      {/* Clear Old Data Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Confirm Data Deletion</h3>
            </div>
            
            <p className="mb-6" style={{ color: 'var(--text-primary)' }}>
              Are you sure you want to delete all data older than {daysToKeep} days? 
              This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 rounded-md transition-colors"
                style={{ backgroundColor: '#2563eb', color: 'white !important' }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearOldData}
                disabled={isLoading}
                className="px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                style={{ backgroundColor: '#dc2626', color: 'white !important' }}
              >
                {isLoading ? 'Deleting...' : 'Delete Old Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Data Confirmation Dialog */}
      {showClearAllDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Clear All Data</h3>
            </div>
            
            <p className="mb-6" style={{ color: 'var(--text-primary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Warning:</strong> This will permanently delete ALL data from the database. 
              This action cannot be undone and will remove all historical records.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearAllDialog(false)}
                className="px-4 py-2 rounded-md transition-colors"
                style={{ backgroundColor: '#2563eb', color: 'white !important' }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllData}
                disabled={isLoading}
                className="px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                style={{ backgroundColor: '#991b1b', color: 'white !important' }}
              >
                {isLoading ? 'Deleting...' : 'Clear All Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagement;