import { DatePipe } from '@angular/common';
import { afterNextRender, Component, inject, signal } from '@angular/core';
import {
  type PaginationMeta,
  PLATFORM_ROLES,
  type PlatformRole,
  type PlatformUser,
} from '@res/index';
import { AuthService } from '../../core/auth/auth.service';
import { PasswordFormComponent } from '../../features/platform-users/components/password-form.component';
import { PlatformUserFormComponent } from '../../features/platform-users/components/platform-user-form.component';
import { PlatformUsersGql } from '../../features/platform-users/platform-users.gql';
import { ModalComponent } from '../../shared/components/modal.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { ToastService } from '../../shared/services/toast.service';
import { errorMessage } from '../../shared/utils/form';
import { badgeBase, badgeClass, ui } from '../../shared/utils/ui';

type Dialog =
  | { kind: 'create' }
  | { kind: 'edit'; user: PlatformUser }
  | { kind: 'reset'; user: PlatformUser };

type ActiveFilter = '' | 'active' | 'inactive';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

@Component({
  standalone: true,
  imports: [
    DatePipe,
    ModalComponent,
    PaginationComponent,
    PlatformUserFormComponent,
    PasswordFormComponent,
  ],
  templateUrl: './platform-users.page.html',
})
export class PlatformUsersPage {
  private gql = inject(PlatformUsersGql);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private searchTimer?: ReturnType<typeof setTimeout>;

  readonly ui = ui;
  readonly badgeBase = badgeBase;
  readonly badgeClass = badgeClass;
  readonly roles = PLATFORM_ROLES;

  readonly users = signal<PlatformUser[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal('');
  readonly page = signal(1);
  readonly search = signal('');
  readonly roleFilter = signal<PlatformRole | ''>('');
  readonly activeFilter = signal<ActiveFilter>('');
  readonly dialog = signal<Dialog | null>(null);
  readonly currentUserId = () => this.auth.currentUser()?.id;

  constructor() {
    afterNextRender(() => this.load());
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set('');
    try {
      const search = this.search().trim();
      const role = this.roleFilter();
      const active = this.activeFilter();
      const result = await this.gql.list(this.page(), PAGE_SIZE, {
        ...(search ? { search } : {}),
        ...(role ? { role } : {}),
        ...(active ? { isActive: active === 'active' } : {}),
      });
      this.users.set(result.data);
      this.meta.set(result.meta);
    } catch (error) {
      this.loadError.set(errorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(value: string): void {
    this.search.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.resetAndLoad(), SEARCH_DEBOUNCE_MS);
  }

  onRoleFilter(value: string): void {
    this.roleFilter.set(value as PlatformRole | '');
    this.resetAndLoad();
  }

  onActiveFilter(value: string): void {
    this.activeFilter.set(value as ActiveFilter);
    this.resetAndLoad();
  }

  goToPage(page: number): void {
    this.page.set(page);
    void this.load();
  }

  onSaved(message: string): void {
    this.dialog.set(null);
    this.toast.success(message);
    void this.load();
  }

  private resetAndLoad(): void {
    this.page.set(1);
    void this.load();
  }
}
