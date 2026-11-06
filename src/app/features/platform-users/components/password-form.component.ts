import { Component, computed, inject, input, type OnInit, output, signal } from '@angular/core';
import {
  type AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import type { PlatformUser } from '@res/index';
import { errorMessage, PLATFORM_PASSWORD_MIN, showError } from '../../../shared/utils/form';
import { ui } from '../../../shared/utils/ui';
import { PlatformUsersGql } from '../platform-users.gql';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const newPassword = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newPassword && confirm && newPassword !== confirm ? { mismatch: true } : null;
}

/**
 * Dua mode:
 * - dengan `user`: SUPER_ADMIN me-reset password staf lain.
 * - tanpa `user`: staf mengganti password akunnya sendiri (butuh password saat ini).
 */
@Component({
  selector: 'app-password-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      @if (isOwn()) {
        <div class="space-y-1.5">
          <label [class]="ui.label" for="pwCurrent">Current password</label>
          <input
            id="pwCurrent"
            type="password"
            autocomplete="current-password"
            formControlName="currentPassword"
            [class]="ui.input"
          />
          @if (showError(form, 'currentPassword')) {
            <p [class]="ui.fieldError">Current password is required.</p>
          }
        </div>
      }
      <div class="space-y-1.5">
        <label [class]="ui.label" for="pwNew">New password</label>
        <input
          id="pwNew"
          type="password"
          autocomplete="new-password"
          formControlName="newPassword"
          [class]="ui.input"
        />
        @if (showError(form, 'newPassword')) {
          <p [class]="ui.fieldError">At least {{ minPassword }} characters.</p>
        }
      </div>
      <div class="space-y-1.5">
        <label [class]="ui.label" for="pwConfirm">Confirm new password</label>
        <input
          id="pwConfirm"
          type="password"
          autocomplete="new-password"
          formControlName="confirmPassword"
          [class]="ui.input"
        />
        @if (form.hasError('mismatch') && form.controls.confirmPassword.touched) {
          <p [class]="ui.fieldError">Passwords do not match.</p>
        }
      </div>

      <p class="text-xs text-slate-500">
        {{
          isOwn()
            ? 'You will need to log in again with the new password.'
            : 'All existing sessions of this user are logged out.'
        }}
      </p>

      @if (error()) {
        <div [class]="ui.formError">{{ error() }}</div>
      }

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" [class]="ui.btnSecondary" (click)="cancelled.emit()">Cancel</button>
        <button type="submit" [class]="ui.btnPrimary" [disabled]="form.invalid || submitting()">
          {{ submitting() ? 'Saving…' : isOwn() ? 'Change password' : 'Reset password' }}
        </button>
      </div>
    </form>
  `,
})
export class PasswordFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private gql = inject(PlatformUsersGql);

  readonly user = input<PlatformUser | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly ui = ui;
  readonly showError = showError;
  readonly minPassword = PLATFORM_PASSWORD_MIN;
  readonly isOwn = computed(() => this.user() === null);

  readonly form = this.fb.nonNullable.group(
    {
      currentPassword: [''],
      newPassword: ['', [Validators.required, Validators.minLength(PLATFORM_PASSWORD_MIN)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  ngOnInit(): void {
    if (this.isOwn()) {
      this.form.controls.currentPassword.setValidators(Validators.required);
      this.form.controls.currentPassword.updateValueAndValidity();
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const user = this.user();
    this.submitting.set(true);
    this.error.set('');
    try {
      if (user) {
        await this.gql.resetPassword({ id: user.id, newPassword: value.newPassword });
      } else {
        await this.gql.changeMyPassword({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        });
      }
      this.saved.emit();
    } catch (error) {
      this.error.set(errorMessage(error));
    } finally {
      this.submitting.set(false);
    }
  }
}
