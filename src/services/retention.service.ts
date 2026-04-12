import apiClient from '@/lib/axios';
import type { Retention, RetentionFormData, RetentionListParams } from '@/types/retention.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const retentionService = {
  getAll: async (params?: RetentionListParams): Promise<PaginatedResponse<Retention>> => {
    const response = await apiClient.get<PaginatedResponse<Retention>>('/v1/retentions', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Retention> => {
    const response = await apiClient.get<ApiResponse<Retention>>(`/v1/retentions/${id}`);
    return response.data.data;
  },

  create: async (data: RetentionFormData): Promise<Retention> => {
    const response = await apiClient.post<ApiResponse<Retention>>('/v1/retentions', data);
    return response.data.data;
  },

  sendToSunat: async (id: number): Promise<ApiResponse<Retention>> => {
    const response = await apiClient.post<ApiResponse<Retention>>(`/v1/retentions/${id}/send-sunat`);
    return response.data;
  },

  /**
   * Exporta retenciones filtradas a XLSX.
   */
  exportToExcel: async (params?: RetentionListParams): Promise<void> => {
    const response = await apiClient.get('/v1/retentions/export', {
      params,
      responseType: 'blob',
      timeout: 90000,
    });
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const filename = `retenciones-${new Date().toISOString().slice(0, 10)}.xlsx`;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
