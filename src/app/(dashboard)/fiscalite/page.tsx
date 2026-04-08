'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, KpiCard, ModuleTabs, Btn } from '@/components/ui';
import { formatMontant, formatDate } from '@/lib/format';
import { getEcheancesFiscales, getDashboardKpis } from '@/lib/data';

const TABS = [
  { id: 'echeances', label: ' Échéances', icon: ' ', href: '/fiscalite' },
  { id: 'provisions', label: ' Provisions', icon: ' ', href: '/fiscalite/provisions' },
  { id: 'controles', label: ' Contrôles OHADA', icon: ' ', href: '/fiscalite/controles' },
];

const STATUT_MAP: Record<string, { cls: string; label: string }> = {
  a_preparer: { cls: 'badge-non-demarre', label: 'À préparer' },
  en_cours: { cls: 'badge-en-cours', label: 'En cours' },
  pret: { cls: 'badge-conforme', label: 'Prêt' },
  depose: { cls: 'badge-termine', label: 'Déposé' },
  en_retard: { cls: 'badge-bloquant', label: 'En retard' },
};

export default function FiscalitePage() {
  const router = useRouter();
  const kpis = getDashboardKpis();
  const echeances = getEcheancesFiscales() as any[];

  // Calculs
  const urgentes = echeances.filter(e => e.statut !== 'depose' && e.urgence <= 15);
  const aPreparer = echeances.filter(e => e.statut === 'a_preparer').length;
  const deposees = echeances.filter(e => e.statut === 'depose').length;
  const totalEstime = echeances.filter(e => e.statut !== 'depose').reduce((s, e) => s + (e.montant_estime || 0), 0);
  const totalProv = echeances.filter(e => e.statut !== 'depose').reduce((s, e) => s + (e.montant_provisionne || 0), 0);
  const totalReste = totalEstime - totalProv;

  // Prochaine échéance
  const prochaine = echeances.filter(e => e.urgence > 0 && e.statut !== 'depose').sort((a, b) => a.urgence - b.urgence)[0];

  // Montant urgentes
  const urgMontant = urgentes.reduce((s, e) => s + (e.montant_estime || 0), 0);

  // Tri: non déposées d'abord, puis par urgence
  const sorted = [...echeances].sort((a, b) => {
    if (a.statut === 'depose' && b.statut !== 'depose') return 1;
    if (a.statut !== 'depose' && b.statut === 'depose') return -1;
    return (a.urgence || 0) - (b.urgence || 0);
  });

  return (
    <div>
      <PageHeader
        breadcrumb="Fiscalité > Échéances"
        title="Échéances Fiscales"
        subtitle="Suivi des obligations fiscales - Exercice 2025"
        actions={
          <>
            <Btn variant="secondary" size="sm" href="/tresorerie/tensions"> Impact tréso</Btn>
            <Btn variant="primary" size="sm" href="/agent-ia"> Analyse IA</Btn>
          </>
        }
      />

      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'echeances' && urgentes.length > 0 ? String(urgentes.length) :
                 t.id === 'controles' ? `${kpis.scoreConformite}%` : undefined,
          badgeColor: t.id === 'echeances' ? 'var(--danger)' : undefined,
        }))}
        activeId="echeances"
      />

      {/* Decision banner */}
      {urgentes.length > 0 && (
        <div className="decision-banner critical" style={{ marginBottom: '20px' }}>
          <span className="decision-banner-icon"> </span>
          <div className="decision-banner-content">
            <div className="decision-banner-title text-danger">{urgentes.length} échéance(s) dans moins de 15 jours - {formatMontant(urgMontant)}</div>
            <div className="decision-banner-text">{urgentes.map(e => `${e.type} (${e.urgence}j)`).join(', ')}. Décaissements à provisionner en trésorerie.</div>
            <div className="decision-banner-actions">
              <Btn variant="danger" size="sm" href="/fiscalite/provisions">Provisions</Btn>
              <Btn variant="secondary" size="sm" href="/tresorerie/tensions">Impact trésorerie</Btn>
              <Btn variant="secondary" size="sm" href="/clotures">Clôture</Btn>
            </div>
          </div>
        </div>
      )}

      {/* KPIs 5 colonnes */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <KpiCard color="red" icon=" " value={prochaine ? `${prochaine.urgence}j` : ' -'} label="Prochaine échéance" />
        <KpiCard color="orange" icon=" " value={String(aPreparer)} label="À préparer" href="/fiscalite/provisions" />
        <KpiCard color="green" icon=" " value={String(deposees)} label="Déposées" />
        <KpiCard color="red" icon=" " value={formatMontant(totalReste)} label="Reste à provisionner" href="/fiscalite/provisions" />
        <KpiCard color="blue" icon=" " value={String(echeances.length)} label="Total obligations" />
      </div>

      {/* Tableau */}
      <div className="data-table-wrapper">
        <div className="data-table-header"><span className="data-table-title">Calendrier fiscal</span></div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Impôt / Taxe</th>
              <th>Période</th>
              <th>Échéance</th>
              <th>Estimé</th>
              <th>Provisionné</th>
              <th>Couverture</th>
              <th>Reste</th>
              <th>Urgence</th>
              <th>Statut</th>
              <th>DSF</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((ef: any) => {
              const reste = (ef.montant_estime || 0) - (ef.montant_provisionne || 0);
              const pctProv = ef.montant_estime > 0 ? (ef.montant_provisionne / ef.montant_estime * 100) : 100;
              const provCol = pctProv >= 100 ? '#10B981' : pctProv >= 80 ? '#F59E0B' : '#EF4444';
              const rowCls = ef.statut === 'depose' ? '' : ef.urgence <= 10 ? 'row-critique' : ef.urgence <= 20 ? 'row-eleve' : '';
              const urgColor = ef.statut === 'depose' ? 'text-success' : ef.urgence <= 10 ? 'text-danger' : ef.urgence <= 20 ? 'text-warning' : 'text-muted';
              const st = STATUT_MAP[ef.statut] || { cls: '', label: ef.statut };

              // DSF impact
              const dsfT: number[] = [];
              if (ef.type?.includes('TVA')) dsfT.push(19);
              if (ef.type?.includes('IS') || ef.type?.includes('Acompte')) dsfT.push(24);
              if (ef.type?.includes('DIPE') || ef.type?.includes('CNPS')) dsfT.push(22);
              if (ef.type?.includes('AIS')) dsfT.push(19);
              if (dsfT.length === 0) dsfT.push(19);

              return (
                <tr key={ef.id} className={rowCls}>
                  <td className="fw-600">{ef.type}</td>
                  <td className="fs-sm">{ef.periode}</td>
                  <td className="cell-mono">{formatDate(ef.echeance)}</td>
                  <td className="cell-amount">{formatMontant(ef.montant_estime)}</td>
                  <td className="cell-amount">{formatMontant(ef.montant_provisionne)}</td>
                  <td style={{ minWidth: '100px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div className="progress-bar-wrapper" style={{ width: '45px' }}>
                        <div className="progress-bar-fill" style={{ width: `${Math.min(100, pctProv)}%`, background: provCol }} />
                      </div>
                      <span className="cell-mono fs-xs" style={{ color: provCol }}>{Math.round(pctProv)}%</span>
                    </div>
                  </td>
                  <td className={`cell-amount ${reste > 0 ? 'negative fw-600' : 'text-success'}`}>{reste > 0 ? formatMontant(reste) : ' '}</td>
                  <td className={`cell-mono fw-600 ${urgColor}`}>{ef.statut === 'depose' ? ' -' : `${ef.urgence}j`}</td>
                  <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                  <td className="fs-xs">
                    {dsfT.map(d => (
                      <span key={d} className="badge badge-eleve" style={{ padding: '1px 4px', fontSize: '8px', marginRight: '2px', cursor: 'pointer' }}>T{d}</span>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Widgets liés */}
      <div className="grid-2" style={{ marginTop: '16px' }}>
        <div className="widget" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div className="widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
            <div>
              <div className="fw-600"> Impact Trésorerie</div>
              <div className="fs-xs text-muted">Les impôts sont les principaux décaissements de S15</div>
            </div>
            <Btn variant="secondary" size="sm" href="/tresorerie/tensions">Tensions </Btn>
          </div>
        </div>
        <div className="widget" style={{ borderLeft: '3px solid var(--info)' }}>
          <div className="widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
            <div>
              <div className="fw-600"> DSF - T19/T24</div>
              <div className="fs-xs text-muted">Les provisions fiscales impactent le résultat fiscal</div>
            </div>
            <Btn variant="secondary" size="sm" href="/dsf/alertes">DSF </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
