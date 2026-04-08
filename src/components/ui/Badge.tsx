'use client';

interface BadgeProps {
  variant: 'conforme' | 'critique' | 'eleve' | 'moyen' | 'faible' | 'attente' | 'en-cours' | 'custom';
  children: React.ReactNode;
  color?: string;
  bg?: string;
}

export default function Badge({ variant, children, color, bg }: BadgeProps) {
  if (variant === 'custom') {
    return (
      <span className="badge" style={{ color, background: bg }}>
        {children}
      </span>
    );
  }
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
