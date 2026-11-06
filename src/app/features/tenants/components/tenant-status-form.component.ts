import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Tenant, TenantStatus } from '@res/index';
import { errorMessage, showError } from '../../../shared/utils/form';
import { ui } from '../../../shared/utils/ui';
import { TenantsGql } from '../tenants.gql';

const CONSEQUENCES: Record<TenantStatus, string> = {
  ACTIVE: 'Users of this tenant can log in again. The previous reason is cleared.',
  SUSPENDED:
    'All users of this tenant are logged out immediately and cannot log in until the tenant is reactivated. Data is kept.',
  ARCHIVED:
    'The tenant is closed: all sessions end and logins are blocked. Data is kept for audit. Only SUPER_ADMIN can undo this.',
};

@Component({
  selector: 'app-tenant-status-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './tenant-status-form.component.html',
})
export class TenantStatusFormComponent {
  private fb = inject(FormBuilder);
  private tenantsGql = inject(TenantsGql);

  readonly tenant = input.required<Tenant>();
  readonly targetStatus = input.required<TenantStatus>();
  readonly saved = output<Tenant>();
  readonly cancelled = output<void>();
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly ui = ui;
  readonly showError = showError;

  readonly requiresReason = computed(() => this.targetStatus() !== 'ACTIVE');
  readonly consequence = computed(() => CONSEQUENCES[this.targetStatus()]);
  readonly actionLabel = computed(
    () =>
      ({ ACTIVE: 'Reactivate tenant', SUSPENDED: 'Suspend tenant', ARCHIVED: 'Archive tenant' })[
        this.targetStatus()
      ],
  );

  readonly form = this.fb.nonNullable.group({ reason: [''] });

  constructor() {
    effect(() => {
      const reasonControl = this.form.controls.reason;
      reasonControl.setValidators(
        this.requiresReason() ? [Validators.required, Validators.maxLength(500)] : [],
      );
      reasonControl.reset('');
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set('');
    try {
      const reason = this.form.getRawValue().reason.trim();
      const tenant = await this.tenantsGql.updateStatus({
        id: this.tenant().id,
        status: this.targetStatus(),
        ...(this.requiresReason() ? { reason } : {}),
      });
      this.saved.emit(tenant);
    } catch (error) {
      this.error.set(errorMessage(error));
    } finally {
      this.submitting.set(false);
    }
  }
}
