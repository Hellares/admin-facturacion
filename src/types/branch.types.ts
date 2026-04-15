export interface Branch {
  id: number;
  company_id: number;
  codigo: string;
  nombre: string;
  direccion: string;
  ubigeo: string;
  distrito: string;
  provincia: string;
  departamento: string;
  telefono?: string;
  email?: string;
  series_factura: string[];
  series_factura_api?: string[];
  series_boleta: string[];
  series_boleta_api?: string[];
  series_nota_credito: string[];
  series_nota_credito_api?: string[];
  series_nota_debito: string[];
  series_nota_debito_api?: string[];
  series_guia_remision: string[];
  series_guia_remision_api?: string[];
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface BranchFormData {
  company_id: number;
  codigo: string;
  nombre: string;
  direccion: string;
  ubigeo?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  telefono?: string;
  email?: string;
  series_factura?: string[];
  series_factura_api?: string[];
  series_boleta?: string[];
  series_boleta_api?: string[];
  series_nota_credito?: string[];
  series_nota_credito_api?: string[];
  series_nota_debito?: string[];
  series_nota_debito_api?: string[];
  series_guia_remision?: string[];
  series_guia_remision_api?: string[];
  activo?: boolean;
}

export interface Correlative {
  id: number;
  branch_id: number;
  tipo_documento: string;
  serie: string;
  correlativo_actual: number;
  created_at: string;
  updated_at: string;
}
