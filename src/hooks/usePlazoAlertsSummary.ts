import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';

export interface PlazoAlertsSummary {
  total_pendientes: number;
  vencidos: number;
  urgentes: number;
  proximos: number;
  requiere_accion_inmediata: boolean;
}

export function usePlazoAlertsSummary(companyId: number | null | undefined) {
  return useQuery({
    queryKey: ['plazo-alerts-summary', companyId],
    queryFn: async (): Promise<PlazoAlertsSummary> => {
      const response = await apiClient.get<ApiResponse<PlazoAlertsSummary>>(
        `/v1/alertas-plazo/resumen`,
        { params: { company_id: companyId } }
      );
      return response.data.data;
    },
    enabled: !!companyId,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });
}
