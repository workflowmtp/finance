'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs } from '@/components/ui';
import { formatMontant } from '@/lib/format';
import { getPolesData, getPoles } from '@/lib/data';

const TABS = [
  { id: 'poles', label: ' Rentabilité pôles', icon: ' ', href: '/analytique' },
  { id: 'ecarts', label: ' Écarts marge', icon: ' ', href: '/analytique/ecarts' },
  { id: 'sources', label: ' Sources écarts', icon: ' ', href: '/analytique/sources' },
];

export default function EcartsPage() {
  const router = useRouter();
  const polesData = getPolesData();
  const polesRef = getPoles();

  const getLabel = (code: string) => polesRef.find(pr => pr.code === code)?.label || code;
  const getColor = (code: string) => polesRef.find(pr => pr.code === code)?.color || '#94A3B8';

  const costItems = [
    { key: 'coutMatiere', label: 'Matière', color: '#EF4444' },
    { key: 'coutMo', label: 'Main d\'oeuvre', color: '#3B82F6' },
    { key: 'coutMachine', label: 'Machine', color: '#F59E0B' },
    { key: 'fraisGeneraux', label: 'Frais généraux', color: '#8B5CF6' },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb="Analytique > Écarts de marge"
        title="Écarts de Marge par Pôle"
        subtitle="Détail de chaque pôle — Réel vs Standard"
      />
      <ModuleTabs tabs={TABS} activeId="ecarts" />

      {polesRef.map(pr => {
        const p = polesData.find(pd => pd.pole === pr.code);
        if (!p) return null;
        const ecart = p.ecart;
        const borderCol = ecart >= 0 ? 'var(--primary)' : 'var(--danger)';
        const tendIcon = ecart >= 2 ? ' En hausse' : ecart >= -2 ? ' Stable' : ' En baisse';

        return (
          <div key={pr.code} className="widget" style={{ borderLeft: `4px solid ${borderCol}`, marginBottom: '16px' }}>
            <div className="widget-header">
              <span className="widget-title">
                <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: getColor(pr.code), marginRight: 8 }} />
                {getLabel(pr.code)}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`cell-mono fw-700 ${ecart >= 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '16px' }}>
                  {ecart >= 0 ? '+' : ''}{ecart.toFixed(1)}%
                </span>
                <button className="btn btn-sm btn-secondary" onClick={() => router.push('/analytique/sources')}>Sources </button>
              </div>
            </div>
            <div className="widget-body">
              <div className="grid-2" style={{ gap: '24px' }}>
                <div>
                  <div className="synthese-kpi-row"><span className="synthese-kpi-label">CA</span><span className="synthese-kpi-value">{formatMontant(p.ca)}</span></div>
                  <div className="synthese-kpi-row"><span className="synthese-kpi-label">Coût total</span><span className="synthese-kpi-value">{formatMontant(p.coutTotal)}</span></div>
                  <div className="synthese-kpi-row"><span className="synthese-kpi-label">Résultat</span><span className={`synthese-kpi-value ${p.resultat >= 0 ? 'text-success' : 'text-danger'}`}>{formatMontant(p.resultat)}</span></div>
                  <div className="synthese-kpi-row"><span className="synthese-kpi-label">Marge réelle</span><span className="synthese-kpi-value fw-700">{p.marge.toFixed(1)}%</span></div>
                  <div className="synthese-kpi-row"><span className="synthese-kpi-label">Standard</span><span className="synthese-kpi-value text-muted">{p.margeStandard.toFixed(1)}%</span></div>
                  <div className="synthese-kpi-row"><span className="synthese-kpi-label">Tendance</span><span className="synthese-kpi-value">{tendIcon}</span></div>
                  <div className="synthese-kpi-row"><span className="synthese-kpi-label">Top client</span><span className="synthese-kpi-value"><a href="#" style={{ color: 'var(--secondary)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); router.push('/recouvrement/portefeuille'); }}>{p.topClient}</a></span></div>
                </div>
                <div>
                  <div className="form-label mb-8">Décomposition des coûts</div>
                  {costItems.map(c => {
                    const val = (p as any)[c.key] as number;
                    const pct = p.coutTotal > 0 ? (val / p.coutTotal * 100) : 0;
                    return (
                      <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span className="fs-xs" style={{ width: '90px' }}>{c.label}</span>
                        <div className="progress-bar-wrapper" style={{ flex: 1 }}>
                          <div className="progress-bar-fill" style={{ width: `${pct}%`, background: c.color }} />
                        </div>
                        <span className="cell-mono fs-xs" style={{ width: '100px', textAlign: 'right' }}>{formatMontant(val)}</span>
                        <span className="cell-mono fs-xs text-muted" style={{ width: '35px' }}>{pct.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
