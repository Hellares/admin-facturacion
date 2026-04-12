export type TipoDocDriver = '1' | '4' | '7';

export interface Driver {
  id: number;
  company_id: number;
  tipo_doc: TipoDocDriver;
  num_doc: string;
  nombres: string;
  apellidos: string;
  licencia: string;
  telefono?: string | null;
  observaciones?: string | null;
  activo: boolean;
  nombre_completo?: string;
  created_at: string;
  updated_at: string;
  company?: {
    id: number;
    ruc: string;
    razon_social: string;
  };
}

export interface DriverFormData {
  company_id: number;
  tipo_doc: TipoDocDriver;
  num_doc: string;
  nombres: string;
  apellidos: string;
  licencia: string;
  telefono?: string;
  observaciones?: string;
  activo?: boolean;
}

export interface DriverListParams {
  company_id?: number;
  activo?: boolean;
  search?: string;
  per_page?: number;
}
