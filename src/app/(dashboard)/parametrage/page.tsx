'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, ProgressBar } from '@/components/ui';
import { getAllUsers, getAllRoles, getUserRiskProfiles, getPermissions, getRoleLabel } from '@/lib/data';
import { getRiskColor } from '@/lib/format';

const TABS = [
  { id: 'utilisateurs', label: 'Utilisateurs', icon: 'Utilisateurs', href: '/parametrage' },
  { id: 'banques', label: 'Banques', icon: 'Banques', href: '/parametrage/banques' },
  { id: 'tiers', label: 'Tiers', icon: 'Tiers', href: '/parametrage/tiers' },
  { id: 'journaux', label: 'Journaux', icon: 'Journaux', href: '/parametrage/journaux' },
  { id: 'regles', label: 'Règles', icon: 'Règles', href: '/parametrage/regles' },
  { id: 'ia', label: 'Config IA', icon: 'IA', href: '/parametrage/ia' },
];

export default function ParamPage() {
  const router = useRouter();
  const users = getAllUsers() as any[];
  const roles = getAllRoles() as any[];
  const profiles = getUserRiskProfiles();
  const { actions, matrix } = getPermissions() as any;

  return (
    <div>
      <PageHeader 
        breadcrumb="Paramétrage  Utilisateurs & Rôles" 
        title="Gestion des Utilisateurs" 
        subtitle={`${users.length} utilisateurs  ${roles.length} rôles`}
        actions={
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push('/audit/profils')}>
              Profils risque
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => alert('Formulaire création (simulé)')}>
              + Nouvel utilisateur
            </button>
          </>
        } 
      />
      <ModuleTabs tabs={TABS} activeId="utilisateurs" />

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Utilisateurs</span>
          <span className="data-table-count">{users.length}</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Login</th>
              <th>Rôle</th>
              <th>Niveau</th>
              <th>Risque</th>
              <th>Email</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => {
              const role = roles.find((r: any) => r.code === u.role);
              const riskP = profiles.find(p => p.utilisateur === u.id);
              const riskScore = riskP?.score || 0;
              const rC = getRiskColor(riskScore);
              return (
                <tr key={u.id}>
                  <td className="cell-mono fs-xs">{u.id}</td>
                  <td className="fw-600">
                    <a 
                      href="#" 
                      style={{ color: 'var(--secondary)', textDecoration: 'none' }}
                      onClick={(e) => { e.preventDefault(); router.push('/audit/profils'); }}
                    >
                      {u.nom}
                    </a>
                  </td>
                  <td className="cell-mono fs-xs">{u.identifiant}</td>
                  <td className="fs-sm">{getRoleLabel(u.role)}</td>
                  <td className="fs-xs text-muted">{role?.niveau || ''}</td>
                  <td>
                    {riskScore > 0 ? (
                      <div className="d-flex align-center gap-4">
                        <div className="progress-bar-wrapper" style={{ width: 30 }}>
                          <div className="progress-bar-fill" style={{ width: `${riskScore}%`, background: rC }} />
                        </div>
                        <span className="cell-mono fs-xs" style={{ color: rC }}>{riskScore}</span>
                      </div>
                    ) : (
                      <span className="fs-xs text-muted">-</span>
                    )}
                  </td>
                  <td className="fs-xs text-muted">{u.email}</td>
                  <td><span className="badge badge-conforme">Actif</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="widget" style={{ marginTop: 20 }}>
        <div className="widget-header">
          <span className="widget-title">Matrice des permissions</span>
        </div>
        <div className="widget-body" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rôle</th>
                {(actions as string[]).map(a => (
                  <th key={a} className="fs-xs" style={{ textAlign: 'center' }}>
                    {a.replace('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((r: any) => {
                const perms = (matrix as any)[r.code] || [];
                return (
                  <tr key={r.code}>
                    <td className="fw-600 fs-sm">{r.label}</td>
                    {(actions as string[]).map((_, a) => (
                      <td key={a} style={{ textAlign: 'center' }}>
                        {perms[a] ? (
                          <span style={{ color: 'var(--primary)' }}>+</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                    ))}
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
