const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Création des utilisateurs par défaut...');

  const users = [
    { nom: 'Administrateur', identifiant: 'admin', email: 'admin@multiprint.com', motDePasse: 'Admin@1234', roleCode: 'ADMIN' },
    { nom: 'Directeur Général', identifiant: 'dg', email: 'dg@multiprint.com', motDePasse: 'Dg@1234', roleCode: 'DG' },
    { nom: 'Directeur Administratif & Financier', identifiant: 'daf', email: 'daf@multiprint.com', motDePasse: 'Daf@1234', roleCode: 'DAF' },
    { nom: 'Chef Comptable', identifiant: 'chef', email: 'chef@multiprint.com', motDePasse: 'Chef@1234', roleCode: 'CHEF_CPTA' },
    { nom: 'Contrôleur de Gestion', identifiant: 'cdg', email: 'cdg@multiprint.com', motDePasse: 'Cdg@1234', roleCode: 'CDG' },
    { nom: 'Comptable Général', identifiant: 'cpta', email: 'cpta@multiprint.com', motDePasse: 'Cpta@1234', roleCode: 'CPTA_GEN' },
    { nom: 'Trésorier', identifiant: 'tres', email: 'tres@multiprint.com', motDePasse: 'Tres@1234', roleCode: 'TRES' },
    { nom: 'Auditeur Interne', identifiant: 'audit', email: 'audit@multiprint.com', motDePasse: 'Audit@1234', roleCode: 'AUDIT' },
  ];

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.motDePasse, 10);
    
    await prisma.user.upsert({
      where: { identifiant: u.identifiant },
      update: {
        nom: u.nom,
        email: u.email,
        motDePasse: hashedPassword,
        roleCode: u.roleCode,
        actif: true,
      },
      create: {
        nom: u.nom,
        identifiant: u.identifiant,
        email: u.email,
        motDePasse: hashedPassword,
        roleCode: u.roleCode,
        actif: true,
      },
    });
    console.log(`  Utilisateur créé: ${u.identifiant} (${u.roleCode})`);
  }

  console.log('\nTerminé ! Les utilisateurs peuvent se connecter avec leur identifiant et mot de passe.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
