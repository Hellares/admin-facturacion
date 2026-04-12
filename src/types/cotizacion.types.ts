import type { Moneda, FormaPagoTipo, DetalleItem, Cuota, ClienteDocumento } from './common.types';

export type EstadoCotizacion = 'borrador' | 'enviada' | 'aceptada' | 'rechazada' | 'vencida' | 'convertida';

export interface Cotizacion {
  id: number;
  company_id: number;
  branch_id: number;
  serie: string;
  correlativo: number;
  numero_completo: string;
  fecha_emision: string;
  fecha_validez: string;
  dias_validez: number;
  moneda: Moneda;
  tipo_operacion: string;
  estado: EstadoCotizacion;
  forma_pago_tipo: FormaPagoTipo;
  forma_pago_cuotas?: Cuota[];
  cliente: ClienteDocumento;
  detalles: DetalleItem[];
  // Totales (nested from backend)
  totales?: {
    valor_venta?: number;
    mto_oper_gravadas?: number;
    mto_oper_exoneradas?: number;
    mto_oper_inafectas?: number;
    mto_oper_gratuitas?: number;
    mto_igv?: number;
    mto_isc?: number;
    mto_icbper?: number;
    total_impuestos?: number;
    sub_total?: number;
    mto_descuentos?: number;
    mto_imp_venta?: number;
    // index list format
    gravada?: number;
    igv?: number;
    total?: number;
  };
  // Legacy flat fields
  mto_oper_gravadas?: number;
  mto_igv?: number;
  mto_imp_venta?: number;
  condiciones?: string;
  notas?: string;
  contacto_cliente?: string;
  motivo_rechazo?: string;
  documento_convertido_tipo?: string;
  documento_convertido_id?: number;
  observaciones?: string;
  usuario_creacion?: string;
  created_at: string;
  updated_at: string;
}

export interface CotizacionFormData {
  company_id: number;
  branch_id: number;
  serie: string;
  fecha_emision: string;
  dias_validez: number;
  moneda: Moneda;
  tipo_operacion?: string;
  forma_pago_tipo: FormaPagoTipo;
  forma_pago_cuotas?: Cuota[];
  client: ClienteDocumento;
  detalles: DetalleItem[];
  condiciones?: string;
  notas?: string;
  contacto_cliente?: string;
  telefono_contacto?: string;
  email_contacto?: string;
  observaciones?: string;
}

export interface CotizacionListParams {
  company_id?: number;
  branch_id?: number;
  estado?: EstadoCotizacion;
  fecha_desde?: string;
  fecha_hasta?: string;
  search?: string;
  page?: number;
  per_page?: number;
}
