'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, KpiCard, ModuleTabs, Widget, Btn } from '@/components/ui';
import { BarChartWidget, DonutChartWidget } from '@/components/charts';
import { formatMontant, formatCompact, formatPct } from '@/lib/format';
import { getDashboardKpis, getPolesData, getPoles } from '@/lib/data';

const TABS = [
  { id: 'poles', label: ' Rentabilité pôles', icon: ' ', href: '/analytique' },
  { id: 'ecarts', label: ' Écarts marge', icon: ' ', href: '/analytique/ecarts' },
  { id: 'sources', label: ' Sources écarts', icon: ' ', href: '/analytique/sources' },
];

export default function AnalytiquePage() {
  const router = useRouter();
  const kpis = getDashboardKpis();
  const poles = getPolesData();
  const polesRef = getPoles();

  // Calcul best/worst
  let bestPole = poles[0];
  let worstPole = poles[0];
  poles.forEach(p => {
    if (p.marge > bestPole.marge) bestPole = p;
    if (p.marge < worstPole.marge) worstPole = p;
  });

  // Get labels from polesRef
  const getLabel = (code: string) => polesRef.find(pr => pr.code === code)?.label || code;

  const margeGlobale = kpis.ca > 0 ? ((kpis.ca - kpis.charges) / kpis.ca * 100) : 0;
  const worstEcart = poles.reduce((min, p) => p.ecart < min ? p.ecart : min, 0);

  const costLines = ['coutMatiere', 'coutMo', 'coutMachine', 'fraisGeneraux'] as const;
  const costLabels: Record<string, string> = { coutMatiere: 'Coût matière', coutMo: 'Coût main d\'oeuvre', coutMachine: 'Coût machine', fraisGeneraux: 'Frais généraux imputés' };
  const costColors: Record<string, string> = { coutMatiere: '#EF4444', coutMo: '#3B82F6', coutMachine: '#F59E0B', fraisGeneraux: '#8B5CF6' };

  const totalCosts = { coutMatiere: 0, coutMo: 0, coutMachine: 0, fraisGeneraux: 0 };
  poles.forEach(p => { totalCosts.coutMatiere += p.coutMatiere; totalCosts.coutMo += p.coutMo; totalCosts.coutMachine += p.coutMachine; totalCosts.fraisGeneraux += p.fraisGeneraux; });
  const grandCout = Object.values(totalCosts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <PageHeader
        breadcrumb="Analytique ▸ Rentabilité par pôle"
        title="Rentabilité par Pôle d'Activité"
        subtitle="Analyse de performance des 4 pôles — Mars 2025"
        actions={
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push('/dashboard/synthese-dg')}>📋 Synthèse DG</button>
            <button className="btn btn-primary btn-sm" onClick={() => router.push('/agent-ia')}>🤖 Analyse IA</button>
          </>
        }
      />

      <ModuleTabs
        tabs={TABS.map(t => ({
          ...t,
          badge: t.id === 'ecarts' && worstEcart < -2 ? `${worstEcart.toFixed(1)}%` : undefined,
          badgeColor: t.id === 'ecarts' ? 'var(--danger)' : undefined,
        }))}
        activeId="poles"
      />

      {/* Decision banner */}
      {worstPole.ecart < -3 && (
        <div className="decision-banner warning">
          <span className="decision-banner-icon">📉</span>
          <div className="decision-banner-content">
            <div className="decision-banner-title text-warning">{getLabel(worstPole.pole)} : marge {worstPole.marge.toFixed(1)}% vs standard {worstPole.margeStandard}% (écart {worstPole.ecart >= 0 ? '+' : ''}{worstPole.ecart.toFixed(1)}%)</div>
            <div className="decision-banner-text">Investigation requise — Les sources d'écarts identifient {worstPole.pole} comme principal contributeur négatif.</div>
            <div className="decision-banner-actions">
              <button className="btn btn-sm btn-secondary" onClick={() => router.push('/analytique/ecarts')}>Détail écarts</button>
              <button className="btn btn-sm btn-secondary" onClick={() => router.push('/analytique/sources')}>Sources</button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard color="green" icon="💹" value={formatMontant(kpis.ca)} label="CA total" href="/dashboard/synthese-dg" />
        <KpiCard color="blue" icon="📊" value={`${margeGlobale.toFixed(1)} %`} label="Marge globale" href="/analytique/ecarts" />
        <KpiCard color="green" icon="🏆" value={getLabel(bestPole.pole)} label="Meilleur pôle" trend={`${bestPole.marge.toFixed(1)}%`} direction="up" href="/analytique/ecarts" />
        <KpiCard color="red" icon="⚠️" value={getLabel(worstPole.pole)} label="Pôle à surveiller" trend={`${worstPole.marge.toFixed(1)}%`} direction="down" href="/analytique/sources" />
      </div>

      {/* P&L Table */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Compte de résultat analytique par pôle</span>
          <button className="btn btn-sm btn-secondary" onClick={() => router.push('/analytique/ecarts')}>Écarts →</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ligne</th>
                {polesRef.map(pr => (
                  <th key={pr.code} style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: pr.color, marginRight: 6 }} />
                    {pr.label}
                  </th>
                ))}
                <th style={{ textAlign: 'right', fontWeight: 700 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: 'rgba(16,185,129,0.04)' }}>
                <td className="fw-700">Chiffre d&apos;affaires</td>
                {polesRef.map(pr => {
                  const pData = poles.find(p => p.pole === pr.code);
                  return <td key={pr.code} className="cell-amount fw-600">{formatMontant(pData?.ca || 0)}</td>;
                })}
                <td className="cell-amount fw-700">{formatMontant(kpis.ca)}</td>
              </tr>
              {costLines.map(key => (
                <tr key={key}>
                  <td className="fs-sm" style={{ paddingLeft: 20 }}>{costLabels[key]}</td>
                  {polesRef.map(pr => {
                    const pData = poles.find(p => p.pole === pr.code);
                    return <td key={pr.code} className="cell-amount text-muted">{formatMontant((pData as any)?.[key] || 0)}</td>;
                  })}
                  <td className="cell-amount">{formatMontant(totalCosts[key])}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid var(--border)' }}>
                <td className="fw-600">Coût total</td>
                {polesRef.map(pr => {
                  const pData = poles.find(p => p.pole === pr.code);
                  return <td key={pr.code} className="cell-amount">{formatMontant(pData?.coutTotal || 0)}</td>;
                })}
                <td className="cell-amount fw-600">{formatMontant(grandCout)}</td>
              </tr>
              <tr style={{ background: 'rgba(59,130,246,0.04)', borderTop: '3px solid var(--primary)' }}>
                <td className="fw-700" style={{ fontSize: 14 }}>Résultat pôle</td>
                {polesRef.map(pr => {
                  const pData = poles.find(p => p.pole === pr.code);
                  return <td key={pr.code} className={`cell-amount fw-700 ${(pData?.resultat || 0) >= 0 ? 'positive' : 'negative'}`}>{formatMontant(pData?.resultat || 0)}</td>;
                })}
                <td className={`cell-amount fw-700 ${kpis.resultat >= 0 ? 'positive' : 'negative'}`}>{formatMontant(kpis.resultat)}</td>
              </tr>
              <tr>
                <td className="fw-700">Marge %</td>
                {polesRef.map(pr => {
                  const pData = poles.find(p => p.pole === pr.code);
                  const marge = pData?.marge || 0;
                  const std = pData?.margeStandard || 0;
                  return <td key={pr.code} className={`cell-mono fw-700 ${marge >= std ? 'text-success' : 'text-danger'}`} style={{ textAlign: 'right' }}>{marge.toFixed(1)}%</td>;
                })}
                <td className="cell-mono fw-700" style={{ textAlign: 'right' }}>{margeGlobale.toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="text-muted">Marge standard</td>
                {polesRef.map(pr => {
                  const pData = poles.find(p => p.pole === pr.code);
                  return <td key={pr.code} className="cell-mono text-muted" style={{ textAlign: 'right' }}>{(pData?.margeStandard || 0).toFixed(1)}%</td>;
                })}
                <td></td>
              </tr>
              <tr>
                <td className="fw-600">Écart vs standard</td>
                {polesRef.map(pr => {
                  const pData = poles.find(p => p.pole === pr.code);
                  const ecart = pData?.ecart || 0;
                  return <td key={pr.code} className={`cell-mono fw-700 ${ecart >= 0 ? 'text-success' : 'text-danger'}`} style={{ textAlign: 'right' }}>{ecart >= 0 ? '+' : ''}{ecart.toFixed(1)}%</td>;
                })}
                <td></td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--border)' }}>
                <td className="fs-sm text-muted">Top client</td>
                {polesRef.map(pr => {
                  const pData = poles.find(p => p.pole === pr.code);
                  return <td key={pr.code} className="fs-xs" style={{ textAlign: 'right' }}>
                    <a href="#" style={{ color: 'var(--secondary)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); router.push('/recouvrement/portefeuille'); }}>{pData?.topClient || '-'}</a> ({formatCompact(pData?.caTopClient || 0)})
                  </td>;
                })}
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2">
        <div className="widget">
          <div className="widget-header"><span className="widget-title">📊 CA par pôle</span></div>
          <div className="widget-body"><div className="chart-wrapper">
            <BarChartWidget data={polesRef.map(pr => {
              const pData = poles.find(p => p.pole === pr.code);
              return { name: pr.code, value: pData?.ca || 0, color: pr.color };
            })} height={220} />
          </div></div>
        </div>
        <div className="widget">
          <div className="widget-header"><span className="widget-title">🧩 Structure coûts globale</span></div>
          <div className="widget-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 140, height: 140 }}>
              <DonutChartWidget
                data={Object.entries(totalCosts).map(([k, v]) => ({ name: costLabels[k], value: v, color: costColors[k] }))}
                size={140}
                centerLabel={formatCompact(grandCout)}
              />
            </div>
            <div className="chart-legend" style={{ marginTop: '12px' }}>
              <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: '#EF4444' }}></span>Matière ({formatCompact(totalCosts.coutMatiere)})</span>
              <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: '#3B82F6' }}></span>MO ({formatCompact(totalCosts.coutMo)})</span>
              <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: '#F59E0B' }}></span>Machine ({formatCompact(totalCosts.coutMachine)})</span>
              <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: '#8B5CF6' }}></span>FG ({formatCompact(totalCosts.fraisGeneraux)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="grid-2" style={{ marginTop: '16px' }}>
        <div className="widget" style={{ borderLeft: '3px solid var(--info)' }}>
          <div className="widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
            <div>
              <div className="fw-600">📑 DSF — T15 Production de l'exercice</div>
              <div className="fs-xs text-muted">Les données analytiques alimentent le tableau de production</div>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => router.push('/dsf/alertes')}>DSF →</button>
          </div>
        </div>
        <div className="widget" style={{ borderLeft: '3px solid var(--secondary)' }}>
          <div className="widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
            <div>
              <div className="fw-600">📞 Recouvrement — Top clients par pôle</div>
              <div className="fs-xs text-muted">Voir l'état des créances des clients majeurs</div>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => router.push('/recouvrement/portefeuille')}>Clients →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
