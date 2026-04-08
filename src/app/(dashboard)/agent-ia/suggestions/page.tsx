'use client';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, Widget } from '@/components/ui';
const TABS = [
  { id: 'chat', label: 'Chat', icon: '💬', href: '/agent-ia' },
  { id: 'suggestions', label: 'Suggestions', icon: '💡', href: '/agent-ia/suggestions', badge: '24' },
  { id: 'syntheses', label: 'Synthèses', icon: '📊', href: '/agent-ia/syntheses' },
];
const CATEGORIES = [
  { titre: '🔍 Anomalies & Audit', questions: ['Quelles anomalies critiques ?', 'Quel utilisateur à risque ?', 'Signaux de fraude ?', 'Anomalies bloquant la clôture ?'] },
  { titre: '💰 Trésorerie', questions: ['Flash trésorerie DG', 'Semaine la plus tendue ?', 'Encaissements à attendre ?', 'Besoin de financement ?'] },
  { titre: '📞 Recouvrement', questions: ['Client à relancer en priorité ?', 'Plan de relance du jour', 'Clients en contentieux ?', 'Impact si SABC paie ?'] },
  { titre: '📋 Clôture & DSF', questions: ['État de la clôture ?', 'Tâches bloquant la DSF ?', 'Jours pour finaliser ?', 'Corrections avant le 15 ?'] },
  { titre: '📈 Analytique', questions: ['Marge par pôle ?', 'Pourquoi marge Hélio baisse ?', 'Sources des écarts ?', 'Meilleur pôle ?'] },
  { titre: '⚖️ Fiscalité', questions: ['Taxes à provisionner ?', 'Score conformité ?', 'Corrections TVA ?', 'Mémo fiscal du mois'] },
];
export default function SuggestionsPage() {
  const router = useRouter();
  return (
    <div>
      <PageHeader breadcrumb="Agent IA ▸ Suggestions" title="Questions Suggérées" subtitle="24 questions organisées par domaine" />
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
