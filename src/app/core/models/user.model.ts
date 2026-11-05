export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'SUPPORT' | 'BILLING';
  authType: 'TENANT' | 'PLATFORM';
  isSuperuser: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}
