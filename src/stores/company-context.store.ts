import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company } from '@/types/company.types';
import type { Branch } from '@/types/branch.types';

interface CompanyContextState {
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
}

export const useCompanyContextStore = create<CompanyContextState>()(
  persist(
    (set, get) => ({
      selectedCompanyId: null,
      selectedBranchId: null,
      companies: [],
      branches: [],

      setSelectedCompany: (companyId) => {
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
          selectedCompanyId: null,
          selectedBranchId: null,
          companies: [],
          branches: [],
        });
      },
    }),
    {
      name: 'company-context-storage',
      partialize: (state) => ({
        selectedCompanyId: state.selectedCompanyId,
        selectedBranchId: state.selectedBranchId,
      }),
    }
  )
);
