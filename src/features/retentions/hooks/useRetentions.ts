import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retentionService } from '@/services/retention.service';
import type { RetentionFormData, RetentionListParams } from '@/types/retention.types';

export function useRetentions(params: RetentionListParams) {
  return useQuery({ queryKey: ['retentions', params], queryFn: () => retentionService.getAll(params) });
}

export function useRetention(id: number) {
  return useQuery({ queryKey: ['retention', id], queryFn: () => retentionService.getById(id), enabled: !!id });
}

export function useCreateRetention() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: RetentionFormData) => retentionService.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['retentions'] }) });
}

export function useSendRetentionToSunat() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => retentionService.sendToSunat(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['retentions'] }) });
}
