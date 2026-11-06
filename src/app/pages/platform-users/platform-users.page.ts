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

/** Manajemen staf platform. Route dijaga platformRoleGuard() (SUPER_ADMIN). */
@Component({
  standalone: true,
  imports: [
    DatePipe,
    ModalComponent,
    PaginationComponent,
    PlatformUserFormComponent,
    PasswordFormComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Platform Users</h1>
          <p class="text-sm text-slate-500">Internal staff with access to this admin tool.</p>
        </div>
        <button type="button" [class]="ui.btnPrimary" (click)="dialog.set({ kind: 'create' })">
          + New user
        </button>
      </div>

      <div [class]="ui.card">
        <div class="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100">
          <input
            type="search"
            [class]="ui.input + ' max-w-xs'"
            placeholder="Search name or email…"
            aria-label="Search platform users"
            [value]="search()"
            (input)="onSearch($any($event.target).value)"
          />
          <select
            [class]="ui.select + ' max-w-44'"
            aria-label="Filter by role"
            [value]="roleFilter()"
            (change)="onRoleFilter($any($event.target).value)"
          >
            <option value="">All roles</option>
            @for (role of roles; track role) {
              <option [value]="role">{{ role }}</option>
            }
          </select>
          <select
            [class]="ui.select + ' max-w-40'"
            aria-label="Filter by status"
            [value]="activeFilter()"
            (change)="onActiveFilter($any($event.target).value)"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50/60 border-b border-slate-100">
              <tr>
                <th [class]="ui.th">User</th>
                <th [class]="ui.th">Role</th>
                <th [class]="ui.th">Status</th>
                <th [class]="ui.th">Last login</th>
                <th [class]="ui.th + ' text-right'">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (loading() && users().length === 0) {
                <tr><td [class]="ui.td" colspan="5">Loading users…</td></tr>
              } @else if (loadError()) {
                <tr>
                  <td [class]="ui.td" colspan="5">
                    <span class="text-red-600">{{ loadError() }}</span>
                    <button type="button" [class]="ui.btnGhost" (click)="load()">Retry</button>
                  </td>
                </tr>
              } @else if (users().length === 0) {
                <tr><td [class]="ui.td + ' text-slate-500'" colspan="5">No users match the current filters.</td></tr>
              }
              @for (user of users(); track user.id) {
                <tr class="hover:bg-slate-50/50">
                  <td [class]="ui.td">
                    <div class="font-medium text-slate-900">
                      {{ user.fullName }}
                      @if (user.id === currentUserId()) {
                        <span class="ml-1 text-xs font-normal text-slate-400">(you)</span>
                      }
                    </div>
                    <div class="text-xs text-slate-500">{{ user.email }}</div>
                  </td>
                  <td [class]="ui.td">
                    <span [class]="badgeBase + ' ' + badgeClass[user.role]">{{ user.role }}</span>
                  </td>
                  <td [class]="ui.td">
                    <span [class]="badgeBase + ' ' + badgeClass[user.isActive ? 'ACTIVE' : 'INACTIVE']">
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td [class]="ui.td + ' text-xs text-slate-500'">
                    {{ user.lastLoginAt ? (user.lastLoginAt | date: 'medium') : 'Never' }}
                  </td>
                  <td [class]="ui.td">
                    <div class="flex justify-end gap-1">
                      <button type="button" [class]="ui.btnGhost" (click)="dialog.set({ kind: 'edit', user })">Edit</button>
                      <button type="button" [class]="ui.btnGhost" (click)="dialog.set({ kind: 'reset', user })">
                        Reset password
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <app-pagination [meta]="meta()" (pageChange)="goToPage($event)" />
      </div>
    </div>

    @let current = dialog();
    @if (current) {
      @switch (current.kind) {
        @case ('create') {
          <app-modal [open]="true" title="New platform user" (closed)="dialog.set(null)">
            <app-platform-user-form (saved)="onSaved('User created')" (cancelled)="dialog.set(null)" />
          </app-modal>
        }
        @case ('edit') {
          <app-modal [open]="true" [title]="'Edit ' + current.user.fullName" (closed)="dialog.set(null)">
            <app-platform-user-form [user]="current.user" (saved)="onSaved('User updated')" (cancelled)="dialog.set(null)" />
          </app-modal>
        }
        @case ('reset') {
          <app-modal
            [open]="true"
            [title]="'Reset password · ' + current.user.fullName"
            description="Set a new password and share it securely with the user."
            (closed)="dialog.set(null)"
          >
            <app-password-form [user]="current.user" (saved)="onSaved('Password reset')" (cancelled)="dialog.set(null)" />
          </app-modal>
        }
      }
    }
  `,
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
