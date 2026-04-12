import apiClient from '@/lib/axios';
import type { DailySummary, DailySummaryFormData, DailySummaryListParams } from '@/types/daily-summary.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const dailySummaryService = {
  getAll: async (params?: DailySummaryListParams): Promise<PaginatedResponse<DailySummary>> => {
    const response = await apiClient.get<PaginatedResponse<DailySummary>>('/v1/daily-summaries', { params });
    return response.data;
  },

  getById: async (id: number): Promise<DailySummary> => {
    const response = await apiClient.get<ApiResponse<DailySummary>>(`/v1/daily-summaries/${id}`);
    return response.data.data;
  },

  create: async (data: DailySummaryFormData): Promise<DailySummary> => {
    const response = await apiClient.post<ApiResponse<DailySummary>>('/v1/daily-summaries', data);
    return response.data.data;
  },

  sendToSunat: async (id: number): Promise<ApiResponse<DailySummary>> => {
    const response = await apiClient.post<ApiResponse<DailySummary>>(`/v1/daily-summaries/${id}/send-sunat`);
    return response.data;
  },

  checkStatus: async (id: number): Promise<ApiResponse<DailySummary>> => {
    const response = await apiClient.post<ApiResponse<DailySummary>>(`/v1/daily-summaries/${id}/check-status`);
    return response.data;
  },

  getPending: async (params?: { company_id?: number }): Promise<DailySummary[]> => {
    const response = await apiClient.get<ApiResponse<DailySummary[]>>('/v1/daily-summaries/pending', { params });
    return response.data.data;
  },

  checkAllPending: async (): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/v1/daily-summaries/check-all-pending');
    return response.data;
  },
};
