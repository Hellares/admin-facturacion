import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driverService } from '@/services/driver.service';
import { useCompanyContextStore } from '@/stores/company-context.store';
import type { DriverFormData, DriverListParams } from '@/types/driver.types';

export function useDrivers(params?: Omit<DriverListParams, 'company_id'>) {
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);

  return useQuery({
    queryKey: ['drivers', companyId, params],
    queryFn: () => driverService.getByCompany(companyId!, params),
    enabled: !!companyId,
  });
}

export function useDriver(id: number) {
  return useQuery({
    queryKey: ['driver', id],
    queryFn: () => driverService.getById(id),
    enabled: !!id,
  });
}

export function useCreateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DriverFormData) => driverService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drivers'] }),
  });
}

export function useUpdateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DriverFormData> }) =>
      driverService.update(id, data),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['drivers'] });
      qc.invalidateQueries({ queryKey: ['driver', v.id] });
    },
  });
}

export function useDeleteDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => driverService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drivers'] }),
  });
}

export function useActivateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => driverService.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drivers'] }),
  });
}
