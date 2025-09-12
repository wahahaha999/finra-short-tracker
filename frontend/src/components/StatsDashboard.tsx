import React from 'react';
import { Database, TrendingUp, Calendar, Hash } from 'lucide-react';

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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-2 bg-blue-100 rounded-lg">
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <StatCard
        icon={<Database className="h-6 w-6 text-blue-600" />}
        label="Total Records"
        value={stats?.total_records.toLocaleString() || '0'}
      />
      
      <StatCard
        icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
        label="Unique Symbols"
        value={stats?.unique_symbols.toLocaleString() || '0'}
      />
      
      <StatCard
        icon={<Calendar className="h-6 w-6 text-blue-600" />}
        label="Unique Dates"
        value={stats?.unique_dates.toLocaleString() || '0'}
      />
      
      <StatCard
        icon={<Calendar className="h-6 w-6 text-blue-600" />}
        label="Latest Date"
        value={formatDate(stats?.latest_date || '')}
        subtext="Most recent data"
      />
      
      <StatCard
        icon={<Calendar className="h-6 w-6 text-blue-600" />}
        label="Earliest Date"
        value={formatDate(stats?.earliest_date || '')}
        subtext="Oldest data"
      />
    </div>
  );
};

export default StatsDashboard;