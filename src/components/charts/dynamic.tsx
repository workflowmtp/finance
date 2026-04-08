'use client';

import dynamic from 'next/dynamic';

// Lazy load Recharts pour réduire le bundle initial
export const DynamicBarChart = dynamic(
  () => import('./index').then(mod => mod.BarChartWidget),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 rounded" style={{ height: 220 }} />
  }
);

export const DynamicDonutChart = dynamic(
  () => import('./index').then(mod => mod.DonutChartWidget),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 rounded" style={{ width: 140, height: 140 }} />
  }
);

export const DynamicLineChart = dynamic(
  () => import('./index').then(mod => mod.LineChartWidget),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 rounded" style={{ height: 220 }} />
  }
);
