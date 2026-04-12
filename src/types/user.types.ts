export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name?: string;
  role?: Role;
  company_id: number | null;
  company?: { id: number; razon_social: string; ruc: string } | null;
  user_type: 'system' | 'user' | 'api_client';
  active: boolean;
  permissions: string[];
  restrictions: string[];
  allowed_ips: string[];
  last_login_at: string | null;
  last_login_ip: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  force_password_change: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  display_name?: string;
  slug?: string;
  description?: string;
}

export interface Permission {
  id: number;
  name: string;
  slug: string;
  group: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  role_name: string;
  company_id?: number;
  user_type: string;
  active?: boolean;
}
