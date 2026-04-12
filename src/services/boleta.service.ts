import apiClient from '@/lib/axios';
import type { Boleta, BoletaFormData, BoletaListParams, PendingSummaryDate } from '@/types/boleta.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const boletaService = {
  getAll: async (params?: BoletaListParams): Promise<PaginatedResponse<Boleta>> => {
    const response = await apiClient.get<PaginatedResponse<Boleta>>('/v1/boletas', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Boleta> => {
    const response = await apiClient.get<ApiResponse<Boleta>>(`/v1/boletas/${id}`);
    return response.data.data;
  },

  create: async (data: BoletaFormData): Promise<Boleta> => {
    const response = await apiClient.post<ApiResponse<Boleta>>('/v1/boletas', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<BoletaFormData>): Promise<Boleta> => {
    const response = await apiClient.put<ApiResponse<Boleta>>(`/v1/boletas/${id}`, data);
    return response.data.data;
  },

  sendToSunat: async (id: number): Promise<ApiResponse<Boleta>> => {
    const response = await apiClient.post<ApiResponse<Boleta>>(`/v1/boletas/${id}/send-sunat`);
    return response.data;
  },

  generatePdf: async (id: number): Promise<void> => {
    await apiClient.post(`/v1/boletas/${id}/generate-pdf`);
  },

  /**
   * Exporta el listado de boletas filtradas a XLSX y dispara la descarga.
   */
  exportToExcel: async (params?: BoletaListParams): Promise<void> => {
    const response = await apiClient.get('/v1/boletas/export', {
      params,
      responseType: 'blob',
      timeout: 90000,
    });
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const filename = `boletas-${new Date().toISOString().slice(0, 10)}.xlsx`;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Daily Summary management
  getPendingDates: async (params?: { company_id?: number }): Promise<PendingSummaryDate[]> => {
    const response = await apiClient.get<ApiResponse<PendingSummaryDate[]>>('/v1/boletas/fechas-pendientes-resumen', { params });
    return response.data.data;
  },

  getPendingForSummary: async (params?: { company_id?: number }): Promise<Boleta[]> => {
    const response = await apiClient.get<ApiResponse<Boleta[]>>('/v1/boletas/pending-for-summary', { params });
    return response.data.data;
  },

  createDailySummary: async (data: { company_id: number; branch_id: number; fecha_resumen: string }): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/v1/boletas/create-daily-summary', data);
    return response.data;
  },

  createAllPendingSummaries: async (data: { company_id: number }): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/v1/boletas/create-all-pending-summaries', data);
    return response.data;
  },

  // Void management
  getVencidas: async (params?: { company_id?: number }): Promise<Boleta[]> => {
    const response = await apiClient.get<ApiResponse<Boleta[]>>('/v1/boletas/vencidas', { params });
    return response.data.data;
  },

  getAnulables: async (params: { company_id: number; branch_id: number }): Promise<unknown> => {
    const response = await apiClient.get<ApiResponse<unknown>>('/v1/boletas/anulables', { params });
    return response.data.data;
  },

  /**
   * Anula localmente una o mas boletas (solo DB local, sin notificar SUNAT).
   * El backend exige que las boletas NO esten en estado ACEPTADO.
   */
  anularLocalmente: async (data: {
    boletas_ids: number[];
    motivo: string;
    observaciones?: string;
  }): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/v1/boletas/anular-localmente', data);
    return response.data;
  },

  /**
   * Anula oficialmente ante SUNAT generando un Resumen Diario tipo RA (anulacion).
   * Retorna el daily summary creado. El usuario debe enviarlo a SUNAT por separado
   * via POST /v1/daily-summaries/{id}/send-sunat.
   *
   * Requisitos backend:
   *   - Todas las boletas deben ser del mismo branch y mismo fecha_emision
   *   - Deben estar en estado ACEPTADO y dentro de los 3 dias de emitidas
   *   - No pueden estar ya anuladas o pendientes de anulacion
   */
  anularOficialmente: async (data: {
    company_id: number;
    branch_id: number;
    boletas_ids: number[];
    motivo_anulacion: string;
  }): Promise<{
    summary: { id: number; numero_completo: string };
    boletas_count: number;
    boletas_ids: number[];
  }> => {
    const response = await apiClient.post<ApiResponse<{
      summary: { id: number; numero_completo: string };
      boletas_count: number;
      boletas_ids: number[];
    }>>('/v1/boletas/anular-oficialmente', data);
    return response.data.data;
  },
};
