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
  const [loading, setLoading] = useState(false);
  const [isN8nConnected, setIsN8nConnected] = useState(false);

  const getTimeStr = () => {
    const now = new Date();
    return now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const [messages, setMessages] = useState([
    { role: 'assistant', content: `**Bonjour ! Je suis FinanceAdvisor** 🤖\n\nVotre assistant financier intelligent pour MULTIPRINT S.A.\n\n**Situation flash — Mars 2025 :**\n• CA : ${formatCompact(kpis.ca)} • Trésorerie : ${formatCompact(kpis.tresorerie)}\n• Anomalies critiques : ${kpis.anomaliesCritiques} • Clôture : ${kpis.scoreCloture}% • DSF : ${kpis.scoreDSF}%\n\nPosez votre question ci-dessous.`, time: getTimeStr() }
  ]);

  const formatChatContent = (text: string) => {
    let html = text;
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Newlines
    html = html.replace(/\n/g, '<br/>');
    // Bullet points avec couleur
    html = html.replace(/• /g, '<span style="color:var(--primary);margin-right:4px;">•</span> ');
    return html;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    
    const timeStr = getTimeStr();
    const userMessage = { role: 'user' as const, content: text, time: timeStr };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await res.json();
      
      if (res.ok && data.text) {
        // Mettre à jour le statut de connexion n8n
        if (data.mode === 'local') {
          setIsN8nConnected(false);
        } else {
          setIsN8nConnected(true);
        }
        // Toujours afficher la réponse (y compris les erreurs n8n)
        setMessages(prev => [...prev, { role: 'assistant', content: data.text, time: getTimeStr() }]);
      } else {
        // Erreur côté serveur Next.js
        setIsN8nConnected(false);
        setMessages(prev => [...prev, { role: 'assistant', content: `**Erreur serveur** ⚠️\n\n${data.error || 'Impossible de contacter l\'API.'}\n\nVérifiez la configuration et réessayez.`, time: getTimeStr() }]);
      }
    } catch (error) {
      // Erreur réseau
      setIsN8nConnected(false);
      setMessages(prev => [...prev, { role: 'assistant', content: `**Erreur réseau** ⚠️\n\nImpossible de joindre le serveur.\n\nVérifiez votre connexion et réessayez.`, time: getTimeStr() }]);
    } finally {
      setLoading(false);
    }
  };

  const generateLocalResponse = (question: string): string => {
    const q = question.toLowerCase();
    
    if (q.includes('anomal') || q.includes('critique')) {
      return `**Anomalies critiques** 🔍\n\nIl y a actuellement **${kpis.anomaliesCritiques} anomalies critiques** ouvertes.\n\nPriorités :\n• SAPPI : 18 jours de retard\n• Compte 470000 : 45 jours non lettré\n• Rupture séquence VE\n\nImpact estimé : 125M FCFA. Je recommande de traiter SAPPI en priorité.`;
    }
    if (q.includes('trésor') || q.includes('treso') || q.includes('flash')) {
      return `**Flash Trésorerie** 💰\n\nPosition actuelle : **${formatCompact(kpis.tresorerie)}** FCFA\n\nTension S15 (07-13 avril) :\n• Décaissements impôts + salaires\n• Créances mobilisables : ${formatCompact(kpis.creancesEchues)}\n\nRecommandation : Relancer SABC et CICAM en priorité.`;
    }
    if (q.includes('client') || q.includes('relance') || q.includes('recouvrement')) {
      return `**Recouvrement Clients** 📞\n\nCréances échues : **${formatCompact(kpis.creancesEchues)}** FCFA\n\nTop 3 relances :\n1. SODECOTON : 56M (contentieux)\n2. SCTM : 42M (bloqué)\n3. CICAM : mise en demeure à envoyer\n\nAction : Contacter SODECOTON aujourd'hui.`;
    }
    if (q.includes('clôture') || q.includes('cloture') || q.includes('dsf')) {
      return `**État Clôture & DSF** 📋\n\nScore clôture : **${kpis.scoreCloture}%**\nScore DSF : **${kpis.scoreDSF}%**\n\nTâches prioritaires :\n• Rapprochements bancaires (T5)\n• Provisions (T9)\n• Factures en attente (T3/T16)\n\nEstimation : ${Math.round((100 - kpis.scoreDSF) / 8)} jours-homme restants.`;
    }
    if (q.includes('marge') || q.includes('analytique') || q.includes('pôle')) {
      return `**Analytique & Marges** 📈\n\nCA total : **${formatCompact(kpis.ca)}** FCFA\n\nPerformance par pôle :\n• Offset Étiquette : Marge 18%\n• Héliogravure : Marge 15% (en baisse)\n• Offset Carton : Marge 22%\n• Bouchon Couronne : Marge 12%\n\nRecommandation : Analyser la baisse Héliogravure.`;
    }
    if (q.includes('fiscal') || q.includes('taxe') || q.includes('conformité')) {
      return `**Fiscalité & Conformité** ⚖️\n\nScore conformité OHADA : **${kpis.scoreConformite}%**\n\nAlertes :\n• 4 points d'attention\n• 1 non-conformité (compte 691500)\n\nÀ provisionner :\n• TVA : 45M FCFA\n• IRPP : 120M FCFA\n\nÉchéance : Déclaration TVA le 15/04.`;
    }
    
    return `**Analyse de votre question** 🤖\n\nD'après les données actuelles de MULTIPRINT S.A. :\n\n• CA : ${formatCompact(kpis.ca)}\n• Trésorerie : ${formatCompact(kpis.tresorerie)}\n• Anomalies : ${kpis.anomaliesCritiques} critiques\n• Clôture : ${kpis.scoreCloture}%\n• DSF : ${kpis.scoreDSF}%\n\nPour une analyse détaillée, consultez le module correspondant ou précisez votre question.`;
  };

  return (
    <div>
      <PageHeader breadcrumb="Agent IA ▸ Chat" title="🤖 Agent IA FinanceAdvisor"
        actions={<div className="flex items-center gap-2">
          <button className="btn btn-sm btn-secondary" onClick={() => { setMessages([{ role: 'assistant', content: `**Bonjour ! Je suis FinanceAdvisor** 🤖\n\nVotre assistant financier intelligent pour MULTIPRINT S.A.\n\n**Situation flash — Mars 2025 :**\n• CA : ${formatCompact(kpis.ca)} • Trésorerie : ${formatCompact(kpis.tresorerie)}\n• Anomalies critiques : ${kpis.anomaliesCritiques} • Clôture : ${kpis.scoreCloture}% • DSF : ${kpis.scoreDSF}%\n\nPosez votre question ci-dessous.`, time: getTimeStr() }]); setIsN8nConnected(false); }}>🗑️ Effacer</button>
        </div>} />
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
        {/* API Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ marginLeft: 'auto', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          {isN8nConnected ? (
            <>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
              <span className="text-success">API Anthropic</span>
            </>
          ) : (
            <>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
              <span className="text-warning">Mode local</span>
            </>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="chat-container">
        <div className="chat-messages" style={{ minHeight: 300 }}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              <div dangerouslySetInnerHTML={{ __html: formatChatContent(m.content) }} />
              <div className="chat-msg-time">{m.time}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-msg assistant">
              <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)', animation: 'pulse-dot 1s infinite' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)', animation: 'pulse-dot 1s infinite 0.2s' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)', animation: 'pulse-dot 1s infinite 0.4s' }} />
              </div>
            </div>
          )}
        </div>
        {messages.length < 4 && (
          <div className="chat-suggestions">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} className="chat-suggestion-chip" onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>
        )}
        <div className="chat-input-area">
          <textarea className="chat-input" placeholder="Posez votre question à FinanceAdvisor..."
            rows={1} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }} />
          <button className="chat-send-btn" onClick={() => sendMessage(input)} disabled={loading}>{loading ? '⏳' : '➤'}</button>
        </div>
      </div>
    </div>
  );
}
