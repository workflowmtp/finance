'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, Btn } from '@/components/ui';
import { formatMontant } from '@/lib/format';
import { getTreasuryForecast, getTreasuryDetail, getComptesWithBanques } from '@/lib/data';

const TABS = [
  { id: 'situation', label: 'Situation', icon: ' ', href: '/tresorerie' },
  { id: 'previsions', label: 'Prévisions', icon: ' ', href: '/tresorerie/previsions' },
  { id: 'tensions', label: 'Tensions', icon: ' ', href: '/tresorerie/tensions' },
  { id: 'scenarios', label: 'Scénarios', icon: ' ', href: '/tresorerie/scenarios' },
];

export default function TensionsPage() {
  const router = useRouter();
  const forecast = getTreasuryForecast() as any[];
  const detail = getTreasuryDetail ? getTreasuryDetail() as any[] : [];

  const tensionWeeks = forecast.filter(f => f.tension > 20);

  return (
    <div>
      <PageHeader
        breadcrumb="Trésorerie > Tensions"
        title="Analyse des Tensions de Trésorerie"
        subtitle="Identification des semaines critiques et causes"
      />

      <ModuleTabs tabs={TABS} activeId="tensions" />

      {tensionWeeks.length === 0 ? (
        <div className="widget">
          <div className="widget-body" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}> </div>
            <div className="fs-sm fw-600 text-success">Aucune tension détectée sur les 4 prochaines semaines.</div>
          </div>
        </div>
      ) : (
        tensionWeeks.map(tw => {
          const borderColor = tw.tension > 50 ? 'var(--danger)' : 'var(--warning)';
          const causes = detail.filter(d => d.semaine === tw.semaine && d.type === 'decaissement').sort((a, b) => b.montant - a.montant);

          return (
            <div key={tw.semaine} className="widget" style={{ borderLeft: `4px solid ${borderColor}`, marginBottom: '20px' }}>
              <div className="widget-header">
                <span className="widget-title"> {tw.semaine} — {tw.label}</span>
                <span className={`badge ${tw.tension > 50 ? 'badge-critique badge-pulse' : 'badge-eleve'}`}>Tension {tw.tension}/100</span>
              </div>
              <div className="widget-body">
                <div className="grid-2" style={{ gap: '24px' }}>
                  {/* Gauche: chiffres */}
                  <div>
                    <div className="synthese-kpi-row">
                      <span className="synthese-kpi-label">Solde d&apos;ouverture</span>
                      <span className="synthese-kpi-value">{formatMontant(tw.solde_ouverture)}</span>
                    </div>
                    <div className="synthese-kpi-row">
                      <span className="synthese-kpi-label">Encaissements prévus</span>
                      <span className="synthese-kpi-value text-success">+{formatMontant(tw.encaissements)}</span>
                    </div>
                    <div className="synthese-kpi-row">
                      <span className="synthese-kpi-label">Décaissements prévus</span>
                      <span className="synthese-kpi-value text-danger">-{formatMontant(tw.decaissements)}</span>
                    </div>
                    <div className="synthese-kpi-row" style={{ borderTop: '2px solid var(--border)', paddingTop: '12px' }}>
                      <span className="synthese-kpi-label fw-700">Solde projeté</span>
                      <span className={`synthese-kpi-value fw-700 ${tw.solde_fermeture < 0 ? 'text-danger' : ''}`}>{formatMontant(tw.solde_fermeture)}</span>
                    </div>
                  </div>

                  {/* Droite: causes et recommandations */}
                  <div>
                    <div className="form-label" style={{ marginBottom: '8px' }}>Causes identifiées</div>
                    {causes.slice(0, 3).map((c, i) => (
                      <div key={i} className="fs-sm" style={{ padding: '4px 0' }}>
                         <strong>{c.ligne}</strong> : {formatMontant(c.montant)}
                      </div>
                    ))}
                    <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--primary-bg)', borderRadius: 'var(--radius-md)' }}>
                      <div className="form-label" style={{ color: 'var(--primary)' }}> Recommandations IA</div>
                      <div className="fs-sm mt-4"> Relancer les encaissements clients prioritaires (SABC, CICAM, GUINNESS)</div>
                      <div className="fs-sm mt-4"> Négocier le décalage des règlements fournisseurs non urgents</div>
                      {tw.tension > 50 && (
                        <div className="fs-sm mt-4"> Envisager une ligne de trésorerie court terme auprès d&apos;Afriland</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
