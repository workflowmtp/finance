'use client';

import { ReactNode } from 'react';

interface DecisionBannerProps {
  type: 'critical' | 'warning';
  icon: string;
  title: string;
  text: string;
  actions?: ReactNode;
}

export default function DecisionBanner({ type, icon, title, text, actions }: DecisionBannerProps) {
  const titleColor = type === 'critical' ? 'text-red-400' : 'text-amber-400';

  return (
    <div className={`decision-banner ${type}`}>
      <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1">
        <div className={`font-semibold text-sm ${titleColor}`}>{title}</div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{text}</div>
        {actions && <div className="flex gap-2 mt-3">{actions}</div>}
      </div>
    </div>
  );
}
