'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, KpiCard, Btn } from '@/components/ui';
import { formatMontant } from '@/lib/format';

const TABS = [
  { id: 'global', label: 'Audit global', icon: ' ', href: '/audit' },
  { id: 'anomalies', label: 'Anomalies', icon: ' ', href: '/dashboard/alertes' },
  { id: 'profils', label: 'Profils', icon: ' ', href: '/audit/profils' },
  { id: 'fraude', label: 'Fraude', icon: ' ', href: '/audit/fraude' },
];

const SIGNAUX = [
  { type: 'Doublon', icon: ' ', description: 'Deux écritures identiques', count: 2, impact: 31700000, details: 'TOTAL Energies (12,8M) + CROWN Holdings (18,9M)', gravite: 'eleve', docLink: true },
  { type: 'Montant rond suspect', icon: ' ', description: 'OD > 1M FCFA sans justificatif', count: 1, impact: 5000000, details: 'OD-PROV-2025-03-01 : 5M FCFA', gravite: 'moyen', docLink: true },
  { type: 'Séparation des tâches', icon: ' ', description: 'Même utilisateur saisie + validation', count: 2, impact: 0, details: 'KOUA (HA mars) + MVONDO (VE mars)', gravite: 'critique', docLink: false },
  { type: 'Rupture de séquence', icon: ' ', description: 'Numérotation discontinue', count: 1, impact: 0, details: 'FC-2025-0187 manquante', gravite: 'critique', docLink: true },
  { type: 'Compte invalide', icon: ' ', description: 'Compte OHADA inexistant utilisé', count: 1, impact: 2300000, details: 'Compte 691500 : 2,3M FCFA', gravite: 'eleve', docLink: true },
  { type: 'Écart TVA', icon: ' ', description: 'TVA comptabilisée != déclarée', count: 1, impact: 1450000, details: 'Février : écart 1,45M FCFA', gravite: 'eleve', docLink: false },
];

const RECOS = [
  'Annuler les 2 doublons (TOTAL + CROWN) après vérification.',
  'Instaurer la validation à 4 yeux : saisie != validation.',
  'Retrouver FC-2025-0187 ou PV de carence.',
  'Corriger l\'imputation 691500 et MAJ plan comptable.',
  'Justificatif obligatoire pour OD > 1M FCFA.',
  'Réconcilier l\'écart TVA février.',
];

export default function FraudePage() {
  const router = useRouter();

  const totalSig = SIGNAUX.length;
  const impFr = SIGNAUX.reduce((s, sig) => s + sig.impact, 0);

  return (
    <div>
      <PageHeader
        breadcrumb="Audit & Contrôle > Signaux fraude"
        title="Signaux de Fraude"
        subtitle="Détection automatique de patterns suspects"
      />

      <ModuleTabs tabs={TABS} activeId="fraude" />

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard color="red" icon=" " value={String(totalSig)} label="Signaux détectés" />
        <KpiCard color="red" icon=" " value={formatMontant(impFr)} label="Impact potentiel" />
        <KpiCard color="orange" icon=" " value="2" label="Doublons probables" />
        <KpiCard color="red" icon=" " value="2" label="Violations SoD" />
      </div>

      {/* Signaux */}
      {SIGNAUX.map((s, i) => {
        const bCol = s.gravite === 'critique' ? 'var(--danger)' : s.gravite === 'eleve' ? 'var(--warning)' : 'var(--info)';
        return (
          <div key={i} className="widget" style={{ borderLeft: `4px solid ${bCol}`, marginBottom: '16px' }}>
            <div className="widget-body" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>{s.icon}</span>
                  <div>
                    <div className="fw-600" style={{ fontSize: '14px' }}>{s.type}</div>
                    <div className="fs-sm text-secondary">{s.description}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {s.impact > 0 && <span className="cell-mono fw-700 text-danger">{formatMontant(s.impact)}</span>}
                  <span className={`badge badge-${s.gravite === 'critique' ? 'critique' : s.gravite === 'eleve' ? 'eleve' : 'moyen'}`}>{s.gravite}</span>
                </div>
              </div>
              <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="fs-xs text-muted">{s.details}</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {s.docLink && <Btn variant="secondary" size="sm" href="/documents"> Documents</Btn>}
                  <Btn variant="secondary" size="sm" href="/dashboard/alertes"> Anomalies</Btn>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Recommandations */}
      <div className="widget" style={{ borderLeft: '4px solid var(--primary)' }}>
        <div className="widget-header">
          <span className="widget-title"> Recommandations</span>
          <Btn variant="primary" size="sm" href="/agent-ia">Analyse IA</Btn>
        </div>
        <div className="widget-body">
          {RECOS.map((r, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{i + 1}.</span>
              <span className="fs-sm">{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
