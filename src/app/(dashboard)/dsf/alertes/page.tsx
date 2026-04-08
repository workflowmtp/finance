'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs } from '@/components/ui';
import { getDsfTableaux, getTachesCloture, getAllAnomalies, getDashboardKpis } from '@/lib/data';
import { getDsfTableauLink, getDsfImpactForAnomaly } from '@/lib/format';

const TABS = [
  { id: 'tableaux', label: ' 24 tableaux', icon: ' ', href: '/dsf' },
  { id: 'alertes', label: ' Alertes', icon: ' ', href: '/dsf/alertes' },
  { id: 'readiness', label: ' Readiness', icon: ' ', href: '/dsf/readiness' },
];

const STATUT_DSF: Record<string, { label: string; cls: string }> = {
  fragile: { label: 'Fragile', cls: 'badge-eleve' },
  bloque: { label: 'Bloqué', cls: 'badge-bloquant badge-pulse' },
};

const STATUT_CLOTURE: Record<string, { label: string; cls: string }> = {
  termine: { label: 'Terminé', cls: 'badge-termine' },
  en_cours: { label: 'En cours', cls: 'badge-en-cours' },
  en_attente: { label: 'En attente', cls: 'badge-attente' },
  non_demarre: { label: 'Non démarré', cls: 'badge-non-demarre' },
  bloquant: { label: 'Bloquant', cls: 'badge-bloquant badge-pulse' },
};

export default function DsfAlertesPage() {
  const router = useRouter();
  const kpis = getDashboardKpis();
  const tableaux = getDsfTableaux() as any[];
  const taches = getTachesCloture() as any[];
  const anomalies = getAllAnomalies() as any[];

  const atRisk = tableaux.filter(t => t.statut === 'fragile' || t.statut === 'bloque');
  const dsfAnom = anomalies.filter(a => a.statut !== 'resolu' && ['CONF', 'FISC', 'PROV', 'DOC', 'BQ'].includes(a.categorie));

  return (
    <div>
      <PageHeader
        breadcrumb="DSF > Alertes & fiabilité"
        title="Alertes DSF & Fiabilité"
        subtitle="Tableaux à risque et anomalies impactantes"
      />
      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'alertes' && atRisk.length > 0 ? String(atRisk.length) : t.id === 'readiness' ? `${kpis.scoreDSF}%` : undefined,
          badgeColor: t.id === 'alertes' ? 'var(--danger)' : undefined,
        }))}
        activeId="alertes"
      />

      {/* Decision banner */}
      <div className="decision-banner critical">
        <span className="decision-banner-icon"> </span>
        <div className="decision-banner-content">
          <div className="decision-banner-title text-danger">{atRisk.length} tableaux à risque</div>
          <div className="decision-banner-text">Ces tableaux nécessitent une attention immédiate avant dépôt de la liasse.</div>
          <div className="decision-banner-actions">
            <button className="btn btn-sm btn-secondary" onClick={() => router.push('/clotures/bloquantes')}>Clôture bloquantes</button>
            <button className="btn btn-sm btn-secondary" onClick={() => router.push('/dashboard/alertes')}>Anomalies</button>
          </div>
        </div>
      </div>

      {/* At-risk tableaux */}
      {atRisk.map((t: any) => {
        const st = STATUT_DSF[t.statut] || { label: t.statut, cls: '' };
        const link = getDsfTableauLink(t.numero);
        const deps = (t.dependances || []).map((depId: string) => taches.find((tc: any) => tc.id === depId)).filter(Boolean);
        return (
          <div key={t.numero} className="widget" style={{ borderLeft: `4px solid ${t.statut === 'bloque' ? 'var(--danger)' : 'var(--warning)'}`, marginBottom: '16px' }}>
            <div className="widget-header">
              <span className="widget-title">T{t.numero} - {t.intitule}</span>
              <div className="d-flex align-center gap-8">
                <span className={`badge ${st.cls}`}>{st.label}</span>
                <span className={`cell-mono fw-600 ${t.fiabilite < 50 ? 'text-danger' : 'text-warning'}`}>{t.fiabilite}%</span>
                {link && link.module && <button className="btn btn-sm btn-secondary" onClick={() => router.push(`/${link.module.replace('_', '-')}`)}>{link.label} </button>}
              </div>
            </div>
            <div className="widget-body">
              <div className="grid-2" style={{ gap: '20px' }}>
                <div>
                  <div className="synthese-kpi-row"><span className="synthese-kpi-label">Fiabilité</span><span className={`synthese-kpi-value ${t.fiabilite < 50 ? 'text-danger' : 'text-warning'}`}>{t.fiabilite}%</span></div>
                  <div className="synthese-kpi-row"><span className="synthese-kpi-label">Poids DSF</span><span className="synthese-kpi-value">{t.poids === 3 ? 'Triple (état principal)' : t.poids === 2 ? 'Double' : 'Simple'}</span></div>
                  <div className="synthese-kpi-row"><span className="synthese-kpi-label">Remarque</span><span className="synthese-kpi-value fs-sm">{t.remarque || ' -'}</span></div>
                </div>
                <div>
                  <div className="form-label mb-8">Tâches de clôture liées</div>
                  {deps.length > 0 ? deps.map((d: any) => {
                    const taskSt = STATUT_CLOTURE[d.statut] || { label: d.statut, cls: '' };
                    return (
                      <div key={d.id} className="d-flex align-center gap-8" style={{ padding: '4px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }} onClick={() => router.push('/clotures')}>
                        <span className="cell-mono fs-xs" style={{ width: 60 }}>{d.id}</span>
                        <span className={`badge ${taskSt.cls}`}>{taskSt.label}</span>
                        <span className="fs-xs" style={{ flex: 1 }}>{d.description}</span>
                      </div>
                    );
                  }) : <div className="fs-xs text-muted">Aucune dépendance</div>}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Anomalies impactant la DSF */}
      <div className="widget">
        <div className="widget-header">
          <span className="widget-title"> Anomalies impactant la DSF</span>
          <button className="btn btn-sm btn-secondary" onClick={() => router.push('/dashboard/alertes')}>Toutes </button>
        </div>
        <div className="widget-body">
          {dsfAnom.length > 0 ? dsfAnom.map((a: any) => {
            const dsfImp = getDsfImpactForAnomaly(a);
            return (
              <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => router.push('/dashboard/alertes')}>
                <span className={`badge ${a.gravite === 'critique' ? 'badge-critique' : 'badge-eleve'}`}>{a.gravite === 'critique' ? 'Critique' : 'Élevé'}</span>
                <span className="fs-sm" style={{ flex: 1 }}>{a.titre}</span>
                {dsfImp.length > 0 && dsfImp.map((t: number) => <span key={t} className="badge badge-eleve" style={{ padding: '1px 4px', fontSize: '8px', marginRight: '2px' }}>T{t}</span>)}
                <span className="cell-mono fs-xs text-muted">{a.id}</span>
              </div>
            );
          }) : <div className="fs-sm text-success" style={{ textAlign: 'center', padding: '20px' }}> Aucune anomalie impactant la DSF.</div>}
        </div>
      </div>
    </div>
  );
}
