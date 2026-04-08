'use client';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, Widget } from '@/components/ui';
import { formatMontant, formatCompact } from '@/lib/format';
import { getDashboardKpis } from '@/lib/data';
const TABS = [
  { id: 'chat', label: 'Chat', icon: '💬', href: '/agent-ia' },
  { id: 'suggestions', label: 'Suggestions', icon: '💡', href: '/agent-ia/suggestions' },
  { id: 'syntheses', label: 'Synthèses', icon: '📊', href: '/agent-ia/syntheses' },
];
export default function SynthesesPage() {
  const router = useRouter();
  const kpis = getDashboardKpis();
  const syntheses = [
    { titre: 'Flash Trésorerie DG', icon: '💰', mode: 'Synthèse DG', contenu: `Position : ${formatCompact(kpis.tresorerie)}. Tension S15. Créances mobilisables : ${formatCompact(kpis.creancesEchues)}.`, href: '/tresorerie' },
    { titre: 'Point Anomalies', icon: '🔍', mode: 'Synthèse DAF', contenu: `${kpis.anomaliesCritiques} anomalies critiques ouvertes. Priorité : SAPPI, compte 470000, séquence VE.`, href: '/dashboard/alertes' },
    { titre: 'Readiness DSF', icon: '📑', mode: 'Plan d\'action', contenu: `Score DSF : ${kpis.scoreDSF}%. P1 : rapprochements, provisions, factures.`, href: '/dsf/readiness' },
    { titre: 'Plan Relance Clients', icon: '📞', mode: 'Plan d\'action', contenu: `Créances échues : ${formatCompact(kpis.creancesEchues)}. Top relances : SODECOTON, SCTM, CICAM.`, href: '/recouvrement/risques' },
    { titre: 'Conformité OHADA', icon: '⚖️', mode: 'Audit', contenu: `Score : ${kpis.scoreConformite}%. 4 alertes, 1 non-conformité. Compte 691500 invalide.`, href: '/fiscalite/controles' },
  ];
  return (
    <div>
      <PageHeader breadcrumb="Agent IA ▸ Synthèses" title="Synthèses Générées" subtitle="Rapports automatiques" />
      <ModuleTabs tabs={TABS} activeId="syntheses" />
      {syntheses.map((s, i) => (
        <Widget key={i} className="mb-4">
          <div className="widget-header">
            <span className="widget-title">{s.icon} {s.titre}</span>
            <span className="badge badge-en-cours">{s.mode}</span>
          </div>
          <div className="text-sm p-4" style={ lineHeight: 1.8 }>{s.contenu}</div>
          <div className="flex justify-between items-center p-3" style={ borderTop: '1px solid var(--border-light)' }>
            <span className="text-xs text-muted">Généré automatiquement</span>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-secondary" onClick={() => router.push(s.href)}>Module →</button>
              <button className="btn btn-sm btn-primary" onClick={() => router.push('/agent-ia')}>🤖 Approfondir</button>
            </div>
          </div>
        </Widget>
      ))}
      <Widget><div className="text-center p-8">
        <div className="text-4xl mb-3">🤖</div>
        <div className="fw-600 mb-2">Générer une synthèse personnalisée</div>
        <div className="text-sm text-muted mb-4">Demandez un rapport sur mesure au chat IA.</div>
        <button className="btn btn-primary" onClick={() => router.push('/agent-ia')}>Ouvrir le chat</button>
      </div></Widget>
    </div>
  );
}
