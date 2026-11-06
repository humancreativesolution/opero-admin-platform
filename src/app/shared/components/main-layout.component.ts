import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideMenu, lucideSearch } from '@ng-icons/lucide';
import { AuthService } from '../../core/auth/auth.service';
import { SidebarComponent } from './sidebar.component';
import { ToastHostComponent } from './toast-host.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NgIconComponent, ToastHostComponent],
  providers: [
    provideIcons({
      lucideMenu,
      lucideBell,
      lucideSearch,
    }),
  ],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  private auth = inject(AuthService);

  readonly roleLabel = computed(() => {
    const labels: Record<string, string> = {
      SUPER_ADMIN: 'Super Admin Access',
      SUPPORT: 'Support Access (read-only)',
      BILLING: 'Billing Access',
    };
    return labels[this.auth.role() ?? ''] ?? 'Platform Access';
  });
}
