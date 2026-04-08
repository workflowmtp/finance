'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/app.store';
import { getDashboardKpis, getTachesCloture, getAllAnomalies } from '@/lib/data';
import {
  ChevronLeft, Sun, Moon,
} from 'lucide-react';

const MENU = [
  { section: 'Pilotage' },
  { id: 'dashboard', label: 'Dashboard', icon: '📊', badge: null, sub: [
    { id: 'dashboard_general', label: 'Vue générale', path: '/dashboard' },
    { id: 'dashboard_alertes', label: 'Alertes critiques', path: '/dashboard/alertes' },
    { id: 'dashboard_synthese_dg', label: 'Synthèse DG', path: '/dashboard/synthese-dg' },
  ]},
  { section: 'Opérations' },
  { id: 'documents', label: 'Documents', icon: '📄', badge: 7, sub: [
    { id: 'documents_scannes', label: 'Documents scannés', path: '/documents' },
    { id: 'documents_non_compta', label: 'Non comptabilisés', path: '/documents/non-compta' },
    { id: 'documents_controles', label: 'Contrôles', path: '/documents/controles' },
  ]},
  { id: 'banque', label: 'Banque', icon: '🏦', badge: null, sub: [
    { id: 'banque_vue', label: 'Vue multi-banques', path: '/banque' },
    { id: 'banque_rapprochement', label: 'Rapprochements', path: '/banque/rapprochement' },
    { id: 'banque_orphelins', label: 'Mouvements orphelins', path: '/banque/orphelins' },
  ]},
  { id: 'tresorerie', label: 'Trésorerie', icon: '💰', badge: null, sub: [
    { id: 'tresorerie_situation', label: 'Situation instantanée', path: '/tresorerie' },
    { id: 'tresorerie_previsions', label: 'Prévisions glissantes', path: '/tresorerie/previsions' },
    { id: 'tresorerie_tensions', label: 'Tensions', path: '/tresorerie/tensions' },
    { id: 'tresorerie_scenarios', label: 'Scénarios', path: '/tresorerie/scenarios' },
  ]},
  { id: 'recouvrement', label: 'Recouvrement', icon: '📞', badge: null, sub: [
    { id: 'recouvrement_portefeuille', label: 'Portefeuille clients', path: '/recouvrement' },
    { id: 'recouvrement_echeancier', label: 'Échéancier global', path: '/recouvrement/echeancier' },
    { id: 'recouvrement_relances', label: 'Historique relances', path: '/recouvrement/relances' },
    { id: 'recouvrement_risques', label: 'Clients à risque', path: '/recouvrement/risques' },
  ]},
  { section: 'Contrôle & Conformité' },
  { id: 'audit', label: 'Audit & Contrôle', icon: '🔍', badge: 'dynamic', sub: [
    { id: 'audit_global', label: 'Audit global', path: '/audit' },
    { id: 'audit_anomalies', label: 'Anomalies', path: '/audit/anomalies' },
    { id: 'audit_profils', label: 'Profils utilisateurs', path: '/audit/profils' },
    { id: 'audit_fraude', label: 'Signaux de fraude', path: '/audit/fraude' },
  ]},
  { id: 'fiscalite', label: 'Fiscalité', icon: '⚖️', badge: null, sub: [
    { id: 'fiscalite_echeances', label: 'Échéances', path: '/fiscalite' },
    { id: 'fiscalite_provisions', label: 'Provisions', path: '/fiscalite/provisions' },
    { id: 'fiscalite_controles', label: 'Contrôles fiscaux', path: '/fiscalite/controles' },
  ]},
  { section: 'Analyse & Clôture' },
  { id: 'analytique', label: 'Analytique', icon: '📈', badge: null, sub: [
    { id: 'analytique_poles', label: 'Rentabilité par pôle', path: '/analytique' },
    { id: 'analytique_ecarts', label: 'Écarts de marge', path: '/analytique/ecarts' },
    { id: 'analytique_sources', label: 'Sources des écarts', path: '/analytique/sources' },
  ]},
  { id: 'clotures', label: 'Clôtures', icon: '📋', badge: 'dynamic', sub: [
    { id: 'clotures_checklist', label: 'Checklist mensuelle', path: '/clotures' },
    { id: 'clotures_bloquantes', label: 'Tâches bloquantes', path: '/clotures/bloquantes' },
    { id: 'clotures_calendrier', label: 'Calendrier', path: '/clotures/calendrier' },
  ]},
  { id: 'dsf', label: 'DSF', icon: '📑', badge: null, sub: [
    { id: 'dsf_tableaux', label: '24 tableaux', path: '/dsf' },
    { id: 'dsf_alertes', label: 'Alertes & fiabilité', path: '/dsf/alertes' },
    { id: 'dsf_readiness', label: 'Readiness DSF', path: '/dsf/readiness' },
  ]},
  { section: 'Intelligence' },
  { id: 'agent_ia', label: 'Agent IA', icon: '🤖', badge: null, sub: [
    { id: 'ia_chat', label: 'Chat FinanceAdvisor', path: '/agent-ia' },
    { id: 'ia_suggestions', label: 'Questions suggérées', path: '/agent-ia/suggestions' },
    { id: 'ia_syntheses', label: 'Synthèses', path: '/agent-ia/syntheses' },
  ]},
  { section: 'Administration' },
  { id: 'parametrage', label: 'Paramétrage', icon: '⚙️', badge: null, sub: [
    { id: 'param_utilisateurs', label: 'Utilisateurs & Rôles', path: '/parametrage' },
    { id: 'param_banques', label: 'Banques & Comptes', path: '/parametrage/banques' },
    { id: 'param_tiers', label: 'Tiers', path: '/parametrage/tiers' },
    { id: 'param_journaux', label: 'Journaux & Comptes', path: '/parametrage/journaux' },
    { id: 'param_regles', label: 'Règles & Seuils', path: '/parametrage/regles' },
    { id: 'param_ia', label: 'Configuration IA', path: '/parametrage/ia' },
  ]},
  { id: 'historique', label: 'Historique', icon: '📜', badge: null, sub: [
    { id: 'hist_logs', label: 'Logs système', path: '/historique' },
    { id: 'hist_connexions', label: 'Connexions', path: '/historique/connexions' },
    { id: 'hist_corrections', label: 'Corrections', path: '/historique/corrections' },
    { id: 'hist_validations', label: 'Validations', path: '/historique/validations' },
  ]},
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme } = useAppStore();
  const kpis = getDashboardKpis();
  const taches = getTachesCloture();
  const anomalies = getAllAnomalies();

  const countTachesBloquantes = taches.filter((t: any) => t.blocage === 'bloquant_cloture' && t.statut !== 'termine').length;
  const countAnomaliesCritiques = anomalies.filter((a: any) => a.gravite === 'critique' && a.statut !== 'resolu').length;

  const getBadge = (item: any) => {
    if (item.badge === 'dynamic') {
      if (item.id === 'audit') return countAnomaliesCritiques;
      if (item.id === 'clotures') return countTachesBloquantes;
      return null;
    }
    return item.badge;
  };

  return (
    <aside
      className={`app-sidebar fixed top-0 left-0 bottom-0 z-50 flex flex-col transition-all duration-300 overflow-hidden
        ${sidebarCollapsed ? 'collapsed' : ''}
      `}
      style={{ width: sidebarCollapsed ? 68 : 280, background: '#0A1018', borderRight: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">FA</div>
        {!sidebarCollapsed && (
          <div className="sidebar-brand">
            <div className="sidebar-brand-name">FinanceAdvisor</div>
            <div className="sidebar-brand-sub">MULTIPRINT S.A.</div>
          </div>
        )}
        {!sidebarCollapsed && (
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" id="sidebarNav">
        {MENU.map((item, idx) => {
          if (item.section) {
            return !sidebarCollapsed && <div key={`sec-${idx}`} className="sidebar-section-label">{item.section}</div>;
          }

          const isActive = pathname.startsWith(item.sub?.[0]?.path?.split('/').slice(0, -1).join('/') || item.sub?.[0]?.path || `/${item.id}`);
          const badgeVal = getBadge(item);
          const hasSub = item.sub && item.sub.length > 0;
          const isOpen = isActive;

          return (
            <div key={item.id}>
              <div
                className={`sidebar-item ${isActive ? 'active' : ''} ${isOpen ? 'open' : ''}`}
                onClick={() => hasSub && item.sub && router.push(item.sub[0].path)}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="sidebar-item-label">{item.label}</span>}
                {badgeVal && badgeVal > 0 && !sidebarCollapsed && (
                  <span className="sidebar-item-badge">{badgeVal}</span>
                )}
                {hasSub && !sidebarCollapsed && (
                  <span className="sidebar-item-arrow">▶</span>
                )}
              </div>

              {/* Sub items */}
              {hasSub && !sidebarCollapsed && (
                <div className={`sidebar-submenu ${isOpen ? 'open' : ''}`}>
                  {item.sub?.map((sub) => (
                    <div
                      key={sub.id}
                      className={`sidebar-subitem ${pathname === sub.path ? 'active' : ''}`}
                      onClick={() => router.push(sub.path)}
                    >
                      {sub.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user-avatar">EB</div>
        {!sidebarCollapsed && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">EYENE Blanche</div>
            <div className="sidebar-user-role">Directrice Financière</div>
          </div>
        )}
        {!sidebarCollapsed && (
          <button className="sidebar-logout-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="8" y2="12" />
            </svg>
          </button>
        )}
      </div>

      {/* Collapse button */}
      <button className="sidebar-collapse-btn" onClick={toggleSidebar}>
        <ChevronLeft size={14} className={`transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
      </button>
    </aside>
  );
}
