import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';

export interface DniResult {
  numero: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_completo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  direccion_completa: string;
  ubigeo_sunat: string;
}

export interface RucResult {
  numero: string;
  nombre_o_razon_social: string;
  estado: string;
  condicion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  direccion_completa: string;
  ubigeo_sunat: string;
  es_agente_de_retencion: string;
  es_buen_contribuyente: string;
}

export interface LicenciaResult {
  numero_documento: string;
  nombre_completo: string;
  licencia: {
    numero: string;
    categoria: string;
    fecha_expedicion: string;
    fecha_vencimiento: string;
    estado: string;
    restricciones: string;
  };
}

export interface PlacaResult {
  placa: string;
  marca: string;
  modelo: string;
  serie: string;
  color: string;
  motor: string;
  vin: string;
}

export const lookupService = {
  dni: async (numero: string): Promise<DniResult> => {
    const response = await apiClient.get<ApiResponse<DniResult>>(`/v1/lookup/dni/${numero}`);
    return response.data.data;
  },

  ruc: async (numero: string): Promise<RucResult> => {
    const response = await apiClient.get<ApiResponse<RucResult>>(`/v1/lookup/ruc/${numero}`);
    return response.data.data;
  },

  licencia: async (dni: string): Promise<LicenciaResult> => {
    const response = await apiClient.get<ApiResponse<LicenciaResult>>(`/v1/lookup/licencia/${dni}`);
    return response.data.data;
  },

  placa: async (placa: string): Promise<PlacaResult> => {
    const response = await apiClient.get<ApiResponse<PlacaResult>>(`/v1/lookup/placa/${placa}`);
    return response.data.data;
  },
};
