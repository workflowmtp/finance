import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Modules de l'application
const PERMISSIONS_MODULES = [
  { id: 'dashboard', label: 'Dashboard', actions: ['lecture'] },
  { id: 'documents', label: 'Documents', actions: ['lecture', 'saisie', 'modification', 'validation', 'export'] },
  { id: 'banque', label: 'Banque', actions: ['lecture', 'saisie', 'modification', 'validation', 'correction', 'export'] },
  { id: 'tresorerie', label: 'Trésorerie', actions: ['lecture', 'saisie', 'modification', 'validation', 'export'] },
  { id: 'recouvrement', label: 'Recouvrement', actions: ['lecture', 'saisie', 'modification', 'validation', 'export'] },
  { id: 'audit', label: 'Audit', actions: ['lecture', 'saisie', 'modification', 'validation', 'export'] },
  { id: 'fiscalite', label: 'Fiscalité', actions: ['lecture', 'saisie', 'modification', 'validation', 'export'] },
  { id: 'analytique', label: 'Analytique', actions: ['lecture', 'saisie', 'modification', 'validation', 'export'] },
  { id: 'clotures', label: 'Clôtures', actions: ['lecture', 'saisie', 'modification', 'validation', 'cloture', 'export'] },
  { id: 'dsf', label: 'DSF', actions: ['lecture', 'saisie', 'modification', 'validation', 'export'] },
  { id: 'agent_ia', label: 'Agent IA', actions: ['lecture', 'acces_ia'] },
  { id: 'historique', label: 'Historique', actions: ['lecture', 'historique', 'export'] },
  { id: 'parametrage', label: 'Paramétrage', actions: ['lecture', 'parametrage'] },
];

// Rôles système
const SYSTEM_ROLES = [
  { code: 'ADMIN', label: 'Administrateur', niveau: 'Système' },
  { code: 'DG', label: 'Directeur Général', niveau: 'Direction' },
  { code: 'DAF', label: 'Directeur Administratif & Financier', niveau: 'Direction' },
  { code: 'CHEF_CPTA', label: 'Chef Comptable', niveau: 'Supervision' },
  { code: 'CDG', label: 'Contrôleur de Gestion', niveau: 'Supervision' },
  { code: 'CPTA_GEN', label: 'Comptable Général', niveau: 'Opérationnel' },
  { code: 'CPTA_ACH', label: 'Comptable Achats', niveau: 'Opérationnel' },
  { code: 'CPTA_CLI', label: 'Comptable Clients', niveau: 'Opérationnel' },
  { code: 'TRES', label: 'Trésorier', niveau: 'Opérationnel' },
  { code: 'AUDIT', label: 'Auditeur Interne', niveau: 'Transversal' },
];

// Permissions par rôle
const ROLE_PERMISSIONS_MAP: Record<string, string[]> = {
  'ADMIN': [], // Toutes les permissions
  'DG': ['dashboard:lecture', 'documents:lecture', 'banque:lecture', 'tresorerie:lecture', 'recouvrement:lecture', 
         'audit:lecture', 'fiscalite:lecture', 'analytique:lecture', 'clotures:lecture', 'clotures:validation', 'clotures:cloture',
         'dsf:lecture', 'dsf:validation', 'agent_ia:lecture', 'agent_ia:acces_ia', 'historique:lecture', 'historique:historique'],
  'DAF': [], // Toutes les permissions
  'CHEF_CPTA': [], // Toutes sauf paramétrage
  'CDG': ['dashboard:lecture', 'documents:lecture', 'banque:lecture', 'tresorerie:lecture', 'recouvrement:lecture',
          'audit:lecture', 'fiscalite:lecture', 'analytique:lecture', 'clotures:lecture', 'dsf:lecture', 
          'agent_ia:lecture', 'agent_ia:acces_ia', 'historique:lecture', 'historique:historique', 'historique:export'],
  'CPTA_GEN': ['dashboard:lecture', 'documents:lecture', 'documents:saisie', 'documents:modification', 'documents:export',
               'banque:lecture', 'banque:saisie', 'banque:modification', 'tresorerie:lecture', 'audit:lecture',
               'fiscalite:lecture', 'analytique:lecture', 'clotures:lecture', 'clotures:saisie', 'clotures:modification',
               'agent_ia:lecture', 'agent_ia:acces_ia', 'historique:lecture', 'historique:export'],
  'CPTA_ACH': ['dashboard:lecture', 'documents:lecture', 'documents:saisie', 'documents:modification', 'documents:export',
               'banque:lecture', 'banque:saisie', 'audit:lecture', 'agent_ia:lecture', 'agent_ia:acces_ia', 'historique:lecture'],
  'CPTA_CLI': ['dashboard:lecture', 'documents:lecture', 'documents:saisie', 'documents:modification', 'documents:export',
               'recouvrement:lecture', 'recouvrement:saisie', 'audit:lecture', 'agent_ia:lecture', 'agent_ia:acces_ia', 'historique:lecture'],
  'TRES': ['dashboard:lecture', 'banque:lecture', 'banque:saisie', 'banque:modification', 'tresorerie:lecture', 
           'tresorerie:saisie', 'tresorerie:modification', 'tresorerie:validation', 'recouvrement:lecture',
           'agent_ia:lecture', 'agent_ia:acces_ia', 'historique:lecture', 'historique:export'],
  'AUDIT': ['dashboard:lecture', 'documents:lecture', 'banque:lecture', 'tresorerie:lecture', 'recouvrement:lecture',
            'audit:lecture', 'audit:saisie', 'fiscalite:lecture', 'analytique:lecture', 'clotures:lecture', 'dsf:lecture',
            'agent_ia:lecture', 'agent_ia:acces_ia', 'historique:lecture', 'historique:historique', 'historique:export'],
};

async function main() {
  console.log('Seed des permissions...');

  // 1. Créer toutes les permissions
  console.log('Création des permissions...');
  const allPermissions: string[] = [];
  
  for (const module of PERMISSIONS_MODULES) {
    for (const action of module.actions) {
      const permId = `${module.id}:${action}`;
      allPermissions.push(permId);
      
      await prisma.permission.upsert({
        where: { module_action: { module: module.id, action } },
        update: {
          label: `${module.label} - ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        },
        create: {
          module: module.id,
          action,
          label: `${module.label} - ${action.charAt(0).toUpperCase() + action.slice(1)}`,
          description: `Permission ${action} pour le module ${module.label}`,
        },
      });
    }
  }
  console.log(`${allPermissions.length} permissions créées`);

  // 2. Créer les rôles système
  console.log('Création des rôles système...');
  for (const role of SYSTEM_ROLES) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {
        label: role.label,
        niveau: role.niveau,
        isSystem: true,
      },
      create: {
        code: role.code,
        label: role.label,
        niveau: role.niveau,
        isSystem: true,
      },
    });
  }
  console.log(`${SYSTEM_ROLES.length} rôles créés`);

  // 3. Assigner les permissions aux rôles
  console.log('Assignation des permissions aux rôles...');
  for (const [roleCode, permissions] of Object.entries(ROLE_PERMISSIONS_MAP)) {
    // ADMIN et DAF ont toutes les permissions
    const permsToAssign = permissions.length === 0 ? allPermissions : permissions;
    
    for (const perm of permsToAssign) {
      const [module, action] = perm.split(':');
      
      const permission = await prisma.permission.findFirst({
        where: { module, action },
      });
      
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleCode_permissionId: {
              roleCode,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleCode,
            permissionId: permission.id,
          },
        });
      }
    }
    console.log(`  ${roleCode}: ${permsToAssign.length} permissions`);
  }

  console.log('Seed terminé !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
