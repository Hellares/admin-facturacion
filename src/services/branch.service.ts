import apiClient from '@/lib/axios';
import type { Branch, BranchFormData, Correlative } from '@/types/branch.types';
import type { ApiResponse } from '@/types/api.types';

export const branchService = {
  getAll: async (): Promise<Branch[]> => {
    const response = await apiClient.get<ApiResponse<Branch[]>>('/v1/branches');
    return response.data.data;
  },

  getByCompany: async (companyId: number): Promise<Branch[]> => {
    const response = await apiClient.get<ApiResponse<Branch[]>>(`/v1/companies/${companyId}/branches`);
    return response.data.data;
  },

  getById: async (id: number): Promise<Branch> => {
    const response = await apiClient.get<ApiResponse<Branch>>(`/v1/branches/${id}`);
    return response.data.data;
  },

  create: async (data: BranchFormData): Promise<Branch> => {
    const response = await apiClient.post<ApiResponse<Branch>>('/v1/branches', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<BranchFormData>): Promise<Branch> => {
    const response = await apiClient.put<ApiResponse<Branch>>(`/v1/branches/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/branches/${id}`);
  },

  // Correlatives
  getCorrelatives: async (branchId: number): Promise<Correlative[]> => {
    const response = await apiClient.get<ApiResponse<Correlative[]>>(`/v1/branches/${branchId}/correlatives`);
    return response.data.data;
  },

  createCorrelative: async (branchId: number, data: { tipo_documento: string; serie: string }): Promise<Correlative> => {
    const response = await apiClient.post<ApiResponse<Correlative>>(`/v1/branches/${branchId}/correlatives`, data);
    return response.data.data;
  },

  updateCorrelative: async (branchId: number, correlativeId: number, data: Partial<{ serie: string }>): Promise<Correlative> => {
    const response = await apiClient.put<ApiResponse<Correlative>>(`/v1/branches/${branchId}/correlatives/${correlativeId}`, data);
    return response.data.data;
  },

  deleteCorrelative: async (branchId: number, correlativeId: number): Promise<void> => {
    await apiClient.delete(`/v1/branches/${branchId}/correlatives/${correlativeId}`);
  },

  activate: async (id: number): Promise<void> => {
    await apiClient.post(`/v1/branches/${id}/activate`);
  },

  searchByCodigo: async (companyId: number, codigo: string): Promise<Branch[]> => {
    const response = await apiClient.get<ApiResponse<Branch[]>>(`/v1/companies/${companyId}/branches/search/codigo`, { params: { codigo } });
    return response.data.data;
  },

  searchByUbigeo: async (companyId: number, ubigeo: string): Promise<Branch[]> => {
    const response = await apiClient.get<ApiResponse<Branch[]>>(`/v1/companies/${companyId}/branches/search/ubigeo`, { params: { ubigeo } });
    return response.data.data;
  },

  createCorrelativeBatch: async (branchId: number, correlativos: Array<{ tipo_documento: string; serie: string; correlativo_inicial?: number }>): Promise<unknown> => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/v1/branches/${branchId}/correlatives/batch`, { correlativos });
    return response.data.data;
  },

  incrementCorrelative: async (branchId: number, correlativeId: number): Promise<unknown> => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/v1/branches/${branchId}/correlatives/${correlativeId}/increment`);
    return response.data.data;
  },
};
