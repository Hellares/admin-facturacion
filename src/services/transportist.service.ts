import apiClient from '@/lib/axios';
import type { Transportist, TransportistFormData, TransportistListParams } from '@/types/transportist.types';
import type { ApiResponse } from '@/types/api.types';

export const transportistService = {
  getAll: async (params?: TransportistListParams): Promise<Transportist[]> => {
    const response = await apiClient.get<ApiResponse<Transportist[]>>('/v1/transportists', { params });
    return response.data.data;
  },

  getByCompany: async (companyId: number, params?: Omit<TransportistListParams, 'company_id'>): Promise<Transportist[]> => {
    const response = await apiClient.get<ApiResponse<Transportist[]>>(`/v1/companies/${companyId}/transportists`, { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<Transportist> => {
    const response = await apiClient.get<ApiResponse<Transportist>>(`/v1/transportists/${id}`);
    return response.data.data;
  },

  create: async (data: TransportistFormData): Promise<Transportist> => {
    const response = await apiClient.post<ApiResponse<Transportist>>('/v1/transportists', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<TransportistFormData>): Promise<Transportist> => {
    const response = await apiClient.put<ApiResponse<Transportist>>(`/v1/transportists/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/transportists/${id}`);
  },

  activate: async (id: number): Promise<void> => {
    await apiClient.post(`/v1/transportists/${id}/activate`);
  },
};
