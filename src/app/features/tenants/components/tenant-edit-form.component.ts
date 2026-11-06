import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Tenant } from '@res/index';
import {
  errorMessage,
  parseDomains,
  SUBDOMAIN_PATTERN,
  showError,
} from '../../../shared/utils/form';
import { ui } from '../../../shared/utils/ui';
import { TenantsGql } from '../tenants.gql';

@Component({
  selector: 'app-tenant-edit-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './tenant-edit-form.component.html',
})
export class TenantEditFormComponent {
  private fb = inject(FormBuilder);
  private tenantsGql = inject(TenantsGql);

  readonly tenant = input.required<Tenant>();
  readonly saved = output<Tenant>();
  readonly cancelled = output<void>();
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly ui = ui;
  readonly showError = showError;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    subdomain: ['', [Validators.required, Validators.pattern(SUBDOMAIN_PATTERN)]],
    domains: [''],
  });

  constructor() {
    effect(() => {
      const tenant = this.tenant();
      const extraDomains = tenant.domains.filter((domain) => domain !== tenant.subdomain);
      this.form.reset({
        name: tenant.name,
        subdomain: tenant.subdomain ?? '',
        domains: extraDomains.join(', '),
      });
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.submitting.set(true);
    this.error.set('');
    try {
      const tenant = await this.tenantsGql.update({
        id: this.tenant().id,
        name: value.name.trim(),
        subdomain: value.subdomain.trim().toLowerCase(),
        domains: parseDomains(value.domains),
      });
      this.saved.emit(tenant);
    } catch (error) {
      this.error.set(errorMessage(error));
    } finally {
      this.submitting.set(false);
    }
  }
}
