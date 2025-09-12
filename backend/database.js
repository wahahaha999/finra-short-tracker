const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'finra_data.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS short_sale_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    symbol TEXT NOT NULL,
    short_volume INTEGER,
    short_exempt_volume INTEGER,
    total_volume INTEGER,
    market TEXT,
    short_ratio REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, symbol)
  )`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_date_symbol ON short_sale_data(date, symbol)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_symbol ON short_sale_data(symbol)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_date ON short_sale_data(date)`);
});

module.exports = db;