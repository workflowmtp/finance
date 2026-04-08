'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
  breadcrumb: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function PageHeader({ breadcrumb, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
          {breadcrumb.split(' ▸ ').map((part, i, arr) => (
            <span key={i}>
              {i < arr.length - 1 ? (
                <>{part} <span className="mx-1 opacity-50">▸</span></>
              ) : (
                <span style={{ color: 'var(--primary)' }}>{part}</span>
              )}
            </span>
          ))}
        </div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && (
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
