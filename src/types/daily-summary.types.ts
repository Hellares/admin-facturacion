import type { SunatStatus } from './common.types';

export type EstadoProceso = 'GENERADO' | 'ENVIADO' | 'PROCESANDO' | 'COMPLETADO' | 'ERROR';

export interface DailySummary {
  id: number;
  company_id: number;
  numero_completo: string;
  fecha_resumen: string;
  fecha_generacion: string;
  estado_proceso: EstadoProceso;
  estado_sunat: SunatStatus;
  respuesta_sunat?: string;
  hash_cdr?: string;
  ticket?: string;
  cantidad_boletas: number;
  total: number;
  xml_path?: string;
  cdr_path?: string;
  created_at: string;
  updated_at: string;
}

export interface DailySummaryFormData {
  company_id: number;
  branch_id: number;
  fecha_resumen: string;
}

export interface DailySummaryListParams {
  company_id?: number;
  estado_sunat?: SunatStatus;
  estado_proceso?: EstadoProceso;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  per_page?: number;
}
