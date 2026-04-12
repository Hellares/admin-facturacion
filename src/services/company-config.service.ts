import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';

export type ConfigSection = 'tax_settings' | 'invoice_settings' | 'gre_settings' | 'document_settings';

export const companyConfigService = {
  getConfig: async (companyId: number): Promise<Record<string, Record<string, unknown>>> => {
    const response = await apiClient.get<ApiResponse<Record<string, Record<string, unknown>>>>(`/v1/companies/${companyId}/config`);
    return response.data.data;
  },
  getSection: async (companyId: number, section: ConfigSection): Promise<Record<string, unknown>> => {
    const response = await apiClient.get<ApiResponse<{ section: string; config: Record<string, unknown> }>>(`/v1/companies/${companyId}/config/${section}`);
    return response.data.data.config;
  },
  updateSection: async (companyId: number, section: ConfigSection, data: Record<string, unknown>): Promise<void> => {
    await apiClient.put(`/v1/companies/${companyId}/config/${section}`, data);
  },
  validateServices: async (companyId: number): Promise<unknown> => {
    const response = await apiClient.get<ApiResponse<unknown>>(`/v1/companies/${companyId}/config/validate/services`);
    return response.data.data;
  },
  resetToDefaults: async (companyId: number, section?: ConfigSection): Promise<void> => {
    await apiClient.post(`/v1/companies/${companyId}/config/reset`, section ? { section } : {});
  },
  clearCache: async (companyId: number): Promise<void> => {
    await apiClient.delete(`/v1/companies/${companyId}/config/cache`);
  },
  getDefaults: async (): Promise<Record<string, Record<string, unknown>>> => {
    const response = await apiClient.get<ApiResponse<Record<string, Record<string, unknown>>>>('/v1/config/defaults');
    return response.data.data;
  },
  getSummary: async (companyIds?: number[]): Promise<unknown[]> => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/v1/config/summary', { params: companyIds ? { company_ids: companyIds } : {} });
    return response.data.data;
  },
};
