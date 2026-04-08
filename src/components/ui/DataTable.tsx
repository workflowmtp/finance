'use client';

import { ReactNode, useState } from 'react';

interface Column<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
  render?: (value: any, row: T) => ReactNode;
}

interface DataTableProps<T> {
  title?: string;
  count?: number;
  countId?: string;
  columns: Column<T>[];
  data: T[];
  actions?: ReactNode;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T extends Record<string, any>>({
  title,
  count,
  columns,
  data,
  actions,
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="widget">
      {title && (
        <div className="widget-header">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {title}
            </span>
            {count !== undefined && (
              <span className="inline-flex items-center justify-center min-w-[24px] h-5 rounded-full text-[10px] font-bold px-1.5"
                style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>
                {count}
              </span>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: 'var(--text-muted)',
                    textAlign: col.align || 'left',
                    width: col.width,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className={`transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-white/[0.02]' : ''
                } ${rowClassName ? rowClassName(row) : ''}`}
                style={{ borderBottom: '1px solid var(--border-light)' }}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${col.className || ''}`}
                    style={{ textAlign: col.align || 'left' }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10 text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Aucune donnée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
