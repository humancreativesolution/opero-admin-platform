import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import type { PlatformRole } from '@res/index';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/login']);
};

/** Hak akses UI mengikuti backend; backend tetap memvalidasi setiap request. */
export const platformRoleGuard = (...allowedRoles: PlatformRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);
    if (auth.hasRole(...allowedRoles)) return true;
    return router.createUrlTree(['/tenants']);
  };
};
