'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, KpiCard, ScoreGauge, Btn } from '@/components/ui';
import { getDashboardKpis, getOhadaControles } from '@/lib/data';
import { formatPct } from '@/lib/format';

const TABS = [
  { id: 'echeances', label: 'Échéances', icon: ' ', href: '/fiscalite' },
  { id: 'provisions', label: 'Provisions', icon: ' ', href: '/fiscalite/provisions' },
  { id: 'controles', label: 'Contrôles OHADA', icon: ' ', href: '/fiscalite/controles' },
];

const OHADA_CONTROLES = [
  { num: 1, label: 'Cohérence des imputations', desc: 'Compte utilisé vs nature opération', statut: 'ok', details: 'Aucune anomalie sauf compte 691500' },
  { num: 2, label: 'Comptes autorisés OHADA', desc: 'Tous les comptes existent dans le plan OHADA', statut: 'alerte', details: '1 compte invalide (691500)' },
  { num: 3, label: 'Charges vs Immobilisations', desc: 'Seuil de capitalisation respecté', statut: 'alerte', details: '1 charge imputée en immo (580K)' },
  { num: 4, label: 'Ventilation HT/TVA/TTC', desc: 'Cohérence des montants fiscaux', statut: 'alerte', details: '1 facture TVA 18% au lieu de 19,25%' },
  { num: 5, label: 'Séquence des factures', desc: 'Numérotation continue', statut: 'ko', details: 'FC-2025-0187 manquante' },
  { num: 6, label: 'Lettrage et justification tiers', desc: 'Comptes tiers correctement lettrés', statut: 'alerte', details: 'Lettrage incomplet CICAM + SAPPI' },
  { num: 7, label: 'Cohérence bilancielle', desc: 'Actif = Passif', statut: 'ok', details: 'Équilibre vérifié' },
  { num: 8, label: 'Rattachement des charges', desc: 'Charges sur la bonne période', statut: 'alerte', details: 'FNP non passées - charges à rattacher' },
  { num: 9, label: 'Séparation des exercices', desc: 'Cut-off achats/ventes respecté', statut: 'ok', details: "Pas d'anomalie" },
];

const ACTIONS = [
  { text: 'Corriger le compte 691500 > bon compte OHADA', nav: '/dashboard/alertes' },
  { text: 'Retrouver FC-2025-0187 ou PV de carence', nav: '/audit' },
  { text: 'Corriger TVA INDEVCO (18% > 19,25%)', nav: '/documents/controles' },
  { text: 'Finaliser FNP et rattachements charges mars', nav: '/clotures' },
  { text: 'Compléter lettrage CICAM + SAPPI', nav: '/recouvrement' },
];

export default function ControlesPage() {
  const router = useRouter();
  const kpis = getDashboardKpis();

  const okCount = OHADA_CONTROLES.filter(c => c.statut === 'ok').length;
  const alerteCount = OHADA_CONTROLES.filter(c => c.statut === 'alerte').length;
  const koCount = OHADA_CONTROLES.filter(c => c.statut === 'ko').length;

  return (
    <div>
      <PageHeader
        breadcrumb="Fiscalité > Contrôles fiscaux"
        title="Contrôles Fiscaux & Conformité OHADA"
        subtitle="Vérification de la conformité réglementaire"
      />

      <ModuleTabs tabs={TABS} activeId="controles" />

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard color="green" icon=" " value={`${okCount}/9`} label="Contrôles OK" />
        <KpiCard color="orange" icon=" " value={String(alerteCount)} label="Avec alertes" href="/dashboard/alertes" />
        <KpiCard color="red" icon=" " value={String(koCount)} label="Non conformes" href="/audit" />
        <KpiCard color="blue" icon=" " value={formatPct(kpis.scoreConformite)} label="Score conformité" />
      </div>

      <div className="grid-2">
        {/* Contrôles table */}
        <div className="widget">
          <div className="widget-header">
            <span className="widget-title"> Contrôles OHADA / SYSCOHADA</span>
            <Btn variant="secondary" size="sm" href="/audit">Audit {'>'}</Btn>
          </div>
          <div className="widget-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Contrôle</th>
                  <th>Statut</th>
                  <th>Détails</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {OHADA_CONTROLES.map(c => {
                  const statutHtml = c.statut === 'ok'
                    ? '<span class="badge badge-conforme"> OK</span>'
                    : c.statut === 'alerte'
                    ? '<span class="badge badge-eleve"> Alerte</span>'
                    : '<span class="badge badge-critique badge-pulse"> NON CONFORME</span>';
                  const rowCls = c.statut === 'ko' ? 'row-critique' : c.statut === 'alerte' ? 'row-eleve' : '';

                  return (
                    <tr key={c.num} className={rowCls}>
                      <td className="cell-mono fw-600">{c.num}</td>
                      <td>
                        <div className="fw-600 fs-sm">{c.label}</div>
                        <div className="fs-xs text-muted">{c.desc}</div>
                      </td>
                      <td>
                        <span className={`badge ${c.statut === 'ok' ? 'badge-conforme' : c.statut === 'alerte' ? 'badge-eleve' : 'badge-critique'}`}>
                          {c.statut === 'ok' ? ' OK' : c.statut === 'alerte' ? ' Alerte' : ' NON CONFORME'}
                        </span>
                      </td>
                      <td className="fs-xs">{c.details}</td>
                      <td>
                        {c.statut !== 'ok' && (
                          <Btn variant="secondary" size="sm">Corriger {'>'}</Btn>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Score visuel + actions */}
        <div className="widget">
          <div className="widget-header">
            <span className="widget-title"> Score Conformité</span>
          </div>
          <div className="widget-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            <ScoreGauge score={kpis.scoreConformite} size={140} label="Score global" />
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <div className="fs-sm text-secondary"> (contrôles OK × poids) /  (poids) × 100</div>
              <div className="fs-xs text-muted mt-8">Chaque anomalie non résolue réduit le score de ~18 points.</div>
            </div>

            {/* Actions correctives */}
            <div style={{ marginTop: '16px', width: '100%', textAlign: 'left' }}>
              <div className="form-label mb-8">Actions correctives</div>
              {ACTIONS.map((a, i) => (
                <div
                  key={i}
                  style={{ padding: '6px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => router.push(a.nav)}
                >
                  <span style={{ color: 'var(--primary)', fontWeight: 700, width: '16px' }}>{i + 1}.</span>
                  <span className="fs-xs" style={{ flex: 1 }}>{a.text}</span>
                  <span className="fs-xs text-primary">{'>'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Link to DSF */}
      <div className="widget" style={{ marginTop: '16px', borderLeft: '3px solid var(--info)' }}>
        <div className="widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
          <div>
            <div className="fw-600"> Impact DSF - Conformité OHADA</div>
            <div className="fs-xs text-muted">Les non-conformités impactent T1 (bilan actif), T2 (bilan passif), T19 (impôts) et T24 (résultat fiscal)</div>
          </div>
          <Btn variant="secondary" size="sm" href="/dsf">DSF Readiness {'>'}</Btn>
        </div>
      </div>
    </div>
  );
}
