'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs } from '@/components/ui';
import { getAllJournaux, getAllDocuments } from '@/lib/data';

const TABS = [
  { id: 'utilisateurs', label: 'Utilisateurs', icon: 'Utilisateurs', href: '/parametrage' },
  { id: 'banques', label: 'Banques', icon: 'Banques', href: '/parametrage/banques' },
  { id: 'tiers', label: 'Tiers', icon: 'Tiers', href: '/parametrage/tiers' },
  { id: 'journaux', label: 'Journaux', icon: 'Journaux', href: '/parametrage/journaux' },
  { id: 'regles', label: 'Règles', icon: 'Règles', href: '/parametrage/regles' },
  { id: 'ia', label: 'Config IA', icon: 'IA', href: '/parametrage/ia' },
];

const PLAN_COMPTABLE = [
  { classe: '1', label: 'Capitaux propres et ressources assimilées' },
  { classe: '2', label: 'Charges immobilisées et immobilisations' },
  { classe: '3', label: 'Stocks' },
  { classe: '4', label: 'Tiers (fournisseurs, clients, État, personnel)' },
  { classe: '5', label: 'Trésorerie (banques, caisse, virements)' },
  { classe: '6', label: 'Charges des activités ordinaires' },
  { classe: '7', label: 'Produits des activités ordinaires' },
  { classe: '8', label: 'Comptes des autres charges et produits (HAO)' },
];

export default function JournauxPage() {
  const router = useRouter();
  const journaux = getAllJournaux() as any[];
  const docs = getAllDocuments() as any[];

  return (
    <div>
      <PageHeader 
        breadcrumb="Paramétrage  Journaux & Comptes" 
        title="Journaux Comptables & Plan de Comptes"
        subtitle={`${journaux.length} journaux  8 classes OHADA / SYSCOHADA révisé  Sage X3`}
        actions={
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push('/documents')}>
              Documents
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push('/fiscalite/controles')}>
              Contrôles OHADA
            </button>
          </>
        } 
      />
      <ModuleTabs tabs={TABS} activeId="journaux" />
      
      <div className="grid-2">
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <span className="data-table-title">Journaux comptables</span>
            <span className="data-table-count">{journaux.length}</span>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Code</th><th>Libellé</th><th>Docs</th></tr>
            </thead>
            <tbody>
              {journaux.map((j: any) => {
                const docCount = docs.filter((d: any) => d.journal === j.code).length;
                return (
                  <tr 
                    key={j.code}
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push('/documents')}
                  >
                    <td className="cell-mono fw-600">{j.code}</td>
                    <td className="fs-sm">{j.label}</td>
                    <td className={`cell-mono fs-xs ${docCount > 0 ? 'text-primary fw-600' : 'text-muted'}`}>
                      {docCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <span className="data-table-title">Plan comptable OHADA</span>
            <span className="data-table-count">8 classes</span>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Cl.</th><th>Intitulé</th></tr>
            </thead>
            <tbody>
              {PLAN_COMPTABLE.map(p => (
                <tr key={p.classe}>
                  <td className="cell-mono fw-700" style={{ fontSize: 16 }}>{p.classe}</td>
                  <td className="fs-sm">{p.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="widget" style={{ marginTop: 16, borderLeft: '3px solid var(--danger)' }}>
        <div className="widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
          <div>
            <div className="fw-600 text-danger"> Compte 691500 invalide détecté</div>
            <div className="fs-xs text-muted">Ce compte n'existe pas dans le plan OHADA  anomalie ouverte dans l'audit</div>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={() => router.push('/audit')}>
            Audit 
          </button>
        </div>
      </div>
    </div>
  );
}
