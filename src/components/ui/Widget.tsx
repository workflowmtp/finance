'use client';

import { ReactNode, CSSProperties } from 'react';

interface WidgetProps {
  title?: string;
  titleExtra?: ReactNode;
  borderColor?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export default function Widget({ title, titleExtra, borderColor, children, footer, className, style }: WidgetProps) {
  return (
    <div 
      className={`widget ${className || ''}`} 
      style={{ ...(borderColor ? { borderLeft: `4px solid ${borderColor}` } : {}), ...style }}
    >
      {title && (
        <div className="widget-header">
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</span>
          {titleExtra}
        </div>
      )}
      <div className="widget-body">{children}</div>
      {footer && <div className="widget-footer">{footer}</div>}
    </div>
  );
}
