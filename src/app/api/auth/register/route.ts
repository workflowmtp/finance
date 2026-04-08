import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { nom, identifiant, email, motDePasse } = await req.json();

    if (!nom || !identifiant || !email || !motDePasse) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }

    // Vérifier si l'identifiant existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { identifiant },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Cet identifiant est déjà utilisé.' }, { status: 400 });
    }

    // Vérifier si l'email existe déjà
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 400 });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Créer l'utilisateur avec le rôle par défaut "CPTA_GEN"
    const user = await prisma.user.create({
      data: {
        nom,
        identifiant,
        email,
        motDePasse: hashedPassword,
        roleCode: 'CPTA_GEN', // Rôle par défaut pour les nouveaux utilisateurs
        actif: true,
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de l\'inscription.' }, { status: 500 });
  }
}
