import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';

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
    console.log('[LoginPage] submitLogin triggered, form valid:', this.loginForm.valid, 'value:', this.loginForm.value);
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.loginForm.value;
    try {
      console.log('[LoginPage] calling auth.login...');
      await this.auth.login({ email: email!, password: password! });
      console.log('[LoginPage] login success, navigating to /tenants');
      this.router.navigate(['/tenants']);
    } catch (err: any) {
      console.error('[LoginPage] login caught error:', err);
      this.error = err.code === 'UNAUTHORIZED' ? 'Invalid email or password' : `Login failed (${err.code})`;
    } finally {
      this.loading = false;
    }
  }
}
