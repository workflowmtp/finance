'use client';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, Widget } from '@/components/ui';
const TABS = [
  { id: 'chat', label: 'Chat', icon: '💬', href: '/agent-ia' },
  { id: 'suggestions', label: 'Suggestions', icon: '💡', href: '/agent-ia/suggestions', badge: '24' },
  { id: 'syntheses', label: 'Synthèses', icon: '📊', href: '/agent-ia/syntheses' },
];
const CATEGORIES = [
  { titre: '🔍 Anomalies & Audit', questions: ['Quelles sont les anomalies critiques du mois ?', 'Quel utilisateur présente le plus de risques ?', 'Y a-t-il des signaux de fraude ?', 'Quelles anomalies bloquent la clôture ?'] },
  { titre: '💰 Trésorerie', questions: ['Prépare-moi un flash trésorerie DG', 'Quelle semaine est la plus tendue ?', 'Quels encaissements attendre cette semaine ?', 'Faut-il prévoir un financement court terme ?'] },
  { titre: '📞 Recouvrement', questions: ['Quel client relancer en priorité ?', 'Génère un plan de relance du jour', 'Quels clients sont en contentieux ?', 'Quel est l\'impact trésorerie si SABC paie cette semaine ?'] },
  { titre: '📋 Clôture & DSF', questions: ['Où en est la clôture de mars ?', 'Quelles tâches bloquent la DSF ?', 'Combien de jours de travail pour finaliser la DSF ?', 'Que corriger avant le 15 du mois ?'] },
  { titre: '📈 Analytique & Performance', questions: ['Quelle marge par pôle ce mois ?', 'Pourquoi la marge Hélio est en baisse ?', 'Quelles sont les sources d\'écarts de marge ?', 'Quel pôle performe le mieux ?'] },
  { titre: '⚖️ Fiscalité & Conformité', questions: ['Quelles taxes restent à provisionner ?', 'Quel est le score de conformité OHADA ?', 'Quelles corrections avant le dépôt TVA ?', 'Fais un mémo fiscal du mois'] },
];
export default function SuggestionsPage() {
  const router = useRouter();
  return (
    <div>
      <PageHeader breadcrumb="Agent IA ▸ Questions suggérées" title="Questions Suggérées" subtitle="24 exemples de questions organisées par domaine" />
      <ModuleTabs tabs={TABS} activeId="suggestions" />
      <div className="grid grid-cols-2 gap-5">
        {CATEGORIES.map(cat => (
          <Widget key={cat.titre} title={cat.titre}>
            {cat.questions.map((q, i) => (
              <div key={i} className="py-2 cursor-pointer" style={{ borderBottom: '1px solid var(--border-light)' }}
                onClick={() => router.push('/agent-ia')}>
                <span className="text-sm text-primary mr-1">→</span><span className="text-sm">{q}</span>
              </div>
            ))}
          </Widget>
        ))}
      </div>
    </div>
  );
}
