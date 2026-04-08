'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs, Widget } from '@/components/ui';
import { getDashboardKpis, getUserRiskProfiles } from '@/lib/data';
import { formatMontant } from '@/lib/format';

const TABS = [
  { id: 'utilisateurs', label: 'Utilisateurs', icon: 'Utilisateurs', href: '/parametrage' },
  { id: 'banques', label: 'Banques', icon: 'Banques', href: '/parametrage/banques' },
  { id: 'tiers', label: 'Tiers', icon: 'Tiers', href: '/parametrage/tiers' },
  { id: 'journaux', label: 'Journaux', icon: 'Journaux', href: '/parametrage/journaux' },
  { id: 'regles', label: 'Règles', icon: 'Règles', href: '/parametrage/regles' },
  { id: 'ia', label: 'Config IA', icon: 'IA', href: '/parametrage/ia' },
];

const MODES = [
  { mode: 'Synthèse DG', dest: 'Directeur Général', style: '5-7 lignes, chiffres clés, décisions' },
  { mode: 'Synthèse DAF', dest: 'Directeur Financier', style: 'Détaillé, actions prioritaires' },
  { mode: 'Pédagogique', dest: 'Comptable', style: 'Explications, références OHADA' },
  { mode: 'Audit détaillé', dest: 'Auditeur', style: 'Exhaustif, preuves, recommandations' },
  { mode: "Plan d'action", dest: 'Tous', style: 'Liste numérotée, responsable, échéance' },
];

export default function IAPage() {
  const router = useRouter();
  const kpis = getDashboardKpis();
  const riskProfiles = getUserRiskProfiles();
  
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookUser, setWebhookUser] = useState('');
  const [webhookPassword, setWebhookPassword] = useState('');
  
  const hasConfig = webhookUrl.length > 0 && webhookUser.length > 0 && webhookPassword.length > 0;

  const handleSave = async () => {
    // TODO: Implement save to backend/database
    alert('Configuration sauvegardée (à implémenter côté serveur)');
  };

  const handleTest = async () => {
    try {
      const credentials = Buffer.from(`${webhookUser}:${webhookPassword}`).toString('base64');
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
        },
        body: JSON.stringify({ test: true, message: 'Test connexion depuis FinanceAdvisor' }),
      });
      
      if (response.ok) {
        alert('Connexion au webhook n8n réussie !');
      } else {
        alert(`Erreur: ${response.status} - ${await response.text()}`);
      }
    } catch (error: any) {
      alert(`Erreur de connexion: ${error.message}`);
    }
  };

  return (
    <div>
      <PageHeader 
        breadcrumb="Paramétrage  Configuration IA" 
        title="Configuration Agent IA" 
      />
      <ModuleTabs tabs={TABS} activeId="ia" />

      {/* Status banner */}
      <div 
        style={{ 
          padding: '12px 16px', 
          background: hasConfig ? 'var(--primary-bg)' : 'var(--warning-bg)', 
          border: `1px solid ${hasConfig ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}`, 
          borderRadius: 'var(--radius-lg)', 
          marginBottom: 20, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12 
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: hasConfig ? '#10B981' : '#F59E0B' }} />
        <div>
          <div className={`fw-600 ${hasConfig ? 'text-success' : 'text-warning'}`}>
            {hasConfig ? 'Webhook n8n configuré' : 'Webhook n8n non configuré'}
          </div>
          <div className="fs-xs text-muted">
            {hasConfig 
              ? `URL : ${webhookUrl}` 
              : "Configurez le webhook n8n pour activer l'agent IA."
            }
          </div>
        </div>
      </div>

      {/* Paramètres n8n */}
      <Widget title=" Configuration Webhook n8n">
        <div className="grid-2" style={{ gap: 20 }}>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">URL du Webhook n8n</label>
            <input 
              type="url" 
              className="form-input" 
              id="webhookUrl"
              value={webhookUrl} 
              onChange={e => setWebhookUrl(e.target.value)} 
              placeholder="https://n8n.example.com/webhook/xxxxxxxx"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Utilisateur (Basic Auth)</label>
            <input 
              type="text" 
              className="form-input" 
              id="webhookUser"
              value={webhookUser} 
              onChange={e => setWebhookUser(e.target.value)} 
              placeholder="nom_utilisateur"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe (Basic Auth)</label>
            <input 
              type="password" 
              className="form-input" 
              id="webhookPassword"
              value={webhookPassword} 
              onChange={e => setWebhookPassword(e.target.value)} 
              placeholder="mot_de_passe"
            />
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={handleSave}> Sauvegarder</button>
          <button className="btn btn-secondary" onClick={handleTest}> Tester la connexion</button>
          <button className="btn btn-secondary" onClick={() => router.push('/agent-ia')}> Ouvrir le chat</button>
        </div>
      </Widget>

      {/* Modes de réponse */}
      <Widget title=" Modes de réponse" style={{ marginTop: 20 }}>
        <table className="data-table">
          <thead>
            <tr><th>Mode</th><th>Destinataire</th><th>Style</th></tr>
          </thead>
          <tbody>
            {MODES.map(m => (
              <tr key={m.mode}>
                <td className="fw-600">{m.mode}</td>
                <td className="fs-sm">{m.dest}</td>
                <td className="fs-sm text-muted">{m.style}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Widget>

      {/* Données injectées */}
      <Widget title=" Données injectées dans le contexte IA" style={{ marginTop: 20 }}>
        <div 
          className="fs-xs" 
          style={{ 
            maxHeight: 200, 
            overflowY: 'auto', 
            fontFamily: 'var(--font-mono)', 
            lineHeight: 1.8, 
            color: 'var(--text-secondary)' 
          }}
        >
          CA : {formatMontant(kpis.ca)}  Résultat : {formatMontant(kpis.resultat)}<br/>
          Trésorerie : {formatMontant(kpis.tresorerie)}  Créances échues : {formatMontant(kpis.creancesEchues)}<br/>
          Anomalies critiques : {kpis.anomaliesCritiques}  Clôture : {kpis.scoreCloture}%  DSF : {kpis.scoreDSF}%  OHADA : {kpis.scoreConformite}%<br/>
          Clients risque top 3 : {riskProfiles.slice(0, 3).map(r => `${r.nom} (${r.score})`).join(' ')}
        </div>
      </Widget>
    </div>
  );
}
