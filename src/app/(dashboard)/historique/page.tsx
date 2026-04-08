'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, KpiCard, ModuleTabs } from '@/components/ui';
import { getAuditLogs } from '@/lib/data';

const TABS = [
  { id: 'logs', label: 'Logs', icon: 'Logs', href: '/historique' },
  { id: 'connexions', label: 'Connexions', icon: 'Connexions', href: '/historique/connexions' },
  { id: 'corrections', label: 'Corrections', icon: 'Corrections', href: '/historique/corrections' },
  { id: 'validations', label: 'Validations', icon: 'Validations', href: '/historique/validations' },
];

const TYPE_BADGES: Record<string, string> = { 
  connexion: 'badge-conforme', 
  correction: 'badge-eleve', 
  validation: 'badge-en-cours', 
  export: 'badge-attente' 
};

export default function HistPage() {
  const router = useRouter();
  const logs = getAuditLogs() as any[];
  const byCat: Record<string, number> = { connexion: 0, validation: 0, correction: 0, export: 0 };
  logs.forEach(l => { byCat[l.type] = (byCat[l.type] || 0) + 1; });
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <PageHeader 
        breadcrumb="Historique  Logs système" 
        title="Journal d'Audit Système" 
        subtitle={`Traçabilité complète  ${logs.length} entrées`}
        actions={
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push('/audit/profils')}>
              Profils risque
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => alert('Export CSV simulé.')}>
              Export
            </button>
          </>
        } 
      />
      <ModuleTabs 
        tabs={TABS.map(t => ({
          ...t, 
          badge: t.id === 'logs' ? String(logs.length) : t.id === 'corrections' && (byCat.correction || 0) > 0 ? String(byCat.correction) : undefined,
          badgeColor: t.id === 'corrections' ? 'var(--warning)' : undefined,
        }))} 
        activeId="logs" 
      />

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <KpiCard color="blue" icon="Logs" value={String(logs.length)} label="Total logs" />
        <KpiCard color="green" icon="Connexions" value={String(byCat.connexion || 0)} label="Connexions" href="/historique/connexions" />
        <KpiCard color="blue" icon="Validations" value={String(byCat.validation || 0)} label="Validations" href="/historique/validations" />
        <KpiCard color="orange" icon="Corrections" value={String(byCat.correction || 0)} label="Corrections" href="/historique/corrections" />
        <KpiCard color="purple" icon="Exports" value={String(byCat.export || 0)} label="Exports" />
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-item">
          <span className="filter-label">Type</span>
          <select className="filter-select" id="logFilterType">
            <option value="tous">Tous</option>
            <option value="connexion">Connexion</option>
            <option value="validation">Validation</option>
            <option value="correction">Correction</option>
            <option value="export">Export</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Logs</span>
          <span className="data-table-count" id="logCount">{logs.length}</span>
        </div>
        <table className="data-table" id="logTable">
          <thead>
            <tr><th>ID</th><th>Type</th><th>Utilisateur</th><th>Date / Heure</th><th>Détail</th><th>IP</th></tr>
          </thead>
          <tbody>
            {sorted.map(l => (
              <tr key={l.id} className={l.type === 'correction' ? 'row-eleve' : ''} data-type={l.type}>
                <td className="cell-mono fs-xs">{l.id}</td>
                <td><span className={`badge ${TYPE_BADGES[l.type] || ''}`}>{l.type}</span></td>
                <td className="fs-sm">
                  <a 
                    href="#" 
                    style={{ color: 'var(--secondary)', textDecoration: 'none' }}
                    onClick={(e) => { e.preventDefault(); router.push('/audit/profils'); }}
                  >
                    {l.utilisateurNom}
                  </a>
                </td>
                <td className="cell-mono fs-xs">{l.date}</td>
                <td className="fs-sm">{l.detail}</td>
                <td className="cell-mono fs-xs text-muted">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
