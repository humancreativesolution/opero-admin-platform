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
  templateUrl: './tenants.page.html',
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
    // Pages are prerendered on the server without a session, so data loads in the browser only.
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
    void this.load();
  }

  onUserAdded(user: TenantUser): void {
    this.closeDialog();
    this.toast.success(`${user.fullName} added as ${user.role ?? 'user'}`);
  }
}
