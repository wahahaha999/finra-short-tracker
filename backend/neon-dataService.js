const { neon } = require('@neondatabase/serverless');
const axios = require('axios');
const https = require('https');
require('dotenv').config();

// Create optimized HTTP agent for better performance
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 5,
  maxFreeSockets: 2,
  timeout: 60000
});

class NeonDataService {
  constructor() {
    this.sql = neon(process.env.DATABASE_URL);
  }

  getYesterdayDate() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  }

  formatDate(date) {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  async fetchDataFromFINRA(date) {
    const formattedDate = typeof date === 'string' ? date : this.formatDate(date);
    const url = `https://cdn.finra.org/equity/regsho/daily/CNMSshvol${formattedDate}.txt`;
    
    try {
      console.log(`📡 Fetching data for ${formattedDate} from ${url}`);
      
      const response = await axios.get(url, {
        timeout: 180000, // Increased timeout to 3 minutes
        httpsAgent: httpsAgent,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/plain,*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        maxContentLength: 50 * 1024 * 1024,
        decompress: true,
        responseType: 'text'
      });
      
      if (!response.data || response.data.trim() === '') {
        console.error(`❌ Empty response for ${formattedDate}`);
        return [];
      }
      
      console.log(`✅ Successfully downloaded ${response.data.length} bytes for ${formattedDate}`);
      return this.parseData(response.data, formattedDate);
    } catch (error) {
      if (error.response?.status === 404) {
        console.error(`❌ Data not available for ${formattedDate} (404)`);
      } else if (error.code === 'ECONNABORTED') {
        console.error(`⏰ Timeout downloading data for ${formattedDate}`);
      } else {
        console.error(`❌ Error downloading data for ${formattedDate}:`, error.message);
      }
      return [];
    }
  }

  parseData(rawData, date) {
    const lines = rawData.trim().split('\n');
    const headers = lines[0].split('|');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split('|');
      if (values.length >= 5) {
        const shortVolume = parseInt(values[2]) || 0;
        const shortExemptVolume = parseInt(values[3]) || 0;
        const totalVolume = parseInt(values[4]) || 0;
        const shortRatio = totalVolume > 0 ? (shortVolume / totalVolume) * 100 : 0;

        data.push({
          date: date,
          symbol: values[1],
          shortVolume: shortVolume,
          shortExemptVolume: shortExemptVolume,
          totalVolume: totalVolume,
          market: values[5] || '',
          shortRatio: parseFloat(shortRatio.toFixed(4))
        });
      }
    }

    return data;
  }

  async storeData(data) {
    try {
      if (data.length === 0) {
        console.log('⚠️ No data to store');
        return 0;
      }

      console.log(`🔄 Storing ${data.length} records in batch...`);
      
      // Process in chunks of 1000 for optimal performance
      const chunkSize = 1000;
      let totalInserted = 0;
      
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        
        // Create values array for batch insert
        const values = chunk.map(record => [
          record.date,
          record.symbol,
          record.shortVolume,
          record.shortExemptVolume,
          record.totalVolume,
          record.market,
          record.shortRatio
        ]);
        
        // Use batch insert with proper Neon syntax
        for (const value of values) {
          await this.sql`
            INSERT INTO short_sale_data (date, symbol, short_volume, short_exempt_volume, total_volume, market, short_ratio)
            VALUES (${value[0]}, ${value[1]}, ${value[2]}, ${value[3]}, ${value[4]}, ${value[5]}, ${value[6]})
            ON CONFLICT (date, symbol) DO NOTHING
          `;
        }
        
        totalInserted += chunk.length;
        console.log(`✅ Processed chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(data.length/chunkSize)} (${chunk.length} records)`);
      }
      
      console.log(`✅ Successfully processed ${totalInserted} records in ${Math.ceil(data.length/chunkSize)} batches`);
      return totalInserted;
    } catch (error) {
      console.error('❌ Error storing data:', error);
      throw error;
    }
  }

  async fetchAndStoreData(date = null) {
    const targetDate = date || this.getYesterdayDate();
    const formattedDate = typeof targetDate === 'string' ? targetDate : this.formatDate(targetDate);
    
    try {
      console.log(`🔄 Starting data fetch for ${formattedDate}...`);
      
      const data = await this.fetchDataFromFINRA(formattedDate);
      
      if (data.length === 0) {
        console.log(`⚠️ No data available for ${formattedDate}`);
        return { success: false, date: formattedDate, count: 0 };
      }
      
      const count = await this.storeData(data);
      
      console.log(`✅ Downloaded and stored ${count} records for ${formattedDate}`);
      return { success: true, date: formattedDate, count };
    } catch (error) {
      console.error('❌ Error in fetchAndStoreData:', error);
      return { success: false, date: formattedDate, count: 0, error: error.message };
    }
  }

  async getDataBySymbol(symbol, limit = 30) {
    try {
      return await this.sql`
        SELECT * FROM short_sale_data 
        WHERE symbol = ${symbol} 
        ORDER BY date DESC 
        LIMIT ${limit}
      `;
    } catch (error) {
      console.error('❌ Error getting data by symbol:', error);
      throw error;
    }
  }

  async getDataByDateRange(start, end, symbol = null) {
    try {
      if (symbol) {
        return await this.sql`
          SELECT * FROM short_sale_data 
          WHERE date >= ${start} AND date <= ${end} AND symbol = ${symbol}
          ORDER BY date DESC
        `;
      } else {
        return await this.sql`
          SELECT * FROM short_sale_data 
          WHERE date >= ${start} AND date <= ${end}
          ORDER BY date DESC, symbol ASC
        `;
      }
    } catch (error) {
      console.error('❌ Error getting data by date range:', error);
      throw error;
    }
  }

  async getTopShortedStocks(date, limit = 50) {
    try {
      return await this.sql`
        SELECT symbol, short_volume, total_volume, 
               (short_volume::float / NULLIF(total_volume, 0)) * 100 as short_ratio
        FROM short_sale_data 
        WHERE date = ${date} 
        ORDER BY short_ratio DESC 
        LIMIT ${limit}
      `;
    } catch (error) {
      console.error('❌ Error getting top shorted stocks:', error);
      throw error;
    }
  }

  async getAvailableDates() {
    try {
      const result = await this.sql`
        SELECT DISTINCT date FROM short_sale_data ORDER BY date DESC
      `;
      return result.map(row => row.date);
    } catch (error) {
      console.error('❌ Error getting available dates:', error);
      throw error;
    }
  }

  async searchSymbols(query) {
    try {
      return await this.sql`
        SELECT DISTINCT symbol 
        FROM short_sale_data 
        WHERE symbol ILIKE ${query + '%'}
        ORDER BY symbol 
        LIMIT 20
      `;
    } catch (error) {
      console.error('❌ Error searching symbols:', error);
      throw error;
    }
  }

  async getDatabaseStats() {
    try {
      const result = await this.sql`
        SELECT 
          COUNT(*) as total_records,
          COUNT(DISTINCT symbol) as unique_symbols,
          COUNT(DISTINCT date) as unique_dates,
          MIN(date) as earliest_date,
          MAX(date) as latest_date
        FROM short_sale_data
      `;
      return result[0];
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      throw error;
    }
  }

  async clearOldData(daysToKeep = 30) {
    try {
      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      // Format as YYYYMMDD to match database format
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0].replace(/-/g, '');
      
      // Get count before clearing
      const result = await this.sql`SELECT COUNT(*) as count FROM short_sale_data WHERE date < ${cutoffDateStr}`;
      const recordCount = result[0].count;
      
      // Delete old data
      await this.sql`DELETE FROM short_sale_data WHERE date < ${cutoffDateStr}`;
      
      console.log(`✅ Successfully cleared ${recordCount} records older than ${cutoffDateStr} from database`);
      
      return {
        success: true,
        deletedCount: recordCount,
        cutoffDate: cutoffDateStr
      };
    } catch (error) {
      console.error('❌ Error clearing old data:', error);
      throw error;
    }
  }

  async clearAllData() {
    try {
      console.log('🗑️ Clearing all data from database...');
      
      // Get count before deletion for confirmation
      const countResult = await this.sql`SELECT COUNT(*) as count FROM short_sale_data`;
      const recordCount = countResult[0].count;
      
      // Delete all records
      await this.sql`TRUNCATE TABLE short_sale_data`;
      
      console.log(`✅ Successfully cleared ${recordCount} records from database`);
      
      return {
        success: true,
        deletedCount: recordCount
      };
    } catch (error) {
      console.error('❌ Error clearing database:', error);
      throw error;
    }
  }
}

module.exports = NeonDataService;