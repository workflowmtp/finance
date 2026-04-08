# Déploiement Vercel - FinanceAdvisor

## Région de déploiement
L'application est configurée pour être déployée sur la région **Paris (cdg1)** via `vercel.json`.

## Variables d'environnement requises

Configurez ces variables dans le dashboard Vercel :

### Base de données
```
DATABASE_URL=postgresql://admin:Admin%401234@72.62.238.199:5432/financeadvisor?schema=public
```

### Authentification
```
NEXTAUTH_URL=https://votre-domaine.vercel.app
NEXTAUTH_SECRET=générez-une-clé-secrète-longue-et-complexe
```

### Agent IA (n8n Webhook)
```
N8N_WEBHOOK_URL=https://n8n.mtb-app.com/webhook/e50bf257-1061-478d-9b5a-3c67d4e7856b
N8N_WEBHOOK_USER=multiprint
N8N_WEBHOOK_PASSWORD=Admin@1234
```

### Application
```
NEXT_PUBLIC_APP_NAME=FinanceAdvisor
NEXT_PUBLIC_APP_VERSION=4.0.0
NEXT_PUBLIC_COMPANY=MULTIPRINT S.A.
NEXT_PUBLIC_CURRENCY=FCFA
NEXT_PUBLIC_TVA_RATE=19.25
```

## Commandes de déploiement

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer en preview
vercel

# Déployer en production
vercel --prod
```

## Optimisations incluses

1. **Région Paris (cdg1)** - Latence minimale pour la France
2. **Connection pooling Prisma** - Optimisé pour serverless
3. **Imports dynamiques** - Recharts chargé à la demande
4. **Cache headers** - Assets statiques en cache (1 an)
5. **Images optimisées** - AVIF/WebP automatiques

## Base de données

La base PostgreSQL est hébergée sur `72.62.238.199:5432`.

Pour les migrations :
```bash
npx prisma db push
```

Pour le seed des permissions :
```bash
npx prisma db seed
```

## Sécurité

- Headers de sécurité configurés (X-Frame-Options, X-Content-Type-Options, etc.)
- Authentification NextAuth
- Variables sensibles côté serveur uniquement
