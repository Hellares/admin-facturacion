import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';

export interface UbigeoRegion {
  id: string;
  nombre: string;
}

export interface UbigeoProvincia {
  id: string;
  nombre: string;
  region_id: string;
}

export interface UbigeoDistrito {
  id: string;
  nombre: string;
  provincia_id: string;
}

export interface UbigeoEntry {
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

export const ubigeoService = {
  getAll: async (): Promise<UbigeoEntry[]> => {
    const response = await apiClient.get<ApiResponse<UbigeoEntry[]>>('/v1/ubigeos/all');
    return response.data.data;
  },

  getRegiones: async (): Promise<UbigeoRegion[]> => {
    const response = await apiClient.get<ApiResponse<UbigeoRegion[]>>('/v1/ubigeos/regiones');
    return response.data.data;
  },

  getProvincias: async (regionId?: string): Promise<UbigeoProvincia[]> => {
    const params = regionId ? { region_id: regionId } : {};
    const response = await apiClient.get<ApiResponse<UbigeoProvincia[]>>('/v1/ubigeos/provincias', { params });
    return response.data.data;
  },

  getDistritos: async (provinciaId?: string): Promise<UbigeoDistrito[]> => {
    const params = provinciaId ? { provincia_id: provinciaId } : {};
    const response = await apiClient.get<ApiResponse<UbigeoDistrito[]>>('/v1/ubigeos/distritos', { params });
    return response.data.data;
  },

  search: async (query: string): Promise<UbigeoDistrito[]> => {
    const response = await apiClient.get<ApiResponse<UbigeoDistrito[]>>('/v1/ubigeos/search', { params: { q: query } });
    return response.data.data;
  },

  getById: async (id: number): Promise<unknown> => {
    const response = await apiClient.get<ApiResponse<unknown>>(`/v1/ubigeos/${id}`);
    return response.data.data;
  },
};
