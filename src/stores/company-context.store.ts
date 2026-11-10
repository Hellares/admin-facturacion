import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company } from '@/types/company.types';
import type { Branch } from '@/types/branch.types';

interface CompanyContextState {
  /** Usuario dueño de esta elección: si vuelve a entrar el mismo, se conserva. */
  ownerUserId: number | null;
  selectedCompanyId: number | null;
  selectedBranchId: number | null;
  companies: Company[];
  branches: Branch[];

  setSelectedCompany: (companyId: number | null) => void;
  setSelectedBranch: (branchId: number | null) => void;
  setCompanies: (companies: Company[]) => void;
  setBranches: (branches: Branch[]) => void;
  getSelectedCompany: () => Company | undefined;
  getSelectedBranch: () => Branch | undefined;
  reset: () => void;
  /** Al iniciar sesión: borra la elección solo si es de otro usuario. */
  asegurarDueno: (userId: number) => void;
}

export const useCompanyContextStore = create<CompanyContextState>()(
  persist(
    (set, get) => ({
      ownerUserId: null,
      selectedCompanyId: null,
      selectedBranchId: null,
      companies: [],
      branches: [],

      setSelectedCompany: (companyId) => {
        // Re-elegir la misma empresa no debe borrar la sucursal (pasaba al recargar el portal)
        if (companyId === get().selectedCompanyId) return;
        set({ selectedCompanyId: companyId, selectedBranchId: null, branches: [] });
      },

      setSelectedBranch: (branchId) => {
        set({ selectedBranchId: branchId });
      },

      setCompanies: (companies) => {
        set({ companies });
      },

      setBranches: (branches) => {
        set({ branches });
      },

      getSelectedCompany: () => {
        const { companies, selectedCompanyId } = get();
        return companies.find((c) => c.id === selectedCompanyId);
      },

      getSelectedBranch: () => {
        const { branches, selectedBranchId } = get();
        return branches.find((b) => b.id === selectedBranchId);
      },

      reset: () => {
        set({
          ownerUserId: null,
          selectedCompanyId: null,
          selectedBranchId: null,
          companies: [],
          branches: [],
        });
      },

      asegurarDueno: (userId) => {
        if (get().ownerUserId !== userId) get().reset();
        set({ ownerUserId: userId });
      },
    }),
    {
      name: 'company-context-storage',
      partialize: (state) => ({
        ownerUserId: state.ownerUserId,
        selectedCompanyId: state.selectedCompanyId,
        selectedBranchId: state.selectedBranchId,
      }),
    }
  )
);
