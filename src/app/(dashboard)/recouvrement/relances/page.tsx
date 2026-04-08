'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, Btn } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { getRelanceHistory, getNiveauxRelance, getAllClients, getUserName } from '@/lib/data';

const TABS = [
  { id: 'portefeuille', label: ' Portefeuille', icon: ' ', href: '/recouvrement' },
  { id: 'echeancier', label: ' Échéancier', icon: ' ', href: '/recouvrement/echeancier' },
  { id: 'relances', label: ' Relances', icon: ' ', href: '/recouvrement/relances' },
  { id: 'risques', label: ' Risques', icon: ' ', href: '/recouvrement/risques' },
];

export default function RelancesPage() {
  const router = useRouter();
  const relances = getRelanceHistory() as any[];
  const niveaux = getNiveauxRelance() as any[];
  const clients = getAllClients() as any[];

  const sortedRel = [...relances].sort((a, b) => b.date.localeCompare(a.date));

  const getClientName = (clientId: string) => {
    const c = clients.find(cl => cl.id === clientId);
    return c?.raisonSociale || 'Client inconnu';
  };

  return (
    <div>
      <PageHeader
        breadcrumb="Recouvrement > Historique relances"
        title="Historique des Relances"
        subtitle={`${relances.length} actions enregistrées`}
      />

      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'relances' ? String(relances.length) : undefined,
          badgeColor: t.id === 'relances' ? 'var(--secondary)' : undefined,
        }))}
        activeId="relances"
      />

      {/* Référentiel niveaux de relance */}
      <div className="widget" style={{ marginBottom: '16px' }}>
        <div className="widget-header">
          <span className="widget-title"> Niveaux de relance</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Niv.</th>
              <th>Label</th>
              <th>Délai</th>
              <th>Ton</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {niveaux.slice(1).map((n: any, i: number) => {
              const idx = i + 1;
              const bg = idx >= 4 ? 'badge-critique' : idx >= 3 ? 'badge-eleve' : idx >= 2 ? 'badge-attente' : 'badge-conforme';
              return (
                <tr key={n.niveau}>
                  <td><span className={`badge ${bg}`}>{n.niveau}</span></td>
                  <td className="fw-600">{n.label}</td>
                  <td className="cell-mono">{n.delai}</td>
                  <td>{n.ton}</td>
                  <td className="fs-sm">{n.action}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Journal des relances */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Journal des relances</span>
          <span className="data-table-count">{relances.length}</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th>Niveau</th>
              <th>Canal</th>
              <th>Résultat</th>
              <th>Par</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedRel.map(r => {
              const rowCls = r.niveau >= 4 ? 'row-critique' : r.niveau >= 3 ? 'row-eleve' : '';
              const bg = r.niveau >= 4 ? 'badge-critique' : r.niveau >= 3 ? 'badge-eleve' : 'badge-attente';
              return (
                <tr key={r.id} className={rowCls}>
                  <td className="cell-mono fs-xs">{formatDate(r.date)}</td>
                  <td>
                    <a href="#" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: '600' }}
                      onClick={ev => { ev.preventDefault(); router.push('/recouvrement'); }}>
                      {getClientName(r.client_id)}
                    </a>
                  </td>
                  <td><span className={`badge ${bg}`}>Niv.{r.niveau}</span></td>
                  <td className="fs-sm">{r.canal}</td>
                  <td className="fs-sm fw-600">{r.resultat}</td>
                  <td className="fs-sm">{getUserName(r.responsable)}</td>
                  <td><Btn variant="secondary" size="sm">Fiche </Btn></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
