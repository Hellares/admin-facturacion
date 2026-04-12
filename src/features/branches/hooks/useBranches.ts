import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchService } from '@/services/branch.service';
import { useCompanyContextStore } from '@/stores/company-context.store';
import type { BranchFormData } from '@/types/branch.types';

export function useBranches() {
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);

  return useQuery({
    queryKey: ['branches', companyId],
    queryFn: () => branchService.getByCompany(companyId!),
    enabled: !!companyId,
  });
}

export function useBranch(id: number) {
  return useQuery({
    queryKey: ['branch', id],
    queryFn: () => branchService.getById(id),
    enabled: !!id,
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BranchFormData) => branchService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branches'] }),
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BranchFormData> }) =>
      branchService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branches'] }),
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => branchService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branches'] }),
  });
}

export function useCorrelatives(branchId: number) {
  return useQuery({
    queryKey: ['correlatives', branchId],
    queryFn: () => branchService.getCorrelatives(branchId),
    enabled: !!branchId,
  });
}
