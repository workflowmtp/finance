'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, KpiCard, Btn } from '@/components/ui';
import { formatMontant, formatDate, formatPct } from '@/lib/format';
import { getAllDocuments, getDocumentsNonCompta, getDocumentsByType } from '@/lib/data';

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

const STATUT_BADGES: Record<string, { label: string; cls: string }> = {
  conforme: { label: 'Conforme', cls: 'badge-conforme' },
  ecart: { label: 'Écart', cls: 'badge-ecart' },
  critique: { label: 'Critique', cls: 'badge-critique' },
  non_comptabilise: { label: 'Non comptab.', cls: 'badge-non-comptabilise' },
};

export default function DocumentsPage() {
  const router = useRouter();
  const docs = getAllDocuments() as any[];
  const nonCompta = getDocumentsNonCompta();
  const byType = getDocumentsByType();

  const conformes = docs.filter(d => d.statut === 'conforme').length;
  const ecarts = docs.filter(d => d.statut === 'ecart').length;
  const critiques = docs.filter(d => d.statut === 'critique').length;
  const nonComptaCount = nonCompta.length;

  return (
    <div>
      <PageHeader
        breadcrumb="Documents > Documents scannés"
        title="Documents Comptables"
        subtitle="Gestion des pièces comptables et contrôle documentaire - Mars 2025"
        actions={
          <>
            <Btn variant="secondary" size="sm"> Export</Btn>
            <Btn variant="primary" size="sm" href="/agent-ia"> Analyse IA</Btn>
          </>
        }
      />

      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'scannes' ? String(docs.length) : t.id === 'non-compta' ? String(nonComptaCount) : undefined,
          badgeColor: t.id === 'non-compta' ? 'var(--danger)' : undefined,
        }))}
        activeId="scannes"
      />

      {/* Drop zone */}
      <div style={{
        border: '2px dashed var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        textAlign: 'center',
        marginBottom: '20px',
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}> </div>
        <div className="fw-600" style={{ color: 'var(--text-secondary)' }}>Glisser-déposer vos documents ici</div>
        <div className="fs-xs text-muted mt-4">Factures, relevés, quittances, bordereaux - PDF, JPG, PNG</div>
        <Btn variant="secondary" size="sm" style={{ marginTop: '12px' }}>Ou cliquez pour parcourir</Btn>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <KpiCard color="blue" icon=" " value={String(docs.length)} label="Total documents" />
        <KpiCard color="green" icon=" " value={String(conformes)} label="Conformes" trend={formatPct(conformes / docs.length * 100)} />
        <KpiCard color="orange" icon=" " value={String(ecarts)} label="Avec écarts" />
        <KpiCard color="red" icon=" " value={String(critiques)} label="Critiques" />
        <KpiCard color="purple" icon=" " value={String(nonComptaCount)} label="Non comptabilisés" href="/documents/non-compta" />
      </div>

      {/* Charts row */}
      <div className="grid-2" style={{ marginBottom: '20px' }}>
        {/* Donut par statut */}
        <div className="widget">
          <div className="widget-header"><span className="widget-title"> Répartition par statut</span></div>
          <div className="widget-body" style={{ display: 'flex', alignItems: 'center', gap: '24px', justifyContent: 'center' }}>
            <div style={{ width: '120px', height: '120px', position: 'relative' }}>
              <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="10" />
                {[
                  { value: conformes, color: '#10B981', offset: 0 },
                  { value: ecarts, color: '#F59E0B', offset: (conformes / docs.length) * 100 },
                  { value: critiques, color: '#EF4444', offset: ((conformes + ecarts) / docs.length) * 100 },
                  { value: nonComptaCount, color: '#64748B', offset: ((conformes + ecarts + critiques) / docs.length) * 100 },
                ].map((seg, i) => (
                  <circle
                    key={i}
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="10"
                    strokeDasharray={`${(seg.value / docs.length) * 314} 314`}
                    strokeDashoffset={-(seg.offset / 100) * 314}
                  />
                ))}
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div className="fw-700" style={{ fontSize: '20px' }}>{docs.length}</div>
              </div>
            </div>
            <div>
              <div className="mb-8" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                <span className="fs-sm">Conformes ({conformes})</span>
              </div>
              <div className="mb-8" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
                <span className="fs-sm">Écarts ({ecarts})</span>
              </div>
              <div className="mb-8" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                <span className="fs-sm">Critiques ({critiques})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#64748B', display: 'inline-block' }} />
                <span className="fs-sm">Non comptab. ({nonComptaCount})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Donut par type */}
        <div className="widget">
          <div className="widget-header"><span className="widget-title"> Répartition par type</span></div>
          <div className="widget-body" style={{ display: 'flex', alignItems: 'center', gap: '24px', justifyContent: 'center' }}>
            <div style={{ width: '120px', height: '120px', position: 'relative' }}>
              <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="10" />
              </svg>
            </div>
            <div style={{ maxHeight: '140px', overflowY: 'auto' }}>
              {Object.entries(byType).map(([type, count], i) => {
                const colors = ['#3B82F6', '#10B981', '#06B6D4', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#F97316'];
                return (
                  <div key={type} className="fs-xs" style={{ padding: '2px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[i % colors.length], flexShrink: 0 }} />
                    {DOC_TYPE_LABELS[type] || type} ({count as number})
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="filters-bar">
        <div className="filter-item">
          <span className="filter-label">Type</span>
          <select className="filter-select">
            <option value="tous">Tous</option>
            {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <span className="filter-label">Statut</span>
          <select className="filter-select">
            <option value="tous">Tous</option>
            <option value="conforme">Conforme</option>
            <option value="ecart">Écart</option>
            <option value="critique">Critique</option>
            <option value="non_comptabilise">Non comptabilisé</option>
          </select>
        </div>
        <div className="filter-item">
          <span className="filter-label">Tiers</span>
          <input type="text" className="form-input" placeholder="Rechercher..." style={{ width: '160px', padding: '6px 10px', fontSize: '12px' }} />
        </div>
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Liste des documents</span>
          <span className="data-table-count">{docs.length} documents</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Réf.</th>
                <th>Tiers</th>
                <th>Date</th>
                <th>Montant TTC</th>
                <th>Journal</th>
                <th>Pièce X3</th>
                <th>Délai</th>
                <th>Anom.</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d: any) => {
                const st = STATUT_BADGES[d.statut] || { label: d.statut, cls: '' };
                const rowCls = d.statut === 'critique' ? 'row-critique' : d.statut === 'ecart' ? 'row-eleve' : d.statut === 'non_comptabilise' ? 'row-moyen' : '';
                const delaiPct = Math.min(100, (d.delai_jours / 20) * 100);
                const delaiColor = d.delai_jours > 15 ? '#EF4444' : d.delai_jours > 7 ? '#F59E0B' : '#10B981';
                const typeLabel = DOC_TYPE_LABELS[d.type] || d.type;

                return (
                  <tr key={d.id} className={rowCls}>
                    <td className="cell-mono fs-xs">{d.id}</td>
                    <td className="fs-xs">{typeLabel.split(' ')[0]}</td>
                    <td className="cell-mono fs-xs">{d.reference}</td>
                    <td className="fs-sm">
                      {d.tiers_id && d.tiers_id.startsWith('CLI') ? (
                        <a href="#" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); router.push('/recouvrement'); }}>
                          {d.tiers}
                        </a>
                      ) : (
                        <span className="fw-600">{d.tiers}</span>
                      )}
                    </td>
                    <td className="cell-mono fs-xs">{formatDate(d.date_doc)}</td>
                    <td className="cell-amount fs-sm">{formatMontant(d.montant_ttc)}</td>
                    <td className="cell-mono fs-xs">{d.journal}</td>
                    <td className="cell-mono fs-xs">{d.piece_x3 || <span className="text-muted">-</span>}</td>
                    <td style={{ minWidth: '70px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div className="progress-bar-wrapper" style={{ width: '30px', height: '4px' }}>
                          <div className="progress-bar-fill" style={{ width: `${delaiPct}%`, background: delaiColor }} />
                        </div>
                        <span className="cell-mono fs-xs" style={{ color: delaiColor }}>{d.delai_jours}j</span>
                      </div>
                    </td>
                    <td className={`cell-mono fs-xs ${d.anomalies?.length > 0 ? 'text-danger fw-600' : 'text-muted'}`}>
                      {d.anomalies?.length > 0 ? d.anomalies.length : '-'}
                    </td>
                    <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                    <td><button className="btn btn-sm btn-secondary">Fiche</button></td>
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
