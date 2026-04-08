'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, KpiCard, Btn } from '@/components/ui';
import { formatMontant, formatPct, formatDate, getRapColor } from '@/lib/format';
import { getComptesWithBanques, getBankTransactions } from '@/lib/data';

const TABS = [
  { id: 'vue', label: 'Vue multi-banques', icon: ' ', href: '/banque' },
  { id: 'rapprochement', label: 'Rapprochements', icon: ' ', href: '/banque/rapprochement' },
  { id: 'orphelins', label: 'Orphelins', icon: ' ', href: '/banque/orphelins' },
];

export default function RapprochementPage() {
  const router = useRouter();
  const comptes = getComptesWithBanques() as any[];
  const transactions = getBankTransactions() as any[];
  const [selectedCompte, setSelectedCompte] = useState(comptes[0]?.id || '');

  const totalNR = comptes.reduce((s: number, c: any) => s + c.nb_non_rapproches, 0);

  const cb = comptes.find(c => c.id === selectedCompte);
  const mvts = transactions.filter((t: any) => t.compte_id === selectedCompte);
  const nonRap = mvts.filter((t: any) => !t.rapproche);
  const ecart = cb ? cb.solde_releve - cb.solde_comptable : 0;

  return (
    <div>
      <PageHeader
        breadcrumb="Banque > Rapprochements"
        title="Rapprochement Bancaire"
        subtitle={`${totalNR} mouvements en attente`}
      />

      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'rapprochement' ? String(totalNR) : undefined,
          badgeColor: t.id === 'rapprochement' ? 'var(--warning)' : undefined,
        }))}
        activeId="rapprochement"
      />

      {/* Filtre */}
      <div className="filters-bar">
        <div className="filter-item">
          <span className="filter-label">Compte</span>
          <select
            className="filter-select"
            style={{ minWidth: '280px' }}
            value={selectedCompte}
            onChange={e => setSelectedCompte(e.target.value)}
          >
            {comptes.map(c => {
              const rI = c.taux_rapprochement >= 95 ? ' ' : c.taux_rapprochement >= 85 ? ' ' : ' ';
              return (
                <option key={c.id} value={c.id}>
                  {rI} {c.banqueCode} - {c.libelle} ({c.nb_non_rapproches} non rap.)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {cb && (
        <>
          {/* KPIs */}
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '20px' }}>
            <KpiCard color="blue" icon=" " value={formatMontant(cb.solde_comptable)} label="Solde comptable" />
            <KpiCard color="cyan" icon=" " value={formatMontant(cb.solde_releve)} label="Solde relevé" />
            <KpiCard color={Math.abs(ecart) < 100000 ? 'green' : 'red'} icon=" " value={(ecart >= 0 ? '+' : '') + formatMontant(ecart)} label="Écart" />
            <KpiCard color="green" icon=" " value={formatPct(cb.taux_rapprochement)} label="Taux rapprochement" />
          </div>

          {/* Table */}
          <div className="data-table-wrapper">
            <div className="data-table-header">
              <span className="data-table-title">Mouvements non rapprochés</span>
              <span className="data-table-count">{nonRap.length} mouvements</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Libellé</th>
                  <th>Débit</th>
                  <th>Crédit</th>
                  <th>Suggestion IA</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {nonRap.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}> Tous les mouvements sont rapprochés pour ce compte.</td></tr>
                ) : (
                  nonRap.map((mv: any, i: number) => (
                    <tr key={i}>
                      <td className="cell-mono fs-xs">{formatDate(mv.date)}</td>
                      <td className="fs-sm">{mv.libelle}</td>
                      <td className={`cell-amount ${mv.debit > 0 ? 'negative' : ''}`}>{mv.debit > 0 ? formatMontant(mv.debit) : '-'}</td>
                      <td className={`cell-amount ${mv.credit > 0 ? 'positive' : ''}`}>{mv.credit > 0 ? formatMontant(mv.credit) : '-'}</td>
                      <td className="fs-xs" style={{ maxWidth: '250px' }}>
                        {mv.suggestion_ia ? (
                          <span style={{ color: 'var(--primary)' }}> {mv.suggestion_ia}</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Btn variant="primary" size="sm"> Rapprocher</Btn>
                          <Btn variant="secondary" size="sm">Régulariser</Btn>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
