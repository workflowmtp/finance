'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs } from '@/components/ui';
import { formatMontant, formatCompact } from '@/lib/format';
import { getTreasuryForecast, getComptesWithBanques } from '@/lib/data';

const TABS = [
  { id: 'situation', label: 'Situation', icon: ' ', href: '/tresorerie' },
  { id: 'previsions', label: 'Prévisions', icon: ' ', href: '/tresorerie/previsions' },
  { id: 'tensions', label: 'Tensions', icon: ' ', href: '/tresorerie/tensions' },
  { id: 'scenarios', label: 'Scénarios', icon: ' ', href: '/tresorerie/scenarios' },
];

export default function ScenariosPage() {
  const router = useRouter();
  const forecast = getTreasuryForecast() as any[];
  const comptes = getComptesWithBanques() as any[];

  const totalSolde = comptes.reduce((s: number, c: any) => s + c.solde_comptable, 0);

  // Calculer les 3 scénarios
  const scenarios = [
    { label: 'Pessimiste', encMod: 0.7, decMod: 1.10, color: '#EF4444', data: [] as number[] },
    { label: 'Réaliste', encMod: 1.0, decMod: 1.0, color: '#3B82F6', data: [] as number[] },
    { label: 'Optimiste', encMod: 1.2, decMod: 0.95, color: '#10B981', data: [] as number[] },
  ];

  for (const s of scenarios) {
    let solde = totalSolde;
    for (const f of forecast) {
      const enc = Math.round(f.encaissements * s.encMod);
      const dec = Math.round(f.decaissements * s.decMod);
      solde = solde + enc - dec;
      s.data.push(solde);
    }
  }

  const minPess = Math.min(...scenarios[0].data);

  return (
    <div>
      <PageHeader
        breadcrumb="Trésorerie > Scénarios"
        title="Scénarios de Trésorerie"
        subtitle="Comparaison pessimiste / réaliste / optimiste"
      />

      <ModuleTabs tabs={TABS} activeId="scenarios" />

      {/* Graphique multi-courbes */}
      <div className="widget">
        <div className="widget-header">
          <span className="widget-title"> Projection trésorerie - 3 scénarios</span>
        </div>
        <div className="widget-body">
          <div className="chart-wrapper">
            <svg viewBox="0 0 700 260" style={{ width: '100%', height: '260px' }}>
              {/* Grid */}
              {[0, 1, 2, 3, 4, 5].map(i => (
                <line key={i} x1="50" y1={20 + i * 40} x2="680" y2={20 + i * 40} stroke="var(--border-light)" strokeWidth="1" />
              ))}
              {/* Scenarios lines */}
              {scenarios.map((s, si) => (
                <g key={si}>
                  {si === 1 && (
                    <polygon
                      fill="rgba(59,130,246,0.1)"
                      points={(() => {
                        const pts = ['50,220'];
                        s.data.forEach((v, i) => {
                          const x = 50 + i * 160;
                          const y = 220 - (Math.max(0, v) / 600000000) * 180;
                          pts.push(`${x},${y}`);
                        });
                        pts.push(`${50 + (s.data.length - 1) * 160},220`);
                        return pts.join(' ');
                      })()}
                    />
                  )}
                  <polyline
                    fill="none"
                    stroke={s.color}
                    strokeWidth={si === 1 ? 3 : 2}
                    strokeDasharray={si === 1 ? '' : '5,5'}
                    points={s.data.map((v, i) => {
                      const x = 50 + i * 160;
                      const y = 220 - (Math.max(0, v) / 600000000) * 180;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                </g>
              ))}
              {/* Points */}
              {scenarios.map((s, si) => (
                s.data.map((v, i) => {
                  const x = 50 + i * 160;
                  const y = 220 - (Math.max(0, v) / 600000000) * 180;
                  return (
                    <circle key={`${si}-${i}`} cx={x} cy={y} r="4" fill={s.color} />
                  );
                })
              ))}
              {/* Labels */}
              {forecast.map((f, i) => (
                <text key={i} x={50 + i * 160} y="255" textAnchor="middle" className="fs-xs" fill="var(--text-muted)">{f.semaine}</text>
              ))}
            </svg>
          </div>
          <div className="chart-legend">
            {scenarios.map(s => (
              <span key={s.label} className="chart-legend-item">
                <span className="chart-legend-dot" style={{ background: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau comparatif */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Soldes projetés par scénario</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Semaine</th>
              <th>Pessimiste (enc. -30%, déc. +10%)</th>
              <th>Réaliste</th>
              <th>Optimiste (enc. +20%, déc. -5%)</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((f, i) => (
              <tr key={f.semaine}>
                <td className="fw-600">{f.semaine} <span className="fs-xs text-muted">{f.label}</span></td>
                {scenarios.map(s => {
                  const v = s.data[i];
                  const cls = v < 0 ? 'text-danger fw-700' : v < 100000000 ? 'text-warning' : 'text-success';
                  return (
                    <td key={s.label} className={`cell-amount ${cls}`}>{formatMontant(v)}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alerte si scénario pessimiste négatif */}
      {minPess < 50000000 && (
        <div style={{ padding: '16px 20px', background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--radius-lg)', marginTop: '20px' }}>
          <div className="fw-600 text-danger"> Risque identifié en scénario pessimiste</div>
          <div className="fs-sm text-muted mt-8">Le solde pourrait descendre à {formatMontant(minPess)}. Prévoir une ligne de financement court terme ou accélérer les encaissements.</div>
        </div>
      )}
    </div>
  );
}
