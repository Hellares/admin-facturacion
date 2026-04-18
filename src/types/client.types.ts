import type { TipoDocumentoCliente } from './common.types';

export interface Client {
  id: number;
  company_id: number;
  tipo_documento: TipoDocumentoCliente;
  numero_documento: string;
  razon_social: string;
  nombre_comercial?: string;
  direccion?: string;
  ubigeo?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  telefono?: string;
  email?: string;
  enviar_email: boolean;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  company_id: number;
  tipo_documento: TipoDocumentoCliente;
  numero_documento: string;
  razon_social: string;
  nombre_comercial?: string;
  direccion?: string;
  ubigeo?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  telefono?: string;
  email?: string;
  enviar_email?: boolean;
  activo?: boolean;
}

export interface ClientSearchParams {
  company_id?: number;
  q?: string;
  numero_documento?: string;
  razon_social?: string;
  email?: string;
  tipo_documento?: TipoDocumentoCliente;
  departamento?: string;
  per_page?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}
