import apiClient from '@/lib/axios';
import type { User, UserFormData } from '@/types/user.types';
import type { ApiResponse, PaginatedResponse, ListQueryParams } from '@/types/api.types';

export const userService = {
  getAll: async (params?: ListQueryParams): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>('/v1/users', { params });
    return response.data;
  },
  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/v1/users/${id}`);
    return response.data.data;
  },
  create: async (data: UserFormData): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/v1/users', data);
    return response.data.data;
  },
  update: async (id: number, data: Partial<UserFormData>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/v1/users/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number): Promise<void> => { await apiClient.delete(`/v1/users/${id}`); },
  toggleActive: async (id: number): Promise<void> => { await apiClient.post(`/v1/users/${id}/toggle-active`); },
  unlock: async (id: number): Promise<void> => { await apiClient.post(`/v1/users/${id}/unlock`); },
  resetPassword: async (id: number): Promise<void> => { await apiClient.post(`/v1/users/${id}/reset-password`); },
  getTokenInfo: async (id: number) => {
    const response = await apiClient.get<ApiResponse<TokenInfoResponse>>(`/v1/users/${id}/token-info`);
    return response.data.data;
  },
  generateToken: async (id: number) => {
    const response = await apiClient.post<ApiResponse<TokenInfoResponse>>(`/v1/users/${id}/generate-token`);
    return response.data.data;
  },
};

export interface TokenInfoResponse {
  has_token: boolean;
  user: { id: number; name: string; email: string; role: string; company: string | null };
  access_token?: string;
  token_type?: string;
  api_base_url: string;
  company_id: number | null;
  created_at?: string;
}
