'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, ScoreGauge } from '@/components/ui';
import { getDashboardKpis, getDsfTableaux } from '@/lib/data';

const TABS = [
  { id: 'tableaux', label: ' 24 tableaux', icon: ' ', href: '/dsf' },
  { id: 'alertes', label: ' Alertes', icon: ' ', href: '/dsf/alertes' },
  { id: 'readiness', label: ' Readiness', icon: ' ', href: '/dsf/readiness' },
];

const ACTIONS = [
  { prio: 'P1', text: 'Finaliser rapprochements bancaires (5 comptes)  T5', href: '/banque/rapprochement' },
  { prio: 'P1', text: 'Provisions clients douteux (SODECOTON 56M)  T9', href: '/fiscalite/provisions' },
  { prio: 'P1', text: 'Saisir 7 factures non comptabilisées  T3, T16', href: '/documents' },
  { prio: 'P2', text: 'Provisions fiscales TVA + IS  T19, T24', href: '/fiscalite/provisions' },
  { prio: 'P2', text: 'FNP et charges rattachées  T11', href: '/clotures' },
  { prio: 'P2', text: 'Valorisation stocks  T16', href: null },
  { prio: 'P3', text: 'Charges sociales CNPS  T14', href: null },
  { prio: 'P3', text: 'Frais bancaires mars  T21', href: '/banque' },
];

export default function ReadinessPage() {
  const router = useRouter();
  const kpis = getDashboardKpis();
  const tableaux = getDsfTableaux() as any[];

  const byStat = { pret: 0, a_verifier: 0, fragile: 0, bloque: 0 };
  tableaux.forEach((t: any) => { if (byStat[t.statut as keyof typeof byStat] !== undefined) byStat[t.statut as keyof typeof byStat]++; });
  const joursEstime = Math.round((100 - kpis.scoreDSF) / 8);

  return (
    <div>
      <PageHeader
        breadcrumb="DSF > Readiness DSF"
        title="Score Readiness DSF"
        subtitle="Évaluation globale de la préparation - Liasse 2024"
      />
      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'readiness' ? `${kpis.scoreDSF}%` : undefined,
        }))}
        activeId="readiness"
      />

      {/* Grande jauge */}
      <div className="widget" style={{ marginBottom: '20px' }}>
        <div className="widget-body" style={{ display: 'flex', alignItems: 'center', gap: '40px', padding: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <ScoreGauge score={kpis.scoreDSF} size={160} label="Score DSF" />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Synthèse de préparation</div>
            <div className="fs-sm" style={{ lineHeight: 2 }}>
              <span className="text-success fw-600">{byStat.pret}</span> prêts  <span className="text-warning fw-600">{byStat.a_verifier}</span> à vérifier  <span className="text-danger fw-600">{byStat.fragile}</span> fragiles  <span className="text-danger fw-700">{byStat.bloque}</span> bloqués
            </div>
            <div className="fs-sm text-muted mt-8">Pondération : états principaux  3, annexes  2, détails  1</div>
            <div className="fs-sm mt-8">Estimation : <strong className={joursEstime > 10 ? 'text-danger' : 'text-warning'}>{joursEstime} jours-homme</strong> restants</div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="widget">
        <div className="widget-header"><span className="widget-title"> Carte de fiabilité</span></div>
        <div className="widget-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {tableaux.map((t: any) => {
              const bg = t.fiabilite >= 90 ? '#10B981' : t.fiabilite >= 70 ? '#3B82F6' : t.fiabilite >= 50 ? '#F59E0B' : '#EF4444';
              const opacity = (t.fiabilite / 100 * 0.6 + 0.4).toFixed(2);
              return (
                <div key={t.numero}
                  style={{ width: 72, padding: '10px 6px', background: bg, opacity: parseFloat(opacity), borderRadius: 'var(--radius-md)', textAlign: 'center', cursor: 'pointer' }}
                  title={`T${t.numero} - ${t.intitule} - ${t.fiabilite}%`}
                  onClick={() => router.push('/dsf/alertes')}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: '#fff' }}>T{t.numero}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>{t.fiabilite}%</div>
                </div>
              );
            })}
          </div>
          <div className="chart-legend" style={{ marginTop: '14px' }}>
            <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: '#10B981' }}></span> 90%</span>
            <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: '#3B82F6' }}></span>70-89%</span>
            <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: '#F59E0B' }}></span>50-69%</span>
            <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: '#EF4444' }}></span> 50%</span>
          </div>
        </div>
      </div>

      {/* Plan d'action IA */}
      <div className="widget" style={{ borderLeft: '4px solid var(--primary)' }}>
        <div className="widget-header">
          <span className="widget-title"> Plan d&apos;action IA</span>
          <button className="btn btn-sm btn-primary" onClick={() => router.push('/agent-ia')}>Chat IA </button>
        </div>
        <div className="widget-body">
          {ACTIONS.map((a, i) => {
            const col = a.prio === 'P1' ? 'var(--danger)' : a.prio === 'P2' ? 'var(--warning)' : 'var(--info)';
            return (
              <div key={i}
                style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '10px', alignItems: 'center', cursor: a.href ? 'pointer' : 'default' }}
                onClick={a.href ? () => router.push(a.href!) : undefined}>
                <span className="badge" style={{ background: `${col}20`, color: col, minWidth: 28, justifyContent: 'center' }}>{a.prio}</span>
                <span className="fs-sm" style={{ flex: 1 }}>{a.text}</span>
                {a.href && <span className="fs-xs text-primary"> </span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-module links */}
      <div className="dash-grid-1-1-1" style={{ marginTop: '16px' }}>
        <div className="widget" style={{ borderLeft: '3px solid var(--primary)' }}>
          <div className="widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
            <div>
              <div className="fw-600"> Clôture mensuelle</div>
              <div className="fs-xs text-muted">Score clôture : {kpis.scoreCloture}%</div>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => router.push('/clotures')}></button>
          </div>
        </div>
        <div className="widget" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div className="widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
            <div>
              <div className="fw-600"> Conformité OHADA</div>
              <div className="fs-xs text-muted">Score : {kpis.scoreConformite}%</div>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => router.push('/fiscalite/controles')}></button>
          </div>
        </div>
        <div className="widget" style={{ borderLeft: '3px solid var(--danger)' }}>
          <div className="widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
            <div>
              <div className="fw-600"> Anomalies ouvertes</div>
              <div className="fs-xs text-muted">{kpis.anomaliesCritiques} critiques</div>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => router.push('/dashboard/alertes')}></button>
          </div>
        </div>
      </div>
    </div>
  );
}
