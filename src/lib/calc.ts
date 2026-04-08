// ============================================================
// CALC FUNCTIONS — FinanceAdvisor V4
// All business logic calculations
// ============================================================

import type { MargePole } from '@/types';

// --- Analytique ---
export function calcMargePole(pole: {
  ca: number;
  coutMatiere: number;
  coutMo: number;
  coutMachine: number;
  fraisGeneraux: number;
}): MargePole {
  const coutTotal = pole.coutMatiere + pole.coutMo + pole.coutMachine + pole.fraisGeneraux;
  const resultat = pole.ca - coutTotal;
  const marge = pole.ca > 0 ? (resultat / pole.ca) * 100 : 0;
  return { coutTotal, resultat, marge };
}

// --- Clôture ---
export function calcScoreCloture(taches: { statut: string }[]): number {
  if (taches.length === 0) return 0;
  const terminees = taches.filter(t => t.statut === 'termine').length;
  return Math.round((terminees / taches.length) * 100);
}

export function calcClotureByCategorie(taches: { categorie: string; statut: string }[]) {
  const cats: Record<string, { done: number; total: number }> = {};
  for (const t of taches) {
    if (!cats[t.categorie]) cats[t.categorie] = { done: 0, total: 0 };
    cats[t.categorie].total++;
    if (t.statut === 'termine') cats[t.categorie].done++;
  }
  return Object.entries(cats).map(([categorie, data]) => ({
    categorie,
    done: data.done,
    total: data.total,
    pct: data.total > 0 ? Math.round((data.done / data.total) * 100) : 0,
  }));
}

// --- DSF ---
export function calcScoreDSF(tableaux: { fiabilite: number; poids: number }[]): number {
  if (tableaux.length === 0) return 0;
  let totalPoids = 0;
  let totalScore = 0;
  for (const t of tableaux) {
    totalPoids += t.poids;
    totalScore += t.fiabilite * t.poids;
  }
  return totalPoids > 0 ? Math.round(totalScore / totalPoids) : 0;
}

// --- Conformité OHADA ---
export function calcScoreConformite(controles: { statut: string }[]): number {
  if (controles.length === 0) return 100;
  const ok = controles.filter(c => c.statut === 'ok').length;
  return Math.round((ok / controles.length) * 100);
}

// --- Anomalies ---
export function countAnomaliesByGravite(anomalies: { gravite: string; statut: string }[], gravite: string): number {
  return anomalies.filter(a => a.gravite === gravite && a.statut !== 'resolu').length;
}

export function countAnomaliesCritiques(anomalies: { gravite: string; statut: string }[]): number {
  return countAnomaliesByGravite(anomalies, 'critique');
}

// --- Trésorerie ---
export function calcTresorerieTotal(comptes: { soldeComptable: number }[]): number {
  return comptes.reduce((sum, c) => sum + c.soldeComptable, 0);
}

// --- Créances ---
export function calcCreancesTotales(clients: { encours: number }[]): number {
  return clients.reduce((sum, c) => sum + c.encours, 0);
}

export function calcCreancesEchues(clients: { echeanceEchue: number }[]): number {
  return clients.reduce((sum, c) => sum + c.echeanceEchue, 0);
}

// --- CA & Charges ---
export function calcCATotale(poles: { ca: number }[]): number {
  return poles.reduce((sum, p) => sum + p.ca, 0);
}

export function calcChargesTotales(poles: { coutMatiere: number; coutMo: number; coutMachine: number; fraisGeneraux: number }[]): number {
  return poles.reduce((sum, p) => sum + p.coutMatiere + p.coutMo + p.coutMachine + p.fraisGeneraux, 0);
}

export function calcResultatNet(poles: { ca: number; coutMatiere: number; coutMo: number; coutMachine: number; fraisGeneraux: number }[]): number {
  return calcCATotale(poles) - calcChargesTotales(poles);
}

// --- Tâches bloquantes ---
export function countTachesBloquantes(taches: { blocage: string; statut: string }[]): number {
  return taches.filter(t => t.blocage === 'bloquant_cloture' && t.statut !== 'termine').length;
}
