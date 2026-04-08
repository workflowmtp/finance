'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, KpiCard, Badge, Btn } from '@/components/ui';
import { formatMontant, formatCompact } from '@/lib/format';
import { getAllAnomalies, getAnomaliesByGravite } from '@/lib/data';

const TABS = [
  { id: 'general', label: 'Vue générale', icon: '📊', href: '/dashboard' },
  { id: 'alertes', label: 'Alertes', icon: '🚨', href: '/dashboard/alertes' },
  { id: 'synthese', label: 'Synthèse DG', icon: '📋', href: '/dashboard/synthese-dg' },
];

const GRAVITE_ORDER: Record<string, number> = { critique: 0, eleve: 1, moyen: 2, faible: 3 };
const GRAVITE_LABELS: Record<string, string> = { critique: '🔴 CRITIQUES', eleve: '🟠 ÉLEVÉES', moyen: '🟡 MOYENNES', faible: '⚪ FAIBLES' };

export default function AlertesPage() {
  const router = useRouter();
  const anomalies = getAllAnomalies();
  const byGravite = getAnomaliesByGravite();
  const totalImpact = anomalies.reduce((s, a) => s + (a.impact || 0), 0);

  // Sort by gravite
  const sorted = [...anomalies].sort((a, b) => (GRAVITE_ORDER[a.gravite] || 9) - (GRAVITE_ORDER[b.gravite] || 9));

  return (
    <div>
      <PageHeader
        breadcrumb="Dashboard ▸ Alertes"
        title="Alertes & Anomalies"
        subtitle="Vue consolidée — Mars 2025"
        actions={
          <>
            <Btn variant="secondary" size="sm">📤 Export</Btn>
            <Btn variant="primary" size="sm" href="/agent-ia">🤖 Analyse IA</Btn>
          </>
        }
      />

      <ModuleTabs tabs={TABS.map(t => ({
        ...t,
        badge: t.id === 'alertes' ? String(byGravite.critique) : undefined,
        badgeColor: t.id === 'alertes' ? 'var(--danger)' : undefined,
      }))} activeId="alertes" />

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <KpiCard color="red" icon="🔴" value={String(byGravite.critique)} label="Critiques" href="/audit" />
        <KpiCard color="orange" icon="🟠" value={String(byGravite.eleve)} label="Élevées" href="/audit" />
        <KpiCard color="orange" icon="🟡" value={String(byGravite.moyen)} label="Moyennes" />
        <KpiCard color="cyan" icon="⚪" value={String(byGravite.faible)} label="Faibles" />
        <KpiCard color="red" icon="💰" value={formatMontant(totalImpact)} label="Impact financier" />
      </div>

      {/* Quick actions */}
      <div className="quick-action-grid" style={{ marginBottom: '16px' }}>
        <QuickAction bg="var(--danger-bg)" icon="🔍" label="Audit global" sub="Graphiques & matrice" onClick={() => router.push('/audit')} />
        <QuickAction bg="var(--warning-bg)" icon="👤" label="Profils utilisateurs" sub="4 profils" onClick={() => router.push('/audit')} />
        <QuickAction bg="var(--purple-bg)" icon="🕵️" label="Signaux de fraude" sub="6 signaux" onClick={() => router.push('/audit')} />
        <QuickAction bg="var(--info-bg)" icon="⚖️" label="Conformité OHADA" sub="Score 78%" onClick={() => router.push('/fiscalite')} />
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-item">
          <span className="filter-label">Gravité</span>
          <select className="filter-select">
            <option value="tous">Toutes</option>
            <option value="critique">Critique</option>
            <option value="eleve">Élevé</option>
            <option value="moyen">Moyen</option>
            <option value="faible">Faible</option>
          </select>
        </div>
        <div className="filter-item">
          <span className="filter-label">Catégorie</span>
          <select className="filter-select">
            <option value="tous">Toutes</option>
            <option value="Achats">Achats</option>
            <option value="Ventes">Ventes</option>
            <option value="Banque">Banque</option>
            <option value="Fiscal">Fiscal</option>
            <option value="Paie">Paie</option>
          </select>
        </div>
        <div className="filter-item">
          <span className="filter-label">Statut</span>
          <select className="filter-select">
            <option value="tous">Tous</option>
            <option value="ouvert">Ouvert</option>
            <option value="en_cours">En cours</option>
            <option value="resolu">Résolu</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Anomalies</span>
          <span className="data-table-count">{anomalies.length}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" id="anomaliesTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Gravité</th>
                <th>Cat.</th>
                <th>Titre</th>
                <th>Utilisateur</th>
                <th>Impact</th>
                <th>DSF</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((a, i) => {
                const showSeparator = i === 0 || sorted[i - 1].gravite !== a.gravite;
                const gCount = anomalies.filter(x => x.gravite === a.gravite).length;
                const sBadge = a.statut === 'resolu' ? 'badge-conforme' : a.statut === 'en_cours' ? 'badge-en-cours' : 'badge-attente';
                const impactCls = a.impact >= 10000000 ? 'impact-high' : a.impact >= 3000000 ? 'impact-medium' : 'impact-low';

                return (
                  <React.Fragment key={a.id}>
                    {showSeparator && (
                      <tr className="group-separator">
                        <td colSpan={9}>{GRAVITE_LABELS[a.gravite] || a.gravite} - {gCount} anomalie(s)</td>
                      </tr>
                    )}
                    <tr className={`row-${a.gravite}`}>
                      <td className="cell-mono fs-xs">{a.id}</td>
                      <td><span className={`badge badge-${a.gravite}`}>{a.gravite}</span></td>
                      <td className="fs-xs">{a.categorie}</td>
                      <td className="fs-sm" style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.titre}</td>
                      <td className="fs-sm">
                        {a.utilisateur ? (
                          <a href="#" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); router.push('/audit'); }}>
                            {a.utilisateur}
                          </a>
                        ) : <span className="text-muted">-</span>}
                      </td>
                      <td className={`cell-amount fs-sm ${impactCls}`}>{a.impact ? formatMontant(a.impact) : '-'}</td>
                      <td className="fs-xs"><span className="text-muted">-</span></td>
                      <td><span className={`badge ${sBadge}`}>{a.statut.replace('_', ' ')}</span></td>
                      <td><button className="btn btn-sm btn-secondary">Detail</button></td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ bg, icon, label, sub, onClick }: { bg: string; icon: string; label: string; sub: string; onClick: () => void }) {
  return (
    <div className="quick-action" style={{ background: bg }} onClick={onClick}>
      <div className="quick-action-icon">{icon}</div>
      <div>
        <div className="quick-action-text">{label}</div>
        <div className="quick-action-sub">{sub}</div>
      </div>
    </div>
  );
}
