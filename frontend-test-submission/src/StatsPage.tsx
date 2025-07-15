import React, { useEffect, useState } from 'react';
import StatsTable from '../src/components/StatsTable';

export default function StatsPage() {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    // Fetch stats for all shortcodes from backend and setStats
    // Use your logging middleware for each API call and error
  }, []);

  return <StatsTable stats={stats} />;
}