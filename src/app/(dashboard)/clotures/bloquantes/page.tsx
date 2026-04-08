'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { getTachesCloture, getDashboardKpis } from '@/lib/data';
import { CLOTURE_CATEGORY_COLORS } from '@/lib/format';

const TABS = [
  { id: 'checklist', label: ' Checklist', icon: ' ', href: '/clotures' },
  { id: 'bloquantes', label: ' Bloquantes', icon: ' ', href: '/clotures/bloquantes' },
  { id: 'calendrier', label: ' Calendrier', icon: ' ', href: '/clotures/calendrier' },
];

const STATUT_LABELS: Record<string, { label: string; cls: string }> = {
  termine: { label: 'Terminé', cls: 'badge-termine' },
  en_cours: { label: 'En cours', cls: 'badge-en-cours' },
  en_attente: { label: 'En attente', cls: 'badge-attente' },
  non_demarre: { label: 'Non démarré', cls: 'badge-non-demarre' },
  bloquant: { label: 'Bloquant', cls: 'badge-bloquant badge-pulse' },
};

const CAT_MODULE_LINKS: Record<string, { label: string; href: string | null }> = {
  Achats: { label: 'Documents', href: '/documents' },
  Ventes: { label: 'Recouvrement', href: '/recouvrement/portefeuille' },
  Banque: { label: 'Rapprochements', href: '/banque/rapprochement' },
  Fiscal: { label: 'Provisions', href: '/fiscalite/provisions' },
  Paie: { label: ' -', href: null },
  Stocks: { label: ' -', href: null },
  Analytique: { label: 'Analytique', href: '/analytique' },
  Contrôle: { label: 'Audit', href: '/audit' },
};

export default function BloquantesPage() {
  const router = useRouter();
  const taches = getTachesCloture();
  const kpis = getDashboardKpis();
  const bloquantes = taches.filter((t: any) => t.blocage === 'bloquant_cloture' && t.statut !== 'termine');

  return (
    <div>
      <PageHeader
        breadcrumb="Clôtures > Tâches bloquantes"
        title="Tâches Bloquantes"
        subtitle={`${bloquantes.length} tâches bloquent la clôture mars 2025`}
      />
      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'checklist' ? `${kpis.scoreCloture}%` : t.id === 'bloquantes' && bloquantes.length > 0 ? String(bloquantes.length) : undefined,
          badgeColor: t.id === 'bloquantes' ? 'var(--danger)' : undefined,
        }))}
        activeId="bloquantes"
      />

      {/* Decision banner */}
      {bloquantes.length > 0 && (
        <div className="decision-banner critical">
          <span className="decision-banner-icon"> </span>
          <div className="decision-banner-content">
            <div className="decision-banner-title text-danger">{bloquantes.length} tâches bloquent la clôture</div>
            <div className="decision-banner-text">Ces tâches doivent être terminées avant validation. Anomalies liées peuvent impacter la DSF.</div>
            <div className="decision-banner-actions">
              <button className="btn btn-sm btn-secondary" onClick={() => router.push('/dashboard/alertes')}>Anomalies liées</button>
              <button className="btn btn-sm btn-secondary" onClick={() => router.push('/dsf/alertes')}>DSF impactées</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="data-table-wrapper">
        <div className="data-table-header"><span className="data-table-title">Tâches bloquantes</span></div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cat.</th>
              <th>Description</th>
              <th>Responsable</th>
              <th>Échéance</th>
              <th>Statut</th>
              <th>Module lié</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bloquantes.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--primary)', fontWeight: 600 }}> Aucune tâche bloquante - La clôture peut être validée.</td></tr>
            ) : bloquantes.map((t: any) => {
              const link = CAT_MODULE_LINKS[t.categorie] || { label: ' -', href: null };
              const catColor = CLOTURE_CATEGORY_COLORS[t.categorie] || '#94A3B8';
              const st = STATUT_LABELS[t.statut] || { label: t.statut, cls: '' };
              return (
                <tr key={t.id} className="row-critique">
                  <td className="cell-mono fs-xs">{t.id}</td>
                  <td className="fw-600"><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 2, background: catColor, marginRight: 4 }} />{t.categorie}</td>
                  <td className="fs-sm">{t.description}</td>
                  <td className="fs-sm"><a href="#" style={{ color: 'var(--secondary)', textDecoration: 'none' }} onClick={e => { e.preventDefault(); router.push('/audit/profils'); }}>{t.responsableNom}</a></td>
                  <td className="cell-mono fs-xs">{formatDate(t.echeance)}</td>
                  <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                  <td>
                    {link.href ? <button className="btn btn-sm btn-secondary" onClick={() => router.push(link.href!)}>{link.label} </button> : <span className="text-muted fs-xs"> -</span>}
                  </td>
                  <td><button className="btn btn-sm btn-primary">Avancer</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
