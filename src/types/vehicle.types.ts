export interface Vehicle {
  id: number;
  company_id: number;
  placa: string;
  marca?: string | null;
  modelo?: string | null;
  nro_certificado_inscripcion?: string | null;
  placas_secundarias?: string[] | null;
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

export interface VehicleFormData {
  company_id: number;
  placa: string;
  marca?: string;
  modelo?: string;
  nro_certificado_inscripcion?: string;
  placas_secundarias?: string[];
  observaciones?: string;
  activo?: boolean;
}

export interface VehicleListParams {
  company_id?: number;
  activo?: boolean;
  search?: string;
  per_page?: number;
}
