import apiClient from '@/lib/axios';
import type { Driver, DriverFormData, DriverListParams } from '@/types/driver.types';
import type { ApiResponse } from '@/types/api.types';

export const driverService = {
  getAll: async (params?: DriverListParams): Promise<Driver[]> => {
    const response = await apiClient.get<ApiResponse<Driver[]>>('/v1/drivers', { params });
    return response.data.data;
  },

  getByCompany: async (companyId: number, params?: Omit<DriverListParams, 'company_id'>): Promise<Driver[]> => {
    const response = await apiClient.get<ApiResponse<Driver[]>>(`/v1/companies/${companyId}/drivers`, { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<Driver> => {
    const response = await apiClient.get<ApiResponse<Driver>>(`/v1/drivers/${id}`);
    return response.data.data;
  },

  create: async (data: DriverFormData): Promise<Driver> => {
    const response = await apiClient.post<ApiResponse<Driver>>('/v1/drivers', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<DriverFormData>): Promise<Driver> => {
    const response = await apiClient.put<ApiResponse<Driver>>(`/v1/drivers/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/drivers/${id}`);
  },

  activate: async (id: number): Promise<void> => {
    await apiClient.post(`/v1/drivers/${id}/activate`);
  },
};
