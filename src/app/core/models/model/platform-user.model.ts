import type { PlatformRole } from './user.model';

export interface PlatformUser {
  id: string;
  email: string;
  fullName: string;
  role: PlatformRole;
  isActive: boolean;
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
