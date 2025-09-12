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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trash2 className="w-5 h-5 text-red-600" />
        <h2 className="text-xl font-semibold text-gray-800">Data Management</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Days of data to keep:
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={daysToKeep}
            onChange={(e) => setDaysToKeep(parseInt(e.target.value) || 30)}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-600">days</span>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirmDialog(true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {isLoading ? 'Clearing...' : 'Clear Old Data'}
          </button>
          
          <button
            onClick={() => setShowClearAllDialog(true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {isLoading ? 'Clearing...' : 'Clear All Data'}
          </button>
        </div>
        
        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.startsWith('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Clear Old Data Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Data Deletion</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete all data older than {daysToKeep} days? 
              This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearOldData}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Deleting...' : 'Delete Old Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Data Confirmation Dialog */}
      {showClearAllDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Clear All Data</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              <strong>Warning:</strong> This will permanently delete ALL data from the database. 
              This action cannot be undone and will remove all historical records.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearAllDialog(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllData}
                disabled={isLoading}
                className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 disabled:opacity-50 transition-colors"
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