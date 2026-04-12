import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dailySummaryService } from '@/services/daily-summary.service';
import type { DailySummaryListParams } from '@/types/daily-summary.types';

export function useDailySummaries(params: DailySummaryListParams) {
  return useQuery({
    queryKey: ['daily-summaries', params],
    queryFn: () => dailySummaryService.getAll(params),
  });
}

export function useDailySummary(id: number) {
  return useQuery({
    queryKey: ['daily-summary', id],
    queryFn: () => dailySummaryService.getById(id),
    enabled: !!id,
  });
}

export function useSendDailySummaryToSunat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dailySummaryService.sendToSunat(id),
    onSuccess: (_, id) => {
      // Invalidar lista (query plural) y detalle (query singular) para que
      // ambas vistas reflejen el nuevo estado post-envio.
      qc.invalidateQueries({ queryKey: ['daily-summaries'] });
      qc.invalidateQueries({ queryKey: ['daily-summary', id] });
      qc.invalidateQueries({ queryKey: ['anulaciones'] });
      qc.invalidateQueries({ queryKey: ['boletas'] });
    },
  });
}

export function useCheckDailySummaryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dailySummaryService.checkStatus(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['daily-summaries'] });
      qc.invalidateQueries({ queryKey: ['daily-summary', id] });
      qc.invalidateQueries({ queryKey: ['anulaciones'] });
      qc.invalidateQueries({ queryKey: ['boletas'] });
    },
  });
}

export function useCheckAllPending() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => dailySummaryService.checkAllPending(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-summaries'] });
      // No invalidamos el detalle porque no sabemos que ids afectados
      qc.invalidateQueries({ queryKey: ['anulaciones'] });
    },
  });
}
