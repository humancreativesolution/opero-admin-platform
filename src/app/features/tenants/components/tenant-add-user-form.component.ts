import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TENANT_USER_ROLES, type Tenant, type TenantUser, type TenantUserRole } from '@res/index';
import { errorMessage, showError, TENANT_PASSWORD_MIN } from '../../../shared/utils/form';
import { ui } from '../../../shared/utils/ui';
import { TenantsGql } from '../tenants.gql';

/** Tambah user ke tenant yang sudah ada, mis. owner pengganti. */
@Component({
  selector: 'app-tenant-add-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label [class]="ui.label" for="addFullName">Full name</label>
          <input id="addFullName" formControlName="fullName" [class]="ui.input" />
          @if (showError(form, 'fullName')) {
            <p [class]="ui.fieldError">At least 3 characters.</p>
          }
        </div>
        <div class="space-y-1.5">
          <label [class]="ui.label" for="addRole">Role</label>
          <select id="addRole" formControlName="role" [class]="ui.select">
            @for (role of roles; track role) {
              <option [value]="role">{{ role }}</option>
            }
          </select>
        </div>
      </div>
      <div class="space-y-1.5">
        <label [class]="ui.label" for="addEmail">Email</label>
        <input id="addEmail" type="email" formControlName="email" [class]="ui.input" />
        @if (showError(form, 'email')) {
          <p [class]="ui.fieldError">Enter a valid email.</p>
        }
      </div>
      <div class="space-y-1.5">
        <label [class]="ui.label" for="addPassword">Initial password</label>
        <input id="addPassword" type="password" autocomplete="new-password" formControlName="password" [class]="ui.input" />
        @if (showError(form, 'password')) {
          <p [class]="ui.fieldError">At least {{ minPassword }} characters.</p>
        }
      </div>

      @if (error()) {
        <div [class]="ui.formError">{{ error() }}</div>
      }

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" [class]="ui.btnSecondary" (click)="cancelled.emit()">Cancel</button>
        <button type="submit" [class]="ui.btnPrimary" [disabled]="form.invalid || submitting()">
          {{ submitting() ? 'Adding…' : 'Add user' }}
        </button>
      </div>
    </form>
  `,
})
export class TenantAddUserFormComponent {
  private fb = inject(FormBuilder);
  private tenantsGql = inject(TenantsGql);

  readonly tenant = input.required<Tenant>();
  readonly saved = output<TenantUser>();
  readonly cancelled = output<void>();
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly ui = ui;
  readonly showError = showError;
  readonly roles = TENANT_USER_ROLES;
  readonly minPassword = TENANT_PASSWORD_MIN;

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(TENANT_PASSWORD_MIN)]],
    role: ['OWNER' as TenantUserRole, Validators.required],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.submitting.set(true);
    this.error.set('');
    try {
      const user = await this.tenantsGql.addUser({
        tenantId: this.tenant().id,
        fullName: value.fullName.trim(),
        email: value.email.trim(),
        password: value.password,
        role: value.role,
      });
      this.saved.emit(user);
    } catch (error) {
      this.error.set(errorMessage(error));
    } finally {
      this.submitting.set(false);
    }
  }
}
