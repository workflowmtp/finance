import {
  getDashboardKpis, getAnomaliesCritiques, getPolesData, getClientsRisque,
  getAnomaliesByGravite, getComptesBancairesForDashboard, getTachesClotureByCategorie,
  getUserRiskProfilesForDashboard, getEcheancesFiscalesForDashboard, getAuditLogsForDashboard,
  getTreasuryForecastForDashboard, getMonthlyDataForDashboard,
} from '@/lib/data';
import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  const kpis = getDashboardKpis();
  const anomaliesCritiques = getAnomaliesCritiques();
  const anomaliesByGravite = getAnomaliesByGravite();
  const poles = getPolesData();
  const clientsRisque = getClientsRisque(5);
  const comptesBancaires = getComptesBancairesForDashboard();
  const tachesCloture = getTachesClotureByCategorie();
  const userRiskProfiles = getUserRiskProfilesForDashboard();
  const echeancesFiscales = getEcheancesFiscalesForDashboard();
  const auditLogs = getAuditLogsForDashboard();
  const treasuryForecast = getTreasuryForecastForDashboard();
  const monthlyData = getMonthlyDataForDashboard();

  return (
    <DashboardClient
      kpis={kpis}
      anomaliesCritiques={anomaliesCritiques}
      anomaliesByGravite={anomaliesByGravite}
      poles={poles}
      clientsRisque={clientsRisque}
      comptesBancaires={comptesBancaires}
      tachesCloture={tachesCloture}
      userRiskProfiles={userRiskProfiles}
      echeancesFiscales={echeancesFiscales}
      auditLogs={auditLogs}
      treasuryForecast={treasuryForecast}
      monthlyData={monthlyData}
    />
  );
}
