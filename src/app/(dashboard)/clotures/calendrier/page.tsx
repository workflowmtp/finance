'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs } from '@/components/ui';
import { getTachesCloture, getDashboardKpis } from '@/lib/data';
import { CLOTURE_CATEGORY_COLORS } from '@/lib/format';

const TABS = [
  { id: 'checklist', label: ' Checklist', icon: ' ', href: '/clotures' },
  { id: 'bloquantes', label: ' Bloquantes', icon: ' ', href: '/clotures/bloquantes' },
  { id: 'calendrier', label: ' Calendrier', icon: ' ', href: '/clotures/calendrier' },
];

export default function CalendrierPage() {
  const router = useRouter();
  const taches = getTachesCloture();
  const kpis = getDashboardKpis();
  const dayRange = 15;
  const bloquantes = taches.filter((t: any) => t.blocage === 'bloquant_cloture' && t.statut !== 'termine');

  const sorted = [...taches].sort((a: any, b: any) => {
    if (a.categorie !== b.categorie) return a.categorie.localeCompare(b.categorie);
    return a.echeance.localeCompare(b.echeance);
  });

  let lastCat = '';

  return (
    <div>
      <PageHeader
        breadcrumb="Clôtures > Calendrier"
        title="Calendrier de Clôture"
        subtitle="Planning - Clôture mars + DSF 2024"
      />
      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'checklist' ? `${kpis.scoreCloture}%` : t.id === 'bloquantes' && bloquantes.length > 0 ? String(bloquantes.length) : undefined,
          badgeColor: t.id === 'bloquantes' ? 'var(--danger)' : undefined,
        }))}
        activeId="calendrier"
      />

      {/* Timeline widget */}
      <div className="widget">
        <div className="widget-header">
          <span className="widget-title"> Timeline - 1er au 15 avril 2025</span>
          <button className="btn btn-sm btn-secondary" onClick={() => router.push('/dsf/readiness')}>DSF Readiness </button>
        </div>
        <div className="widget-body" style={{ overflowX: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', minWidth: '900px' }}>
            <div style={{ width: 280, flexShrink: 0 }} />
            {Array.from({ length: dayRange }, (_, d) => {
              const day = d + 1;
              const date = new Date(2025, 3, day);
              const isWE = date.getDay() === 0 || date.getDay() === 6;
              const isToday = day === 1;
              return (
                <div key={day} style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  padding: '4px 0',
                  color: isToday ? 'var(--primary)' : isWE ? 'var(--text-muted)' : 'var(--text-secondary)',
                  fontWeight: isToday ? 700 : 400,
                  borderBottom: isToday ? '2px solid var(--primary)' : 'none',
                  background: isWE ? 'rgba(255,255,255,0.02)' : 'transparent',
                }}>
                  {String(day).padStart(2, '0')}
                </div>
              );
            })}
          </div>

          {/* Rows */}
          {sorted.map((t: any) => {
            const echDay = parseInt(t.echeance.split('-')[2]);
            const barStart = Math.max(1, echDay - 2);
            const barEnd = echDay;
            const color = CLOTURE_CATEGORY_COLORS[t.categorie] || '#94A3B8';
            const opacity = t.statut === 'termine' ? '0.35' : '1';
            const isBloquant = t.blocage === 'bloquant_cloture' && t.statut !== 'termine';
            const showCatHeader = t.categorie !== lastCat;
            lastCat = t.categorie;

            return (
              <div key={t.id}>
                {showCatHeader && (
                  <div style={{ display: 'flex', minWidth: '900px', alignItems: 'center', background: 'rgba(0,0,0,0.08)' }}>
                    <div style={{ width: 280, flexShrink: 0, padding: '4px 8px' }}>
                      <span className="fs-xs fw-700 text-muted" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{t.categorie}</span>
                    </div>
                    {Array.from({ length: dayRange }, (_, d) => <div key={d} style={{ flex: 1, height: 16 }} />)}
                  </div>
                )}
                <div style={{ display: 'flex', minWidth: '900px', alignItems: 'center', borderBottom: '1px solid var(--border-light)', opacity }}>
                  <div style={{ width: 280, flexShrink: 0, padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                    <span className="fs-xs" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</span>
                    {isBloquant && <span className="badge badge-critique" style={{ fontSize: '7px', padding: '0 3px' }}>BLOQ</span>}
                  </div>
                  {Array.from({ length: dayRange }, (_, d) => {
                    const day = d + 1;
                    const isFill = day >= barStart && day <= barEnd;
                    const isDL = day === barEnd;
                    let bg = '';
                    if (isFill) bg = `background:${color};opacity:0.3;`;
                    if (isDL) bg = `background:${isBloquant ? '#EF4444' : color};opacity:0.9;border-radius:2px;`;
                    if (isBloquant && isDL) bg = 'background:#EF4444;opacity:1;border-radius:2px;';
                    return <div key={d} style={{ flex: 1, height: 20, margin: '2px 1px', background: bg ? bg.split(';')[0].split(':')[1] : 'transparent', opacity: bg.includes('opacity:0.3') ? 0.3 : bg.includes('opacity:0.9') ? 0.9 : bg.includes('opacity:1') ? 1 : 1, borderRadius: isDL ? 2 : 0 }} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="widget-footer">
          <div className="chart-legend">
            {Object.entries(CLOTURE_CATEGORY_COLORS).map(([k, v]) => (
              <span key={k} className="chart-legend-item"><span className="chart-legend-dot" style={{ background: v }}></span>{k}</span>
            ))}
            <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: '#EF4444' }}></span>Bloquant</span>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="grid-2" style={{ marginTop: '16px' }}>
        <div className="widget" style={{ borderLeft: '3px solid var(--info)' }}>
          <div className="widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
            <div>
              <div className="fw-600"> DSF Readiness</div>
              <div className="fs-xs text-muted">La clôture conditionne la fiabilité de la DSF</div>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => router.push('/dsf/readiness')}>DSF </button>
          </div>
        </div>
        <div className="widget" style={{ borderLeft: '3px solid var(--danger)' }}>
          <div className="widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
            <div>
              <div className="fw-600"> Anomalies impactant la clôture</div>
              <div className="fs-xs text-muted">Voir les anomalies critiques qui bloquent des tâches</div>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => router.push('/dashboard/alertes')}>Anomalies </button>
          </div>
        </div>
      </div>
    </div>
  );
}
