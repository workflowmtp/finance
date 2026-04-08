'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, KpiCard, ModuleTabs } from '@/components/ui';
import { formatPct } from '@/lib/format';
import { getDashboardKpis, getDsfTableaux } from '@/lib/data';
import { getDsfTableauLink } from '@/lib/format';

const TABS = [
  { id: 'tableaux', label: ' 24 tableaux', icon: ' ', href: '/dsf' },
  { id: 'alertes', label: ' Alertes', icon: ' ', href: '/dsf/alertes' },
  { id: 'readiness', label: ' Readiness', icon: ' ', href: '/dsf/readiness' },
];

const STATUT_BADGES: Record<string, { label: string; cls: string }> = {
  pret: { label: 'Prêt', cls: 'badge-conforme' },
  a_verifier: { label: 'À vérifier', cls: 'badge-attente' },
  fragile: { label: 'Fragile', cls: 'badge-eleve' },
  bloque: { label: 'Bloqué', cls: 'badge-bloquant badge-pulse' },
};

export default function DsfPage() {
  const router = useRouter();
  const kpis = getDashboardKpis();
  const tableaux = getDsfTableaux() as any[];

  const byStat = { pret: 0, a_verifier: 0, fragile: 0, bloque: 0 };
  tableaux.forEach((t: any) => { if (byStat[t.statut as keyof typeof byStat] !== undefined) byStat[t.statut as keyof typeof byStat]++; });
  const atRisk = byStat.fragile + byStat.bloque;

  return (
    <div>
      <PageHeader
        breadcrumb="DSF > 24 tableaux"
        title="Tableaux DSF - Exercice 2024"
        subtitle="24 tableaux de la Déclaration Statistique et Fiscale"
        actions={
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push('/clotures')}> Clôture</button>
            <button className="btn btn-primary btn-sm" onClick={() => router.push('/agent-ia')}> Analyse IA</button>
          </>
        }
      />
      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'alertes' && atRisk > 0 ? String(atRisk) : t.id === 'readiness' ? `${kpis.scoreDSF}%` : undefined,
          badgeColor: t.id === 'alertes' ? 'var(--danger)' : undefined,
        }))}
        activeId="tableaux"
      />

      {/* Decision banner */}
      {atRisk > 0 && (
        <div className={`decision-banner ${byStat.bloque > 0 ? 'critical' : 'warning'}`}>
          <span className="decision-banner-icon"> </span>
          <div className="decision-banner-content">
            <div className={`decision-banner-title ${byStat.bloque > 0 ? 'text-danger' : 'text-warning'}`}>{atRisk} tableaux à risque - Score DSF : {kpis.scoreDSF}%</div>
            <div className="decision-banner-text">{byStat.bloque > 0 ? byStat.bloque + ' bloqué(s). ' : ''}{byStat.fragile} fragile(s). La liasse ne peut pas être déposée en l&apos;état.</div>
            <div className="decision-banner-actions">
              <button className="btn btn-sm btn-danger" onClick={() => router.push('/dsf/alertes')}>Voir les alertes</button>
              <button className="btn btn-sm btn-secondary" onClick={() => router.push('/clotures/bloquantes')}>Clôture bloquantes</button>
              <button className="btn btn-sm btn-secondary" onClick={() => router.push('/dsf/readiness')}>Plan d&apos;action</button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <KpiCard color="green" icon=" " value={String(byStat.pret)} label="Prêts" />
        <KpiCard color="orange" icon=" " value={String(byStat.a_verifier)} label="À vérifier" href="/dsf/alertes" />
        <KpiCard color="red" icon=" " value={String(byStat.fragile)} label="Fragiles" href="/dsf/alertes" />
        <KpiCard color="red" icon=" " value={String(byStat.bloque)} label="Bloqués" href="/dsf/alertes" />
        <KpiCard color="blue" icon=" " value={formatPct(kpis.scoreDSF)} label="Readiness DSF" href="/dsf/readiness" />
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <div className="data-table-header"><span className="data-table-title">Détail des 24 tableaux</span></div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>N°</th>
                <th>Intitulé</th>
                <th>Poids</th>
                <th>Fiabilité</th>
                <th>Statut</th>
                <th>Clôture liée</th>
                <th>Module source</th>
                <th>Remarque</th>
              </tr>
            </thead>
            <tbody>
              {tableaux.map((t: any) => {
                const fiabCol = t.fiabilite >= 80 ? '#10B981' : t.fiabilite >= 50 ? '#F59E0B' : '#EF4444';
                const st = STATUT_BADGES[t.statut] || { label: t.statut, cls: '' };
                const rowCls = t.statut === 'bloque' ? 'row-critique' : t.statut === 'fragile' ? 'row-eleve' : t.statut === 'a_verifier' ? 'row-moyen' : '';
                const link = getDsfTableauLink(t.numero);
                return (
                  <tr key={t.numero} className={rowCls}>
                    <td className="cell-mono fw-700">{t.numero}</td>
                    <td className="fw-600 fs-sm">{t.intitule}</td>
                    <td className="fs-xs text-warning">{t.poids === 3 ? ' ' : t.poids === 2 ? ' ' : ' '}</td>
                    <td>
                      <div className="d-flex align-center gap-6">
                        <div className="progress-bar-wrapper" style={{ width: 50 }}>
                          <div className="progress-bar-fill" style={{ width: `${t.fiabilite}%`, background: fiabCol }} />
                        </div>
                        <span className="cell-mono fs-xs fw-600" style={{ color: fiabCol }}>{t.fiabilite}%</span>
                      </div>
                    </td>
                    <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                    <td className="fs-xs">
                      {t.dependances?.length > 0 ? t.dependances.map((d: string, i: number) => (
                        <span key={d}>
                          <span className="cell-mono" style={{ cursor: 'pointer', color: 'var(--secondary)' }} onClick={() => router.push('/clotures')}>{d}</span>
                          {i < t.dependances.length - 1 && ', '}
                        </span>
                      )) : <span className="text-muted"> -</span>}
                    </td>
                    <td>
                      {link && link.module ? (
                        <button className="btn btn-sm btn-secondary" style={{ fontSize: 10, padding: '2px 6px' }} onClick={() => router.push(`/${link.module.replace('_', '-')}`)}>
                          {link.label} 
                        </button>
                      ) : <span className="fs-xs text-muted">{link?.label || ' -'}</span>}
                    </td>
                    <td className="fs-xs">{t.remarque || ' -'}</td>
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
