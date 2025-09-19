const axios = require('axios');
const db = require('./database');

class DataService {
  static formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  static getYesterdayDate() {
    // Get current date in Eastern Time (ET)
    const now = new Date();
    const easternTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    
    const yesterday = new Date(easternTime);
    yesterday.setDate(easternTime.getDate() - 1);
    return yesterday;
  }

  static getCurrentEasternDate() {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  }

  static async downloadDailyData(date) {
    const formattedDate = this.formatDate(date);
    const url = `https://cdn.finra.org/equity/regsho/daily/CNMSshvol${formattedDate}.txt`;
    
    try {
      console.log(`🔄 Downloading data for ${formattedDate} from ${url}`);
      
      const response = await axios.get(url, {
        timeout: 60000, // Increased timeout for large files
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/plain,*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive'
        },
        maxContentLength: 50 * 1024 * 1024 // 50MB max
      });
      
      if (!response.data || response.data.trim() === '') {
        console.error(`❌ Empty response for ${formattedDate}`);
        return null;
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
      return null;
    }
  }

  static parseData(rawData, date) {
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
          short_volume: shortVolume,
          short_exempt_volume: shortExemptVolume,
          total_volume: totalVolume,
          market: values[5] || '',
          short_ratio: parseFloat(shortRatio.toFixed(2))
        });
      }
    }

    return data;
  }

  static async saveToDatabase(data) {
    if (!data || data.length === 0) return;

    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO short_sale_data 
        (date, symbol, short_volume, short_exempt_volume, total_volume, market, short_ratio)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      let insertedCount = 0;
      
      data.forEach(record => {
        stmt.run([
          record.date,
          record.symbol,
          record.short_volume,
          record.short_exempt_volume,
          record.total_volume,
          record.market,
          record.short_ratio
        ], function(err) {
          if (err) {
            console.error('Error inserting record:', err);
          } else {
            insertedCount++;
          }
        });
      });

      stmt.finalize((err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`Successfully inserted ${insertedCount} records`);
          resolve(insertedCount);
        }
      });
    });
  }

  static async fetchAndStoreData(date = null) {
    const targetDate = date || this.getYesterdayDate();
    const data = await this.downloadDailyData(targetDate);
    
    if (data) {
      await this.saveToDatabase(data);
      return { success: true, count: data.length, date: this.formatDate(targetDate) };
    }
    
    return { success: false, count: 0, date: this.formatDate(targetDate) };
  }

  static async getDataBySymbol(symbol, limit = 30) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM short_sale_data 
        WHERE symbol = ? 
        ORDER BY date DESC 
        LIMIT ?
      `;
      
      db.all(query, [symbol.toUpperCase(), limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getDataByDateRange(startDate, endDate, symbol = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT * FROM short_sale_data 
        WHERE date BETWEEN ? AND ?
      `;
      
      const params = [startDate, endDate];
      
      if (symbol) {
        query += ' AND symbol = ?';
        params.push(symbol.toUpperCase());
      }
      
      query += ' ORDER BY date DESC, symbol ASC';
      
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getTopShortedStocks(date, limit = 50) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT symbol, short_volume, total_volume, short_ratio,
               CAST(short_volume AS FLOAT) / NULLIF(total_volume, 0) * 100 as actual_ratio
        FROM short_sale_data 
        WHERE date = ? 
        AND total_volume > 1000000
        ORDER BY short_ratio DESC 
        LIMIT ?
      `;
      
      db.all(query, [date, limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getAvailableDates() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT DISTINCT date 
        FROM short_sale_data 
        ORDER BY date DESC
      `;
      
      db.all(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.date));
      });
    });
  }
}

module.exports = DataService;