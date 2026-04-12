import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '@/services/vehicle.service';
import { useCompanyContextStore } from '@/stores/company-context.store';
import type { VehicleFormData, VehicleListParams } from '@/types/vehicle.types';

export function useVehicles(params?: Omit<VehicleListParams, 'company_id'>) {
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);

  return useQuery({
    queryKey: ['vehicles', companyId, params],
    queryFn: () => vehicleService.getByCompany(companyId!, params),
    enabled: !!companyId,
  });
}

export function useVehicle(id: number) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehicleService.getById(id),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VehicleFormData) => vehicleService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<VehicleFormData> }) =>
      vehicleService.update(id, data),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      qc.invalidateQueries({ queryKey: ['vehicle', v.id] });
    },
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => vehicleService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}

export function useActivateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => vehicleService.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}
