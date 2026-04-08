'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = { sm: 480, md: 640, lg: 860 };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'var(--bg-modal-overlay)' }} onClick={onClose}>
      <div
        className="rounded-xl overflow-hidden animate-slide-in"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', maxWidth: widths[size], width: '90vw', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 transition-colors" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid var(--border)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
