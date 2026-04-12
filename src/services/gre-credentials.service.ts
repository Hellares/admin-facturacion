import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';

export interface GreCredentials {
  company_id: number;
  company_name: string;
  modo_actual: 'beta' | 'produccion';
  credenciales_configuradas: boolean;
  credenciales: {
    beta: GreEnvCredentials;
    produccion: GreEnvCredentials;
  };
}

export interface GreEnvCredentials {
  client_id: string;
  client_secret: string;
  ruc_proveedor: string;
  usuario_sol: string;
  clave_sol: string;
}

export interface GreCredentialsUpdate {
  environment: 'beta' | 'produccion';
  client_id: string;
  client_secret: string;
  ruc_proveedor?: string;
  usuario_sol?: string;
  clave_sol?: string;
}

export const greCredentialsService = {
  show: async (companyId: number): Promise<GreCredentials> => {
    const response = await apiClient.get<ApiResponse<GreCredentials>>(`/v1/companies/${companyId}/gre-credentials`);
    return response.data.data;
  },
  update: async (companyId: number, data: GreCredentialsUpdate): Promise<void> => {
    await apiClient.put(`/v1/companies/${companyId}/gre-credentials`, data);
  },
  testConnection: async (companyId: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/v1/companies/${companyId}/gre-credentials/test-connection`);
    return response.data;
  },
  clear: async (companyId: number, environment: 'beta' | 'produccion'): Promise<void> => {
    await apiClient.delete(`/v1/companies/${companyId}/gre-credentials/clear`, { data: { environment } });
  },
  copy: async (companyId: number, from: 'beta' | 'produccion', to: 'beta' | 'produccion'): Promise<void> => {
    await apiClient.post(`/v1/companies/${companyId}/gre-credentials/copy`, { from_environment: from, to_environment: to });
  },
  getDefaults: async (mode: 'beta' | 'produccion'): Promise<unknown> => {
    const response = await apiClient.get<ApiResponse<unknown>>(`/v1/gre-credentials/defaults/${mode}`);
    return response.data.data;
  },
};
