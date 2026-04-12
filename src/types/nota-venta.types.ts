import type { Moneda, ClienteDocumento } from './common.types';

export type EstadoConversion = 'pendiente' | 'convertida' | 'anulada';

export interface NotaVentaDetalle {
  codigo: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_unitario: number;
  codigo_afectacion_igv?: string;
  porcentaje_igv?: number;
  descuento?: number;
}

export interface NotaVenta {
  id: number;
  company_id: number;
  branch_id: number;
  serie: string;
  correlativo: number;
  numero_completo: string;
  fecha_emision: string;
  moneda: Moneda;
  estado_conversion: EstadoConversion;
  documento_convertido_tipo?: string;
  documento_convertido_id?: number;
  documento_convertido_numero?: string;
  cliente: ClienteDocumento;
  detalles: NotaVentaDetalle[];
  // Totales (nested from backend)
  totales?: {
    gravada?: number;
    inafecta?: number;
    exonerada?: number;
    gratuita?: number;
    exportacion?: number;
    igv?: number;
    isc?: number;
    icbper?: number;
    otros_cargos?: number;
    total_impuestos?: number;
    valor_venta?: number;
    precio_venta?: number;
    descuentos?: number;
    total?: number;
    redondeo?: number;
  };
  // Legacy flat field
  total?: number;
  observaciones?: string;
  usuario_creacion?: string;
  created_at: string;
  updated_at: string;
}

export interface NotaVentaFormData {
  company_id: number;
  branch_id: number;
  serie: string;
  fecha_emision: string;
  moneda: Moneda;
  client: ClienteDocumento;
  detalles: NotaVentaDetalle[];
  observaciones?: string;
}

export interface NotaVentaListParams {
  company_id?: number;
  branch_id?: number;
  estado_conversion?: EstadoConversion;
  fecha_desde?: string;
  fecha_hasta?: string;
  search?: string;
  page?: number;
  per_page?: number;
}
