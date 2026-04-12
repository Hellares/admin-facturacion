export type TipoDocTransportist = '1' | '4' | '6' | '7';

export interface Transportist {
  id: number;
  company_id: number;
  tipo_doc: TipoDocTransportist;
  num_doc: string;
  razon_social: string;
  nro_mtc?: string | null;
  telefono?: string | null;
  email?: string | null;
  observaciones?: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  company?: {
    id: number;
    ruc: string;
    razon_social: string;
  };
}

export interface TransportistFormData {
  company_id: number;
  tipo_doc: TipoDocTransportist;
  num_doc: string;
  razon_social: string;
  nro_mtc?: string;
  telefono?: string;
  email?: string;
  observaciones?: string;
  activo?: boolean;
}

export interface TransportistListParams {
  company_id?: number;
  activo?: boolean;
  search?: string;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
