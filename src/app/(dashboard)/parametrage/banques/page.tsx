'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs } from '@/components/ui';
import { getAllBanques, getComptesWithBanques } from '@/lib/data';
import { formatCompact, getRapColor } from '@/lib/format';

const TABS = [
  { id: 'utilisateurs', label: 'Utilisateurs', icon: '👤', href: '/parametrage' },
  { id: 'banques', label: 'Banques', icon: '🏦', href: '/parametrage/banques' },
  { id: 'tiers', label: 'Tiers', icon: '🤝', href: '/parametrage/tiers' },
  { id: 'journaux', label: 'Journaux', icon: '📒', href: '/parametrage/journaux' },
  { id: 'regles', label: 'Règles', icon: '⚙️', href: '/parametrage/regles' },
  { id: 'ia', label: 'Config IA', icon: '🤖', href: '/parametrage/ia' },
];

export default function BanquesPage() {
  const router = useRouter();
  const banques = getAllBanques() as any[];
  const comptes = getComptesWithBanques() as any[];

  return (
    <div>
      <PageHeader breadcrumb="Paramétrage ▸ Banques & Comptes" title="Banques & Comptes Bancaires"
        subtitle={`${banques.length} banques • ${comptes.length} comptes`}
        actions={<button className="btn btn-secondary btn-sm" onClick={() => router.push('/banque')}>🏦 Position bancaire →</button>} />
      <ModuleTabs tabs={TABS} activeId="banques" />
      <div className="grid grid-cols-2 gap-5">
        <div className="data-table-wrapper"><div className="data-table-header"><span className="data-table-title">Banques</span><span className="data-table-count">{banques.length}</span></div>
          <table className="data-table"><thead><tr><th>ID</th><th>Nom</th><th>Code</th><th>Comptes</th></tr></thead>
            <tbody>{banques.map((b: any) => {
              const nbComptes = comptes.filter((c: any) => c.banque_id === b.id).length;
              return (
                <tr key={b.id} className="cursor-pointer" onClick={() => router.push('/banque')}>
                  <td className="font-mono text-xs">{b.id}</td><td className="fw-600">{b.nom}</td><td className="font-mono">{b.code}</td>
                  <td className="font-mono fw-600 text-primary">{nbComptes}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
        <div className="data-table-wrapper"><div className="data-table-header"><span className="data-table-title">Comptes</span></div>
          <table className="data-table"><thead><tr><th>Banque</th><th>Libellé</th><th>OHADA</th><th>Solde</th><th>Rap.</th></tr></thead>
            <tbody>{comptes.map((cb: any) => (
              <tr key={cb.id} className="cursor-pointer" onClick={() => router.push('/banque')}>
                <td className="font-mono">{cb.banqueCode}</td><td className="text-sm">{cb.libelle}</td><td className="font-mono">{cb.compte_ohada}</td>
                <td className="cell-amount text-xs">{formatCompact(cb.solde_comptable)}</td>
                <td className="font-mono text-xs" style={{ color: getRapColor(cb.taux_rapprochement) }}>{cb.taux_rapprochement?.toFixed(0)}%</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
