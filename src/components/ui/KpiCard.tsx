'use client';

import { useRouter } from 'next/navigation';

interface KpiCardProps {
  color: 'green' | 'red' | 'orange' | 'blue' | 'cyan' | 'purple';
  icon: string;
  value: string;
  label: string;
  trend?: string;
  direction?: 'up' | 'down' | 'neutral';
  href?: string;
  onClick?: () => void;
}

const ICON_BG: Record<string, string> = {
  green: 'var(--primary-bg)',
  red: 'var(--danger-bg)',
  orange: 'var(--warning-bg)',
  blue: 'var(--secondary-bg)',
  cyan: 'var(--info-bg)',
  purple: 'var(--purple-bg)',
};

const ICON_COLOR: Record<string, string> = {
  green: 'var(--primary)',
  red: 'var(--danger)',
  orange: 'var(--warning)',
  blue: 'var(--secondary)',
  cyan: 'var(--info)',
  purple: 'var(--purple)',
};

export default function KpiCard({ color, icon, value, label, trend, direction, href, onClick }: KpiCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) onClick();
    else if (href) router.push(href);
  };

  return (
    <div onClick={handleClick} className="kpi-card">
      <div className="kpi-card-icon" style={{ background: ICON_BG[color], color: ICON_COLOR[color] }}>
        {icon}
      </div>
      <div className="kpi-card-value">{value}</div>
      <div className="kpi-card-label">{label}</div>
      {trend && (
        <span className={`kpi-card-trend ${direction || 'neutral'}`}>
          {direction === 'up' ? '↑' : direction === 'down' ? '↓' : ''} {trend}
        </span>
      )}
    </div>
  );
}
