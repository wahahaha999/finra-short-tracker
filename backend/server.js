const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const NeonDataService = require('./neon-dataService');
const { runDailyDownload } = require('./neon-cron-job');

const dataService = new NeonDataService();

// Request deduplication to prevent multiple simultaneous downloads
const activeDownloads = new Map();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Download data for a specific date
app.post('/api/download', async (req, res) => {
  try {
    const date = req.body?.date;
    let targetDate;
    
    if (date) {
      targetDate = new Date(date);
    } else {
      targetDate = dataService.getYesterdayDate();
    }

    const formattedDate = typeof targetDate === 'string' ? targetDate : dataService.formatDate(targetDate);
    
    // Check if this date is already being downloaded
    if (activeDownloads.has(formattedDate)) {
      console.log(`⏳ Download for ${formattedDate} already in progress, waiting...`);
      const existingPromise = activeDownloads.get(formattedDate);
      const result = await existingPromise;
      
      return res.json({ 
        success: true, 
        message: `Successfully downloaded ${result.count} records for ${result.date} (deduplicated)`,
        date: result.date,
        count: result.count
      });
    }
    
    // Create and store the download promise
    const downloadPromise = dataService.fetchAndStoreData(targetDate);
    activeDownloads.set(formattedDate, downloadPromise);
    
    try {
      const result = await downloadPromise;
      
      if (result.success) {
        res.json({ 
          success: true, 
          message: `Successfully downloaded ${result.count} records for ${result.date}`,
          date: result.date,
          count: result.count
        });
      } else {
        res.status(404).json({ 
          success: false, 
          message: `No data available for ${result.date}` 
        });
      }
    } finally {
      // Clean up the active download
      activeDownloads.delete(formattedDate);
    }
  } catch (error) {
    console.error('Error in download endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error downloading data',
      error: error.message 
    });
  }
});

// Get data by symbol
app.get('/api/data/symbol/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 30 } = req.query;
    
    const data = await dataService.getDataBySymbol(symbol, parseInt(limit));
    res.json({ success: true, symbol, data, count: data.length });
  } catch (error) {
    console.error('Error getting symbol data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving data',
      error: error.message 
    });
  }
});

// Get data by date range
app.get('/api/data/range', async (req, res) => {
  try {
    const { start, end, symbol } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ 
        success: false, 
        message: 'Start and end dates are required' 
      });
    }
    
    const data = await dataService.getDataByDateRange(start, end, symbol);
    res.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error('Error getting range data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving data',
      error: error.message 
    });
  }
});

// Get top shorted stocks for a date
app.get('/api/data/top-shorted/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { limit = 50 } = req.query;
    
    const data = await dataService.getTopShortedStocks(date, parseInt(limit));
    res.json({ success: true, date, data, count: data.length });
  } catch (error) {
    console.error('Error getting top shorted stocks:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving data',
      error: error.message 
    });
  }
});

// Get available dates
app.get('/api/data/dates', async (req, res) => {
  try {
    const dates = await dataService.getAvailableDates();
    res.json({ success: true, dates, count: dates.length });
  } catch (error) {
    console.error('Error getting available dates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving dates',
      error: error.message 
    });
  }
});

// Search symbols
app.get('/api/search/symbols', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Query must be at least 2 characters' 
      });
    }
    
    const symbols = await dataService.searchSymbols(q.toUpperCase());
    const symbolList = symbols.map(row => row.symbol);
    res.json({ success: true, symbols: symbolList, query: q });
  } catch (error) {
    console.error('Error in symbol search:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching symbols',
      error: error.message 
    });
  }
});

// Get database statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await dataService.getDatabaseStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting database stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving database statistics',
      error: error.message 
    });
  }
});

// Clear all data from database
// Clear old data (keep last N days)
app.delete('/api/data/clear-old', async (req, res) => {
  try {
    const daysToKeep = req.body?.daysToKeep || 30;
    const result = await dataService.clearOldData(daysToKeep);
    res.json({ 
      success: true, 
      message: `Successfully cleared old data. Deleted ${result.deletedCount} records older than ${result.cutoffDate}.`,
      deletedCount: result.deletedCount,
      cutoffDate: result.cutoffDate,
      daysKept: daysToKeep
    });
  } catch (error) {
    console.error('Error clearing old data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error clearing old data',
      error: error.message 
    });
  }
});

// Clear all data
app.delete('/api/data/clear', async (req, res) => {
  try {
    const result = await dataService.clearAllData();
    res.json({ 
      success: true, 
      message: `Successfully cleared all data. Deleted ${result.deletedCount} records.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing database:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error clearing database',
      error: error.message 
    });
  }
});

// Schedule daily data download at 6 AM
if (process.env.NODE_ENV !== 'development') {
  cron.schedule('0 6 * * *', async () => {
    console.log('🕕 Running scheduled daily data download...');
    try {
      const result = await runDailyDownload();
      console.log('📊 Scheduled download result:', result);
    } catch (error) {
      console.error('❌ Error in scheduled download:', error);
    }
  });
  
  console.log('⏰ Daily cron job scheduled for 6:00 AM ET');
} else {
  console.log('🚧 Development mode - cron jobs disabled');
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: error.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Connected to Neon PostgreSQL database`);
});