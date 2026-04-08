// ============================================================
// DATA PROVIDER — FinanceAdvisor V4
// Abstracts data access: mock data now, Prisma later
// ============================================================

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  USERS, ROLES, POLES, BANQUES, COMPTES_BANCAIRES,
  CLIENTS, FOURNISSEURS, JOURNAUX, ANOMALIES,
  ECHEANCES_FISCALES, ANALYTIQUE_POLES, TACHES_CLOTURE,
  DSF_TABLEAUX, AUDIT_LOGS, DOCUMENTS, BANK_TRANSACTIONS,
  ECHEANCIER_CLIENTS, RELANCE_HISTORY, NIVEAUX_RELANCE,
  TREASURY_FORECAST, MONTHLY_DATA, TREASURY_DETAIL,
  ROLE_PERMISSIONS, PERMISSIONS_ACTIONS, ANOMALIES_MONTHLY,
  OPERATION_STATS, AI_CONFIG, ANOMALIE_CATEGORIES,
  PERMISSIONS_MODULES, ALL_PERMISSIONS, ROLE_PERMISSIONS_MAP,
  SYSTEM_ROLES, CUSTOM_ROLES,
} from './mock-data';

import {
  calcCATotale, calcChargesTotales, calcResultatNet,
  calcTresorerieTotal, calcCreancesEchues, calcCreancesTotales,
  countAnomaliesCritiques, calcScoreCloture, calcScoreDSF,
  calcScoreConformite, calcClotureByCategorie, calcMargePole,
  countTachesBloquantes,
} from './calc';

// ============================================================
// COMPUTED DATA (replaces initDynamicData from HTML)
// ============================================================

function computeUserRiskProfiles() {
  const map: Record<string, { total: number; critiques: number; elevees: number }> = {};
  for (const a of ANOMALIES as any[]) {
    if (!a.utilisateur) continue;
    if (!map[a.utilisateur]) map[a.utilisateur] = { total: 0, critiques: 0, elevees: 0 };
    map[a.utilisateur].total++;
    if (a.gravite === 'critique') map[a.utilisateur].critiques++;
    if (a.gravite === 'eleve') map[a.utilisateur].elevees++;
  }
  return Object.entries(map)
    .map(([uid, d]) => ({
      utilisateur: uid,
      nom: getUserName(uid),
      total_anomalies: d.total,
      critiques: d.critiques,
      elevees: d.elevees,
      score: Math.min(100, d.critiques * 25 + d.elevees * 12 + (d.total - d.critiques - d.elevees) * 5),
    }))
    .sort((a, b) => b.score - a.score);
}

function computeTreasuryForecast() {
  const fc = JSON.parse(JSON.stringify(TREASURY_FORECAST)) as any[];
  if (fc.length === 0) return fc;
  const tresoTotal = (COMPTES_BANCAIRES as any[]).reduce((s: number, c: any) => s + c.solde_comptable, 0);
  fc[0].solde_ouverture = tresoTotal;
  for (let i = 0; i < fc.length; i++) {
    fc[i].solde_fermeture = fc[i].solde_ouverture + fc[i].encaissements - fc[i].decaissements;
    if (i < fc.length - 1) fc[i + 1].solde_ouverture = fc[i].solde_fermeture;
    fc[i].tension = fc[i].solde_fermeture < 100000000
      ? (fc[i].solde_fermeture < 0 ? 100 : Math.round((1 - fc[i].solde_fermeture / 100000000) * 70))
      : 0;
  }
  return fc;
}

// ============================================================
// HELPERS
// ============================================================

export function getUserName(userId: string): string {
  const u = (USERS as any[]).find(u => u.id === userId);
  return u ? u.nom : userId;
}

export function getRoleLabel(code: string): string {
  const r = (ROLES as any[]).find(r => r.code === code);
  return r ? r.label : code;
}

// ============================================================
// DASHBOARD
// ============================================================

const OHADA_CONTROLES = [
  { id: 1, label: 'Bilan équilibré (Actif = Passif)', statut: 'ok' },
  { id: 2, label: 'Balance des comptes équilibrée', statut: 'ok' },
  { id: 3, label: 'Comptes 470 soldés en fin de période', statut: 'alerte' },
  { id: 4, label: 'Séquence facturation continue', statut: 'alerte' },
  { id: 5, label: 'TVA collectée ≥ TVA déclarée', statut: 'alerte' },
  { id: 6, label: 'Rapprochements bancaires complétés', statut: 'alerte' },
  { id: 7, label: 'FNP et charges rattachées passées', statut: 'ok' },
  { id: 8, label: 'Provisions clients douteux à jour', statut: 'ok' },
  { id: 9, label: 'Plan comptable OHADA respecté', statut: 'nc' },
  { id: 10, label: 'Amortissements calculés et comptabilisés', statut: 'ok' },
  { id: 11, label: 'Provisions fiscales (IS, TVA, AIS)', statut: 'ok' },
];

export function getDashboardKpis() {
  const tresoTotal = (COMPTES_BANCAIRES as any[]).reduce((s: number, c: any) => s + c.solde_comptable, 0);
  const dettesFrs = (FOURNISSEURS as any[]).reduce((s: number, f: any) => s + (f.encours || 0), 0);
  return {
    ca: calcCATotale(ANALYTIQUE_POLES as any[]),
    charges: calcChargesTotales(ANALYTIQUE_POLES as any[]),
    resultat: calcResultatNet(ANALYTIQUE_POLES as any[]),
    tresorerie: tresoTotal,
    creancesEchues: (CLIENTS as any[]).reduce((s: number, c: any) => s + (c.echeance_echue || 0), 0),
    creancesTotales: (CLIENTS as any[]).reduce((s: number, c: any) => s + (c.encours || 0), 0),
    dettesFrs,
    anomaliesCritiques: countAnomaliesCritiques(ANOMALIES as any[]),
    anomaliesTotales: (ANOMALIES as any[]).filter((a: any) => a.statut !== 'resolu').length,
    scoreCloture: calcScoreCloture(TACHES_CLOTURE as any[]),
    scoreDSF: calcScoreDSF(DSF_TABLEAUX as any[]),
    scoreConformite: calcScoreConformite(OHADA_CONTROLES),
    bloquantes: countTachesBloquantes(TACHES_CLOTURE as any[]),
    docsNonComptabilises: (DOCUMENTS as any[]).filter((d: any) => d.statut === 'non_comptabilise').length,
    tauxSaisie: OPERATION_STATS.taux_saisie,
  };
}

export function getAnomaliesCritiques() {
  return (ANOMALIES as any[])
    .filter(a => a.gravite === 'critique' && a.statut !== 'resolu')
    .map(a => ({ id: a.id, titre: a.titre, impact: a.impact || 0, categorie: a.categorie, utilisateur: getUserName(a.utilisateur), statut: a.statut }));
}

export function getAllAnomalies() {
  return (ANOMALIES as any[])
    .filter(a => a.statut !== 'resolu')
    .map(a => ({
      id: a.id,
      titre: a.titre,
      impact: a.impact || 0,
      categorie: a.categorie,
      utilisateur: getUserName(a.utilisateur),
      gravite: a.gravite,
      statut: a.statut
    }))
    .sort((a, b) => (b.impact || 0) - (a.impact || 0));
}

export function getPolesData() {
  return (ANALYTIQUE_POLES as any[]).map((p: any) => {
    const mp = calcMargePole(p);
    const pObj = (POLES as any[]).find(po => po.code === p.pole);
    return {
      pole: p.pole, label: pObj?.label || p.pole, color: pObj?.color || '#94A3B8',
      ca: p.ca, coutTotal: mp.coutTotal, resultat: mp.resultat, marge: mp.marge,
      margeStandard: p.marge_standard, ecart: mp.marge - p.marge_standard,
      topClient: p.top_client, caTopClient: p.ca_top_client,
      coutMatiere: p.cout_matiere, coutMo: p.cout_mo, coutMachine: p.cout_machine, fraisGeneraux: p.frais_generaux,
    };
  });
}

export function getClientsRisque(limit = 5) {
  return [...(CLIENTS as any[])]
    .filter(c => c.echeance_echue > 0)
    .sort((a, b) => (b.echeance_echue * b.score_risque) - (a.echeance_echue * a.score_risque))
    .slice(0, limit)
    .map(c => ({
      id: c.id,
      nom: c.raison_sociale,
      codeX3: c.code_x3,
      pole: c.pole,
      scoreRisque: c.score_risque,
      echeanceEchue: c.echeance_echue,
      encours: c.encours,
      retardMoyen: c.retard_moyen,
      niveauRelance: c.niveau_relance,
      statut: c.statut,
    }));
}

// ============================================================
// ALL MODULES — Data accessors
// ============================================================

export function getAllAnomaliesFull() { return (ANOMALIES as any[]).map(a => ({ ...a, utilisateurNom: getUserName(a.utilisateur) })); }
export function getAllDocuments() { return (DOCUMENTS as any[]).map(d => ({ ...d, utilisateurNom: d.utilisateur_compta ? getUserName(d.utilisateur_compta) : null })); }
export function getDocumentsNonCompta() { return (DOCUMENTS as any[]).filter(d => d.statut === 'non_comptabilise'); }
export function getDocumentsByType() {
  const byType: Record<string, number> = {};
  for (const d of DOCUMENTS as any[]) {
    byType[d.type] = (byType[d.type] || 0) + 1;
  }
  return byType;
}
export function getComptesWithBanques() {
  return (COMPTES_BANCAIRES as any[]).map(cb => {
    const bq = (BANQUES as any[]).find(b => b.id === cb.banque_id);
    return { ...cb, banqueNom: bq?.nom || '', banqueCode: bq?.code || '' };
  });
}
export function getBankTransactions() { return BANK_TRANSACTIONS; }
export function getTreasuryForecast() { return computeTreasuryForecast(); }
export function getTreasuryDetail() { return TREASURY_DETAIL; }
export function getAllClients() {
  return (CLIENTS as any[]).map(c => ({ ...c, raisonSociale: c.raison_sociale, codeX3: c.code_x3, scoreRisque: c.score_risque, echeanceEchue: c.echeance_echue }));
}
export function getEcheancierClients() { return ECHEANCIER_CLIENTS; }
export function getRelanceHistory() { return RELANCE_HISTORY; }
export function getNiveauxRelance() { return NIVEAUX_RELANCE; }
export function getUserRiskProfiles() { return computeUserRiskProfiles(); }
export function getAuditLogs() { return (AUDIT_LOGS as any[]).map(l => ({ ...l, utilisateurNom: getUserName(l.utilisateur) })); }
export function getEcheancesFiscales() { return ECHEANCES_FISCALES; }
export function getOhadaControles() { return OHADA_CONTROLES; }
export function getAnalytiquePoles() { return ANALYTIQUE_POLES; }
export function getTachesCloture() { return (TACHES_CLOTURE as any[]).map(t => ({ ...t, responsableNom: getUserName(t.responsable) })); }
export function getClotureByCategorie() { return calcClotureByCategorie(TACHES_CLOTURE as any[]); }
export function getDsfTableaux() { return DSF_TABLEAUX; }
export function getAllUsers() { return USERS; }
export function getAllRoles() { return ROLES; }
export function getAllBanques() { return BANQUES; }
export function getAllFournisseurs() { return FOURNISSEURS; }
export function getAllJournaux() { return JOURNAUX; }
export function getPermissions() { return { actions: PERMISSIONS_ACTIONS, matrix: ROLE_PERMISSIONS }; }
export function getMonthlyData() { return MONTHLY_DATA; }
export function getAnomaliesMonthly() { return ANOMALIES_MONTHLY; }
export function getOperationStats() { return OPERATION_STATS; }
export function getAIConfig() { return AI_CONFIG; }
export function getAnomaliesByGravite() {
  const anomalies = ANOMALIES as any[];
  return {
    critique: anomalies.filter(a => a.gravite === 'critique' && a.statut !== 'resolu').length,
    eleve: anomalies.filter(a => a.gravite === 'eleve' && a.statut !== 'resolu').length,
    moyen: anomalies.filter(a => a.gravite === 'moyen' && a.statut !== 'resolu').length,
    faible: anomalies.filter(a => a.gravite === 'faible' && a.statut !== 'resolu').length,
  };
}

export function getComptesBancairesForDashboard() {
  return (COMPTES_BANCAIRES as any[]).map(cb => {
    const bq = (BANQUES as any[]).find(b => b.id === cb.banque_id);
    return {
      id: cb.id,
      banqueCode: bq?.code || '',
      libelle: cb.libelle,
      soldeComptable: cb.solde_comptable,
      soldeReleve: cb.solde_releve,
      tauxRapprochement: cb.taux_rapprochement,
      nbNonRapproches: cb.nb_non_rapproches,
    };
  });
}

export function getTachesClotureByCategorie() {
  return calcClotureByCategorie(TACHES_CLOTURE as any[]);
}

export function getUserRiskProfilesForDashboard() {
  return computeUserRiskProfiles().map(ur => ({
    nom: ur.nom,
    totalAnomalies: ur.total_anomalies,
    critiques: ur.critiques,
    score: ur.score,
  }));
}

export function getEcheancesFiscalesForDashboard() {
  return (ECHEANCES_FISCALES as any[]).map(ef => ({
    type: ef.type,
    periode: ef.periode,
    urgence: ef.urgence,
    montantEstime: ef.montant_estime,
    montantProvisionne: ef.montant_provisionne,
    statut: ef.statut,
  }));
}

export function getAuditLogsForDashboard() {
  return (AUDIT_LOGS as any[])
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)
    .map(l => ({
      type: l.type,
      utilisateurNom: getUserName(l.utilisateur),
      detail: l.detail,
      date: l.date,
    }));
}

export function getTreasuryForecastForDashboard() {
  return computeTreasuryForecast().map(f => ({
    semaine: f.semaine,
    soldeFermeture: f.solde_fermeture,
    tension: f.tension,
  }));
}

export function getMonthlyDataForDashboard() {
  return MONTHLY_DATA.map(m => ({
    mois: m.mois,
    ca: m.ca,
    charges: m.charges,
  }));
}

export function getPoles() { return POLES; }
export { ANOMALIE_CATEGORIES, SYSTEM_ROLES, CUSTOM_ROLES };

// ============================================================
// GESTION DES RÔLES ET PERMISSIONS
// ============================================================

// Récupérer tous les rôles (système + personnalisés)
export function getAllRolesWithCustom() {
  const customRoles = CUSTOM_ROLES.map(r => ({
    ...r,
    isCustom: true,
  }));
  return [...ROLES, ...customRoles];
}

// Récupérer les modules de permissions
export function getPermissionsModules() {
  return PERMISSIONS_MODULES;
}

// Récupérer toutes les permissions disponibles
export function getAllPermissions() {
  return ALL_PERMISSIONS;
}

// Récupérer les permissions d'un rôle
export function getRolePermissions(roleCode: string): string[] {
  // D'abord vérifier les rôles système
  if (ROLE_PERMISSIONS_MAP[roleCode]) {
    return ROLE_PERMISSIONS_MAP[roleCode];
  }
  // Ensuite les rôles personnalisés
  const customRole = CUSTOM_ROLES.find(r => r.code === roleCode);
  return customRole?.permissions || [];
}

// Vérifier si un utilisateur a une permission spécifique
export function userHasPermission(userRole: string, permission: string): boolean {
  const permissions = getRolePermissions(userRole);
  return permissions.includes(permission);
}

// Vérifier si un utilisateur peut assigner une permission à un rôle
// L'utilisateur doit avoir lui-même la permission pour pouvoir l'assigner
export function canAssignPermission(userPermissions: string[], permission: string): boolean {
  return userPermissions.includes(permission);
}

// Créer un nouveau rôle personnalisé
export function createRole(
  code: string,
  label: string,
  niveau: string,
  permissions: string[],
  createdBy: string
): { success: boolean; error?: string; role?: any } {
  // Vérifier si le code existe déjà
  const existingRole = [...ROLES, ...CUSTOM_ROLES].find(r => r.code === code);
  if (existingRole) {
    return { success: false, error: 'Ce code de rôle existe déjà' };
  }

  // Vérifier que le créateur a toutes les permissions qu'il veut assigner
  const creatorPerms = getRolePermissions(createdBy);
  const missingPerms = permissions.filter(p => !creatorPerms.includes(p));
  if (missingPerms.length > 0) {
    return { 
      success: false, 
      error: `Vous n'avez pas les permissions suivantes: ${missingPerms.join(', ')}` 
    };
  }

  const newRole = {
    code,
    label,
    niveau,
    permissions,
    createdBy,
    createdAt: new Date().toISOString(),
    isCustom: true,
  };

  CUSTOM_ROLES.push(newRole);
  return { success: true, role: newRole };
}

// Modifier un rôle personnalisé
export function updateRole(
  code: string,
  label: string,
  niveau: string,
  permissions: string[],
  updatedBy: string
): { success: boolean; error?: string; role?: any } {
  // Vérifier que ce n'est pas un rôle système
  if (SYSTEM_ROLES.includes(code)) {
    return { success: false, error: 'Les rôles système ne peuvent pas être modifiés' };
  }

  const roleIndex = CUSTOM_ROLES.findIndex(r => r.code === code);
  if (roleIndex === -1) {
    return { success: false, error: 'Rôle non trouvé' };
  }

  // Vérifier que l'utilisateur a toutes les permissions qu'il veut assigner
  const updaterPerms = getRolePermissions(updatedBy);
  const missingPerms = permissions.filter(p => !updaterPerms.includes(p));
  if (missingPerms.length > 0) {
    return { 
      success: false, 
      error: `Vous n'avez pas les permissions suivantes: ${missingPerms.join(', ')}` 
    };
  }

  CUSTOM_ROLES[roleIndex] = {
    ...CUSTOM_ROLES[roleIndex],
    label,
    niveau,
    permissions,
    updatedBy,
    updatedAt: new Date().toISOString(),
  };

  return { success: true, role: CUSTOM_ROLES[roleIndex] };
}

// Supprimer un rôle personnalisé
export function deleteRole(code: string): { success: boolean; error?: string } {
  // Vérifier que ce n'est pas un rôle système
  if (SYSTEM_ROLES.includes(code)) {
    return { success: false, error: 'Les rôles système ne peuvent pas être supprimés' };
  }

  const roleIndex = CUSTOM_ROLES.findIndex(r => r.code === code);
  if (roleIndex === -1) {
    return { success: false, error: 'Rôle non trouvé' };
  }

  // Vérifier qu'aucun utilisateur n'a ce rôle
  const usersWithRole = (USERS as any[]).filter(u => u.role === code);
  if (usersWithRole.length > 0) {
    return { 
      success: false, 
      error: `${usersWithRole.length} utilisateur(s) ont ce rôle. Changez d'abord leur rôle.` 
    };
  }

  CUSTOM_ROLES.splice(roleIndex, 1);
  return { success: true };
}

// Récupérer les permissions groupées par module pour un rôle
export function getRolePermissionsByModule(roleCode: string) {
  const permissions = getRolePermissions(roleCode);
  
  return PERMISSIONS_MODULES.map(module => ({
    ...module,
    grantedActions: module.actions.filter(action => 
      permissions.includes(`${module.id}:${action}`)
    ),
  }));
}

// Récupérer les permissions disponibles pour un utilisateur (qu'il peut assigner)
export function getAssignablePermissions(userRole: string): string[] {
  return getRolePermissions(userRole);
}
