'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, KpiCard, ModuleTabs, DecisionBanner, Widget, ScoreGauge, ProgressBar } from '@/components/ui';
import { Btn } from '@/components/ui';
import { formatMontant, formatCompact, formatPct } from '@/lib/format';
import { BarChartWidget, DonutChartWidget, LineChartWidget } from '@/components/charts';

interface DashboardClientProps {
  kpis: {
    ca: number;
    charges: number;
    resultat: number;
    tresorerie: number;
    creancesTotales: number;
    creancesEchues: number;
    dettesFrs: number;
    anomaliesCritiques: number;
    anomaliesTotales: number;
    scoreCloture: number;
    scoreDSF: number;
    scoreConformite: number;
    bloquantes: number;
    docsNonComptabilises: number;
    tauxSaisie: number;
  };
  anomaliesCritiques: { id: string; titre: string; impact: number; categorie: string; utilisateur: string }[];
  anomaliesByGravite: { critique: number; eleve: number; moyen: number; faible: number };
  poles: { pole: string; label: string; color: string; ca: number; coutTotal: number; marge: number; margeStandard: number }[];
  clientsRisque: { id: string; nom: string; scoreRisque: number; echeanceEchue: number; retardMoyen: number; niveauRelance: number; statut: string }[];
  comptesBancaires: { id: string; banqueCode: string; libelle: string; soldeComptable: number; soldeReleve: number; tauxRapprochement: number; nbNonRapproches: number }[];
  tachesCloture: { categorie: string; pct: number }[];
  userRiskProfiles: { nom: string; totalAnomalies: number; critiques: number; score: number }[];
  echeancesFiscales: { type: string; periode: string; urgence: number; montantEstime: number; montantProvisionne: number; statut: string }[];
  auditLogs: { type: string; utilisateurNom: string; detail: string; date: string }[];
  treasuryForecast: { semaine: string; soldeFermeture: number; tension: number }[];
  monthlyData: { mois: string; ca: number; charges: number }[];
}

const TABS = [
  { id: 'general', label: 'Vue générale', icon: '📊', href: '/dashboard' },
  { id: 'alertes', label: 'Alertes', icon: '🚨', href: '/dashboard/alertes' },
  { id: 'synthese', label: 'Synthèse DG', icon: '📋', href: '/dashboard/synthese-dg' },
];

const CATEGORIE_COLORS: Record<string, string> = {
  'Achats': '#3B82F6', 'Ventes': '#10B981', 'Banque': '#06B6D4',
  'Fiscal': '#EF4444', 'Paie': '#8B5CF6', 'Stocks': '#F59E0B',
  'Analytique': '#EC4899', 'Contrôle': '#F97316'
};

export default function DashboardClient({
  kpis, anomaliesCritiques, anomaliesByGravite, poles, clientsRisque,
  comptesBancaires, tachesCloture, userRiskProfiles, echeancesFiscales,
  auditLogs, treasuryForecast, monthlyData
}: DashboardClientProps) {
  const router = useRouter();
  const bfr = kpis.creancesTotales - kpis.dettesFrs;

  return (
    <div>
      <PageHeader
        breadcrumb="Dashboard ▸ Vue générale"
        title="Cockpit de Direction Financière"
        subtitle="MULTIPRINT S.A. — Mars 2025"
        actions={<Btn href="/agent-ia" variant="primary">🤖 Agent IA</Btn>}
      />

      <ModuleTabs tabs={TABS.map(t => ({
        ...t,
        badge: t.id === 'alertes' ? String(kpis.anomaliesCritiques) : undefined,
        badgeColor: t.id === 'alertes' ? 'var(--danger)' : undefined,
      }))} activeId="general" />

      {/* Decision Banner */}
      {kpis.anomaliesCritiques > 0 && (
        <DecisionBanner
          type="critical"
          icon="🚨"
          title={`${kpis.anomaliesCritiques} anomalies critiques ouvertes`}
          text={`Impact financier estimé : ${formatMontant(anomaliesCritiques.reduce((s, a) => s + a.impact, 0))}`}
          actions={
            <>
              <Btn variant="danger" href="/dashboard/alertes">Voir les alertes</Btn>
              <Btn href="/audit">Audit</Btn>
            </>
          }
        />
      )}

      {/* RANG 1 — Performance financière */}
      <SectionLabel>Performance financière</SectionLabel>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard color="green" icon="💹" value={formatMontant(kpis.ca)} label="Chiffre d'affaires" trend="+8,2 %" direction="up" href="/analytique" />
        <KpiCard color="orange" icon="💳" value={formatMontant(kpis.charges)} label="Charges totales" trend="+5,1 %" direction="down" href="/analytique" />
        <KpiCard color={kpis.resultat >= 0 ? 'green' : 'red'} icon="📈" value={formatMontant(kpis.resultat)} label="Résultat net" trend="+12,3 %" direction="up" href="/dashboard/synthese-dg" />
        <KpiCard color="blue" icon="💰" value={formatMontant(kpis.tresorerie)} label="Trésorerie disponible" trend="-3,4 %" direction="down" href="/tresorerie" />
      </div>

      {/* RANG 2 — Créances & BFR */}
      <SectionLabel>Créances, dettes & besoin en fonds de roulement</SectionLabel>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <KpiCard color="orange" icon="📋" value={formatMontant(kpis.creancesTotales)} label="Créances clients" href="/recouvrement" />
        <KpiCard color="red" icon="⏰" value={formatMontant(kpis.creancesEchues)} label="Créances échues" trend="+15 %" direction="down" href="/recouvrement" />
        <KpiCard color="cyan" icon="🏭" value={formatMontant(kpis.dettesFrs)} label="Dettes fournisseurs" />
        <KpiCard color="purple" icon="📊" value={formatMontant(bfr)} label="BFR estimé" />
        <KpiCard color="green" icon="📝" value={formatPct(kpis.tauxSaisie)} label="Taux de saisie" href="/documents" />
      </div>

      {/* RANG 3 — Alertes & Scores */}
      <SectionLabel>Alertes, conformité & opérations</SectionLabel>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <KpiCard color="red" icon="🔴" value={String(kpis.anomaliesCritiques)} label="Anomalies critiques" href="/dashboard/alertes" />
        <KpiCard color="orange" icon="⚠️" value={String(kpis.anomaliesTotales)} label="Anomalies ouvertes" href="/audit" />
        <KpiCard color="purple" icon="📄" value={String(kpis.docsNonComptabilises)} label="Docs non comptab." href="/documents" />
        <KpiCard color="orange" icon="🚧" value={String(kpis.bloquantes)} label="Tâches bloquantes" href="/clotures" />
        <KpiCard color="cyan" icon="📅" value="18 j" label="Éch. fiscale (TVA)" href="/fiscalite" />
      </div>

      {/* Scores + Actions rapides */}
      <div className="grid-2 mb-6">
        <Widget title="🎯 Scores de préparation" titleExtra={<Btn href="/dashboard/synthese-dg" variant="secondary" size="sm">Synthèse DG →</Btn>}>
          <div className="flex items-center justify-around py-4">
            <ScoreGauge score={kpis.scoreCloture} size={95} label="Clôture" onClick={() => router.push('/clotures')} />
            <ScoreGauge score={kpis.scoreDSF} size={95} label="DSF" onClick={() => router.push('/dsf')} />
            <ScoreGauge score={kpis.scoreConformite} size={95} label="OHADA" onClick={() => router.push('/fiscalite')} />
          </div>
        </Widget>

        <Widget title="⚡ Actions rapides">
          <div className="grid grid-cols-2 gap-3 p-3">
            <QuickAction bg="var(--danger-bg)" icon="🚨" label="Traiter anomalies" sub={`${kpis.anomaliesCritiques} critiques`} onClick={() => router.push('/dashboard/alertes')} />
            <QuickAction bg="var(--warning-bg)" icon="📞" label="Plan relance IA" sub="Top 5 clients" onClick={() => router.push('/recouvrement')} />
            <QuickAction bg="var(--secondary-bg)" icon="🏦" label="Rapprochements" sub={`${comptesBancaires.filter(c => c.nbNonRapproches > 0).length} comptes`} onClick={() => router.push('/banque')} />
            <QuickAction bg="var(--primary-bg)" icon="📋" label="Avancer clôture" sub={`${kpis.scoreCloture}% fait`} onClick={() => router.push('/clotures')} />
            <QuickAction bg="var(--purple-bg)" icon="📑" label="Préparer DSF" sub={`${kpis.scoreDSF}% prêt`} onClick={() => router.push('/dsf')} />
            <QuickAction bg="var(--info-bg)" icon="🤖" label="Flash trésorerie" sub="Demander à l'IA" onClick={() => router.push('/agent-ia')} />
          </div>
        </Widget>
      </div>

      {/* Graphiques row */}
      <div className="dash-grid-1-1-1 mb-6">
        <Widget title="📊 CA vs Charges — T1" titleExtra={<Btn href="/analytique" variant="secondary" size="sm">Détail →</Btn>}>
          <BarChartWidget
            data={monthlyData.flatMap(m => [
              { name: m.mois, value: m.ca, color: '#10B981' },
              { name: '', value: m.charges, color: '#F59E0B' }
            ])}
            height={200}
          />
          <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: '#10B981' }} />CA</span>
            <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: '#F59E0B' }} />Charges</span>
          </div>
        </Widget>

        <Widget title="🔍 Anomalies" titleExtra={<Btn href="/dashboard/alertes" variant="secondary" size="sm">Détail →</Btn>}>
          <div className="flex flex-col items-center">
            <DonutChartWidget
              data={[
                { name: 'Crit.', value: anomaliesByGravite.critique, color: '#EF4444' },
                { name: 'Élev.', value: anomaliesByGravite.eleve, color: '#F59E0B' },
                { name: 'Moy.', value: anomaliesByGravite.moyen, color: '#D97706' },
                { name: 'Faib.', value: anomaliesByGravite.faible, color: '#64748B' },
              ]}
              size={130}
              centerLabel={String(kpis.anomaliesTotales)}
            />
            <div className="flex flex-wrap gap-3 mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: '#EF4444' }} />Crit.({anomaliesByGravite.critique})</span>
              <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: '#F59E0B' }} />Élev.({anomaliesByGravite.eleve})</span>
              <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: '#D97706' }} />Moy.({anomaliesByGravite.moyen})</span>
              <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: '#64748B' }} />Faib.({anomaliesByGravite.faible})</span>
            </div>
          </div>
        </Widget>

        <Widget title="📈 CA pôles — T1" titleExtra={<Btn href="/analytique" variant="secondary" size="sm">Écarts →</Btn>}>
          <LineChartWidget
            data={poles.map(p => ({ name: p.label, data: [p.ca * 0.26, p.ca * 0.53, p.ca], color: p.color }))}
            labels={['Jan', 'Fév', 'Mars']}
            height={190}
          />
          <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {poles.map(p => (
              <span key={p.pole}><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: p.color }} />{p.label}</span>
            ))}
          </div>
        </Widget>
      </div>

      {/* Widgets métier row */}
      <div className="dash-grid-1-1-1 mb-6">
        <Widget title="🚨 Alertes critiques" titleExtra={<span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{kpis.anomaliesCritiques}</span>}>
          <div className="max-h-72 overflow-y-auto" style={{ padding: '12px 20px' }}>
            {anomaliesCritiques.slice(0, 6).map(a => (
              <div key={a.id} className="flex items-center gap-3 py-2 cursor-pointer hover:bg-white/[0.02]" style={{ borderBottom: '1px solid var(--border-light)' }} onClick={() => router.push('/dashboard/alertes')}>
                <span className="text-sm font-semibold flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{a.titre}</span>
                <span className="badge badge-critique">Critique</span>
              </div>
            ))}
          </div>
          <div className="pt-2 text-center">
            <a className="text-xs cursor-pointer" style={{ color: 'var(--primary)' }} onClick={() => router.push('/dashboard/alertes')}>Toutes les {kpis.anomaliesTotales} anomalies →</a>
          </div>
        </Widget>

        <Widget title="📞 Clients à relancer">
          <div className="max-h-72 overflow-y-auto" style={{ padding: '12px 20px' }}>
            {clientsRisque.slice(0, 5).map(c => (
              <div key={c.id} className="py-2 cursor-pointer hover:bg-white/[0.02]" style={{ borderBottom: '1px solid var(--border-light)' }} onClick={() => router.push('/recouvrement')}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">{c.nom}</span>
                  <span className="font-mono text-sm font-semibold" style={{ color: 'var(--danger)' }}>{formatMontant(c.echeanceEchue)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Retard: {c.retardMoyen}j • Risque: {c.scoreRisque}/100</span>
                  <span className={`badge ${c.niveauRelance >= 4 ? 'badge-critique' : c.niveauRelance >= 2 ? 'badge-eleve' : 'badge-attente'}`}>Niv.{c.niveauRelance}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2 text-center">
            <a className="text-xs cursor-pointer" style={{ color: 'var(--primary)' }} onClick={() => router.push('/recouvrement')}>Portefeuille complet →</a>
          </div>
        </Widget>

        <Widget title="🏦 Position bancaire">
          <div className="space-y-1" style={{ padding: '12px 20px' }}>
            {comptesBancaires.slice(0, 4).map(cb => {
              const ecart = cb.soldeReleve - cb.soldeComptable;
              const ecColor = Math.abs(ecart) < 100000 ? '#10B981' : Math.abs(ecart) < 3000000 ? '#F59E0B' : '#EF4444';
              return (
                <div key={cb.id} className="flex items-center gap-3 py-2 cursor-pointer hover:bg-white/[0.02]" style={{ borderBottom: '1px solid var(--border-light)' }} onClick={() => router.push('/banque')}>
                  <span className="w-2 h-2 rounded-full" style={{ background: ecColor }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{cb.banqueCode} — {cb.libelle}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Rap. {formatPct(cb.tauxRapprochement)} • {cb.nbNonRapproches} non rap.</div>
                  </div>
                  <span className="font-mono text-sm font-semibold">{formatCompact(cb.soldeComptable)}</span>
                </div>
              );
            })}
          </div>
          <div className="pt-2 text-center">
            <a className="text-xs cursor-pointer" style={{ color: 'var(--primary)' }} onClick={() => router.push('/banque')}>Voir les banques →</a>
          </div>
        </Widget>
      </div>

      {/* Trésorerie + Clôture + Marge row */}
      <div className="dash-grid-1-1-1 mb-6">
        <Widget title="💰 Trésorerie S+1→S+4" titleExtra={<Btn href="/tresorerie" variant="secondary" size="sm">Détail →</Btn>}>
          <TreasuryBars forecast={treasuryForecast} />
          <div className="pt-2 text-center">
            <a className="text-xs cursor-pointer" style={{ color: 'var(--primary)' }} onClick={() => router.push('/tresorerie')}>Scénarios →</a>
          </div>
        </Widget>

        <Widget title="📋 Clôture Mars" titleExtra={<span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{formatPct(kpis.scoreCloture)}</span>}>
          <div className="space-y-2" style={{ padding: '8px 20px' }}>
            {tachesCloture.map(tc => (
              <div key={tc.categorie} className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/clotures')}>
                <span className="text-xs w-20" style={{ color: 'var(--text-secondary)' }}>{tc.categorie}</span>
                <ProgressBar value={tc.pct} color={CATEGORIE_COLORS[tc.categorie] || '#94A3B8'} />
                <span className={`text-xs font-mono w-10 text-right ${tc.pct >= 80 ? 'text-green-400' : tc.pct >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{tc.pct}%</span>
              </div>
            ))}
          </div>
          <div className="pt-2 text-center">
            <a className="text-xs cursor-pointer" style={{ color: 'var(--primary)' }} onClick={() => router.push('/clotures')}>Checklist →</a>
          </div>
        </Widget>

        <Widget title="📈 Marge par pôle" titleExtra={<Btn href="/analytique" variant="secondary" size="sm">Sources →</Btn>}>
          <div className="space-y-2" style={{ padding: '8px 20px' }}>
            {poles.map(p => {
              const eca = p.marge - p.margeStandard;
              const maxM = Math.max(...poles.map(x => Math.max(x.marge, x.margeStandard)));
              return (
                <div key={p.pole} className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/analytique')}>
                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{p.label}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>CA: {formatCompact(p.ca)}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--bg-surface)' }}>
                        <div className="h-full rounded-full" style={{ width: `${(p.marge / maxM) * 100}%`, background: p.color }} />
                      </div>
                      <span className="text-xs font-mono w-10 text-right">{p.marge.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--bg-surface)' }}>
                        <div className="h-full rounded-full opacity-30" style={{ width: `${(p.margeStandard / maxM) * 100}%`, background: '#888' }} />
                      </div>
                      <span className="text-xs font-mono w-10 text-right" style={{ color: 'var(--text-muted)' }}>{p.margeStandard.toFixed(1)}%</span>
                    </div>
                  </div>
                  <span className={`text-sm font-mono font-semibold w-12 text-right ${eca >= 0 ? 'text-green-400' : 'text-red-400'}`}>{eca >= 0 ? '+' : ''}{eca.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
          <div className="pt-2 text-center">
            <a className="text-xs cursor-pointer" style={{ color: 'var(--primary)' }} onClick={() => router.push('/analytique')}>Analyse complète →</a>
          </div>
        </Widget>
      </div>

      {/* Bottom row: Users risk + Fiscalité */}
      <div className="grid-2 mb-6">
        <Widget title="👤 Utilisateurs à risque" titleExtra={<Btn href="/audit" variant="secondary" size="sm">Profils →</Btn>}>
          <div className="space-y-2" style={{ padding: '8px 20px' }}>
            {userRiskProfiles.slice(0, 4).map(ur => {
              const aBg = ur.score >= 60 ? '#EF4444' : ur.score >= 30 ? '#F59E0B' : '#10B981';
              const ini = ur.nom.split(' ').map(n => n[0]).join('');
              return (
                <div key={ur.nom} className="flex items-center gap-3 cursor-pointer hover:bg-white/[0.02]" onClick={() => router.push('/audit')}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: aBg, color: '#fff' }}>{ini}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{ur.nom}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{ur.totalAnomalies} anomalies • {ur.critiques} critiques</div>
                  </div>
                  <span className="font-mono font-bold" style={{ color: aBg }}>{ur.score}</span>
                </div>
              );
            })}
          </div>
        </Widget>

        <Widget title="⚖️ Échéances fiscales" titleExtra={<Btn href="/fiscalite" variant="secondary" size="sm">Détail →</Btn>}>
          <div className="space-y-2" style={{ padding: '12px 20px' }}>
            {echeancesFiscales.filter(e => e.statut !== 'depose').sort((a, b) => a.urgence - b.urgence).slice(0, 4).map(ef => {
              const reste = ef.montantEstime - ef.montantProvisionne;
              const uC = ef.urgence <= 10 ? '#EF4444' : ef.urgence <= 20 ? '#F59E0B' : '#10B981';
              return (
                <div key={ef.type + ef.periode} className="flex items-center gap-3 cursor-pointer hover:bg-white/[0.02]" onClick={() => router.push('/fiscalite')}>
                  <div className="flex-1">
                    <span className="text-sm">{ef.type}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{ef.periode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {reste > 0 ? <span className="text-xs font-semibold" style={{ color: 'var(--danger)' }}>Reste {formatCompact(reste)}</span> : <span className="badge badge-conforme text-xs">OK</span>}
                    <span className="font-mono text-sm font-semibold" style={{ color: uC }}>{ef.urgence}j</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Widget>
      </div>

      {/* Activité récente + Échéances + Banques */}
      <div className="dash-grid-1-1-1 mb-6">
        <Widget title="🕐 Activité récente" titleExtra={<Btn href="/historique" variant="secondary" size="sm">Tout →</Btn>}>
          <div className="space-y-1 py-2">
            {auditLogs.slice(0, 6).map((l, i) => {
              const typeIcon = l.type === 'connexion' ? '🔑' : l.type === 'validation' ? '✅' : l.type === 'correction' ? '✏️' : '📤';
              const typeCol = l.type === 'correction' ? 'text-yellow-400' : l.type === 'validation' ? 'text-green-400' : 'text-gray-400';
              return (
                <div key={i} className="flex gap-2 py-1.5" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <span>{typeIcon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs"><span className="font-semibold">{l.utilisateurNom}</span> <span className={typeCol}>{l.type}</span></div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{l.detail}</div>
                  </div>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{l.date?.substring(11, 16)}</span>
                </div>
              );
            })}
          </div>
        </Widget>

        <Widget title="📅 Échéances à venir">
          <div className="space-y-1 py-2 text-xs">
            {echeancesFiscales.filter(e => e.statut !== 'depose' && e.urgence <= 30).slice(0, 5).map(ef => (
              <div key={ef.type} className="flex gap-2 py-1.5 cursor-pointer hover:bg-white/[0.02]" style={{ borderBottom: '1px solid var(--border-light)' }} onClick={() => router.push('/fiscalite')}>
                <span>⚖️</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{ef.type} — {ef.periode}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Fiscal</div>
                </div>
                <span className={`font-mono ${ef.urgence <= 10 ? 'text-red-400 font-bold' : ''}`}>{ef.urgence}j</span>
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="🏦 Banques — écarts" titleExtra={<Btn href="/banque" variant="secondary" size="sm">Détail →</Btn>}>
          <div className="space-y-1 py-2">
            {comptesBancaires.map(cb => {
              const ecart = cb.soldeReleve - cb.soldeComptable;
              const ecColor = Math.abs(ecart) < 100000 ? '#10B981' : Math.abs(ecart) < 3000000 ? '#F59E0B' : '#EF4444';
              return (
                <div key={cb.id} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-white/[0.02]" style={{ borderBottom: '1px solid var(--border-light)' }} onClick={() => router.push('/banque')}>
                  <span className="w-2 h-2 rounded-full" style={{ background: ecColor }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold">{cb.banqueCode} — {cb.libelle}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Rap. {formatPct(cb.tauxRapprochement)} • {cb.nbNonRapproches} non rap.</div>
                  </div>
                  <span className="font-mono text-xs font-semibold" style={{ color: ecColor }}>{ecart >= 0 ? '+' : ''}{formatCompact(ecart)}</span>
                </div>
              );
            })}
          </div>
        </Widget>
      </div>

      {/* Timestamp */}
      <div className="text-right py-2">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} — Données simulées (démo)
        </span>
      </div>
    </div>
  );
}

// Sub-components
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-wider mb-2 mt-4" style={{ color: 'var(--text-muted)', letterSpacing: '1.5px' }}>
      {children}
    </div>
  );
}

function QuickAction({ bg, icon, label, sub, onClick }: { bg: string; icon: string; label: string; sub: string; onClick: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:opacity-80" style={{ background: bg }} onClick={onClick}>
      <span className="text-xl">{icon}</span>
      <div>
        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</div>
      </div>
    </div>
  );
}

function TreasuryBars({ forecast }: { forecast: { semaine: string; soldeFermeture: number; tension: number }[] }) {
  const mxT = Math.max(...forecast.map(f => Math.abs(f.soldeFermeture || 0)), 1);
  return (
    <div className="flex gap-2 items-end h-28 px-1">
      {forecast.map(f => {
        const sf = f.soldeFermeture || 0;
        const bH = Math.max(12, Math.abs(sf) / mxT * 85);
        const bC = f.tension > 50 ? '#EF4444' : f.tension > 20 ? '#F59E0B' : '#10B981';
        return (
          <div key={f.semaine} className="flex-1 flex flex-col items-center cursor-pointer" onClick={() => {}}>
            <div className="text-xs font-mono mb-1" style={{ color: bC }}>{formatCompact(sf)}</div>
            <div className="w-full rounded-t opacity-70" style={{ height: bH, background: bC }} />
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{f.semaine}</div>
          </div>
        );
      })}
    </div>
  );
}
