import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dispatchGuideService } from '@/services/dispatch-guide.service';
import type { DispatchGuideFormData, DispatchGuideListParams } from '@/types/dispatch-guide.types';

export function useDispatchGuides(params: DispatchGuideListParams) {
  return useQuery({
    queryKey: ['dispatch-guides', params],
    queryFn: () => dispatchGuideService.getAll(params),
  });
}

export function useDispatchGuide(id: number) {
  return useQuery({
    queryKey: ['dispatch-guide', id],
    queryFn: () => dispatchGuideService.getById(id),
    enabled: !!id,
  });
}

export function useCreateDispatchGuide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DispatchGuideFormData | Record<string, unknown>) => dispatchGuideService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dispatch-guides'] }),
  });
}

export function useTransferReasons() {
  return useQuery({
    queryKey: ['dispatch-guide-transfer-reasons'],
    queryFn: () => dispatchGuideService.getTransferReasons(),
    staleTime: 30 * 60 * 1000,
  });
}

export function useTransportModes() {
  return useQuery({
    queryKey: ['dispatch-guide-transport-modes'],
    queryFn: () => dispatchGuideService.getTransportModes(),
    staleTime: 30 * 60 * 1000,
  });
}

export function useCheckDispatchGuideStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dispatchGuideService.checkStatus(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dispatch-guides'] }),
  });
}
