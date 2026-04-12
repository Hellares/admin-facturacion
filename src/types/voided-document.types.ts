import type { SunatStatus } from './common.types';

export interface VoidedDocument {
  id: number;
  company_id: number;
  branch_id?: number;
  /**
   * Identificador SUNAT canonico (ej. "20123456789-RA-20260411-001").
   * El backend expone este nombre de forma consistente en index/show/store.
   */
  numero_completo: string;
  serie?: string;
  correlativo?: string;
  fecha_emision: string;
  fecha_comunicacion?: string;
  fecha_generacion?: string;
  fecha_referencia?: string;
  estado_sunat: SunatStatus;
  respuesta_sunat?: string | null;
  hash_cdr?: string | null;
  ticket?: string | null;
  motivo_baja?: string;
  cantidad_documentos?: number;
  total_documentos?: number;
  documentos: VoidedDocItem[];
  xml_path?: string | null;
  cdr_path?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface VoidedDocItem {
  tipo_documento: string;
  serie: string;
  /**
   * Correlativo como string tal cual devuelve el backend (zero-padded a
   * 6 digitos en este proyecto, ej. "000003"). Enviar cualquier otra forma
   * rompe la busqueda del backend al crear una Comunicacion de Baja.
   */
  correlativo: string;
  /** Numero completo del documento anulado, ej. "F001-000003" */
  numero_completo?: string;
  motivo_especifico?: string;
}

export interface VoidedDocumentFormData {
  company_id: number;
  branch_id: number;
  fecha_referencia: string;
  motivo_baja: string;
  detalles: VoidedDocItem[];
}

export interface VoidedReason {
  codigo: string;
  descripcion: string;
  categoria?: string;
}

export interface AvailableDocument {
  id: number;
  tipo: string;
  numero_completo: string;
  serie: string;
  correlativo: number;
  fecha_emision: string;
  cliente: string;
  monto: number;
}
