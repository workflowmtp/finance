import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        motDePasse: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.motDePasse) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true },
        });

        if (!user || !user.actif) return null;

        const isValid = await bcrypt.compare(credentials.motDePasse, user.motDePasse);
        if (!isValid) return null;

        // Log connexion
        await prisma.auditLog.create({
          data: {
            type: 'connexion',
            utilisateurId: user.id,
            detail: 'Connexion réussie',
            ip: '0.0.0.0',
          },
        });

        return {
          id: user.id,
          name: user.nom,
          email: user.email,
          role: user.roleCode,
          roleLabel: user.role.label,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.roleLabel = (user as any).roleLabel;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).roleLabel = token.roleLabel;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 heures
  },
  secret: process.env.NEXTAUTH_SECRET,
};
