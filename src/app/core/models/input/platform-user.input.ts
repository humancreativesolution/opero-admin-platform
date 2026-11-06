import type { PlatformRole } from '../model/user.model';

export interface PlatformUserFilterInput {
  search?: string;
  role?: PlatformRole;
  isActive?: boolean;
}

export interface CreatePlatformUserInput {
  email: string;
  fullName: string;
  role: PlatformRole;
  password: string;
}

export interface UpdatePlatformUserInput {
  id: string;
  fullName?: string;
  role?: PlatformRole;
  isActive?: boolean;
}

export interface ResetPlatformUserPasswordInput {
  id: string;
  newPassword: string;
}

export interface ChangeMyPlatformPasswordInput {
  currentPassword: string;
  newPassword: string;
}
