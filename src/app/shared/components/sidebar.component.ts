import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideBuilding2,
  lucideFileText,
  lucideLogOut,
  lucideShield,
  lucideUsers,
} from '@ng-icons/lucide';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIconComponent],
  providers: [
    provideIcons({
      lucideBuilding2,
      lucideUsers,
      lucideFileText,
      lucideActivity,
      lucideLogOut,
      lucideShield,
    }),
  ],
  template: `
    <aside class="w-64 border-r border-slate-200 bg-white flex flex-col h-full select-none">
      <!-- Logo Header -->
      <div class="p-4 border-b border-slate-200 flex items-center gap-3">
        <div class="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <ng-icon name="lucideShield" class="text-xl" />
        </div>
        <div>
          <div class="text-base font-bold tracking-tight text-slate-900">Opero Admin</div>
          <div class="text-[10px] font-medium tracking-wider uppercase text-slate-500">Platform Portal</div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
        <a
          routerLink="/tenants"
          routerLinkActive="bg-indigo-50 text-indigo-600 font-medium"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-sm"
        >
          <ng-icon name="lucideBuilding2" class="text-lg" />
          <span>Tenants</span>
        </a>

        <a
          routerLink="/platform-users"
          routerLinkActive="bg-indigo-50 text-indigo-600 font-medium"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-sm"
        >
          <ng-icon name="lucideUsers" class="text-lg" />
          <span>Platform Users</span>
        </a>

        <a
          routerLink="/audit-logs"
          routerLinkActive="bg-indigo-50 text-indigo-600 font-medium"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-sm"
        >
          <ng-icon name="lucideFileText" class="text-lg" />
          <span>Audit Logs</span>
        </a>

        <a
          routerLink="/health"
          routerLinkActive="bg-indigo-50 text-indigo-600 font-medium"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-sm"
        >
          <ng-icon name="lucideActivity" class="text-lg" />
          <span>System Health</span>
        </a>
      </nav>

      <!-- User Profile & Logout -->
      <div class="p-3 border-t border-slate-200 bg-slate-50/50">
        <div class="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600 shrink-0">
              {{ initials() }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-medium text-slate-800 truncate">{{ user()?.fullName || user()?.email }}</p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span class="text-[10px] text-slate-500 uppercase tracking-wider truncate">{{ user()?.role }}</span>
              </div>
            </div>
          </div>
          <button
            (click)="logout()"
            title="Logout"
            class="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
          >
            <ng-icon name="lucideLogOut" class="text-base" />
          </button>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  private auth = inject(AuthService);
  user = this.auth.currentUser;

  initials(): string {
    const name = this.user()?.fullName || this.user()?.email || 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  logout() {
    this.auth.logout();
  }
}
