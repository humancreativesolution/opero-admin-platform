import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TENANT_USER_ROLES, type Tenant, type TenantUser, type TenantUserRole } from '@res/index';
import { errorMessage, showError, TENANT_PASSWORD_MIN } from '../../../shared/utils/form';
import { ui } from '../../../shared/utils/ui';
import { TenantsGql } from '../tenants.gql';

@Component({
  selector: 'app-tenant-add-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './tenant-add-user-form.component.html',
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
