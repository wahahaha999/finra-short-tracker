const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

class DatabaseMigrator {
  constructor() {
    this.sqliteDb = new sqlite3.Database(path.join(__dirname, 'finra_data.db'));
    this.sql = neon(process.env.DATABASE_URL);
  }

  async migrate() {
    try {
      console.log('🚀 Starting migration from SQLite to Neon...');
      
      // Step 1: Initialize Neon schema
      await this.initializeNeonSchema();
      
      // Step 2: Get all data from SQLite
      const sqliteData = await this.getSQLiteData();
      
      if (sqliteData.length === 0) {
        console.log('📊 No data to migrate');
        return;
      }
      
      console.log(`📊 Found ${sqliteData.length} records to migrate`);
      
      // Step 3: Insert data into Neon
      await this.insertIntoNeon(sqliteData);
      
      // Step 4: Verify migration
      await this.verifyMigration();
      
      console.log('✅ Migration completed successfully!');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async initializeNeonSchema() {
    console.log('🔧 Initializing Neon schema...');
    
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

    await this.sql`CREATE INDEX IF NOT EXISTS idx_date_symbol ON short_sale_data(date, symbol)`;
    await this.sql`CREATE INDEX IF NOT EXISTS idx_symbol ON short_sale_data(symbol)`;
    await this.sql`CREATE INDEX IF NOT EXISTS idx_date ON short_sale_data(date)`;
    
    console.log('✅ Neon schema initialized');
  }

  async getSQLiteData() {
    return new Promise((resolve, reject) => {
      this.sqliteDb.all(
        'SELECT date, symbol, short_volume, short_exempt_volume, total_volume, market, short_ratio FROM short_sale_data',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async insertIntoNeon(data) {
    console.log('📥 Inserting data into Neon...');
    
    let insertedCount = 0;
    for (const row of data) {
      try {
        await this.sql`
          INSERT INTO short_sale_data (date, symbol, short_volume, short_exempt_volume, total_volume, market, short_ratio)
          VALUES (${row.date}, ${row.symbol}, ${row.short_volume}, ${row.short_exempt_volume}, ${row.total_volume}, ${row.market}, ${row.short_ratio})
          ON CONFLICT (date, symbol) DO NOTHING
        `;
        insertedCount++;
        
        if (insertedCount % 1000 === 0) {
          console.log(`📊 Inserted ${insertedCount}/${data.length} records...`);
        }
      } catch (error) {
        console.error(`❌ Error inserting row:`, row, error);
      }
    }
    
    console.log(`✅ Successfully inserted ${insertedCount} records`);
  }

  async verifyMigration() {
    console.log('🔍 Verifying migration...');
    
    const result = await this.sql`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT symbol) as unique_symbols,
        COUNT(DISTINCT date) as unique_dates,
        MIN(date) as earliest_date,
        MAX(date) as latest_date
      FROM short_sale_data
    `;
    
    console.log('📊 Neon database stats:', result[0]);
  }

  close() {
    this.sqliteDb.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  const migrator = new DatabaseMigrator();
  migrator.migrate()
    .then(() => {
      console.log('🎉 Migration completed!');
      migrator.close();
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      migrator.close();
      process.exit(1);
    });
}

module.exports = DatabaseMigrator;