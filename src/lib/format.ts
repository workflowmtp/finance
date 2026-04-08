// ============================================================
// FORMAT UTILITIES — FinanceAdvisor V4
// Monnaie FCFA, dates FR, pourcentages
// ============================================================

/**
 * Format montant en FCFA avec séparateurs de milliers
 * Ex: 1200000000 → "1 200 000 000 FCFA"
 */
export function formatMontant(montant: number): string {
  if (montant === null || montant === undefined) return '—';
  const abs = Math.abs(Math.round(montant));
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (montant < 0 ? '-' : '') + formatted + ' FCFA';
}

/**
 * Format compact (Md, M, K)
 * Ex: 1200000000 → "1,2 Md", 45000000 → "45M", 1500 → "1,5K"
 */
export function formatCompact(montant: number): string {
  if (montant === null || montant === undefined) return '—';
  const abs = Math.abs(montant);
  const sign = montant < 0 ? '-' : '';
  if (abs >= 1000000000) return sign + (abs / 1000000000).toFixed(1).replace('.', ',') + ' Md';
  if (abs >= 1000000) return sign + Math.round(abs / 1000000) + 'M';
  if (abs >= 1000) return sign + (abs / 1000).toFixed(1).replace('.', ',') + 'K';
  return sign + abs.toString();
}

/**
 * Format date FR
 * Ex: "2025-03-28" → "28/03/2025"
 */
export function formatDate(date: string | Date): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format pourcentage
 * Ex: 87.9 → "87,9 %"
 */
export function formatPct(value: number): string {
  if (value === null || value === undefined) return '—';
  return value.toFixed(1).replace('.', ',') + ' %';
}

/**
 * Couleur par gravité
 */
export function getGraviteColor(gravite: string): string {
  switch (gravite) {
    case 'critique': return '#EF4444';
    case 'eleve': return '#F59E0B';
    case 'moyen': return '#D97706';
    case 'faible': return '#64748B';
    default: return '#94A3B8';
  }
}

/**
 * Couleur par score de risque
 */
export function getRiskColor(score: number): string {
  if (score >= 60) return '#EF4444';
  if (score >= 30) return '#F59E0B';
  return '#10B981';
}

/**
 * Couleur par taux de rapprochement
 */
export function getRapColor(taux: number): string {
  if (taux >= 95) return '#10B981';
  if (taux >= 85) return '#F59E0B';
  return '#EF4444';
}

/**
 * Couleur par montant impact
 */
export function getImpactClass(montant: number): string {
  if (montant >= 10000000) return 'text-red-500 font-bold';
  if (montant >= 3000000) return 'text-amber-500';
  return 'text-slate-400';
}

/**
 * Row class par gravité
 */
export function getRowClass(gravite: string): string {
  switch (gravite) {
    case 'critique': return 'border-l-[3px] border-l-red-500 bg-red-500/[0.03]';
    case 'eleve': return 'border-l-[3px] border-l-amber-500';
    case 'moyen': return 'border-l-[3px] border-l-amber-700';
    case 'faible': return 'border-l-[3px] border-l-slate-500';
    default: return '';
  }
}

/**
 * Initiales d'un nom
 * Ex: "EYENE Blanche" → "EB"
 */
export function getInitials(nom: string): string {
  return nom.split(' ').map(n => n[0]).join('').toUpperCase();
}

/**
 * Labels de type document
 */
export const DOC_TYPE_LABELS: Record<string, string> = {
  FAC_FRN: 'Facture fournisseur',
  FAC_CLI: 'Facture client',
  AV_DEB: 'Avoir débit',
  AV_CRE: 'Avoir crédit',
  BQ_REL: 'Relevé bancaire',
  BQ_AV_DEB: 'Avis de débit',
  BQ_AV_CRE: 'Avis de crédit',
  PC: 'Pièce de caisse',
  OD: "Pièce d'OD",
  PRV_REG: 'Preuve de règlement',
};

/**
 * Map tableau DSF → module source
 */
export function getDsfTableauLink(numero: number): { module: string; sub: string; label: string } | null {
  const map: Record<number, { module: string; sub: string; label: string }> = {
    1: { module: 'audit', sub: 'audit_global', label: 'Audit' },
    2: { module: 'audit', sub: 'audit_global', label: 'Audit' },
    3: { module: 'documents', sub: 'documents_non_compta', label: 'Documents' },
    4: { module: 'recouvrement', sub: 'recouvrement_portefeuille', label: 'Clients' },
    5: { module: 'banque', sub: 'banque_rapprochement', label: 'Banque' },
    9: { module: 'fiscalite', sub: 'fiscalite_provisions', label: 'Provisions' },
    10: { module: 'recouvrement', sub: 'recouvrement_echeancier', label: 'Créances' },
    11: { module: 'recouvrement', sub: 'recouvrement_echeancier', label: 'Dettes' },
    15: { module: 'analytique', sub: 'analytique_poles', label: 'Analytique' },
    16: { module: 'documents', sub: 'documents_non_compta', label: 'Documents' },
    19: { module: 'fiscalite', sub: 'fiscalite_echeances', label: 'Fiscalité' },
    21: { module: 'banque', sub: 'banque_orphelins', label: 'Banque' },
    24: { module: 'fiscalite', sub: 'fiscalite_controles', label: 'Contrôles' },
  };
  return map[numero] || null;
}

/**
 * Map catégorie anomalie → tableaux DSF impactés
 */
export function getDsfImpactForCategory(categorie: string): number[] {
  const map: Record<string, number[]> = {
    DOC: [3, 16],
    IMP: [3, 16],
    FISC: [19, 24],
    CONF: [1, 2],
    PROV: [9],
    BQ: [5],
    FACT: [4],
    LETT: [10, 11],
    ANAL: [15],
  };
  return map[categorie] || [];
}

/**
 * Determine which DSF tableaux are impacted by an anomaly
 */
export function getDsfImpactForAnomaly(anomaly: { categorie: string }): number[] {
  const impacts: number[] = [];
  const cat = anomaly.categorie;
  // Map anomaly categories to impacted DSF tableaux
  if (cat === 'DOC' || cat === 'IMP') { impacts.push(3); impacts.push(16); } // charges + achats
  if (cat === 'FISC') { impacts.push(19); impacts.push(24); } // impôts + résultat fiscal
  if (cat === 'CONF') { impacts.push(1); impacts.push(2); } // bilan actif + passif
  if (cat === 'PROV') { impacts.push(9); } // provisions
  if (cat === 'BQ') { impacts.push(5); } // flux trésorerie
  if (cat === 'FACT') { impacts.push(4); } // produits
  if (cat === 'LETT') { impacts.push(10); impacts.push(11); } // créances + dettes
  if (cat === 'ANAL') { impacts.push(15); } // production
  return impacts;
}

/**
 * Map catégorie clôture → module source
 */
export const CLOTURE_CATEGORY_LINKS: Record<string, { module: string; sub: string }> = {
  Achats: { module: 'documents', sub: 'documents_non_compta' },
  Ventes: { module: 'recouvrement', sub: 'recouvrement_portefeuille' },
  Banque: { module: 'banque', sub: 'banque_rapprochement' },
  Fiscal: { module: 'fiscalite', sub: 'fiscalite_provisions' },
  Analytique: { module: 'analytique', sub: 'analytique_poles' },
  Contrôle: { module: 'audit', sub: 'audit_global' },
};

/**
 * Couleurs par catégorie de clôture
 */
export const CLOTURE_CATEGORY_COLORS: Record<string, string> = {
  Achats: '#3B82F6',
  Ventes: '#10B981',
  Banque: '#06B6D4',
  Fiscal: '#EF4444',
  Paie: '#8B5CF6',
  Stocks: '#F59E0B',
  Analytique: '#EC4899',
  Contrôle: '#F97316',
};
