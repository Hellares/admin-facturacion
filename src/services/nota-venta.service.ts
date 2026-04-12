import apiClient from '@/lib/axios';
import type { NotaVenta, NotaVentaFormData, NotaVentaListParams } from '@/types/nota-venta.types';
import type { ApiResponse, PaginatedResponse, ListQueryParams } from '@/types/api.types';

export const notaVentaService = {
  getAll: async (params?: NotaVentaListParams): Promise<PaginatedResponse<NotaVenta>> => {
    const response = await apiClient.get<PaginatedResponse<NotaVenta>>('/v1/nota-ventas', { params });
    return response.data;
  },

  getById: async (id: number): Promise<NotaVenta> => {
    const response = await apiClient.get<ApiResponse<NotaVenta>>(`/v1/nota-ventas/${id}`);
    return response.data.data;
  },

  create: async (data: NotaVentaFormData): Promise<NotaVenta> => {
    const response = await apiClient.post<ApiResponse<NotaVenta>>('/v1/nota-ventas', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<NotaVentaFormData>): Promise<NotaVenta> => {
    const response = await apiClient.put<ApiResponse<NotaVenta>>(`/v1/nota-ventas/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/nota-ventas/${id}`);
  },

  convertir: async (id: number, data: { tipo_documento: '01' | '03'; forma_pago_tipo?: string }): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/v1/nota-ventas/${id}/convertir`, data);
    return response.data;
  },

  revertirConversion: async (id: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/v1/nota-ventas/${id}/revertir-conversion`);
    return response.data;
  },

  pendientesConversion: async (params?: ListQueryParams) => {
    const { data } = await apiClient.get('/v1/nota-ventas/pendientes-conversion', { params });
    return data;
  },

  historialConversiones: async (params?: ListQueryParams) => {
    const { data } = await apiClient.get('/v1/nota-ventas/historial-conversiones', { params });
    return data;
  },

  verConversion: async (id: number) => {
    const { data } = await apiClient.get(`/v1/nota-ventas/${id}/conversion`);
    return data;
  },
};
