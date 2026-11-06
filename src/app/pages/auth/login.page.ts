import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorHelper, UNAUTHENTICATED } from '@lib/graphql/error';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, HlmButtonDirective],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = false;
  error = '';

  async submitLogin() {
    const { email, password } = this.loginForm.value;
    if (this.loginForm.invalid || !email || !password) return;
    this.loading = true;
    this.error = '';
    try {
      await this.auth.login({ email, password });
      this.router.navigate(['/tenants']);
    } catch (err) {
      const code = ErrorHelper.isErrorInfo(err) ? err.code : 'UNKNOWN';
      this.error =
        code === UNAUTHENTICATED ? 'Invalid email or password' : `Login failed (${code})`;
    } finally {
      this.loading = false;
    }
  }
}
