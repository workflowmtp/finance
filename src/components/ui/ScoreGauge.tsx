'use client';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  onClick?: () => void;
}

export default function ScoreGauge({ score, size = 100, label, onClick }: ScoreGaugeProps) {
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={onClick}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={size * 0.06} />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={size * 0.06}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text
          x={cx} y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={size * 0.22}
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
        >
          {score}%
        </text>
      </svg>
      {label && (
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
      )}
    </div>
  );
}
