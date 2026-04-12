// === Estados SUNAT ===
export type SunatStatus =
  | 'PENDIENTE'
  | 'ENVIANDO'
  | 'ENVIADO'
  | 'PROCESANDO'
  | 'ACEPTADO'
  | 'RECHAZADO'
  | 'ERROR';

// === Moneda ===
export type Moneda = 'PEN' | 'USD';

// === Tipo Documento Cliente ===
export type TipoDocumentoCliente = '0' | '1' | '4' | '6' | '7';

// === Forma de Pago ===
export type FormaPagoTipo = 'Contado' | 'Credito';

// === Tipo Afectacion IGV ===
export type TipoAfectacionIGV =
  | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' // Gravado
  | '20' | '21'                                             // Exonerado
  | '30' | '31' | '32' | '33' | '34' | '35' | '36' | '37' // Inafecto
  | '40';                                                    // Exportacion

// === Detalle Item (compartido entre documentos) ===
export interface DetalleItem {
  codigo: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  mto_valor_unitario?: number;
  mto_precio_unitario?: number;
  tip_afe_igv: TipoAfectacionIGV;
  porcentaje_igv: number;
  igv?: number;
  tip_sis_isc?: '01' | '02' | '03';
  porcentaje_isc?: number;
  isc?: number;
  factor_icbper?: number;
  icbper?: number;
  mto_valor_venta?: number;
  mto_base_igv?: number;
  total_impuestos?: number;
  descuentos?: DescuentoLinea[];
}

export interface DescuentoLinea {
  cod_tipo: '00' | '01' | '02' | '03';
  factor: number;
  monto: number;
  monto_base?: number;
}

// === Cuota (pago a credito) ===
export interface Cuota {
  moneda: Moneda;
  monto: number;
  fecha_pago: string;
}

// === Medio de Pago ===
export interface MedioPago {
  tipo: string;
  monto: number;
  referencia?: string;
}

// === Leyenda ===
export interface Leyenda {
  code: string;
  value: string;
}

// === Detraccion ===
export interface Detraccion {
  codigo_bien_servicio: string;
  codigo_medio_pago?: string;
  cuenta_banco: string;
  porcentaje?: number;
  monto?: number;
}

// === Percepcion ===
export interface Percepcion {
  cod_regimen: string;
  tasa: number;
  monto: number;
  monto_base: number;
}

// === Retencion (en documento) ===
export interface RetencionDoc {
  cod_regimen: string;
  tasa: number;
  monto: number;
  monto_base: number;
}

// === Descuento Global ===
export interface DescuentoGlobal {
  cod_tipo: '00' | '01' | '02' | '03' | '04';
  factor: number;
  monto: number;
}

// === Anticipo ===
export interface Anticipo {
  tipo_doc_rel: '02' | '03';
  nro_doc_rel: string;
  total: number;
}

// === Documento Relacionado ===
export interface DocumentoRelacionado {
  tipo_doc: string;
  nro_doc: string;
}

// === Totales calculados ===
export interface TotalesDocumento {
  mto_oper_gravadas: number;
  mto_oper_exoneradas: number;
  mto_oper_inafectas: number;
  mto_oper_gratuitas: number;
  mto_igv: number;
  mto_isc: number;
  mto_icbper: number;
  mto_otros_cargos: number;
  mto_descuentos: number;
  valor_venta: number;
  sub_total: number;
  mto_imp_venta: number;
}

// === Cliente embebido en documento ===
export interface ClienteDocumento {
  tipo_documento: TipoDocumentoCliente;
  numero_documento: string;
  razon_social: string;
  nombre_comercial?: string;
  direccion?: string;
  ubigeo?: string;
  telefono?: string;
  email?: string;
}

// === Bancarizacion ===
export interface BancarizacionData {
  medio_pago?: string;
  numero_operacion?: string;
  fecha_pago?: string;
  banco?: string;
  observaciones?: string;
}
