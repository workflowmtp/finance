'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, Widget } from '@/components/ui';
import { formatCompact } from '@/lib/format';
import { getDashboardKpis } from '@/lib/data';

const TABS = [
  { id: 'chat', label: 'Chat', icon: '💬', href: '/agent-ia' },
  { id: 'suggestions', label: 'Suggestions', icon: '💡', href: '/agent-ia/suggestions', badge: '24' },
  { id: 'syntheses', label: 'Synthèses', icon: '📊', href: '/agent-ia/syntheses' },
];

const SUGGESTIONS = [
  'Quelles sont les anomalies critiques ?',
  'Prépare un flash trésorerie DG',
  'Quel client relancer en priorité ?',
  'Où en est la clôture ?',
  'Quelle marge par pôle ce mois ?',
  'Quelles taxes restent à provisionner ?',
  'Quelles tâches bloquent la DSF ?',
  'Que corriger avant le 15 du mois ?',
];

export default function AgentIAPage() {
  const router = useRouter();
  const kpis = getDashboardKpis();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `**Bonjour ! Je suis FinanceAdvisor** 🤖\n\nVotre assistant financier intelligent pour MULTIPRINT S.A.\n\n**Situation flash — Mars 2025 :**\n• CA : ${formatCompact(kpis.ca)} • Trésorerie : ${formatCompact(kpis.tresorerie)}\n• Anomalies critiques : ${kpis.anomaliesCritiques} • Clôture : ${kpis.scoreCloture}% • DSF : ${kpis.scoreDSF}%\n\nPosez votre question ci-dessous.` }
  ]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '⏳ Réponse en cours... (connectez une clé API dans Paramétrage > Config IA pour les réponses en temps réel)' }]);
    setInput('');
  };

  return (
    <div>
      <PageHeader breadcrumb="Agent IA ▸ Chat" title="🤖 Agent IA FinanceAdvisor"
        actions={<select className="filter-select" style={{ minWidth: 160 }}>
          <option>Mode Synthèse DAF</option><option>Mode Synthèse DG</option><option>Mode Pédagogique</option>
          <option>Mode Audit détaillé</option><option>Mode Plan d&apos;action</option>
        </select>} />
      <ModuleTabs tabs={TABS} activeId="chat" />

      {/* Context pills */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {[
          { label: 'CA', value: formatCompact(kpis.ca), color: 'var(--primary)', href: '/analytique' },
          { label: 'Tréso', value: formatCompact(kpis.tresorerie), color: 'var(--secondary)', href: '/tresorerie' },
          { label: 'Anomalies', value: `${kpis.anomaliesCritiques} crit.`, color: 'var(--danger)', href: '/dashboard/alertes' },
          { label: 'Clôture', value: `${kpis.scoreCloture}%`, color: 'var(--warning)', href: '/clotures' },
          { label: 'DSF', value: `${kpis.scoreDSF}%`, color: 'var(--info)', href: '/dsf/readiness' },
        ].map(p => (
          <div key={p.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer text-xs"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            onClick={() => router.push(p.href)}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
            <span className="text-muted">{p.label}</span>
            <span className="fw-700">{p.value}</span>
          </div>
        ))}
      </div>

      {/* Chat */}
      <div className="chat-container">
        <div className="chat-messages" style={{ minHeight: 300 }}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br/>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          ))}
        </div>
        <div className="chat-suggestions">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="chat-suggestion-chip" onClick={() => sendMessage(s)}>{s}</button>
          ))}
        </div>
        <div className="chat-input-area">
          <textarea className="chat-input" placeholder="Posez votre question à FinanceAdvisor..."
            rows={1} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }} />
          <button className="chat-send-btn" onClick={() => sendMessage(input)}>➤</button>
        </div>
      </div>
    </div>
  );
}
