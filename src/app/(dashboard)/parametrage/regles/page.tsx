'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs } from '@/components/ui';

const TABS = [
  { id: 'utilisateurs', label: 'Utilisateurs', icon: 'Utilisateurs', href: '/parametrage' },
  { id: 'banques', label: 'Banques', icon: 'Banques', href: '/parametrage/banques' },
  { id: 'tiers', label: 'Tiers', icon: 'Tiers', href: '/parametrage/tiers' },
  { id: 'journaux', label: 'Journaux', icon: 'Journaux', href: '/parametrage/journaux' },
  { id: 'regles', label: 'Règles', icon: 'Règles', href: '/parametrage/regles' },
  { id: 'ia', label: 'Config IA', icon: 'IA', href: '/parametrage/ia' },
];

const REGLES = [
  { num: 1, label: 'Délai max scan  comptabilisation', seuil: '15 jours', gravite: 'Critique', detect: 7 },
  { num: 2, label: 'Tolérance écart montant doc/écriture', seuil: '5 000 FCFA', gravite: 'Élevé', detect: 3 },
  { num: 3, label: 'Taux TVA standard', seuil: '19,25 %', gravite: 'Élevé', detect: 1 },
  { num: 4, label: "Compte d'attente ancien", seuil: '> 30 jours', gravite: 'Élevé', detect: 1 },
  { num: 5, label: 'Rapprochement bancaire en retard', seuil: '> J+5', gravite: 'Élevé', detect: 2 },
  { num: 6, label: 'Séquence facture cassée', seuil: 'Tout écart', gravite: 'Critique', detect: 1 },
  { num: 7, label: 'Même utilisateur saisie + validation', seuil: 'Toujours', gravite: 'Critique', detect: 2 },
  { num: 8, label: 'OD sans justificatif', seuil: 'Toujours', gravite: 'Élevé', detect: 3 },
  { num: 9, label: 'Marge pôle < marge standard', seuil: 'Écart > 5 pts', gravite: 'Moyen', detect: 1 },
  { num: 10, label: 'Encours échu client', seuil: '> 10M FCFA', gravite: 'Élevé', detect: 4 },
  { num: 11, label: 'Échéance fiscale proche', seuil: '< 10 jours', gravite: 'Critique', detect: 3 },
  { num: 12, label: 'Montant rond suspect', seuil: '> 1M FCFA', gravite: 'Moyen', detect: 1 },
  { num: 13, label: 'Doublon probable', seuil: 'Même montant+tiers3j', gravite: 'Élevé', detect: 2 },
  { num: 14, label: 'Document ancien non saisi', seuil: '> 10 jours', gravite: 'Critique', detect: 2 },
];

export default function ReglesPage() {
  const router = useRouter();

  return (
    <div>
      <PageHeader 
        breadcrumb="Paramétrage  Règles & Seuils" 
        title="Règles Métier & Seuils d'Alerte" 
        subtitle="14 règles automatiques contrôlant les anomalies"
        actions={
          <button className="btn btn-secondary btn-sm" onClick={() => router.push('/dashboard/alertes')}>
            Anomalies détectées 
          </button>
        } 
      />
      <ModuleTabs tabs={TABS} activeId="regles" />

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">14 règles d&apos;alerte automatique</span>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Règle</th><th>Seuil</th><th>Gravité</th><th>Détections</th><th>Actif</th><th></th></tr>
          </thead>
          <tbody>
            {REGLES.map(r => (
              <tr key={r.num} className={r.detect > 2 ? 'row-eleve' : ''}>
                <td className="cell-mono fw-600">{r.num}</td>
                <td className="fs-sm">{r.label}</td>
                <td className="cell-mono fs-sm">{r.seuil}</td>
                <td>
                  <span className={`badge ${r.gravite === 'Critique' ? 'badge-critique' : r.gravite === 'Élevé' ? 'badge-eleve' : 'badge-moyen'}`}>
                    {r.gravite}
                  </span>
                </td>
                <td className={`cell-mono fw-600 ${r.detect > 0 ? 'text-danger' : 'text-success'}`}>{r.detect}</td>
                <td><span className="badge badge-conforme"></span></td>
                <td>
                  {r.detect > 0 && (
                    <button 
                      className="btn btn-sm btn-secondary" 
                      style={{ fontSize: 10 }} 
                      onClick={() => router.push('/dashboard/alertes')}
                    >
                      Voir 
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
