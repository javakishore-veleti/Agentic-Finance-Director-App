// ── Auth Request/Response ──

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  display_name: string;
  company_name?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RefreshRequest {
  refresh_token: string;
}

// ── Organization ──

export interface UserOrganization {
  id: string;
  name: string;
  code: string;
  role: string;
  is_default: boolean;
}

// ── User Profile (from /auth/me) ──

export interface UserProfile {
  id: string;
  customer_id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  status: string;
  is_customer_admin: boolean;
  last_login_at: string | null;
  created_at: string | null;
  organizations: UserOrganization[];

  // Backward-compat aliases (auto-populated by AuthService)
  full_name?: string;
  role?: string;
  department?: string | null;
}

// ── JWT Payload (decoded from token) ──

export interface JwtPayload {
  sub: string;
  customer_id: string;
  email: string;
  display_name: string;
  is_customer_admin: boolean;
  organizations: UserOrganization[];
  exp: number;
  iat: number;
  type: string;
}

// ── API Response Wrapper ──

export interface ApiResponse<T = any> {
  status: string;
  data: T;
  message?: string;
  meta?: Record<string, any>;
  success?: boolean;
}
