import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';

export interface SystemStatus {
  database_connected: boolean;
  migrations_pending: boolean;
  seeders_executed: boolean;
  companies_count: number;
  users_count: number;
  storage_writable: boolean;
  ready_for_use: boolean;
  setup_progress?: Record<string, unknown>;
}

export const setupService = {
  getStatus: async (): Promise<SystemStatus> => {
    const response = await apiClient.get<ApiResponse<SystemStatus>>('/setup/status');
    return response.data.data;
  },
  migrate: async (): Promise<string> => {
    const response = await apiClient.post<ApiResponse<{ output: string }>>('/setup/migrate');
    return response.data.data.output;
  },
  seed: async (seederClass?: string): Promise<string> => {
    const response = await apiClient.post<ApiResponse<{ output: string }>>('/setup/seed', seederClass ? { class: seederClass } : {});
    return response.data.data.output;
  },
  setup: async (data: Record<string, unknown>): Promise<unknown> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/v1/setup/complete', data);
    return response.data.data;
  },
  configureSunat: async (data: { company_id: number; environment: string; force_update?: boolean }): Promise<unknown> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/v1/setup/configure-sunat', data);
    return response.data.data;
  },
};
