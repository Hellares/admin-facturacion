import apiClient from '@/lib/axios';
import type { Client, ClientFormData, ClientSearchParams } from '@/types/client.types';
import type { ApiResponse, PaginatedResponse, ListQueryParams } from '@/types/api.types';

export const clientService = {
  getAll: async (params?: ListQueryParams): Promise<PaginatedResponse<Client>> => {
    const response = await apiClient.get<PaginatedResponse<Client>>('/v1/clients', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Client> => {
    const response = await apiClient.get<ApiResponse<Client>>(`/v1/clients/${id}`);
    return response.data.data;
  },

  getByCompany: async (companyId: number, params?: ListQueryParams): Promise<PaginatedResponse<Client>> => {
    const response = await apiClient.get<PaginatedResponse<Client>>(`/v1/companies/${companyId}/clients`, { params });
    return response.data;
  },

  create: async (data: ClientFormData): Promise<Client> => {
    const response = await apiClient.post<ApiResponse<Client>>('/v1/clients', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<ClientFormData>): Promise<Client> => {
    const response = await apiClient.put<ApiResponse<Client>>(`/v1/clients/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/clients/${id}`);
  },

  activate: async (id: number): Promise<void> => {
    await apiClient.post(`/v1/clients/${id}/activate`);
  },

  search: async (params: ClientSearchParams): Promise<PaginatedResponse<Client>> => {
    const response = await apiClient.post<PaginatedResponse<Client>>('/v1/clients/search', params);
    return response.data;
  },

  searchByDocument: async (data: { company_id: number; numero_documento: string }): Promise<Client | null> => {
    try {
      const response = await apiClient.post<ApiResponse<Client>>('/v1/clients/search-by-document', data);
      return response.data.data;
    } catch {
      return null;
    }
  },
};
