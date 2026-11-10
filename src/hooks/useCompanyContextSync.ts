import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useCompanyContextStore } from '@/stores/company-context.store';
import apiClient from '@/lib/axios';
import type { Company } from '@/types/company.types';
import type { Branch } from '@/types/branch.types';
import type { ApiResponse } from '@/types/api.types';

/**
 * Sincroniza companies/branches y auto-selecciona segun el rol del usuario.
 * Debe llamarse desde un componente que siempre este montado (AppLayout),
 * no desde el CompanyBranchSelector porque ese se oculta en mobile.
 */
export function useCompanyContextSync() {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin());
  const userCompanyId = user?.company_id;
  const isLocked = !!userCompanyId && !isSuperAdmin;

  const {
    selectedCompanyId,
    setSelectedCompany,
    setSelectedBranch,
    setCompanies,
    setBranches,
  } = useCompanyContextStore();

  useEffect(() => {
    if (!user) return;
    const loadCompanies = async () => {
      try {
        const response = await apiClient.get<ApiResponse<Company[]>>('/v1/companies');
        const data = response.data.data;
        setCompanies(data);

        const persistedStillValid =
          selectedCompanyId != null && data.some((c) => c.id === selectedCompanyId);

        if (isLocked && userCompanyId) {
          setSelectedCompany(userCompanyId);
        } else if (!persistedStillValid && data.length === 1) {
          setSelectedCompany(data[0].id);
        } else if (!persistedStillValid) {
          setSelectedCompany(null);
        }
      } catch {
        if (isLocked && userCompanyId) {
          setSelectedCompany(userCompanyId);
        }
      }
    };
    loadCompanies();
  }, [userCompanyId, isLocked, user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedCompanyId) {
      setBranches([]);
      return;
    }
    const loadBranches = async () => {
      try {
        const response = await apiClient.get<ApiResponse<Branch[]>>(
          `/v1/companies/${selectedCompanyId}/branches`
        );
        const data = response.data.data;
        setBranches(data);
        // Conservar la sucursal elegida si sigue existiendo; si no, la única o ninguna
        const actual = useCompanyContextStore.getState().selectedBranchId;
        if (!data.some((b) => b.id === actual)) {
          setSelectedBranch(data.length === 1 ? data[0].id : null);
        }
      } catch {
        setBranches([]);
      }
    };
    loadBranches();
  }, [selectedCompanyId]); // eslint-disable-line react-hooks/exhaustive-deps
}
