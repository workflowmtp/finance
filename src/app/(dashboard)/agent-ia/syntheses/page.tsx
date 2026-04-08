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
    { titre: 'Flash Trésorerie DG', icon: '💰', date: '28/03/2025', mode: 'Synthèse DG', contenu: `Position bancaire : ${formatMontant(kpis.tresorerie)}. Tension S15 (07-13 avril) : décaissements impôts + salaires. Créances échues mobilisables : ${formatMontant(kpis.creancesEchues)}. Relancer SABC et CICAM en priorité.`, href: '/tresorerie', question: 'Détaille le flash trésorerie avec recommandations' },
    { titre: 'Point Anomalies Critiques', icon: '🔍', date: '28/03/2025', mode: 'Synthèse DAF', contenu: `${kpis.anomaliesCritiques} anomalies critiques. Impact estimé : 125M FCFA. Priorité : SAPPI (18j retard), compte 470000 (45j), rupture séquence VE.`, href: '/dashboard/alertes', question: 'Détaille les anomalies critiques et le plan de traitement' },
    { titre: 'Readiness DSF', icon: '📑', date: '28/03/2025', mode: 'Plan d\'action', contenu: `Score DSF : ${kpis.scoreDSF}%. 5 tableaux à risque. ~${Math.round((100 - kpis.scoreDSF) / 8)} jours-homme restants. P1 : rapprochements (T5), provisions (T9), factures (T3/T16).`, href: '/dsf/readiness', question: 'Combien de jours pour finaliser la DSF et quel est le chemin critique ?' },
    { titre: 'Plan de Relance Clients', icon: '📞', date: '28/03/2025', mode: 'Plan d\'action', contenu: `Créances échues : ${formatMontant(kpis.creancesEchues)}. 2 client(s) en contentieux. Top 3 relances : SODECOTON (56M contentieux), SCTM (42M bloqué), CICAM (mise en demeure).`, href: '/recouvrement/risques', question: 'Génère un plan de relance détaillé pour la semaine' },
    { titre: 'Conformité OHADA', icon: '⚖️', date: '28/03/2025', mode: 'Audit détaillé', contenu: `Score : ${kpis.scoreConformite}%. 4 alertes, 1 non-conformité. Compte 691500 invalide (charge inactive). Corrections requises avant DSF.`, href: '/fiscalite/controles', question: 'Détaille les points de non-conformité OHADA' },
  ];
  return (
    <div>
      <PageHeader breadcrumb="Agent IA ▸ Synthèses" title="Synthèses Générées" subtitle="Rapports automatiques par FinanceAdvisor" />
      <ModuleTabs tabs={TABS} activeId="syntheses" />
      {syntheses.map((s, i) => (
        <Widget key={i} className="mb-4">
          <div className="widget-header">
            <span className="widget-title">{s.icon} {s.titre}</span>
            <span className="badge badge-en-cours">{s.mode}</span>
          </div>
          <div className="text-xs text-muted px-4 pt-2">{s.date}</div>
          <div className="text-sm p-4" style={{ lineHeight: 1.8 }}>{s.contenu}</div>
          <div className="flex justify-between items-center p-3" style={{ borderTop: '1px solid var(--border-light)' }}>
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
