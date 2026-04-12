import apiClient from '@/lib/axios';
import type { DispatchGuide, DispatchGuideFormData, DispatchGuideListParams } from '@/types/dispatch-guide.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const dispatchGuideService = {
  getAll: async (params?: DispatchGuideListParams): Promise<PaginatedResponse<DispatchGuide>> => {
    const response = await apiClient.get<PaginatedResponse<DispatchGuide>>('/v1/dispatch-guides', { params });
    return response.data;
  },

  getById: async (id: number): Promise<DispatchGuide> => {
    const response = await apiClient.get<ApiResponse<DispatchGuide>>(`/v1/dispatch-guides/${id}`);
    return response.data.data;
  },

  create: async (data: DispatchGuideFormData | Record<string, unknown>): Promise<DispatchGuide> => {
    const response = await apiClient.post<ApiResponse<DispatchGuide>>('/v1/dispatch-guides', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<DispatchGuideFormData>): Promise<DispatchGuide> => {
    const response = await apiClient.put<ApiResponse<DispatchGuide>>(`/v1/dispatch-guides/${id}`, data);
    return response.data.data;
  },

  sendToSunat: async (id: number): Promise<ApiResponse<DispatchGuide>> => {
    const response = await apiClient.post<ApiResponse<DispatchGuide>>(`/v1/dispatch-guides/${id}/send-sunat`);
    return response.data;
  },

  checkStatus: async (id: number): Promise<ApiResponse<DispatchGuide>> => {
    const response = await apiClient.post<ApiResponse<DispatchGuide>>(`/v1/dispatch-guides/${id}/check-status`);
    return response.data;
  },

  getTransferReasons: async (): Promise<{ codigo: string; descripcion: string }[]> => {
    const response = await apiClient.get<ApiResponse<{ codigo: string; descripcion: string }[]>>('/v1/dispatch-guides/catalogs/transfer-reasons');
    return response.data.data;
  },

  getTransportModes: async (): Promise<{ codigo: string; descripcion: string }[]> => {
    const response = await apiClient.get<ApiResponse<{ codigo: string; descripcion: string }[]>>('/v1/dispatch-guides/catalogs/transport-modes');
    return response.data.data;
  },

  /**
   * Exporta guias de remision filtradas a XLSX.
   */
  exportToExcel: async (params?: DispatchGuideListParams): Promise<void> => {
    const response = await apiClient.get('/v1/dispatch-guides/export', {
      params,
      responseType: 'blob',
      timeout: 90000,
    });
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const filename = `guias-remision-${new Date().toISOString().slice(0, 10)}.xlsx`;
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
