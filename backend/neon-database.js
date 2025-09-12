const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

class NeonDatabase {
  constructor() {
    this.sql = neon(process.env.DATABASE_URL);
  }

  async initializeSchema() {
    try {
      await this.sql`
        CREATE TABLE IF NOT EXISTS short_sale_data (
          id SERIAL PRIMARY KEY,
          date TEXT NOT NULL,
          symbol TEXT NOT NULL,
          short_volume INTEGER,
          short_exempt_volume INTEGER,
          total_volume INTEGER,
          market TEXT,
          short_ratio REAL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(date, symbol)
        )
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_date_symbol ON short_sale_data(date, symbol)
      `;
      
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_symbol ON short_sale_data(symbol)
      `;
      
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_date ON short_sale_data(date)
      `;

      console.log('✅ Neon database schema initialized');
    } catch (error) {
      console.error('❌ Error initializing schema:', error);
      throw error;
    }
  }

  async insertData(data) {
    try {
      const result = await this.sql`
        INSERT INTO short_sale_data (date, symbol, short_volume, short_exempt_volume, total_volume, market, short_ratio)
        VALUES (${data.date}, ${data.symbol}, ${data.shortVolume}, ${data.shortExemptVolume}, ${data.totalVolume}, ${data.market}, ${data.shortRatio})
        ON CONFLICT (date, symbol) DO NOTHING
      `;
      return result;
    } catch (error) {
      console.error('❌ Error inserting data:', error);
      throw error;
    }
  }

  async getAllData() {
    try {
      return await this.sql`SELECT * FROM short_sale_data ORDER BY date DESC, symbol ASC`;
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      throw error;
    }
  }

  async getDataByDate(date) {
    try {
      return await this.sql`SELECT * FROM short_sale_data WHERE date = ${date} ORDER BY symbol ASC`;
    } catch (error) {
      console.error('❌ Error fetching data by date:', error);
      throw error;
    }
  }

  async getTopShorted(date, limit = 10) {
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
      console.error('❌ Error fetching top shorted:', error);
      throw error;
    }
  }

  async getStats() {
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
      console.error('❌ Error fetching stats:', error);
      throw error;
    }
  }
}

module.exports = NeonDatabase;