import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';

export interface MedioPagoCatalog {
  codigo: string;
  descripcion: string;
}

export const bancarizacionService = {
  getMediosPago: async (): Promise<MedioPagoCatalog[]> => {
    const response = await apiClient.get<ApiResponse<MedioPagoCatalog[]>>('/v1/bancarizacion/medios-pago');
    return response.data.data;
  },
  validar: async (data: { monto: number; moneda: string }): Promise<unknown> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/v1/bancarizacion/validar', data);
    return response.data.data;
  },
  getReporteSinBancarizacion: async (params?: { company_id?: number }): Promise<unknown[]> => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/v1/bancarizacion/reportes/sin-bancarizacion', { params });
    return response.data.data;
  },
  getEstadisticas: async (params?: { company_id?: number }): Promise<unknown> => {
    const response = await apiClient.get<ApiResponse<unknown>>('/v1/bancarizacion/estadisticas', { params });
    return response.data.data;
  },
};
