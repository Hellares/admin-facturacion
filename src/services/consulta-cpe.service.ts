import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';

export interface CpeResult {
  estado: string;
  codigo: string;
  mensaje: string;
  observaciones?: string[];
}

export const consultaCpeService = {
  consultarFactura: async (id: number): Promise<CpeResult> => {
    const response = await apiClient.post<ApiResponse<CpeResult>>(`/v1/consulta-cpe/factura/${id}`);
    return response.data.data;
  },
  consultarBoleta: async (id: number): Promise<CpeResult> => {
    const response = await apiClient.post<ApiResponse<CpeResult>>(`/v1/consulta-cpe/boleta/${id}`);
    return response.data.data;
  },
  consultarNotaCredito: async (id: number): Promise<CpeResult> => {
    const response = await apiClient.post<ApiResponse<CpeResult>>(`/v1/consulta-cpe/nota-credito/${id}`);
    return response.data.data;
  },
  consultarNotaDebito: async (id: number): Promise<CpeResult> => {
    const response = await apiClient.post<ApiResponse<CpeResult>>(`/v1/consulta-cpe/nota-debito/${id}`);
    return response.data.data;
  },
  consultaMasiva: async (data: { document_ids: number[]; tipo: string }): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/v1/consulta-cpe/masivo', data);
    return response.data;
  },
  getEstadisticas: async (): Promise<unknown> => {
    const response = await apiClient.get<ApiResponse<unknown>>('/v1/consulta-cpe/estadisticas');
    return response.data.data;
  },
};
