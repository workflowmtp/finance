'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs } from '@/components/ui';
import { getAllClients, getAllFournisseurs, getAllDocuments } from '@/lib/data';
import { formatCompact } from '@/lib/format';

const TABS = [
  { id: 'utilisateurs', label: 'Utilisateurs', icon: 'Utilisateurs', href: '/parametrage' },
  { id: 'banques', label: 'Banques', icon: 'Banques', href: '/parametrage/banques' },
  { id: 'tiers', label: 'Tiers', icon: 'Tiers', href: '/parametrage/tiers' },
  { id: 'journaux', label: 'Journaux', icon: 'Journaux', href: '/parametrage/journaux' },
  { id: 'regles', label: 'Règles', icon: 'Règles', href: '/parametrage/regles' },
  { id: 'ia', label: 'Config IA', icon: 'IA', href: '/parametrage/ia' },
];

export default function TiersPage() {
  const router = useRouter();
  const clients = getAllClients() as any[];
  const fournisseurs = getAllFournisseurs() as any[];
  const documents = getAllDocuments() as any[];

  return (
    <div>
      <PageHeader 
        breadcrumb="Paramétrage  Tiers" 
        title="Référentiel Tiers"
        subtitle={`${clients.length} clients  ${fournisseurs.length} fournisseurs`}
        actions={
          <button className="btn btn-secondary btn-sm" onClick={() => router.push('/recouvrement')}>
            Recouvrement 
          </button>
        } 
      />
      <ModuleTabs tabs={TABS} activeId="tiers" />
      
      <div className="grid-2">
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <span className="data-table-title">Clients ({clients.length})</span>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Code</th><th>Raison sociale</th><th>Pôle</th><th>Échu</th></tr>
            </thead>
            <tbody>
              {clients.map((c: any) => {
                const rowCls = c.statut === 'Contentieux' || c.statut === 'Bloqué' 
                  ? 'row-critique' 
                  : c.echeance_echue > 10000000 
                    ? 'row-eleve' 
                    : '';
                return (
                  <tr 
                    key={c.id} 
                    className={rowCls}
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push('/recouvrement')}
                  >
                    <td className="cell-mono fs-xs">{c.code_x3}</td>
                    <td className="fw-600 fs-sm" style={{ color: 'var(--secondary)' }}>{c.raison_sociale}</td>
                    <td className="cell-mono fs-xs">{c.pole}</td>
                    <td className={`cell-amount fs-xs ${c.echeance_echue > 0 ? 'negative' : ''}`}>
                      {formatCompact(c.echeance_echue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <span className="data-table-title">Fournisseurs ({fournisseurs.length})</span>
            <button className="btn btn-sm btn-secondary" onClick={() => router.push('/documents')}>
              Factures 
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Code</th><th>Raison sociale</th><th>Secteur</th><th>Docs</th></tr>
            </thead>
            <tbody>
              {fournisseurs.map((f: any) => {
                const fDocs = documents.filter((d: any) => d.tiers_id === f.id).length;
                return (
                  <tr 
                    key={f.id} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => alert(`Fiche fournisseur ${f.raison_sociale}  ${f.secteur}`)}
                  >
                    <td className="cell-mono fs-xs">{f.code_x3}</td>
                    <td className="fw-600 fs-sm" style={{ color: 'var(--secondary)' }}>{f.raison_sociale}</td>
                    <td className="fs-xs">{f.secteur}</td>
                    <td className={`cell-mono fs-xs ${fDocs > 0 ? 'text-primary fw-600' : 'text-muted'}`}>
                      {fDocs}
                    </td>
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
