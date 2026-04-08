// ============================================================
// TYPES — FinanceAdvisor V4
// ============================================================

// --- Auth ---
export type RoleCode = 'admin' | 'dg' | 'daf' | 'chef_comptable' | 'comptable_achats' | 'comptable_ventes' | 'comptable_banque' | 'controleur' | 'tresorier' | 'auditeur';

export interface SessionUser {
  id: string;
  nom: string;
  identifiant: string;
  email: string;
  role: RoleCode;
  roleLabel: string;
}

// --- Gravité & Statuts ---
export type Gravite = 'critique' | 'eleve' | 'moyen' | 'faible';
export type StatutAnomalie = 'ouvert' | 'en_cours' | 'resolu';
export type StatutDocument = 'conforme' | 'ecart' | 'critique' | 'non_comptabilise';
export type StatutCloture = 'non_demarre' | 'en_cours' | 'en_attente' | 'termine' | 'bloquant';
export type StatutDSF = 'pret' | 'a_verifier' | 'fragile' | 'bloque';
export type StatutClient = 'Actif' | 'Surveillé' | 'Contentieux' | 'Bloqué';
export type StatutFiscal = 'a_preparer' | 'en_cours' | 'pret' | 'depose' | 'en_retard';
export type PoleCode = 'OE' | 'HF' | 'OC' | 'BC';

// --- KPI Card ---
export interface KpiCardProps {
  color: 'green' | 'red' | 'orange' | 'blue' | 'cyan' | 'purple';
  icon: string;
  value: string;
  label: string;
  trend?: string;
  direction?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}

// --- Navigation ---
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  sub?: SubMenuItem[];
}

export interface SubMenuItem {
  id: string;
  label: string;
}

// --- Dashboard ---
export interface DashboardKpis {
  ca: number;
  charges: number;
  resultat: number;
  tresorerie: number;
  creancesTotales: number;
  creancesEchues: number;
  anomaliesCritiques: number;
  anomaliesTotales: number;
  scoreCloture: number;
  scoreDSF: number;
  scoreConformite: number;
}

// --- Charts ---
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface DonutSegment {
  value: number;
  color: string;
}

// --- Module Tabs ---
export interface TabItem {
  id: string;
  label: string;
  icon: string;
  badge?: number | string;
  badgeColor?: string;
  active?: boolean;
  onClick: () => void;
}

// --- Decision Banner ---
export interface DecisionBannerProps {
  type: 'critical' | 'warning';
  icon: string;
  title: string;
  text: string;
  actions: {
    label: string;
    variant: 'danger' | 'secondary';
    onClick: () => void;
  }[];
}

// --- Data Table ---
export interface DataTableColumn {
  key: string;
  label: string;
  type?: 'text' | 'mono' | 'amount' | 'date' | 'badge' | 'progress' | 'action';
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

// --- DSF Impact ---
export interface DsfImpact {
  numero: number;
  intitule: string;
}

// --- Analytique ---
export interface MargePole {
  coutTotal: number;
  resultat: number;
  marge: number;
}

// --- Prévision Trésorerie ---
export interface PrevisionSemaine {
  semaine: string;
  soldeOuverture: number;
  encaissements: number;
  decaissements: number;
  soldeFermeture: number;
  tension: number;
}
