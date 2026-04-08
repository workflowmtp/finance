'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, KpiCard, ModuleTabs, ScoreGauge } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { getDashboardKpis, getTachesCloture, getClotureByCategorie } from '@/lib/data';
import { CLOTURE_CATEGORY_COLORS, CLOTURE_CATEGORY_LINKS } from '@/lib/format';

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

export default function CloturesPage() {
  const router = useRouter();
  const kpis = getDashboardKpis();
  const taches = getTachesCloture();
  const cats = getClotureByCategorie();
  const [filterCat, setFilterCat] = useState('tous');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [filterBlocage, setFilterBlocage] = useState('tous');

  const byStatut: Record<string, number> = {};
  taches.forEach((t: any) => { byStatut[t.statut] = (byStatut[t.statut] || 0) + 1; });
  const bloq = taches.filter((t: any) => t.blocage === 'bloquant_cloture' && t.statut !== 'termine');
  const restantes = taches.filter((t: any) => t.statut !== 'termine').length;
  const joursHomme = Math.ceil(restantes * 0.5);

  const sorted = [...taches].sort((a: any, b: any) => {
    const o: Record<string, number> = { bloquant: 0, en_attente: 1, non_demarre: 2, en_cours: 3, termine: 4 };
    return (o[a.statut] ?? 9) - (o[b.statut] ?? 9);
  });

  const filtered = sorted.filter((t: any) => {
    if (filterCat !== 'tous' && t.categorie !== filterCat) return false;
    if (filterStatut !== 'tous' && t.statut !== filterStatut) return false;
    if (filterBlocage !== 'tous' && t.blocage !== filterBlocage) return false;
    return true;
  });

  const uniqueCats = [...new Set(taches.map((t: any) => t.categorie))];

  const getNavPath = (cat: string) => {
    const link = CLOTURE_CATEGORY_LINKS[cat];
    if (!link) return null;
    const map: Record<string, string> = {
      'documents_non_compta': '/documents',
      'recouvrement_portefeuille': '/recouvrement/portefeuille',
      'banque_rapprochement': '/banque/rapprochement',
      'fiscalite_provisions': '/fiscalite/provisions',
      'analytique_poles': '/analytique',
      'audit_global': '/audit',
    };
    return map[link.sub] || null;
  };

  return (
    <div>
      <PageHeader
        breadcrumb="Clôtures > Checklist mensuelle"
        title="Checklist de Clôture - Mars 2025"
        subtitle={`${taches.length} tâches - Score readiness : ${kpis.scoreCloture}%`}
        actions={
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push('/dsf/readiness')}> DSF</button>
            <button className="btn btn-primary btn-sm" onClick={() => router.push('/agent-ia')}> Demander à l'IA</button>
          </>
        }
      />
      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'checklist' ? `${kpis.scoreCloture}%` : t.id === 'bloquantes' && bloq.length > 0 ? String(bloq.length) : undefined,
          badgeColor: t.id === 'bloquantes' ? 'var(--danger)' : undefined,
        }))}
        activeId="checklist"
      />

      {/* Decision banner */}
      {kpis.scoreCloture < 80 && (
        <div className={`decision-banner ${bloq.length > 0 ? 'critical' : 'warning'}`}>
          <span className="decision-banner-icon">{bloq.length > 0 ? ' ' : ' '}</span>
          <div className="decision-banner-content">
            <div className={`decision-banner-title ${bloq.length > 0 ? 'text-danger' : 'text-warning'}`}>{restantes} tâches restantes - ~{joursHomme} jours-homme estimés</div>
            <div className="decision-banner-text">{bloq.length > 0 ? bloq.length + ' tâche(s) bloquante(s). ' : ''}Échéance recommandée : 12 avril 2025.</div>
            <div className="decision-banner-actions">
              {bloq.length > 0 && <button className="btn btn-sm btn-danger" onClick={() => router.push('/clotures/bloquantes')}>Bloquantes</button>}
              <button className="btn btn-sm btn-secondary" onClick={() => router.push('/clotures/calendrier')}>Calendrier</button>
              <button className="btn btn-sm btn-secondary" onClick={() => router.push('/dsf/readiness')}>DSF</button>
            </div>
          </div>
        </div>
      )}

      {/* Score gauge + KPIs */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
        <ScoreGauge score={kpis.scoreCloture} size={100} label="Avancement" />
        <div className="kpi-grid" style={{ flex: 1, gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <KpiCard color="green" icon=" " value={String(byStatut.termine || 0)} label="Terminées" />
          <KpiCard color="blue" icon=" " value={String(byStatut.en_cours || 0)} label="En cours" />
          <KpiCard color="orange" icon=" " value={String(byStatut.en_attente || 0)} label="En attente" />
          <KpiCard color="purple" icon=" " value={String(byStatut.non_demarre || 0)} label="Non démarrées" />
          <KpiCard color="red" icon=" " value={String(bloq.length)} label="Bloquantes" href="/clotures/bloquantes" />
        </div>
      </div>

      {/* Progress by category */}
      <div className="widget" style={{ marginBottom: '20px' }}>
        <div className="widget-header"><span className="widget-title">Avancement par catégorie</span></div>
        <div className="widget-body" style={{ padding: '8px 20px' }}>
          {cats.map((cc: any) => {
            const color = CLOTURE_CATEGORY_COLORS[cc.categorie] || '#94A3B8';
            const navPath = getNavPath(cc.categorie);
            return (
              <div key={cc.categorie} className="cloture-progress-row" style={{ cursor: navPath ? 'pointer' : 'default' }}
                onClick={navPath ? () => router.push(navPath) : undefined}>
                <span className="cloture-cat-label">{cc.categorie}{navPath && <> <span className="fs-xs text-primary"> </span></>}</span>
                <div className="cloture-progress-bar-outer"><div className="cloture-progress-bar-inner" style={{ width: `${cc.pct}%`, background: color }} /></div>
                <span className={`cloture-pct ${cc.pct >= 80 ? 'text-success' : cc.pct >= 40 ? 'text-warning' : 'text-danger'}`}>{cc.done}/{cc.total} ({cc.pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-item">
          <span className="filter-label">Catégorie</span>
          <select className="filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="tous">Toutes</option>
            {uniqueCats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-item">
          <span className="filter-label">Statut</span>
          <select className="filter-select" value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
            <option value="tous">Tous</option>
            <option value="termine">Terminé</option>
            <option value="en_cours">En cours</option>
            <option value="non_demarre">Non démarré</option>
            <option value="en_attente">En attente</option>
          </select>
        </div>
        <div className="filter-item">
          <span className="filter-label">Blocage</span>
          <select className="filter-select" value={filterBlocage} onChange={e => setFilterBlocage(e.target.value)}>
            <option value="tous">Tous</option>
            <option value="bloquant_cloture">Bloquant</option>
            <option value="non_bloquant">Non bloquant</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Tâches de clôture</span>
          <span className="data-table-count" id="cloCount">{filterCat === 'tous' && filterStatut === 'tous' && filterBlocage === 'tous' ? taches.length : filtered.length}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" id="cloTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cat.</th>
                <th>Description</th>
                <th>Responsable</th>
                <th>Échéance</th>
                <th>Statut</th>
                <th>Blocage</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t: any) => {
                const isBloc = t.blocage === 'bloquant_cloture' && t.statut !== 'termine';
                const rowCls = isBloc ? 'row-critique' : t.statut === 'en_attente' ? 'row-eleve' : t.statut === 'termine' ? '' : '';
                const catColor = CLOTURE_CATEGORY_COLORS[t.categorie] || '#94A3B8';
                const st = STATUT_LABELS[t.statut] || { label: t.statut, cls: '' };
                return (
                  <tr key={t.id} className={rowCls} data-cat={t.categorie} data-statut={t.statut} data-blocage={t.blocage}>
                    <td className="cell-mono fs-xs">{t.id}</td>
                    <td className="fs-xs fw-600"><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 2, background: catColor, marginRight: 4 }} />{t.categorie}</td>
                    <td className="fs-sm">{t.description}</td>
                    <td className="fs-sm"><a href="#" style={{ color: 'var(--secondary)', textDecoration: 'none' }} onClick={e => { e.preventDefault(); router.push('/audit/profils'); }}>{t.responsableNom}</a></td>
                    <td className="cell-mono fs-xs">{formatDate(t.echeance)}</td>
                    <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                    <td>{isBloc ? <span className="badge badge-critique">Bloquant</span> : <span className="badge badge-faible">Non bloq.</span>}</td>
                    <td>
                      {t.statut !== 'termine' ? <button className="btn btn-sm btn-primary">Avancer</button> : <span className="text-success fs-xs"> </span>}
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
