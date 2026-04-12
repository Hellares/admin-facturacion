import type { SunatStatus } from '@/types/common.types';

/**
 * Origen (tipo SUNAT) de la anulacion:
 *   - RC: Resumen Diario de Boletas con detalles estado=3 (anulaciones de boletas)
 *   - RA: Comunicacion de Baja (anulaciones de facturas/NC/ND)
 */
export type AnulacionOrigen = 'RC' | 'RA';

/**
 * Tipo de documento anulado (catalogo 01 SUNAT):
 *   01 = Factura
 *   03 = Boleta
 *   07 = Nota de Credito
 *   08 = Nota de Debito
 */
export type TipoDocumentoAnulado = '01' | '03' | '07' | '08';

/**
 * Documento individual dentro de una anulacion. Una anulacion (sea RC o RA)
 * puede contener uno o mas documentos afectados.
 */
export interface AnulacionDocumento {
  tipo_documento: TipoDocumentoAnulado;
  /** Numero completo (ej. "F001-000123" o "B001-000045") */
  numero: string;
  motivo?: string;
}

/**
 * Item unificado de una anulacion, independiente de si su origen es RC o RA.
 * La pagina /anulaciones renderiza una tabla de estos items.
 */
export interface AnulacionItem {
  /** ID del documento (daily_summary.id o voided_document.id) */
  id: number;
  origen: AnulacionOrigen;
  /** Identificador SUNAT (ej. "RC-20260411-001" o "20123456789-RA-20260411-001") */
  identificador: string;
  fecha: string;
  estado_sunat: SunatStatus;
  respuesta_sunat?: string | null;
  ticket?: string | null;
  /** Cantidad de documentos afectados */
  cantidad_documentos: number;
  /** Lista de documentos afectados (puede estar vacia si no estan cargados) */
  documentos: AnulacionDocumento[];
  /** Ruta al detalle en el modulo correspondiente (daily-summaries/xxx o voided-documents/xxx) */
  detalleRuta: string;
}
