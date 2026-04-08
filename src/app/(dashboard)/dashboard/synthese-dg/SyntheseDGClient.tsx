'use client';

import { PageHeader, ModuleTabs, Widget, ScoreGauge } from '@/components/ui';
import { Btn } from '@/components/ui';
import { formatMontant, formatCompact } from '@/lib/format';

const TABS = [
  { id: 'general', label: 'Vue générale', icon: '📊', href: '/dashboard' },
  { id: 'alertes', label: 'Alertes', icon: '🚨', href: '/dashboard/alertes' },
  { id: 'synthese', label: 'Synthèse DG', icon: '📋', href: '/dashboard/synthese-dg' },
];

export default function SyntheseDGClient({ data }: { data: any }) {
  return (
    <div>
      <PageHeader breadcrumb="Dashboard ▸ Synthèse DG" title="Synthèse Direction Générale" subtitle="Rapport mensuel — Mars 2025"
        actions={<><Btn onClick={() => alert('Export PDF simulé')}>📤 Export PDF</Btn><Btn variant="primary" href="/agent-ia">🤖 Synthèse IA</Btn></>}
      />
      <ModuleTabs tabs={TABS} activeId="synthese" />

      <Widget title="📊 Situation financière — Mars 2025">
        <div className="space-y-3">
          {[
            { label: 'Chiffre d\'affaires', value: formatMontant(data.ca) },
            { label: 'Résultat net', value: formatMontant(data.resultat) },
            { label: 'Trésorerie', value: formatMontant(data.tresorerie) },
            { label: 'Créances échues', value: formatMontant(data.creancesEchues) },
            { label: 'Anomalies critiques', value: String(data.anomaliesCritiques) },
          ].map((row, i) => (
            <div key={i} className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
              <span className="font-mono text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </Widget>

      <div className="grid grid-cols-3 gap-5 mt-5">
        <Widget title="📋 Scores de préparation">
          <div className="flex justify-around">
            <ScoreGauge score={data.scoreCloture} size={80} label="Clôture" />
            <ScoreGauge score={data.scoreDSF} size={80} label="DSF" />
          </div>
        </Widget>
        <Widget title="📊 Rentabilité pôles" className="col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left py-2 text-xs" style={{ color: 'var(--text-muted)' }}>Pôle</th>
                <th className="text-right py-2 text-xs" style={{ color: 'var(--text-muted)' }}>CA</th>
                <th className="text-right py-2 text-xs" style={{ color: 'var(--text-muted)' }}>Marge</th>
              </tr></thead>
              <tbody>
                {(data.poles || []).map((p: any) => {
                  const marge = p.ca > 0 ? ((p.ca - (p.coutMatiere + p.coutMo + p.coutMachine + p.fraisGeneraux)) / p.ca * 100) : 0;
                  return (
                    <tr key={p.pole} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td className="py-2 font-semibold">{p.pole}</td>
                      <td className="py-2 text-right font-mono text-xs">{formatCompact(p.ca)}</td>
                      <td className={`py-2 text-right font-mono text-xs font-bold ${marge >= p.margeStandard ? 'text-emerald-400' : 'text-red-400'}`}>{marge.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Widget>
      </div>
    </div>
  );
}
