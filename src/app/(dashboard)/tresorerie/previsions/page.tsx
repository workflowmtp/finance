'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs } from '@/components/ui';
import { formatMontant, formatCompact } from '@/lib/format';
import { getTreasuryForecast, getTreasuryDetail, getComptesWithBanques } from '@/lib/data';

const TABS = [
  { id: 'situation', label: 'Situation', icon: ' ', href: '/tresorerie' },
  { id: 'previsions', label: 'Prévisions', icon: ' ', href: '/tresorerie/previsions' },
  { id: 'tensions', label: 'Tensions', icon: ' ', href: '/tresorerie/tensions' },
  { id: 'scenarios', label: 'Scénarios', icon: ' ', href: '/tresorerie/scenarios' },
];

export default function PrevisionsPage() {
  const router = useRouter();
  const forecast = getTreasuryForecast() as any[];
  const detail = getTreasuryDetail ? getTreasuryDetail() as any[] : [];

  // Lignes d'encaissements (ordre défini)
  const encLines = ['Clients — factures échues', 'Clients — promesses paiement', 'Autres encaissements'];
  
  // Lignes de décaissements extraites dynamiquement de TREASURY_DETAIL
  const decLinesSet = new Set<string>();
  for (const d of detail) {
    if (d.type === 'decaissement') decLinesSet.add(d.ligne);
  }
  const decLines = Array.from(decLinesSet);

  return (
    <div>
      <PageHeader
        breadcrumb="Trésorerie > Prévisions glissantes"
        title="Prévisions de Trésorerie"
        subtitle="Vue détaillée S+1 à S+4 - Scénario réaliste"
      />

      <ModuleTabs tabs={TABS} activeId="previsions" />

      {/* Tableau prévisionnel détaillé */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Prévisions glissantes</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ligne</th>
              {forecast.map(f => (
                <th key={f.semaine} style={{ textAlign: 'right' }}>
                  {f.semaine}<br /><span className="fs-xs text-muted">{f.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Solde ouverture */}
            <tr style={{ background: 'rgba(59,130,246,0.05)' }}>
              <td className="fw-600">Solde d&apos;ouverture</td>
              {forecast.map(f => (
                <td key={f.semaine} className="cell-amount fw-600">{formatMontant(f.solde_ouverture)}</td>
              ))}
            </tr>

            {/* Encaissements */}
            <tr>
              <td className="fw-600 text-success" colSpan={forecast.length + 1}> Encaissements</td>
            </tr>
            {encLines.map(line => (
              <tr key={line}>
                <td className="fs-sm" style={{ paddingLeft: '24px' }}>{line}</td>
                {forecast.map(f => {
                  const td = detail.find(d => d.semaine === f.semaine && d.ligne === line);
                  return (
                    <td key={f.semaine} className="cell-amount positive fs-sm">
                      {td ? formatMontant(td.montant) : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Total encaissements */}
            <tr style={{ borderTop: '2px solid var(--border)' }}>
              <td className="fw-600">Total encaissements</td>
              {forecast.map(f => (
                <td key={f.semaine} className="cell-amount positive fw-600">{formatMontant(f.encaissements)}</td>
              ))}
            </tr>

            {/* Décaissements */}
            <tr>
              <td className="fw-600 text-danger" colSpan={forecast.length + 1}> Décaissements</td>
            </tr>
            {decLines.map(line => (
              <tr key={line}>
                <td className="fs-sm" style={{ paddingLeft: '24px' }}>{line}</td>
                {forecast.map(f => {
                  const td = detail.find(d => d.semaine === f.semaine && d.ligne === line);
                  return (
                    <td key={f.semaine} className="cell-amount negative fs-sm">
                      {td ? formatMontant(td.montant) : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Total décaissements */}
            <tr style={{ borderTop: '2px solid var(--border)' }}>
              <td className="fw-600">Total décaissements</td>
              {forecast.map(f => (
                <td key={f.semaine} className="cell-amount negative fw-600">{formatMontant(f.decaissements)}</td>
              ))}
            </tr>

            {/* Solde projeté */}
            <tr style={{ background: 'rgba(16,185,129,0.05)', borderTop: '3px solid var(--primary)' }}>
              <td className="fw-700" style={{ fontSize: '14px' }}>Solde projeté</td>
              {forecast.map(f => {
                const sf = f.solde_fermeture;
                const cls = sf < 0 ? 'negative' : sf < 100000000 ? '' : 'positive';
                return (
                  <td key={f.semaine} className={`cell-amount fw-700 ${cls}`} style={{ fontSize: '14px' }}>
                    {formatMontant(sf)}
                  </td>
                );
              })}
            </tr>

            {/* Tension */}
            <tr>
              <td className="fw-600">Niveau de tension</td>
              {forecast.map(f => {
                const t = f.tension;
                const tColor = t > 50 ? 'text-danger' : t > 20 ? 'text-warning' : 'text-success';
                return (
                  <td key={f.semaine} className={`cell-mono fw-700 ${tColor}`} style={{ textAlign: 'right' }}>
                    {t}/100
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Graphique */}
      <div className="widget">
        <div className="widget-header">
          <span className="widget-title"> Courbe de trésorerie prévisionnelle</span>
        </div>
        <div className="widget-body">
          <div className="chart-wrapper">
            <svg viewBox="0 0 700 220" style={{ width: '100%', height: '220px' }}>
              {/* Grid */}
              {[0, 1, 2, 3, 4].map(i => (
                <line key={i} x1="50" y1={20 + i * 40} x2="680" y2={20 + i * 40} stroke="var(--border-light)" strokeWidth="1" />
              ))}
              {/* Area */}
              <polygon
                fill="rgba(59,130,246,0.1)"
                points={(() => {
                  const pts = ['50,200'];
                  forecast.forEach((f, i) => {
                    const x = 50 + i * 160;
                    const y = 200 - (Math.max(0, f.solde_fermeture) / 600000000) * 160;
                    pts.push(`${x},${y}`);
                  });
                  pts.push(`${50 + (forecast.length - 1) * 160},200`);
                  return pts.join(' ');
                })()}
              />
              {/* Line */}
              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
                points={forecast.map((f, i) => {
                  const x = 50 + i * 160;
                  const y = 200 - (Math.max(0, f.solde_fermeture) / 600000000) * 160;
                  return `${x},${y}`;
                }).join(' ')}
              />
              {/* Points and labels */}
              {forecast.map((f, i) => {
                const x = 50 + i * 160;
                const y = 200 - (Math.max(0, f.solde_fermeture) / 600000000) * 160;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="6" fill="#3B82F6" />
                    <text x={x} y="215" textAnchor="middle" className="fs-xs" fill="var(--text-muted)">{f.semaine}</text>
                    <text x={x} y={y - 12} textAnchor="middle" className="fs-xs fw-600" fill="#3B82F6">{formatCompact(f.solde_fermeture)}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
