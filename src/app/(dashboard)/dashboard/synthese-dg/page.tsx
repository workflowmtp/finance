'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, ScoreGauge, Btn } from '@/components/ui';
import { formatMontant } from '@/lib/format';
import { getDashboardKpis, getPolesData, getAnomaliesCritiques, getTreasuryForecast, getAllAnomalies } from '@/lib/data';

const TABS = [
  { id: 'general', label: 'Vue générale', icon: ' ' },
  { id: 'alertes', label: 'Alertes', icon: ' ', href: '/dashboard/alertes' },
  { id: 'synthese', label: 'Synthèse DG', icon: ' ', href: '/dashboard/synthese-dg' },
];

const COMPARISONS = [
  { label: 'Chiffre d\'affaires', feb: 398000000 },
  { label: 'Charges totales', feb: 328000000 },
  { label: 'Résultat net', feb: 70000000 },
  { label: 'Trésorerie', feb: 505000000 },
];

export default function SyntheseDGPage() {
  const router = useRouter();
  const kpis = getDashboardKpis();
  const poles = getPolesData();
  const anomaliesCritiques = getAnomaliesCritiques();
  const forecast = getTreasuryForecast() as any[];
  const allAnomalies = getAllAnomalies();

  // Comparisons data
  const comparisons = COMPARISONS.map(c => ({
    ...c,
    mars: c.label === 'Chiffre d\'affaires' ? kpis.ca :
          c.label === 'Charges totales' ? kpis.charges :
          c.label === 'Résultat net' ? kpis.resultat : kpis.tresorerie,
  }));

  // Décisions dynamiques
  const decisions = [];
  if (kpis.anomaliesCritiques > 0) {
    decisions.push({ t: `Traiter les ${kpis.anomaliesCritiques} anomalies critiques avant la clôture.`, href: '/dashboard/alertes' });
  }
  const maxTension = Math.max(...forecast.map((f: any) => f.tension));
  if (maxTension > 30) {
    decisions.push({ t: 'Sécuriser la trésorerie S15 : relancer encaissements clients prioritaires.', href: '/tresorerie' });
  }
  decisions.push({ t: 'Valider provisions fiscales avant le 15/04/2025 (TVA + AIS).', href: '/fiscalite' });
  if (kpis.scoreCloture < 50) {
    decisions.push({ t: `Accélérer la clôture mars - avancement: ${kpis.scoreCloture}%.`, href: '/clotures' });
  }

  return (
    <div>
      <PageHeader
        breadcrumb="Dashboard > Synthèse DG"
        title="Synthèse Direction Générale"
        subtitle="Flash mensuel - Mars 2025"
        actions={
          <>
            <Btn variant="secondary" size="sm"> Export PDF</Btn>
            <Btn variant="primary" size="sm" href="/agent-ia"> Synthèse IA</Btn>
          </>
        }
      />

      <ModuleTabs tabs={TABS.map(t => ({
        ...t,
        badge: t.id === 'alertes' ? String(kpis.anomaliesCritiques) : undefined,
        badgeColor: t.id === 'alertes' ? 'var(--danger)' : undefined,
      }))} activeId="synthese" />

      {/* Section 1: Situation financière */}
      <div className="synthese-section">
        <div className="synthese-section-title">
          Situation financière
          <span style={{ marginLeft: 'auto' }}><Btn variant="secondary" size="sm" href="/analytique">Analytique {'>'}</Btn></span>
        </div>
        <div className="synthese-kpi-row">
          <span className="synthese-kpi-label">Chiffre d'affaires mars</span>
          <span className="synthese-kpi-value text-success">{formatMontant(kpis.ca)}</span>
        </div>
        <div className="synthese-kpi-row">
          <span className="synthese-kpi-label">Charges totales</span>
          <span className="synthese-kpi-value text-warning">{formatMontant(kpis.charges)}</span>
        </div>
        <div className="synthese-kpi-row">
          <span className="synthese-kpi-label">Résultat net</span>
          <span className={`synthese-kpi-value ${kpis.resultat >= 0 ? 'text-success' : 'text-danger'}`}>{formatMontant(kpis.resultat)}</span>
        </div>
        <div className="synthese-kpi-row">
          <span className="synthese-kpi-label">Trésorerie disponible</span>
          <span className="synthese-kpi-value">{formatMontant(kpis.tresorerie)}</span>
        </div>
        <div className="synthese-kpi-row">
          <span className="synthese-kpi-label">Créances échues</span>
          <span className="synthese-kpi-value text-danger">{formatMontant(kpis.creancesEchues)}</span>
        </div>
      </div>

      {/* Section 2: Comparaison M-1 */}
      <div className="synthese-section">
        <div className="synthese-section-title"> Comparaison Mars vs Février 2025</div>
        <table className="data-table" style={{ margin: '-8px -4px', width: 'calc(100% + 8px)' }}>
          <thead>
            <tr>
              <th>Indicateur</th>
              <th>Février</th>
              <th>Mars</th>
              <th>Variation</th>
              <th>Tendance</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map(c => {
              const variation = c.mars - c.feb;
              const variationPct = c.feb > 0 ? ((variation / c.feb) * 100) : 0;
              const isGood = c.label === 'Charges totales' ? variation <= 0 : variation >= 0;
              const trendIcon = isGood ? ' ' : ' ';
              const trendCls = isGood ? 'text-success' : 'text-danger';
              return (
                <tr key={c.label}>
                  <td className="fw-600">{c.label}</td>
                  <td className="cell-amount">{formatMontant(c.feb)}</td>
                  <td className="cell-amount fw-600">{formatMontant(c.mars)}</td>
                  <td className={`cell-amount ${trendCls} fw-600`}>{(variation >= 0 ? '+' : '') + formatMontant(variation)}</td>
                  <td className={`cell-mono fw-600 ${trendCls}`}>{trendIcon} {(variationPct >= 0 ? '+' : '') + variationPct.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section 3: Alertes */}
      <div className="synthese-section">
        <div className="synthese-section-title">
          Alertes prioritaires ({kpis.anomaliesCritiques})
          <span style={{ marginLeft: 'auto' }}><Btn variant="secondary" size="sm" href="/dashboard/alertes">Toutes {'>'}</Btn></span>
        </div>
        {anomaliesCritiques.slice(0, 5).map(a => (
          <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }} onClick={() => router.push('/dashboard/alertes')}>
            <div className="d-flex align-center gap-8">
              <span className="badge badge-critique">Critique</span>
              <span className="fs-sm fw-600">{a.titre}</span>
            </div>
            {a.impact > 0 && (
              <div className="fs-xs text-muted mt-4">Impact: {formatMontant(a.impact)}</div>
            )}
          </div>
        ))}
      </div>

      {/* Section 4: Trésorerie */}
      <div className="synthese-section">
        <div className="synthese-section-title">
          Trésorerie 4 semaines
          <span style={{ marginLeft: 'auto' }}><Btn variant="secondary" size="sm" href="/tresorerie">Prévisions {'>'}</Btn></span>
        </div>
        <table className="data-table" style={{ margin: '-8px -4px', width: 'calc(100% + 8px)' }}>
          <thead>
            <tr>
              <th>Semaine</th>
              <th>Enc.</th>
              <th>Déc.</th>
              <th>Solde</th>
              <th>Tension</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((f: any) => {
              const tC = f.tension > 50 ? 'text-danger' : f.tension > 20 ? 'text-warning' : 'text-success';
              return (
                <tr key={f.semaine} style={{ cursor: 'pointer' }} onClick={() => router.push('/tresorerie')}>
                  <td className="fw-600">{f.semaine}</td>
                  <td className="cell-amount positive">{formatMontant(f.encaissements)}</td>
                  <td className="cell-amount negative">{formatMontant(f.decaissements)}</td>
                  <td className="cell-amount fw-600">{formatMontant(f.solde_fermeture)}</td>
                  <td className={`cell-mono ${tC} fw-600`}>{f.tension}/100</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section 5: Pôles */}
      <div className="synthese-section">
        <div className="synthese-section-title">
          Rentabilité par pôle
          <span style={{ marginLeft: 'auto' }}><Btn variant="secondary" size="sm" href="/analytique">Écarts {'>'}</Btn></span>
        </div>
        <table className="data-table" style={{ margin: '-8px -4px', width: 'calc(100% + 8px)' }}>
          <thead>
            <tr>
              <th>Pôle</th>
              <th>CA</th>
              <th>Coûts</th>
              <th>Résultat</th>
              <th>Marge</th>
              <th>Std</th>
              <th>Écart</th>
            </tr>
          </thead>
          <tbody>
            {poles.map(p => (
              <tr key={p.pole} style={{ cursor: 'pointer' }} onClick={() => router.push('/analytique')}>
                <td className="fw-600">
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: p.color, marginRight: 6 }} />
                  {p.label}
                </td>
                <td className="cell-amount">{formatMontant(p.ca)}</td>
                <td className="cell-amount">{formatMontant(p.coutTotal)}</td>
                <td className={`cell-amount ${p.resultat >= 0 ? 'positive' : 'negative'}`}>{formatMontant(p.resultat)}</td>
                <td className="cell-mono fw-600">{p.marge.toFixed(1)}%</td>
                <td className="cell-mono text-muted">{p.margeStandard.toFixed(1)}%</td>
                <td className={`cell-mono fw-600 ${p.ecart >= 0 ? 'text-success' : 'text-danger'}`}>{(p.ecart >= 0 ? '+' : '') + p.ecart.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 6: Scores */}
      <div className="synthese-section">
        <div className="synthese-section-title"> État de préparation</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ cursor: 'pointer' }} onClick={() => router.push('/clotures')}>
            <ScoreGauge score={kpis.scoreCloture} size={110} label="Clôture Mars" />
          </div>
          <div style={{ cursor: 'pointer' }} onClick={() => router.push('/dsf')}>
            <ScoreGauge score={kpis.scoreDSF} size={110} label="DSF 2024" />
          </div>
          <div style={{ cursor: 'pointer' }} onClick={() => router.push('/fiscalite')}>
            <ScoreGauge score={kpis.scoreConformite} size={110} label="Conformité OHADA" />
          </div>
        </div>
      </div>

      {/* Section 7: Décisions */}
      <div className="synthese-section" style={{ borderLeft: '3px solid var(--primary)' }}>
        <div className="synthese-section-title"> Décisions requises</div>
        {decisions.map((d, i) => (
          <div
            key={i}
            style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}
            onClick={() => router.push(d.href)}
          >
            <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '14px' }}>{i + 1}.</span>
            <span className="fs-sm" style={{ flex: 1 }}>{d.t}</span>
            <span className="fs-xs text-primary" style={{ flexShrink: 0 }}>{'>'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
