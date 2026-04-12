import { useAuthStore } from '@/stores/auth.store';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  role?: string;
  fallback?: React.ReactNode;
}

export default function PermissionGate({ children, permission, role, fallback = null }: PermissionGateProps) {
  const { hasPermission, hasRole } = useAuthStore();

  const hasAccess =
    (!permission || hasPermission(permission)) &&
    (!role || hasRole(role));

  if (!hasAccess) return <>{fallback}</>;

  return <>{children}</>;
}
