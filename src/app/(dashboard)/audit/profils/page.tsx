'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, Btn } from '@/components/ui';
import { getUserRiskProfiles, getAllAnomalies, getAllUsers, ANOMALIE_CATEGORIES, getUserName } from '@/lib/data';

const TABS = [
  { id: 'global', label: ' Audit global', icon: ' ', href: '/audit' },
  { id: 'anomalies', label: ' Anomalies', icon: ' ', href: '/dashboard/alertes' },
  { id: 'profils', label: ' Profils', icon: ' ', href: '/audit/profils' },
  { id: 'fraude', label: ' Fraude', icon: ' ', href: '/audit/fraude' },
];

export default function ProfilsPage() {
  const router = useRouter();
  const profiles = getUserRiskProfiles();
  const anomalies = getAllAnomalies() as any[];
  const users = getAllUsers() as any[];

  const highRisk = profiles.filter(p => p.score >= 60);

  const getRoleLabel = (roleId: string) => {
    const roleMap: Record<string, string> = {
      admin: 'Administrateur',
      comptable: 'Comptable',
      manager: 'Manager',
      auditeur: 'Auditeur',
      rh: 'RH',
    };
    return roleMap[roleId] || roleId;
  };

  const getReco = (score: number) => {
    if (score >= 70) return 'Supervision + formation';
    if (score >= 50) return 'Audit ciblé + entretien';
    if (score >= 30) return 'Suivi mensuel';
    return 'Surveillance normale';
  };

  const getTrend = (score: number) => {
    if (score > 50) {
      const val = score % 3 === 0 ? 3 : score % 5;
      return { value: `+${val}`, up: true };
    }
    const val = score % 2 === 0 ? 2 : score % 3;
    return { value: `-${val}`, up: false };
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUserAnomalies = (userId: string) => {
    return anomalies.filter(a => a.utilisateur === userId && a.statut !== 'resolu');
  };

  const getCatLabel = (code: string) => {
    const cat = (ANOMALIE_CATEGORIES as any[])?.find((c: any) => c.code === code);
    return cat?.label || code;
  };

  return (
    <div>
      <PageHeader
        breadcrumb="Audit & Contrôle > Profils utilisateurs"
        title="Profils de Risque Utilisateurs"
        subtitle="Analyse du comportement comptable par utilisateur"
      />

      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'profils' && highRisk.length > 0 ? String(highRisk.length) : undefined,
          badgeColor: 'var(--danger)',
        }))}
        activeId="profils"
      />

      {/* Decision banner */}
      {highRisk.length > 0 && (
        <div className="decision-banner critical" style={{ marginBottom: '20px' }}>
          <span className="decision-banner-icon"> </span>
          <div className="decision-banner-content">
            <div className="decision-banner-title text-danger">{highRisk.length} utilisateur(s) à risque élevé (score &gt;= 60)</div>
            <div className="decision-banner-text">{highRisk.map(u => `${u.nom} (${u.score})`).join(', ')} - Supervision renforcée requise.</div>
            <div className="decision-banner-actions">
              <Btn variant="danger" size="sm">Programmer entretiens</Btn>
              <Btn variant="secondary" size="sm" href="/parametrage/utilisateurs">Gérer accès</Btn>
            </div>
          </div>
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="widget"><div className="widget-body" style={{ textAlign: 'center', padding: '40px' }}>Aucun profil.</div></div>
      ) : (
        <>
          {/* Tableau classement */}
          <div className="data-table-wrapper">
            <div className="data-table-header">
              <span className="data-table-title">Classement par score de risque</span>
              <span className="data-table-count">{profiles.length} utilisateurs</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Utilisateur</th>
                  <th>Rôle</th>
                  <th>Score</th>
                  <th>Tendance</th>
                  <th>Anomalies</th>
                  <th>Critiques</th>
                  <th>Élevées</th>
                  <th>Reco.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((ur, i) => {
                  const rC = ur.score >= 60 ? '#EF4444' : ur.score >= 30 ? '#F59E0B' : '#10B981';
                  const rowCls = ur.score >= 60 ? 'row-critique' : ur.score >= 30 ? 'row-eleve' : '';
                  const user = users.find(u => u.id === ur.utilisateur);
                  const roleLbl = user ? getRoleLabel(user.role) : ' -';
                  const reco = getReco(ur.score);
                  const recoCol = ur.score >= 70 ? 'text-danger' : ur.score >= 50 ? 'text-warning' : 'text-success';
                  const trend = getTrend(ur.score);
                  const initials = getInitials(ur.nom);

                  return (
                    <tr key={ur.utilisateur} className={rowCls} style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard/alertes')}>
                      <td className="cell-mono fw-600">{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="user-risk-avatar" style={{ background: rC, width: '28px', height: '28px', fontSize: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600' }}>{initials}</div>
                          <span className="fw-600">{ur.nom}</span>
                        </div>
                      </td>
                      <td className="fs-sm text-muted">{roleLbl}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="progress-bar-wrapper" style={{ width: '60px' }}>
                            <div className="progress-bar-fill" style={{ width: `${ur.score}%`, background: rC }} />
                          </div>
                          <span className="cell-mono fw-700" style={{ color: rC }}>{ur.score}</span>
                        </div>
                      </td>
                      <td className={`cell-mono fs-xs ${trend.up ? 'text-danger' : 'text-success'}`}>{trend.up ? ' ' : ' '} {trend.value}</td>
                      <td className="cell-mono">{ur.total_anomalies}</td>
                      <td className={`cell-mono ${ur.critiques > 0 ? 'text-danger fw-600' : ''}`}>{ur.critiques}</td>
                      <td className={`cell-mono ${ur.elevees > 0 ? 'text-warning' : ''}`}>{ur.elevees}</td>
                      <td className={`fs-xs ${recoCol}`}>{reco}</td>
                      <td><Btn variant="secondary" size="sm">Anomalies</Btn></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Fiches détaillées Top 3 */}
          <div style={{ marginTop: '24px' }}>
            <div className="page-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Fiches détaillées - Top 3</div>
          </div>
          <div className="dash-grid-1-1-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {profiles.slice(0, 3).map(ur => {
              const rC = ur.score >= 60 ? '#EF4444' : ur.score >= 30 ? '#F59E0B' : '#10B981';
              const userAnom = getUserAnomalies(ur.utilisateur);

              // Compter par catégorie
              const typeCounts: Record<string, number> = {};
              for (const a of userAnom) {
                typeCounts[a.categorie] = (typeCounts[a.categorie] || 0) + 1;
              }

              return (
                <div key={ur.utilisateur} className="widget" style={{ borderTop: `3px solid ${rC}` }}>
                  <div className="widget-header">
                    <span className="widget-title">{ur.nom}</span>
                    <span className="cell-mono fw-700" style={{ color: rC }}>{ur.score}/100</span>
                  </div>
                  <div className="widget-body">
                    <div className="form-label mb-8">Répartition des anomalies</div>
                    {Object.entries(typeCounts).map(([cat, count]) => {
                      const pct = (count / ur.total_anomalies) * 100;
                      return (
                        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span className="fs-xs" style={{ width: '90px' }}>{getCatLabel(cat)}</span>
                          <div className="progress-bar-wrapper" style={{ flex: 1 }}>
                            <div className="progress-bar-fill orange" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="cell-mono fs-xs">{count}</span>
                        </div>
                      );
                    })}

                    <div className="form-label mb-8" style={{ marginTop: '12px' }}>Dernières anomalies</div>
                    {userAnom.slice(0, 3).map(a => (
                      <div key={a.id} className="fs-xs" style={{ padding: '4px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
                        <span className={`badge badge-${a.gravite === 'critique' ? 'critique' : a.gravite === 'eleve' ? 'eleve' : 'moyen'}`}>{a.gravite}</span>
                        <span style={{ marginLeft: '4px' }}>{a.titre.substring(0, 55)}...</span>
                      </div>
                    ))}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                      {ur.score >= 50 && <Btn variant="danger" size="sm"> Entretien</Btn>}
                      {ur.score >= 70 && <Btn variant="secondary" size="sm"> Restreindre</Btn>}
                      <Btn variant="secondary" size="sm"> IA</Btn>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
