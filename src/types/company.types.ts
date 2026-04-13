export interface Company {
  id: number;
  ruc: string;
  razon_social: string;
  nombre_comercial: string;
  direccion: string;
  ubigeo: string;
  distrito: string;
  provincia: string;
  departamento: string;
  telefono: string;
  telefono_2?: string;
  telefono_3?: string;
  whatsapp?: string;
  email: string;
  email_ventas?: string;
  email_soporte?: string;
  web?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  tiktok?: string;
  mensaje_pdf?: string;
  terminos_condiciones_pdf?: string;
  politica_garantia?: string;
  cuentas_bancarias: CuentaBancaria[];
  billeteras_digitales: BilleteraDigital[];
  usuario_sol: string;
  clave_sol: string;
  certificado_pem?: string;
  modo_produccion: boolean;
  activo: boolean;
  logo_path: string | null;
  mostrar_cuentas_en_pdf: boolean;
  mostrar_billeteras_en_pdf: boolean;
  mostrar_redes_sociales_en_pdf: boolean;
  mostrar_contactos_adicionales_en_pdf: boolean;
  enviar_email_cliente: boolean;
  created_at: string;
  updated_at: string;
}

export interface CuentaBancaria {
  banco: string;
  tipo_cuenta: 'AHORROS' | 'CORRIENTE';
  moneda: 'PEN' | 'USD';
  numero: string;
  cci?: string;
  titular?: string;
  activo?: boolean;
}

export interface BilleteraDigital {
  tipo: 'YAPE' | 'PLIN' | 'TUNKI' | 'LUKITA' | 'AGORA' | 'BIM';
  numero: string;
  titular?: string;
  activo?: boolean;
}

export interface CompanyFormData {
  ruc: string;
  razon_social: string;
  nombre_comercial?: string;
  direccion: string;
  ubigeo: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  telefono?: string;
  telefono_2?: string;
  telefono_3?: string;
  whatsapp?: string;
  email?: string;
  email_ventas?: string;
  email_soporte?: string;
  web?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  tiktok?: string;
  usuario_sol?: string;
  clave_sol?: string;
  modo_produccion?: boolean;
  activo?: boolean;
  mostrar_cuentas_en_pdf?: boolean;
  mostrar_billeteras_en_pdf?: boolean;
  mostrar_redes_sociales_en_pdf?: boolean;
  mostrar_contactos_adicionales_en_pdf?: boolean;
  enviar_email_cliente?: boolean;
  mensaje_pdf?: string;
  terminos_condiciones_pdf?: string;
  politica_garantia?: string;
  cuentas_bancarias?: CuentaBancaria[];
  billeteras_digitales?: BilleteraDigital[];
}

export interface PdfInfo {
  mostrar_cuentas_en_pdf: boolean;
  mostrar_billeteras_en_pdf: boolean;
  mostrar_redes_sociales_en_pdf: boolean;
  mostrar_contactos_adicionales_en_pdf: boolean;
  mensaje_pdf?: string;
  terminos_condiciones_pdf?: string;
  politica_garantia?: string;
}
