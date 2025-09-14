import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import DataDownloader from './components/DataDownloader';
import SymbolSearch from './components/SymbolSearch';
import SymbolChart from './components/SymbolChart';
import TopShortedStocks from './components/TopShortedStocks';
import StatsDashboard from './components/StatsDashboard';
import DataManagement from './components/DataManagement';
import { API_BASE_URL } from './config';
import './App.css';

interface Stats {
  total_records: number;
  unique_symbols: number;
  unique_dates: number;
  earliest_date: string;
  latest_date: string;
}

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDownloadComplete = () => {
    fetchStats();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <header className="card" style={{ 
        margin: 0, 
        borderRadius: 0, 
        borderTop: 'none', 
        borderLeft: 'none', 
        borderRight: 'none',
        borderBottom: '1px solid var(--border-primary)',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <img 
                src="/header.png" 
                alt="Dark Pool Intelligence Logo" 
                style={{
                  height: '80px',
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
              <div>
                <h1 style={{ 
                  fontSize: '2.25rem', 
                  fontWeight: '700', 
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem'
                }}>Dark Pool Intelligence</h1>
                <p style={{ 
                  fontSize: '1rem', 
                  color: 'var(--text-secondary)',
                  margin: 0
                }}>Data provided by Financial Industry Regulatory Authority</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-3">
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--accent-green)',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-secondary)',
                    fontWeight: '500'
                  }}>Latest Data</span>
                  {stats?.latest_date && (
                     <span style={{
                       fontSize: '0.75rem',
                       color: 'white',
                       fontWeight: '400'
                     }}>
                      {new Date(stats.latest_date.slice(0,4) + '-' + stats.latest_date.slice(4,6) + '-' + stats.latest_date.slice(6,8)).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <DataDownloader onDownloadComplete={handleDownloadComplete} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6" style={{ paddingTop: '3.5rem', paddingBottom: '0rem' }}>
        <div style={{ marginBottom: '2rem', marginTop: '-1.5rem' }}>
          <div className="card">
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search className="h-5 w-5 mr-3" style={{ color: 'var(--accent-blue)' }} />
              Symbol Analysis
            </h2>
            <SymbolSearch 
              onSymbolSelect={setSelectedSymbol} 
              selectedSymbol={selectedSymbol} 
            />
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>          {selectedSymbol ? (            <SymbolChart symbol={selectedSymbol} />          ) : (            <div className="card" style={{               height: '500px',               display: 'flex',               alignItems: 'center',               justifyContent: 'center'             }}>              <div style={{ textAlign: 'center' }}>                <Search className="h-16 w-16 mx-auto" style={{                   color: 'var(--text-muted)',                   marginBottom: '1rem'                 }} />                <p style={{                   color: 'var(--text-muted)',                   fontSize: '1.125rem'                 }}>                  Select a symbol to view chart                </p>              </div>            </div>          )}        </div>        <div style={{ marginBottom: '2rem' }}>          <StatsDashboard stats={stats} />        </div>        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">          <div>            <TopShortedStocks />          </div>          <div style={{ paddingTop: '1rem' }}>
            <DataManagement onDataCleared={fetchStats} />
          </div>        </div>
      </main>
      
      <footer style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <div className="max-w-7xl mx-auto px-6">
          <p>© 2025 Dark Pool Intelligence. Professional FINRA data analysis platform by Franck Tey.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
