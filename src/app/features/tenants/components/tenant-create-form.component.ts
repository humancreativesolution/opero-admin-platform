import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Tenant } from '@res/index';
import {
  errorMessage,
  parseDomains,
  SUBDOMAIN_PATTERN,
  showError,
  TENANT_PASSWORD_MIN,
} from '../../../shared/utils/form';
import { ui } from '../../../shared/utils/ui';
import { TenantsGql } from '../tenants.gql';

@Component({
  selector: 'app-tenant-create-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './tenant-create-form.component.html',
})
export class TenantCreateFormComponent {
  private fb = inject(FormBuilder);
  private tenantsGql = inject(TenantsGql);

  readonly saved = output<Tenant>();
  readonly cancelled = output<void>();
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly ui = ui;
  readonly showError = showError;
  readonly minPassword = TENANT_PASSWORD_MIN;

  readonly form = this.fb.nonNullable.group({
    tenantName: ['', [Validators.required, Validators.maxLength(150)]],
    subdomain: ['', [Validators.required, Validators.pattern(SUBDOMAIN_PATTERN)]],
    domains: [''],
    ownerFullName: ['', [Validators.required, Validators.minLength(3)]],
    ownerEmail: ['', [Validators.required, Validators.email]],
    ownerPassword: ['', [Validators.required, Validators.minLength(TENANT_PASSWORD_MIN)]],
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
      const result = await this.tenantsGql.createWithOwner({
        tenantName: value.tenantName.trim(),
        subdomain: value.subdomain.trim().toLowerCase(),
        domains: parseDomains(value.domains),
        ownerFullName: value.ownerFullName.trim(),
        ownerEmail: value.ownerEmail.trim(),
        ownerPassword: value.ownerPassword,
      });
      this.saved.emit(result.tenant);
    } catch (error) {
      this.error.set(errorMessage(error));
    } finally {
      this.submitting.set(false);
    }
  }
}
