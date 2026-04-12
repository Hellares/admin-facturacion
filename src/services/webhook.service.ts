import apiClient from '@/lib/axios';
import type { ApiResponse, PaginatedResponse, ListQueryParams } from '@/types/api.types';

export interface Webhook {
  id: number;
  company_id: number;
  name: string;
  url: string;
  method: string;
  events: string[];
  active: boolean;
  timeout: number;
  max_retries: number;
  retry_delay: number;
  headers?: Record<string, string>;
  secret?: string;
  success_count: number;
  failure_count: number;
  last_triggered_at: string | null;
  created_at: string;
}

export interface WebhookDelivery {
  id: number;
  webhook_id: number;
  event: string;
  status: 'pending' | 'success' | 'failed';
  attempts: number;
  response_code: number | null;
  error_message: string | null;
  delivered_at: string | null;
  created_at: string;
}

export const webhookService = {
  getAll: async (params?: ListQueryParams): Promise<PaginatedResponse<Webhook>> => {
    const response = await apiClient.get<PaginatedResponse<Webhook>>('/v1/webhooks', { params });
    return response.data;
  },
  getById: async (id: number): Promise<Webhook> => {
    const response = await apiClient.get<ApiResponse<Webhook>>(`/v1/webhooks/${id}`);
    return response.data.data;
  },
  create: async (data: Partial<Webhook>): Promise<Webhook> => {
    const response = await apiClient.post<ApiResponse<Webhook>>('/v1/webhooks', data);
    return response.data.data;
  },
  update: async (id: number, data: Partial<Webhook>): Promise<Webhook> => {
    const response = await apiClient.put<ApiResponse<Webhook>>(`/v1/webhooks/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number): Promise<void> => { await apiClient.delete(`/v1/webhooks/${id}`); },
  test: async (id: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/v1/webhooks/${id}/test`);
    return response.data;
  },
  getDeliveries: async (id: number): Promise<WebhookDelivery[]> => {
    const response = await apiClient.get<ApiResponse<WebhookDelivery[]>>(`/v1/webhooks/${id}/deliveries`);
    return response.data.data;
  },
  retryDelivery: async (deliveryId: number): Promise<void> => {
    await apiClient.post(`/v1/webhooks/deliveries/${deliveryId}/retry`);
  },
};
