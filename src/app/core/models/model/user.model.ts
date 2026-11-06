export type PlatformRole = 'SUPER_ADMIN' | 'SUPPORT' | 'BILLING';

export const PLATFORM_ROLES: readonly PlatformRole[] = ['SUPER_ADMIN', 'SUPPORT', 'BILLING'];

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: PlatformRole;
  authType: 'TENANT' | 'PLATFORM';
  isSuperuser: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
