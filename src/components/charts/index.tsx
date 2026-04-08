'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';

// --- Bar Chart ---
interface BarChartWidgetProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
}

export function BarChartWidget({ data, height = 220 }: BarChartWidgetProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}
          labelStyle={{ color: 'var(--text-primary)' }}
          itemStyle={{ color: 'var(--text-secondary)' }}
          formatter={(value: number) => [value.toLocaleString('fr-FR') + ' FCFA', '']}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color || '#10B981'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// --- Donut Chart ---
interface DonutChartWidgetProps {
  data: { name: string; value: number; color: string }[];
  size?: number;
  innerRadius?: number;
  centerLabel?: string;
}

export function DonutChartWidget({ data, size = 140, innerRadius, centerLabel }: DonutChartWidgetProps) {
  const ir = innerRadius || size * 0.32;
  const or = size * 0.45;

  return (
    <div className="relative">
      <ResponsiveContainer width={size} height={size}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={ir}
            outerRadius={or}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
            {centerLabel}
          </span>
        </div>
      )}
    </div>
  );
}

// --- Line Chart ---
interface LineChartWidgetProps {
  data: { name: string; data: number[]; color: string }[];
  labels?: string[];
  height?: number;
}

export function LineChartWidget({ data, labels, height = 220 }: LineChartWidgetProps) {
  // Transform multi-series data for recharts
  const chartData = labels?.map((label, i) => {
    const point: Record<string, number | string> = { name: label };
    data.forEach((series, j) => {
      point[`series${j}`] = series.data[i] || 0;
    });
    return point;
  }) || [];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}
        />
        {data.map((series, i) => (
          <Line key={i} type="monotone" dataKey={`series${i}`} stroke={series.color} strokeWidth={2} dot={{ fill: series.color, r: 3 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// --- Chart Legend ---
interface LegendItem {
  label: string;
  color: string;
}

export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <div className="flex flex-wrap gap-4 mt-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
