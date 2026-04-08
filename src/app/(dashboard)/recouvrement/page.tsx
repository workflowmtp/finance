'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, KpiCard, Btn } from '@/components/ui';
import { formatMontant, formatCompact, formatPct, getRiskColor } from '@/lib/format';
import { getAllClients, getDashboardKpis, getPoles } from '@/lib/data';

const TABS = [
  { id: 'portefeuille', label: ' Portefeuille', icon: ' ', href: '/recouvrement' },
  { id: 'echeancier', label: ' Échéancier', icon: ' ', href: '/recouvrement/echeancier' },
  { id: 'relances', label: ' Relances', icon: ' ', href: '/recouvrement/relances' },
  { id: 'risques', label: ' Risques', icon: ' ', href: '/recouvrement/risques' },
];

export default function RecouvrementPage() {
  const router = useRouter();
  const clients = getAllClients() as any[];
  const poles = getPoles ? getPoles() : [];
  const kpis = getDashboardKpis();

  const contentieux = clients.filter(c => c.statut === 'Contentieux');
  const bloques = clients.filter(c => c.statut === 'Bloqué');
  const surveilles = clients.filter(c => c.statut === 'Surveillé');

  // Balance âgée
  let age0_30 = 0, age30_60 = 0, age60_90 = 0, age90p = 0;
  for (const c of clients) {
    if (c.retard_moyen <= 30) age0_30 += c.echeance_echue;
    else if (c.retard_moyen <= 60) age30_60 += c.echeance_echue;
    else if (c.retard_moyen <= 90) age60_90 += c.echeance_echue;
    else age90p += c.echeance_echue;
  }

  // DSO pondéré
  let totalRetPond = 0, totalEchPond = 0;
  for (const c of clients) {
    if (c.echeance_echue > 0) {
      totalRetPond += c.retard_moyen * c.echeance_echue;
      totalEchPond += c.echeance_echue;
    }
  }
  const dso = totalEchPond > 0 ? Math.round(totalRetPond / totalEchPond) : 0;

  const totalEnc = clients.reduce((s, c) => s + (c.encours || 0), 0);
  const echues = clients.reduce((s, c) => s + (c.echeance_echue || 0), 0);

  // Filtres
  const [filterStatut, setFilterStatut] = useState('tous');
  const [filterPole, setFilterPole] = useState('tous');
  const [filterSearch, setFilterSearch] = useState('');

  // Tri et filtrage
  const sorted = [...clients].sort((a, b) => (b.echeance_echue * b.score_risque) - (a.echeance_echue * a.score_risque));
  const filtered = sorted.filter(c => {
    if (filterStatut !== 'tous' && c.statut !== filterStatut) return false;
    if (filterPole !== 'tous' && c.pole !== filterPole) return false;
    if (filterSearch && !c.raisonSociale.toLowerCase().includes(filterSearch.toLowerCase())) return false;
    return true;
  });

  // Encours par pôle
  const byPole: Record<string, number> = {};
  for (const c of clients) {
    if (c.echeance_echue > 0) {
      byPole[c.pole] = (byPole[c.pole] || 0) + c.echeance_echue;
    }
  }

  return (
    <div>
      <PageHeader
        breadcrumb="Recouvrement > Portefeuille clients"
        title="Portefeuille Recouvrement"
        subtitle={`${clients.length} clients - Encours : ${formatMontant(totalEnc)} - Échu : ${formatMontant(echues)}`}
        actions={
          <>
            <Btn variant="secondary" size="sm"> Export</Btn>
            <Btn variant="primary" size="sm" href="/agent-ia"> Plan relance IA</Btn>
          </>
        }
      />

      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'portefeuille' ? String(clients.length) :
                 t.id === 'relances' ? String(12) : undefined,
          badgeColor: t.id === 'relances' ? 'var(--secondary)' : undefined,
        }))}
        activeId="portefeuille"
      />

      {/* Decision banner */}
      {(contentieux.length > 0 || bloques.length > 0) && (
        <div className="decision-banner critical" style={{ marginBottom: '20px' }}>
          <span className="decision-banner-icon"> </span>
          <div className="decision-banner-content">
            <div className="decision-banner-title text-danger">{contentieux.length + bloques.length} clients critiques - {formatMontant(contentieux.reduce((s, c) => s + c.echeance_echue, 0) + bloques.reduce((s, c) => s + c.echeance_echue, 0))} en risque</div>
            <div className="decision-banner-text">{contentieux.length} en contentieux, {bloques.length} bloqué(s). Impact trésorerie direct.</div>
            <div className="decision-banner-actions">
              <Btn variant="danger" size="sm" href="/recouvrement/risques">Clients à risque</Btn>
              <Btn variant="secondary" size="sm" href="/tresorerie/tensions">Impact trésorerie</Btn>
            </div>
          </div>
        </div>
      )}

      {/* KPIs 6 colonnes */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        <KpiCard color="blue" icon=" " value={String(clients.length)} label="Clients" />
        <KpiCard color="orange" icon=" " value={formatMontant(totalEnc)} label="Encours total" />
        <KpiCard color="red" icon=" " value={formatMontant(echues)} label="Échu" trend={formatPct(echues / totalEnc * 100)} />
        <KpiCard color="purple" icon=" " value={`${dso}j`} label="DSO pondéré" trend="Délai moy." />
        <KpiCard color="red" icon=" " value={String(contentieux.length + bloques.length)} label="Contentieux/Bloqués" href="/recouvrement/risques" />
        <KpiCard color="green" icon=" " value={formatPct((totalEnc - echues) / totalEnc * 100)} label="Taux recouvrement" trend="non échu/total" />
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: '20px' }}>
        {/* Balance âgée */}
        <div className="widget">
          <div className="widget-header">
            <span className="widget-title"> Balance âgée des créances</span>
          </div>
          <div className="widget-body">
            <div className="chart-wrapper">
              <svg viewBox="0 0 400 200" style={{ width: '100%', height: '200px' }}>
                {(() => {
                  const ageData = [
                    { label: '0-30j', value: age0_30, color: '#10B981' },
                    { label: '30-60j', value: age30_60, color: '#F59E0B' },
                    { label: '60-90j', value: age60_90, color: '#EF4444' },
                    { label: '>90j', value: age90p, color: '#7C3AED' },
                  ];
                  const maxVal = Math.max(...ageData.map(a => a.value), 1);
                  return ageData.map((a, i) => {
                    const barHeight = (a.value / maxVal) * 150;
                    const barX = 40 + i * 90;
                    return (
                      <g key={i}>
                        <rect x={barX} y={170 - barHeight} width="60" height={barHeight} fill={a.color} rx="4" />
                        <text x={barX + 30} y="190" textAnchor="middle" className="fs-xs" fill="var(--text-muted)">{a.label}</text>
                        <text x={barX + 30} y={165 - barHeight} textAnchor="middle" className="fs-xs fw-600" fill={a.color}>{formatCompact(a.value)}</text>
                      </g>
                    );
                  });
                })()}
              </svg>
            </div>
            <div className="chart-legend">
              {[
                { label: '0-30j', value: age0_30, color: '#10B981' },
                { label: '30-60j', value: age30_60, color: '#F59E0B' },
                { label: '60-90j', value: age60_90, color: '#EF4444' },
                { label: '>90j', value: age90p, color: '#7C3AED' },
              ].map((a, i) => (
                <span key={i} className="chart-legend-item">
                  <span className="chart-legend-dot" style={{ background: a.color }} />
                  {a.label} ({formatCompact(a.value)})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Donut par pôle */}
        <div className="widget">
          <div className="widget-header">
            <span className="widget-title"> Encours échu par pôle</span>
          </div>
          <div className="widget-body" style={{ display: 'flex', alignItems: 'center', gap: '24px', justifyContent: 'center' }}>
            <div style={{ width: '120px', height: '120px', position: 'relative' }}>
              <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="10" />
                {(() => {
                  let offset = 0;
                  const totalPole = Object.values(byPole).reduce((s: number, v) => s + v, 0) || 1;
                  return Object.entries(byPole).map(([pole, value], i) => {
                    const pct = (value / totalPole) * 100;
                    const dashArray = `${(pct / 100) * 314} 314`;
                    const dashOffset = -(offset / 100) * 314;
                    offset += pct;
                    const poleData = poles.find((p: any) => p.code === pole);
                    return (
                      <circle key={pole} cx="60" cy="60" r="50" fill="none" stroke={poleData?.color || '#3B82F6'} strokeWidth="10"
                        strokeDasharray={dashArray} strokeDashoffset={dashOffset} />
                    );
                  });
                })()}
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div className="fw-700" style={{ fontSize: '14px' }}>{formatCompact(echues)}</div>
              </div>
            </div>
            <div>
              {poles.filter((p: any) => byPole[p.code] > 0).map((p: any) => (
                <div key={p.code} className="fs-xs mb-8">
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: p.color, marginRight: '6px' }} />
                  {p.label} ({formatCompact(byPole[p.code] || 0)})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="filters-bar">
        <div className="filter-item">
          <span className="filter-label">Statut</span>
          <select className="filter-select" value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
            <option value="tous">Tous</option>
            <option value="Actif">Actif</option>
            <option value="Surveillé">Surveillé</option>
            <option value="Contentieux">Contentieux</option>
            <option value="Bloqué">Bloqué</option>
          </select>
        </div>
        <div className="filter-item">
          <span className="filter-label">Pôle</span>
          <select className="filter-select" value={filterPole} onChange={e => setFilterPole(e.target.value)}>
            <option value="tous">Tous</option>
            {poles.map((p: any) => (
              <option key={p.code} value={p.code}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <span className="filter-label">Rechercher</span>
          <input
            type="text"
            className="form-input"
            placeholder="Nom client..."
            style={{ width: '160px', padding: '6px 10px', fontSize: '12px' }}
            value={filterSearch}
            onChange={e => setFilterSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Clients</span>
          <span className="data-table-count">{filtered.length}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Pôle</th>
                <th>Encours</th>
                <th>Échu</th>
                <th>Retard</th>
                <th>Score</th>
                <th>Relance</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const rC = c.score_risque >= 70 ? '#EF4444' : c.score_risque >= 40 ? '#F59E0B' : '#10B981';
                const rowCls = c.score_risque >= 70 ? 'row-critique' : c.score_risque >= 40 ? 'row-eleve' : '';
                const sBadge = c.statut === 'Actif' ? 'badge-conforme' : c.statut === 'Surveillé' ? 'badge-eleve' : c.statut === 'Contentieux' ? 'badge-critique' : 'badge-bloquant';

                return (
                  <tr key={c.id} className={rowCls} style={{ cursor: 'pointer' }}>
                    <td className="fw-600" style={{ color: 'var(--secondary)' }}>{c.raisonSociale}</td>
                    <td className="cell-mono fs-xs">{c.pole}</td>
                    <td className="cell-amount">{formatMontant(c.encours)}</td>
                    <td className={`cell-amount ${c.echeance_echue > 0 ? 'negative fw-600' : ''}`}>{formatMontant(c.echeance_echue)}</td>
                    <td className={`cell-mono ${c.retard_moyen > 30 ? 'text-danger fw-600' : c.retard_moyen > 15 ? 'text-warning' : ''}`}>{c.retard_moyen}j</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className="progress-bar-wrapper" style={{ width: '40px' }}>
                          <div className="progress-bar-fill" style={{ width: `${c.score_risque}%`, background: rC }} />
                        </div>
                        <span className="cell-mono fs-xs fw-600" style={{ color: rC }}>{c.score_risque}</span>
                      </div>
                    </td>
                    <td className="cell-mono">Niv.{c.niveau_relance}</td>
                    <td><span className={`badge ${sBadge}`}>{c.statut}</span></td>
                    <td><Btn variant="secondary" size="sm">Fiche</Btn></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
