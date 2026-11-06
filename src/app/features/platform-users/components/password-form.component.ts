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

@Component({
  selector: 'app-password-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './password-form.component.html',
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
