import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';

export interface MonitorCorrelativosParams {
  tipo_documento: string;
  serie: string;
  branch_id?: number;
  desde?: number;
  hasta?: number;
}

export interface MonitorDocumento {
  correlativo: number;
  numero_completo: string;
  referencia_interna: string | null;
  cliente: {
    tipo_documento: string;
    numero_documento: string;
    razon_social: string;
  } | null;
  fecha_emision: string | null;
  estado_sunat: string;
  total: number | null;
  moneda: string | null;
  origen: string | null;
}

export interface MonitorCorrelativosData {
  serie: string;
  tipo_documento: string;
  tipo_documento_nombre: string;
  correlativo_actual: number;
  rango_consultado: { desde: number; hasta: number };
  total_en_rango: number;
  total_emitidos: number;
  total_gaps: number;
  integridad: string;
  gaps: number[];
  documentos: MonitorDocumento[];
}

export interface SerieInfo {
  serie: string;
  tipo_documento: string;
  tipo_documento_nombre: string;
  tipo_uso: string;
  correlativo_actual: number;
  proximo_numero: string;
}

export interface BranchSeries {
  branch_id: number;
  codigo: string;
  nombre: string;
  series: SerieInfo[];
}

export interface SeriesCorrelativosData {
  company_id: number;
  branches: BranchSeries[];
}

export const integracionService = {
  getSeriesCorrelativos: async (): Promise<SeriesCorrelativosData> => {
    const response = await apiClient.get<ApiResponse<SeriesCorrelativosData>>('/v1/integracion/series-correlativos');
    return response.data.data;
  },

  getMonitorCorrelativos: async (params: MonitorCorrelativosParams): Promise<MonitorCorrelativosData> => {
    const response = await apiClient.get<ApiResponse<MonitorCorrelativosData>>('/v1/integracion/monitor-correlativos', { params });
    return response.data.data;
  },
};
