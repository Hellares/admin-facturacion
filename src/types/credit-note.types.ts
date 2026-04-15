import type {
  SunatStatus, Moneda, FormaPagoTipo, DetalleItem, Cuota, MedioPago,
  ClienteDocumento, Leyenda,
} from './common.types';

export interface CreditNote {
  id: number;
  company_id: number;
  origen?: 'web' | 'api';
  branch_id: number;
  serie: string;
  /** Correlativo en el formato que devuelve el backend (string zero-padded, ej. "000003") */
  correlativo: string;
  numero_completo: string;
  fecha_emision: string;
  moneda: Moneda;
  tipo_doc_afectado: '01' | '03';
  num_doc_afectado: string;
  cod_motivo: string;
  des_motivo: string;
  estado_sunat: SunatStatus;
  respuesta_sunat?: string;
  forma_pago_tipo: FormaPagoTipo;
  forma_pago_cuotas?: Cuota[];
  cliente: ClienteDocumento;
  detalles: DetalleItem[];
  leyendas?: Leyenda[];
  medios_pago?: MedioPago[];
  // Totales (nested from backend)
  totales?: {
    gravada?: number;
    exonerada?: number;
    inafecta?: number;
    igv?: number;
    isc?: number;
    icbper?: number;
    total_impuestos?: number;
    total?: number;
  };
  // Nested objects from backend
  tipo_nota?: string;
  documento_afectado?: { tipo?: string; serie?: string; numero?: string; numero_completo?: string };
  sunat?: { codigo?: string; descripcion?: string; notas?: string[] };
  // Legacy flat fields
  mto_oper_gravadas?: number;
  mto_oper_exoneradas?: number;
  mto_oper_inafectas?: number;
  mto_igv?: number;
  mto_isc?: number;
  mto_imp_venta?: number;
  // Estado de anulacion via Comunicacion de Baja (RA)
  anulado?: boolean;
  voided_document_id?: number | null;
  fecha_anulacion?: string | null;
  motivo_anulacion?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditNoteFormData {
  company_id: number;
  branch_id: number;
  serie: string;
  fecha_emision: string;
  moneda: Moneda;
  tipo_doc_afectado: '01' | '03';
  num_doc_afectado: string;
  cod_motivo: string;
  des_motivo?: string;
  forma_pago_tipo: FormaPagoTipo;
  forma_pago_cuotas?: Cuota[];
  client: ClienteDocumento;
  detalles: DetalleItem[];
  medios_pago?: MedioPago[];
  observaciones?: string;
}

export type EstadoUI = 'todos' | 'proceso' | 'pendiente' | 'en_cola' | 'validado' | 'rechazado' | 'error' | 'baja';

export interface CreditNoteListParams {
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

export interface MotivoNC {
  codigo: string;
  descripcion: string;
}
