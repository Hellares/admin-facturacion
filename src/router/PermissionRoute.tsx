import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { Result, Button } from 'antd';

interface PermissionRouteProps {
  children: React.ReactNode;
  permission?: string;
  role?: string;
  fallback?: React.ReactNode;
}

export default function PermissionRoute({ children, permission, role, fallback }: PermissionRouteProps) {
  const { hasPermission, hasRole, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess =
    (!permission || hasPermission(permission)) &&
    (!role || hasRole(role));

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : (
      <Result
        status="403"
        title="403"
        subTitle="No tienes permisos para acceder a esta pagina."
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Volver
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}
