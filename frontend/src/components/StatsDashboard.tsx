import React from 'react';
import { Database, TrendingUp, Calendar } from 'lucide-react';

interface Stats {
  total_records: number;
  unique_symbols: number;
  unique_dates: number;
  earliest_date: string;
  latest_date: string;
}

interface StatsDashboardProps {
  stats: Stats | null;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return `${month}/${day}/${year}`;
  };

  const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtext?: string;
  }> = ({ icon, label, value, subtext }) => (
    <div className="card" style={{
      transition: 'all 0.2s ease',
      cursor: 'default'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
            marginBottom: '0.5rem'
          }}>{label}</p>
          <p style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.2
          }}>{value}</p>
          {subtext && <p style={{
            fontSize: '0.75rem',
            color: 'var(--accent-blue)',
            fontWeight: '500',
            margin: 0,
            marginTop: '0.25rem'
          }}>{subtext}</p>}
        </div>
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'var(--accent-blue)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <StatCard
        icon={<Database className="h-6 w-6" style={{ color: 'white' }} />}
        label="Total Records"
        value={stats?.total_records.toLocaleString() || '0'}
      />
      
      <StatCard
        icon={<TrendingUp className="h-6 w-6" style={{ color: 'white' }} />}
        label="Unique Symbols"
        value={stats?.unique_symbols.toLocaleString() || '0'}
      />
      
      <StatCard
        icon={<Calendar className="h-6 w-6" style={{ color: 'white' }} />}
        label="Unique Dates"
        value={stats?.unique_dates.toLocaleString() || '0'}
      />
      
      <StatCard
        icon={<Calendar className="h-6 w-6" style={{ color: 'white' }} />}
        label="Latest Date"
        value={formatDate(stats?.latest_date || '')}
        subtext="Most recent data"
      />
      
      <StatCard
        icon={<Calendar className="h-6 w-6" style={{ color: 'white' }} />}
        label="Earliest Date"
        value={formatDate(stats?.earliest_date || '')}
        subtext="Oldest data"
      />
    </div>
  );
};

export default StatsDashboard;