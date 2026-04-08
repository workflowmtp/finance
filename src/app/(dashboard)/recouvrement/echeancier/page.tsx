'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, KpiCard, Btn } from '@/components/ui';
import { formatMontant, formatDate } from '@/lib/format';
import { getEcheancierClients, getAllClients } from '@/lib/data';

const TABS = [
  { id: 'portefeuille', label: ' Portefeuille', icon: ' ', href: '/recouvrement' },
  { id: 'echeancier', label: ' Échéancier', icon: ' ', href: '/recouvrement/echeancier' },
  { id: 'relances', label: ' Relances', icon: ' ', href: '/recouvrement/relances' },
  { id: 'risques', label: ' Risques', icon: ' ', href: '/recouvrement/risques' },
];

export default function EcheancierPage() {
  const router = useRouter();
  const echeancier = getEcheancierClients() as any[];
  const clients = getAllClients() as any[];

  const echues = echeancier.filter(e => e.statut === 'echue');
  const aEchoir = echeancier.filter(e => e.statut === 'a_echoir');

  const totalEchu = echues.reduce((s, e) => s + e.montant, 0);
  const totalAE = aEchoir.reduce((s, e) => s + e.montant, 0);
  const avgRetard = echues.length > 0 ? Math.round(echues.reduce((s, e) => s + (e.retard || 0), 0) / echues.length) : 0;
  const promesses = echues.filter(e => e.promesse).length;

  const sorted = [...echeancier].sort((a, b) => (b.retard || 0) - (a.retard || 0));

  const getClientName = (clientId: string) => {
    const c = clients.find(cl => cl.id === clientId);
    return c?.raisonSociale || 'Client inconnu';
  };

  return (
    <div>
      <PageHeader
        breadcrumb="Recouvrement > Échéancier global"
        title="Échéancier Global Clients"
        subtitle={`${echeancier.length} factures en portefeuille`}
      />

      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'echeancier' ? String(echeancier.length) : undefined,
        }))}
        activeId="echeancier"
      />

      {/* KPIs 4 colonnes */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard color="red" icon=" " value={formatMontant(totalEchu)} label={`Échu (${echues.length})`} />
        <KpiCard color="blue" icon=" " value={formatMontant(totalAE)} label={`À échoir (${aEchoir.length})`} />
        <KpiCard color="orange" icon=" " value={`${avgRetard}j`} label="Retard moyen" />
        <KpiCard color="green" icon=" " value={String(promesses)} label="Promesses paiement" />
      </div>

      {/* Tableau */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Échéancier</span>
          <span className="data-table-count">{echeancier.length}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Facture</th>
                <th>Échéance</th>
                <th>Montant</th>
                <th>Retard</th>
                <th>Statut</th>
                <th>Promesse</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(e => {
                const rowCls = e.retard > 60 ? 'row-critique' : e.retard > 30 ? 'row-eleve' : e.retard > 0 ? 'row-moyen' : '';
                return (
                  <tr key={e.id} className={rowCls}>
                    <td>
                      <a href="#" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: '600' }}
                        onClick={ev => { ev.preventDefault(); router.push('/recouvrement'); }}>
                        {getClientName(e.client_id)}
                      </a>
                    </td>
                    <td className="cell-mono fs-xs">{e.facture}</td>
                    <td className="cell-mono fs-xs">{formatDate(e.date_echeance)}</td>
                    <td className="cell-amount">{formatMontant(e.montant)}</td>
                    <td className={`cell-mono fw-600 ${e.retard > 30 ? 'text-danger' : e.retard > 0 ? 'text-warning' : 'text-success'}`}>
                      {e.retard}j
                    </td>
                    <td>
                      <span className={`badge ${e.statut === 'echue' ? 'badge-critique' : 'badge-conforme'}`}>
                        {e.statut === 'echue' ? 'échue' : 'à échoir'}
                      </span>
                    </td>
                    <td className="cell-mono fs-xs">
                      {e.promesse ? ` ${formatDate(e.promesse)}` : ' -'}
                    </td>
                    <td className="fs-xs">{e.action || ' -'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Widget impact trésorerie */}
      <div className="widget" style={{ marginTop: '16px', borderLeft: '3px solid var(--info)' }}>
        <div className="widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
          <div>
            <div className="fw-600"> Impact trésorerie des encaissements attendus</div>
            <div className="fs-xs text-muted">Si toutes les créances échues sont recouvrées : +{formatMontant(totalEchu)} en trésorerie</div>
          </div>
          <Btn variant="secondary" size="sm" href="/tresorerie/previsions">Prévisions </Btn>
        </div>
      </div>
    </div>
  );
}
