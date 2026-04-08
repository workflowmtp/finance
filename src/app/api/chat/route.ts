import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // n8n Webhook configuration
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const webhookUser = process.env.N8N_WEBHOOK_USER;
    const webhookPassword = process.env.N8N_WEBHOOK_PASSWORD;

    if (!webhookUrl) {
      // Mode local - retourner une réponse générée localement
      const localResponse = generateLocalResponse(messages);
      return NextResponse.json({ text: localResponse, mode: 'local' });
    }

    // Build system prompt with live data (fallback si Prisma échoue)
    let systemPrompt = '';
    try {
      systemPrompt = await buildSystemPrompt();
    } catch (dbError) {
      console.error('Erreur buildSystemPrompt (Prisma):', dbError);
      systemPrompt = buildFallbackSystemPrompt();
    }

    // Prepare Basic Auth header
    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (webhookUser && webhookPassword) {
      const credentials = Buffer.from(`${webhookUser}:${webhookPassword}`).toString('base64');
      authHeaders['Authorization'] = `Basic ${credentials}`;
    }

    // Call n8n webhook
    console.log('Appel n8n webhook:', webhookUrl);
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        system: systemPrompt,
        messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
      }),
    });

    console.log('Réponse n8n status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur webhook:', response.status, errorText);
      // Afficher l'erreur n8n a l'utilisateur
      let errorMsg = '';
      try {
        const errData = JSON.parse(errorText);
        errorMsg = errData.message || errData.error || errorText;
      } catch {
        errorMsg = errorText;
      }
      return NextResponse.json({ text: `**Erreur n8n (${response.status})** \u26A0\uFE0F\n\n${errorMsg}\n\nV\u00E9rifiez votre workflow n8n et r\u00E9essayez.`, mode: 'n8n-error' });
    }

    // Parse la réponse n8n
    const responseText = await response.text();
    console.log('Réponse n8n brute:', responseText.substring(0, 200));
    
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      // Si la réponse n'est pas du JSON, c'est peut-être du texte brut
      if (responseText.trim()) {
        return NextResponse.json({ text: responseText });
      }
      const localResponse = generateLocalResponse(messages);
      return NextResponse.json({ text: localResponse, mode: 'local' });
    }

    // Handle n8n response - gérer plusieurs formats possibles
    // Format 1: { text: "..." } ou { response: "..." } ou { message: "..." }
    if (data.text || data.response || data.message) {
      return NextResponse.json({ text: data.text || data.response || data.message });
    }

    // Format 2: { output: "..." } (n8n AI Agent)
    if (data.output) {
      return NextResponse.json({ text: data.output });
    }

    // Format 3: { content: [{ type: "text", text: "..." }] } (format Anthropic)
    if (data.content && Array.isArray(data.content)) {
      const text = data.content
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('');
      if (text) return NextResponse.json({ text });
    }

    // Format 4: tableau de résultats n8n [{ "output": "..." }]
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      const text = first.text || first.response || first.message || first.output || JSON.stringify(first);
      return NextResponse.json({ text });
    }

    // Dernier recours - retourner le JSON brut
    console.warn('Format de réponse n8n non reconnu:', JSON.stringify(data).substring(0, 200));
    return NextResponse.json({ text: JSON.stringify(data), mode: 'local' });
  } catch (error: any) {
    console.error('Erreur API chat:', error);
    // En cas d'erreur, retourner un fallback local au lieu d'une erreur 500
    try {
      const { messages } = await req.clone().json();
      const localResponse = generateLocalResponse(messages);
      return NextResponse.json({ text: localResponse, mode: 'local' });
    } catch {
      return NextResponse.json({ text: 'Désolé, une erreur est survenue. Veuillez réessayer.', mode: 'local' });
    }
  }
}

function buildFallbackSystemPrompt(): string {
  return `Tu es FinanceAdvisor, agent IA expert en comptabilité, finance et audit pour MULTIPRINT S.A. (Douala, Cameroun).
Référentiel : OHADA / SYSCOHADA révisé. Monnaie : FCFA (XAF), TVA : 19,25%.
4 pôles : Offset Étiquette, Héliogravure Flexible, Offset Carton, Bouchon Couronne.
ERP : Sage X3 — Exercice 2025, mois : Mars.

Réponds en français, de manière professionnelle et orientée action.`;
}

// Génération de réponse locale en cas d'absence de webhook
function generateLocalResponse(messages: any[]): string {
  const lastMessage = messages.filter(m => m.role === 'user').pop();
  const question = lastMessage?.content?.toLowerCase() || '';
  
  const prefix = '**FinanceAdvisor** — ';
  
  if (question.includes('anomal') || question.includes('critique')) {
    return `${prefix}Il y a actuellement **3 anomalies critiques** ouvertes.\n\nPriorités :\n• SAPPI : 18 jours de retard\n• Compte 470000 : 45 jours non lettré\n• Rupture séquence VE\n\nImpact estimé : 125M FCFA. Je recommande de traiter SAPPI en priorité.`;
  }
  if (question.includes('trésor') || question.includes('treso') || question.includes('flash')) {
    return `${prefix}Position de trésorerie : **245M FCFA**.\n\nTension S15 (07-13 avril) :\n• Décaissements impôts + salaires : 180M FCFA\n• Créances mobilisables : 156M FCFA\n\nRecommandation : Relancer SABC (42M) et CICAM (28M) en priorité.`;
  }
  if (question.includes('client') || question.includes('relance') || question.includes('recouvrement')) {
    return `${prefix}Créances échues : **156M FCFA**.\n\nTop 3 relances :\n1. SODECOTON : 56M (contentieux)
2. SCTM : 42M (bloqué)
3. CICAM : 28M (mise en demeure)

Action immédiate : Contacter SODECOTON pour négocier un échéancier.`;
  }
  if (question.includes('clôture') || question.includes('cloture') || question.includes('dsf')) {
    return `${prefix}Score clôture : **72%** | Score DSF : **68%**.\n\nTâches prioritaires :\n• Rapprochements bancaires (T5) - en cours\n• Provisions fiscales (T9) - à valider\n• Factures en attente (T3/T16) - 12 à traiter\n\nEstimation : 4 jours-homme pour finaliser.`;
  }
  if (question.includes('marge') || question.includes('analytique') || question.includes('pôle') || question.includes('pole')) {
    return `${prefix}CA total mars : **1.2M FCFA**.\n\nPerformance par pôle :\n• Offset Étiquette : Marge 18% (bon)
• Héliogravure : Marge 15% (en baisse -2pts)
• Offset Carton : Marge 22% (excellent)
• Bouchon Couronne : Marge 12% (à surveiller)\n\nRecommandation : Analyser la baisse Héliogravure avec le responsable pôle.`;
  }
  if (question.includes('fiscal') || question.includes('taxe') || question.includes('conformité') || question.includes('conformite')) {
    return `${prefix}Score conformité OHADA : **85%**.\n\nAlertes :\n• 4 points d'attention
• 1 non-conformité (compte 691500 invalide)\n\nÀ provisionner :\n• TVA : 45M FCFA (échéance 15/04)
• IRPP : 120M FCFA\n\nAction : Corriger le compte 691500 avant DSF.`;
  }
  
  return `${prefix}Je n'ai pas de données spécifiques pour cette question.\n\nConnectez le webhook n8n dans Paramétrage > Config IA pour des réponses personnalisées basées sur vos données en temps réel.\n\nEn mode local, je peux répondre aux questions sur : anomalies, trésorerie, recouvrement, clôture, analytique, fiscalité.`;
}

async function buildSystemPrompt(): Promise<string> {
  // Fetch live data from database
  const [anomalies, clients, poles, taches, dsf, echeances, comptes] = await Promise.all([
    prisma.anomalie.findMany({ where: { statut: { not: 'resolu' } } }),
    prisma.client.findMany(),
    prisma.analytiquePole.findMany(),
    prisma.tacheCloture.findMany(),
    prisma.dsfTableau.findMany(),
    prisma.echeanceFiscale.findMany(),
    prisma.compteBancaire.findMany(),
  ]);

  const totalCA = poles.reduce((s, p) => s + p.ca, 0);
  const totalTreso = comptes.reduce((s, c) => s + c.soldeComptable, 0);
  const critiques = anomalies.filter(a => a.gravite === 'critique').length;
  const terminees = taches.filter(t => t.statut === 'termine').length;
  const scoreCloture = taches.length > 0 ? Math.round((terminees / taches.length) * 100) : 0;

  let sp = `Tu es FinanceAdvisor, agent IA expert en comptabilité, finance et audit pour MULTIPRINT S.A. (Douala, Cameroun).

CONTEXTE :
- Référentiel : OHADA / SYSCOHADA révisé
- Monnaie : FCFA (XAF), TVA : 19,25%
- 4 pôles : Offset Étiquette, Héliogravure Flexible, Offset Carton, Bouchon Couronne
- ERP : Sage X3 — Exercice 2025, mois : Mars

DONNÉES ACTUELLES :
- CA total mars : ${totalCA.toLocaleString('fr-FR')} FCFA
- Trésorerie : ${totalTreso.toLocaleString('fr-FR')} FCFA
- Anomalies critiques : ${critiques}
- Score clôture : ${scoreCloture}%
- Anomalies ouvertes : ${anomalies.length}

TOP ANOMALIES CRITIQUES :
${anomalies.filter(a => a.gravite === 'critique').map(a => `- ${a.titre}${a.impact ? ` (${a.impact.toLocaleString('fr-FR')} FCFA)` : ''}`).join('\n')}

TOP CLIENTS À RISQUE :
${clients.sort((a, b) => b.scoreRisque - a.scoreRisque).slice(0, 5).map(c => `- ${c.raisonSociale} : score ${c.scoreRisque}/100, échu ${c.echeanceEchue.toLocaleString('fr-FR')} FCFA`).join('\n')}
`;

  sp += '\nRéponds en français, de manière professionnelle et orientée action.';

  return sp;
}
