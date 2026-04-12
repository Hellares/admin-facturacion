import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '@/stores/auth.store';
import apiClient from '@/lib/axios';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      apiClient.get('/system/public-info')
        .then((res) => {
          setRedirectPath(res.data?.sunat_env === 'beta' ? '/registro' : '/login');
        })
        .catch(() => setRedirectPath('/login'));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    if (!redirectPath) {
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><Spin size="large" /></div>;
    }
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
