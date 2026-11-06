import type { AbstractControl, FormGroup } from '@angular/forms';
import { ErrorHelper } from '@lib/graphql/error';

/** Sama dengan validasi backend. */
export const SUBDOMAIN_PATTERN = /^[a-z0-9-]+$/;
export const PLATFORM_PASSWORD_MIN = 10;
export const TENANT_PASSWORD_MIN = 6;

/** Tampilkan error hanya setelah field disentuh (blur) atau form disubmit. */
export function showError(form: FormGroup, name: string): boolean {
  const control: AbstractControl | null = form.get(name);
  return !!control && control.invalid && (control.touched || control.dirty);
}

/** "a.com, b.com" -> ["a.com", "b.com"] */
export function parseDomains(raw: string | null | undefined): string[] {
  return (raw ?? '')
    .split(/[\s,]+/)
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
}

export function errorMessage(error: unknown): string {
  if (ErrorHelper.isErrorInfo(error)) {
    if (error.code === 'FORBIDDEN') return 'You do not have permission for this action.';
    return error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}
