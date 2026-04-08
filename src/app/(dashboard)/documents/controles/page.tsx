'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, KpiCard, Btn } from '@/components/ui';
import { formatPct } from '@/lib/format';

const TABS = [
  { id: 'scannes', label: 'Documents scannés', icon: ' ', href: '/documents' },
  { id: 'non-compta', label: 'Non comptabilisés', icon: ' ', href: '/documents/non-compta' },
  { id: 'controles', label: 'Contrôles', icon: ' ', href: '/documents/controles' },
];

const CONTROLES = [
  { num: 1, label: 'Document absent en comptabilité', gravite: 'Critique', count: 0, impact: 'T3, T16' },
  { num: 2, label: 'Écart de montant (hors tolérance)', gravite: 'Élevé', count: 0, impact: 'T1, T2' },
  { num: 3, label: 'TVA incorrecte (  19,25%)', gravite: 'Élevé', count: 0, impact: 'T19, T24' },
  { num: 4, label: 'Compte OHADA incorrect', gravite: 'Élevé', count: 0, impact: 'T1, T2' },
  { num: 5, label: 'Journal incohérent', gravite: 'Moyen', count: 0, impact: '-' },
  { num: 6, label: 'Tiers incohérent', gravite: 'Moyen', count: 0, impact: 'T10, T11' },
  { num: 7, label: 'Date incohérente (écart > 30j)', gravite: 'Moyen', count: 0, impact: '-' },
  { num: 8, label: 'Doublon probable', gravite: 'Élevé', count: 0, impact: 'T3, T4' },
  { num: 9, label: 'Pièce justificative manquante', gravite: 'Moyen', count: 0, impact: '-' },
  { num: 10, label: 'Document ancien non saisi (> 15j)', gravite: 'Critique', count: 0, impact: 'T3, T16' },
];

export default function ControlesPage() {
  const router = useRouter();

  const okCount = CONTROLES.filter(c => c.count === 0).length;
  const totalAlertes = CONTROLES.reduce((s, c) => s + c.count, 0);
  const critCount = CONTROLES.filter(c => c.count > 0 && c.gravite === 'Critique').reduce((s, c) => s + c.count, 0);
  const tauxConformite = (okCount / 10) * 100;

  return (
    <div>
      <PageHeader
        breadcrumb="Documents > Contrôles"
        title="Contrôles Automatiques Documents"
        subtitle="10 contrôles appliqués à chaque document scanné"
      />

      <ModuleTabs tabs={TABS} activeId="controles" />

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard color="green" icon=" " value={`${okCount}/10`} label="Contrôles OK" />
        <KpiCard color="red" icon=" " value={String(totalAlertes)} label="Total alertes" />
        <KpiCard color="red" icon=" " value={String(critCount)} label="Alertes critiques" />
        <KpiCard color="blue" icon=" " value={formatPct(tauxConformite)} label="Taux conformité" />
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Résultats des 10 contrôles</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Contrôle</th>
              <th>Gravité</th>
              <th>Détections</th>
              <th>Impact DSF</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {CONTROLES.map(c => {
              const gBadge = c.gravite === 'Critique' ? 'badge-critique' : c.gravite === 'Élevé' ? 'badge-eleve' : 'badge-moyen';
              const rowCls = c.count > 0 ? (c.gravite === 'Critique' ? 'row-critique' : 'row-eleve') : '';

              return (
                <tr key={c.num} className={rowCls}>
                  <td className="cell-mono fw-600">{c.num}</td>
                  <td className="fs-sm">{c.label}</td>
                  <td><span className={`badge ${gBadge}`}>{c.gravite}</span></td>
                  <td className={`cell-mono fw-600 ${c.count > 0 ? 'text-danger' : 'text-success'}`}>{c.count}</td>
                  <td className="fs-xs text-muted">{c.impact}</td>
                  <td>
                    {c.count === 0 ? (
                      <span className="badge badge-conforme"> OK</span>
                    ) : (
                      <span className="badge badge-critique badge-pulse">{c.count} alerte(s)</span>
                    )}
                  </td>
                  <td>
                    {c.count > 0 && (
                      <Btn variant="secondary" size="sm" href="/dashboard/alertes">Voir {'>'}</Btn>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Link to audit */}
      <div className="widget" style={{ marginTop: '16px', borderLeft: '3px solid var(--primary)' }}>
        <div className="widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
          <div>
            <div className="fw-600"> Audit documentaire</div>
            <div className="fs-xs text-muted">Consultez l'historique des contrôles et les anomalies détectées</div>
          </div>
          <Btn variant="secondary" size="sm" href="/audit">Audit {'>'}</Btn>
        </div>
      </div>
    </div>
  );
}
