import apiClient from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export interface PlazoAlert {
  id: number;
  tipo_documento: string;
  tipo_nombre: string;
  numero_completo: string;
  documento_id?: number;
  fecha_emision: string;
  fecha_limite: string;
  dias_restantes: number;
  nivel_urgencia: 'normal' | 'proximo' | 'urgente' | 'vencido';
  color: string;
  cliente?: string | null;
  monto?: number | null;
  enviada?: boolean;
}

export interface PlazoResumen {
  total_pendientes: number;
  vencidos: number;
  urgentes: number;
  proximos: number;
  requiere_accion_inmediata: boolean;
}

export const plazoAlertService = {
  getAll: async (params?: { company_id?: number }): Promise<PlazoAlert[]> => {
    const response = await apiClient.get<ApiResponse<{ documentos: PlazoAlert[]; resumen: PlazoResumen }>>('/v1/alertas-plazo', { params });
    return response.data.data.documentos ?? [];
  },
  getResumen: async (params?: { company_id?: number }): Promise<PlazoResumen> => {
    const response = await apiClient.get<ApiResponse<PlazoResumen>>('/v1/alertas-plazo/resumen', { params });
    return response.data.data;
  },
  getDocumentosPendientes: async (params?: { company_id?: number }): Promise<unknown[]> => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/v1/alertas-plazo/documentos-pendientes', { params });
    return response.data.data;
  },
  verificarAhora: async (): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/v1/alertas-plazo/verificar-ahora');
    return response.data;
  },
  marcarEnviada: async (id: number): Promise<void> => {
    await apiClient.post(`/v1/alertas-plazo/${id}/marcar-enviada`);
  },

  getHistorial: async (params: { company_id: number; fecha_desde?: string; fecha_hasta?: string; nivel?: string; per_page?: number; page?: number }): Promise<PaginatedResponse<PlazoAlert>> => {
    const response = await apiClient.get<PaginatedResponse<PlazoAlert>>('/v1/alertas-plazo/historial', { params });
    return response.data;
  },

  verificarPlazo: async (tipo_documento: string, fecha_emision: string): Promise<unknown> => {
    const response = await apiClient.get<ApiResponse<unknown>>('/v1/alertas-plazo/verificar', { params: { tipo_documento, fecha_emision } });
    return response.data.data;
  },

  getPlazosSunat: async (): Promise<{ plazos: Record<string, { nombre: string; plazo_dias: number }>; referencia_legal: string; nota: string }> => {
    const response = await apiClient.get<ApiResponse<{ plazos: Record<string, { nombre: string; plazo_dias: number }>; referencia_legal: string; nota: string }>>('/v1/alertas-plazo/plazos-sunat');
    return response.data.data;
  },
};
