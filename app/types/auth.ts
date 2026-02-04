export interface AuthForm {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user_id: string
  email?: string
  metadata: Record<string, any>
  user?: User
}

export interface LogoutRequest {
  access_token: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export enum Role {
  ADMIN = "admin",
  MANAGER = "manager"
}

export interface SignupForm extends AuthForm {
  full_name: string
  role: Role
}

export interface User {
  id: string
  email: string
  full_name: string
  role: Role
  created_at?: string
  updated_at?: string
}