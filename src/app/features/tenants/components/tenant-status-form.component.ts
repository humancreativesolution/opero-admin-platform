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

/** Ubah status tenant; alasan wajib untuk SUSPENDED/ARCHIVED (sesuai backend). */
@Component({
  selector: 'app-tenant-status-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <p
        class="rounded-md border px-3 py-2 text-sm"
        [class.border-amber-200]="targetStatus() !== 'ACTIVE'"
        [class.bg-amber-50]="targetStatus() !== 'ACTIVE'"
        [class.text-amber-800]="targetStatus() !== 'ACTIVE'"
        [class.border-emerald-200]="targetStatus() === 'ACTIVE'"
        [class.bg-emerald-50]="targetStatus() === 'ACTIVE'"
        [class.text-emerald-800]="targetStatus() === 'ACTIVE'"
      >
        {{ consequence() }}
      </p>

      @if (requiresReason()) {
        <div class="space-y-1.5">
          <label [class]="ui.label" for="statusReason">Reason</label>
          <textarea
            id="statusReason"
            formControlName="reason"
            [class]="ui.textarea"
            placeholder="e.g. Subscription unpaid for 2 months"
          ></textarea>
          @if (showError(form, 'reason')) {
            <p [class]="ui.fieldError">A reason is required (max 500 characters).</p>
          }
          <p class="text-xs text-slate-500">Recorded in the tenant's audit log.</p>
        </div>
      }

      @if (error()) {
        <div [class]="ui.formError">{{ error() }}</div>
      }

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" [class]="ui.btnSecondary" (click)="cancelled.emit()">Cancel</button>
        <button
          type="submit"
          [class]="targetStatus() === 'ACTIVE' ? ui.btnPrimary : ui.btnDanger"
          [disabled]="form.invalid || submitting()"
        >
          {{ submitting() ? 'Saving…' : actionLabel() }}
        </button>
      </div>
    </form>
  `,
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
