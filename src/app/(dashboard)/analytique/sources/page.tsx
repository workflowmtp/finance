'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, KpiCard, ModuleTabs } from '@/components/ui';
import { formatMontant } from '@/lib/format';
import { getPoles } from '@/lib/data';

const TABS = [
  { id: 'poles', label: ' Rentabilité pôles', icon: ' ', href: '/analytique' },
  { id: 'ecarts', label: ' Écarts marge', icon: ' ', href: '/analytique/ecarts' },
  { id: 'sources', label: ' Sources écarts', icon: ' ', href: '/analytique/sources' },
];

const SIGNAUX = [
  { signal: 'Hausse prix achat encres (+45%)', source: 'Audit', pole: 'HF', impact: -15200000, type: 'cout_matiere', icon: ' ', navM: 'audit', navS: 'audit_global' },
  { signal: 'Surconsommation matière film flexible', source: 'Production', pole: 'HF', impact: -8500000, type: 'cout_matiere', icon: ' ', navM: null, navS: null },
  { signal: 'Temps machine excessif offset carton', source: 'Production', pole: 'OC', impact: -3200000, type: 'cout_machine', icon: ' ', navM: null, navS: null },
  { signal: 'Stock dormant encres hélio > 180j', source: 'Sage X3 / Stocks', pole: 'HF', impact: -8500000, type: 'provision', icon: ' ', navM: 'fiscalite', navS: 'fiscalite_provisions' },
  { signal: 'Rebuts élevés commande CICAM', source: 'Qualité', pole: 'HF', impact: -4200000, type: 'cout_matiere', icon: ' ', navM: null, navS: null },
  { signal: 'Maintenance corrective presse Offset 2', source: 'Maintenance', pole: 'OE', impact: -2800000, type: 'cout_machine', icon: ' ', navM: null, navS: null },
  { signal: 'Heures sup. équipe nuit BC mars', source: 'RH / Paie', pole: 'BC', impact: -1500000, type: 'cout_mo', icon: ' ', navM: null, navS: null },
  { signal: 'Commande SODECOTON faible marge', source: 'Commercial', pole: 'OC', impact: -2100000, type: 'marge', icon: ' ', navM: 'recouvrement', navS: 'recouvrement_portefeuille' },
  { signal: 'Optimisation consommation énergie OE', source: 'Production', pole: 'OE', impact: 1800000, type: 'cout_machine', icon: ' ', navM: null, navS: null },
  { signal: 'Hausse volume BC (+12% vs fév.)', source: 'Commercial', pole: 'BC', impact: 5500000, type: 'ca', icon: ' ', navM: null, navS: null },
];

const RECOS = [
  { prio: 'P1', text: 'HF : Négocier prix encres SUN Chemical - Impact +15M/mois', navM: 'audit', navS: 'audit_global' },
  { prio: 'P1', text: 'HF : Investiguer surconsommation matière - vérifier gammes', navM: null, navS: null },
  { prio: 'P2', text: 'HF : Provisionner stock dormant encres (8,5M)', navM: 'fiscalite', navS: 'fiscalite_provisions' },
  { prio: 'P2', text: 'OC : Optimiser temps machine offset carton', navM: null, navS: null },
  { prio: 'P2', text: 'OC : Revoir pricing commandes faible volume', navM: 'recouvrement', navS: 'recouvrement_risques' },
  { prio: 'P3', text: 'OE : Planifier maintenance préventive presse 2', navM: null, navS: null },
  { prio: 'P3', text: 'BC : Encadrer heures sup. nuit - évaluer recrutement', navM: null, navS: null },
];

export default function SourcesPage() {
  const router = useRouter();
  const polesRef = getPoles();
  const [filterPole, setFilterPole] = useState('tous');

  const getLabel = (code: string) => polesRef.find(pr => pr.code === code)?.label || code;

  const filtered = filterPole === 'tous' ? SIGNAUX : SIGNAUX.filter(s => s.pole === filterPole);
  const negImpact = SIGNAUX.filter(s => s.impact < 0).reduce((s, a) => s + a.impact, 0);
  const posImpact = SIGNAUX.filter(s => s.impact > 0).reduce((s, a) => s + a.impact, 0);

  const getNavPath = (navM: string | null, navS: string | null) => {
    if (!navM) return null;
    const map: Record<string, Record<string, string>> = {
      audit: { audit_global: '/audit' },
      fiscalite: { fiscalite_provisions: '/fiscalite/provisions' },
      recouvrement: { recouvrement_portefeuille: '/recouvrement/portefeuille', recouvrement_risques: '/recouvrement/risques' },
    };
    return map[navM]?.[navS || ''] || null;
  };

  return (
    <div>
      <PageHeader
        breadcrumb="Analytique > Sources des écarts"
        title="Sources des Écarts de Marge"
        subtitle="Croisement des signaux inter-modules - 10 signaux détectés"
        actions={<button className="btn btn-primary btn-sm" onClick={() => router.push('/agent-ia')}> Analyse IA</button>}
      />
      <ModuleTabs tabs={TABS} activeId="sources" />

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard color="red" icon=" " value={formatMontant(Math.abs(negImpact))} label="Impacts négatifs" trend={`${SIGNAUX.filter(s => s.impact < 0).length} signaux`} direction="down" />
        <KpiCard color="green" icon=" " value={formatMontant(posImpact)} label="Impacts positifs" trend={`${SIGNAUX.filter(s => s.impact > 0).length} signaux`} direction="up" />
        <KpiCard color="orange" icon=" " value={String(SIGNAUX.length)} label="Signaux croisés" trend="Multi-sources" direction="neutral" />
        <KpiCard color="blue" icon=" " value={formatMontant(negImpact + posImpact)} label="Impact net" />
      </div>

      {/* Filter */}
      <div className="filters-bar">
        <div className="filter-item">
          <span className="filter-label">Pôle</span>
          <select className="filter-select" value={filterPole} onChange={e => setFilterPole(e.target.value)}>
            <option value="tous">Tous</option>
            {polesRef.map(pr => <option key={pr.code} value={pr.code}>{pr.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <span className="data-table-title">Signaux inter-modules</span>
          <span className="data-table-count">{filtered.length}</span>
        </div>
        <table className="data-table" id="srcTable">
          <thead>
            <tr>
              <th></th>
              <th>Signal</th>
              <th>Source</th>
              <th>Pôle</th>
              <th>Type</th>
              <th>Impact FCFA</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.sort((a, b) => a.impact - b.impact).map((s, i) => {
              const rowCls = s.impact <= -5000000 ? 'row-critique' : s.impact < 0 ? 'row-eleve' : '';
              const impCls = s.impact < 0 ? (Math.abs(s.impact) >= 10000000 ? 'impact-high' : 'impact-medium') : 'positive';
              return (
                <tr key={i} className={rowCls} data-pole={s.pole}>
                  <td style={{ fontSize: '18px' }}>{s.icon}</td>
                  <td className="fs-sm fw-600">{s.signal}</td>
                  <td className="fs-xs text-muted">{s.source}</td>
                  <td className="cell-mono fs-xs">{getLabel(s.pole)}</td>
                  <td className="fs-xs">{s.type.replace(/_/g, ' ')}</td>
                  <td className={`cell-amount fw-600 ${impCls}`}>{s.impact >= 0 ? '+' : ''}{formatMontant(s.impact)}</td>
                  <td>
                    {s.navM && <button className="btn btn-sm btn-secondary" onClick={() => router.push(getNavPath(s.navM, s.navS)!)}> </button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recommandations */}
      <div className="widget" style={{ marginTop: '20px', borderLeft: '4px solid var(--primary)' }}>
        <div className="widget-header">
          <span className="widget-title"> Recommandations opérationnelles</span>
          <button className="btn btn-sm btn-primary" onClick={() => router.push('/agent-ia')}>Chat IA </button>
        </div>
        <div className="widget-body">
          {RECOS.map((r, i) => {
            const prioColor = r.prio === 'P1' ? 'var(--danger)' : r.prio === 'P2' ? 'var(--warning)' : 'var(--info)';
            const navPath = getNavPath(r.navM, r.navS);
            return (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '10px', alignItems: 'center', cursor: navPath ? 'pointer' : 'default' }}
                onClick={navPath ? () => router.push(navPath) : undefined}>
                <span className="badge" style={{ background: `${prioColor}20`, color: prioColor, minWidth: '28px', justifyContent: 'center' }}>{r.prio}</span>
                <span className="fs-sm" style={{ flex: 1 }}>{r.text}</span>
                {navPath && <span className="fs-xs text-primary"> </span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
