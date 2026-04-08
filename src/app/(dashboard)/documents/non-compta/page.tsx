'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, KpiCard, Btn } from '@/components/ui';
import { formatMontant, formatDate } from '@/lib/format';
import { getDocumentsNonCompta } from '@/lib/data';

const TABS = [
  { id: 'scannes', label: 'Documents scannés', icon: ' ', href: '/documents' },
  { id: 'non-compta', label: 'Non comptabilisés', icon: ' ', href: '/documents/non-compta' },
  { id: 'controles', label: 'Contrôles', icon: ' ', href: '/documents/controles' },
];

const DOC_TYPE_LABELS: Record<string, string> = {
  FAC_FRN: 'Facture fournisseur',
  FAC_CLI: 'Facture client',
  AV_FRN: 'Avoir fournisseur',
  AV_CLI: 'Avoir client',
  RELEVE_BQ: 'Relevé bancaire',
  QUITTANCE: 'Quittance',
  BORD_LCR: 'Bordereau LCR',
  AV_DEB: 'Avis de débit',
  AV_CRE: 'Avis de crédit',
};

export default function NonComptaPage() {
  const router = useRouter();
  const docs = getDocumentsNonCompta() as any[];
  const total = docs.reduce((s: number, d: any) => s + d.montant_ttc, 0);
  const anciens = docs.filter(d => d.delai_jours > 15).length;
  const delaiMoyen = docs.length > 0 ? Math.round(docs.reduce((s: number, d: any) => s + d.delai_jours, 0) / docs.length) : 0;

  // Sort by delai desc
  const sorted = [...docs].sort((a, b) => b.delai_jours - a.delai_jours);

  return (
    <div>
      <PageHeader
        breadcrumb="Documents > Non comptabilisés"
        title="Documents Non Comptabilisés"
        subtitle={`${docs.length} documents en attente - Montant total : ${formatMontant(total)}`}
      />

      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'non-compta' ? String(docs.length) : undefined,
          badgeColor: t.id === 'non-compta' ? 'var(--danger)' : undefined,
        }))}
        activeId="non-compta"
      />

      {/* Decision banner */}
      {docs.length > 5 && (
        <div className="decision-banner critical" style={{ marginBottom: '20px' }}>
          <span className="decision-banner-icon"> </span>
          <div className="decision-banner-content">
            <div className="decision-banner-title text-danger">{docs.length} documents non comptabilisés - Impact clôture</div>
            <div className="decision-banner-text">Montant total : {formatMontant(total)}. Certaines pièces ont plus de 15 jours de retard.</div>
            <div className="decision-banner-actions">
              <Btn variant="danger" size="sm">Saisie en masse</Btn>
              <Btn variant="secondary" size="sm" href="/clotures">Impact clôture</Btn>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard color="red" icon=" " value={String(docs.length)} label="En attente de saisie" />
        <KpiCard color="red" icon=" " value={formatMontant(total)} label="Montant total" />
        <KpiCard color="red" icon=" " value={String(anciens)} label="Anciens (> 15j)" trend="Bloquant clôture" />
        <KpiCard color="orange" icon=" " value={`${delaiMoyen}j`} label="Délai moyen" />
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Documents en attente</span>
          <span className="data-table-count">{docs.length}</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Réf.</th>
              <th>Type</th>
              <th>Tiers</th>
              <th>Date</th>
              <th>Montant TTC</th>
              <th>Délai</th>
              <th>Urgence</th>
              <th>Impact</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d: any) => {
              const urgence = d.delai_jours > 15 ? 'critique' : d.delai_jours > 7 ? 'eleve' : 'moyen';
              const rowCls = urgence === 'critique' ? 'row-critique' : urgence === 'eleve' ? 'row-eleve' : 'row-moyen';
              const delaiPct = Math.min(100, (d.delai_jours / 20) * 100);
              const delaiCol = d.delai_jours > 15 ? '#EF4444' : d.delai_jours > 7 ? '#F59E0B' : '#10B981';

              // DSF impact
              const dsfT: number[] = [];
              if (d.type === 'FAC_FRN') { dsfT.push(3, 16); }
              else if (d.type === 'FAC_CLI') { dsfT.push(4); }
              else if (d.type.indexOf('BQ') >= 0 || d.type === 'AV_DEB' || d.type === 'AV_CRE') { dsfT.push(5, 21); }

              return (
                <tr key={d.id} className={rowCls}>
                  <td className="cell-mono fs-xs">{d.reference}</td>
                  <td className="fs-xs">{DOC_TYPE_LABELS[d.type] || d.type}</td>
                  <td className="fs-sm fw-600">{d.tiers}</td>
                  <td className="cell-mono fs-xs">{formatDate(d.date_doc)}</td>
                  <td className="cell-amount">{formatMontant(d.montant_ttc)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div className="progress-bar-wrapper" style={{ width: '30px', height: '4px' }}>
                        <div className="progress-bar-fill" style={{ width: `${delaiPct}%`, background: delaiCol }} />
                      </div>
                      <span className="cell-mono fs-xs fw-600" style={{ color: delaiCol }}>{d.delai_jours}j</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${urgence}`}>{urgence === 'critique' ? 'Critique' : urgence === 'eleve' ? 'Élevé' : 'Moyen'}</span>
                  </td>
                  <td>
                    {dsfT.length > 0 ? (
                      dsfT.map(t => <span key={t} className="badge badge-eleve" style={{ padding: '1px 4px', fontSize: '9px', marginRight: '2px' }}>T{t}</span>)
                    ) : (
                      <span className="text-muted fs-xs">-</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <Btn variant="primary" size="sm">Saisir</Btn>
                      <Btn variant="secondary" size="sm">Fiche</Btn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
