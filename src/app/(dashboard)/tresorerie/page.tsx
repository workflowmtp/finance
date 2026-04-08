'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, KpiCard, Btn } from '@/components/ui';
import { formatMontant, formatCompact, formatPct } from '@/lib/format';
import { getComptesWithBanques, getTreasuryForecast } from '@/lib/data';

const TABS = [
  { id: 'situation', label: 'Situation', icon: ' ', href: '/tresorerie' },
  { id: 'previsions', label: 'Prévisions', icon: ' ', href: '/tresorerie/previsions' },
  { id: 'tensions', label: 'Tensions', icon: ' ', href: '/tresorerie/tensions' },
  { id: 'scenarios', label: 'Scénarios', icon: ' ', href: '/tresorerie/scenarios' },
];

export default function TresoreriePage() {
  const router = useRouter();
  const comptes = getComptesWithBanques() as any[];
  const forecast = getTreasuryForecast() as any[];

  const totalSolde = comptes.reduce((s: number, c: any) => s + c.solde_comptable, 0);
  const cashMob = totalSolde - 8500000; // chèques en circulation
  const dispoImm = cashMob - 12000000; // effets en attente
  const tensionMax = forecast.length > 0 ? Math.max(...forecast.map((f: any) => f.tension)) : 0;

  return (
    <div>
      <PageHeader
        breadcrumb="Trésorerie > Situation instantanée"
        title="Situation de Trésorerie"
        subtitle="Position en temps réel - 28 mars 2025"
      />

      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'tensions' && tensionMax >= 30 ? `${tensionMax}%` : undefined,
          badgeColor: tensionMax >= 50 ? 'var(--danger)' : 'var(--warning)',
        }))}
        activeId="situation"
      />

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard color="blue" icon=" " value={formatMontant(totalSolde)} label="Position bancaire totale" />
        <KpiCard color="green" icon=" " value={formatMontant(cashMob)} label="Cash mobilisable" trend="Hors chèques circulation" />
        <KpiCard color="cyan" icon=" " value={formatMontant(dispoImm)} label="Disponibilités immédiates" trend="Hors effets en attente" />
        <KpiCard color="orange" icon=" " value="5" label="Comptes actifs" trend="4 banques" />
      </div>

      {/* Tableau soldes par compte */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Soldes par compte bancaire</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Banque</th>
              <th>Compte</th>
              <th>OHADA</th>
              <th>Solde comptable</th>
              <th>% du total</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {comptes.map((cb: any) => {
              const pct = (cb.solde_comptable / totalSolde) * 100;
              return (
                <tr key={cb.id}>
                  <td className="fw-600">{cb.banqueNom}</td>
                  <td className="fs-sm">{cb.libelle}</td>
                  <td className="cell-mono fs-xs">{cb.compte_ohada}</td>
                  <td className="cell-amount fw-600">{formatMontant(cb.solde_comptable)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="progress-bar-wrapper" style={{ width: '100px' }}>
                        <div className="progress-bar-fill blue" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="cell-mono fs-xs">{pct.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td><span className="badge badge-conforme">Actif</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Charts */}
      <div className="grid-2">
        {/* Donut répartition */}
        <div className="widget">
          <div className="widget-header">
            <span className="widget-title">Répartition par banque</span>
          </div>
          <div className="widget-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '160px', height: '160px', position: 'relative' }}>
              <svg viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="80" cy="80" r="70" fill="none" stroke="var(--border)" strokeWidth="14" />
                {(() => {
                  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#06B6D4'];
                  let offset = 0;
                  return comptes.map((c: any, i: number) => {
                    const pct = (c.solde_comptable / totalSolde) * 100;
                    const dashArray = `${(pct / 100) * 440} 440`;
                    const dashOffset = -(offset / 100) * 440;
                    offset += pct;
                    return (
                      <circle key={i} cx="80" cy="80" r="70" fill="none" stroke={colors[i % colors.length]} strokeWidth="14"
                        strokeDasharray={dashArray} strokeDashoffset={dashOffset} />
                    );
                  });
                })()}
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div className="fw-700" style={{ fontSize: '18px' }}>{formatCompact(totalSolde)}</div>
              </div>
            </div>
            <div className="chart-legend" style={{ marginTop: '12px' }}>
              {comptes.map((c: any, i: number) => {
                const colors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#06B6D4'];
                return (
                  <span key={i} className="chart-legend-item">
                    <span className="chart-legend-dot" style={{ background: colors[i % colors.length] }} />
                    {c.banqueCode}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Evolution T1 2025 */}
        <div className="widget">
          <div className="widget-header">
            <span className="widget-title">Évolution trésorerie T1 2025</span>
          </div>
          <div className="widget-body">
            <div className="chart-wrapper">
              <svg viewBox="0 0 400 200" style={{ width: '100%', height: '200px' }}>
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line key={i} x1="40" y1={20 + i * 40} x2="380" y2={20 + i * 40} stroke="var(--border-light)" strokeWidth="1" />
                ))}
                {/* Line chart */}
                <polyline
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  points="60,80 180,100 300,60"
                />
                {/* Area fill */}
                <polygon
                  fill="rgba(59,130,246,0.1)"
                  points="60,180 60,80 180,100 300,60 300,180"
                />
                {/* Data points */}
                <circle cx="60" cy="80" r="6" fill="#3B82F6" />
                <circle cx="180" cy="100" r="6" fill="#3B82F6" />
                <circle cx="300" cy="60" r="6" fill="#3B82F6" />
                {/* Labels */}
                <text x="60" y="195" textAnchor="middle" className="fs-xs" fill="var(--text-muted)">Jan</text>
                <text x="180" y="195" textAnchor="middle" className="fs-xs" fill="var(--text-muted)">Fév</text>
                <text x="300" y="195" textAnchor="middle" className="fs-xs" fill="var(--text-muted)">Mars</text>
                {/* Values */}
                <text x="60" y="70" textAnchor="middle" className="fs-xs fw-600" fill="#3B82F6">540M</text>
                <text x="180" y="90" textAnchor="middle" className="fs-xs fw-600" fill="#3B82F6">505M</text>
                <text x="300" y="50" textAnchor="middle" className="fs-xs fw-600" fill="#3B82F6">{formatCompact(totalSolde)}</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
