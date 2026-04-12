import apiClient from '@/lib/axios';
import type { Cotizacion, CotizacionFormData, CotizacionListParams } from '@/types/cotizacion.types';
import type { ApiResponse, PaginatedResponse, ListQueryParams } from '@/types/api.types';

export const cotizacionService = {
  getAll: async (params?: CotizacionListParams): Promise<PaginatedResponse<Cotizacion>> => {
    const response = await apiClient.get<PaginatedResponse<Cotizacion>>('/v1/cotizaciones', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Cotizacion> => {
    const response = await apiClient.get<ApiResponse<Cotizacion>>(`/v1/cotizaciones/${id}`);
    return response.data.data;
  },

  create: async (data: CotizacionFormData): Promise<Cotizacion> => {
    const response = await apiClient.post<ApiResponse<Cotizacion>>('/v1/cotizaciones', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<CotizacionFormData>): Promise<Cotizacion> => {
    const response = await apiClient.put<ApiResponse<Cotizacion>>(`/v1/cotizaciones/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/cotizaciones/${id}`);
  },

  enviar: async (id: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/v1/cotizaciones/${id}/enviar`);
    return response.data;
  },

  aceptar: async (id: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/v1/cotizaciones/${id}/aceptar`);
    return response.data;
  },

  rechazar: async (id: number, data: { motivo_rechazo?: string }): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/v1/cotizaciones/${id}/rechazar`, data);
    return response.data;
  },

  convertir: async (id: number, data: { tipo_documento: 'invoice' | 'boleta' }): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/v1/cotizaciones/${id}/convertir`, data);
    return response.data;
  },

  duplicar: async (id: number): Promise<Cotizacion> => {
    const response = await apiClient.post<ApiResponse<Cotizacion>>(`/v1/cotizaciones/${id}/duplicar`);
    return response.data.data;
  },

  getEstadisticas: async (params?: { company_id?: number }): Promise<unknown> => {
    const response = await apiClient.get<ApiResponse<unknown>>('/v1/cotizaciones/estadisticas', { params });
    return response.data.data;
  },

  pendientesConversion: async (params?: ListQueryParams) => {
    const { data } = await apiClient.get('/v1/cotizaciones/pendientes-conversion', { params });
    return data;
  },

  vigentes: async (params?: ListQueryParams) => {
    const { data } = await apiClient.get('/v1/cotizaciones/vigentes', { params });
    return data;
  },

  marcarVencidas: async (): Promise<unknown> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/v1/cotizaciones/marcar-vencidas');
    return response.data.data;
  },
};
