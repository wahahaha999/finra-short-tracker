# FINRA Short Sale Tracker

A comprehensive web application for tracking and analyzing FINRA short sale data. The application automatically downloads daily short sale data from FINRA and provides powerful analysis tools for stock market research.

## Features

- **Automated Data Downloads**: Daily downloads of FINRA short sale data
- **Real-time Database**: SQLite database for fast data retrieval
- **Interactive Charts**: Volume trends and short ratio visualizations
- **Symbol Search**: Autocomplete search for stock symbols
- **Top Shorted Stocks**: Daily rankings of most shorted stocks
- **Date Range Analysis**: Analyze data across specific time periods
- **RESTful API**: Comprehensive backend API for data access

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database
- **Axios** for HTTP requests
- **node-cron** for scheduled tasks

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **Recharts** for data visualization
- **Lucide React** for icons
- **Tailwind CSS** for styling

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd /Users/user/Documents/finra-short-tracker
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on http://localhost:3001

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on http://localhost:5173

### Initial Data Download

1. **Download latest data**: Click the "Download Latest Data" button in the frontend
2. **Manual download**: You can also use the API endpoint:
   ```bash
   curl -X POST http://localhost:3001/api/download
   ```

## API Endpoints

### Data Management
- `POST /api/download` - Download latest short sale data
- `GET /api/health` - Health check endpoint

### Data Retrieval
- `GET /api/data/symbol/:symbol` - Get data for a specific symbol
- `GET /api/data/range?start=YYYYMMDD&end=YYYYMMDD&symbol=SYM` - Get data by date range
- `GET /api/data/top-shorted/:date?limit=50` - Get top shorted stocks for a date
- `GET /api/data/dates` - Get all available dates

### Search & Analysis
- `GET /api/search/symbols?q=QUERY` - Search for symbols
- `GET /api/stats` - Get database statistics

## Database Schema

The application uses a SQLite database with the following schema:

```sql
CREATE TABLE short_sale_data (
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
);
```

## Scheduled Tasks

The application automatically downloads new data daily at 6:00 AM using node-cron. This can be configured in the `.env` file.

## Usage Examples

### Search for a Stock
1. Enter a stock symbol in the search box (e.g., "AAPL")
2. Select from autocomplete suggestions
3. View volume trends and short ratio charts

### Analyze Top Shorted Stocks
1. View the "Top Shorted Stocks" section
2. Select different dates from the dropdown
3. See the most heavily shorted stocks for each day

### Date Range Analysis
1. Use the API to query specific date ranges
2. Example: Get AAPL data for January 2025
   ```bash
   curl "http://localhost:3001/api/data/range?start=20250101&end=20250131&symbol=AAPL"
   ```

## Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
PORT=3001
NODE_ENV=development
DATABASE_PATH=./finra_data.db
```

### Custom Date Downloads
You can manually download data for specific dates:

```bash
# Download data for a specific date
curl -X POST http://localhost:3001/api/download \
  -H "Content-Type: application/json" \
  -d '{"date": "20250115"}'
```

## Development

### Adding New Features
1. Backend: Add new endpoints in `server.js`
2. Frontend: Create new components in `src/components/`
3. Database: Modify schema in `database.js` if needed

### Testing
- Backend: Test API endpoints with tools like Postman or curl
- Frontend: Use React DevTools for debugging

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the PORT in `.env` file
   - Kill the process using the port: `lsof -ti:3001 | xargs kill -9`

2. **Data download failures**
   - Check internet connection
   - Verify FINRA URL accessibility
   - Check server logs for specific errors

3. **Database issues**
   - Delete `finra_data.db` to reset database
   - Check file permissions

### Logs
- Backend logs are printed to console
- Database file is created in backend directory

## Data Source

The application downloads data from FINRA's official daily short sale volume reports:
- URL format: `https://cdn.finra.org/equity/regsho/daily/CNMSshvolYYYYMMDD.txt`
- Data includes: Symbol, short volume, total volume, market indicators
- Updated daily by FINRA

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.