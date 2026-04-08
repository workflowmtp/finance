'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, Widget } from '@/components/ui';
import { getAuditLogs, getRoleLabel, getAllUsers } from '@/lib/data';

const TABS = [
  { id: 'logs', label: 'Logs', icon: 'Logs', href: '/historique' },
  { id: 'connexions', label: 'Connexions', icon: 'Connexions', href: '/historique/connexions' },
  { id: 'corrections', label: 'Corrections', icon: 'Corrections', href: '/historique/corrections' },
  { id: 'validations', label: 'Validations', icon: 'Validations', href: '/historique/validations' },
];

export default function ConnexionsPage() {
  const router = useRouter();
  const logs = getAuditLogs() as any[];
  const users = getAllUsers() as any[];
  const connexions = logs.filter(l => l.type === 'connexion');
  const byUser: Record<string, number> = {};
  connexions.forEach(l => { byUser[l.utilisateur] = (byUser[l.utilisateur] || 0) + 1; });

  return (
    <div>
      <PageHeader 
        breadcrumb="Historique  Connexions" 
        title="Journal des Connexions" 
        subtitle={`${connexions.length} connexions enregistrées`}
      />
      <ModuleTabs tabs={TABS} activeId="connexions" />

      {/* Stats by user */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <Widget title=" Connexions par utilisateur">
          <div style={{ padding: '8px 20px' }}>
            {Object.entries(byUser).map(([uid, count]) => {
              const user = users.find((u: any) => u.id === uid);
              return (
                <div 
                  key={uid}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                  onClick={() => router.push('/audit/profils')}
                >
                  <span className="fs-sm fw-600" style={{ color: 'var(--secondary)' }}>{user?.nom || uid}</span>
                  <span className="cell-mono fw-600">{count}</span>
                </div>
              );
            })}
          </div>
        </Widget>

        <Widget title=" Dernières connexions">
          <div style={{ padding: '8px 20px' }}>
            {connexions.map(l => {
              const hour = parseInt(l.date.substring(11, 13));
              const isLate = hour >= 22 || hour < 6;
              return (
                <div 
                  key={l.id} 
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}
                >
                  <span className="cell-mono fs-xs" style={{ width: 120 }}>{l.date.substring(0, 16)}</span>
                  <span 
                    className="fs-sm fw-600" 
                    style={{ flex: 1, color: 'var(--secondary)', cursor: 'pointer' }}
                    onClick={() => router.push('/audit/profils')}
                  >
                    {l.utilisateurNom}
                  </span>
                  {isLate && <span className="badge badge-eleve" style={{ fontSize: 9 }}>Horaire atypique</span>}
                  <span className="cell-mono fs-xs text-muted">{l.ip}</span>
                </div>
              );
            })}
          </div>
        </Widget>
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Détail des connexions</span>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Utilisateur</th><th>Rôle</th><th>Date / Heure</th><th>IP</th><th>Horaire</th><th>Résultat</th></tr>
          </thead>
          <tbody>
            {connexions.map(l => {
              const hour = parseInt(l.date.substring(11, 13));
              const isLate = hour >= 22 || hour < 6;
              const user = users.find((u: any) => u.id === l.utilisateur);
              return (
                <tr key={l.id} className={isLate ? 'row-eleve' : ''}>
                  <td className="fw-600">
                    <a 
                      href="#" 
                      style={{ color: 'var(--secondary)', textDecoration: 'none' }}
                      onClick={(e) => { e.preventDefault(); router.push('/audit/profils'); }}
                    >
                      {l.utilisateurNom}
                    </a>
                  </td>
                  <td className="fs-sm text-muted">{user ? getRoleLabel(user.role) : ''}</td>
                  <td className="cell-mono fs-xs">{l.date}</td>
                  <td className="cell-mono fs-xs">{l.ip}</td>
                  <td>{isLate ? <span className="badge badge-eleve"> Atypique</span> : <span className="badge badge-conforme">Normal</span>}</td>
                  <td><span className="badge badge-conforme">Succès</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
