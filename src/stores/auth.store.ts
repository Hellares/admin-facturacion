import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types/auth.types';
import { useCompanyContextStore } from '@/stores/company-context.store';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isSuperAdmin: () => boolean;
  /**
   * Indica si el usuario puede emitir documentos para la empresa indicada.
   * Regla estricta: user.company_id debe coincidir con companyId, sin importar el rol.
   * Un super_admin sin company_id asignado NO puede emitir (solo administrar).
   * Debe coincidir con User::canIssueForCompany() del backend.
   */
  canIssueForCompany: (companyId: number | null | undefined) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('auth_token', token);
        // Al cambiar de usuario, limpiamos el contexto de empresa/sucursal persistido
        // para evitar que IDs de una sesion anterior contaminen la nueva sesion.
        useCompanyContextStore.getState().reset();
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        useCompanyContextStore.getState().reset();
        set({ user: null, token: null, isAuthenticated: false });
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        if (user.permissions.includes('*')) return true;
        return user.permissions.some((p) => {
          if (p === permission) return true;
          // Wildcard: 'invoices.*' matches 'invoices.create'
          if (p.endsWith('.*')) {
            const prefix = p.slice(0, -1);
            return permission.startsWith(prefix);
          }
          return false;
        });
      },

      hasRole: (role: string) => {
        const user = get().user;
        if (!user) return false;
        // Check DB name first (exact match)
        if (user.role_name === role) return true;
        // Fallback: display name (case-insensitive)
        return user.role?.toLowerCase() === role.toLowerCase();
      },

      isSuperAdmin: () => {
        const user = get().user;
        return user?.role_name === 'super_admin' || user?.permissions?.includes('*') || false;
      },

      canIssueForCompany: (companyId) => {
        const user = get().user;
        if (!user || !user.company_id) return false;
        if (companyId == null) return false;
        return Number(user.company_id) === Number(companyId);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
