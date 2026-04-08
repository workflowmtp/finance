'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, KpiCard, ModuleTabs, Btn } from '@/components/ui';
import { formatMontant, formatPct } from '@/lib/format';
import { getAllAnomalies, getUserRiskProfiles, getDashboardKpis, getUserName, ANOMALIE_CATEGORIES } from '@/lib/data';

const TABS = [
  { id: 'global', label: ' Audit global', icon: ' ', href: '/audit' },
  { id: 'anomalies', label: ' Anomalies', icon: ' ', href: '/dashboard/alertes' },
  { id: 'profils', label: ' Profils', icon: ' ', href: '/audit/profils' },
  { id: 'fraude', label: ' Fraude', icon: ' ', href: '/audit/fraude' },
];

export default function AuditPage() {
  const router = useRouter();
  const anomalies = getAllAnomalies() as any[];
  const profiles = getUserRiskProfiles();
  const kpis = getDashboardKpis();

  const open = anomalies.filter(a => a.statut !== 'resolu');
  const resolues = anomalies.filter(a => a.statut === 'resolu');
  const critiques = open.filter(a => a.gravite === 'critique');
  const impactTotal = open.reduce((s: number, a: any) => s + (a.impact || 0), 0);
  const highRisk = profiles.filter(p => p.score >= 60);

  // Par gravité
  const byGrav: Record<string, number> = { critique: 0, eleve: 0, moyen: 0, faible: 0 };
  for (const a of open) {
    const g = a.gravite as keyof typeof byGrav;
    if (byGrav[g] !== undefined) byGrav[g]++;
  }

  // Par catégorie
  const byCat: Record<string, number> = {};
  for (const a of open) byCat[a.categorie] = (byCat[a.categorie] || 0) + 1;

  // Matrice catégorie × gravité
  const catGravMatrix: Record<string, any> = {};
  for (const a of open) {
    if (!catGravMatrix[a.categorie]) catGravMatrix[a.categorie] = { critique: 0, eleve: 0, moyen: 0, faible: 0, total: 0 };
    catGravMatrix[a.categorie][a.gravite]++;
    catGravMatrix[a.categorie].total++;
  }

  // Top 10 par impact
  const top10 = [...open].filter(a => a.impact > 0).sort((a, b) => (b.impact || 0) - (a.impact || 0)).slice(0, 10);

  return (
    <div>
      <PageHeader
        breadcrumb="Audit & Contrôle > Audit global"
        title="Audit Comptable Global"
        subtitle="Synthèse des contrôles internes - Mars 2025"
        actions={
          <>
            <Btn variant="secondary" size="sm" href="/fiscalite/controles"> Conformité OHADA</Btn>
            <Btn variant="primary" size="sm" href="/agent-ia"> Audit IA</Btn>
          </>
        }
      />

      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'anomalies' && critiques.length > 0 ? String(critiques.length) :
                 t.id === 'profils' && highRisk.length > 0 ? String(highRisk.length) : undefined,
          badgeColor: 'var(--danger)',
        }))}
        activeId="global"
      />

      {/* Decision banner */}
      {critiques.length >= 3 && (
        <div className="decision-banner critical" style={{ marginBottom: '20px' }}>
          <span className="decision-banner-icon"> </span>
          <div className="decision-banner-content">
            <div className="decision-banner-title text-danger">{critiques.length} anomalies critiques - Impact : {formatMontant(impactTotal)}</div>
            <div className="decision-banner-text">Certaines anomalies bloquent la clôture et impactent la DSF.</div>
            <div className="decision-banner-actions">
              <Btn variant="danger" size="sm" href="/dashboard/alertes">Toutes les anomalies</Btn>
              <Btn variant="secondary" size="sm" href="/clotures">Tâches bloquantes</Btn>
              <Btn variant="secondary" size="sm" href="/dsf/alertes">DSF impactées</Btn>
            </div>
          </div>
        </div>
      )}

      {/* KPIs 5 colonnes */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <KpiCard color="red" icon=" " value={String(open.length)} label="Anomalies ouvertes" href="/dashboard/alertes" />
        <KpiCard color="green" icon=" " value={String(resolues.length)} label="Résolues" />
        <KpiCard color="red" icon=" " value={formatMontant(impactTotal)} label="Impact financier" />
        <KpiCard color="orange" icon=" " value={String(profiles.length)} label="Utilisateurs concernés" href="/audit/profils" />
        <KpiCard color="green" icon=" " value={formatPct(kpis.scoreConformite || 85)} label="Score conformité" href="/fiscalite/controles" />
      </div>

      {/* Charts 3 colonnes */}
      <div className="dash-grid-1-1-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
        {/* Répartition par gravité */}
        <div className="widget">
          <div className="widget-header"><span className="widget-title">Répartition par gravité</span></div>
          <div className="widget-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '130px', height: '130px', position: 'relative' }}>
              <svg viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="65" cy="65" r="50" fill="none" stroke="var(--border)" strokeWidth="10" />
                {(() => {
                  const segs = [
                    { value: byGrav.critique, color: '#EF4444' },
                    { value: byGrav.eleve, color: '#F59E0B' },
                    { value: byGrav.moyen, color: '#D97706' },
                    { value: byGrav.faible, color: '#64748B' },
                  ];
                  let offset = 0;
                  const total = open.length || 1;
                  return segs.map(s => {
                    if (s.value === 0) return null;
                    const pct = (s.value / total) * 100;
                    const dashArray = `${(pct / 100) * 314} 314`;
                    const dashOffset = -(offset / 100) * 314;
                    offset += pct;
                    return <circle key={s.color} cx="65" cy="65" r="50" fill="none" stroke={s.color} strokeWidth="10" strokeDasharray={dashArray} strokeDashoffset={dashOffset} />;
                  });
                })()}
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div className="fw-700">{open.length}</div>
              </div>
            </div>
            <div className="chart-legend" style={{ marginTop: '14px' }}>
              <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: '#EF4444' }} />Critique ({byGrav.critique})</span>
              <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: '#F59E0B' }} />Élevé ({byGrav.eleve})</span>
              <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: '#D97706' }} />Moyen ({byGrav.moyen})</span>
              <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: '#64748B' }} />Faible ({byGrav.faible})</span>
            </div>
          </div>
        </div>

        {/* Par catégorie */}
        <div className="widget">
          <div className="widget-header"><span className="widget-title">Par catégorie</span></div>
          <div className="widget-body">
            <div className="chart-wrapper">
              <svg viewBox="0 0 380 200" style={{ width: '100%', height: '200px' }}>
                {(() => {
                  const catArr = Object.entries(byCat).map(([label, value]) => ({
                    label, value, color: ({ DOC: '#3B82F6', IMP: '#8B5CF6', FISC: '#F59E0B', CONF: '#EF4444', FRAUDE: '#EC4899', FACT: '#06B6D4', LETT: '#10B981', SEP: '#EF4444', BQ: '#3B82F6', PROV: '#F97316', CTRL: '#D97706', ANAL: '#8B5CF6' } as any)[label] || '#94A3B8'
                  })).sort((a, b) => b.value - a.value);
                  const maxVal = Math.max(...catArr.map(c => c.value), 1);
                  return catArr.map((c, i) => {
                    const barHeight = (c.value / maxVal) * 150;
                    const barX = 20 + i * 45;
                    return (
                      <g key={c.label}>
                        <rect x={barX} y={170 - barHeight} width="35" height={barHeight} fill={c.color} rx="4" />
                        <text x={barX + 17} y="190" textAnchor="middle" className="fs-xs" fill="var(--text-muted)">{c.label}</text>
                        <text x={barX + 17} y={165 - barHeight} textAnchor="middle" className="fs-xs fw-600" fill={c.color}>{c.value}</text>
                      </g>
                    );
                  });
                })()}
              </svg>
            </div>
          </div>
        </div>

        {/* Évolution mensuelle */}
        <div className="widget">
          <div className="widget-header"><span className="widget-title">Évolution mensuelle</span></div>
          <div className="widget-body">
            <div className="chart-wrapper">
              <svg viewBox="0 0 380 200" style={{ width: '100%', height: '200px' }}>
                {(() => {
                  const evoData = [12, 8, 15, 6, 9, 11, 7, 14, 10, 5, 8, 13];
                  const evoLabels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
                  const maxVal = Math.max(...evoData, 1);
                  const points = evoData.map((v, i) => `${20 + i * 30},${180 - (v / maxVal) * 150}`).join(' ');
                  return (
                    <>
                      <polyline points={points} fill="none" stroke="#EF4444" strokeWidth="2" />
                      <polygon points={`${points} 20,180 370,180`} fill="rgba(239,68,68,0.1)" />
                      {evoData.map((v, i) => (
                        <circle key={i} cx={20 + i * 30} cy={180 - (v / maxVal) * 150} r="4" fill="#EF4444" />
                      ))}
                      {evoLabels.map((l, i) => (
                        <text key={i} x={20 + i * 30} y="195" textAnchor="middle" className="fs-xs" fill="var(--text-muted)">{l}</text>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 par impact */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title"> Top 10 par impact</span>
          <Btn variant="secondary" size="sm" href="/dashboard/alertes">Toutes </Btn>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Gravité</th>
              <th>Titre</th>
              <th>Impact</th>
              <th>Utilisateur</th>
              <th>DSF</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {top10.map(a => (
              <tr key={a.id} className={`row-${a.gravite}`}>
                <td className="cell-mono fs-xs">{a.id}</td>
                <td><span className={`badge badge-${a.gravite === 'critique' ? 'critique' : a.gravite === 'eleve' ? 'eleve' : 'moyen'}`}>{a.gravite}</span></td>
                <td className="fs-sm" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.titre}</td>
                <td className={`cell-amount fw-600 ${a.impact >= 10000000 ? 'impact-high' : a.impact >= 3000000 ? 'impact-medium' : 'impact-low'}`}>{formatMontant(a.impact)}</td>
                <td className="fs-sm"><a href="#" style={{ color: 'var(--secondary)', textDecoration: 'none' }} onClick={e => { e.preventDefault(); router.push('/audit/profils'); }}>{a.utilisateurNom || getUserName(a.utilisateur)}</a></td>
                <td className="fs-xs"> -</td>
                <td><span className="badge badge-attente">{a.statut}</span></td>
                <td><Btn variant="secondary" size="sm">Détail</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Matrice + Modules liés */}
      <div className="grid-2" style={{ marginTop: '20px' }}>
        {/* Matrice Catégorie × Gravité */}
        <div className="widget">
          <div className="widget-header"><span className="widget-title"> Matrice Catégorie x Gravité</span></div>
          <div className="widget-body">
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Catégorie</th><th>Critique</th><th>Élevé</th><th>Moyen</th><th>Faible</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {Object.entries(catGravMatrix).map(([cat, m]: [string, any]) => {
                    const catLabel = (ANOMALIE_CATEGORIES as any[])?.find((c: any) => c.code === cat)?.label || cat;
                    return (
                      <tr key={cat}>
                        <td className="fw-600">{catLabel}</td>
                        <td className={`cell-mono ${m.critique > 0 ? 'text-danger fw-700' : 'text-muted'}`}>{m.critique}</td>
                        <td className={`cell-mono ${m.eleve > 0 ? 'text-warning fw-600' : 'text-muted'}`}>{m.eleve}</td>
                        <td className="cell-mono">{m.moyen}</td>
                        <td className="cell-mono text-muted">{m.faible}</td>
                        <td className="cell-mono fw-700">{m.total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modules liés */}
        <div className="widget">
          <div className="widget-header"><span className="widget-title"> Modules liés</span></div>
          <div className="widget-body" style={{ padding: '12px 20px' }}>
            {[
              { icon: ' ', label: 'DSF - Tableaux impactés', sub: 'Anomalies affectant le bilan et les états', href: '/dsf/alertes' },
              { icon: ' ', label: 'Clôture - Tâches bloquées', sub: 'Anomalies bloquant la clôture mensuelle', href: '/clotures' },
              { icon: ' ', label: 'Conformité OHADA', sub: '9 contrôles réglementaires', href: '/fiscalite/controles' },
              { icon: ' ', label: 'Documents - Contrôles', sub: '10 contrôles automatiques sur les pièces', href: '/documents' },
              { icon: ' ', label: 'Signaux de fraude', sub: '6 patterns suspects détectés', href: '/audit/fraude' },
            ].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }} onClick={() => router.push(l.href)}>
                <span style={{ fontSize: '16px' }}>{l.icon}</span>
                <div style={{ flex: 1 }}><div className="fs-sm fw-600">{l.label}</div><div className="fs-xs text-muted">{l.sub}</div></div>
                <span className="fs-xs text-primary"> </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
