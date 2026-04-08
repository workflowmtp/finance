'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, Widget } from '@/components/ui';
import { getAuditLogs } from '@/lib/data';

const TABS = [
  { id: 'logs', label: 'Logs', icon: '📋', href: '/historique' },
  { id: 'connexions', label: 'Connexions', icon: '🔑', href: '/historique/connexions' },
  { id: 'corrections', label: 'Corrections', icon: '✏️', href: '/historique/corrections' },
  { id: 'validations', label: 'Validations', icon: '✅', href: '/historique/validations' },
];

export default function ValidationsPage() {
  const router = useRouter();
  const logs = getAuditLogs() as any[];
  const validations = logs.filter(l => l.type === 'validation');

  return (
    <div>
      <PageHeader breadcrumb="Historique ▸ Validations" title="Journal des Validations" subtitle={`Chaîne de responsabilité — ${validations.length} validations`} />
      <ModuleTabs tabs={TABS} activeId="validations" />
      <div className="data-table-wrapper">
        <div className="data-table-header"><span className="data-table-title">Validations</span></div>
        <table className="data-table"><thead><tr><th>Date</th><th>Utilisateur</th><th>Détail</th><th>IP</th><th>Doc</th></tr></thead>
          <tbody>
            {validations.length === 0 ? <tr><td colSpan={5} className="text-center text-muted" style={{ padding: 30 }}>Aucune validation.</td></tr> :
            validations.map(l => (
              <tr key={l.id}>
                <td className="font-mono text-xs">{l.date}</td>
                <td className="fw-600"><span style={{ color: 'var(--secondary)', cursor: 'pointer' }} onClick={() => router.push('/audit/profils')}>{l.utilisateurNom}</span></td>
                <td className="text-sm">{l.detail}</td>
                <td className="font-mono text-xs">{l.ip}</td>
                <td><button className="btn btn-sm btn-secondary" onClick={() => router.push('/documents')}>Doc →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Widget className="mt-4" style={{ borderLeft: '3px solid var(--warning)' }}>
        <div className="flex items-center justify-between p-3">
          <div><div className="fw-600">👥 Séparation des tâches (SoD)</div><div className="text-xs text-muted">Vérifier qu&apos;aucun utilisateur ne saisit ET valide</div></div>
          <button className="btn btn-sm btn-secondary" onClick={() => router.push('/audit/fraude')}>Signaux fraude →</button>
        </div>
      </Widget>
    </div>
  );
}
