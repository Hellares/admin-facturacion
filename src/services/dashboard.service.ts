import apiClient from '@/lib/axios';
import type { DashboardStatistics, MonthlySummary } from '@/types/dashboard.types';
import type { ApiResponse } from '@/types/api.types';

interface DashboardParams {
  company_id?: number;
  branch_id?: number;
  start_date?: string;
  end_date?: string;
}

export const dashboardService = {
  getStatistics: async (params?: DashboardParams): Promise<DashboardStatistics> => {
    const response = await apiClient.get<ApiResponse<DashboardStatistics>>('/v1/dashboard/statistics', { params });
    return response.data.data;
  },

  getMonthlySummary: async (params?: { company_id?: number; branch_id?: number; year?: number; month?: number }): Promise<MonthlySummary> => {
    const response = await apiClient.get<ApiResponse<MonthlySummary>>('/v1/dashboard/monthly-summary', { params });
    return response.data.data;
  },

  getClientStatistics: async (params?: DashboardParams): Promise<unknown> => {
    const response = await apiClient.get<ApiResponse<unknown>>('/v1/dashboard/client-statistics', { params });
    return response.data.data;
  },

  getRequiresResend: async (params?: { company_id?: number }): Promise<unknown[]> => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/v1/dashboard/requires-resend', { params });
    return response.data.data;
  },

  getExpiredCertificates: async (): Promise<unknown[]> => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/v1/dashboard/expired-certificates');
    return response.data.data;
  },
};
