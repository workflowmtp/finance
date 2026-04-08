'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, Widget } from '@/components/ui';
import { getAuditLogs } from '@/lib/data';

const TABS = [
  { id: 'logs', label: 'Logs', icon: 'Logs', href: '/historique' },
  { id: 'connexions', label: 'Connexions', icon: 'Connexions', href: '/historique/connexions' },
  { id: 'corrections', label: 'Corrections', icon: 'Corrections', href: '/historique/corrections' },
  { id: 'validations', label: 'Validations', icon: 'Validations', href: '/historique/validations' },
];

export default function CorrectionsPage() {
  const router = useRouter();
  const logs = getAuditLogs() as any[];
  const corrections = logs.filter(l => l.type === 'correction');

  return (
    <div>
      <PageHeader 
        breadcrumb="Historique  Corrections" 
        title="Journal des Corrections" 
        subtitle={`${corrections.length} modifications comptables avec diff`}
        actions={
          <button className="btn btn-secondary btn-sm" onClick={() => router.push('/audit')}>
            Audit 
          </button>
        } 
      />
      <ModuleTabs 
        tabs={TABS.map(t => ({ 
          ...t, 
          badge: t.id === 'corrections' && corrections.length > 0 ? String(corrections.length) : undefined, 
          badgeColor: 'var(--warning)' 
        }))} 
        activeId="corrections" 
      />

      {corrections.length > 0 && (
        <div 
          style={{ 
            padding: '12px 16px', 
            background: 'var(--warning-bg)', 
            border: '1px solid rgba(245,158,11,0.15)', 
            borderRadius: 'var(--radius-lg)', 
            marginBottom: 20, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12 
          }}
        >
          <span style={{ fontSize: 18 }}> Corrections</span>
          <div>
            <div className="fw-600 text-warning">{corrections.length} correction(s) comptable(s) enregistrée(s)</div>
            <div className="fs-xs text-muted">Chaque correction est tracée et liée au profil de risque de l&apos;utilisateur.</div>
          </div>
        </div>
      )}

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Corrections</span>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Date</th><th>Utilisateur</th><th>Détail</th><th>IP</th><th>Profil</th></tr>
          </thead>
          <tbody>
            {corrections.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 30 }} className="text-muted">
                  Aucune correction dans la période.
                </td>
              </tr>
            ) : (
              corrections.map(l => (
                <tr key={l.id} className="row-eleve">
                  <td className="cell-mono fs-xs">{l.date}</td>
                  <td className="fw-600">
                    <a 
                      href="#" 
                      style={{ color: 'var(--secondary)', textDecoration: 'none' }}
                      onClick={(e) => { e.preventDefault(); router.push('/audit/profils'); }}
                    >
                      {l.utilisateurNom}
                    </a>
                  </td>
                  <td className="fs-sm">{l.detail}</td>
                  <td className="cell-mono fs-xs">{l.ip}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => router.push('/audit/profils')}>
                      Profil 
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Link to audit */}
      <Widget style={{ marginTop: 16, borderLeft: '3px solid var(--danger)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
          <div>
            <div className="fw-600"> Impact Audit</div>
            <div className="fs-xs text-muted">Les corrections alimentent le score de risque des utilisateurs</div>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={() => router.push('/audit/profils')}>
            Profils risque 
          </button>
        </div>
      </Widget>
    </div>
  );
}
