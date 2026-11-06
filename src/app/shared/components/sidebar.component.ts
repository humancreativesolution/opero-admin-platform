import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideBuilding2,
  lucideFileText,
  lucideKeyRound,
  lucideLogOut,
  lucideShield,
  lucideUsers,
} from '@ng-icons/lucide';
import { AuthService } from '../../core/auth/auth.service';
import { PasswordFormComponent } from '../../features/platform-users/components/password-form.component';
import { ToastService } from '../services/toast.service';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIconComponent, ModalComponent, PasswordFormComponent],
  providers: [
    provideIcons({
      lucideBuilding2,
      lucideUsers,
      lucideFileText,
      lucideActivity,
      lucideLogOut,
      lucideShield,
      lucideKeyRound,
    }),
  ],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  user = this.auth.currentUser;
  readonly isSuperAdmin = this.auth.isSuperAdmin;
  readonly changingPassword = signal(false);

  onPasswordChanged(): void {
    this.changingPassword.set(false);
    this.toast.success('Password changed. Please log in again.');
    this.auth.logout();
  }

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
