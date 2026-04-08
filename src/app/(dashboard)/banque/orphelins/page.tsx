'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, KpiCard, Btn } from '@/components/ui';
import { formatMontant, formatDate } from '@/lib/format';
import { getBankTransactions, getComptesWithBanques } from '@/lib/data';

const TABS = [
  { id: 'vue', label: 'Vue multi-banques', icon: ' ', href: '/banque' },
  { id: 'rapprochement', label: 'Rapprochements', icon: ' ', href: '/banque/rapprochement' },
  { id: 'orphelins', label: 'Orphelins', icon: ' ', href: '/banque/orphelins' },
];

export default function OrphelinsPage() {
  const router = useRouter();
  const transactions = getBankTransactions() as any[];
  const comptes = getComptesWithBanques() as any[];

  const orphelins = transactions.filter((t: any) => !t.rapproche);

  // Classification IA
  const types: Record<string, { count: number; total: number }> = {};
  for (const o of orphelins) {
    const sug = o.suggestion_ia || 'Non classifié';
    const key = sug.indexOf('Commission') >= 0 || sug.indexOf('Frais') >= 0 ? 'Frais bancaires' :
                sug.indexOf('CNPS') >= 0 ? 'Charges sociales' :
                sug.indexOf('Virement interne') >= 0 ? 'Virements internes' :
                sug.indexOf('Acompte') >= 0 || sug.indexOf('Remise') >= 0 ? 'Encaissements clients' :
                sug.indexOf('Assurance') >= 0 ? 'Assurances' :
                sug.indexOf('Agios') >= 0 ? 'Agios bancaires' :
                sug.indexOf('ENEO') >= 0 || sug.indexOf('CAMWATER') >= 0 ? 'Charges exploitation' :
                'Autres';
    if (!types[key]) types[key] = { count: 0, total: 0 };
    types[key].count++;
    types[key].total += o.debit || o.credit || 0;
  }

  return (
    <div>
      <PageHeader
        breadcrumb="Banque > Mouvements orphelins"
        title="Mouvements Orphelins"
        subtitle={`${orphelins.length} mouvements sans correspondance comptable`}
      />

      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'orphelins' ? String(orphelins.length) : undefined,
        }))}
        activeId="orphelins"
      />

      {/* Classification et actions */}
      <div className="grid-2" style={{ marginBottom: '20px' }}>
        {/* Classification IA */}
        <div className="widget">
          <div className="widget-header">
            <span className="widget-title"> Classification IA des orphelins</span>
          </div>
          <div className="widget-body">
            {Object.entries(types).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div><span className="fs-sm fw-600">{k}</span> <span className="fs-xs text-muted">({v.count})</span></div>
                <span className="cell-mono fs-sm">{formatMontant(v.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions recommandées */}
        <div className="widget">
          <div className="widget-header">
            <span className="widget-title"> Actions recommandées</span>
          </div>
          <div className="widget-body">
            <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
              <div className="fs-sm fw-600 text-primary">1. Saisir les frais bancaires</div>
              <div className="fs-xs text-muted mt-4">Plusieurs commissions et frais non comptabilisés identifiés sur AFB, BICEC, SGC et UBA.</div>
            </div>
            <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
              <div className="fs-sm fw-600 text-primary">2. Réconcilier les virements internes</div>
              <div className="fs-xs text-muted mt-4">Virement AFB{'>'}UBA de 25 000 000 FCFA à rapprocher en miroir.</div>
            </div>
            <div style={{ padding: '12px 0' }}>
              <div className="fs-sm fw-600 text-primary">3. Identifier les encaissements clients</div>
              <div className="fs-xs text-muted mt-4">Chèque 8 500 000 et remise 5 200 000 à attribuer aux clients concernés.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Tous les mouvements orphelins</span>
          <span className="data-table-count">{orphelins.length}</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Compte</th>
              <th>Date</th>
              <th>Libellé</th>
              <th>Débit</th>
              <th>Crédit</th>
              <th>Suggestion IA</th>
            </tr>
          </thead>
          <tbody>
            {orphelins.map((mv: any, i: number) => {
              const compte = comptes.find(c => c.id === mv.compte_id);
              const bqCode = compte?.banqueCode || '';

              return (
                <tr key={i}>
                  <td className="cell-mono fs-xs fw-600">{bqCode}</td>
                  <td className="cell-mono fs-xs">{formatDate(mv.date)}</td>
                  <td className="fs-sm">{mv.libelle}</td>
                  <td className={`cell-amount ${mv.debit > 0 ? 'negative' : ''}`}>{mv.debit > 0 ? formatMontant(mv.debit) : ''}</td>
                  <td className={`cell-amount ${mv.credit > 0 ? 'positive' : ''}`}>{mv.credit > 0 ? formatMontant(mv.credit) : ''}</td>
                  <td className="fs-xs" style={{ color: 'var(--primary)' }}>{mv.suggestion_ia ? ' ' + mv.suggestion_ia : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
