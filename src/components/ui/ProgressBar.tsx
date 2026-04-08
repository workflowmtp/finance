'use client';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export default function ProgressBar({ value, max = 100, color, height = 4, showLabel }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const defaultColor = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="flex items-center gap-2">
      <div className="progress-bar-wrapper flex-1" style={{ height }}>
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color || defaultColor }} />
      </div>
      {showLabel && (
        <span className="font-mono text-xs font-semibold" style={{ color: color || defaultColor, minWidth: 36 }}>
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
