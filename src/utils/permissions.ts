import { useAuthStore } from '@/stores/auth.store';

export function checkPermission(permission: string): boolean {
  return useAuthStore.getState().hasPermission(permission);
}

export function checkRole(role: string): boolean {
  return useAuthStore.getState().hasRole(role);
}

export function isSuperAdmin(): boolean {
  return checkRole('super administrador') || checkRole('super_admin');
}
