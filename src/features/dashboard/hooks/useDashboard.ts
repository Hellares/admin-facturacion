import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { useCompanyContextStore } from '@/stores/company-context.store';

export function useDashboardStats(startDate?: string, endDate?: string) {
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const branchId = useCompanyContextStore((s) => s.selectedBranchId);

  return useQuery({
    queryKey: ['dashboard', 'statistics', companyId, branchId, startDate, endDate],
    queryFn: () => dashboardService.getStatistics({
      company_id: companyId ?? undefined,
      branch_id: branchId ?? undefined,
      start_date: startDate,
      end_date: endDate,
    }),
    enabled: !!companyId,
  });
}

export function useMonthlySummary(year?: number, month?: number) {
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);

  return useQuery({
    queryKey: ['dashboard', 'monthly-summary', companyId, year, month],
    queryFn: () => dashboardService.getMonthlySummary({
      company_id: companyId ?? undefined,
      year,
      month,
    }),
    enabled: !!companyId,
  });
}

export function useExpiredCertificates() {
  return useQuery({
    queryKey: ['dashboard', 'expired-certificates'],
    queryFn: () => dashboardService.getExpiredCertificates(),
  });
}
