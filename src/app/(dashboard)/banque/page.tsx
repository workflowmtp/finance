'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, KpiCard, Btn, ScoreGauge } from '@/components/ui';
import { formatMontant, formatCompact, formatPct, formatDate, getRapColor } from '@/lib/format';
import { getComptesWithBanques, getBankTransactions } from '@/lib/data';

const TABS = [
  { id: 'vue', label: 'Vue multi-banques', icon: ' ', href: '/banque' },
  { id: 'rapprochement', label: 'Rapprochements', icon: ' ', href: '/banque/rapprochement' },
  { id: 'orphelins', label: 'Orphelins', icon: ' ', href: '/banque/orphelins' },
];

export default function BanquePage() {
  const router = useRouter();
  const comptes = getComptesWithBanques() as any[];
  const transactions = getBankTransactions() as any[];

  const totalCompta = comptes.reduce((s: number, c: any) => s + c.solde_comptable, 0);
  const totalReleve = comptes.reduce((s: number, c: any) => s + c.solde_releve, 0);
  const totalEcart = comptes.reduce((s: number, c: any) => s + Math.abs(c.solde_releve - c.solde_comptable), 0);
  const avgRap = comptes.length > 0 ? comptes.reduce((s: number, c: any) => s + c.taux_rapprochement, 0) / comptes.length : 0;
  const nonRap = comptes.reduce((s: number, c: any) => s + c.nb_non_rapproches, 0);
  const lowRap = comptes.filter(c => c.taux_rapprochement < 90);

  return (
    <div>
      <PageHeader
        breadcrumb="Banque > Vue multi-banques"
        title="Position Bancaire Multi-Comptes"
        subtitle={`${comptes.length} comptes - 5 banques - Position au 28/03/2025`}
        actions={
          <>
            <Btn variant="secondary" size="sm" href="/tresorerie"> Trésorerie</Btn>
            <Btn variant="primary" size="sm" href="/agent-ia"> IA</Btn>
          </>
        }
      />

      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'rapprochement' ? String(nonRap) : undefined,
          badgeColor: t.id === 'rapprochement' ? 'var(--warning)' : undefined,
        }))}
        activeId="vue"
      />

      {/* Decision banner */}
      {lowRap.length > 0 && (
        <div className="decision-banner warning" style={{ marginBottom: '20px' }}>
          <span className="decision-banner-icon"> </span>
          <div className="decision-banner-content">
            <div className="decision-banner-title text-warning">{lowRap.length} compte(s) avec rapprochement {'<'} 90%</div>
            <div className="decision-banner-text">{nonRap} mouvements non rapprochés - Écart total : {formatMontant(totalEcart)}</div>
            <div className="decision-banner-actions">
              <Btn variant="secondary" size="sm" href="/banque/rapprochement">Rapprochements</Btn>
              <Btn variant="secondary" size="sm" href="/clotures">Impact clôture</Btn>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <KpiCard color="blue" icon=" " value={formatMontant(totalCompta)} label="Solde comptable total" href="/tresorerie" />
        <KpiCard color="cyan" icon=" " value={formatMontant(totalReleve)} label="Solde relevés total" />
        <KpiCard color="orange" icon=" " value={formatMontant(totalEcart)} label="Écart total absolu" href="/banque/rapprochement" />
        <KpiCard color="green" icon=" " value={formatPct(avgRap)} label="Taux rap. moyen" />
        <KpiCard color="red" icon=" " value={String(nonRap)} label="Mvts non rapprochés" href="/banque/orphelins" />
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Comptes bancaires</span>
          <span className="data-table-count">{comptes.length}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Banque</th>
                <th>Libellé</th>
                <th>OHADA</th>
                <th>Solde comptable</th>
                <th>Solde relevé</th>
                <th>Écart</th>
                <th>Rapprochement</th>
                <th>Non rap.</th>
                <th>Relevé</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {comptes.map((c: any) => {
                const ec = c.solde_releve - c.solde_comptable;
                const rowCls = c.taux_rapprochement >= 95 ? '' : c.taux_rapprochement >= 85 ? 'row-eleve' : 'row-critique';
                const rapCol = c.taux_rapprochement >= 95 ? '#10B981' : c.taux_rapprochement >= 85 ? '#F59E0B' : '#EF4444';
                const ecCol = Math.abs(ec) < 100000 ? '#10B981' : Math.abs(ec) < 3000000 ? '#F59E0B' : '#EF4444';

                return (
                  <tr key={c.id} className={rowCls} style={{ cursor: 'pointer' }}>
                    <td className="fw-600" style={{ color: 'var(--secondary)' }}>{c.banqueNom}</td>
                    <td className="fs-sm">{c.libelle}</td>
                    <td className="cell-mono fs-xs">{c.compte_ohada}</td>
                    <td className="cell-amount">{formatMontant(c.solde_comptable)}</td>
                    <td className="cell-amount">{formatMontant(c.solde_releve)}</td>
                    <td className="cell-amount fw-600" style={{ color: ecCol, whiteSpace: 'nowrap' }}>{(ec >= 0 ? '+' : '') + formatMontant(ec)}</td>
                    <td style={{ minWidth: '120px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className="progress-bar-wrapper" style={{ width: '50px' }}>
                          <div className="progress-bar-fill" style={{ width: `${c.taux_rapprochement}%`, background: rapCol }} />
                        </div>
                        <span className="cell-mono fs-xs fw-600" style={{ color: rapCol }}>{c.taux_rapprochement.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className={`cell-mono ${c.nb_non_rapproches > 0 ? 'text-danger fw-600' : 'text-success'}`}>{c.nb_non_rapproches}</td>
                    <td className="cell-mono fs-xs">{formatDate(c.date_releve)}</td>
                    <td><Btn variant="secondary" size="sm">Fiche</Btn></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2">
        {/* Bar chart */}
        <div className="widget">
          <div className="widget-header">
            <span className="widget-title"> Taux rapprochement</span>
            <Btn variant="secondary" size="sm" href="/banque/rapprochement">Rapprocher {'>'}</Btn>
          </div>
          <div className="widget-body">
            <div className="chart-wrapper">
              <svg viewBox="0 0 500 200" style={{ width: '100%', height: '200px' }}>
                {comptes.map((c: any, i: number) => {
                  const barHeight = (c.taux_rapprochement / 100) * 150;
                  const barColor = c.taux_rapprochement >= 95 ? '#10B981' : c.taux_rapprochement >= 85 ? '#F59E0B' : '#EF4444';
                  const barX = 50 + i * 90;
                  return (
                    <g key={i}>
                      <rect x={barX} y={170 - barHeight} width="60" height={barHeight} fill={barColor} rx="4" />
                      <text x={barX + 30} y="190" textAnchor="middle" className="fs-xs" fill="var(--text-muted)">{c.banqueCode}</text>
                      <text x={barX + 30} y={165 - barHeight} textAnchor="middle" className="fs-xs fw-600" fill={barColor}>{c.taux_rapprochement.toFixed(0)}%</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Donut chart */}
        <div className="widget">
          <div className="widget-header">
            <span className="widget-title"> Répartition soldes</span>
            <Btn variant="secondary" size="sm" href="/tresorerie">Trésorerie {'>'}</Btn>
          </div>
          <div className="widget-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '140px', height: '140px', position: 'relative' }}>
              <svg viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="70" cy="70" r="60" fill="none" stroke="var(--border)" strokeWidth="12" />
                {(() => {
                  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#06B6D4'];
                  let offset = 0;
                  return comptes.map((c: any, i: number) => {
                    const pct = (c.solde_comptable / totalCompta) * 100;
                    const dashArray = `${(pct / 100) * 377} 377`;
                    const dashOffset = -(offset / 100) * 377;
                    offset += pct;
                    return (
                      <circle key={i} cx="70" cy="70" r="60" fill="none" stroke={colors[i % colors.length]} strokeWidth="12"
                        strokeDasharray={dashArray} strokeDashoffset={dashOffset} />
                    );
                  });
                })()}
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div className="fw-700" style={{ fontSize: '16px' }}>{formatCompact(totalCompta)}</div>
              </div>
            </div>
            <div className="chart-legend" style={{ marginTop: '12px' }}>
              {comptes.map((c: any, i: number) => {
                const colors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#06B6D4'];
                return (
                  <span key={i} className="chart-legend-item">
                    <span className="chart-legend-dot" style={{ background: colors[i % colors.length] }} />
                    {c.banqueCode} ({formatCompact(c.solde_comptable)})
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Related module links */}
      <div className="grid-2" style={{ marginTop: '16px' }}>
        <div className="widget" style={{ borderLeft: '3px solid var(--secondary)' }}>
          <div className="widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
            <div>
              <div className="fw-600"> Relevés bancaires</div>
              <div className="fs-xs text-muted">Voir les relevés scannés et avis de débit/crédit</div>
            </div>
            <Btn variant="secondary" size="sm" href="/documents">Documents {'>'}</Btn>
          </div>
        </div>
        <div className="widget" style={{ borderLeft: '3px solid var(--info)' }}>
          <div className="widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
            <div>
              <div className="fw-600"> Impact DSF - T5</div>
              <div className="fs-xs text-muted">Rapprochements non finalisés impactent T5</div>
            </div>
            <Btn variant="secondary" size="sm" href="/dsf">DSF {'>'}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
