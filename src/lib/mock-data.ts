// ============================================================
// MOCK DATA — FinanceAdvisor V4
// Extracted from HTML prototype (7,763 lines)
// All data typed for Next.js/TypeScript conversion
// ============================================================

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ============================================================
   FINANCEADVISOR V4 — SECTION DATA
   Structures de données, mock data, fonctions CRUD
   ============================================================ */

// --- Constantes ---
export const APP_NAME = 'FinanceAdvisor';
export const APP_VERSION = 'V4.0';
export const COMPANY_NAME = 'MULTIPRINT S.A.';
export const CURRENCY = 'FCFA';
export const TVA_RATE = 0.1925;
export const FISCAL_YEAR = 2025;
export const CURRENT_MONTH = 3; // Mars

// --- Utilisateurs & Rôles ---
export const ROLES = [
  { code: 'ADMIN', label: 'Administrateur', niveau: 'Système' },
  { code: 'DG', label: 'Directeur Général', niveau: 'Direction' },
  { code: 'DAF', label: 'Directeur Administratif & Financier', niveau: 'Direction' },
  { code: 'CHEF_CPTA', label: 'Chef Comptable', niveau: 'Supervision' },
  { code: 'CDG', label: 'Contrôleur de Gestion', niveau: 'Supervision' },
  { code: 'CPTA_GEN', label: 'Comptable Général', niveau: 'Opérationnel' },
  { code: 'CPTA_ACH', label: 'Comptable Achats', niveau: 'Opérationnel' },
  { code: 'CPTA_CLI', label: 'Comptable Clients', niveau: 'Opérationnel' },
  { code: 'TRES', label: 'Trésorier', niveau: 'Opérationnel' },
  { code: 'AUDIT', label: 'Auditeur Interne', niveau: 'Transversal' }
];

export const PERMISSIONS_ACTIONS = ['lecture','saisie','modification','validation','correction','cloture','export','historique','acces_ia','parametrage'];

// ============================================================
// PERMISSIONS PAR MODULE - Fonctionnalités de l'application
// ============================================================

export const PERMISSIONS_MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: 'Dashboard', actions: ['lecture'] },
  { id: 'documents', label: 'Documents', icon: 'Documents', actions: ['lecture', 'saisie', 'modification', 'validation', 'export'] },
  { id: 'banque', label: 'Banque', icon: 'Banque', actions: ['lecture', 'saisie', 'modification', 'validation', 'correction', 'export'] },
  { id: 'tresorerie', label: 'Trésorerie', icon: 'Tresorerie', actions: ['lecture', 'saisie', 'modification', 'validation', 'export'] },
  { id: 'recouvrement', label: 'Recouvrement', icon: 'Recouvrement', actions: ['lecture', 'saisie', 'modification', 'validation', 'export'] },
  { id: 'audit', label: 'Audit & Contrôle', icon: 'Audit', actions: ['lecture', 'modification', 'validation', 'correction', 'export'] },
  { id: 'fiscalite', label: 'Fiscalité', icon: 'Fiscalite', actions: ['lecture', 'saisie', 'modification', 'validation', 'export'] },
  { id: 'analytique', label: 'Analytique', icon: 'Analytique', actions: ['lecture', 'saisie', 'modification', 'export'] },
  { id: 'clotures', label: 'Clôtures', icon: 'Clotures', actions: ['lecture', 'saisie', 'modification', 'validation', 'cloture', 'export'] },
  { id: 'dsf', label: 'DSF', icon: 'DSF', actions: ['lecture', 'saisie', 'modification', 'validation', 'cloture', 'export'] },
  { id: 'agent_ia', label: 'Agent IA', icon: 'AgentIA', actions: ['lecture', 'acces_ia'] },
  { id: 'parametrage', label: 'Paramétrage', icon: 'Parametrage', actions: ['lecture', 'saisie', 'modification', 'parametrage'] },
  { id: 'historique', label: 'Historique', icon: 'Historique', actions: ['lecture', 'historique', 'export'] },
  { id: 'utilisateurs', label: 'Utilisateurs & Rôles', icon: 'Utilisateurs', actions: ['lecture', 'saisie', 'modification', 'validation', 'parametrage'] },
];

// Structure complète d'une permission: module:action (ex: 'documents:lecture', 'banque:validation')
export const ALL_PERMISSIONS = PERMISSIONS_MODULES.flatMap(m => 
  m.actions.map(a => `${m.id}:${a}`)
);

// Rôles système (non modifiables)
export const SYSTEM_ROLES = ['ADMIN', 'DG', 'DAF'];

// Rôles personnalisés créés par les utilisateurs (stockage simulé)
export let CUSTOM_ROLES: any[] = [];

// Matrice des permissions par rôle (format objet pour manipulation facile)
export const ROLE_PERMISSIONS_MAP: Record<string, string[]> = {
  'ADMIN': ALL_PERMISSIONS,
  'DG': ['dashboard:lecture', 'documents:lecture', 'banque:lecture', 'tresorerie:lecture', 'recouvrement:lecture', 
         'audit:lecture', 'fiscalite:lecture', 'analytique:lecture', 'clotures:lecture', 'clotures:validation', 'clotures:cloture',
         'dsf:lecture', 'dsf:validation', 'agent_ia:lecture', 'agent_ia:acces_ia', 'historique:lecture', 'historique:historique'],
  'DAF': ALL_PERMISSIONS,
  'CHEF_CPTA': ALL_PERMISSIONS.filter(p => !p.includes('parametrage') && !p.startsWith('utilisateurs')),
  'CDG': ['dashboard:lecture', 'documents:lecture', 'banque:lecture', 'tresorerie:lecture', 'recouvrement:lecture',
          'audit:lecture', 'fiscalite:lecture', 'analytique:lecture', 'clotures:lecture', 'dsf:lecture', 
          'agent_ia:lecture', 'agent_ia:acces_ia', 'historique:lecture', 'historique:historique', 'historique:export'],
  'CPTA_GEN': ['dashboard:lecture', 'documents:lecture', 'documents:saisie', 'documents:modification', 'documents:export',
               'banque:lecture', 'banque:saisie', 'banque:modification', 'tresorerie:lecture', 'recouvrement:lecture',
               'clotures:lecture', 'clotures:saisie', 'clotures:modification', 'dsf:lecture', 'dsf:saisie',
               'agent_ia:lecture', 'agent_ia:acces_ia', 'historique:lecture', 'historique:historique', 'historique:export'],
  'CPTA_ACH': ['dashboard:lecture', 'documents:lecture', 'documents:saisie', 'documents:modification', 'documents:export',
               'banque:lecture', 'tresorerie:lecture', 'clotures:lecture', 'clotures:saisie',
               'agent_ia:lecture', 'agent_ia:acces_ia', 'historique:lecture', 'historique:historique'],
  'CPTA_CLI': ['dashboard:lecture', 'documents:lecture', 'documents:saisie', 'documents:modification', 'documents:export',
               'recouvrement:lecture', 'recouvrement:saisie', 'recouvrement:modification', 'clotures:lecture', 'clotures:saisie',
               'agent_ia:lecture', 'agent_ia:acces_ia', 'historique:lecture', 'historique:historique'],
  'TRES': ['dashboard:lecture', 'documents:lecture', 'banque:lecture', 'banque:saisie', 'banque:modification', 'banque:validation',
           'tresorerie:lecture', 'tresorerie:saisie', 'tresorerie:modification', 'tresorerie:validation',
           'recouvrement:lecture', 'clotures:lecture', 'agent_ia:lecture', 'agent_ia:acces_ia', 'historique:lecture', 'historique:export'],
  'AUDIT': ['dashboard:lecture', 'documents:lecture', 'banque:lecture', 'tresorerie:lecture', 'recouvrement:lecture',
            'audit:lecture', 'audit:modification', 'audit:validation', 'fiscalite:lecture', 'analytique:lecture',
            'clotures:lecture', 'dsf:lecture', 'agent_ia:lecture', 'agent_ia:acces_ia', 'historique:lecture', 'historique:historique', 'historique:export'],
};

// Format matrice binaire pour compatibilité
export const ROLE_PERMISSIONS = {
  'ADMIN':     [1,1,1,1,1,1,1,1,1,1],
  'DG':        [1,0,0,1,0,1,1,1,1,0],
  'DAF':       [1,1,1,1,1,1,1,1,1,1],
  'CHEF_CPTA': [1,1,1,1,1,1,1,1,1,0],
  'CDG':       [1,0,0,0,0,0,1,1,1,0],
  'CPTA_GEN':  [1,1,1,0,0,0,1,1,1,0],
  'CPTA_ACH':  [1,1,1,0,0,0,0,1,1,0],
  'CPTA_CLI':  [1,1,1,0,0,0,0,1,1,0],
  'TRES':      [1,1,1,0,0,0,1,1,1,0],
  'AUDIT':     [1,0,0,0,0,0,1,1,1,0]
};

export const USERS = [
  { id: 'USR001', identifiant: 'admin', motdepasse: 'admin', nom: 'MBARGA Paul', role: 'ADMIN', email: 'p.mbarga@multiprint.cm', actif: true },
  { id: 'USR002', identifiant: 'dg', motdepasse: 'dg', nom: 'NKODO Xavier', role: 'DG', email: 'x.nkodo@multiprint.cm', actif: true },
  { id: 'USR003', identifiant: 'daf', motdepasse: 'daf', nom: 'TCHOUPO Marie', role: 'DAF', email: 'm.tchoupo@multiprint.cm', actif: true },
  { id: 'USR004', identifiant: 'chef', motdepasse: 'chef', nom: 'ATANGANA Joseph', role: 'CHEF_CPTA', email: 'j.atangana@multiprint.cm', actif: true },
  { id: 'USR005', identifiant: 'cdg', motdepasse: 'cdg', nom: 'FOUDA Elise', role: 'CDG', email: 'e.fouda@multiprint.cm', actif: true },
  { id: 'USR006', identifiant: 'cptagen', motdepasse: 'cptagen', nom: 'KOUA Samuel', role: 'CPTA_GEN', email: 's.koua@multiprint.cm', actif: true },
  { id: 'USR007', identifiant: 'cptaach', motdepasse: 'cptaach', nom: 'EYENE Blanche', role: 'CPTA_ACH', email: 'b.eyene@multiprint.cm', actif: true },
  { id: 'USR008', identifiant: 'cptacli', motdepasse: 'cptacli', nom: 'MVONDO Pierre', role: 'CPTA_CLI', email: 'p.mvondo@multiprint.cm', actif: true },
  { id: 'USR009', identifiant: 'tres', motdepasse: 'tres', nom: 'BELLA Françoise', role: 'TRES', email: 'f.bella@multiprint.cm', actif: true },
  { id: 'USR010', identifiant: 'audit', motdepasse: 'audit', nom: 'NGONO Charles', role: 'AUDIT', email: 'c.ngono@multiprint.cm', actif: true },
  { id: 'USR011', identifiant: 'cptaach2', motdepasse: 'cptaach2', nom: 'EKOTTO Diane', role: 'CPTA_ACH', email: 'd.ekotto@multiprint.cm', actif: true },
  { id: 'USR012', identifiant: 'cptacli2', motdepasse: 'cptacli2', nom: 'MESSI Alain', role: 'CPTA_CLI', email: 'a.messi@multiprint.cm', actif: true }
];

export const currentUser = null;

// --- Pôles d'activité ---
export const POLES = [
  { code: 'OE', label: 'Offset Étiquette', color: '#10B981' },
  { code: 'HF', label: 'Héliogravure Flexible', color: '#3B82F6' },
  { code: 'OC', label: 'Offset Carton', color: '#F59E0B' },
  { code: 'BC', label: 'Bouchon Couronne', color: '#8B5CF6' }
];

// --- Banques ---
export const BANQUES = [
  { id: 'BQ001', nom: 'Afriland First Bank', code: 'AFB' },
  { id: 'BQ002', nom: 'BICEC', code: 'BICEC' },
  { id: 'BQ003', nom: 'Société Générale Cameroun', code: 'SGC' },
  { id: 'BQ004', nom: 'UBA Cameroon', code: 'UBA' }
];

export const COMPTES_BANCAIRES = [
  { id: 'CB001', banque_id: 'BQ001', libelle: 'Courant principal', numero: '10001-00045-0001234567-89', compte_ohada: '52100001', solde_comptable: 185400000, solde_releve: 187650000, date_releve: '2025-03-28', taux_rapprochement: 94.2, nb_rapproches: 142, nb_non_rapproches: 9 },
  { id: 'CB002', banque_id: 'BQ001', libelle: 'Compte devises EUR', numero: '10001-00045-0001234568-72', compte_ohada: '52100002', solde_comptable: 28500000, solde_releve: 28500000, date_releve: '2025-03-27', taux_rapprochement: 100, nb_rapproches: 18, nb_non_rapproches: 0 },
  { id: 'CB003', banque_id: 'BQ002', libelle: 'Courant opérations', numero: '10005-00112-0004567890-45', compte_ohada: '52200001', solde_comptable: 92300000, solde_releve: 95800000, date_releve: '2025-03-28', taux_rapprochement: 87.5, nb_rapproches: 98, nb_non_rapproches: 14 },
  { id: 'CB004', banque_id: 'BQ003', libelle: 'Courant trésorerie', numero: '17301-00089-0007654321-11', compte_ohada: '52300001', solde_comptable: 145000000, solde_releve: 143200000, date_releve: '2025-03-28', taux_rapprochement: 91.8, nb_rapproches: 67, nb_non_rapproches: 6 },
  { id: 'CB005', banque_id: 'BQ004', libelle: 'Courant fournisseurs', numero: '20401-00034-0002345678-33', compte_ohada: '52400001', solde_comptable: 68750000, solde_releve: 71250000, date_releve: '2025-03-27', taux_rapprochement: 89.3, nb_rapproches: 52, nb_non_rapproches: 7 }
];

// --- Clients ---
export const CLIENTS = [
  { id: 'CLI001', raison_sociale: 'SABC (Brasseries du Cameroun)', code_x3: 'C-SABC', secteur: 'Boissons', pole: 'OE', encours: 125000000, echeance_echue: 45000000, retard_moyen: 22, delai_contractuel: 30, dernier_paiement: '2025-03-15', montant_dernier_paiement: 35000000, score_risque: 35, niveau_relance: 1, commercial: 'MENDOUGA Jean', statut: 'Actif' },
  { id: 'CLI002', raison_sociale: 'CICAM', code_x3: 'C-CICAM', secteur: 'Textile', pole: 'HF', encours: 78000000, echeance_echue: 38000000, retard_moyen: 45, delai_contractuel: 30, dernier_paiement: '2025-02-20', montant_dernier_paiement: 15000000, score_risque: 68, niveau_relance: 3, commercial: 'NGUE Emile', statut: 'Surveillé' },
  { id: 'CLI003', raison_sociale: 'CHOCOCAM (Tiger Brands)', code_x3: 'C-CHOCO', secteur: 'Agroalimentaire', pole: 'HF', encours: 95000000, echeance_echue: 12000000, retard_moyen: 8, delai_contractuel: 45, dernier_paiement: '2025-03-22', montant_dernier_paiement: 42000000, score_risque: 15, niveau_relance: 0, commercial: 'MENDOUGA Jean', statut: 'Actif' },
  { id: 'CLI004', raison_sociale: 'SODECOTON', code_x3: 'C-SODEC', secteur: 'Agriculture', pole: 'OC', encours: 56000000, echeance_echue: 56000000, retard_moyen: 62, delai_contractuel: 30, dernier_paiement: '2025-01-10', montant_dernier_paiement: 20000000, score_risque: 88, niveau_relance: 4, commercial: 'NGUE Emile', statut: 'Contentieux' },
  { id: 'CLI005', raison_sociale: 'Nestlé Cameroun', code_x3: 'C-NESTL', secteur: 'Agroalimentaire', pole: 'HF', encours: 210000000, echeance_echue: 18000000, retard_moyen: 5, delai_contractuel: 60, dernier_paiement: '2025-03-25', montant_dernier_paiement: 85000000, score_risque: 8, niveau_relance: 0, commercial: 'MENDOUGA Jean', statut: 'Actif' },
  { id: 'CLI006', raison_sociale: 'GUINNESS Cameroun', code_x3: 'C-GUINS', secteur: 'Boissons', pole: 'OE', encours: 88000000, echeance_echue: 28000000, retard_moyen: 18, delai_contractuel: 30, dernier_paiement: '2025-03-10', montant_dernier_paiement: 30000000, score_risque: 32, niveau_relance: 1, commercial: 'MENDOUGA Jean', statut: 'Actif' },
  { id: 'CLI007', raison_sociale: 'SCTM', code_x3: 'C-SCTM', secteur: 'Tabac', pole: 'OE', encours: 42000000, echeance_echue: 42000000, retard_moyen: 55, delai_contractuel: 30, dernier_paiement: '2025-01-28', montant_dernier_paiement: 10000000, score_risque: 82, niveau_relance: 4, commercial: 'NGUE Emile', statut: 'Bloqué' },
  { id: 'CLI008', raison_sociale: 'CADYST Pharma', code_x3: 'C-CADYS', secteur: 'Pharmacie', pole: 'OC', encours: 35000000, echeance_echue: 8000000, retard_moyen: 12, delai_contractuel: 30, dernier_paiement: '2025-03-18', montant_dernier_paiement: 12000000, score_risque: 22, niveau_relance: 1, commercial: 'MENDOUGA Jean', statut: 'Actif' },
  { id: 'CLI009', raison_sociale: 'UCB (Biscuiterie)', code_x3: 'C-UCB', secteur: 'Agroalimentaire', pole: 'HF', encours: 28000000, echeance_echue: 15000000, retard_moyen: 35, delai_contractuel: 30, dernier_paiement: '2025-02-25', montant_dernier_paiement: 8000000, score_risque: 55, niveau_relance: 2, commercial: 'NGUE Emile', statut: 'Surveillé' },
  { id: 'CLI010', raison_sociale: 'CIMENCAM', code_x3: 'C-CIMEN', secteur: 'Ciment', pole: 'OC', encours: 18000000, echeance_echue: 0, retard_moyen: 0, delai_contractuel: 30, dernier_paiement: '2025-03-20', montant_dernier_paiement: 18000000, score_risque: 5, niveau_relance: 0, commercial: 'MENDOUGA Jean', statut: 'Actif' },
  { id: 'CLI011', raison_sociale: 'SOCAVER', code_x3: 'C-SOCAV', secteur: 'Verrerie', pole: 'BC', encours: 65000000, echeance_echue: 22000000, retard_moyen: 20, delai_contractuel: 45, dernier_paiement: '2025-03-05', montant_dernier_paiement: 25000000, score_risque: 30, niveau_relance: 1, commercial: 'MENDOUGA Jean', statut: 'Actif' },
  { id: 'CLI012', raison_sociale: 'SOURCE DU PAYS', code_x3: 'C-SDUPY', secteur: 'Boissons', pole: 'OE', encours: 32000000, echeance_echue: 32000000, retard_moyen: 48, delai_contractuel: 30, dernier_paiement: '2025-02-01', montant_dernier_paiement: 5000000, score_risque: 75, niveau_relance: 3, commercial: 'NGUE Emile', statut: 'Surveillé' },
  { id: 'CLI013', raison_sociale: 'PMUC', code_x3: 'C-PMUC', secteur: 'Cosmétique', pole: 'OC', encours: 15000000, echeance_echue: 5000000, retard_moyen: 10, delai_contractuel: 30, dernier_paiement: '2025-03-12', montant_dernier_paiement: 8000000, score_risque: 18, niveau_relance: 1, commercial: 'MENDOUGA Jean', statut: 'Actif' },
  { id: 'CLI014', raison_sociale: 'DANGOTE CAMEROUN', code_x3: 'C-DANGO', secteur: 'Ciment', pole: 'OC', encours: 22000000, echeance_echue: 10000000, retard_moyen: 25, delai_contractuel: 30, dernier_paiement: '2025-03-01', montant_dernier_paiement: 12000000, score_risque: 40, niveau_relance: 2, commercial: 'NGUE Emile', statut: 'Actif' },
  { id: 'CLI015', raison_sociale: 'FERME AVICOLE MVOG-BETSI', code_x3: 'C-FAVIC', secteur: 'Élevage', pole: 'HF', encours: 8000000, echeance_echue: 8000000, retard_moyen: 70, delai_contractuel: 30, dernier_paiement: '2024-12-15', montant_dernier_paiement: 3000000, score_risque: 92, niveau_relance: 5, commercial: 'NGUE Emile', statut: 'Contentieux' }
];

// --- Fournisseurs ---
export const FOURNISSEURS = [
  { id: 'FRN001', raison_sociale: 'SAPPI (Afrique du Sud)', code_x3: 'F-SAPPI', secteur: 'Papier', contact: '+27 11 407 8111' },
  { id: 'FRN002', raison_sociale: 'INDEVCO Group', code_x3: 'F-INDEV', secteur: 'Emballage', contact: '+961 9 231 231' },
  { id: 'FRN003', raison_sociale: 'SUN Chemical', code_x3: 'F-SUNCH', secteur: 'Encres', contact: '+33 1 49 29 12 00' },
  { id: 'FRN004', raison_sociale: 'BOBST SA', code_x3: 'F-BOBST', secteur: 'Machines', contact: '+41 21 621 21 11' },
  { id: 'FRN005', raison_sociale: 'TOTAL Energies Cameroun', code_x3: 'F-TOTAL', secteur: 'Énergie', contact: '+237 233 42 09 90' },
  { id: 'FRN006', raison_sociale: 'ENERCA (AES SONEL)', code_x3: 'F-ENERCA', secteur: 'Électricité', contact: '+237 233 42 22 22' },
  { id: 'FRN007', raison_sociale: 'CAMWATER', code_x3: 'F-CAMWA', secteur: 'Eau', contact: '+237 233 42 68 68' },
  { id: 'FRN008', raison_sociale: 'CROWN Holdings', code_x3: 'F-CROWN', secteur: 'Bouchons matières premières', contact: '+1 215 698 5100' },
  { id: 'FRN009', raison_sociale: 'EXPRESS UNION', code_x3: 'F-EXPUN', secteur: 'Transport', contact: '+237 233 42 77 77' },
  { id: 'FRN010', raison_sociale: 'CNPS', code_x3: 'F-CNPS', secteur: 'Sécurité sociale', contact: '+237 222 23 16 99' }
];

// --- Journaux comptables ---
export const JOURNAUX = [
  { code: 'HA', label: 'Journal des Achats' },
  { code: 'VE', label: 'Journal des Ventes' },
  { code: 'BQ1', label: 'Banque Afriland Principal' },
  { code: 'BQ2', label: 'Banque Afriland EUR' },
  { code: 'BQ3', label: 'Banque BICEC' },
  { code: 'BQ4', label: 'Banque SG Cameroun' },
  { code: 'BQ5', label: 'Banque UBA' },
  { code: 'CA', label: 'Journal de Caisse' },
  { code: 'OD', label: 'Opérations Diverses' },
  { code: 'SA', label: 'Journal de Paie / Salaires' },
  { code: 'AN', label: 'Journal À-Nouveaux' }
];

// --- Anomalies (catalogue) ---
export const ANOMALIE_CATEGORIES = [
  { code: 'DOC', label: 'Documentation' },
  { code: 'IMP', label: 'Imputation' },
  { code: 'FISC', label: 'Fiscalité' },
  { code: 'CONF', label: 'Conformité' },
  { code: 'FRAUDE', label: 'Fraude' },
  { code: 'FACT', label: 'Facturation' },
  { code: 'LETT', label: 'Lettrage' },
  { code: 'SEP', label: 'Séparation tâches' },
  { code: 'BQ', label: 'Banque' },
  { code: 'PROV', label: 'Provisions' },
  { code: 'CTRL', label: 'Contrôle' },
  { code: 'ANAL', label: 'Analytique' }
];

export const GRAVITES = [
  { code: 'critique', label: 'Critique', color: '#EF4444' },
  { code: 'eleve', label: 'Élevé', color: '#F59E0B' },
  { code: 'moyen', label: 'Moyen', color: '#D97706' },
  { code: 'faible', label: 'Faible', color: '#64748B' }
];

// Anomalies démo (25 anomalies)
export const ANOMALIES = [
  { id: 'ANO-2025-001', categorie: 'SEP', gravite: 'critique', titre: 'Même utilisateur saisie et validation — JV HA 03/2025', detail: 'KOUA Samuel a saisi et validé l\'écriture HA-2025-03-0456 le même jour.', utilisateur: 'USR006', impact: 4500000, date_detection: '2025-03-28', source: 'Règle_SoD_001', responsable: 'USR004', statut: 'ouvert', action_corrective: 'Faire re-valider par le Chef Comptable.' },
  { id: 'ANO-2025-002', categorie: 'DOC', gravite: 'critique', titre: 'Facture SAPPI non comptabilisée depuis 18 jours', detail: 'Facture SAPPI F-2025-0342 datée du 10/03/2025, montant 28 500 000 FCFA, non saisie en comptabilité.', utilisateur: 'USR007', impact: 28500000, date_detection: '2025-03-28', source: 'Scan_vs_Compta', responsable: 'USR007', statut: 'ouvert', action_corrective: 'Saisir immédiatement dans journal HA.' },
  { id: 'ANO-2025-003', categorie: 'FISC', gravite: 'eleve', titre: 'TVA à 18 % au lieu de 19,25 % sur facture INDEVCO', detail: 'Facture INDEVCO comptabilisée avec TVA 18 % au lieu de 19,25 %.', utilisateur: 'USR007', impact: 850000, date_detection: '2025-03-25', source: 'Ctrl_TVA_Auto', responsable: 'USR007', statut: 'en_cours', action_corrective: 'Corriger l\'écriture et passer l\'écart.' },
  { id: 'ANO-2025-004', categorie: 'FRAUDE', gravite: 'eleve', titre: 'Doublon probable — TOTAL Energies mars', detail: 'Deux écritures identiques (12 800 000 FCFA) pour TOTAL Energies à 2 jours d\'intervalle.', utilisateur: 'USR007', impact: 12800000, date_detection: '2025-03-26', source: 'Détection_Doublons', responsable: 'USR004', statut: 'ouvert', action_corrective: 'Vérifier et annuler le doublon si confirmé.' },
  { id: 'ANO-2025-005', categorie: 'CONF', gravite: 'critique', titre: 'Compte 470000 (attente) solde > 30 jours', detail: 'Le compte d\'attente 470000 présente un solde de 6 200 000 FCFA non régularisé depuis 45 jours.', utilisateur: 'USR006', impact: 6200000, date_detection: '2025-03-28', source: 'Règle_Attente_30j', responsable: 'USR006', statut: 'ouvert', action_corrective: 'Identifier la nature et imputer sur le bon compte.' },
  { id: 'ANO-2025-006', categorie: 'BQ', gravite: 'eleve', titre: 'Rapprochement BICEC en retard > J+5', detail: 'Le rapprochement bancaire BICEC n\'est pas finalisé. 14 mouvements non rapprochés.', utilisateur: 'USR009', impact: 3500000, date_detection: '2025-03-28', source: 'Règle_Rap_J5', responsable: 'USR009', statut: 'ouvert', action_corrective: 'Finaliser le rapprochement avant clôture.' },
  { id: 'ANO-2025-007', categorie: 'FACT', gravite: 'critique', titre: 'Rupture séquence facturation VE — manque FC-2025-0187', detail: 'La facture FC-2025-0187 est absente de la séquence. Passage de 0186 à 0188.', utilisateur: 'USR008', impact: 0, date_detection: '2025-03-27', source: 'Ctrl_Séquence', responsable: 'USR008', statut: 'ouvert', action_corrective: 'Retrouver ou justifier la facture manquante.' },
  { id: 'ANO-2025-008', categorie: 'FRAUDE', gravite: 'moyen', titre: 'Montant rond suspect — OD 5 000 000 FCFA', detail: 'Écriture d\'OD pour un montant rond de 5 000 000 FCFA sans justificatif détaillé.', utilisateur: 'USR006', impact: 5000000, date_detection: '2025-03-24', source: 'Détection_Montant_Rond', responsable: 'USR004', statut: 'ouvert', action_corrective: 'Demander justificatif complet.' },
  { id: 'ANO-2025-009', categorie: 'DOC', gravite: 'eleve', titre: 'OD sans justificatif — mars 2025 (3 écritures)', detail: '3 écritures d\'OD en mars sans pièce justificative rattachée.', utilisateur: 'USR006', impact: 8700000, date_detection: '2025-03-28', source: 'Ctrl_Justif_OD', responsable: 'USR006', statut: 'ouvert', action_corrective: 'Rattacher les justificatifs ou annuler.' },
  { id: 'ANO-2025-010', categorie: 'IMP', gravite: 'eleve', titre: 'Mauvaise imputation — charge en immo', detail: 'Achat de fournitures (580 000 FCFA) comptabilisé en immobilisation au lieu de charge.', utilisateur: 'USR007', impact: 580000, date_detection: '2025-03-23', source: 'Ctrl_Imputation', responsable: 'USR007', statut: 'resolu', action_corrective: 'Écriture de régularisation passée.' },
  { id: 'ANO-2025-011', categorie: 'LETT', gravite: 'moyen', titre: 'Lettrage incomplet — client CICAM', detail: 'Compte client CICAM avec 12 lignes non lettrées totalisant 38 000 000 FCFA.', utilisateur: 'USR008', impact: 38000000, date_detection: '2025-03-28', source: 'Ctrl_Lettrage', responsable: 'USR008', statut: 'ouvert', action_corrective: 'Procéder au lettrage des règlements reçus.' },
  { id: 'ANO-2025-012', categorie: 'ANAL', gravite: 'moyen', titre: 'Ventilation analytique absente — 5 écritures HA', detail: '5 écritures du journal HA n\'ont pas de ventilation analytique par pôle.', utilisateur: 'USR007', impact: 0, date_detection: '2025-03-27', source: 'Ctrl_Analytique', responsable: 'USR007', statut: 'ouvert', action_corrective: 'Ajouter la section analytique sur chaque écriture.' },
  { id: 'ANO-2025-013', categorie: 'PROV', gravite: 'eleve', titre: 'Provision client douteux manquante — SODECOTON', detail: 'SODECOTON en retard de 62 jours. Aucune provision pour créance douteuse passée.', utilisateur: 'USR008', impact: 56000000, date_detection: '2025-03-28', source: 'Ctrl_Provision_Client', responsable: 'USR004', statut: 'ouvert', action_corrective: 'Passer une provision pour dépréciation de créance.' },
  { id: 'ANO-2025-014', categorie: 'DOC', gravite: 'moyen', titre: 'Comptabilisation tardive — 4 factures > 15 jours', detail: '4 factures fournisseurs saisies avec plus de 15 jours de retard.', utilisateur: 'USR007', impact: 0, date_detection: '2025-03-28', source: 'Ctrl_Délai_Compta', responsable: 'USR007', statut: 'ouvert', action_corrective: 'Améliorer le processus de saisie.' },
  { id: 'ANO-2025-015', categorie: 'SEP', gravite: 'critique', titre: 'Même utilisateur saisie + validation — VE mars', detail: 'MVONDO Pierre a saisi et validé 8 factures clients en mars.', utilisateur: 'USR008', impact: 0, date_detection: '2025-03-28', source: 'Règle_SoD_001', responsable: 'USR004', statut: 'ouvert', action_corrective: 'Instaurer une validation par un second utilisateur.' },
  { id: 'ANO-2025-016', categorie: 'BQ', gravite: 'moyen', titre: 'Frais bancaires non comptabilisés — UBA mars', detail: 'Les frais bancaires UBA de mars (estimation 450 000 FCFA) ne sont pas encore saisis.', utilisateur: 'USR009', impact: 450000, date_detection: '2025-03-28', source: 'Ctrl_Frais_BQ', responsable: 'USR009', statut: 'ouvert', action_corrective: 'Saisir les frais dès réception de l\'avis.' },
  { id: 'ANO-2025-017', categorie: 'CTRL', gravite: 'moyen', titre: 'Écart montant inhabituel — achat encres +45 %', detail: 'La facture SUN Chemical de mars est 45 % supérieure à la moyenne des 6 derniers mois.', utilisateur: 'USR007', impact: 15200000, date_detection: '2025-03-25', source: 'Ctrl_Écart_Historique', responsable: 'USR005', statut: 'ouvert', action_corrective: 'Vérifier les quantités et prix unitaires.' },
  { id: 'ANO-2025-018', categorie: 'CONF', gravite: 'eleve', titre: 'Compte OHADA invalide — 691500 utilisé', detail: 'Le compte 691500 n\'existe pas dans le plan OHADA. Utilisé pour un montant de 2 300 000 FCFA.', utilisateur: 'USR006', impact: 2300000, date_detection: '2025-03-26', source: 'Ctrl_Plan_OHADA', responsable: 'USR006', statut: 'ouvert', action_corrective: 'Ré-imputer sur le bon compte OHADA.' },
  { id: 'ANO-2025-019', categorie: 'FRAUDE', gravite: 'eleve', titre: 'Doublon probable — CROWN Holdings', detail: 'Facture CROWN saisie deux fois (réf. F-CR-2025-088). Montant : 18 900 000 FCFA.', utilisateur: 'USR011', impact: 18900000, date_detection: '2025-03-27', source: 'Détection_Doublons', responsable: 'USR004', statut: 'ouvert', action_corrective: 'Annuler la seconde écriture.' },
  { id: 'ANO-2025-020', categorie: 'LETT', gravite: 'faible', titre: 'Lettrage fournisseur en retard — SAPPI', detail: 'Compte fournisseur SAPPI avec 5 lignes non lettrées.', utilisateur: 'USR007', impact: 0, date_detection: '2025-03-28', source: 'Ctrl_Lettrage', responsable: 'USR007', statut: 'ouvert', action_corrective: 'Procéder au lettrage.' },
  { id: 'ANO-2025-021', categorie: 'DOC', gravite: 'critique', titre: '7 documents non comptabilisés > 10 jours', detail: '7 pièces scannées depuis plus de 10 jours ne sont pas encore saisies en comptabilité.', utilisateur: null, impact: 42000000, date_detection: '2025-03-28', source: 'Scan_vs_Compta', responsable: 'USR004', statut: 'ouvert', action_corrective: 'Prioriser la saisie des pièces en retard.' },
  { id: 'ANO-2025-022', categorie: 'IMP', gravite: 'moyen', titre: 'Schéma comptable incohérent — écriture OD-0312', detail: 'Écriture OD-0312 : débit 601 / crédit 411. Schéma inhabituel (charge débitée / client crédité).', utilisateur: 'USR006', impact: 1800000, date_detection: '2025-03-26', source: 'Ctrl_Schéma', responsable: 'USR004', statut: 'ouvert', action_corrective: 'Vérifier l\'intention de l\'écriture.' },
  { id: 'ANO-2025-023', categorie: 'PROV', gravite: 'eleve', titre: 'Provision stock dormant non passée', detail: 'Stock dormant identifié pour 8 500 000 FCFA (inactif > 180 jours). Pas de provision.', utilisateur: null, impact: 8500000, date_detection: '2025-03-28', source: 'Ctrl_Stock_Dormant', responsable: 'USR004', statut: 'ouvert', action_corrective: 'Passer une provision pour dépréciation de stock.' },
  { id: 'ANO-2025-024', categorie: 'FISC', gravite: 'eleve', titre: 'Écart TVA collectée vs déclarée — février', detail: 'TVA collectée en comptabilité : 48 250 000. TVA déclarée : 46 800 000. Écart : 1 450 000 FCFA.', utilisateur: 'USR006', impact: 1450000, date_detection: '2025-03-20', source: 'Ctrl_TVA_Déclaration', responsable: 'USR004', statut: 'en_cours', action_corrective: 'Réconcilier et corriger la prochaine déclaration.' },
  { id: 'ANO-2025-025', categorie: 'DOC', gravite: 'faible', titre: 'Écriture non documentée — CA-0089', detail: 'Écriture de caisse CA-0089 sans libellé explicite ni pièce rattachée.', utilisateur: 'USR009', impact: 350000, date_detection: '2025-03-22', source: 'Ctrl_Doc_Écriture', responsable: 'USR009', statut: 'ouvert', action_corrective: 'Ajouter le libellé et la pièce.' }
];

// --- Échéances fiscales ---
export const ECHEANCES_FISCALES = [
  { id: 'FISC001', type: 'TVA', periode: 'Mars 2025', echeance: '2025-04-15', montant_estime: 52000000, montant_provisionne: 48000000, statut: 'en_cours', urgence: 18 },
  { id: 'FISC002', type: 'DIPE', periode: 'Mars 2025', echeance: '2025-04-15', montant_estime: 28000000, montant_provisionne: 28000000, statut: 'pret', urgence: 18 },
  { id: 'FISC003', type: 'Acompte IS', periode: 'Mars 2025', echeance: '2025-04-15', montant_estime: 15000000, montant_provisionne: 12000000, statut: 'en_cours', urgence: 18 },
  { id: 'FISC004', type: 'Précompte achats', periode: 'Mars 2025', echeance: '2025-04-15', montant_estime: 8500000, montant_provisionne: 8500000, statut: 'pret', urgence: 18 },
  { id: 'FISC005', type: 'Patente', periode: '2025', echeance: '2025-03-15', montant_estime: 12000000, montant_provisionne: 12000000, statut: 'depose', urgence: 0 },
  { id: 'FISC006', type: 'Centimes additionnels', periode: '2025', echeance: '2025-03-15', montant_estime: 3600000, montant_provisionne: 3600000, statut: 'depose', urgence: 0 },
  { id: 'FISC007', type: 'DSF', periode: '2024', echeance: '2025-03-15', montant_estime: 0, montant_provisionne: 0, statut: 'depose', urgence: 0 },
  { id: 'FISC008', type: 'TVA', periode: 'Avril 2025', echeance: '2025-05-15', montant_estime: 50000000, montant_provisionne: 0, statut: 'a_preparer', urgence: 48 }
];

// --- Données analytiques par pôle ---
export const ANALYTIQUE_POLES = [
  { pole: 'OE', ca: 320000000, cout_matiere: 128000000, cout_mo: 48000000, cout_machine: 32000000, frais_generaux: 38400000, marge_standard: 28.5, top_client: 'SABC', ca_top_client: 95000000, tendance: 'up' },
  { pole: 'HF', ca: 480000000, cout_matiere: 216000000, cout_mo: 62400000, cout_machine: 52800000, frais_generaux: 57600000, marge_standard: 24.0, top_client: 'Nestlé', ca_top_client: 185000000, tendance: 'down' },
  { pole: 'OC', ca: 180000000, cout_matiere: 72000000, cout_mo: 27000000, cout_machine: 19800000, frais_generaux: 21600000, marge_standard: 26.0, top_client: 'CADYST Pharma', ca_top_client: 35000000, tendance: 'neutral' },
  { pole: 'BC', ca: 220000000, cout_matiere: 99000000, cout_mo: 33000000, cout_machine: 28600000, frais_generaux: 26400000, marge_standard: 22.0, top_client: 'SOCAVER', ca_top_client: 65000000, tendance: 'up' }
];

// --- Tâches de clôture ---
export const TACHES_CLOTURE = [
  { id: 'CLO001', categorie: 'Achats', description: 'Saisie complète des factures fournisseurs mars', responsable: 'USR007', echeance: '2025-04-05', statut: 'en_cours', blocage: 'bloquant_cloture' },
  { id: 'CLO002', categorie: 'Achats', description: 'Passage des FNP (factures non parvenues)', responsable: 'USR007', echeance: '2025-04-07', statut: 'non_demarre', blocage: 'bloquant_cloture' },
  { id: 'CLO003', categorie: 'Achats', description: 'Rattachement des charges à la période', responsable: 'USR004', echeance: '2025-04-08', statut: 'non_demarre', blocage: 'bloquant_cloture' },
  { id: 'CLO004', categorie: 'Ventes', description: 'Vérification séquence facturation VE', responsable: 'USR008', echeance: '2025-04-04', statut: 'bloquant', blocage: 'bloquant_cloture' },
  { id: 'CLO005', categorie: 'Ventes', description: 'Contrôle des avoirs émis', responsable: 'USR008', echeance: '2025-04-05', statut: 'termine', blocage: 'non_bloquant' },
  { id: 'CLO006', categorie: 'Ventes', description: 'Émission factures restantes', responsable: 'USR008', echeance: '2025-04-03', statut: 'termine', blocage: 'non_bloquant' },
  { id: 'CLO007', categorie: 'Banque', description: 'Rapprochement Afriland — Compte principal', responsable: 'USR009', echeance: '2025-04-05', statut: 'en_cours', blocage: 'bloquant_cloture' },
  { id: 'CLO008', categorie: 'Banque', description: 'Rapprochement Afriland — Compte EUR', responsable: 'USR009', echeance: '2025-04-05', statut: 'termine', blocage: 'non_bloquant' },
  { id: 'CLO009', categorie: 'Banque', description: 'Rapprochement BICEC', responsable: 'USR009', echeance: '2025-04-05', statut: 'en_cours', blocage: 'bloquant_cloture' },
  { id: 'CLO010', categorie: 'Banque', description: 'Rapprochement SG Cameroun', responsable: 'USR009', echeance: '2025-04-05', statut: 'en_cours', blocage: 'bloquant_cloture' },
  { id: 'CLO011', categorie: 'Banque', description: 'Rapprochement UBA', responsable: 'USR009', echeance: '2025-04-05', statut: 'en_cours', blocage: 'bloquant_cloture' },
  { id: 'CLO012', categorie: 'Banque', description: 'Saisie frais bancaires mars', responsable: 'USR009', echeance: '2025-04-06', statut: 'non_demarre', blocage: 'non_bloquant' },
  { id: 'CLO013', categorie: 'Fiscal', description: 'Contrôle TVA collectée vs déclarée', responsable: 'USR006', echeance: '2025-04-08', statut: 'en_cours', blocage: 'bloquant_cloture' },
  { id: 'CLO014', categorie: 'Fiscal', description: 'Provisions fiscales (IS, taxes)', responsable: 'USR004', echeance: '2025-04-09', statut: 'non_demarre', blocage: 'bloquant_cloture' },
  { id: 'CLO015', categorie: 'Fiscal', description: 'Vérification précomptes sur achats', responsable: 'USR007', echeance: '2025-04-07', statut: 'non_demarre', blocage: 'non_bloquant' },
  { id: 'CLO016', categorie: 'Paie', description: 'Comptabilisation charges sociales CNPS', responsable: 'USR006', echeance: '2025-04-06', statut: 'non_demarre', blocage: 'bloquant_cloture' },
  { id: 'CLO017', categorie: 'Paie', description: 'Cohérence paie / OD / DIPE', responsable: 'USR004', echeance: '2025-04-08', statut: 'non_demarre', blocage: 'non_bloquant' },
  { id: 'CLO018', categorie: 'Stocks', description: 'Mise à jour valorisation stocks', responsable: 'USR005', echeance: '2025-04-07', statut: 'non_demarre', blocage: 'bloquant_cloture' },
  { id: 'CLO019', categorie: 'Stocks', description: 'Traitement écarts inventaire', responsable: 'USR005', echeance: '2025-04-08', statut: 'non_demarre', blocage: 'non_bloquant' },
  { id: 'CLO020', categorie: 'Stocks', description: 'Provision stock dormant', responsable: 'USR004', echeance: '2025-04-09', statut: 'non_demarre', blocage: 'bloquant_cloture' },
  { id: 'CLO021', categorie: 'Analytique', description: 'Ventilation analytique complète 4 pôles', responsable: 'USR005', echeance: '2025-04-09', statut: 'non_demarre', blocage: 'bloquant_cloture' },
  { id: 'CLO022', categorie: 'Analytique', description: 'Validation répartition frais généraux', responsable: 'USR005', echeance: '2025-04-10', statut: 'non_demarre', blocage: 'non_bloquant' },
  { id: 'CLO023', categorie: 'Contrôle', description: 'Solder comptes d\'attente (470xxx)', responsable: 'USR006', echeance: '2025-04-08', statut: 'en_attente', blocage: 'bloquant_cloture' },
  { id: 'CLO024', categorie: 'Contrôle', description: 'Justification OD sans pièces', responsable: 'USR006', echeance: '2025-04-07', statut: 'en_attente', blocage: 'bloquant_cloture' },
  { id: 'CLO025', categorie: 'Contrôle', description: 'Lettrage avancé clients', responsable: 'USR008', echeance: '2025-04-06', statut: 'en_cours', blocage: 'non_bloquant' },
  { id: 'CLO026', categorie: 'Contrôle', description: 'Lettrage avancé fournisseurs', responsable: 'USR007', echeance: '2025-04-06', statut: 'non_demarre', blocage: 'non_bloquant' },
  { id: 'CLO027', categorie: 'Contrôle', description: 'Vérification comptes de régularisation', responsable: 'USR004', echeance: '2025-04-10', statut: 'non_demarre', blocage: 'bloquant_cloture' },
  { id: 'CLO028', categorie: 'Ventes', description: 'Provision créances douteuses', responsable: 'USR004', echeance: '2025-04-09', statut: 'non_demarre', blocage: 'bloquant_cloture' },
  { id: 'CLO029', categorie: 'Achats', description: 'Charges constatées d\'avance (CCA)', responsable: 'USR004', echeance: '2025-04-09', statut: 'non_demarre', blocage: 'non_bloquant' },
  { id: 'CLO030', categorie: 'Contrôle', description: 'Revue finale et validation clôture', responsable: 'USR003', echeance: '2025-04-12', statut: 'non_demarre', blocage: 'bloquant_cloture' }
];

// --- DSF Tableaux ---
export const DSF_TABLEAUX = [
  { numero: 1, intitule: 'Bilan actif', statut: 'a_verifier', fiabilite: 72, poids: 3, dependances: ['CLO018','CLO023'], remarque: 'Comptes d\'attente à solder' },
  { numero: 2, intitule: 'Bilan passif', statut: 'a_verifier', fiabilite: 75, poids: 3, dependances: ['CLO013','CLO028'], remarque: 'Provisions à compléter' },
  { numero: 3, intitule: 'Compte de résultat — charges', statut: 'fragile', fiabilite: 58, poids: 3, dependances: ['CLO001','CLO003','CLO016'], remarque: 'Factures non comptabilisées' },
  { numero: 4, intitule: 'Compte de résultat — produits', statut: 'a_verifier', fiabilite: 82, poids: 3, dependances: ['CLO004','CLO006'], remarque: 'Séquence facturation à vérifier' },
  { numero: 5, intitule: 'Tableau des flux de trésorerie', statut: 'fragile', fiabilite: 45, poids: 3, dependances: ['CLO007','CLO009','CLO010','CLO011'], remarque: 'Rapprochements bancaires non finalisés' },
  { numero: 6, intitule: 'Variation des capitaux propres', statut: 'pret', fiabilite: 92, poids: 3, dependances: [], remarque: '' },
  { numero: 7, intitule: 'Tableau des immobilisations', statut: 'a_verifier', fiabilite: 78, poids: 2, dependances: ['CLO010'], remarque: 'Vérifier imputation charges vs immo' },
  { numero: 8, intitule: 'Tableau des amortissements', statut: 'pret', fiabilite: 95, poids: 2, dependances: [], remarque: '' },
  { numero: 9, intitule: 'Tableau des provisions', statut: 'fragile', fiabilite: 40, poids: 2, dependances: ['CLO020','CLO028','CLO014'], remarque: 'Provisions client + stock manquantes' },
  { numero: 10, intitule: 'Tableau des créances', statut: 'a_verifier', fiabilite: 68, poids: 2, dependances: ['CLO025'], remarque: 'Lettrage clients en cours' },
  { numero: 11, intitule: 'Tableau des dettes', statut: 'a_verifier', fiabilite: 70, poids: 2, dependances: ['CLO026','CLO002'], remarque: 'FNP à passer + lettrage fournisseurs' },
  { numero: 12, intitule: 'Engagements hors bilan', statut: 'pret', fiabilite: 88, poids: 2, dependances: [], remarque: '' },
  { numero: 13, intitule: 'Effectifs et masse salariale', statut: 'a_verifier', fiabilite: 80, poids: 1, dependances: ['CLO017'], remarque: 'Cohérence paie à valider' },
  { numero: 14, intitule: 'Détail charges de personnel', statut: 'a_verifier', fiabilite: 78, poids: 1, dependances: ['CLO016','CLO017'], remarque: 'CNPS à comptabiliser' },
  { numero: 15, intitule: 'Production de l\'exercice', statut: 'pret', fiabilite: 90, poids: 1, dependances: [], remarque: '' },
  { numero: 16, intitule: 'Achats et variations de stocks', statut: 'fragile', fiabilite: 52, poids: 1, dependances: ['CLO001','CLO018','CLO019'], remarque: 'Factures manquantes + valorisation stocks' },
  { numero: 17, intitule: 'Transports et déplacements', statut: 'pret', fiabilite: 92, poids: 1, dependances: [], remarque: '' },
  { numero: 18, intitule: 'Services extérieurs', statut: 'a_verifier', fiabilite: 75, poids: 1, dependances: ['CLO001'], remarque: 'Factures à saisir' },
  { numero: 19, intitule: 'Impôts et taxes', statut: 'a_verifier', fiabilite: 72, poids: 1, dependances: ['CLO014'], remarque: 'Provisions fiscales manquantes' },
  { numero: 20, intitule: 'Détail produits financiers', statut: 'pret', fiabilite: 95, poids: 1, dependances: [], remarque: '' },
  { numero: 21, intitule: 'Détail charges financières', statut: 'a_verifier', fiabilite: 74, poids: 1, dependances: ['CLO012'], remarque: 'Frais bancaires à saisir' },
  { numero: 22, intitule: 'Détail produits HAO', statut: 'pret', fiabilite: 98, poids: 1, dependances: [], remarque: '' },
  { numero: 23, intitule: 'Détail charges HAO', statut: 'pret', fiabilite: 96, poids: 1, dependances: [], remarque: '' },
  { numero: 24, intitule: 'Résultat fiscal et IS', statut: 'bloque', fiabilite: 20, poids: 1, dependances: ['CLO013','CLO014','CLO030'], remarque: 'Dépend de la clôture complète' }
];

// --- Audit Logs (démo) ---
export const AUDIT_LOGS = [
  { id: 'LOG001', type: 'connexion', utilisateur: 'USR003', date: '2025-03-28 08:12:34', detail: 'Connexion réussie', ip: '192.168.1.45' },
  { id: 'LOG002', type: 'connexion', utilisateur: 'USR004', date: '2025-03-28 08:15:02', detail: 'Connexion réussie', ip: '192.168.1.52' },
  { id: 'LOG003', type: 'validation', utilisateur: 'USR006', date: '2025-03-28 09:22:15', detail: 'Validation écriture HA-2025-03-0456', ip: '192.168.1.67' },
  { id: 'LOG004', type: 'correction', utilisateur: 'USR007', date: '2025-03-28 10:05:33', detail: 'Correction imputation 691500 → 681100', ip: '192.168.1.70' },
  { id: 'LOG005', type: 'export', utilisateur: 'USR003', date: '2025-03-28 11:30:00', detail: 'Export balance générale mars 2025', ip: '192.168.1.45' },
  { id: 'LOG006', type: 'connexion', utilisateur: 'USR007', date: '2025-03-28 07:45:12', detail: 'Connexion réussie', ip: '192.168.1.70' },
  { id: 'LOG007', type: 'connexion', utilisateur: 'USR009', date: '2025-03-28 08:30:45', detail: 'Connexion réussie', ip: '192.168.1.88' },
  { id: 'LOG008', type: 'validation', utilisateur: 'USR008', date: '2025-03-28 09:45:00', detail: 'Validation lot factures VE mars (8 pièces)', ip: '192.168.1.73' },
  { id: 'LOG009', type: 'correction', utilisateur: 'USR006', date: '2025-03-27 16:20:11', detail: 'Correction TVA INDEVCO 18% → 19,25%', ip: '192.168.1.67' },
  { id: 'LOG010', type: 'validation', utilisateur: 'USR004', date: '2025-03-27 14:10:22', detail: 'Validation rapprochement AFB EUR mars', ip: '192.168.1.52' },
  { id: 'LOG011', type: 'connexion', utilisateur: 'USR006', date: '2025-03-27 23:15:00', detail: 'Connexion réussie', ip: '192.168.1.67' },
  { id: 'LOG012', type: 'correction', utilisateur: 'USR011', date: '2025-03-27 11:35:44', detail: 'Annulation doublon CROWN Holdings HA-0405', ip: '192.168.1.92' },
  { id: 'LOG013', type: 'export', utilisateur: 'USR004', date: '2025-03-27 17:00:00', detail: 'Export grand livre mars — sections 4 et 5', ip: '192.168.1.52' },
  { id: 'LOG014', type: 'connexion', utilisateur: 'USR001', date: '2025-03-27 09:00:15', detail: 'Connexion réussie (admin)', ip: '192.168.1.10' },
  { id: 'LOG015', type: 'validation', utilisateur: 'USR003', date: '2025-03-26 15:45:30', detail: 'Validation provisions fiscales TVA février', ip: '192.168.1.45' },
  { id: 'LOG016', type: 'correction', utilisateur: 'USR007', date: '2025-03-26 10:12:00', detail: 'Réimputation charge 601→213 (immobilisation)', ip: '192.168.1.70' },
  { id: 'LOG017', type: 'export', utilisateur: 'USR003', date: '2025-03-26 16:30:00', detail: 'Export journaux HA+VE+BQ mars', ip: '192.168.1.45' },
  { id: 'LOG018', type: 'connexion', utilisateur: 'USR005', date: '2025-03-26 05:30:00', detail: 'Connexion réussie', ip: '10.0.0.55' }
];

// --- Documents comptables (50+ pièces) ---
export const DOCUMENTS = [
  { id: 'DOC001', type: 'FAC_FRN', reference: 'F-SAPPI-2025-0342', tiers: 'SAPPI', tiers_id: 'FRN001', date_doc: '2025-03-10', montant_ht: 23870000, montant_tva: 4595075, montant_ttc: 28465075, devise: 'FCFA', journal: 'HA', piece_x3: null, utilisateur_compta: null, date_compta: null, delai_jours: 18, statut: 'non_comptabilise', anomalies: ['Document non saisi > 15j'], reco_ia: 'Saisir en urgence — impact clôture' },
  { id: 'DOC002', type: 'FAC_FRN', reference: 'F-INDEV-2025-118', tiers: 'INDEVCO Group', tiers_id: 'FRN002', date_doc: '2025-03-12', montant_ht: 15200000, montant_tva: 2926000, montant_ttc: 18126000, devise: 'FCFA', journal: 'HA', piece_x3: 'HA-2025-03-0401', utilisateur_compta: 'USR007', date_compta: '2025-03-18', delai_jours: 6, statut: 'ecart', anomalies: ['TVA à 18% au lieu de 19,25%'], reco_ia: 'Corriger le taux TVA et passer l\'écart' },
  { id: 'DOC003', type: 'FAC_FRN', reference: 'F-SUNCH-2025-089', tiers: 'SUN Chemical', tiers_id: 'FRN003', date_doc: '2025-03-08', montant_ht: 33800000, montant_tva: 6506500, montant_ttc: 40306500, devise: 'FCFA', journal: 'HA', piece_x3: 'HA-2025-03-0389', utilisateur_compta: 'USR007', date_compta: '2025-03-14', delai_jours: 6, statut: 'conforme', anomalies: [], reco_ia: null },
  { id: 'DOC004', type: 'FAC_FRN', reference: 'F-TOTAL-2025-CM-4521', tiers: 'TOTAL Energies', tiers_id: 'FRN005', date_doc: '2025-03-15', montant_ht: 10738000, montant_tva: 2067065, montant_ttc: 12805065, devise: 'FCFA', journal: 'HA', piece_x3: 'HA-2025-03-0432', utilisateur_compta: 'USR007', date_compta: '2025-03-20', delai_jours: 5, statut: 'conforme', anomalies: [], reco_ia: null },
  { id: 'DOC005', type: 'FAC_FRN', reference: 'F-TOTAL-2025-CM-4523', tiers: 'TOTAL Energies', tiers_id: 'FRN005', date_doc: '2025-03-17', montant_ht: 10738000, montant_tva: 2067065, montant_ttc: 12805065, devise: 'FCFA', journal: 'HA', piece_x3: 'HA-2025-03-0445', utilisateur_compta: 'USR007', date_compta: '2025-03-22', delai_jours: 5, statut: 'critique', anomalies: ['Doublon probable — même montant TOTAL à 2j'], reco_ia: 'Vérifier si facture distincte ou doublon. Annuler si confirmé.' },
  { id: 'DOC006', type: 'FAC_FRN', reference: 'F-BOBST-2025-EU-771', tiers: 'BOBST SA', tiers_id: 'FRN004', date_doc: '2025-03-05', montant_ht: 45000000, montant_tva: 0, montant_ttc: 45000000, devise: 'EUR', journal: 'HA', piece_x3: 'HA-2025-03-0378', utilisateur_compta: 'USR007', date_compta: '2025-03-10', delai_jours: 5, statut: 'conforme', anomalies: [], reco_ia: null },
  { id: 'DOC007', type: 'FAC_FRN', reference: 'F-ENERCA-2025-03', tiers: 'ENERCA (AES SONEL)', tiers_id: 'FRN006', date_doc: '2025-03-20', montant_ht: 18500000, montant_tva: 3561250, montant_ttc: 22061250, devise: 'FCFA', journal: 'HA', piece_x3: null, utilisateur_compta: null, date_compta: null, delai_jours: 8, statut: 'non_comptabilise', anomalies: ['Document non saisi > 5j'], reco_ia: 'Saisir dans journal HA' },
  { id: 'DOC008', type: 'FAC_FRN', reference: 'F-CAMWA-2025-03', tiers: 'CAMWATER', tiers_id: 'FRN007', date_doc: '2025-03-22', montant_ht: 4200000, montant_tva: 808500, montant_ttc: 5008500, devise: 'FCFA', journal: 'HA', piece_x3: null, utilisateur_compta: null, date_compta: null, delai_jours: 6, statut: 'non_comptabilise', anomalies: [], reco_ia: 'Saisir dans journal HA' },
  { id: 'DOC009', type: 'FAC_FRN', reference: 'F-CROWN-2025-088', tiers: 'CROWN Holdings', tiers_id: 'FRN008', date_doc: '2025-03-11', montant_ht: 15840000, montant_tva: 3049200, montant_ttc: 18889200, devise: 'FCFA', journal: 'HA', piece_x3: 'HA-2025-03-0405', utilisateur_compta: 'USR011', date_compta: '2025-03-16', delai_jours: 5, statut: 'critique', anomalies: ['Doublon probable — même référence saisie 2x'], reco_ia: 'Annuler la seconde écriture' },
  { id: 'DOC010', type: 'FAC_FRN', reference: 'F-CROWN-2025-091', tiers: 'CROWN Holdings', tiers_id: 'FRN008', date_doc: '2025-03-18', montant_ht: 22400000, montant_tva: 4312000, montant_ttc: 26712000, devise: 'FCFA', journal: 'HA', piece_x3: 'HA-2025-03-0448', utilisateur_compta: 'USR011', date_compta: '2025-03-24', delai_jours: 6, statut: 'conforme', anomalies: [], reco_ia: null },
  { id: 'DOC011', type: 'FAC_CLI', reference: 'FC-2025-0182', tiers: 'SABC', tiers_id: 'CLI001', date_doc: '2025-03-05', montant_ht: 35000000, montant_tva: 6737500, montant_ttc: 41737500, devise: 'FCFA', journal: 'VE', piece_x3: 'VE-2025-03-0182', utilisateur_compta: 'USR008', date_compta: '2025-03-05', delai_jours: 0, statut: 'conforme', anomalies: [], reco_ia: null },
  { id: 'DOC012', type: 'FAC_CLI', reference: 'FC-2025-0183', tiers: 'Nestlé Cameroun', tiers_id: 'CLI005', date_doc: '2025-03-07', montant_ht: 62000000, montant_tva: 11935000, montant_ttc: 73935000, devise: 'FCFA', journal: 'VE', piece_x3: 'VE-2025-03-0183', utilisateur_compta: 'USR008', date_compta: '2025-03-07', delai_jours: 0, statut: 'conforme', anomalies: [], reco_ia: null },
  { id: 'DOC013', type: 'FAC_CLI', reference: 'FC-2025-0184', tiers: 'CHOCOCAM', tiers_id: 'CLI003', date_doc: '2025-03-10', montant_ht: 28000000, montant_tva: 5390000, montant_ttc: 33390000, devise: 'FCFA', journal: 'VE', piece_x3: 'VE-2025-03-0184', utilisateur_compta: 'USR008', date_compta: '2025-03-10', delai_jours: 0, statut: 'conforme', anomalies: [], reco_ia: null },
  { id: 'DOC014', type: 'FAC_CLI', reference: 'FC-2025-0185', tiers: 'GUINNESS', tiers_id: 'CLI006', date_doc: '2025-03-12', montant_ht: 18500000, montant_tva: 3561250, montant_ttc: 22061250, devise: 'FCFA', journal: 'VE', piece_x3: 'VE-2025-03-0185', utilisateur_compta: 'USR008', date_compta: '2025-03-12', delai_jours: 0, statut: 'conforme', anomalies: [], reco_ia: null },
  { id: 'DOC015', type: 'FAC_CLI', reference: 'FC-2025-0186', tiers: 'SOCAVER', tiers_id: 'CLI011', date_doc: '2025-03-14', montant_ht: 25000000, montant_tva: 4812500, montant_ttc: 29812500, devise: 'FCFA', journal: 'VE', piece_x3: 'VE-2025-03-0186', utilisateur_compta: 'USR008', date_compta: '2025-03-14', delai_jours: 0, statut: 'conforme', anomalies: [], reco_ia: null },
  { id: 'DOC016', type: 'FAC_CLI', reference: 'FC-2025-0188', tiers: 'CADYST Pharma', tiers_id: 'CLI008', date_doc: '2025-03-18', montant_ht: 12000000, montant_tva: 2310000, montant_ttc: 14310000, devise: 'FCFA', journal: 'VE', piece_x3: 'VE-2025-03-0188', utilisateur_compta: 'USR008', date_compta: '2025-03-18', delai_jours: 0, statut: 'ecart', anomalies: ['Rupture séquence — FC-0187 manquante'], reco_ia: 'Retrouver ou justifier FC-2025-0187' },
  { id: 'DOC017', type: 'REL_BQ', reference: 'REL-AFB-2025-03-28', tiers: 'Afriland First Bank', tiers_id: null, date_doc: '2025-03-28', montant_ht: 0, montant_tva: 0, montant_ttc: 187650000, devise: 'FCFA', journal: 'BQ1', piece_x3: null, utilisateur_compta: 'USR009', date_compta: '2025-03-28', delai_jours: 0, statut: 'conforme', anomalies: [], reco_ia: null },
  { id: 'DOC018', type: 'REL_BQ', reference: 'REL-BICEC-2025-03-28', tiers: 'BICEC', tiers_id: null, date_doc: '2025-03-28', montant_ht: 0, montant_tva: 0, montant_ttc: 95800000, devise: 'FCFA', journal: 'BQ3', piece_x3: null, utilisateur_compta: 'USR009', date_compta: '2025-03-28', delai_jours: 0, statut: 'ecart', anomalies: ['14 mouvements non rapprochés'], reco_ia: 'Finaliser le rapprochement BICEC avant clôture' },
  { id: 'DOC019', type: 'QUIT_FISC', reference: 'QF-TVA-2025-02', tiers: 'DGI Cameroun', tiers_id: null, date_doc: '2025-03-14', montant_ht: 46800000, montant_tva: 0, montant_ttc: 46800000, devise: 'FCFA', journal: 'OD', piece_x3: 'OD-2025-03-0105', utilisateur_compta: 'USR006', date_compta: '2025-03-15', delai_jours: 1, statut: 'conforme', anomalies: [], reco_ia: null },
  { id: 'DOC020', type: 'JUST_CHG', reference: 'JC-TRANSPORT-0312', tiers: 'EXPRESS UNION', tiers_id: 'FRN009', date_doc: '2025-03-12', montant_ht: 2800000, montant_tva: 539000, montant_ttc: 3339000, devise: 'FCFA', journal: 'HA', piece_x3: 'HA-2025-03-0410', utilisateur_compta: 'USR007', date_compta: '2025-03-15', delai_jours: 3, statut: 'conforme', anomalies: [], reco_ia: null },
  { id: 'DOC021', type: 'PC', reference: 'PC-2025-03-045', tiers: 'Caisse centrale', tiers_id: null, date_doc: '2025-03-20', montant_ht: 350000, montant_tva: 0, montant_ttc: 350000, devise: 'FCFA', journal: 'CA', piece_x3: 'CA-2025-03-0089', utilisateur_compta: 'USR009', date_compta: '2025-03-22', delai_jours: 2, statut: 'ecart', anomalies: ['Écriture sans libellé explicite'], reco_ia: 'Ajouter le libellé et la pièce justificative' },
  { id: 'DOC022', type: 'OD', reference: 'OD-PROV-2025-03-01', tiers: 'Interne', tiers_id: null, date_doc: '2025-03-25', montant_ht: 5000000, montant_tva: 0, montant_ttc: 5000000, devise: 'FCFA', journal: 'OD', piece_x3: 'OD-2025-03-0118', utilisateur_compta: 'USR006', date_compta: '2025-03-25', delai_jours: 0, statut: 'ecart', anomalies: ['OD sans justificatif', 'Montant rond suspect'], reco_ia: 'Demander justificatif complet avant clôture' },
  { id: 'DOC023', type: 'FAC_FRN', reference: 'F-CNPS-2025-03', tiers: 'CNPS', tiers_id: 'FRN010', date_doc: '2025-03-25', montant_ht: 28000000, montant_tva: 0, montant_ttc: 28000000, devise: 'FCFA', journal: 'SA', piece_x3: null, utilisateur_compta: null, date_compta: null, delai_jours: 3, statut: 'non_comptabilise', anomalies: [], reco_ia: 'Saisir dans journal SA avant clôture paie' },
  { id: 'DOC024', type: 'FAC_FRN', reference: 'F-SAPPI-2025-0351', tiers: 'SAPPI', tiers_id: 'FRN001', date_doc: '2025-03-20', montant_ht: 18200000, montant_tva: 3503500, montant_ttc: 21703500, devise: 'FCFA', journal: 'HA', piece_x3: null, utilisateur_compta: null, date_compta: null, delai_jours: 8, statut: 'non_comptabilise', anomalies: [], reco_ia: 'Saisir dans journal HA' },
  { id: 'DOC025', type: 'AV_DEB', reference: 'AD-SGC-2025-03-15', tiers: 'SG Cameroun', tiers_id: null, date_doc: '2025-03-15', montant_ht: 850000, montant_tva: 0, montant_ttc: 850000, devise: 'FCFA', journal: 'BQ4', piece_x3: null, utilisateur_compta: null, date_compta: null, delai_jours: 13, statut: 'non_comptabilise', anomalies: ['Document non saisi > 10j'], reco_ia: 'Comptabiliser les frais bancaires SG' },
  { id: 'DOC026', type: 'AV_CRE', reference: 'AC-AFB-2025-03-22', tiers: 'Afriland First Bank', tiers_id: null, date_doc: '2025-03-22', montant_ht: 35000000, montant_tva: 0, montant_ttc: 35000000, devise: 'FCFA', journal: 'BQ1', piece_x3: 'BQ1-2025-03-0098', utilisateur_compta: 'USR009', date_compta: '2025-03-23', delai_jours: 1, statut: 'conforme', anomalies: [], reco_ia: null },
  { id: 'DOC027', type: 'BRD_DOU', reference: 'BD-DLA-2025-03-088', tiers: 'Douanes Cameroun', tiers_id: null, date_doc: '2025-03-08', montant_ht: 8500000, montant_tva: 1636250, montant_ttc: 10136250, devise: 'FCFA', journal: 'HA', piece_x3: 'HA-2025-03-0392', utilisateur_compta: 'USR007', date_compta: '2025-03-12', delai_jours: 4, statut: 'conforme', anomalies: [], reco_ia: null },
  { id: 'DOC028', type: 'FAC_CLI', reference: 'FC-2025-0189', tiers: 'Nestlé Cameroun', tiers_id: 'CLI005', date_doc: '2025-03-20', montant_ht: 48000000, montant_tva: 9240000, montant_ttc: 57240000, devise: 'FCFA', journal: 'VE', piece_x3: 'VE-2025-03-0189', utilisateur_compta: 'USR008', date_compta: '2025-03-20', delai_jours: 0, statut: 'conforme', anomalies: [], reco_ia: null },
  { id: 'DOC029', type: 'PRV_REG', reference: 'PR-SABC-2025-03-15', tiers: 'SABC', tiers_id: 'CLI001', date_doc: '2025-03-15', montant_ht: 0, montant_tva: 0, montant_ttc: 35000000, devise: 'FCFA', journal: 'BQ1', piece_x3: 'BQ1-2025-03-0085', utilisateur_compta: 'USR009', date_compta: '2025-03-16', delai_jours: 1, statut: 'conforme', anomalies: [], reco_ia: null },
  { id: 'DOC030', type: 'FAC_FRN', reference: 'F-EXPUN-2025-DLA-122', tiers: 'EXPRESS UNION', tiers_id: 'FRN009', date_doc: '2025-03-22', montant_ht: 1500000, montant_tva: 288750, montant_ttc: 1788750, devise: 'FCFA', journal: 'HA', piece_x3: null, utilisateur_compta: null, date_compta: null, delai_jours: 6, statut: 'non_comptabilise', anomalies: [], reco_ia: 'Saisir dans journal HA — charge transport' }
];

// Types de documents (labels)
export const DOC_TYPE_LABELS = {
  'FAC_FRN': 'Facture fournisseur', 'FAC_CLI': 'Facture client', 'REL_BQ': 'Relevé bancaire',
  'AV_DEB': 'Avis de débit', 'AV_CRE': 'Avis de crédit', 'QUIT_FISC': 'Quittance fiscale',
  'BRD_DOU': 'Bordereau douanier', 'JUST_CHG': 'Justificatif charge', 'BL': 'Bon de livraison',
  'PC': 'Pièce de caisse', 'OD': 'Pièce d\'OD', 'PRV_REG': 'Preuve de règlement'
};

// --- Mouvements bancaires (pour rapprochement) ---
export const BANK_TRANSACTIONS = [
  // Afriland Principal - non rapprochés
  { id: 'MVT001', compte_id: 'CB001', date: '2025-03-25', libelle: 'VIR RECU CHOCOCAM', debit: 0, credit: 42000000, rapproche: true, suggestion_ia: null },
  { id: 'MVT002', compte_id: 'CB001', date: '2025-03-26', libelle: 'PRLVT CNPS MARS', debit: 14500000, credit: 0, rapproche: false, suggestion_ia: 'Charges sociales CNPS — imputer en 431/521' },
  { id: 'MVT003', compte_id: 'CB001', date: '2025-03-26', libelle: 'COM BANCAIRE MARS', debit: 320000, credit: 0, rapproche: false, suggestion_ia: 'Commission bancaire — imputer en 631/521' },
  { id: 'MVT004', compte_id: 'CB001', date: '2025-03-27', libelle: 'VIR EMIS SAPPI EUR', debit: 28500000, credit: 0, rapproche: true, suggestion_ia: null },
  { id: 'MVT005', compte_id: 'CB001', date: '2025-03-27', libelle: 'CHQ 0045672 ENCAISSE', debit: 0, credit: 8500000, rapproche: false, suggestion_ia: 'Acompte client probable — vérifier le tireur' },
  { id: 'MVT006', compte_id: 'CB001', date: '2025-03-28', libelle: 'PRLVT DGI TVA FEV', debit: 46800000, credit: 0, rapproche: true, suggestion_ia: null },
  { id: 'MVT007', compte_id: 'CB001', date: '2025-03-28', libelle: 'VIR RECU NESTLE', debit: 0, credit: 85000000, rapproche: true, suggestion_ia: null },
  { id: 'MVT008', compte_id: 'CB001', date: '2025-03-28', libelle: 'FRAIS TENUE CPT', debit: 150000, credit: 0, rapproche: false, suggestion_ia: 'Frais tenue de compte — imputer en 631/521' },
  { id: 'MVT009', compte_id: 'CB001', date: '2025-03-28', libelle: 'VIR INTERNE VERS UBA', debit: 25000000, credit: 0, rapproche: false, suggestion_ia: 'Virement interne — vérifier contre-partie UBA' },
  // BICEC - non rapprochés
  { id: 'MVT010', compte_id: 'CB003', date: '2025-03-20', libelle: 'VIR RECU SABC', debit: 0, credit: 35000000, rapproche: true, suggestion_ia: null },
  { id: 'MVT011', compte_id: 'CB003', date: '2025-03-22', libelle: 'CHQ 0089123 TOTAL', debit: 12805065, credit: 0, rapproche: true, suggestion_ia: null },
  { id: 'MVT012', compte_id: 'CB003', date: '2025-03-24', libelle: 'PRLVT ENEO MARS', debit: 8200000, credit: 0, rapproche: false, suggestion_ia: 'Facture ENERCA/ENEO — imputer en 605/521' },
  { id: 'MVT013', compte_id: 'CB003', date: '2025-03-25', libelle: 'VIR RECU GUINNESS', debit: 0, credit: 30000000, rapproche: true, suggestion_ia: null },
  { id: 'MVT014', compte_id: 'CB003', date: '2025-03-25', libelle: 'COM BICEC MARS', debit: 480000, credit: 0, rapproche: false, suggestion_ia: 'Commission bancaire — imputer en 631/521' },
  { id: 'MVT015', compte_id: 'CB003', date: '2025-03-26', libelle: 'VIR EMIS CROWN', debit: 18889200, credit: 0, rapproche: true, suggestion_ia: null },
  { id: 'MVT016', compte_id: 'CB003', date: '2025-03-27', libelle: 'REMISE CHQ DIVERS', debit: 0, credit: 5200000, rapproche: false, suggestion_ia: 'Remise chèques clients — identifier les tireurs' },
  { id: 'MVT017', compte_id: 'CB003', date: '2025-03-27', libelle: 'PRLVT CAMWATER', debit: 5008500, credit: 0, rapproche: false, suggestion_ia: 'Facture CAMWATER — imputer en 605/521' },
  { id: 'MVT018', compte_id: 'CB003', date: '2025-03-28', libelle: 'AGIOS T1 2025', debit: 2350000, credit: 0, rapproche: false, suggestion_ia: 'Agios bancaires — imputer en 671/521' },
  // SG Cameroun - non rapprochés
  { id: 'MVT019', compte_id: 'CB004', date: '2025-03-25', libelle: 'VIR RECU SOCAVER', debit: 0, credit: 25000000, rapproche: true, suggestion_ia: null },
  { id: 'MVT020', compte_id: 'CB004', date: '2025-03-26', libelle: 'PRLVT PATENTE 2025', debit: 12000000, credit: 0, rapproche: true, suggestion_ia: null },
  { id: 'MVT021', compte_id: 'CB004', date: '2025-03-27', libelle: 'VIR EMIS INDEVCO', debit: 18126000, credit: 0, rapproche: true, suggestion_ia: null },
  { id: 'MVT022', compte_id: 'CB004', date: '2025-03-27', libelle: 'COM SGC MARS', debit: 850000, credit: 0, rapproche: false, suggestion_ia: 'Commission bancaire SGC — imputer en 631/521' },
  { id: 'MVT023', compte_id: 'CB004', date: '2025-03-28', libelle: 'VIR SUSPECT RETOUR', debit: 0, credit: 1500000, rapproche: false, suggestion_ia: 'Virement retour — identifier l\'origine' },
  { id: 'MVT024', compte_id: 'CB004', date: '2025-03-28', libelle: 'FRAIS SWIFT', debit: 45000, credit: 0, rapproche: false, suggestion_ia: 'Frais SWIFT — imputer en 631/521' },
  // UBA - non rapprochés
  { id: 'MVT025', compte_id: 'CB005', date: '2025-03-24', libelle: 'VIR EMIS SUN CHEMICAL', debit: 40306500, credit: 0, rapproche: true, suggestion_ia: null },
  { id: 'MVT026', compte_id: 'CB005', date: '2025-03-25', libelle: 'VIR RECU DANGOTE', debit: 0, credit: 12000000, rapproche: true, suggestion_ia: null },
  { id: 'MVT027', compte_id: 'CB005', date: '2025-03-26', libelle: 'COM UBA MARS', debit: 450000, credit: 0, rapproche: false, suggestion_ia: 'Commission bancaire UBA — imputer en 631/521' },
  { id: 'MVT028', compte_id: 'CB005', date: '2025-03-27', libelle: 'VIR INTERNE DE AFB', debit: 0, credit: 25000000, rapproche: false, suggestion_ia: 'Virement interne — vérifier contre-partie AFB' },
  { id: 'MVT029', compte_id: 'CB005', date: '2025-03-28', libelle: 'PRLVT ASSURANCE', debit: 3200000, credit: 0, rapproche: false, suggestion_ia: 'Prime assurance — imputer en 625/521' },
  { id: 'MVT030', compte_id: 'CB005', date: '2025-03-28', libelle: 'FRAIS TENUE CPT UBA', debit: 125000, credit: 0, rapproche: false, suggestion_ia: 'Frais tenue compte — imputer en 631/521' }
];

// --- Échéancier clients (factures avec dates échéances) ---
export const ECHEANCIER_CLIENTS = [
  { id: 'ECH001', client_id: 'CLI001', facture: 'FC-2025-0142', date_facture: '2025-01-15', date_echeance: '2025-02-14', montant: 25000000, retard: 42, statut: 'echue', promesse: '2025-04-05', action: 'Relance niveau 1' },
  { id: 'ECH002', client_id: 'CLI001', facture: 'FC-2025-0168', date_facture: '2025-02-20', date_echeance: '2025-03-22', montant: 20000000, retard: 6, statut: 'echue', promesse: null, action: 'Rappel courtois' },
  { id: 'ECH003', client_id: 'CLI001', facture: 'FC-2025-0182', date_facture: '2025-03-05', date_echeance: '2025-04-04', montant: 41737500, retard: 0, statut: 'a_echoir', promesse: null, action: '—' },
  { id: 'ECH004', client_id: 'CLI002', facture: 'FC-2025-0135', date_facture: '2025-01-08', date_echeance: '2025-02-07', montant: 22000000, retard: 49, statut: 'echue', promesse: '2025-03-15', action: 'Mise en demeure envoyée' },
  { id: 'ECH005', client_id: 'CLI002', facture: 'FC-2025-0156', date_facture: '2025-02-10', date_echeance: '2025-03-12', montant: 16000000, retard: 16, statut: 'echue', promesse: null, action: 'Relance formelle' },
  { id: 'ECH006', client_id: 'CLI002', facture: 'FC-2025-0180', date_facture: '2025-03-03', date_echeance: '2025-04-02', montant: 40000000, retard: 0, statut: 'a_echoir', promesse: null, action: '—' },
  { id: 'ECH007', client_id: 'CLI004', facture: 'FC-2024-0890', date_facture: '2024-11-20', date_echeance: '2024-12-20', montant: 28000000, retard: 98, statut: 'echue', promesse: null, action: 'Contentieux' },
  { id: 'ECH008', client_id: 'CLI004', facture: 'FC-2025-0145', date_facture: '2025-01-18', date_echeance: '2025-02-17', montant: 28000000, retard: 39, statut: 'echue', promesse: null, action: 'Contentieux' },
  { id: 'ECH009', client_id: 'CLI005', facture: 'FC-2025-0183', date_facture: '2025-03-07', date_echeance: '2025-05-06', montant: 73935000, retard: 0, statut: 'a_echoir', promesse: null, action: '—' },
  { id: 'ECH010', client_id: 'CLI005', facture: 'FC-2025-0170', date_facture: '2025-02-22', date_echeance: '2025-04-23', montant: 55000000, retard: 0, statut: 'a_echoir', promesse: null, action: '—' },
  { id: 'ECH011', client_id: 'CLI006', facture: 'FC-2025-0160', date_facture: '2025-02-14', date_echeance: '2025-03-16', montant: 28000000, retard: 12, statut: 'echue', promesse: '2025-04-02', action: 'Rappel courtois' },
  { id: 'ECH012', client_id: 'CLI007', facture: 'FC-2025-0128', date_facture: '2024-12-28', date_echeance: '2025-01-27', montant: 22000000, retard: 60, statut: 'echue', promesse: null, action: 'Livraisons suspendues' },
  { id: 'ECH013', client_id: 'CLI007', facture: 'FC-2025-0152', date_facture: '2025-02-05', date_echeance: '2025-03-07', montant: 20000000, retard: 21, statut: 'echue', promesse: null, action: 'Livraisons suspendues' },
  { id: 'ECH014', client_id: 'CLI009', facture: 'FC-2025-0162', date_facture: '2025-02-15', date_echeance: '2025-03-17', montant: 15000000, retard: 11, statut: 'echue', promesse: '2025-04-10', action: 'Relance formelle' },
  { id: 'ECH015', client_id: 'CLI012', facture: 'FC-2025-0130', date_facture: '2025-01-05', date_echeance: '2025-02-04', montant: 18000000, retard: 52, statut: 'echue', promesse: null, action: 'Mise en demeure' },
  { id: 'ECH016', client_id: 'CLI012', facture: 'FC-2025-0155', date_facture: '2025-02-08', date_echeance: '2025-03-10', montant: 14000000, retard: 18, statut: 'echue', promesse: null, action: 'Relance formelle' },
  { id: 'ECH017', client_id: 'CLI015', facture: 'FC-2024-0845', date_facture: '2024-10-15', date_echeance: '2024-11-14', montant: 5000000, retard: 134, statut: 'echue', promesse: null, action: 'Contentieux — huissier saisi' },
  { id: 'ECH018', client_id: 'CLI015', facture: 'FC-2024-0878', date_facture: '2024-11-10', date_echeance: '2024-12-10', montant: 3000000, retard: 108, statut: 'echue', promesse: null, action: 'Contentieux' },
  { id: 'ECH019', client_id: 'CLI011', facture: 'FC-2025-0175', date_facture: '2025-02-28', date_echeance: '2025-04-14', montant: 29812500, retard: 0, statut: 'a_echoir', promesse: null, action: '—' },
  { id: 'ECH020', client_id: 'CLI014', facture: 'FC-2025-0164', date_facture: '2025-02-18', date_echeance: '2025-03-20', montant: 10000000, retard: 8, statut: 'echue', promesse: '2025-04-05', action: 'Relance formelle' }
];

// --- Historique des relances ---
export const RELANCE_HISTORY = [
  { id: 'REL001', client_id: 'CLI001', date: '2025-03-18', niveau: 1, canal: 'Email', resultat: 'Promesse 05/04', responsable: 'USR008' },
  { id: 'REL002', client_id: 'CLI002', date: '2025-03-10', niveau: 2, canal: 'Email', resultat: 'Pas de réponse', responsable: 'USR008' },
  { id: 'REL003', client_id: 'CLI002', date: '2025-03-20', niveau: 3, canal: 'Courrier AR', resultat: 'Mise en demeure envoyée', responsable: 'USR008' },
  { id: 'REL004', client_id: 'CLI004', date: '2025-02-15', niveau: 3, canal: 'Courrier AR', resultat: 'Pas de réponse', responsable: 'USR008' },
  { id: 'REL005', client_id: 'CLI004', date: '2025-03-05', niveau: 4, canal: 'Visite terrain', resultat: 'Livraisons suspendues', responsable: 'USR008' },
  { id: 'REL006', client_id: 'CLI006', date: '2025-03-22', niveau: 1, canal: 'Téléphone', resultat: 'Promesse 02/04', responsable: 'USR008' },
  { id: 'REL007', client_id: 'CLI007', date: '2025-02-20', niveau: 3, canal: 'Courrier AR', resultat: 'Rejet', responsable: 'USR008' },
  { id: 'REL008', client_id: 'CLI007', date: '2025-03-10', niveau: 4, canal: 'DG à DG', resultat: 'Blocage confirmé', responsable: 'USR003' },
  { id: 'REL009', client_id: 'CLI009', date: '2025-03-15', niveau: 2, canal: 'Email', resultat: 'Promesse 10/04', responsable: 'USR008' },
  { id: 'REL010', client_id: 'CLI012', date: '2025-03-05', niveau: 2, canal: 'Email', resultat: 'Pas de réponse', responsable: 'USR008' },
  { id: 'REL011', client_id: 'CLI012', date: '2025-03-18', niveau: 3, canal: 'Courrier AR', resultat: 'Mise en demeure', responsable: 'USR008' },
  { id: 'REL012', client_id: 'CLI014', date: '2025-03-22', niveau: 2, canal: 'Téléphone', resultat: 'Promesse 05/04', responsable: 'USR008' },
  { id: 'REL013', client_id: 'CLI015', date: '2025-01-15', niveau: 4, canal: 'Courrier AR', resultat: 'Huissier saisi', responsable: 'USR003' },
  { id: 'REL014', client_id: 'CLI015', date: '2025-02-20', niveau: 5, canal: 'Juridique', resultat: 'Procédure en cours', responsable: 'USR003' },
  { id: 'REL015', client_id: 'CLI011', date: '2025-03-20', niveau: 1, canal: 'Email', resultat: 'Rappel envoyé', responsable: 'USR008' }
];

// Niveaux de relance (référentiel)
export const NIVEAUX_RELANCE = [
  { niveau: 0, label: 'Aucune relance', delai: '—', ton: '—', action: '—' },
  { niveau: 1, label: 'Rappel courtois', delai: 'J+7', ton: 'Amical', action: 'Email de rappel' },
  { niveau: 2, label: 'Relance formelle', delai: 'J+15', ton: 'Ferme', action: 'Email/téléphone formel' },
  { niveau: 3, label: 'Mise en demeure', delai: 'J+30', ton: 'Officiel', action: 'Courrier recommandé AR' },
  { niveau: 4, label: 'Suspension livraisons', delai: 'J+45', ton: 'Directif', action: 'Blocage client + visite' },
  { niveau: 5, label: 'Contentieux', delai: 'J+60+', ton: 'Juridique', action: 'Huissier / avocat' }
];

// --- Détail prévisions trésorerie (lignes détaillées S+1 à S+4) ---
export const TREASURY_DETAIL = [
  { semaine: 'S14', ligne: 'Clients — factures échues', type: 'encaissement', montant: 65000000 },
  { semaine: 'S14', ligne: 'Clients — promesses paiement', type: 'encaissement', montant: 45000000 },
  { semaine: 'S14', ligne: 'Autres encaissements', type: 'encaissement', montant: 15000000 },
  { semaine: 'S14', ligne: 'Fournisseurs — échéances', type: 'decaissement', montant: 68000000 },
  { semaine: 'S14', ligne: 'Salaires & charges sociales', type: 'decaissement', montant: 52000000 },
  { semaine: 'S14', ligne: 'Autres décaissements', type: 'decaissement', montant: 28000000 },
  { semaine: 'S15', ligne: 'Clients — factures échues', type: 'encaissement', montant: 40000000 },
  { semaine: 'S15', ligne: 'Clients — promesses paiement', type: 'encaissement', montant: 35000000 },
  { semaine: 'S15', ligne: 'Autres encaissements', type: 'encaissement', montant: 20000000 },
  { semaine: 'S15', ligne: 'Fournisseurs — échéances', type: 'decaissement', montant: 55000000 },
  { semaine: 'S15', ligne: 'Impôts & taxes (TVA/DIPE/AIS)', type: 'decaissement', montant: 95000000 },
  { semaine: 'S15', ligne: 'Remboursement emprunt', type: 'decaissement', montant: 18000000 },
  { semaine: 'S15', ligne: 'Autres décaissements', type: 'decaissement', montant: 17000000 },
  { semaine: 'S16', ligne: 'Clients — factures échues', type: 'encaissement', montant: 80000000 },
  { semaine: 'S16', ligne: 'Clients — promesses paiement', type: 'encaissement', montant: 40000000 },
  { semaine: 'S16', ligne: 'Autres encaissements', type: 'encaissement', montant: 20000000 },
  { semaine: 'S16', ligne: 'Fournisseurs — échéances', type: 'decaissement', montant: 72000000 },
  { semaine: 'S16', ligne: 'Salaires intérimaires', type: 'decaissement', montant: 12000000 },
  { semaine: 'S16', ligne: 'Autres décaissements', type: 'decaissement', montant: 28000000 },
  { semaine: 'S17', ligne: 'Clients — factures échues', type: 'encaissement', montant: 55000000 },
  { semaine: 'S17', ligne: 'Clients — promesses paiement', type: 'encaissement', montant: 35000000 },
  { semaine: 'S17', ligne: 'Autres encaissements', type: 'encaissement', montant: 20000000 },
  { semaine: 'S17', ligne: 'Fournisseurs — échéances', type: 'decaissement', montant: 62000000 },
  { semaine: 'S17', ligne: 'Autres décaissements', type: 'decaissement', montant: 36000000 }
];

// --- Configuration IA ---
export const AI_CONFIG = {
  api_key: '',
  model: 'claude-sonnet-4-20250514',
  temperature: 0.3,
  max_tokens: 2048
};

// --- Données mensuelles CA/Charges (Jan-Mars 2025) ---
export const MONTHLY_DATA = [
  { mois: 'Jan', ca: 365000000, charges: 302000000, resultat: 63000000, tresorerie: 540000000 },
  { mois: 'Fév', ca: 398000000, charges: 328000000, resultat: 70000000, tresorerie: 505000000 },
  { mois: 'Mars', ca: 0, charges: 0, resultat: 0, tresorerie: 0 } // calculé dynamiquement
];

// --- Prévisions trésorerie hebdomadaires ---
export const TREASURY_FORECAST = [
  { semaine: 'S14', label: '31/03-06/04', encaissements: 125000000, decaissements: 148000000, solde_ouverture: 519950000, tension: 0 },
  { semaine: 'S15', label: '07/04-13/04', encaissements: 95000000, decaissements: 185000000, solde_ouverture: 0, tension: 45 },
  { semaine: 'S16', label: '14/04-20/04', encaissements: 140000000, decaissements: 112000000, solde_ouverture: 0, tension: 15 },
  { semaine: 'S17', label: '21/04-27/04', encaissements: 110000000, decaissements: 98000000, solde_ouverture: 0, tension: 0 }
];

// --- Profils de risque utilisateurs (scores calculés) ---
export const USER_RISK_PROFILES = [];

// --- Historique anomalies par mois (pour sparklines) ---
export const ANOMALIES_MONTHLY = [
  { mois: 'Oct', count: 12 },
  { mois: 'Nov', count: 18 },
  { mois: 'Déc', count: 15 },
  { mois: 'Jan', count: 22 },
  { mois: 'Fév', count: 19 },
  { mois: 'Mars', count: 25 }
];

// --- Taux de saisie et rapprochement ---
export const OPERATION_STATS = {
  docs_scannes: 58,
  docs_non_comptabilises: 7,
  taux_saisie: 87.9,
  taux_rapprochement: 0, // calculé
  nb_ecritures_mois: 342,
  nb_ecritures_validees: 298
};

// Initialiser les données dynamiques

// --- État de l'application ---

/* ============================================================
   SECTION BUSINESS LOGIC — Règles, scoring, calculs
   ============================================================ */

// Score readiness clôture

// Score readiness DSF

// Score conformité

// Compteur anomalies par gravité

// Total trésorerie

// Total CA

// Total charges

// Résultat net

// Total créances échues
