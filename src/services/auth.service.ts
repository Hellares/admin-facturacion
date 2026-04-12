import apiClient from '@/lib/axios';
import type { LoginRequest, LoginResponse, AuthUser } from '@/types/auth.types';
import type { ApiResponse } from '@/types/api.types';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/v1/auth/logout');
  },

  me: async (): Promise<AuthUser> => {
    const response = await apiClient.get<ApiResponse<AuthUser>>('/v1/auth/me');
    return response.data.data;
  },

  initialize: async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/initialize', data);
    return response.data;
  },
};
