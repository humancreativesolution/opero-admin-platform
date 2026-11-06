import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PLATFORM_ROLES, type PlatformRole, type PlatformUser } from '@res/index';
import { AuthService } from '../../../core/auth/auth.service';
import { errorMessage, PLATFORM_PASSWORD_MIN, showError } from '../../../shared/utils/form';
import { ui } from '../../../shared/utils/ui';
import { PlatformUsersGql } from '../platform-users.gql';

const ROLE_HINT: Record<PlatformRole, string> = {
  SUPER_ADMIN: 'Full access, including managing platform staff.',
  SUPPORT: 'Read-only access to tenants.',
  BILLING: 'Read tenants and suspend/reactivate them.',
};

@Component({
  selector: 'app-platform-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './platform-user-form.component.html',
})
export class PlatformUserFormComponent {
  private fb = inject(FormBuilder);
  private gql = inject(PlatformUsersGql);
  private auth = inject(AuthService);

  readonly user = input<PlatformUser | null>(null);
  readonly saved = output<PlatformUser>();
  readonly cancelled = output<void>();
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly ui = ui;
  readonly showError = showError;
  readonly roles = PLATFORM_ROLES;
  readonly minPassword = PLATFORM_PASSWORD_MIN;

  readonly isEdit = computed(() => this.user() !== null);
  readonly isSelf = computed(() => this.user()?.id === this.auth.currentUser()?.id);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['SUPPORT' as PlatformRole, Validators.required],
    password: ['', [Validators.required, Validators.minLength(PLATFORM_PASSWORD_MIN)]],
    isActive: [true],
  });

  private readonly roleValue = signal<PlatformRole>('SUPPORT');
  readonly roleHint = computed(() => ROLE_HINT[this.roleValue()]);

  constructor() {
    this.form.controls.role.valueChanges.subscribe((role) => this.roleValue.set(role));

    effect(() => {
      const user = this.user();
      const { email, password, role, isActive } = this.form.controls;

      if (user) {
        this.form.reset({
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          password: '',
          isActive: user.isActive,
        });
        email.disable();
        password.disable();
        if (this.isSelf()) {
          role.disable();
          isActive.disable();
        }
      }
      this.roleValue.set(role.value);
    });
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
      const result = user
        ? await this.gql.update({
            id: user.id,
            fullName: value.fullName.trim(),
            ...(this.isSelf() ? {} : { role: value.role, isActive: value.isActive }),
          })
        : await this.gql.create({
            fullName: value.fullName.trim(),
            email: value.email.trim(),
            role: value.role,
            password: value.password,
          });
      this.saved.emit(result);
    } catch (error) {
      this.error.set(errorMessage(error));
    } finally {
      this.submitting.set(false);
    }
  }
}
