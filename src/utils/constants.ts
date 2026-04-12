import type { SunatStatus, TipoDocumentoCliente, TipoAfectacionIGV } from '@/types/common.types';

// === Estados SUNAT ===
export const SUNAT_STATUS_LABELS: Record<SunatStatus, string> = {
  PENDIENTE: 'Pendiente',
  ENVIANDO: 'Enviando',
  ENVIADO: 'Enviado',
  PROCESANDO: 'Procesando',
  ACEPTADO: 'Aceptado',
  RECHAZADO: 'Rechazado',
  ERROR: 'Error',
};

export const SUNAT_STATUS_COLORS: Record<SunatStatus, string> = {
  PENDIENTE: 'orange',
  ENVIANDO: 'blue',
  ENVIADO: 'geekblue',
  PROCESANDO: 'cyan',
  ACEPTADO: 'green',
  RECHAZADO: 'red',
  ERROR: 'red',
};

// === Tipos de Documento de Identidad ===
export const TIPO_DOCUMENTO_OPTIONS: { value: TipoDocumentoCliente; label: string }[] = [
  { value: '0', label: 'Sin documento' },
  { value: '1', label: 'DNI' },
  { value: '4', label: 'Carnet de Extranjería' },
  { value: '6', label: 'RUC' },
  { value: '7', label: 'Pasaporte' },
];

// === Monedas ===
export const MONEDA_OPTIONS = [
  { value: 'PEN', label: 'Soles (S/)', symbol: 'S/' },
  { value: 'USD', label: 'Dólares (US$)', symbol: 'US$' },
] as const;

// === Tipos de Afectacion IGV ===
export const IGV_AFECTACION_OPTIONS: { value: TipoAfectacionIGV; label: string; grupo: string }[] = [
  { value: '10', label: 'Gravado - Operación Onerosa', grupo: 'Gravado' },
  { value: '11', label: 'Gravado - Retiro por premio', grupo: 'Gravado' },
  { value: '12', label: 'Gravado - Retiro por donación', grupo: 'Gravado' },
  { value: '13', label: 'Gravado - Retiro', grupo: 'Gravado' },
  { value: '14', label: 'Gravado - Retiro por publicidad', grupo: 'Gravado' },
  { value: '15', label: 'Gravado - Bonificaciones', grupo: 'Gravado' },
  { value: '16', label: 'Gravado - Retiro por entrega a trabajadores', grupo: 'Gravado' },
  { value: '17', label: 'Gravado - IVAP', grupo: 'Gravado' },
  { value: '20', label: 'Exonerado - Operación Onerosa', grupo: 'Exonerado' },
  { value: '21', label: 'Exonerado - Transferencia gratuita', grupo: 'Exonerado' },
  { value: '30', label: 'Inafecto - Operación Onerosa', grupo: 'Inafecto' },
  { value: '31', label: 'Inafecto - Retiro por bonificación', grupo: 'Inafecto' },
  { value: '32', label: 'Inafecto - Retiro', grupo: 'Inafecto' },
  { value: '33', label: 'Inafecto - Retiro por muestras médicas', grupo: 'Inafecto' },
  { value: '34', label: 'Inafecto - Retiro por convenio colectivo', grupo: 'Inafecto' },
  { value: '35', label: 'Inafecto - Retiro por premio', grupo: 'Inafecto' },
  { value: '36', label: 'Inafecto - Retiro por publicidad', grupo: 'Inafecto' },
  { value: '37', label: 'Inafecto - Transferencia gratuita', grupo: 'Inafecto' },
  { value: '40', label: 'Exportación de bienes o servicios', grupo: 'Exportación' },
];

// === Unidades de Medida ===
export const UNIDAD_MEDIDA_OPTIONS = [
  { value: 'NIU', label: 'Unidad (NIU)' },
  { value: 'ZZ', label: 'Servicio (ZZ)' },
  { value: 'KGM', label: 'Kilogramo (KGM)' },
  { value: 'MTR', label: 'Metro (MTR)' },
  { value: 'LTR', label: 'Litro (LTR)' },
  { value: 'GLL', label: 'Galón (GLL)' },
  { value: 'TNE', label: 'Tonelada (TNE)' },
  { value: 'HUR', label: 'Hora (HUR)' },
  { value: 'DAY', label: 'Día (DAY)' },
  { value: 'MON', label: 'Mes (MON)' },
  { value: 'BX', label: 'Caja (BX)' },
  { value: 'PK', label: 'Paquete (PK)' },
  { value: 'DZN', label: 'Docena (DZN)' },
  { value: 'MTK', label: 'Metro cuadrado (MTK)' },
  { value: 'MTQ', label: 'Metro cúbico (MTQ)' },
] as const;

// === Forma de Pago ===
export const FORMA_PAGO_OPTIONS = [
  { value: 'Contado', label: 'Contado' },
  { value: 'Credito', label: 'Crédito' },
] as const;

// === Tipo de Operacion ===
export const TIPO_OPERACION_OPTIONS = [
  { value: '0101', label: 'Venta interna' },
  { value: '0112', label: 'Venta interna - Sustenta Gastos Deducibles PPNN' },
  { value: '0200', label: 'Exportación de bienes' },
  { value: '0201', label: 'Exportación de servicios' },
  { value: '0208', label: 'Exportación de servicios - hospedaje' },
  { value: '0401', label: 'Ventas no domiciliados' },
] as const;

// === IGV por defecto ===
export const IGV_PORCENTAJE_DEFAULT = 18;

// === Umbral Bancarizacion ===
export const BANCARIZACION_UMBRAL_PEN = 2000;
export const BANCARIZACION_UMBRAL_USD = 500;
