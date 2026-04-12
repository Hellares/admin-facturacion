import type {
  SunatStatus, Moneda, FormaPagoTipo, DetalleItem, Cuota, MedioPago,
  ClienteDocumento, Detraccion, Percepcion, RetencionDoc, DescuentoGlobal,
  Anticipo, DocumentoRelacionado, Leyenda, BancarizacionData,
} from './common.types';

export interface Invoice {
  id: number;
  company_id: number;
  branch_id: number;
  serie: string;
  /** Correlativo en el formato que devuelve el backend (string zero-padded, ej. "000003") */
  correlativo: string;
  numero_completo: string;
  /** Estado de anulacion via Comunicacion de Baja (RA) aceptada por SUNAT */
  anulado?: boolean;
  voided_document_id?: number | null;
  fecha_anulacion?: string | null;
  motivo_anulacion?: string | null;
  fecha_emision: string;
  fecha_vencimiento?: string;
  moneda: Moneda;
  tipo_operacion: string;
  estado_sunat: SunatStatus;
  respuesta_sunat?: string;
  hash_cdr?: string;
  notas_cdr?: string;
  forma_pago_tipo: FormaPagoTipo;
  forma_pago_cuotas?: Cuota[];
  cliente: ClienteDocumento;
  detalles: DetalleItem[];
  leyendas?: Leyenda[];
  detraccion?: Detraccion;
  percepcion?: Percepcion;
  retencion?: RetencionDoc;
  descuentos?: DescuentoGlobal[];
  anticipos?: Anticipo[];
  guias?: DocumentoRelacionado[];
  documentos_relacionados?: DocumentoRelacionado[];
  bancarizacion?: BancarizacionData;
  medios_pago?: MedioPago[];
  // Totales (nested from backend)
  totales?: {
    valor_venta?: number;
    gravada?: number;
    exonerada?: number;
    inafecta?: number;
    exportacion?: number;
    gratuita?: number;
    igv?: number;
    isc?: number;
    icbper?: number;
    total_impuestos?: number;
    descuentos?: number;
    total?: number;
  };
  // Legacy flat fields (kept for backwards compatibility)
  mto_oper_gravadas?: number;
  mto_oper_exoneradas?: number;
  mto_oper_inafectas?: number;
  mto_oper_gratuitas?: number;
  mto_igv?: number;
  mto_isc?: number;
  mto_icbper?: number;
  mto_otros_cargos?: number;
  mto_descuentos?: number;
  valor_venta?: number;
  sub_total?: number;
  mto_imp_venta?: number;
  // Nested objects from backend
  forma_pago?: { tipo?: string; cuotas?: Cuota[] };
  sunat?: { codigo?: string; descripcion?: string; notas?: string[] };
  // Notas de credito y debito asociadas
  credit_notes?: Array<{
    id: number;
    numero_completo: string;
    motivo: string;
    cod_motivo: string;
    estado_sunat: string;
    total: number;
    moneda: string;
  }>;
  debit_notes?: Array<{
    id: number;
    numero_completo: string;
    motivo: string;
    cod_motivo: string;
    estado_sunat: string;
    total: number;
    moneda: string;
  }>;
  // Archivos
  xml_path?: string;
  cdr_path?: string;
  pdf_path?: string;
  usuario_creacion?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceFormData {
  company_id: number;
  branch_id: number;
  serie: string;
  fecha_emision: string;
  fecha_vencimiento?: string;
  moneda: Moneda;
  tipo_operacion?: string;
  forma_pago_tipo: FormaPagoTipo;
  forma_pago_cuotas?: Cuota[];
  client: ClienteDocumento;
  detalles: DetalleItem[];
  detraccion?: Detraccion;
  percepcion?: Percepcion;
  retencion?: RetencionDoc;
  descuentos?: DescuentoGlobal[];
  anticipos?: Anticipo[];
  guias?: DocumentoRelacionado[];
  documentos_relacionados?: DocumentoRelacionado[];
  bancarizacion?: BancarizacionData;
  medios_pago?: MedioPago[];
  observaciones?: string;
  numero_orden_compra?: string;
  numero_guia?: string;
  datos_adicionales?: Record<string, unknown>;
  leyendas?: Leyenda[];
}

/** Estado UI-friendly mapeado por backend a estados SUNAT */
export type EstadoUI = 'todos' | 'proceso' | 'validado' | 'error' | 'baja';

export interface InvoiceListParams {
  company_id?: number;
  branch_id?: number;
  estado_sunat?: SunatStatus;
  estado_ui?: EstadoUI;
  fecha_desde?: string;
  fecha_hasta?: string;
  moneda?: Moneda;
  serie?: string;
  correlativo?: string;
  numero?: string;
  client_id?: number;
  cliente_razon_social?: string;
  cliente_documento?: string;
  monto_desde?: number;
  monto_hasta?: number;
  search?: string;
  page?: number;
  per_page?: number;
}
