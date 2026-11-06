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
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <div class="space-y-1.5">
        <label [class]="ui.label" for="editName">Business name</label>
        <input id="editName" formControlName="name" [class]="ui.input" />
        @if (showError(form, 'name')) {
          <p [class]="ui.fieldError">Business name is required.</p>
        }
      </div>
      <div class="space-y-1.5">
        <label [class]="ui.label" for="editSubdomain">Subdomain</label>
        <input id="editSubdomain" formControlName="subdomain" [class]="ui.input" />
        @if (showError(form, 'subdomain')) {
          <p [class]="ui.fieldError">Lowercase letters, numbers, and hyphens only.</p>
        }
        <p class="text-xs text-amber-700">Changing the subdomain changes the tenant's login URL.</p>
      </div>
      <div class="space-y-1.5">
        <label [class]="ui.label" for="editDomains">Extra domains</label>
        <input id="editDomains" formControlName="domains" [class]="ui.input" placeholder="pos.example.com, example.com" />
      </div>

      @if (error()) {
        <div [class]="ui.formError">{{ error() }}</div>
      }

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" [class]="ui.btnSecondary" (click)="cancelled.emit()">Cancel</button>
        <button type="submit" [class]="ui.btnPrimary" [disabled]="form.invalid || form.pristine || submitting()">
          {{ submitting() ? 'Saving…' : 'Save changes' }}
        </button>
      </div>
    </form>
  `,
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
      // Domain utama = subdomain; sisanya domain tambahan.
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
