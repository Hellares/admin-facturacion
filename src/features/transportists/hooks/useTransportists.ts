import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transportistService } from '@/services/transportist.service';
import { useCompanyContextStore } from '@/stores/company-context.store';
import type { TransportistFormData, TransportistListParams } from '@/types/transportist.types';

export function useTransportists(params?: Omit<TransportistListParams, 'company_id'>) {
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);

  return useQuery({
    queryKey: ['transportists', companyId, params],
    queryFn: () => transportistService.getByCompany(companyId!, params),
    enabled: !!companyId,
  });
}

export function useTransportist(id: number) {
  return useQuery({
    queryKey: ['transportist', id],
    queryFn: () => transportistService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTransportist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TransportistFormData) => transportistService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transportists'] }),
  });
}

export function useUpdateTransportist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TransportistFormData> }) =>
      transportistService.update(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['transportists'] });
      qc.invalidateQueries({ queryKey: ['transportist', vars.id] });
    },
  });
}

export function useDeleteTransportist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => transportistService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transportists'] }),
  });
}

export function useActivateTransportist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => transportistService.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transportists'] }),
  });
}
