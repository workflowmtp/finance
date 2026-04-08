'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, Btn } from '@/components/ui';
import { formatMontant } from '@/lib/format';
import { getAllClients } from '@/lib/data';

const TABS = [
  { id: 'portefeuille', label: ' Portefeuille', icon: ' ', href: '/recouvrement' },
  { id: 'echeancier', label: ' Échéancier', icon: ' ', href: '/recouvrement/echeancier' },
  { id: 'relances', label: ' Relances', icon: ' ', href: '/recouvrement/relances' },
  { id: 'risques', label: ' Risques', icon: ' ', href: '/recouvrement/risques' },
];

export default function RisquesPage() {
  const router = useRouter();
  const clients = getAllClients() as any[];

  const sortedRisk = [...clients].sort((a, b) => b.score_risque - a.score_risque);
  const highRisk = sortedRisk.filter(c => c.score_risque >= 50);
  const impactHR = highRisk.reduce((s, c) => s + (c.echeance_echue || 0), 0);
  const contentieuxCount = clients.filter(c => c.statut === 'Contentieux').length;

  const getAction = (score: number) => {
    if (score >= 80) return 'Contentieux / blocage';
    if (score >= 60) return 'Mise en demeure urgente';
    if (score >= 40) return 'Relance renforcée';
    if (score >= 20) return 'Rappel courtois';
    return 'Surveillance';
  };

  return (
    <div>
      <PageHeader
        breadcrumb="Recouvrement > Clients à risque"
        title="Clients à Risque"
        subtitle="Classés par score de risque décroissant"
      />

      <ModuleTabs tabs={TABS} activeId="risques" />

      {/* Decision banner */}
      {highRisk.length > 0 && (
        <div className="decision-banner critical" style={{ marginBottom: '20px' }}>
          <span className="decision-banner-icon"> </span>
          <div className="decision-banner-content">
            <div className="decision-banner-title text-danger">{highRisk.length} clients à risque élevé (score &gt;= 50)</div>
            <div className="decision-banner-text">Impact créances échues : {formatMontant(impactHR)}. Provision à envisager pour {contentieuxCount} client(s) en contentieux.</div>
            <div className="decision-banner-actions">
              <Btn variant="danger" size="sm" href="/audit">Anomalies provision</Btn>
              <Btn variant="secondary" size="sm" href="/tresorerie/tensions">Impact trésorerie</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Classement risque</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Client</th>
              <th>Score</th>
              <th>Échu</th>
              <th>Retard</th>
              <th>Relance</th>
              <th>Statut</th>
              <th>Action recommandée</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedRisk.map((c, i) => {
              const rC = c.score_risque >= 70 ? '#EF4444' : c.score_risque >= 40 ? '#F59E0B' : '#10B981';
              const rowCls = c.score_risque >= 70 ? 'row-critique' : c.score_risque >= 40 ? 'row-eleve' : '';
              const sBadge = c.statut === 'Actif' ? 'badge-conforme' : c.statut === 'Surveillé' ? 'badge-eleve' : c.statut === 'Contentieux' ? 'badge-critique' : 'badge-bloquant';

              return (
                <tr key={c.id} className={rowCls}>
                  <td className="cell-mono fw-600">{i + 1}</td>
                  <td>
                    <a href="#" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: '600' }}
                      onClick={ev => { ev.preventDefault(); router.push('/recouvrement'); }}>
                      {c.raisonSociale}
                    </a>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div className="progress-bar-wrapper" style={{ width: '40px' }}>
                        <div className="progress-bar-fill" style={{ width: `${c.score_risque}%`, background: rC }} />
                      </div>
                      <span className="cell-mono fw-700" style={{ color: rC }}>{c.score_risque}</span>
                    </div>
                  </td>
                  <td className={`cell-amount ${c.echeance_echue > 0 ? 'negative' : ''}`}>{formatMontant(c.echeance_echue)}</td>
                  <td className={`cell-mono ${c.retard_moyen > 30 ? 'text-danger' : ''}`}>{c.retard_moyen}j</td>
                  <td className="cell-mono">Niv.{c.niveau_relance}</td>
                  <td><span className={`badge ${sBadge}`}>{c.statut}</span></td>
                  <td className="fs-xs" style={{ color: 'var(--primary)' }}>{getAction(c.score_risque)}</td>
                  <td><Btn variant="secondary" size="sm">Fiche</Btn></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Widget formule scoring */}
      <div className="widget" style={{ marginTop: '16px' }}>
        <div className="widget-header">
          <span className="widget-title"> Formule scoring</span>
        </div>
        <div className="widget-body">
          <div className="fs-sm text-secondary" style={{ lineHeight: '1.8' }}>
            <strong>Score</strong> = (Échu/Encours x 40) + (Retard/90 x 30) + (Niv.relance/5 x 30) - Plage 0 à 100
          </div>
        </div>
      </div>
    </div>
  );
}
