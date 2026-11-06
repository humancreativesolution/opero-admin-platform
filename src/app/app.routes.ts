import { Routes } from '@angular/router';
import { authGuard, platformRoleGuard } from './core/auth/auth.guard';
import { MainLayoutComponent } from './shared/components/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'tenants', pathMatch: 'full' },
      {
        path: 'tenants',
        loadComponent: () => import('./pages/tenants/tenants.page').then((m) => m.TenantsPage),
      },
      {
        path: 'platform-users',
        canActivate: [platformRoleGuard()],
        loadComponent: () =>
          import('./pages/platform-users/platform-users.page').then((m) => m.PlatformUsersPage),
      },
      {
        path: 'audit-logs',
        loadComponent: () =>
          import('./pages/audit-logs/audit-logs.page').then((m) => m.AuditLogsPage),
      },
      {
        path: 'health',
        loadComponent: () => import('./pages/health/health.page').then((m) => m.HealthPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
