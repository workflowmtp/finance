'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface BtnProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

const VARIANTS = {
  primary: 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600',
  secondary: 'bg-transparent hover:bg-white/[0.05] border-white/[0.15] hover:border-white/[0.25]',
  danger: 'bg-red-600 hover:bg-red-500 text-white border-red-600',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export default function Btn({ variant = 'secondary', size = 'sm', href, onClick, children, className }: BtnProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) onClick();
    else if (href) router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg border transition-all cursor-pointer
        ${VARIANTS[variant]} ${SIZES[size]} ${className || ''}
      `}
      style={{ color: variant === 'secondary' ? 'var(--text-primary)' : undefined }}
    >
      {children}
    </button>
  );
}
