import { DatePipe } from '@angular/common';
import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import {
  type PaginationMeta,
  TENANT_STATUSES,
  type Tenant,
  type TenantStatus,
  type TenantUser,
} from '@res/index';
import { AuthService } from '../../core/auth/auth.service';
import { TenantAddUserFormComponent } from '../../features/tenants/components/tenant-add-user-form.component';
import { TenantCreateFormComponent } from '../../features/tenants/components/tenant-create-form.component';
import { TenantEditFormComponent } from '../../features/tenants/components/tenant-edit-form.component';
import { TenantStatusFormComponent } from '../../features/tenants/components/tenant-status-form.component';
import { TenantsGql } from '../../features/tenants/tenants.gql';
import { ModalComponent } from '../../shared/components/modal.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { ToastService } from '../../shared/services/toast.service';
import { errorMessage } from '../../shared/utils/form';
import { badgeBase, badgeClass, ui } from '../../shared/utils/ui';

type Dialog =
  | { kind: 'create' }
  | { kind: 'edit'; tenant: Tenant }
  | { kind: 'status'; tenant: Tenant; status: TenantStatus }
  | { kind: 'addUser'; tenant: Tenant };

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

@Component({
  standalone: true,
  imports: [
    DatePipe,
    ModalComponent,
    PaginationComponent,
    TenantCreateFormComponent,
    TenantEditFormComponent,
    TenantStatusFormComponent,
    TenantAddUserFormComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Tenants</h1>
          <p class="text-sm text-slate-500">Businesses using Opero. Suspend or archive instead of deleting.</p>
        </div>
        @if (canManage()) {
          <button type="button" [class]="ui.btnPrimary" (click)="openDialog({ kind: 'create' })">
            + New tenant
          </button>
        }
      </div>

      <div [class]="ui.card">
        <div class="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100">
          <input
            type="search"
            [class]="ui.input + ' max-w-xs'"
            placeholder="Search name or subdomain…"
            aria-label="Search tenants"
            [value]="search()"
            (input)="onSearch($any($event.target).value)"
          />
          <select
            [class]="ui.select + ' max-w-44'"
            aria-label="Filter by status"
            [value]="statusFilter()"
            (change)="onStatusFilter($any($event.target).value)"
          >
            <option value="">All statuses</option>
            @for (status of statuses; track status) {
              <option [value]="status">{{ status }}</option>
            }
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50/60 border-b border-slate-100">
              <tr>
                <th [class]="ui.th">Tenant</th>
                <th [class]="ui.th">Domains</th>
                <th [class]="ui.th">Status</th>
                <th [class]="ui.th">Created</th>
                <th [class]="ui.th + ' text-right'">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (loading() && tenants().length === 0) {
                <tr><td [class]="ui.td" colspan="5">Loading tenants…</td></tr>
              } @else if (loadError()) {
                <tr>
                  <td [class]="ui.td" colspan="5">
                    <span class="text-red-600">{{ loadError() }}</span>
                    <button type="button" [class]="ui.btnGhost" (click)="load()">Retry</button>
                  </td>
                </tr>
              } @else if (tenants().length === 0) {
                <tr><td [class]="ui.td + ' text-slate-500'" colspan="5">No tenants match the current filters.</td></tr>
              }
              @for (tenant of tenants(); track tenant.id) {
                <tr class="hover:bg-slate-50/50">
                  <td [class]="ui.td">
                    <div class="font-medium text-slate-900">{{ tenant.name }}</div>
                    <div class="text-xs text-slate-500">{{ tenant.subdomain ?? '—' }}</div>
                  </td>
                  <td [class]="ui.td">
                    <div class="flex flex-wrap gap-1">
                      @for (domain of tenant.domains; track domain) {
                        <span class="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{{ domain }}</span>
                      } @empty {
                        <span class="text-xs text-slate-400">—</span>
                      }
                    </div>
                  </td>
                  <td [class]="ui.td">
                    <span [class]="badgeBase + ' ' + badgeClass[tenant.status]">{{ tenant.status }}</span>
                    @if (tenant.statusReason) {
                      <div class="mt-1 text-xs text-slate-500 max-w-56 truncate" [title]="tenant.statusReason">
                        {{ tenant.statusReason }}
                      </div>
                    }
                    @if (tenant.statusChangedAt) {
                      <div class="text-[11px] text-slate-400">since {{ tenant.statusChangedAt | date: 'mediumDate' }}</div>
                    }
                  </td>
                  <td [class]="ui.td + ' text-xs text-slate-500'">{{ tenant.createdAt | date: 'mediumDate' }}</td>
                  <td [class]="ui.td">
                    <div class="flex justify-end gap-1">
                      @if (canManage()) {
                        <button type="button" [class]="ui.btnGhost" (click)="openDialog({ kind: 'edit', tenant })">Edit</button>
                        @if (tenant.status !== 'ARCHIVED') {
                          <button type="button" [class]="ui.btnGhost" (click)="openDialog({ kind: 'addUser', tenant })">Add user</button>
                        }
                      }
                      @if (canChangeStatus()) {
                        @for (status of statusActions(tenant); track status) {
                          <button
                            type="button"
                            [class]="ui.btnGhost"
                            [class.text-red-600]="status !== 'ACTIVE'"
                            (click)="openDialog({ kind: 'status', tenant, status })"
                          >
                            {{ statusActionLabel[status] }}
                          </button>
                        }
                      }
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
          <app-modal [open]="true" title="New tenant" description="Creates the tenant and its first OWNER account." size="lg" (closed)="closeDialog()">
            <app-tenant-create-form (saved)="onCreated($event)" (cancelled)="closeDialog()" />
          </app-modal>
        }
        @case ('edit') {
          <app-modal [open]="true" [title]="'Edit ' + current.tenant.name" (closed)="closeDialog()">
            <app-tenant-edit-form [tenant]="current.tenant" (saved)="onSaved($event, 'Tenant updated')" (cancelled)="closeDialog()" />
          </app-modal>
        }
        @case ('status') {
          <app-modal [open]="true" [title]="statusActionLabel[current.status] + ' · ' + current.tenant.name" (closed)="closeDialog()">
            <app-tenant-status-form
              [tenant]="current.tenant"
              [targetStatus]="current.status"
              (saved)="onSaved($event, 'Tenant is now ' + $event.status)"
              (cancelled)="closeDialog()"
            />
          </app-modal>
        }
        @case ('addUser') {
          <app-modal [open]="true" [title]="'Add user · ' + current.tenant.name" description="The user can log in to this tenant immediately." (closed)="closeDialog()">
            <app-tenant-add-user-form [tenant]="current.tenant" (saved)="onUserAdded($event)" (cancelled)="closeDialog()" />
          </app-modal>
        }
      }
    }
  `,
})
export class TenantsPage {
  private tenantsGql = inject(TenantsGql);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private searchTimer?: ReturnType<typeof setTimeout>;

  readonly ui = ui;
  readonly badgeBase = badgeBase;
  readonly badgeClass = badgeClass;
  readonly statuses = TENANT_STATUSES;
  readonly statusActionLabel: Record<TenantStatus, string> = {
    ACTIVE: 'Reactivate',
    SUSPENDED: 'Suspend',
    ARCHIVED: 'Archive',
  };

  readonly tenants = signal<Tenant[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal('');
  readonly page = signal(1);
  readonly search = signal('');
  readonly statusFilter = signal<TenantStatus | ''>('');
  readonly dialog = signal<Dialog | null>(null);

  readonly canManage = computed(() => this.auth.isSuperAdmin());
  readonly canChangeStatus = computed(() => this.auth.hasRole('BILLING'));

  constructor() {
    // Data hanya dimuat di browser (halaman di-prerender di server tanpa sesi).
    afterNextRender(() => this.load());
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set('');
    try {
      const search = this.search().trim();
      const status = this.statusFilter();
      const result = await this.tenantsGql.list(this.page(), PAGE_SIZE, {
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
      });
      this.tenants.set(result.data);
      this.meta.set(result.meta);
    } catch (error) {
      this.loadError.set(errorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  /** Aksi status yang relevan; BILLING tidak bisa mengarsipkan/mengubah tenant arsip. */
  statusActions(tenant: Tenant): TenantStatus[] {
    const superAdmin = this.auth.isSuperAdmin();
    switch (tenant.status) {
      case 'ACTIVE':
        return superAdmin ? ['SUSPENDED', 'ARCHIVED'] : ['SUSPENDED'];
      case 'SUSPENDED':
        return superAdmin ? ['ACTIVE', 'ARCHIVED'] : ['ACTIVE'];
      case 'ARCHIVED':
        return superAdmin ? ['ACTIVE'] : [];
    }
  }

  onSearch(value: string): void {
    this.search.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.page.set(1);
      void this.load();
    }, SEARCH_DEBOUNCE_MS);
  }

  onStatusFilter(value: string): void {
    this.statusFilter.set(value as TenantStatus | '');
    this.page.set(1);
    void this.load();
  }

  goToPage(page: number): void {
    this.page.set(page);
    void this.load();
  }

  openDialog(dialog: Dialog): void {
    this.dialog.set(dialog);
  }

  closeDialog(): void {
    this.dialog.set(null);
  }

  onCreated(tenant: Tenant): void {
    this.closeDialog();
    this.toast.success(`Tenant "${tenant.name}" created`);
    this.page.set(1);
    void this.load();
  }

  onSaved(_tenant: Tenant, message: string): void {
    this.closeDialog();
    this.toast.success(message);
    // Muat ulang agar filter status tetap akurat (mis. tenant yang baru di-suspend).
    void this.load();
  }

  onUserAdded(user: TenantUser): void {
    this.closeDialog();
    this.toast.success(`${user.fullName} added as ${user.role ?? 'user'}`);
  }
}
