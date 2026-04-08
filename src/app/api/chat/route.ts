import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { messages, mode } = await req.json();

    // n8n Webhook configuration
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const webhookUser = process.env.N8N_WEBHOOK_USER;
    const webhookPassword = process.env.N8N_WEBHOOK_PASSWORD;

    if (!webhookUrl) {
      return NextResponse.json({ error: 'n8n webhook URL not configured' }, { status: 500 });
    }

    // Build system prompt with live data
    const systemPrompt = await buildSystemPrompt(mode);

    // Prepare Basic Auth header
    const credentials = Buffer.from(`${webhookUser}:${webhookPassword}`).toString('base64');

    // Call n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({
        system: systemPrompt,
        messages,
        mode,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Webhook error: ${response.status} - ${errorText}` }, { status: 500 });
    }

    const data = await response.json();

    // Handle n8n response - adjust based on your n8n workflow output format
    if (data.text || data.response || data.message) {
      return NextResponse.json({ text: data.text || data.response || data.message });
    }

    if (data.content) {
      const text = data.content
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('');
      return NextResponse.json({ text });
    }

    return NextResponse.json({ error: 'Unexpected response from webhook' }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function buildSystemPrompt(mode: string): Promise<string> {
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

  // Mode instruction
  const modeInstructions: Record<string, string> = {
    dg: 'MODE : Synthèse DG — 5-7 lignes, chiffres clés, décisions requises.',
    daf: 'MODE : Synthèse DAF — Détaillé mais synthétique, actions prioritaires.',
    pedagogique: 'MODE : Pédagogique — Explications claires, références OHADA.',
    audit: 'MODE : Audit détaillé — Exhaustif, preuves, recommandations.',
    action: 'MODE : Plan d\'action — Liste numérotée, responsable, échéance.',
  };

  sp += '\n' + (modeInstructions[mode] || modeInstructions.daf);
  sp += '\n\nRéponds en français, de manière professionnelle et orientée action.';

  return sp;
}
