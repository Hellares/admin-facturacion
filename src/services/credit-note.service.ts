import apiClient from '@/lib/axios';
import type { CreditNote, CreditNoteFormData, CreditNoteListParams, MotivoNC } from '@/types/credit-note.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const creditNoteService = {
  getAll: async (params?: CreditNoteListParams): Promise<PaginatedResponse<CreditNote>> => {
    const response = await apiClient.get<PaginatedResponse<CreditNote>>('/v1/credit-notes', { params });
    return response.data;
  },

  getById: async (id: number): Promise<CreditNote> => {
    const response = await apiClient.get<ApiResponse<CreditNote>>(`/v1/credit-notes/${id}`);
    return response.data.data;
  },

  create: async (data: CreditNoteFormData): Promise<CreditNote> => {
    const response = await apiClient.post<ApiResponse<CreditNote>>('/v1/credit-notes', data);
    return response.data.data;
  },

  sendToSunat: async (id: number): Promise<ApiResponse<CreditNote>> => {
    const response = await apiClient.post<ApiResponse<CreditNote>>(`/v1/credit-notes/${id}/send-sunat`);
    return response.data;
  },

  getMotivos: async (): Promise<MotivoNC[]> => {
    const response = await apiClient.get<ApiResponse<MotivoNC[]>>('/v1/credit-notes/catalogs/motivos');
    return response.data.data;
  },

  /**
   * Exporta notas de credito filtradas a XLSX.
   */
  exportToExcel: async (params?: CreditNoteListParams): Promise<void> => {
    const response = await apiClient.get('/v1/credit-notes/export', {
      params,
      responseType: 'blob',
      timeout: 90000,
    });
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const filename = `notas-credito-${new Date().toISOString().slice(0, 10)}.xlsx`;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
