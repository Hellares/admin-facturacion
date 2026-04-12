import apiClient from '@/lib/axios';
import type { DebitNote, DebitNoteFormData, DebitNoteListParams } from '@/types/debit-note.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const debitNoteService = {
  getAll: async (params?: DebitNoteListParams): Promise<PaginatedResponse<DebitNote>> => {
    const response = await apiClient.get<PaginatedResponse<DebitNote>>('/v1/debit-notes', { params });
    return response.data;
  },

  getById: async (id: number): Promise<DebitNote> => {
    const response = await apiClient.get<ApiResponse<DebitNote>>(`/v1/debit-notes/${id}`);
    return response.data.data;
  },

  create: async (data: DebitNoteFormData): Promise<DebitNote> => {
    const response = await apiClient.post<ApiResponse<DebitNote>>('/v1/debit-notes', data);
    return response.data.data;
  },

  sendToSunat: async (id: number): Promise<ApiResponse<DebitNote>> => {
    const response = await apiClient.post<ApiResponse<DebitNote>>(`/v1/debit-notes/${id}/send-sunat`);
    return response.data;
  },

  getMotivos: async (): Promise<{ codigo: string; descripcion: string }[]> => {
    const response = await apiClient.get<ApiResponse<{ codigo: string; descripcion: string }[]>>('/v1/debit-notes/catalogs/motivos');
    return response.data.data;
  },

  /**
   * Exporta notas de debito filtradas a XLSX.
   */
  exportToExcel: async (params?: DebitNoteListParams): Promise<void> => {
    const response = await apiClient.get('/v1/debit-notes/export', {
      params,
      responseType: 'blob',
      timeout: 90000,
    });
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const filename = `notas-debito-${new Date().toISOString().slice(0, 10)}.xlsx`;
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
