export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
  access_token: string;
  token_type: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  role_name: string | null;  // DB name: super_admin, company_admin, etc.
  company_id: number | null;
  permissions: string[];
  user_type?: string;
}

export interface InitializeRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}
