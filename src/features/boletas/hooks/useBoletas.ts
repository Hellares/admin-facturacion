import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boletaService } from '@/services/boleta.service';
import { useCompanyContextStore } from '@/stores/company-context.store';
import type { BoletaFormData, BoletaListParams } from '@/types/boleta.types';

export function useBoletas(params: BoletaListParams) {
  return useQuery({
    queryKey: ['boletas', params],
    queryFn: () => boletaService.getAll(params),
  });
}

export function useBoleta(id: number) {
  return useQuery({
    queryKey: ['boleta', id],
    queryFn: () => boletaService.getById(id),
    enabled: !!id,
  });
}

export function useCreateBoleta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BoletaFormData) => boletaService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['boletas'] }),
  });
}

export function useSendBoletaToSunat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => boletaService.sendToSunat(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['boletas'] }),
  });
}

export function usePendingSummaryDates() {
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);
  return useQuery({
    queryKey: ['boletas', 'pending-dates', companyId],
    queryFn: () => boletaService.getPendingDates({ company_id: companyId ?? undefined }),
    enabled: !!companyId,
  });
}

export function useCreateDailySummary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { company_id: number; branch_id: number; fecha_resumen: string }) => boletaService.createDailySummary(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['boletas'] });
      qc.invalidateQueries({ queryKey: ['daily-summaries'] });
    },
  });
}

export function useCreateAllPendingSummaries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (companyId: number) => boletaService.createAllPendingSummaries({ company_id: companyId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['boletas'] });
      qc.invalidateQueries({ queryKey: ['daily-summaries'] });
    },
  });
}

export function useAnularBoletaLocalmente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { boletas_ids: number[]; motivo: string; observaciones?: string }) =>
      boletaService.anularLocalmente(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['boletas'] }),
  });
}

export function useAnularBoletaOficialmente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      company_id: number;
      branch_id: number;
      boletas_ids: number[];
      motivo_anulacion: string;
    }) => boletaService.anularOficialmente(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['boletas'] });
      qc.invalidateQueries({ queryKey: ['daily-summaries'] });
    },
  });
}
