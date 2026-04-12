import axios from 'axios';
import { API_CONFIG } from '@/config/api.config';
import type { LoginResponse } from '@/types/auth.types';
import type { ApiResponse } from '@/types/api.types';
import type { RucResult } from '@/services/lookup.service';
import type { RegisterFormValues } from '@/schemas/register.schema';

// Cliente sin interceptor de auth para rutas publicas
const publicClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

export interface RegisterResponse extends LoginResponse {
  company: { id: number; ruc: string; razon_social: string };
}

export const registerService = {
  register: async (data: RegisterFormValues): Promise<RegisterResponse> => {
    const response = await publicClient.post<RegisterResponse>('/register', data);
    return response.data;
  },

  lookupRuc: async (ruc: string): Promise<RucResult> => {
    const response = await publicClient.get<ApiResponse<RucResult>>(`/lookup/ruc/${ruc}`);
    return response.data.data;
  },
};
