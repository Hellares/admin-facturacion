import type {
  SunatStatus, Moneda, FormaPagoTipo, DetalleItem, Cuota, MedioPago,
  ClienteDocumento, Detraccion, DescuentoGlobal, Leyenda, BancarizacionData,
} from './common.types';

export type MetodoEnvio = 'individual' | 'resumen_diario';
export type EstadoAnulacion = 'sin_anular' | 'pendiente_anulacion' | 'anulada';

export interface Boleta {
  id: number;
  company_id: number;
  origen?: 'web' | 'api';
  branch_id: number;
  serie: string;
  /** Correlativo en el formato que devuelve el backend (string zero-padded, ej. "000003") */
  correlativo: string;
  numero_completo: string;
  fecha_emision: string;
  fecha_vencimiento?: string;
  moneda: Moneda;
  tipo_operacion: string;
  estado_sunat: SunatStatus;
  respuesta_sunat?: string;
  hash_cdr?: string;
  metodo_envio: MetodoEnvio;
  forma_pago_tipo: FormaPagoTipo;
  forma_pago_cuotas?: Cuota[];
  cliente: ClienteDocumento;
  detalles: DetalleItem[];
  leyendas?: Leyenda[];
  detraccion?: Detraccion;
  descuentos?: DescuentoGlobal[];
  bancarizacion?: BancarizacionData;
  medios_pago?: MedioPago[];
  // Totales (nested from backend)
  totales?: {
    valor_venta?: number;
    gravada?: number;
    exonerada?: number;
    inafecta?: number;
    gratuita?: number;
    igv?: number;
    isc?: number;
    icbper?: number;
    total_impuestos?: number;
    descuentos?: number;
    total?: number;
  };
  // Legacy flat fields
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
  // Anulacion
  anulada_localmente: boolean;
  estado_anulacion: EstadoAnulacion;
  daily_summary_id?: number | null;
  motivo_anulacion?: string | null;
  motivo_anulacion_local?: string | null;
  fecha_solicitud_anulacion?: string | null;
  fecha_anulacion_local?: string | null;
  // Archivos
  xml_path?: string;
  cdr_path?: string;
  pdf_path?: string;
  usuario_creacion?: string;
  created_at: string;
  updated_at: string;
}

export interface BoletaFormData {
  company_id: number;
  branch_id: number;
  serie: string;
  fecha_emision: string;
  fecha_vencimiento?: string;
  moneda: Moneda;
  tipo_operacion?: string;
  metodo_envio: MetodoEnvio;
  forma_pago_tipo: FormaPagoTipo;
  forma_pago_cuotas?: Cuota[];
  client: ClienteDocumento;
  detalles: DetalleItem[];
  detraccion?: Detraccion;
  medios_pago?: MedioPago[];
  observaciones?: string;
}

/** Estado UI-friendly mapeado por backend a estados SUNAT */
export type EstadoUI = 'todos' | 'proceso' | 'pendiente' | 'en_cola' | 'validado' | 'rechazado' | 'error' | 'baja';

export interface BoletaListParams {
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
  cliente_razon_social?: string;
  cliente_documento?: string;
  monto_desde?: number;
  monto_hasta?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface PendingSummaryDate {
  fecha: string;
  cantidad: number;
  total: number;
}
