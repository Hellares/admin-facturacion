import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';

export interface DetraccionCatalog {
  codigo: string;
  descripcion: string;
  porcentaje: number;
}

export const catalogService = {
  getDetracciones: async (): Promise<DetraccionCatalog[]> => {
    const response = await apiClient.get<ApiResponse<DetraccionCatalog[]>>('/v1/catalogos/detracciones');
    return response.data.data;
  },

  getDetraccion: async (codigo: string): Promise<DetraccionCatalog> => {
    const response = await apiClient.get<ApiResponse<DetraccionCatalog>>(`/v1/catalogos/detracciones/${codigo}`);
    return response.data.data;
  },

  getCreditNoteMotivos: async (): Promise<{ codigo: string; descripcion: string }[]> => {
    const response = await apiClient.get<ApiResponse<{ codigo: string; descripcion: string }[]>>('/v1/credit-notes/catalogs/motivos');
    return response.data.data;
  },

  getDebitNoteMotivos: async (): Promise<{ codigo: string; descripcion: string }[]> => {
    const response = await apiClient.get<ApiResponse<{ codigo: string; descripcion: string }[]>>('/v1/debit-notes/catalogs/motivos');
    return response.data.data;
  },

  getDocumentTypes: async (): Promise<{ codigo: string; descripcion: string }[]> => {
    const response = await apiClient.get<ApiResponse<{ codigo: string; descripcion: string }[]>>('/v1/correlatives/document-types');
    return response.data.data;
  },

  buscarDetracciones: async (q: string): Promise<unknown[]> => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/v1/catalogos/detracciones/buscar', { params: { q } });
    return response.data.data;
  },

  getDetraccionesPorPorcentaje: async (): Promise<unknown> => {
    const response = await apiClient.get<ApiResponse<unknown>>('/v1/catalogos/detracciones/por-porcentaje');
    return response.data.data;
  },

  getMediosPagoDetraccion: async (): Promise<unknown[]> => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/v1/catalogos/detracciones/medios-pago');
    return response.data.data;
  },

  getDetraccionPorCodigo: async (codigo: string): Promise<unknown> => {
    const response = await apiClient.get<ApiResponse<unknown>>(`/v1/catalogos/detracciones/${codigo}`);
    return response.data.data;
  },

  calcularDetraccion: async (data: { codigo_bien_servicio: string; monto_total: number; porcentaje_personalizado?: number }): Promise<{ codigo_bien_servicio: string; descripcion: string; monto_total_operacion: number; porcentaje_detraccion: number; monto_detraccion: number; monto_neto_a_pagar: number }> => {
    const response = await apiClient.post<ApiResponse<{ codigo_bien_servicio: string; descripcion: string; monto_total_operacion: number; porcentaje_detraccion: number; monto_detraccion: number; monto_neto_a_pagar: number }>>('/v1/catalogos/detracciones/calcular', data);
    return response.data.data;
  },
};
