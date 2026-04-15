import type { SunatStatus, Moneda, ClienteDocumento } from './common.types';

export interface RetentionPago {
  moneda: Moneda;
  fecha: string;
  importe: number;
}

export interface RetentionTipoCambio {
  moneda_ref: string;
  moneda_obj: string;
  factor: number;
  fecha: string;
}

export interface RetentionDetail {
  tipo_doc: string;
  num_doc: string;
  fecha_emision: string;
  fecha_retencion: string;
  moneda: Moneda;
  imp_total: number;
  imp_pagar: number;
  imp_retenido: number;
  pagos: RetentionPago[];
  tipo_cambio: RetentionTipoCambio;
}

export interface Retention {
  id: number;
  company_id: number;
  branch_id: number;
  serie: string;
  correlativo: string;
  numero_completo: string;
  fecha_emision: string;
  moneda: Moneda;
  estado_sunat: SunatStatus;
  respuesta_sunat?: string;
  regimen: string;
  tasa: number;
  proveedor: ClienteDocumento;
  detalles: RetentionDetail[];
  imp_retenido: number;
  imp_pagado: number;
  observacion?: string;
  created_at: string;
  updated_at: string;
}

export interface RetentionFormData {
  company_id: number;
  branch_id: number;
  serie: string;
  correlativo: string;
  fecha_emision: string;
  moneda: Moneda;
  regimen: string;
  tasa: number;
  imp_retenido: number;
  imp_pagado: number;
  proveedor: ClienteDocumento;
  detalles: RetentionDetail[];
  observacion?: string;
}

export type EstadoUI = 'todos' | 'proceso' | 'pendiente' | 'en_cola' | 'validado' | 'rechazado' | 'error' | 'baja';

export interface RetentionListParams {
  company_id?: number;
  branch_id?: number;
  estado_sunat?: SunatStatus;
  estado_ui?: EstadoUI;
  fecha_desde?: string;
  fecha_hasta?: string;
  serie?: string;
  correlativo?: string;
  numero?: string;
  cliente_razon_social?: string;
  cliente_documento?: string;
  monto_desde?: number;
  monto_hasta?: number;
  search?: string;
  page?: number;
  per_page?: number;
}
