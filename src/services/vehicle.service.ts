import apiClient from '@/lib/axios';
import type { Vehicle, VehicleFormData, VehicleListParams } from '@/types/vehicle.types';
import type { ApiResponse } from '@/types/api.types';

export const vehicleService = {
  getAll: async (params?: VehicleListParams): Promise<Vehicle[]> => {
    const response = await apiClient.get<ApiResponse<Vehicle[]>>('/v1/vehicles', { params });
    return response.data.data;
  },

  getByCompany: async (companyId: number, params?: Omit<VehicleListParams, 'company_id'>): Promise<Vehicle[]> => {
    const response = await apiClient.get<ApiResponse<Vehicle[]>>(`/v1/companies/${companyId}/vehicles`, { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<Vehicle> => {
    const response = await apiClient.get<ApiResponse<Vehicle>>(`/v1/vehicles/${id}`);
    return response.data.data;
  },

  create: async (data: VehicleFormData): Promise<Vehicle> => {
    const response = await apiClient.post<ApiResponse<Vehicle>>('/v1/vehicles', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<VehicleFormData>): Promise<Vehicle> => {
    const response = await apiClient.put<ApiResponse<Vehicle>>(`/v1/vehicles/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/vehicles/${id}`);
  },

  activate: async (id: number): Promise<void> => {
    await apiClient.post(`/v1/vehicles/${id}/activate`);
  },
};
