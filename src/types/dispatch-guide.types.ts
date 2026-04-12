import type { SunatStatus, ClienteDocumento } from './common.types';

export interface DireccionEnvio {
  ubigeo: string;
  direccion: string;
  ruc?: string;
  cod_local?: string;
}

export interface Transportista {
  tipo_documento: string;
  numero_documento: string;
  razon_social: string;
  nro_mtc?: string;
}

export interface Conductor {
  tipo_documento: string;
  numero_documento: string;
  nombres?: string;
  apellidos?: string;
  licencia?: string;
}

export interface DetalleGuia {
  codigo: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  peso_total?: number;
}

export interface DispatchGuide {
  id: number;
  company_id: number;
  branch_id: number;
  serie: string;
  correlativo: number;
  numero_completo: string;
  fecha_emision: string;
  fecha_traslado: string;
  cod_traslado: string;
  des_traslado?: string;
  mod_traslado: '01' | '02';
  peso_total: number;
  und_peso_total: string;
  num_bultos?: number;
  estado_sunat: SunatStatus;
  respuesta_sunat?: string;
  destinatario: ClienteDocumento;
  partida: DireccionEnvio;
  llegada: DireccionEnvio;
  transportista?: Transportista;
  conductor?: Conductor;
  vehiculo_placa?: string;
  indicadores?: string[];
  detalles: DetalleGuia[];
  created_at: string;
  updated_at: string;
}

export interface DispatchGuideFormData {
  company_id: number;
  branch_id: number;
  serie: string;
  fecha_emision: string;
  fecha_traslado: string;
  cod_traslado: string;
  mod_traslado: '01' | '02';
  peso_total: number;
  und_peso_total: string;
  num_bultos?: number;
  destinatario: ClienteDocumento;
  partida: DireccionEnvio;
  llegada: DireccionEnvio;
  transportista?: Transportista;
  conductor?: Conductor;
  vehiculo_placa?: string;
  indicadores?: string[];
  detalles: DetalleGuia[];
  observaciones?: string;
}

export type EstadoUI = 'todos' | 'proceso' | 'validado' | 'error' | 'baja';

export interface DispatchGuideListParams {
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
  cod_traslado?: string;
  mod_traslado?: string;
  search?: string;
  page?: number;
  per_page?: number;
}
