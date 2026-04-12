import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/company.service';
import type { CompanyFormData } from '@/types/company.types';

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: companyService.getAll,
  });
}

export function useCompany(id: number) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => companyService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CompanyFormData) => companyService.createComplete(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }),
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CompanyFormData> }) =>
      companyService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['companies'] });
      qc.invalidateQueries({ queryKey: ['company', id] });
    },
  });
}

export function useToggleProduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => companyService.toggleProduction(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }),
  });
}
