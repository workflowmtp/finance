'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, KpiCard, Btn } from '@/components/ui';
import { formatMontant, formatDate } from '@/lib/format';
import { getEcheancesFiscales, getDashboardKpis } from '@/lib/data';

const TABS = [
  { id: 'echeances', label: ' Échéances', icon: ' ', href: '/fiscalite' },
  { id: 'provisions', label: ' Provisions', icon: ' ', href: '/fiscalite/provisions' },
  { id: 'controles', label: ' Contrôles OHADA', icon: ' ', href: '/fiscalite/controles' },
];

const ECRITURES = [
  { journal: 'OD', debit: '695100', credit: '441100', libelle: 'Provision TVA mars - complément', montant: 4000000, dsf: 'T19' },
  { journal: 'OD', debit: '695200', credit: '441200', libelle: 'Provision Acompte IS mars - complément', montant: 3000000, dsf: 'T24' },
  { journal: 'OD', debit: '681100', credit: '491000', libelle: 'Provision créance douteuse SODECOTON', montant: 56000000, dsf: 'T9' },
  { journal: 'OD', debit: '659000', credit: '449000', libelle: 'Provision AIS mars - complément', montant: 2000000, dsf: 'T19' },
];

export default function ProvisionsPage() {
  const router = useRouter();
  const kpis = getDashboardKpis();
  const echeances = getEcheancesFiscales() as any[];

  // Calculs
  const fiscNonDepose = echeances.filter(e => e.statut !== 'depose' && e.montant_estime > 0);
  const totalEstime = fiscNonDepose.reduce((s, e) => s + (e.montant_estime || 0), 0);
  const totalCouvert = fiscNonDepose.reduce((s, e) => s + (e.montant_provisionne || 0), 0);
  const totalReste = totalEstime - totalCouvert;
  const pctGlobal = totalEstime > 0 ? Math.round((totalCouvert / totalEstime) * 100) : 100;

  return (
    <div>
      <PageHeader
        breadcrumb="Fiscalité > Provisions"
        title="Provisions Fiscales"
        subtitle="État des provisions par type d'impôt - Écritures à passer"
      />

      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'controles' ? `${kpis.scoreConformite}%` : undefined,
        }))}
        activeId="provisions"
      />

      {/* Decision banner */}
      {totalReste > 0 && (
        <div className="decision-banner warning" style={{ marginBottom: '20px' }}>
          <span className="decision-banner-icon"> </span>
          <div className="decision-banner-content">
            <div className="decision-banner-title text-warning">Provisions insuffisantes - {formatMontant(totalReste)} à provisionner</div>
            <div className="decision-banner-text">Couverture globale : {pctGlobal}%. Les écritures ci-dessous doivent être passées avant la clôture mensuelle.</div>
            <div className="decision-banner-actions">
              <Btn variant="secondary" size="sm" href="/clotures">Checklist clôture</Btn>
              <Btn variant="secondary" size="sm" href="/tresorerie/tensions">Impact cash</Btn>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard color="blue" icon=" " value={formatMontant(totalEstime)} label="Total estimé" />
        <KpiCard color="green" icon=" " value={formatMontant(totalCouvert)} label="Provisionné" />
        <KpiCard color="red" icon=" " value={formatMontant(totalReste)} label="Reste à provisionner" />
        <KpiCard color={pctGlobal >= 90 ? 'green' : 'orange'} icon=" " value={`${pctGlobal}%`} label="Couverture globale" />
      </div>

      {/* Estimé vs Provisionné */}
      <div className="widget">
        <div className="widget-header"><span className="widget-title"> Estimé vs Provisionné</span></div>
        <div className="widget-body">
          {fiscNonDepose.map((ef, i) => {
            const pctProv = ef.montant_estime > 0 ? (ef.montant_provisionne / ef.montant_estime * 100) : 0;
            const barColor = pctProv >= 100 ? '#10B981' : pctProv >= 80 ? '#F59E0B' : '#EF4444';
            const reste = ef.montant_estime - ef.montant_provisionne;

            return (
              <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <span className="fw-600">{ef.type}</span>
                    <span className="fs-xs text-muted"> - {ef.periode} - Éch. {formatDate(ef.echeance)} ({ef.urgence}j)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="cell-mono fs-sm">{formatMontant(ef.montant_estime)}</span>
                    <span className="cell-mono fs-sm fw-600" style={{ color: barColor }}>{formatMontant(ef.montant_provisionne)}</span>
                    {reste > 0 ? (
                      <span className="cell-mono fs-xs text-danger fw-600">-{formatMontant(reste)}</span>
                    ) : (
                      <span className="badge badge-conforme" style={{ fontSize: '10px' }}>Couvert</span>
                    )}
                  </div>
                </div>
                <div className="progress-bar-wrapper" style={{ height: '10px' }}>
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, pctProv)}%`, background: barColor }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Écritures à passer */}
      <div className="widget" style={{ marginTop: '20px', borderLeft: '3px solid var(--primary)' }}>
        <div className="widget-header">
          <span className="widget-title"> Écritures de provision à passer</span>
          <Btn variant="secondary" size="sm" href="/clotures">Clôture </Btn>
        </div>
        <div className="widget-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>JNL</th>
                <th>Débit</th>
                <th>Crédit</th>
                <th>Libellé</th>
                <th>Montant</th>
                <th>DSF</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ECRITURES.map((e, i) => {
                const impCls = e.montant >= 10000000 ? 'impact-high' : e.montant >= 3000000 ? 'impact-medium' : '';
                return (
                  <tr key={i} className={e.montant >= 10000000 ? 'row-critique' : e.montant >= 3000000 ? 'row-eleve' : ''}>
                    <td className="cell-mono">{e.journal}</td>
                    <td className="cell-mono">{e.debit}</td>
                    <td className="cell-mono">{e.credit}</td>
                    <td className="fs-sm">{e.libelle}</td>
                    <td className={`cell-amount fw-600 ${impCls}`}>{formatMontant(e.montant)}</td>
                    <td><span className="badge badge-eleve" style={{ padding: '1px 4px', fontSize: '8px', cursor: 'pointer' }}>{e.dsf}</span></td>
                    <td><Btn variant="primary" size="sm">Comptabiliser</Btn></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision créances douteuses */}
      <div className="widget" style={{ marginTop: '16px', borderLeft: '3px solid var(--danger)' }}>
        <div className="widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
          <div>
            <div className="fw-600 text-danger"> Provision créances douteuses - Recouvrement</div>
            <div className="fs-xs text-muted">SODECOTON (56M contentieux) + SCTM (42M bloqué) - Impact DSF T9</div>
          </div>
          <Btn variant="secondary" size="sm" href="/recouvrement/risques">Clients à risque </Btn>
        </div>
      </div>
    </div>
  );
}
