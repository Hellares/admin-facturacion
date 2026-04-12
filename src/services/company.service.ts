import apiClient from '@/lib/axios';
import type { Company, CompanyFormData, PdfInfo } from '@/types/company.types';
import type { ApiResponse } from '@/types/api.types';

export const companyService = {
  getAll: async (): Promise<Company[]> => {
    const response = await apiClient.get<ApiResponse<Company[]>>('/v1/companies');
    return response.data.data;
  },

  getById: async (id: number): Promise<Company> => {
    const response = await apiClient.get<ApiResponse<Company>>(`/v1/companies/${id}`);
    return response.data.data;
  },

  create: async (data: CompanyFormData): Promise<Company> => {
    const response = await apiClient.post<ApiResponse<Company>>('/v1/companies', data);
    return response.data.data;
  },

  createComplete: async (data: CompanyFormData): Promise<Company> => {
    const response = await apiClient.post<ApiResponse<Company>>('/v1/companies/complete', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<CompanyFormData>): Promise<Company> => {
    const response = await apiClient.put<ApiResponse<Company>>(`/v1/companies/${id}`, data);
    return response.data.data;
  },

  activate: async (id: number): Promise<void> => {
    await apiClient.post(`/v1/companies/${id}/activate`);
  },

  toggleProduction: async (id: number): Promise<void> => {
    await apiClient.post(`/v1/companies/${id}/toggle-production`);
  },

  uploadFiles: async (id: number, formData: FormData): Promise<void> => {
    await apiClient.post(`/v1/companies/${id}/upload-files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getPdfInfo: async (id: number): Promise<PdfInfo> => {
    const response = await apiClient.get<ApiResponse<PdfInfo>>(`/v1/companies/${id}/pdf-info`);
    return response.data.data;
  },

  updatePdfInfo: async (id: number, data: Partial<PdfInfo>): Promise<void> => {
    await apiClient.put(`/v1/companies/${id}/pdf-info`, data);
  },

  getCorrelativos: async (companyId: number): Promise<unknown[]> => {
    const response = await apiClient.get<ApiResponse<unknown[]>>(`/v1/companies/${companyId}/correlativos`);
    return response.data.data;
  },
};
